import React, { useState, useEffect, useMemo } from 'react';
import {
    Stack,
    Autocomplete,
    Box,
    Grid2,
    Typography,
    Divider,
    ListSubheader,
    TextField,
    Card,
    CardContent,
    InputAdornment,
    MenuItem,
    IconButton,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import * as Yup from 'yup';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useFormik } from 'formik';
import FSwitch from '../../commonComponents/f-switch';
import CustomDatePicker from '../../settings/commonDatePicker';
import CommonButton from '../../settings/commonButton';
import CreateCustomerForm from './createCustomerModal';
import AddCustomerIcon from '../../../assets/newAddCustomer.png';
import CustomTextField from '../../settings/commonTextinput';
import FButton from '../../commonComponents/F_Button';
import ClockIcon from '../../../assets/newClockDesign.svg';
import SearchNewGold from '../../../assets/searchNewGold.png';
import { t } from 'i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import moment from 'moment';
import { generateTimeSlots, getItems } from './utils/functions';
import { apiMangerBooking } from './utils/api';
import { HandleBooking } from './utils/handlers';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Close } from '@mui/icons-material';
import CustomCheckbox from '../../commonComponents/F_Checkbox';
import SaveModal from '../../customer/customerDetail/Advanced-journal/popup/SaveModal';
import { useSocket } from '../../../context/SocketContext';
import { formatPhoneNumber } from './utils/functions';
import SendEmailModal from '../../customer/customerDetail/Advanced-journal/popup/SendEmailModal';
import apiFetcher from '../../../utils/interCeptor';
import FSelect from '../../commonComponents/F_Select';
import AddressAutoComplete from '../../commonComponents/AddressAutoComplete';
import { formatCurrency } from '../../../scenes/POS/Core/pos.utils';
import BlurPrice from '../../commonComponents/BlurPrice';
import { shouldBlurPrices } from '../../../utils/price-visibility';
import { distanceFormat } from '../../../utils/distanceFormat';

export default function CreateBookingTab({
    initialData,
    closeForm,
    rescheduleProps,
    setEvents,
    tempId,
    refreshBookings,
    selectedFiles,
    setSelectedCustomer,
}) {
    const user = useSelector((state) => state.user.data);
    const setting = useSelector((state) => state.settings.data);
    const isInspectionEnabled = setting?.profile?.inspection_module;
    const blurPrices = shouldBlurPrices(user);

    const socket = useSocket();

    const [loading, setLoading] = useState({
        serviceApi: false,
        customerApi: false,
        timeSlotApi: [false],
        waiting: false,
    });
    const [serviceList, setServiceList] = useState([]);
    const [customer, setCustomer] = useState();
    const [customers, setCustomers] = useState([{ label: t('Customer.AddNewCustomer'), id: 0 }]);
    const [showCreateCustomerDialog, setShowCreateCustomerDialoge] = useState(false);
    const [cancelToken, setCancelToken] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const { control, getValues, setValue } = useForm({
        defaultValues: {
            cards: [
                {
                    booking_id: null,
                    selectedService: '',
                    employeeList: [],
                    selectedEmployee: '',
                    availableTimeSlots: [],
                    available_time: '',
                    durationList: [],
                    duration_min: '',
                    price: '',
                    isSpecial: false,
                    originalPrice: '',
                },
            ],
        },
    });

    const [cardValues, setCardValues] = useState(getValues('cards'));
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'cards',
    });

    const [errors, setErrors] = useState({});
    const [customerProps, setCustomerProps] = useState('');
    const [scrollToTime, setScrollToTime] = useState({});

    const [showCheckbox, setShowCheckbox] = useState(false);
    const [showEmailModel, setshowEmailModel] = useState(false);
    const [addressFormik, setAddressFormik] = useState(null);
    const [isInspectionCostLoading, setIsInspectionCostLoading] = useState(false);
    const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
    const [hasAddressChanged, setHasAddressChanged] = useState(false);
    const [originalCustomerAddress, setOriginalCustomerAddress] = useState(null);

    useEffect(() => {
        setTimeSlots(generateTimeSlots());
        apiMangerBooking.fetchServiceApi({
            setServiceList,
            setLoading,
            fields,
            t,
            setValue,
            getValues,
            rescheduleProps,
            setCardValues,
        });
        if (rescheduleProps) {
            setLoading((prev) => ({
                ...prev,
                timeSlotApi: Array(rescheduleProps?.booking?.length).fill(false),
            }));

            // Map and sort bookings by time in ascending order (optimized - single pass)
            const mappedBookings = rescheduleProps?.booking
                ? rescheduleProps.booking
                      .map((item) => ({
                          ...item,
                          employeeList: [],
                          availableTimeSlots: [],
                      }))
                      .sort((a, b) => {
                          // Extract start time from available_time
                          const timeA = a?.available_time
                              ? a.available_time.includes('-')
                                  ? a.available_time.split('-')[0].trim()
                                  : a.available_time.trim()
                              : '99:99'; // Put bookings without time at the end
                          const timeB = b?.available_time
                              ? b.available_time.includes('-')
                                  ? b.available_time.split('-')[0].trim()
                                  : b.available_time.trim()
                              : '99:99';

                          // Direct string comparison works for HH:mm format (lexicographically sortable)
                          return timeA.localeCompare(timeB);
                      })
                : null;

            setValue('cards', mappedBookings);
            if (mappedBookings) {
                setCardValues(mappedBookings);
            }
            setCustomers([{ label: rescheduleProps?.customer_name, id: rescheduleProps?.id }]);
            apiMangerBooking.availableTimeSlots(rescheduleProps, setValue, setCardValues, setLoading, setting);

            formik.setFieldValue(
                'selectedCustomer',
                rescheduleProps?.selectedCustomer?.id ? rescheduleProps?.selectedCustomer : null,
            );
            formik.setFieldValue('walk_in', rescheduleProps?.walk_in);
            formik.setFieldValue('sendEmail', false);
            formik.setFieldValue('sendSms', false);
            formik.setFieldValue('date', moment(rescheduleProps?.date));
            formik.setFieldValue('note', rescheduleProps?.note);
            formik.setFieldValue('isBlocked', rescheduleProps?.block_booking);
            if (isInspectionEnabled && rescheduleProps?.inspection_data) {
                formik.setFieldValue('inspection_data', rescheduleProps.inspection_data);
            }
        } else if (initialData && !rescheduleProps) {
            formik.setFieldValue('date', moment(initialData?.date));
            initialData?.customerdata &&
                formik.setFieldValue('selectedCustomer', {
                    label: `${initialData?.customerdata?.name} (${formatPhoneNumber(initialData?.customerdata?.phone_number)})`,
                    ...initialData?.customerdata,
                });
        } else {
            formik.setFieldValue('date', moment());
        }
    }, [rescheduleProps, initialData]);

    useEffect(() => {
        if (setting?.OnlineBooking?.autoToggle?.email) {
            formik.setFieldValue('sendEmail', setting?.OnlineBooking?.autoToggle?.email);
        }
        if (setting?.OnlineBooking?.autoToggle?.sms) {
            formik.setFieldValue('sendSms', setting?.OnlineBooking?.autoToggle?.sms);
        }
    }, [setting]);

    useEffect(() => {
        if (customer) {
            setCustomers(customer);
            formik.setFieldValue('selectedCustomer', customer[1]);
        }
    }, [customer]);

    // Listen to address form ready event
    useEffect(() => {
        const handleAddressFormReady = (event) => {
            setAddressFormik(event.detail?.formik || null);
        };

        window.addEventListener('addressFormReady', handleAddressFormReady);

        return () => {
            window.removeEventListener('addressFormReady', handleAddressFormReady);
        };
    }, []);

    const allServices = serviceList.flatMap((groupData) =>
        groupData.data.map((service) => ({
            ...service,
            group: groupData.title,
        })),
    );

    const initialValues = {
        selectedCustomer: null,
        walk_in: false,
        sendEmail: false,
        sendSms: false,
        date: null,
        note: '',
        disable: false,
        need_customer_info: false,
        customer_info_metadata: [],
        isBlocked: false,
        ...(isInspectionEnabled ? { inspection_data: null } : {}),
    };

    const validationSchema = Yup.object().shape({
        selectedCustomer: Yup.object().when('walk_in', {
            is: false, // When walk_in is false
            then: Yup.object().required(t('Customer.CustomerNameError')).nullable(),
            otherwise: Yup.object().nullable(), // If walk_in is true, it's not required
        }),
        date: Yup.date().required(t('Calendar.YupErrDateReq')).nullable(),
        walk_in: Yup.boolean(),
    });

    const inspectionSchema = Yup.object().shape({
        chargesData: Yup.object().shape({
            travelFees: Yup.number().required(t('Calendar.PleaseSelectValidAddress')),
            bridgeFees: Yup.number().required(t('Calendar.PleaseSelectValidAddress')),
        }),
        totalCharges: Yup.number().required(t('Calendar.PleaseSelectValidAddress')),
        totalDistance: Yup.number().required(t('Calendar.PleaseSelectValidAddress')),
        userInformation: Yup.object().shape({
            latitude: Yup.number().required(t('Calendar.PleaseSelectValidAddress')),
            longitude: Yup.number().required(t('Calendar.PleaseSelectValidAddress')),
            zipCode: Yup.string().required(t('Calendar.PleaseSelectValidAddress')),
        }),
    });

    const finalValidationSchema = isInspectionEnabled
        ? validationSchema.shape({
              inspection_data: inspectionSchema.nullable(),
          })
        : validationSchema;

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema: finalValidationSchema,
        onSubmit: async (values) => {
            // Validate address form first if inspection is enabled and not in edit mode
            if (isInspectionEnabled && !rescheduleProps && addressFormik) {
                // Validate the address form to get latest errors
                const addressErrors = await addressFormik.validateForm();
                const currentAddressValues = addressFormik.values;
                const hasCoordinatesInFormik = currentAddressValues.latitude && currentAddressValues.longitude;
                const hasCoordinatesInInspectionData =
                    values?.inspection_data?.userInformation?.latitude &&
                    values?.inspection_data?.userInformation?.longitude;

                // Check if address/zipCode exist in formik OR in inspection_data
                const hasAddressInFormik = currentAddressValues.address && currentAddressValues.zipCode;
                const hasAddressInInspectionData =
                    values?.inspection_data?.userInformation?.zipCode &&
                    (currentAddressValues.address || values?.inspection_data?.userInformation?.address);
                const hasValidAddress =
                    (hasCoordinatesInFormik || hasCoordinatesInInspectionData) &&
                    (hasAddressInFormik || hasAddressInInspectionData);

                // If address form has errors or no valid address selected, prevent submission
                if (Object.keys(addressErrors).length > 0 || !hasValidAddress) {
                    // Mark all address fields as touched to show errors
                    addressFormik.setTouched({
                        address: true,
                        zipCode: true,
                        city: true,
                    });
                    // Mark inspection_data as touched to show validation errors
                    formik.setTouched({ ...formik.touched, inspection_data: true });
                    // If inspection_data is not set or invalid, set an error
                    if (!values?.inspection_data || !values?.inspection_data?.userInformation?.latitude) {
                        formik.setFieldError('inspection_data', t('Calendar.PleaseSelectValidAddress'));
                    }
                    return; // Prevent form submission
                }
                // If we have coordinates in formik but inspection_data is not set,
                // it means cost calculation might still be in progress or failed
                // Allow submission if we have coordinates (either in formik or inspection_data)
                // The hasValidAddress check above already covers this case
                if (!hasCoordinatesInFormik && !hasCoordinatesInInspectionData) {
                    formik.setTouched({ ...formik.touched, inspection_data: true });
                    formik.setFieldError('inspection_data', t('Calendar.PleaseSelectValidAddress'));
                    return; // Prevent form submission
                }
            }
            const formatValues = {
                booking_id: rescheduleProps ? rescheduleProps?.booking_id : null,
                customer_name: values?.walk_in ? '' : values?.selectedCustomer?.name,
                customer_country_code: values?.walk_in ? '' : values?.selectedCustomer?.country_code || '+45',
                customer_country_iso_code: values?.walk_in ? '' : values?.selectedCustomer?.country_iso_code || 'DK',
                customer_phone_number: values?.walk_in ? '' : values?.selectedCustomer?.phone_number || '',
                booking_date: values?.date.format('YYYY-MM-DD'),
                note: values?.note,
                send_email: values?.walk_in ? false : values?.sendEmail,
                send_sms: values?.walk_in ? false : values?.sendSms,
                walk_in: values?.walk_in,
                created_by_emp_id: user?.id,
                created_by_emp_name: user?.name,
                need_customer_info: values?.need_customer_info,
                customer_info_metadata: values?.need_customer_info ? values?.customer_info_metadata : [],
            };

            let cards = getValues('cards');
            let validationErrors = {}; // To collect the errors
            let mapper = cards;
            if (formik?.values?.need_customer_info) {
                mapper = cards.filter((c) => !c?.selectedService?.require_customer_form);
            }

            let format = mapper.map((item, index) => {
                console.log(item);
                let errorsForItem = {}; // Errors for the current item

                if (!item?.selectedService) {
                    errorsForItem.selectedService = t('Calendar.PlSelServ');
                }

                if (!item?.selectedEmployee) {
                    errorsForItem.selectedEmployee = t('Calendar.PlSelEmp');
                }

                if (!item?.available_time || !item?.available_time.includes('-')) {
                    errorsForItem.available_time = t('Calendar.PlSelTime');
                }

                if (!item?.duration_min) {
                    errorsForItem.duration_min = t('Calendar.PlSelDur');
                }

                if (!item?.price) {
                    errorsForItem.price = t('Calendar.PlEnterPr');
                }

                if (Object.keys(errorsForItem).length > 0) {
                    validationErrors[index] = errorsForItem; // Save the errors for this index
                }

                let [startTime, endTime] = item?.available_time.split('-');

                let startMoment = moment(startTime.trim(), 'HH:mm'); // Parse the start time in "HH:mm" format
                let endMoment = startMoment.clone().add(item?.duration_min, 'minutes');
                let formattedEndTime = endMoment.format('HH:mm');

                let updatedAvailableTime = `${startTime.trim()} - ${formattedEndTime}`;

                let formattedItem = {
                    service_id: item?.selectedService?.id,
                    time_slot: updatedAvailableTime,
                    employee_id: item?.selectedEmployee?.id,
                    duration: item?.duration_min,
                    total_amount: item?.price,
                    booking_id: item?.booking_id,
                };

                return formattedItem;
            });

            // If there are any errors, update the state
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
            const payload = {
                ...formatValues,
                services: format,
            };
            if (isInspectionEnabled) {
                payload.inspection_data = {
                    ...values?.inspection_data,
                    total_payment: cardValues?.reduce(
                        (acc, card) => acc + Number(card.price),
                        isInspectionEnabled
                            ? formik?.values?.inspection_data?.totalCharges ||
                                  rescheduleProps?.inspection_data?.totalCharges ||
                                  0
                            : 0,
                    ),
                };

                const filesToAttach = Array.isArray(selectedFiles) ? selectedFiles : [];

                const normalizedFiles = (filesToAttach || []).map((files) => ({
                    fileId: files?.fileId,
                    fileUrl: files?.fileUrl,
                    fileName: files?.file_name,
                }));

                payload.inspection_data.uploaded_files_at_checkout = Array.isArray(
                    payload.inspection_data.uploaded_files_at_checkout,
                )
                    ? [...payload.inspection_data.uploaded_files_at_checkout, ...normalizedFiles]
                    : normalizedFiles;
            }
            const editPayload = {
                booking_id: rescheduleProps?.booking_id,
                booking_date: values?.date.format('YYYY-MM-DD'),
                note: values?.note,
                send_email: formatValues?.send_email,
                send_sms: formatValues?.send_sms,
                need_customer_info: formatValues?.need_customer_info,
                customer_info_metadata: formatValues?.customer_info_metadata,
                services: format,
                ignore_self_overlap_check: true,
            };
            if (isInspectionEnabled) {
                editPayload.inspection_data = {
                    ...values?.inspection_data,
                    total_payment: cardValues?.reduce(
                        (acc, card) => acc + Number(card.price),
                        isInspectionEnabled
                            ? formik?.values?.inspection_data?.totalCharges ||
                                  rescheduleProps?.inspection_data?.totalCharges ||
                                  0
                            : 0,
                    ),
                };

                const filesToAttachEdit = Array.isArray(selectedFiles) ? selectedFiles : [];

                const normalizedFilesEdit = (filesToAttachEdit || []).map((files) => {
                    if (files.file) {
                        return {
                            fileId: files?.fileId,
                            fileUrl: files?.fileUrl,
                            fileName: files?.file_name,
                        };
                    }
                    return {
                        ...files,
                    };
                });

                editPayload.inspection_data.uploaded_files_at_checkout =
                    Array.isArray(editPayload.inspection_data.uploaded_files_at_checkout) && normalizedFilesEdit;
            }

            let isEdit = rescheduleProps ? true : false;

            if (payload.services.length === 0 && payload?.customer_info_metadata?.length === 0) return;
            await apiMangerBooking.handleSubmit(
                isEdit ? editPayload : payload,
                closeForm,
                toast,
                t,
                isEdit,
                setEvents,
                refreshBookings,
                socket,
            );
        },
    });

    useEffect(() => {
        if (formik?.values?.selectedCustomer) {
            if (!formik?.values?.selectedCustomer?.email) {
                formik.setFieldValue('sendEmail', false);
            }
        }
    }, [formik.values.selectedCustomer]);

    // Track original customer address when customer is selected
    useEffect(() => {
        if (isInspectionEnabled && formik?.values?.selectedCustomer?.id) {
            const customer = formik.values.selectedCustomer;
            setOriginalCustomerAddress({
                address: customer?.address || '',
                zipCode: customer?.zip_code || '',
                city: customer?.city || '',
                latitude: customer?.latitude || '',
                longitude: customer?.longitude || '',
            });
            setHasAddressChanged(false);
        }
    }, [formik?.values?.selectedCustomer?.id, isInspectionEnabled]);

    const addCard = () => {
        append({
            booking_id: null,
            selectedService: '',
            employeeList: [],
            selectedEmployee: '',
            availableTimeSlots: [],
            available_time: '',
            durationList: [],
            duration_min: '',
            price: '',
        });

        setCardValues((prevValues) => [
            ...prevValues,
            {
                selectedService: '',
                employeeList: [],
                selectedEmployee: '',
                availableTimeSlots: [],
                available_time: '',
                durationList: [],
                duration_min: '',
                price: '',
            },
        ]);

        setLoading((prev) => ({
            ...prev,
            timeSlotApi: Array(cardValues?.length + 1).fill(false),
        }));
    };

    const formattedTotalAmount = new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: 'DKK',
        minimumFractionDigits: 2,
        currencyDisplay: 'symbol',
    }).format(
        cardValues?.reduce(
            (acc, card) => acc + Number(card.price),
            isInspectionEnabled
                ? formik?.values?.inspection_data?.totalCharges || rescheduleProps?.inspection_data?.totalCharges || 0
                : 0,
        ),
    );

    const formattedString = getItems(cardValues?.reduce((acc, card) => acc + card.duration_min, 0));

    const isEmailPermission = !formik?.values?.disable && setting?.profile?.enable_email;
    const isSmsPermission = !formik?.values?.disable && setting?.profile?.enable_sms;

    useEffect(() => {
        if (cardValues.some((card) => card?.selectedService?.require_customer_form) && !formik?.values?.walk_in) {
            setShowCheckbox(true);
            // set customer_info_metadata in formik for each card value servicename and service id
            const metaData = cardValues
                ?.filter((card) => card?.selectedService?.require_customer_form)
                ?.map((card) => ({
                    service_name: card?.selectedService?.name,
                    service_id: card?.selectedService?.id,
                    customer_name: formik?.values?.selectedCustomer?.name,
                    customer_id: formik?.values?.selectedCustomer?.id,
                    employee_id: card?.selectedEmployee?.id,
                    employee_name: card?.selectedEmployee?.name,
                }));

            formik.setFieldValue('customer_info_metadata', metaData);
        } else {
            setShowCheckbox(false);
            formik.setFieldValue('customer_info_metadata', []);
        }
    }, [cardValues, formik?.values?.walk_in]);

    const renderButtonText = () => {
        const extraVals = cardValues
            ?.filter((card) => !card?.selectedService?.require_customer_form)
            ?.map((card) => card);
        if (rescheduleProps) {
            return t('Customer.SaveCh');
        }
        if (formik?.values?.need_customer_info && extraVals?.length > 0) {
            return t('Calendar.SendFormCreateBk');
        } else if (
            formik?.values?.need_customer_info &&
            formik?.values?.customer_info_metadata?.length > 0 &&
            extraVals?.length === 0
        ) {
            return t('Calendar.SendForm');
        } else {
            return t('Calendar.CreBook');
        }
    };

    const disabledCondition = ({ index }) => {
        if (
            cardValues[index]?.selectedService?.require_customer_form &&
            formik?.values?.need_customer_info &&
            !formik?.values?.walk_in
        ) {
            return true;
        } else {
            return false;
        }
    };

    const handleSubmit = async (values) => {
        await apiFetcher.patch(`api/v1/store/customer/outlet?id=${formik?.values?.selectedCustomer?.id}`, {
            ...formik?.values?.selectedCustomer,
            email: values?.email,
        });
        formik.setFieldValue('selectedCustomer', { ...formik.values?.selectedCustomer, email: values?.email });
        toast.success(t('Customer.CustomerUpdateSuccess'));
        setshowEmailModel(false);
    };

    const handleInspectionCostLoadingChange = (isLoading) => {
        setIsInspectionCostLoading(isLoading);
        if (isLoading) {
            formik.setFieldValue('inspection_data', null);
        }
    };

    // Update customer address details
    const handleUpdateCustomer = async () => {
        if (!formik?.values?.selectedCustomer?.id || !addressFormik) {
            return;
        }

        const currentAddress = addressFormik.values;
        const customer = formik.values.selectedCustomer;

        setIsUpdatingCustomer(true);
        try {
            const payload = {
                ...customer,
                address: currentAddress.address,
                zip_code: currentAddress.zipCode,
                city: currentAddress.city,
                latitude: currentAddress.latitude,
                longitude: currentAddress.longitude,
            };

            await apiFetcher.patch(`api/v1/store/customer/outlet?id=${customer.id}`, payload);

            // Update the selected customer in formik with new address
            formik.setFieldValue('selectedCustomer', {
                ...customer,
                ...payload,
            });

            // Update original address to reflect the saved state
            setOriginalCustomerAddress({
                address: currentAddress.address,
                zipCode: currentAddress.zipCode,
                city: currentAddress.city,
                latitude: currentAddress.latitude,
                longitude: currentAddress.longitude,
            });

            setHasAddressChanged(false);
            toast.success(t('Customer.CustomerUpdateSuccess'));
        } catch (error) {
            console.error('Error updating customer:', error);
            toast.error(t('Customer.CustomerUpdateError') || 'Failed to update customer');
        } finally {
            setIsUpdatingCustomer(false);
        }
    };

    // Memoize defaultValue to prevent infinite re-renders
    const addressDefaultValue = useMemo(
        () => ({
            address: formik.values.selectedCustomer?.address || '',
            zipCode: formik.values.selectedCustomer?.zip_code || '',
            city: formik.values.selectedCustomer?.city || '',
            latitude: formik.values.selectedCustomer?.latitude || '',
            longitude: formik.values.selectedCustomer?.longitude || '',
        }),
        [
            formik.values.selectedCustomer?.address,
            formik.values.selectedCustomer?.zip_code,
            formik.values.selectedCustomer?.city,
            formik.values.selectedCustomer?.latitude,
            formik.values.selectedCustomer?.longitude,
        ],
    );

    const handleAddressSelect = (values) => {
        const serviceTotalAmount = cardValues?.reduce((acc, card) => acc + Number(card.price), 0);
        const inspectionData = {
            chargesData: {
                travelFees: Number(values?.distance_cost) || 0,
                bridgeFees: Number(values?.toll_cost) || 0,
            },
            distanceText: values?.distance_text,
            distance: values?.distance,
            duration: values?.duration,
            durationText: values?.duration_text,
            totalCharges: (Number(values?.distance_cost) || 0) + (Number(values?.toll_cost) || 0),
            totalDistance: Number(values?.distance) || 0,
            totalDuration: Number(values?.duration) || 0,
            userInformation: {
                ...formik.values?.selectedCustomer,
                latitude: values?.latitude,
                longitude: values?.longitude,
                zipCode: values?.zipCode,
                address: values?.address,
                zip_code: values?.zipCode,
                city: values?.city,
            },
            total_payment:
                (Number(values?.distance_cost) || 0) +
                (Number(values?.toll_cost) || 0 + Number(serviceTotalAmount || 0) || 0),
        };
        formik.setFieldValue('inspection_data', inspectionData);

        // Check if address has changed when address is selected
        if (originalCustomerAddress && values) {
            const hasChanged =
                originalCustomerAddress.address !== values.address ||
                originalCustomerAddress.zipCode !== values.zipCode ||
                originalCustomerAddress.city !== values.city ||
                originalCustomerAddress.latitude !== values.latitude ||
                originalCustomerAddress.longitude !== values.longitude;
            setHasAddressChanged(hasChanged);
        }
    };

    const flattnedServiceGroupIds = useMemo(() => {
        if (!cardValues) return undefined;
        const ids = Array.from(
            new Set(
                cardValues
                    .flatMap((item) => item.selectedService?.group_id)
                    .filter((id) => id !== undefined && id !== null),
            ),
        );
        return ids.length > 0 ? ids : undefined;
    }, [cardValues]);

    return (
        <React.Fragment>
            <Grid2 marginTop={1} paddingBottom={5} container spacing={2} sx={{ px: { xs: 2, sm: 5 } }}>
                <Grid2 item size={{ xs: 12, md: 4 }}>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        {t('Calendar.SearchCus')}
                    </Typography>

                    <Autocomplete
                        disabled={rescheduleProps || formik?.values?.disable}
                        value={formik.values.selectedCustomer}
                        onChange={(event, obj) => {
                            if (obj && obj.id === 0) {
                                setShowCreateCustomerDialoge(true);
                            } else {
                                formik.setFieldValue('selectedCustomer', obj);
                                setSelectedCustomer(obj);
                                if (obj?.block_booking) {
                                    formik.setFieldValue('isBlocked', true);
                                } else {
                                    formik.setFieldValue('isBlocked', false);
                                }
                            }
                        }}
                        options={customers}
                        getOptionLabel={(option) => option && option.label}
                        fullWidth
                        filterOptions={(option) => option}
                        popupIcon={<KeyboardArrowDownIcon style={{ color: 'black' }} />}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                onChange={(e) => {
                                    let value = e?.target?.value;

                                    // Check if the value is a number, ignoring spaces
                                    const isNumber = /^\s*(\d+\s*)+$/.test(value);
                                    const processedValue = isNumber ? value.replace(/\s/g, '') : value;
                                    setCustomerProps(processedValue);
                                    apiMangerBooking.fetchSuggestions({
                                        cus: processedValue,
                                        cancelToken,
                                        setCancelToken,
                                        setCustomers,
                                        setLoading,
                                        t,
                                    });
                                }}
                                placeholder={loading.customerApi ? `${t('Common.Loading')}` : t('Calendar.SearchCus')}
                                variant="outlined"
                                size="small"
                                sx={{
                                    mt: 1,
                                    // bgcolor: '#E9E9E9',
                                    height: 40,
                                    fontSize: '0.85rem',
                                    borderRadius: '13px',
                                    border: `1px solid #D9D9D9`,
                                    '& .MuiInputBase-root': { padding: '5px' },
                                    '& .MuiInputBase-input': {
                                        color: '#545454',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                    },
                                    '& .MuiInputBase-input::placeholder': { fontSize: '14px' },
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#D9D9D9',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#D9D9D9',
                                    },
                                    '& .MuiAutocomplete-popupIndicator': { color: '#000' },
                                }}
                                onFocus={(event) => {
                                    event.stopPropagation();
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <img
                                                src={SearchNewGold}
                                                alt="search"
                                                style={{ height: '20px', width: '20px' }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <React.Fragment>
                                <MenuItem
                                    {...props}
                                    value={option.id}
                                    sx={{
                                        color: '#545454',
                                        fontSize: '15px',
                                        fontWeight: 400,
                                        '&:hover': { backgroundColor: '#f5f5f5' },
                                        padding: 0,
                                    }}
                                >
                                    {option.id === 0 && (
                                        <img
                                            src={AddCustomerIcon}
                                            alt="Add customer"
                                            style={{
                                                height: '20px',
                                                width: '22px',
                                                paddingRight: '2px',
                                            }}
                                        />
                                    )}
                                    {`${(option.block_booking ? '🚫' : '') + option.label}`}
                                </MenuItem>

                                <Divider />
                            </React.Fragment>
                        )}
                        noOptionsText={t('Calendar.NoCusFound')}
                        disableClearable
                    />
                    {formik.errors.selectedCustomer && formik.touched.selectedCustomer && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="red">
                                {formik.errors.selectedCustomer}
                            </Typography>
                        </Box>
                    )}

                    {isInspectionEnabled && !rescheduleProps && formik?.values?.selectedCustomer?.id && (
                        <Stack>
                            <AddressAutoComplete
                                key={formik?.values?.selectedCustomer?.id}
                                title={t('Common.Address')}
                                defaultValue={addressDefaultValue}
                                addressSx={{ width: '100%' }}
                                zipCodeSx={{ width: '100%' }}
                                citySx={{ width: '100%' }}
                                onFormSubmit={(values) => {
                                    formik.setFieldValue('selectedCustomer', {
                                        ...formik.values?.selectedCustomer,
                                        ...values,
                                    });

                                    // Check if address has changed
                                    if (originalCustomerAddress) {
                                        const hasChanged =
                                            originalCustomerAddress.address !== values.address ||
                                            originalCustomerAddress.zipCode !== values.zipCode ||
                                            originalCustomerAddress.city !== values.city ||
                                            originalCustomerAddress.latitude !== values.latitude ||
                                            originalCustomerAddress.longitude !== values.longitude;
                                        setHasAddressChanged(hasChanged);
                                    }
                                }}
                                onAddressSelect={handleAddressSelect}
                                onCostCalculationStateChange={handleInspectionCostLoadingChange}
                                flattnedServiceGroupIds={flattnedServiceGroupIds}
                            />
                            {hasAddressChanged && (
                                <CommonButton
                                    height={36}
                                    title={
                                        isUpdatingCustomer ? (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CircularProgress size={16} color="inherit" />
                                                <Typography variant="body2">
                                                    {t('POS.Updating') || 'Updating...'}
                                                </Typography>
                                            </Stack>
                                        ) : (
                                            t('Customer.UpdateCustomer') || 'Update Customer'
                                        )
                                    }
                                    backgroundColor={'#44B904'}
                                    disabled={isUpdatingCustomer || isInspectionCostLoading}
                                    onClick={handleUpdateCustomer}
                                    style={{
                                        width: '100%',
                                        mt: 1.5,
                                        borderRadius: '10px',
                                    }}
                                />
                            )}
                        </Stack>
                    )}

                    {!isInspectionEnabled && (
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                            }}
                        >
                            <FSwitch
                                disabled={rescheduleProps}
                                checked={formik.values.walk_in}
                                onChange={() => {
                                    HandleBooking.handleWalkInChange(formik);
                                    formik.setFieldValue('walk_in', !formik.values.walk_in);
                                }}
                            />
                            <Typography variant="body1" sx={{ fontWeight: 400, color: '#1F1F1F' }}>
                                {t('Calendar.Dropin')}
                            </Typography>
                        </Box>
                    )}
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {t('Common.Date')}
                    </Typography>

                    <CustomDatePicker
                        // disabled={rescheduleProps}
                        value={formik.values.date}
                        onChange={(date) =>
                            HandleBooking.handleDateChange({
                                date,
                                setValue,
                                setCardValues,
                                cardValues,
                                formik,
                                setLoading,
                                setting,
                                scrollToTime,
                            })
                        }
                        sx={{ width: '100%', mt: 1 }}
                        onBlur={formik.handleBlur}
                        size="small"
                        borderColor="#D9D9D9"
                        format="DD/MM-YYYY"
                        padding={1}
                        borderThickness="2px"
                        inputColor="#A0A0A0"
                        iconVisibility={false}
                    />
                    {formik.errors.date && formik.touched.date && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="red">
                                {formik.errors.date}
                            </Typography>
                        </Box>
                    )}

                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {t('Common.Note')}
                    </Typography>

                    <TextField
                        placeholder={t('Calendar.NoteDes')}
                        multiline
                        rows={3}
                        fullWidth
                        value={formik.values.note}
                        onChange={(e) => formik.setFieldValue('note', e?.target?.value)}
                        sx={{
                            border: `1px solid #D9D9D9`,
                            mt: 1,
                            borderRadius: '15px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                            },
                        }}
                    />

                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10,
                        }}
                    >
                        <FSwitch
                            disabled={!isEmailPermission}
                            checked={formik.values.sendEmail}
                            onChange={() => {
                                formik.setFieldValue('sendEmail', !formik.values.sendEmail);
                                if (!formik?.values?.sendEmail) {
                                    if (
                                        !formik?.values?.selectedCustomer?.email &&
                                        formik?.values?.selectedCustomer?.email !== undefined
                                    ) {
                                        setshowEmailModel(true);
                                    }
                                }
                            }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 400, color: '#1F1F1F' }}>
                            {t('Calendar.EmailConf')}
                        </Typography>
                    </Box>
                    {showEmailModel && (
                        <SendEmailModal
                            open={showEmailModel}
                            onClose={() => {
                                setshowEmailModel(false);
                                formik.setFieldValue('sendEmail', !formik.values.sendEmail);
                            }}
                            handleSubmit={handleSubmit}
                        />
                    )}

                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 3,
                        }}
                    >
                        <FSwitch
                            disabled={!isSmsPermission}
                            checked={formik.values.sendSms}
                            onChange={() => formik.setFieldValue('sendSms', !formik.values.sendSms)}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 400, color: '#1F1F1F' }}>
                            {t('Calendar.SmsConf')}
                        </Typography>
                    </Box>
                </Grid2>

                <Grid2 item size={{ xs: 0.5 }}>
                    <Divider
                        orientation="vertical"
                        sx={{
                            color: '#D9D9D9',
                        }}
                    />
                </Grid2>

                <Grid2 item size={{ xs: 12, md: 7.5 }}>
                    <Stack
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            textAlign: 'left',
                            alignItems: 'center',
                            height: 40,
                            // mb: 1,
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {t('Common.SelectService')}
                        </Typography>

                        {showCheckbox && (
                            <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', p: 0 }}>
                                <CustomCheckbox
                                    // label={t("Services.ShowPopMsg")}
                                    checked={formik.values.need_customer_info}
                                    name="need_customer_info"
                                    value={formik.values.need_customer_info}
                                    onChange={(e) =>
                                        formik.setFieldValue('need_customer_info', !formik.values.need_customer_info)
                                    }
                                />
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Calendar.SendFormToCust')}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>

                    {/* <Box sx={{ height: '400px', overflowY: 'auto', overflowX: 'visible', position: 'relative' }}>  */}
                    {/* changed from fields to cardValues because of instant re render (fields was not re rendering) */}
                    {cardValues.map((card, index) => (
                        <Card
                            key={card.id || index}
                            sx={{
                                width: '100%',
                                borderRadius: '15px',
                                my: 1,
                                position: 'relative',
                                overflow: 'visible',
                                zIndex: 1000,
                                filter: 'drop-shadow(0px 1px 7px #00000040)',
                            }}
                        >
                            {card?.isSpecial && (
                                <Stack
                                    sx={{
                                        pr: 4,
                                        pl: 2,
                                        py: 1,
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    {t('SpOffers.SpOffer')}
                                    <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            sx={{ fontWeight: 700, textDecoration: 'line-through', color: '#fe0000ff' }}
                                        >
                                            <BlurPrice>{card?.originalPrice}</BlurPrice>
                                        </Typography>
                                        <Typography>
                                            <BlurPrice>{card?.price}</BlurPrice>
                                        </Typography>
                                    </Stack>
                                </Stack>
                            )}
                            {index !== 0 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -10,
                                        right: -10,
                                        zIndex: 1000,
                                    }}
                                >
                                    <IconButton
                                        disableFocusRipple
                                        disableTouchRipple
                                        disableRipple
                                        onClick={async () => {
                                            await HandleBooking.handleCardRemoval(
                                                index,
                                                cardValues,
                                                setCardValues,
                                                setValue,
                                                remove,
                                            );
                                        }}
                                        aria-label="remove card"
                                        sx={{
                                            padding: '4px',
                                            borderRadius: '50%',
                                            bgcolor: '#DC0000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Close sx={{ color: '#fff', fontSize: 20 }} />
                                    </IconButton>
                                </Box>
                            )}

                            <CardContent>
                                <Grid2 container spacing={1}>
                                    <Grid2 item size={{ xs: 8 }}>
                                        <Autocomplete
                                            disabled={!formik.values.date}
                                            popupIcon={
                                                <KeyboardArrowDownIcon
                                                    style={{
                                                        color: !formik.values.date ? '#d0d0d0' : 'black',
                                                    }}
                                                />
                                            }
                                            value={cardValues[index]?.selectedService || null}
                                            options={allServices} // Ensure options are correctly passed
                                            getOptionLabel={(option) => option.name}
                                            groupBy={(option) => option.group}
                                            fullWidth
                                            onChange={(event, newValue) =>
                                                HandleBooking.handleServiceChange(
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
                                                )
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder={
                                                        loading?.serviceApi
                                                            ? `${t('Common.Loading')}...`
                                                            : `${t('Calendar.SearchSer')}...`
                                                    }
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        height: 40,
                                                        fontSize: '0.85rem',
                                                        borderRadius: '13px',
                                                        border: `1px solid #D9D9D9`,
                                                        '& .MuiInputBase-root': {
                                                            padding: '5px',
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            color: '#545454',
                                                            fontSize: '15px',
                                                            fontWeight: 400,
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            border: 'none',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#D9D9D9',
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#D9D9D9',
                                                        },
                                                        '& .MuiAutocomplete-popupIndicator': {
                                                            color: '#000',
                                                        },
                                                        width: '100%',
                                                        '& .MuiInputBase-input::placeholder': {
                                                            color: '#A0A0A0',
                                                            fontSize: '14px',
                                                            fontWeight: 400,
                                                        },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <>
                                                    <li
                                                        {...props}
                                                        key={option.id || index}
                                                        value={option.id}
                                                        style={{ padding: '4px 12px', lineHeight: '1.2' }}
                                                    >
                                                        <Typography variant="body1" color="#545454">
                                                            {option.name}
                                                        </Typography>
                                                    </li>
                                                    <Divider sx={{ margin: '4px 0' }} />
                                                </>
                                            )}
                                            renderNoOptions={(props) => (
                                                <Box {...props} sx={{ padding: 1 }}>
                                                    <Typography variant="body1" color="error" align="center">
                                                        {t('SpOffers.NoRes')}
                                                    </Typography>
                                                </Box>
                                            )}
                                            renderGroup={(params) => (
                                                <li>
                                                    <ListSubheader
                                                        component="div"
                                                        sx={{
                                                            fontWeight: '700',
                                                            fontSize: '18px',
                                                            color: '#1F1F1F',
                                                            '&.Mui-disabled': {
                                                                color: '#1F1F1F',
                                                            },
                                                            position: 'relative',
                                                            padding: '4px 12px',
                                                            lineHeight: '1.2',
                                                        }}
                                                    >
                                                        {params.group}
                                                    </ListSubheader>
                                                    <Divider sx={{ margin: '4px 0' }} />
                                                    {params.children}
                                                </li>
                                            )}
                                            clearIcon={false}
                                        />
                                        {errors[index]?.selectedService && (
                                            <Tooltip title={errors[index]?.selectedService} placement="top" arrow>
                                                {' '}
                                                <Typography
                                                    noWrap
                                                    style={{
                                                        color: 'red',
                                                        variant: 'caption',
                                                        fontSize: '11px',
                                                    }}
                                                >
                                                    {errors[index]?.selectedService}
                                                </Typography>
                                            </Tooltip>
                                        )}
                                    </Grid2>

                                    <Grid2 item size={{ xs: 4 }}>
                                        <FSelect
                                            useNativeSelect={true}
                                            id={`duration_min_${index}`}
                                            options={cardValues[index]?.durationList || []}
                                            value={cardValues[index]?.duration_min || ''}
                                            onChange={(e) =>
                                                HandleBooking.handleDurationChange(
                                                    index,
                                                    e?.target?.value,
                                                    setValue,
                                                    setCardValues,
                                                    cardValues,
                                                )
                                            }
                                            placeholder={t('Common.Duration')}
                                            sx={{
                                                width: '100%',
                                                color: disabledCondition({ index }) && '#d2d2d2',
                                                bgcolor: disabledCondition({ index }) && '#d2d2d2',
                                            }}
                                            borderColor="#D9D9D9"
                                            borderThickness="1px"
                                            noLabel
                                            disabled={
                                                !cardValues[index]?.selectedService || disabledCondition({ index })
                                            }
                                        />
                                        {errors[index]?.duration_min && (
                                            <Tooltip title={errors[index]?.duration_min} placement="top" arrow>
                                                {' '}
                                                <Typography
                                                    noWrap
                                                    style={{
                                                        color: 'red',
                                                        variant: 'caption',
                                                        fontSize: '11px',
                                                    }}
                                                >
                                                    {errors[index]?.duration_min}
                                                </Typography>{' '}
                                            </Tooltip>
                                        )}
                                    </Grid2>
                                </Grid2>

                                <Grid2 container spacing={1}>
                                    <Grid2 item size={{ xs: 3.5 }}>
                                        <BlurPrice>
                                            <Stack
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <CustomTextField
                                                    value={cardValues[index]?.price || ''}
                                                    disabled={
                                                        blurPrices ||
                                                        !cardValues[index]?.selectedService ||
                                                        !cardValues[index]?.duration_min ||
                                                        disabledCondition({ index })
                                                    }
                                                    onChange={(e) => {
                                                        HandleBooking.handlePriceChange(
                                                            index,
                                                            e.target.value,
                                                            setValue,
                                                            setCardValues,
                                                            cardValues,
                                                        );
                                                    }}
                                                    placeholder={'0.00'}
                                                    sx={{
                                                        color: disabledCondition({ index }) && '#d2d2d2',
                                                        bgcolor: disabledCondition({ index }) && '#d2d2d2',
                                                    }}
                                                    id={`price_${index}`}
                                                    name={`price_${index}`}
                                                    width={'60%'}
                                                    borderRadius={{
                                                        topLeft: '15px',
                                                        topRight: '0px',
                                                        bottomLeft: '15px',
                                                        bottomRight: '0px',
                                                    }}
                                                />
                                                <Box
                                                    sx={{
                                                        width: '40%',
                                                        height: 42,
                                                        backgroundColor: '#D9D9D9',
                                                        color: 'black',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderRadius: '0px 15px 15px 0px',
                                                        mt: 1.5,
                                                    }}
                                                >
                                                    <Typography>kr.</Typography>
                                                </Box>
                                            </Stack>
                                        </BlurPrice>
                                        {errors[index]?.price && (
                                            <Tooltip title={errors[index]?.price} placement="top" arrow>
                                                {' '}
                                                <Typography
                                                    noWrap
                                                    style={{
                                                        color: 'red',
                                                        variant: 'caption',
                                                        fontSize: '11px',
                                                    }}
                                                >
                                                    {errors[index]?.price}
                                                </Typography>{' '}
                                            </Tooltip>
                                        )}
                                    </Grid2>

                                    <Grid2 item size={{ xs: 5 }}>
                                        <Autocomplete
                                            disabled={
                                                !cardValues[index]?.selectedService ||
                                                (!cardValues[index]?.duration_min && !disabledCondition({ index }))
                                            }
                                            options={cardValues[index]?.employeeList || []}
                                            value={cardValues[index]?.selectedEmployee || null}
                                            onChange={(event, newValue) =>
                                                HandleBooking.handleEmployeeChange(
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
                                                )
                                            }
                                            getOptionLabel={(option) => option.name || ''}
                                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                                            fullWidth
                                            popupIcon={
                                                <KeyboardArrowDownIcon
                                                    style={{
                                                        color:
                                                            !cardValues[index]?.selectedService ||
                                                            !cardValues[index]?.duration_min
                                                                ? '#d0d0d0'
                                                                : 'black',
                                                    }}
                                                />
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder={t('Common.SelectEmployee')}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        mt: 1.7,
                                                        height: 40,
                                                        fontSize: '0.85rem',
                                                        borderRadius: '13px',
                                                        border: `1px solid #D9D9D9`,
                                                        '& .MuiInputBase-root': { padding: '5px' },
                                                        '& .MuiInputBase-input': {
                                                            color: '#545454',
                                                            fontSize: '14px',
                                                            fontWeight: 400,
                                                        },
                                                        '& .MuiInputBase-input::placeholder': {
                                                            fontSize: '14px',
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            border: 'none',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#D9D9D9',
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#D9D9D9',
                                                        },
                                                        '& .MuiAutocomplete-popupIndicator': {
                                                            color: '#000',
                                                        },
                                                    }}
                                                    onFocus={(event) => {
                                                        event.stopPropagation();
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <MenuItem
                                                    {...props}
                                                    value={option.id}
                                                    sx={{
                                                        color: '#545454',
                                                        fontSize: '15px',
                                                        fontWeight: 400,
                                                        '&:hover': { backgroundColor: '#f5f5f5' },
                                                    }}
                                                >
                                                    {option.name}
                                                </MenuItem>
                                            )}
                                            noOptionsText={t('Calendar.NOemp')}
                                            disableClearable
                                        />
                                        {errors[index]?.selectedEmployee && (
                                            <Tooltip title={errors[index]?.selectedEmployee} placement="top" arrow>
                                                {' '}
                                                <Typography
                                                    noWrap
                                                    style={{
                                                        color: 'red',
                                                        variant: 'caption',
                                                        fontSize: '11px',
                                                    }}
                                                >
                                                    {errors[index]?.selectedEmployee}
                                                </Typography>{' '}
                                            </Tooltip>
                                        )}
                                    </Grid2>

                                    <Grid2 item size={{ xs: 3.5 }}>
                                        <FSelect
                                            useNativeSelect={true}
                                            disabled={
                                                !cardValues[index]?.selectedService ||
                                                !cardValues[index]?.duration_min ||
                                                !cardValues[index]?.selectedEmployee ||
                                                disabledCondition({ index })
                                            }
                                            value={cardValues[index]?.available_time}
                                            onChange={(e) =>
                                                HandleBooking.handleBookingTimeChange(
                                                    index,
                                                    e?.target?.value,
                                                    setValue,
                                                    setCardValues,
                                                    cardValues,
                                                    toast,
                                                    t,
                                                    tempId,
                                                    setting,
                                                )
                                            }
                                            placeholderText={
                                                loading.timeSlotApi[index] ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {' '}
                                                        {t('Calendar.BkTime')}
                                                    </Typography>
                                                )
                                            }
                                            options={cardValues[index]?.availableTimeSlots}
                                            sx={{
                                                minWidth: '100%',
                                                color: disabledCondition({ index }) && '#d2d2d2',
                                                bgcolor: disabledCondition({ index }) && '#d2d2d2',
                                                width: '100%',
                                                mt: 1.7,
                                            }}
                                            borderColor="#D9D9D9"
                                            borderThickness="1px"
                                            autoScrollToValue={scrollToTime[index]}
                                            storeId={setting?.profile?.id}
                                        />
                                        {errors[index]?.available_time && (
                                            <Tooltip title={errors[index]?.available_time} placement="top" arrow>
                                                {' '}
                                                <Typography
                                                    noWrap
                                                    style={{
                                                        color: 'red',
                                                        variant: 'caption',
                                                        fontSize: '11px',
                                                    }}
                                                >
                                                    {errors[index]?.available_time}
                                                </Typography>{' '}
                                            </Tooltip>
                                        )}
                                    </Grid2>
                                </Grid2>
                            </CardContent>
                        </Card>
                    ))}

                    <FButton
                        disabled={loading?.waiting}
                        onClick={() => addCard()}
                        title={
                            loading?.waiting ? (
                                <CircularProgress color="inherit" size={20} />
                            ) : (
                                `+ ${t('Calendar.AddExServ')}`
                            )
                        }
                        titleColor={'black'}
                        titleWeight={1}
                        variant={'save'}
                        border={'1px dashed black'}
                        sx={{
                            width: '100%',
                            color: 'white',
                            borderRadius: 2,
                            backgroundColor: 'white',
                            mb: 2,
                        }}
                    />

                    {isInspectionEnabled &&
                        (isInspectionCostLoading ||
                            formik?.values?.inspection_data?.chargesData?.travelFees ||
                            (rescheduleProps?.inspection_data?.chargesData?.travelFees &&
                                !isInspectionCostLoading)) && (
                            <Card
                                sx={{
                                    p: 1.5, // Reduced padding
                                    width: '100%',
                                    border: '1px solid #D9D9D9',
                                    borderRadius: 3,
                                    mb: 1, // Reduced bottom margin
                                }}
                            >
                                {isInspectionCostLoading ? (
                                    <Stack
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{ minHeight: 80 }}
                                    >
                                        <CircularProgress size={24} />
                                        <Typography variant="body2" color="text.secondary">
                                            {t('Calendar.CalculatingCharges')}
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Stack spacing={0.5}>
                                        {' '}
                                        {/* Tight spacing */}
                                        {/* Travel Fees */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2" color="text.secondary">
                                                {t('Calendar.TravelFees')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                <BlurPrice>
                                                    {formatCurrency(
                                                        formik?.values?.inspection_data?.chargesData?.travelFees ||
                                                            rescheduleProps?.inspection_data?.chargesData?.travelFees,
                                                    ) || 0}
                                                </BlurPrice>
                                            </Typography>
                                        </Stack>
                                        {/* Bridge Fees */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2" color="text.secondary">
                                                {t('Calendar.BridgeFees')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                <BlurPrice>
                                                    {formatCurrency(
                                                        formik?.values?.inspection_data?.chargesData?.bridgeFees ||
                                                            rescheduleProps?.inspection_data?.chargesData?.bridgeFees ||
                                                            0,
                                                    ) || 0}
                                                </BlurPrice>
                                            </Typography>
                                        </Stack>
                                        {/* Total Charges Line - Emphasized */}
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            mt={0.5}
                                            pt={0.5} // Use padding top here to lift the separator line
                                            borderTop="1px solid #EAEAEA" // Lighter separator
                                        >
                                            <Typography variant="body1" fontWeight="bold">
                                                {t('Calendar.TotalCharges')}
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold" color="primary.main">
                                                <BlurPrice>
                                                    {formatCurrency(
                                                        formik?.values?.inspection_data?.totalCharges ||
                                                            rescheduleProps?.inspection_data?.totalCharges,
                                                    ) || 0}
                                                </BlurPrice>
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                )}
                            </Card>
                        )}

                    {/* Distance Card */}
                    {isInspectionEnabled &&
                        (formik?.values?.inspection_data?.totalDistance ||
                            rescheduleProps?.inspection_data?.totalDistance) && (
                            <Card
                                sx={{
                                    p: 1, // Even more reduced padding for minimal footprint
                                    width: '100%',
                                    border: '1px solid #D9D9D9',
                                    borderRadius: 3,
                                    mb: 1, // Reduced bottom margin
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        {t('Calendar.TotalDistance')}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {distanceFormat(
                                            formik?.values?.inspection_data?.totalDistance ||
                                                rescheduleProps?.inspection_data?.totalDistance ||
                                                0,
                                        )}{' '}
                                        {t('Setting.Km')}
                                    </Typography>
                                </Stack>
                            </Card>
                        )}

                    {/* </Box> */}

                    <Box sx={{ marginTop: 'auto' }}>
                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: { xs: 0, sm: 0 },
                                mb: 1,
                            }}
                        >
                            <Typography variant="body1">
                                <BlurPrice>{`${t('Common.Total')} : ${formattedTotalAmount}`}</BlurPrice>
                            </Typography>

                            <Stack
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <img
                                    src={ClockIcon}
                                    alt="clock"
                                    style={{ height: '20px', width: '20px', marginRight: 5 }}
                                />
                                <Typography variant="body1">{formattedString}</Typography>
                            </Stack>
                        </Stack>

                        <Divider
                            sx={{
                                borderWidth: 0.5,
                                borderColor: '#696969',
                                mx: { xs: 0, sm: 0 },
                                mb: 2,
                            }}
                        />

                        <Box
                            sx={{
                                marginTop: 'auto',
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: { xs: 'center', md: 'space-between' },
                                gap: { xs: 2, md: 3 },
                                px: { xs: 0, md: 0 },
                                width: '100%',
                            }}
                        >
                            <CommonButton
                                height={40}
                                title={t('Setting.Cancel')}
                                backgroundColor={'#D9D9D9'}
                                style={{
                                    minWidth: { xs: '100%', md: 150 },
                                    width: { xs: '100%', md: 'auto' },
                                }}
                                onClick={() => closeForm()}
                            />

                            <CommonButton
                                type="submit"
                                height={40}
                                title={
                                    <Typography noWrap fontWeight={500} variant="body1">
                                        {renderButtonText()}{' '}
                                    </Typography>
                                }
                                // title={rescheduleProps ? t("Customer.SaveCh") : t("Calendar.CreBook")}
                                // backgroundColor={(cardValues.some(card => !card.selectedService || !card.duration_min || !card.selectedEmployee || !card.available_time || !card.price) || cardValues.length === 0) ? '#D9D9D9' : '#44B904'}
                                style={{
                                    minWidth: { xs: '100%', md: 180 },
                                    width: { xs: '100%', md: 'auto' },
                                }}
                                onClick={formik.handleSubmit}
                                // disabled={(cardValues.some(card => !card.selectedService || !card.duration_min || !card.selectedEmployee || !card.available_time || !card.price) || cardValues.length === 0)}
                            />
                        </Box>
                    </Box>
                </Grid2>
            </Grid2>

            {showCreateCustomerDialog && (
                <CreateCustomerForm
                    open={showCreateCustomerDialog}
                    props={customerProps}
                    closeForm={() => setShowCreateCustomerDialoge(false)}
                    setCustomer={setCustomer}
                />
            )}

            {formik.values.isBlocked && (
                <SaveModal
                    hideButton={true}
                    open={formik.values.isBlocked}
                    handleClose={() => formik.setFieldValue('isBlocked', false)}
                    onClickConfirm={() => formik.setFieldValue('isBlocked', false)}
                    title={t('Customer.BookingBlocked')}
                    ConfirmText={t('Customer.ButtonTitleOk')}
                    description={t('Customer.BookingBlockedDescription')}
                    ConfirmBg={'#44B904'}
                />
            )}
        </React.Fragment>
    );
}
