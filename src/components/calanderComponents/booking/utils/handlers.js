import moment from 'moment';
import { HttpStatusCode } from 'axios';
import { calendarOpeningHours, generateTimeSlots, scrollToHour, validateBooking } from './functions';
import { GetTimingsApi } from '../../../../utils/Api/Booking';
import { apiMangerBooking } from './api';
import * as Sentry from '@sentry/react';

// Global error handler for DOM manipulation errors
function setupDOMErrorHandler() {
    const originalConsoleError = console.error;

    console.error = function (...args) {
        const errorMessage = args[0];

        // Check if this is a DOM manipulation error
        if (
            typeof errorMessage === 'string' &&
            (errorMessage.includes('removeChild') ||
                errorMessage.includes('NotFoundError') ||
                errorMessage.includes('Failed to execute'))
        ) {
            // Log to Sentry with additional context
            Sentry.logger.error('DOM Manipulation Error Detected', {
                errorMessage: errorMessage,
                errorArgs: args,
                stack: new Error().stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
            });

            console.warn('DOM manipulation error caught and logged to Sentry:', errorMessage);
        }

        // Call original console.error
        originalConsoleError.apply(console, args);
    };
}

// Initialize DOM error handler
setupDOMErrorHandler();

// Request cancellation utility
class RequestCanceller {
    constructor() {
        this.activeRequests = new Map();
    }

    createCancelToken(requestId) {
        const controller = new AbortController();
        this.activeRequests.set(requestId, controller);
        return controller.signal;
    }

    cancelRequest(requestId) {
        const controller = this.activeRequests.get(requestId);
        if (controller) {
            controller.abort();
            this.activeRequests.delete(requestId);
        }
    }

    cancelAllRequests() {
        this.activeRequests.forEach((controller) => controller.abort());
        this.activeRequests.clear();
    }
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Stable key generator for time slots
function generateStableKey(timeSlot, index) {
    return `time-slot-${timeSlot.split(' - ')[0]}-${index}`;
}

// Safe DOM manipulation wrapper (for future use)
// function safeScrollToElement(element, options = {}) {
//     try {
//         if (element && typeof element.scrollIntoView === 'function') {
//             element.scrollIntoView({ block: 'center', behavior: 'smooth', ...options });
//         }
//     } catch (error) {
//         console.warn('Scroll operation failed:', error);
//     }
// }

export class HandlerBooking {
    constructor() {
        this.requestCanceller = new RequestCanceller();
        this.activeOperations = new Set();
        // Create debounced function with proper binding
        this.debouncedServiceChange = debounce(this._handleServiceChangeInternal.bind(this), 300);
    }

    // Main entry point for service change with debouncing and cancellation
    async handleServiceChange(
        index,
        newValue,
        setValue,
        setCardValues,
        initialData,
        cardValues,
        setLoading,
        formik,
        timeSlots,
        setting,
        setScrollToTime = () => {},
    ) {
        const operationId = `service-change-${index}-${Date.now()}`;

        // Cancel any existing operations for this card
        this.requestCanceller.cancelRequest(`service-change-${index}`);

        // Add to active operations
        this.activeOperations.add(operationId);

        try {
            // Debounced function is synchronous, so we don't await it
            this.debouncedServiceChange(
                operationId,
                index,
                newValue,
                setValue,
                setCardValues,
                initialData,
                cardValues,
                setLoading,
                formik,
                timeSlots,
                setting,
                setScrollToTime,
            );
        } finally {
            // Don't delete operation immediately since debounced function will handle it
            // The operation will be cleaned up by the debounced function or cleanupStaleOperations
        }
    }

    // Internal service change handler with improved error handling
    async _handleServiceChangeInternal(
        operationId,
        index,
        newValue,
        setValue,
        setCardValues,
        initialData,
        cardValues,
        setLoading,
        formik,
        timeSlots,
        setting,
        setScrollToTime = () => {},
    ) {
        const storeId = setting?.profile?.id;
        const shouldLog = storeId === 523 || storeId === 526;

        if (shouldLog) {
            Sentry.logger.info(`[${storeId}] handleServiceChange START - Operation: ${operationId}, Index: ${index}`, {
                operationId,
                index,
                newValue: newValue
                    ? { id: newValue.id, name: newValue.name, duration_min: newValue.duration_min }
                    : null,
                initialData: initialData
                    ? {
                          employeeId: initialData.employeeId,
                          start_time: initialData.start_time,
                          end_time: initialData.end_time,
                      }
                    : null,
                activeOperations: this.activeOperations.size,
            });
        }

        // Check if operation is still active
        if (!this.activeOperations.has(operationId)) {
            if (shouldLog) {
                Sentry.logger.info(
                    `[${storeId}] handleServiceChange CANCELLED - Operation no longer active: ${operationId}`,
                );
            }
            return;
        }

        if (shouldLog) {
            Sentry.logger.info(`[${storeId}] handleServiceChange STEP 1 - Setting loading state to true`);
        }
        setLoading((prev) => ({ ...prev, waiting: true }));

        if (shouldLog) {
            Sentry.logger.info(`[${storeId}] handleServiceChange STEP 2 - Finding employee from newValue.employees`);
        }

        const lastEmployee = cardValues[index - 1]?.selectedEmployee;
        let foundEmployee =
            newValue?.employees?.find((emp) => emp?.id == lastEmployee?.id) ||
            newValue?.employees?.find((emp) => emp?.id == initialData?.employeeId);
        let empTimes = [];
        let emp_available_time;

        if (shouldLog) {
            Sentry.logger.info(`[${storeId}] handleServiceChange STEP 3 - Calculating initial available time`);
        }
        if (initialData?.start_time) {
            emp_available_time =
                moment(initialData?.start_time).format('HH:mm') +
                ' - ' +
                moment(initialData?.start_time).add(30, 'minutes').format('HH:mm');
        }
        let initialDuration = moment(initialData?.end_time).diff(moment(initialData?.start_time), 'minutes');

        if (shouldLog) {
            Sentry.logger.info(
                `[${storeId}] handleServiceChange STEP 4 - Updating service immediately for UI responsiveness`,
            );
        }
        // Update service immediately for UI responsiveness
        setValue(`cards.${index}.selectedService`, newValue);

        if (shouldLog) {
            Sentry.logger.info(`[${storeId}] handleServiceChange STEP 5 - Calculating available time based on index`);
        }
        if (index === 0 && initialData?.start_time) {
            emp_available_time =
                moment(initialData?.start_time).format('HH:mm') +
                ' - ' +
                moment(initialData?.start_time).add(30, 'minutes').format('HH:mm');
        } else {
            const endTime = moment(cardValues[index - 1]?.available_time?.split('-')[0], 'HH:mm').add(
                cardValues[index - 1]?.duration_min,
                'minutes',
            );
            if (moment(endTime).isValid()) {
                emp_available_time =
                    moment(endTime).format('HH:mm') + ' - ' + moment(endTime).add(30, 'minutes').format('HH:mm');
            }
        }

        if (shouldLog) {
            Sentry.logger.info(
                `[${storeId}] handleServiceChange STEP 6 - Determining day schedule (individual vs general opening hours)`,
            );
        }
        // let day;

        const { open_time, close_time } = calendarOpeningHours({
            data: setting,
            selectedDate: formik?.values?.date,
            view: 'week',
        });

        // if (setting?.is_individual_opening_hour) {
        //     const emp = setting?.employees_opening_hour?.find((e) => e?.id === foundEmployee?.id);
        //     const foundDay = emp?.detail.find((d) => d.start_day === formik?.values?.date.locale('en').format('dddd'));

        //     const additionalDay = foundDay?.additional_days?.[formik?.values?.date.format('YYYY-MM-DD')];
        //     day = {
        //         ...foundDay,
        //         open_time: additionalDay?.start_time || foundDay?.start_time,
        //         close_time: additionalDay?.end_time || foundDay?.end_time,
        //     };

        //     if (shouldLog) {
        //         Sentry.logger.info(`[${storeId}] handleServiceChange STEP 6.1 - Individual opening hours found`, {
        //             employeeId: foundEmployee?.id,
        //             dayName: formik?.values?.date.locale('en').format('dddd'),
        //             openTime: day?.open_time,
        //             closeTime: day?.close_time,
        //         });
        //     }
        // } else {
        //     day = setting?.schedule?.find(
        //         (schedule) => schedule?.day === formik?.values?.date.locale('en').format('dddd'),
        //     );

        //     if (shouldLog) {
        //         Sentry.logger.info(`[${storeId}] handleServiceChange STEP 6.2 - General schedule found`, {
        //             dayName: formik?.values?.date.locale('en').format('dddd'),
        //             openTime: day?.open_time,
        //             closeTime: day?.close_time,
        //         });
        //     }
        // }

        if (newValue) {
            if (shouldLog) {
                Sentry.logger.info(`[${storeId}] handleServiceChange STEP 7 - Generating duration list for service`, {
                    serviceId: newValue.id,
                    serviceName: newValue.name,
                    durationMin: newValue.duration_min,
                    isSpecial: newValue.is_special,
                    specialPrice: newValue.special_price,
                    regularPrice: newValue.price,
                });
            }
            const initialDurationList = [];
            for (let minute = 5; minute <= 1440; minute += 5) {
                let label;
                if (minute < 60) {
                    label = `${minute} min`;
                } else if (minute % 60) {
                    label = `${Math.floor(minute / 60)} hr ${minute % 60} min`;
                } else if (minute % 60 === 0) {
                    const hours = Math.floor(minute / 60);
                    label = `${hours} hr`;
                }

                initialDurationList.push({
                    value: minute,
                    label,
                    minutes: minute,
                });
            }

            if (newValue.duration_min > 60) {
                const extraMinutes = newValue.duration_min;
                let extraLabel = '';

                const hours = Math.floor(extraMinutes / 60);
                const remainingMinutes = extraMinutes % 60;

                if (hours > 0) {
                    extraLabel += `${hours} hr`;
                    if (remainingMinutes > 0) {
                        extraLabel += ` ${remainingMinutes} min`;
                    }
                } else {
                    extraLabel += `${remainingMinutes} min`;
                }

                initialDurationList.push({
                    value: extraMinutes,
                    label: extraLabel,
                    minutes: extraMinutes,
                });

                if (shouldLog) {
                    Sentry.logger.info(`[${storeId}] handleServiceChange STEP 7.1 - Added extra duration option`, {
                        extraMinutes,
                        extraLabel,
                        totalDurationOptions: initialDurationList.length,
                    });
                }
            }

            if (foundEmployee) {
                if (shouldLog) {
                    Sentry.logger.info(`[${storeId}] handleServiceChange STEP 8 - Found employee, preparing API call`, {
                        employeeId: foundEmployee.id,
                        employeeName: foundEmployee.name,
                        initialDuration,
                        serviceDuration: newValue.duration_min,
                    });
                }
                try {
                    if (shouldLog) {
                        Sentry.logger.info(
                            `[${storeId}] handleServiceChange STEP 8.1 - Building exclude time slots from existing cards`,
                        );
                    }
                    let employees = [];
                    let available_time = [];
                    let exclude_employee_time_slots = {};

                    cardValues &&
                        cardValues.forEach((item, i) => {
                            employees.push(item?.selectedEmployee?.id);
                            let [startTime] = item?.available_time.split('-');

                            let startMoment = moment(startTime.trim(), 'HH:mm'); // Parse the start time in "HH:mm" format
                            let endMoment = startMoment.clone().add(item?.duration_min, 'minutes');
                            let formattedEndTime = endMoment.format('HH:mm');

                            let updatedAvailableTime = `${startTime.trim()} - ${formattedEndTime}`;

                            available_time.push(updatedAvailableTime);

                            if (item?.selectedEmployee?.id && updatedAvailableTime) {
                                if (!exclude_employee_time_slots[item?.selectedEmployee?.id]) {
                                    exclude_employee_time_slots[item?.selectedEmployee?.id] = [];
                                }
                                exclude_employee_time_slots[item?.selectedEmployee?.id].push(updatedAvailableTime);
                            }
                        });

                    let body = {
                        exclude_employee_time_slots: index !== 0 ? exclude_employee_time_slots : {},
                    };

                    if (shouldLog) {
                        Sentry.logger.info(`[${storeId}] handleServiceChange STEP 8.2 - API request body prepared`, {
                            excludeEmployeeTimeSlots: Object.keys(exclude_employee_time_slots).length,
                            bodyKeys: Object.keys(body),
                        });
                    }

                    setLoading((prev) => ({ ...prev, timeSlotApi: { ...prev.timeSlotApi, [index]: true } }));

                    const params = {
                        service_id: newValue?.id,
                        date: moment(formik.values.date).format('YYYY-MM-DD'),
                        employee_id: foundEmployee?.id,
                        custom_duration: initialDuration || newValue?.duration_min,
                    };

                    if (cardValues[index]?.booking_id) {
                        params['booking_id'] = cardValues[index]?.booking_id;
                    }

                    if (shouldLog) {
                        Sentry.logger.info(`[${storeId}] handleServiceChange STEP 8.3 - API request params prepared`, {
                            serviceId: params.service_id,
                            date: params.date,
                            employeeId: params.employee_id,
                            customDuration: params.custom_duration,
                            bookingId: params.booking_id || 'none',
                        });
                    }

                    if (shouldLog) {
                        Sentry.logger.info(
                            `[${storeId}] handleServiceChange STEP 8.4 - Making API call to GetTimingsApi`,
                        );
                    }
                    const response = await GetTimingsApi({ params, body });
                    Sentry.logger.info('Response from handle service change', response);

                    if (shouldLog) {
                        Sentry.logger.info(`[${storeId}] handleServiceChange STEP 8.5 - API response received`, {
                            status: response?.status,
                            hasData: !!response?.data?.data,
                            dataLength: response?.data?.data?.length || 0,
                        });
                    }

                    if (response.status === HttpStatusCode.Ok) {
                        let data = response?.data?.data;

                        // Check if operation is still active before processing response
                        if (!this.activeOperations.has(operationId)) {
                            if (shouldLog) {
                                Sentry.logger.info(
                                    `[${storeId}] handleServiceChange STEP 8.6 - Operation cancelled before processing response`,
                                );
                            }
                            return;
                        }

                        if (shouldLog) {
                            Sentry.logger.info(`[${storeId}] handleServiceChange STEP 8.7 - Processing time slots`, {
                                totalTimeSlots: timeSlots.length,
                                availableSlots: data.length,
                                open_time: open_time,
                                close_time: close_time,
                                allowOverlap: setting?.calendar?.allow_overlap,
                            });
                        }

                        let tms = [];
                        try {
                            if (shouldLog) {
                                Sentry.logger.info(
                                    `[${storeId}] handleServiceChange STEP 8.7.1 - Starting time slot processing`,
                                    {
                                        timeSlotsCount: timeSlots.length,
                                        availableDataCount: data.length,
                                        operationId,
                                    },
                                );
                            }

                            function isOutsideOpenAndCloseTime(slotStartTime) {
                                const startMoment = moment(slotStartTime, 'HH:mm');
                                const openMoment = moment(open_time, 'HH:mm');
                                const closeMoment = moment(close_time, 'HH:mm');
                                return startMoment.isBefore(openMoment) || startMoment.isAfter(closeMoment);
                            }

                            tms = timeSlots
                                .map((item, i) => {
                                    try {
                                        const startTime = item.split(' - ')[0];
                                        const isTimeAvailable = data.some(
                                            (timeSlot) => timeSlot.split(' - ')[0] === startTime,
                                        );

                                        if (isOutsideOpenAndCloseTime(startTime)) {
                                            return null;
                                        }

                                        const isBetween = moment(startTime, 'HH:mm').isBetween(
                                            moment(open_time, 'HH:mm:ss'),
                                            moment(close_time, 'HH:mm:ss'),
                                            null,
                                            '[]', // inclusive start and end
                                        );

                                        const timeSlotObject = {
                                            value: item,
                                            key: generateStableKey(item, i), // Add stable key
                                            label: startTime, // Use simple string instead of Typography component
                                            disabled: setting?.calendar?.allow_overlap ? false : !isTimeAvailable,
                                            // Store styling information separately for the consuming component
                                            styling: {
                                                color: !isBetween
                                                    ? '#D7D7D7'
                                                    : !isTimeAvailable
                                                      ? '#C60404'
                                                      : '#1f1f1f',
                                                textDecoration: !isTimeAvailable ? 'line-through' : 'none',
                                                variant: startTime.endsWith(':00') ? 'body1' : 'body2',
                                                fontWeight: startTime.endsWith(':00') ? 700 : 400,
                                            },
                                        };

                                        if (shouldLog && i < 3) {
                                            // Log first 3 items for debugging
                                            Sentry.logger.info(
                                                `[${storeId}] handleServiceChange STEP 8.7.2 - Time slot ${i} processed`,
                                                {
                                                    startTime,
                                                    isTimeAvailable,
                                                    timeSlotObject: {
                                                        value: timeSlotObject.value,
                                                        key: timeSlotObject.key,
                                                        label: timeSlotObject.label,
                                                        disabled: timeSlotObject.disabled,
                                                        stylingColor: timeSlotObject.styling.color,
                                                    },
                                                },
                                            );
                                        }

                                        return timeSlotObject;
                                    } catch (slotError) {
                                        if (shouldLog) {
                                            Sentry.logger.error(
                                                `[${storeId}] handleServiceChange STEP 8.7.3 - Error processing time slot ${i}`,
                                                {
                                                    error: slotError.message,
                                                    errorStack: slotError.stack,
                                                    item,
                                                    index: i,
                                                    operationId,
                                                },
                                            );
                                        }
                                        console.error(`Error processing time slot ${i}:`, slotError);

                                        // Return a safe fallback object
                                        return {
                                            value: item,
                                            key: `fallback-${i}`,
                                            label: item.split(' - ')[0],
                                            disabled: true,
                                            styling: {
                                                color: '#C60404',
                                                textDecoration: 'line-through',
                                                variant: 'body2',
                                                fontWeight: 400,
                                            },
                                        };
                                    }
                                })
                                .filter((slot) => slot !== null);

                            if (shouldLog) {
                                Sentry.logger.info(
                                    `[${storeId}] handleServiceChange STEP 8.7.4 - Time slot processing completed`,
                                    {
                                        processedSlots: tms.length,
                                        operationId,
                                        firstSlotStructure: tms[0]
                                            ? {
                                                  hasValue: !!tms[0].value,
                                                  hasLabel: !!tms[0].label,
                                                  hasKey: !!tms[0].key,
                                                  hasStyling: !!tms[0].styling,
                                                  labelType: typeof tms[0].label,
                                                  valueType: typeof tms[0].value,
                                              }
                                            : 'no slots',
                                    },
                                );
                            }
                        } catch (processingError) {
                            if (shouldLog) {
                                Sentry.logger.error(
                                    `[${storeId}] handleServiceChange STEP 8.7.5 - Critical error in time slot processing`,
                                    {
                                        error: processingError.message,
                                        errorStack: processingError.stack,
                                        operationId,
                                        timeSlotsCount: timeSlots.length,
                                        dataCount: data.length,
                                    },
                                );
                            }
                            console.error('Critical error in time slot processing:', processingError);

                            // Set empty array as fallback
                            tms = [];
                        }

                        empTimes = tms;

                        if (shouldLog) {
                            Sentry.logger.info(`[${storeId}] handleServiceChange STEP 8.8 - Time slots processed`, {
                                processedSlots: tms.length,
                                availableSlots: tms.filter((slot) => !slot.disabled).length,
                                disabledSlots: tms.filter((slot) => slot.disabled).length,
                            });
                        }
                    }
                } catch (error) {
                    // Check if error is due to request cancellation
                    if (error.name === 'AbortError') {
                        if (shouldLog) {
                            Sentry.logger.info(
                                `[${storeId}] handleServiceChange STEP 8.9 - Request cancelled for service change`,
                            );
                        }
                        return;
                    }
                    if (shouldLog) {
                        Sentry.logger.info(`[${storeId}] handleServiceChange STEP 8.9 - Error fetching time slots`, {
                            error: error.message,
                            errorName: error.name,
                            errorStack: error.stack,
                        });
                    }
                    console.error('Error fetching time slots:', error);

                    // Set empty time slots on error to prevent UI issues
                    empTimes = [];
                } finally {
                    // Only update loading state if operation is still active
                    if (this.activeOperations.has(operationId)) {
                        if (shouldLog) {
                            Sentry.logger.info(
                                `[${storeId}] handleServiceChange STEP 8.10 - Updating loading state to false`,
                            );
                        }
                        setLoading((prev) => ({ ...prev, timeSlotApi: { ...prev.timeSlotApi, [index]: false } }));
                    }
                }
            }

            if (shouldLog) {
                Sentry.logger.info(
                    `[${storeId}] handleServiceChange STEP 9 - Calculating final price and preparing state updates`,
                    {
                        isSpecial: newValue?.is_special,
                        specialPrice: newValue?.special_price,
                        regularPrice: newValue?.price,
                        finalPrice: newValue?.is_special ? newValue?.special_price : newValue?.price,
                    },
                );
            }
            const newPrice = newValue?.is_special ? newValue?.special_price : newValue?.price;

            if (shouldLog) {
                Sentry.logger.info(`[${storeId}] handleServiceChange STEP 10 - Preparing batch state updates`, {
                    updatesCount: 9,
                    index,
                    hasEmployee: !!foundEmployee,
                    hasTimeSlots: empTimes.length > 0,
                    availableTime: emp_available_time,
                });
            }
            setValue(`cards.${index}.duration_min`, initialDuration || newValue?.duration_min);
            setValue(`cards.${index}.durationList`, initialDurationList);
            setValue(`cards.${index}.employeeList`, newValue?.employees);
            setValue(`cards.${index}.selectedEmployee`, foundEmployee || '');
            setValue(`cards.${index}.price`, newPrice);
            setValue(`cards.${index}.originalPrice`, newValue?.price);
            setValue(`cards.${index}.isSpecial`, newValue?.is_special);
            setValue(`cards.${index}.availableTimeSlots`, empTimes || []);
            setValue(`cards.${index}.available_time`, emp_available_time || '');
            setCardValues((prev) =>
                prev.map((card, i) =>
                    i === index
                        ? {
                              ...card,
                              selectedService: newValue,
                              duration_min: initialDuration || newValue?.duration_min,
                              durationList: initialDurationList,
                              employeeList: newValue?.employees,
                              selectedEmployee: foundEmployee || '',
                              availableTimeSlots: empTimes || [],
                              available_time: emp_available_time || '',
                              price: newPrice,
                              originalPrice: newValue?.price,
                              isSpecial: newValue?.is_special,
                          }
                        : card,
                ),
            );
            const scrollTime = await scrollToHour({
                settings: setting,
                selectedEmployee: foundEmployee,
                selectedDate: formik?.values?.date,
                duration: newValue?.duration_min,
            });
            setScrollToTime((prev) => ({ ...prev, [index]: scrollTime }));

            // Batch state updates to prevent multiple re-renders
            const updates = {
                [`cards.${index}.duration_min`]: initialDuration || newValue?.duration_min,
                [`cards.${index}.durationList`]: initialDurationList,
                [`cards.${index}.employeeList`]: newValue?.employees,
                [`cards.${index}.selectedEmployee`]: foundEmployee || '',
                [`cards.${index}.price`]: newPrice,
                [`cards.${index}.originalPrice`]: newValue?.price,
                [`cards.${index}.isSpecial`]: newValue?.is_special,
                [`cards.${index}.availableTimeSlots`]: empTimes || [],
                [`cards.${index}.available_time`]: emp_available_time || '',
            };

            if (shouldLog) {
                Sentry.logger.info(`[${storeId}] handleServiceChange STEP 10.1 - Applying form state updates`, {
                    updatesCount: Object.keys(updates).length,
                    timeSlotsCount: empTimes.length,
                    operationId,
                });
            }

            // Apply all updates at once with error handling
            try {
                Object.entries(updates).forEach(([key, value]) => {
                    try {
                        setValue(key, value);
                        if (shouldLog && key.includes('availableTimeSlots')) {
                            Sentry.logger.info(
                                `[${storeId}] handleServiceChange STEP 10.1.1 - Set availableTimeSlots`,
                                {
                                    key,
                                    valueLength: Array.isArray(value) ? value.length : 'not array',
                                    operationId,
                                },
                            );
                        }
                    } catch (setValueError) {
                        if (shouldLog) {
                            Sentry.logger.error(
                                `[${storeId}] handleServiceChange STEP 10.1.2 - Error setting form value`,
                                {
                                    error: setValueError.message,
                                    errorStack: setValueError.stack,
                                    key,
                                    valueType: typeof value,
                                    operationId,
                                },
                            );
                        }
                        console.error(`Error setting form value for ${key}:`, setValueError);
                    }
                });
            } catch (batchUpdateError) {
                if (shouldLog) {
                    Sentry.logger.error(
                        `[${storeId}] handleServiceChange STEP 10.1.3 - Critical error in batch state updates`,
                        {
                            error: batchUpdateError.message,
                            errorStack: batchUpdateError.stack,
                            operationId,
                        },
                    );
                }
                console.error('Critical error in batch state updates:', batchUpdateError);
            }

            // Update card values with error boundary
            try {
                if (shouldLog) {
                    Sentry.logger.info(`[${storeId}] handleServiceChange STEP 10.2 - Updating card values state`, {
                        index,
                        empTimesLength: empTimes.length,
                        operationId,
                    });
                }

                setCardValues((prev) => {
                    try {
                        const updatedCards = prev.map((card, i) => {
                            if (i === index) {
                                const updatedCard = {
                                    ...card,
                                    selectedService: newValue,
                                    duration_min: initialDuration || newValue?.duration_min,
                                    durationList: initialDurationList,
                                    employeeList: newValue?.employees,
                                    selectedEmployee: foundEmployee || '',
                                    availableTimeSlots: empTimes || [],
                                    available_time: emp_available_time || '',
                                    price: newPrice,
                                    originalPrice: newValue?.price,
                                    isSpecial: newValue?.is_special,
                                };

                                if (shouldLog) {
                                    Sentry.logger.info(
                                        `[${storeId}] handleServiceChange STEP 10.2.1 - Card ${i} updated`,
                                        {
                                            cardIndex: i,
                                            availableTimeSlotsCount: updatedCard.availableTimeSlots.length,
                                            operationId,
                                        },
                                    );
                                }

                                return updatedCard;
                            }
                            return card;
                        });

                        if (shouldLog) {
                            Sentry.logger.info(
                                `[${storeId}] handleServiceChange STEP 10.2.2 - Card values update completed`,
                                {
                                    totalCards: updatedCards.length,
                                    operationId,
                                },
                            );
                        }

                        return updatedCards;
                    } catch (mapError) {
                        if (shouldLog) {
                            Sentry.logger.error(
                                `[${storeId}] handleServiceChange STEP 10.2.3 - Error in card mapping`,
                                {
                                    error: mapError.message,
                                    errorStack: mapError.stack,
                                    operationId,
                                },
                            );
                        }
                        console.error('Error in card mapping:', mapError);
                        return prev; // Return previous state on error
                    }
                });
            } catch (error) {
                if (shouldLog) {
                    Sentry.logger.error(`[${storeId}] handleServiceChange STEP 10.3 - Error updating card values`, {
                        error: error.message,
                        errorStack: error.stack,
                        errorName: error.name,
                        operationId,
                    });
                }
                console.error('Error updating card values:', error);
            }

            // Safe scroll operation with error handling
            try {
                if (shouldLog) {
                    Sentry.logger.info(`[${storeId}] handleServiceChange STEP 11 - Calculating scroll time`);
                }
                const scrollTime = await scrollToHour({
                    settings: setting,
                    selectedEmployee: foundEmployee,
                    selectedDate: formik?.values?.date,
                    duration: newValue?.duration_min,
                });
                setScrollToTime((prev) => ({ ...prev, [index]: scrollTime }));

                if (shouldLog) {
                    Sentry.logger.info(`[${storeId}] handleServiceChange STEP 11.1 - Scroll time calculated and set`, {
                        scrollTime,
                        index,
                    });
                }
            } catch (error) {
                if (shouldLog) {
                    Sentry.logger.info(`[${storeId}] handleServiceChange STEP 11.2 - Scroll operation failed`, {
                        error: error.message,
                        errorName: error.name,
                    });
                }
                console.warn('Scroll operation failed:', error);
            }

            // Only update loading state if operation is still active
            if (this.activeOperations.has(operationId)) {
                if (shouldLog) {
                    Sentry.logger.info(
                        `[${storeId}] handleServiceChange STEP 12 - Setting final loading state to false`,
                    );
                }
                setLoading((prev) => ({ ...prev, waiting: false }));
            }
        }

        // Clean up operation when complete
        if (shouldLog) {
            Sentry.logger.info(`[${storeId}] handleServiceChange COMPLETE - Cleaning up operation: ${operationId}`, {
                operationId,
                activeOperationsRemaining: this.activeOperations.size - 1,
            });
        }
        this.activeOperations.delete(operationId);
    }

    // Function to handle duration change
    handleDurationChange(index, value, setValue, setCardValues, cardValues) {
        //  AA ATLE NAAIKHU SE BECAUSE ROBIN BHAI NE DURATION CHANGE PAR EMPLOYEE AUR TIME RESET NAI KARVA MAAGTA
        //   IF DURATION AND EMPLOYEE RESET KARVA HOY TO AA COMMENTED PORTION KADHI NAAKHJO
        setValue(`cards.${index}.duration_min`, value, { shouldDirty: true, shouldValidate: true });
        // setValue(`cards.${index}.selectedEmployee`, '', { shouldDirty: true, shouldValidate: true });
        // setValue(`cards.${index}.available_time`, '', { shouldDirty: true, shouldValidate: true });

        // Create a copy of cards to update
        let newCards = [...cardValues];

        // Update the duration for the current booking
        newCards[index] = {
            ...newCards[index],
            duration_min: value,
        };

        // Get the start time of the current booking
        const currentBooking = cardValues[index];
        if (currentBooking?.available_time) {
            // Parse the start time (handle both "HH:mm - HH:mm" and "HH:mm" formats)
            const startTimeStr = currentBooking.available_time.includes('-')
                ? currentBooking.available_time.split('-')[0].trim()
                : currentBooking.available_time.trim();

            const startTime = moment(startTimeStr, 'HH:mm');

            if (startTime.isValid()) {
                // Calculate the new end time for the current booking
                const newEndTime = moment(startTime).add(value, 'minutes');

                // Update the current booking's available_time
                if (currentBooking.available_time.includes('-')) {
                    newCards[index].available_time =
                        `${startTimeStr} - ${startTime.add(30, 'minutes').format('HH:mm')}`;
                } else {
                    newCards[index].available_time = startTimeStr;
                }

                // Update setValue for the current booking's available_time
                setValue(`cards.${index}.available_time`, newCards[index].available_time, {
                    shouldDirty: true,
                    shouldValidate: true,
                });

                // Recalculate start times for all subsequent bookings
                let currentEndTime = moment(newEndTime);

                for (let i = index + 1; i < newCards.length; i++) {
                    const nextBooking = newCards[i];

                    // Only update if the booking has an available_time
                    if (nextBooking?.available_time) {
                        const newStartTime = moment(currentEndTime);
                        const newStartTimeStr = newStartTime.format('HH:mm');
                        const nextEndTime = moment(newStartTime).add(nextBooking.duration_min || 0, 'minutes');

                        // Update the booking's available_time
                        if (nextBooking.available_time.includes('-')) {
                            newCards[i].available_time =
                                `${newStartTimeStr} - ${newStartTime.add(30, 'minutes').format('HH:mm')}`;
                        } else {
                            newCards[i].available_time = newStartTimeStr;
                        }

                        // Update setValue for this booking's available_time
                        setValue(`cards.${i}.available_time`, newCards[i].available_time, {
                            shouldDirty: true,
                            shouldValidate: true,
                        });

                        // Move to next booking's start time (right after current booking ends)
                        currentEndTime = moment(nextEndTime);
                    } else {
                        // If no available_time, we can't calculate the next booking's time
                        // Break the chain
                        break;
                    }
                }
            }
        }

        setCardValues(newCards);
    }

    handlePriceChange(index, value, setValue, setCardValues, cardValues) {
        // Remove any non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point is allowed
        const parts = numericValue.split('.');
        let formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;

        // Limit to 2 decimal places
        if (parts.length === 2 && parts[1].length > 2) {
            formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
        }

        setValue(`cards.${index}.price`, formattedValue, { shouldDirty: true, shouldValidate: true });
        let newCards = cardValues.map((card, i) => (i === index ? { ...card, price: formattedValue } : card));
        setCardValues(newCards);
    }

    // Function to handle time change
    async handleBookingTimeChange(index, value, setValue, setCardValues, cardValues, toast, t, tempId, setting) {
        const originalBooking = cardValues[index];

        const updateSingleBooking = async () => {
            let tempCard;
            if (index === 0) {
                tempCard = [{ ...cardValues[0], available_time: value }];
            } else {
                tempCard = cardValues.map((card, i) => (i === index ? { ...card, available_time: value } : card));
            }

            let valid;
            if (setting?.calendar?.allow_overlap) {
                valid = true;
            } else {
                const cardsToValidate = tempCard.filter((card) => card.id !== tempId);
                valid = await validateBooking(cardsToValidate);
            }

            if (valid) {
                setValue(`cards.${index}.available_time`, value, { shouldDirty: true, shouldValidate: true });
                let newCards = cardValues.map((card, i) => (i === index ? { ...card, available_time: value } : card));
                setCardValues(newCards);
            } else {
                toast.error(t('Calendar.ValidationErr'));
            }
        };

        if (!originalBooking?.available_time) {
            await updateSingleBooking();
            return;
        }

        const originalTimeStr = originalBooking.available_time.split('-')[0].trim();
        const originalTime = moment(originalTimeStr, 'HH:mm');
        const newTimeStr = value.includes('-') ? value.split('-')[0].trim() : value.trim();
        const newTime = moment(newTimeStr, 'HH:mm');

        if (!originalTime.isValid() || !newTime.isValid()) {
            toast.error(t('Calendar.ValidationErr'));
            return;
        }

        if (newTime.isSame(originalTime)) {
            await updateSingleBooking();
            return;
        }

        // Check if time moved forward (later) or backward (earlier)
        const isMovingForward = newTime.isAfter(originalTime);

        // Find the earliest booking time (top start time) from all bookings
        const allBookingTimes = cardValues
            .filter((card) => card?.available_time)
            .map((card) => {
                const timeStr = card.available_time.split('-')[0].trim();
                return moment(timeStr, 'HH:mm');
            })
            .filter((time) => time.isValid());

        const earliestBookingTime = allBookingTimes.sort((a, b) => a.diff(b))[0];

        // If moving backward, check if new time is still after the earliest booking time
        if (!isMovingForward) {
            const isNewTimeSameOrBeforeEarliest = earliestBookingTime && newTime.isSameOrBefore(earliestBookingTime);

            // If new time is before or equal to earliest time, only update single booking
            if (isNewTimeSameOrBeforeEarliest) {
                await updateSingleBooking();
                return;
            }
        }

        // Get all bookings after the current index (sequence-based)
        const bookingsToShift = cardValues
            .map((card, i) => ({ ...card, originalIndex: i }))
            .filter((card) => {
                // Shift all bookings that come after the changed booking in sequence
                return card.originalIndex > index && card?.available_time;
            })
            .sort((a, b) => {
                // Sort by original index to maintain sequence order
                return a.originalIndex - b.originalIndex;
            });

        let updatedCards = [...cardValues];
        updatedCards[index] = { ...cardValues[index], available_time: value };

        // Start from the changed booking's end time
        let currentEndTime = moment(newTime).add(originalBooking.duration_min || 0, 'minutes');

        // Shift all subsequent bookings sequentially
        for (const booking of bookingsToShift) {
            const newStartTime = moment(currentEndTime);
            const newStartTimeStr = newStartTime.format('HH:mm');
            const newEndTime = moment(newStartTime).add(booking.duration_min || 0, 'minutes');
            const newEndTimeStr = newStartTime.add(30, 'minutes').format('HH:mm');

            // Update booking time (preserve format if it had a range)
            if (booking.available_time.includes('-')) {
                updatedCards[booking.originalIndex] = {
                    ...booking,
                    available_time: `${newStartTimeStr} - ${newEndTimeStr}`,
                };
            } else {
                updatedCards[booking.originalIndex] = { ...booking, available_time: newStartTimeStr };
            }

            // Move to next booking's start time (right after current booking ends)
            currentEndTime = moment(newEndTime);
        }

        // Update all changed bookings
        const changedBookings = [];
        updatedCards.forEach((card, i) => {
            if (i === index || card.available_time !== cardValues[i]?.available_time) {
                changedBookings.push({
                    index: i,
                    oldTime: cardValues[i]?.available_time,
                    newTime: card.available_time,
                });
                setValue(`cards.${i}.available_time`, card.available_time, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        });

        setCardValues(updatedCards);
    }

    // Function to handle employee change with improved error handling
    async handleEmployeeChange(
        newValue,
        index,
        setValue,
        setLoading,
        setCardValues,
        cardValues,
        timeSlots,
        formik,
        setting,
        setScrollToTime,
    ) {
        const operationId = `employee-change-${index}-${Date.now()}`;

        // Cancel any existing operations for this card
        this.requestCanceller.cancelRequest(`employee-change-${index}`);

        // Add to active operations
        this.activeOperations.add(operationId);

        try {
            await this._handleEmployeeChangeInternal(
                operationId,
                newValue,
                index,
                setValue,
                setLoading,
                setCardValues,
                cardValues,
                timeSlots,
                formik,
                setting,
                setScrollToTime,
            );
        } finally {
            this.activeOperations.delete(operationId);
        }
    }

    async _handleEmployeeChangeInternal(
        operationId,
        newValue,
        index,
        setValue,
        setLoading,
        setCardValues,
        cardValues,
        timeSlots,
        formik,
        setting,
        setScrollToTime,
    ) {
        setLoading((prev) => ({ ...prev, waiting: true }));
        const scrollTime = scrollToHour({
            settings: setting,
            selectedEmployee: newValue,
            selectedDate: formik?.values?.date,
            duration: cardValues[index]?.duration_min,
        });
        setScrollToTime((prev) => ({ ...prev, [index]: scrollTime }));
        setValue(`cards.${index}.selectedEmployee`, newValue);
        // Create arrays to hold employee ids and their available times
        let employees = [];
        let available_time = [];
        let exclude_employee_time_slots = {};
        const { open_time, close_time } = calendarOpeningHours({
            data: setting,
            selectedDate: formik?.values?.date,
            view: 'week',
        });

        // if (setting?.is_individual_opening_hour) {
        //     const emp = setting?.employees_opening_hour?.find((e) => e?.id === newValue?.id);
        //     const foundDay = emp?.detail.find((d) => d?.start_day === formik?.values?.date.locale('en').format('dddd'));

        //     const additionalDay = foundDay?.additional_days?.[formik?.values?.date.format('YYYY-MM-DD')];
        //     day = {
        //         ...foundDay,
        //         open_time: additionalDay?.start_time || foundDay?.start_time,
        //         close_time: additionalDay?.end_time || foundDay?.end_time,
        //     };
        // } else {
        //     day = setting?.schedule?.find(
        //         (schedule) => schedule?.day === formik?.values?.date.locale('en').format('dddd'),
        //     );
        // }

        cardValues &&
            cardValues.forEach((item, i) => {
                employees.push(item?.selectedEmployee?.id);
                if (item?.available_time) {
                    let [startTime] = item?.available_time?.split('-');

                    let startMoment = moment(startTime.trim(), 'HH:mm'); // Parse the start time in "HH:mm" format
                    let endMoment = startMoment.clone().add(item?.duration_min, 'minutes');
                    let formattedEndTime = endMoment.format('HH:mm');

                    let updatedAvailableTime = `${startTime.trim()} - ${formattedEndTime}`;

                    available_time.push(updatedAvailableTime);

                    if (item?.selectedEmployee?.id && updatedAvailableTime) {
                        if (!exclude_employee_time_slots[item?.selectedEmployee?.id]) {
                            exclude_employee_time_slots[item?.selectedEmployee?.id] = [];
                        }
                        exclude_employee_time_slots[item?.selectedEmployee?.id].push(updatedAvailableTime);
                    }
                }
            });

        let body = {
            exclude_employee_time_slots: index !== 0 ? exclude_employee_time_slots : {},
        };

        setLoading((prev) => ({ ...prev, timeSlotApi: { ...prev.timeSlotApi, [index]: true } }));

        const params = {
            service_id: cardValues[index]?.selectedService?.id,
            date: moment(formik.values.date).format('YYYY-MM-DD'),
            employee_id: newValue?.id,
            custom_duration: cardValues[index]?.duration_min,
        };

        if (cardValues[index]?.booking_id) {
            params['booking_id'] = cardValues[index]?.booking_id;
        }

        try {
            const response = await GetTimingsApi({ params, body });
            if (response.status === HttpStatusCode.Ok) {
                let data = response?.data?.data;

                // Check if operation is still active before processing response
                if (!this.activeOperations.has(operationId)) {
                    return;
                }

                function isOutsideOpenAndCloseTime(slotStartTime) {
                    const startMoment = moment(slotStartTime, 'HH:mm');
                    const openMoment = moment(open_time, 'HH:mm');
                    const closeMoment = moment(close_time, 'HH:mm');
                    return startMoment.isBefore(openMoment) || startMoment.isAfter(closeMoment);
                }

                let tms = timeSlots
                    .map((item, i) => {
                        const startTime = item.split(' - ')[0];
                        const isTimeAvailable = data.some((timeSlot) => timeSlot.split(' - ')[0] === startTime);

                        if (isOutsideOpenAndCloseTime(startTime)) {
                            return null;
                        }

                        const isBetween = moment(startTime, 'HH:mm').isBetween(
                            moment(open_time, 'HH:mm:ss'),
                            moment(close_time, 'HH:mm:ss'),
                            null,
                            '[]', // inclusive start and end
                        );

                        return {
                            value: item,
                            key: generateStableKey(item, i), // Add stable key
                            label: startTime, // Use simple string instead of Typography component
                            disabled: setting?.calendar?.allow_overlap ? false : !isTimeAvailable,
                            // Store styling information separately for the consuming component
                            styling: {
                                color: !isBetween ? '#D7D7D7' : !isTimeAvailable ? '#C60404' : '#1f1f1f',
                                textDecoration: !isTimeAvailable ? 'line-through' : 'none',
                                variant: startTime.endsWith(':00') ? 'body1' : 'body2',
                                fontWeight: startTime.endsWith(':00') ? 700 : 400,
                            },
                        };
                    })
                    .filter((slot) => slot !== null);

                // Batch state updates
                try {
                    setValue(`cards.${index}.availableTimeSlots`, tms);
                    setValue(`cards.${index}.selectedEmployee`, newValue);

                    let newCards = cardValues.map((card, i) =>
                        i === index ? { ...card, selectedEmployee: newValue, availableTimeSlots: tms } : card,
                    );
                    setCardValues(newCards);
                } catch (error) {
                    console.error('Error updating employee change state:', error);
                }
            }
        } catch (error) {
            // Check if error is due to request cancellation
            if (error.name === 'AbortError') {
                console.log('Request cancelled for employee change');
                return;
            }
            console.error('Error fetching employee time slots:', error);
        } finally {
            // Only update loading state if operation is still active
            if (this.activeOperations.has(operationId)) {
                setLoading((prev) => ({
                    ...prev,
                    timeSlotApi: { ...prev.timeSlotApi, [index]: false },
                    waiting: false,
                }));
            }
        }

        // Clean up operation when complete
        this.activeOperations.delete(operationId);
    }

    async handleWalkInChange(formik) {
        formik.setFieldValue('walk_in', !formik.values.walk_in);

        if (!formik.values.walk_in) {
            formik.setFieldValue('selectedCustomer', null);
            formik.setFieldValue('sendEmail', false);
            formik.setFieldValue('sendSms', false);
            formik.setFieldValue('disable', true);
        } else {
            formik.setFieldValue('disable', false);
        }
    }

    async handleDateChange({ date, setValue, setCardValues, cardValues, formik, setLoading, setting }) {
        const newCardValues = await cardValues.map((card) => ({
            ...card,
            availableTimeSlots: [],
            available_time: '',
        }));

        await setCardValues(newCardValues);
        await setValue('cards', newCardValues);
        await formik.setFieldValue('date', date);

        const apiParams = {
            date: date.format('YYYY-MM-DD'),
            ignore_booking_id: newCardValues?.map((item) => item?.booking_id) || [],
        };

        const body = {
            services: newCardValues?.map((item) => ({
                service_id: item?.selectedService?.id,
                employee_id: item?.selectedEmployee?.id,
                custom_duration: item?.duration_min,
            })),
            exclude_time_slots: [],
            exclude_employee_time_slots: {},
        };

        const timeSlots = await generateTimeSlots();
        try {
            const response = await apiMangerBooking.GetTimingsByEmployee({ params: apiParams, body: body });
            const data = response || {};
            const updatedCards = newCardValues.map((card) => {
                const empId = card.selectedEmployee?.id;
                const empAvailable = data[empId] || [];
                // let day;
                const { open_time, close_time } = calendarOpeningHours({
                    data: setting,
                    selectedDate: formik?.values?.date,
                    view: 'week',
                });

                // if (setting?.is_individual_opening_hour) {
                //     const emp = setting?.employees_opening_hour?.find((e) => e?.id === empId);

                //     const foundDay = emp?.detail.find((d) => d?.start_day === date.locale('en').format('dddd'));

                //     const additionalDay = foundDay?.additional_days?.[date.format('YYYY-MM-DD')];
                //     day = {
                //         ...foundDay,
                //         open_time: additionalDay?.start_time || foundDay?.start_time,
                //         close_time: additionalDay?.end_time || foundDay?.end_time,
                //     };
                // } else {
                //     day = setting?.schedule?.find((schedule) => schedule?.day === date.locale('en').format('dddd'));
                // }

                function isOutsideOpenAndCloseTime(slotStartTime) {
                    const startMoment = moment(slotStartTime, 'HH:mm');
                    const openMoment = moment(open_time, 'HH:mm');
                    const closeMoment = moment(close_time, 'HH:mm');
                    return startMoment.isBefore(openMoment) || startMoment.isAfter(closeMoment);
                }

                let tms = timeSlots
                    .map((item, i) => {
                        const startTime = item.split(' - ')[0];
                        const isTimeAvailable = empAvailable?.some(
                            (timeSlot) => timeSlot.split(' - ')[0] === startTime,
                        );

                        if (isOutsideOpenAndCloseTime(startTime)) {
                            return null;
                        }

                        const isBetween = moment(startTime, 'HH:mm').isBetween(
                            moment(open_time, 'HH:mm:ss'),
                            moment(close_time, 'HH:mm:ss'),
                            null,
                            '[]', // inclusive start and end
                        );

                        return {
                            value: item,
                            key: generateStableKey(item, i), // Add stable key
                            label: startTime, // Use simple string instead of Typography component
                            disabled: setting?.calendar?.allow_overlap ? false : !isTimeAvailable,
                            // Store styling information separately for the consuming component
                            styling: {
                                color: !isBetween ? '#D7D7D7' : !isTimeAvailable ? '#C60404' : '#1f1f1f',
                                textDecoration: !isTimeAvailable ? 'line-through' : 'none',
                                variant: startTime.endsWith(':00') ? 'body1' : 'body2',
                                fontWeight: startTime.endsWith(':00') ? 700 : 400,
                            },
                        };
                    })
                    .filter((slot) => slot !== null);

                return {
                    ...card,
                    availableTimeSlots: tms,
                };
            });

            setCardValues(updatedCards);
            setValue('cards', updatedCards);
        } catch (error) {
            console.error('Error fetching date change time slots:', error);

            // Set empty time slots on error to prevent UI issues
            const fallbackCards = newCardValues.map((card) => ({
                ...card,
                availableTimeSlots: [],
            }));
            setCardValues(fallbackCards);
            setValue('cards', fallbackCards);
        }
    }

    // Cleanup method to cancel all pending operations
    cleanup() {
        this.requestCanceller.cancelAllRequests();
        this.activeOperations.clear();
    }

    // Method to check if any operations are pending
    hasActiveOperations() {
        return this.activeOperations.size > 0;
    }

    // Method to clean up stale operations (call periodically)
    cleanupStaleOperations() {
        const now = Date.now();
        const staleThreshold = 30000; // 30 seconds

        // Remove operations older than 30 seconds
        this.activeOperations.forEach((operationId) => {
            const timestamp = parseInt(operationId.split('-').pop());
            if (now - timestamp > staleThreshold) {
                this.activeOperations.delete(operationId);
            }
        });
    }

    /**
     * Auto-adjust bookings after card removal
     * Shifts all bookings that come after the removed one (by time) forward
     * @param {number} index - Index of the card to remove
     * @param {Array} cardValues - Current card values
     * @param {Function} setCardValues - Function to update card values
     * @param {Function} setValue - Function to update form values
     * @param {Function} remove - Function to remove card from form array
     */
    async handleCardRemoval(index, cardValues, setCardValues, setValue, remove) {
        // Auto-adjust bookings after removal
        const currentCards = [...cardValues];

        // Create array with indices to track original positions
        const cardsWithIndex = currentCards.map((card, i) => ({
            card,
            originalIndex: i,
        }));

        // Remove the card from form array
        await remove(index);
        // Find the removed card in sorted array
        const removedCardIndex = cardsWithIndex.findIndex((item) => item.originalIndex === index);
        // Remove the card
        const cardsAfterRemoval = cardsWithIndex.filter((item) => item.originalIndex !== index);
        // Adjust all cards that come after the removed one (by time, not index)
        // Build adjusted cards progressively to use already-adjusted times
        const adjustedCardsWithIndex = [];

        for (let i = 0; i < cardsAfterRemoval.length; i++) {
            const item = cardsAfterRemoval[i];
            const card = item.card;

            // Cards before the removed one (by time) stay the same
            if (i < removedCardIndex) {
                adjustedCardsWithIndex.push(item);
                continue;
            }

            // For cards after removal, calculate new start time based on previous card's end time
            let previousItemEndTime;

            if (i === removedCardIndex) {
                // First card after removal: use the last card before removal as reference
                const lastCardBeforeRemoval = adjustedCardsWithIndex[adjustedCardsWithIndex.length - 1];
                if (lastCardBeforeRemoval) {
                    const lastCardStartTime = lastCardBeforeRemoval.card?.available_time?.includes('-')
                        ? lastCardBeforeRemoval.card.available_time.split('-')[0].trim()
                        : lastCardBeforeRemoval.card.available_time?.trim();
                    const lastCardDuration = lastCardBeforeRemoval.card?.duration_min || 30;
                    previousItemEndTime = moment(lastCardStartTime, 'HH:mm').add(lastCardDuration, 'minutes');
                } else {
                    const originalStartTime = card?.available_time?.includes('-')
                        ? card.available_time.split('-')[0].trim()
                        : card.available_time?.trim();
                    previousItemEndTime = moment(originalStartTime, 'HH:mm');
                }
            } else {
                // Subsequent cards: use the previous adjusted card's end time
                const previousAdjustedCard = adjustedCardsWithIndex[adjustedCardsWithIndex.length - 1];
                const previousStartTime = previousAdjustedCard.card?.available_time?.includes('-')
                    ? previousAdjustedCard.card.available_time.split('-')[0].trim()
                    : previousAdjustedCard.card.available_time?.trim();
                const previousDuration = previousAdjustedCard.card?.duration_min || 30;
                previousItemEndTime = moment(previousStartTime, 'HH:mm').add(previousDuration, 'minutes');
            }

            // Calculate new times for current card
            // Note: available_time is for display only - backend calculates actual end time from start_time + duration_min
            const newCurrentItemStartTime = moment(previousItemEndTime);
            const newCurrentItemEndTime = newCurrentItemStartTime.clone().add(30, 'minutes'); // Display only - backend uses duration_min
            const newAvailableTime = `${newCurrentItemStartTime.format('HH:mm')} - ${newCurrentItemEndTime.format('HH:mm')}`;

            adjustedCardsWithIndex.push({
                ...item,
                card: {
                    ...card, // duration_min is preserved here
                    available_time: newAvailableTime,
                },
            });
        }
        // Restore original order by originalIndex
        const finalCards = adjustedCardsWithIndex
            .sort((a, b) => a.originalIndex - b.originalIndex)
            .map((item) => item.card);

        // Update card values
        setValue('cards', finalCards);
        setCardValues(finalCards);
    }
}

export const HandleBooking = new HandlerBooking();
