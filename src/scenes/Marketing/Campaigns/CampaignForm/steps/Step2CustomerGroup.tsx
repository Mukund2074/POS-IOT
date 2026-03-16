import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { t } from 'i18next';
import { useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { updateStepData, setCurrentStep, getStepValidationStatus } from '@/redux/slices/Marketing/campaigns';
import { getApi } from '@/shared/api';
import { GetApiCustomerGroupsCampaignType, type GetApiCustomerGroups200GroupsItem } from '@/shared/api/models';
import {
    RadixAccordion,
    RadixAccordionGroup,
    RadixDatePicker,
    RadixCheckbox,
    RadixSelect,
    RadixRadio,
    RadixRadioGroup,
} from '@/components/radix';
import PeopleIcon from '@/assets/Marketing/CustomerGroup.svg';
import CustomerGroupIconActive from '@/assets/Marketing/CustomerGroupActive.svg';
import CheckIcon from '@/assets/Marketing/Check.svg';
import WarningIcon from '@/assets/Marketing/Warning.svg';
// @ts-ignore
import { GetServiceGroup } from '@/utils/Api/Service';
import { Service, ServiceGroup } from '@/scenes/PunchCard/PAGES/punch-card/Types/punch-card-api.types';
import { formatDateToISO } from '@/utils/dateFormatter';
import InfoDarkIcon from '@/assets/Marketing/infoDark.svg';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { cnMerge } from '@/utils/cnMerge';
import {
    ALL_CUSTOMERS_GROUP_ID,
    CampaignData,
    CampaignState,
    SelectedGroup,
} from '@/redux/slices/Marketing/campaigns/campaignsSlice';
import { BOOKING_VALIDATION_SCHEMA } from '@/redux/slices/Marketing/campaigns';

interface Step2CustomerGroupProps {
    readonly?: boolean;
    isCurrentStep?: boolean;
    isDisabled?: boolean;
    forceOpen?: boolean;
}

export default function Step2CustomerGroup({
    readonly = false,
    isCurrentStep = false,
    isDisabled = false,
    forceOpen = false,
}: Step2CustomerGroupProps) {
    const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
    const [openTreatmentGroup, setOpenTreatmentGroup] = useState<string | undefined>(undefined);
    const dispatch = useDispatch();
    const step2Data = useSelector((state: any) => state.campaigns.campaignData.step2 as CampaignData['step2']);
    const editingCampaignId = useSelector((state: any) => state.campaigns.editingCampaignId);
    const isEditing = Boolean(editingCampaignId);
    const settings = useSelector((state: any) => state?.settings?.data);
    const user = useSelector((state: any) => state?.data?.user || state?.user?.data);

    const summary = useSelector((state: any) => state?.campaigns) as CampaignState;
    const stepStatus = getStepValidationStatus(summary.campaignData, summary.campaignType);
    const step2Valid = stepStatus.step2;
    const serviceIds = step2Data.filters?.treatments;

    const idSet = new Set(serviceIds?.map(Number));
    const location = useLocation();

    const filteredServices =
        summary?.campaignData?.step2?.serviceGroups
            ?.flatMap((group: any) => group?.services || [])
            .filter((service: any) => idSet.has(service.id))
            .map((service: any) => ({
                id: service.id,
                name: service.name,
            })) || [];

    const [expanded, setExpanded] = useState(false);
    const visibleServices = expanded ? filteredServices : filteredServices.slice(0, 2);
    // 2×2 radio flow: group1 = who (all | consent), group2 = segment (customerGroup | booking)
    const selectedGroupsFromRedux = step2Data.selectedGroups;
    const hasBooking = selectedGroupsFromRedux?.includes('BOOKING');
    const customerGroupIdentifiers = selectedGroupsFromRedux?.filter(
        (g) => g !== 'WITHOUT_CONSENT' && g !== 'BOOKING' && g !== 'ACTIVE' && g !== 'ALL_WITH_CONSENT',
    );

    // Initial state without customerGroupsData (avoid "before initialization"). Sync effect maps names→UUID when data loads.
    const initialGroup1 = selectedGroupsFromRedux?.includes('ALL_WITH_CONSENT')
        ? 'ALL_WITH_CONSENT'
        : 'WITHOUT_CONSENT';
    const initialGroup2: SelectedGroup | null = hasBooking
        ? 'BOOKING'
        : customerGroupIdentifiers && customerGroupIdentifiers.length > 0
          ? 'CUSTOMER_GROUP'
          : null;
    // Use names (fieldValue from API) for select value

    const [group1Value, setGroup1Value] = useState<SelectedGroup>(initialGroup1);
    const [group2Value, setGroup2Value] = useState<SelectedGroup | null>(initialGroup2);
    const [option2SelectedGroup, setOption2SelectedGroup] = useState<string>(step2Data.customerGroupName || '');
    const [allCustomersCount, setAllCustomersCount] = useState<number>(0);
    const url = new URL(window.location.href);
    const campaignType = url.pathname?.startsWith('/marketing/email-campaigns')
        ? GetApiCustomerGroupsCampaignType.EMAIL
        : GetApiCustomerGroupsCampaignType.SMS;
    // All customers → consent true; Consent (mixed) or default → consent false (show count on All customer)
    const consentParam = group1Value === 'ALL_WITH_CONSENT' ? true : undefined;

    const { data: customerGroupsData, isLoading: isCustomerGroupsLoading } = useQuery({
        queryKey: ['customer-groups', consentParam, campaignType],
        queryFn: () => getApi().getApiCustomerGroups({ consent: consentParam, campaignType }),
    });

    const customerGroupOptions = useMemo(() => {
        const options = [];

        if (customerGroupsData?.groups) {
            setAllCustomersCount(
                customerGroupsData.groups.find(
                    (g: GetApiCustomerGroups200GroupsItem) => g.id === ALL_CUSTOMERS_GROUP_ID,
                )?.customerCount || 0,
            );
            const apiGroups = customerGroupsData.groups
                .filter(
                    (group: GetApiCustomerGroups200GroupsItem) => group.isActive && group.id !== ALL_CUSTOMERS_GROUP_ID,
                )
                .map((group: GetApiCustomerGroups200GroupsItem) => {
                    const title = `${group.name} (${group.customerCount || 0})`;
                    const description = group.description || '';
                    return {
                        value: group.name,
                        label: title,
                        description,
                    };
                });
            options.push(...apiGroups);
        }

        return options;
    }, [customerGroupsData]);

    // New campaign only: default to "All customers" when no selection in Redux. Edit mode: use API/Redux values only.
    useEffect(() => {
        if (isEditing || readonly) return;
        const groups =
            typeof step2Data.selectedGroups === 'string' ? [step2Data.selectedGroups] : step2Data.selectedGroups || [];
        if (groups.length === 0) {
            setGroup1Value('ALL_WITH_CONSENT');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Check if serviceGroups already exist in Redux to avoid unnecessary API calls
        if (step2Data.serviceGroups && step2Data.serviceGroups.length > 0) {
            setServiceGroups(step2Data.serviceGroups);
            return;
        }

        const fetchServiceGroups = async () => {
            try {
                const response = await GetServiceGroup();
                const groups = response?.data?.data || [];
                setServiceGroups(groups);
                // Store service groups in Redux for use in mobile preview
                dispatch(
                    updateStepData({
                        step: 'step2',
                        data: { serviceGroups: groups },
                    }),
                );
            } catch (error) {
                console.error('Error fetching service groups:', error);
                setServiceGroups([]);
            }
        };
        fetchServiceGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get logged-in employee ID from Redux state or localStorage
    const loggedInEmployeeId = useMemo(() => {
        return user?.id || localStorage.getItem('employee_id') || null;
    }, [user]);

    // Group 1 (required): one of ALL_WITH_CONSENT | WITHOUT_CONSENT.
    // Group 2 (optional): CUSTOMER_GROUP (with name) or BOOKING. selectedGroups = [group1] or [group1, segment].
    const selectedGroups: string[] = useMemo(() => {
        if (!group1Value) return [];

        if (group2Value === 'BOOKING') {
            return [group1Value, 'BOOKING'];
        }

        if (group2Value === 'CUSTOMER_GROUP') {
            return [group1Value, option2SelectedGroup];
        }

        return [group1Value];
    }, [group1Value, group2Value, option2SelectedGroup]);

    const selectedGroup = selectedGroups.length > 0 ? selectedGroups[0] : null;

    const showFilters = group2Value === 'BOOKING';

    // Initialize filters with default employee if not already set
    const initialFilters = useMemo(() => {
        const filters = step2Data.filters || { treatments: [] };
        // Set default employee if not already set and we have a logged-in employee
        if (!filters.employee && loggedInEmployeeId) {
            return { ...filters, employee: String(loggedInEmployeeId) };
        }
        return filters;
    }, [step2Data.filters, loggedInEmployeeId]);

    const [filters, setFilters] = useState(initialFilters);
    const [selectedTreatments, setSelectedTreatments] = useState<string[]>(step2Data.filters?.treatments || []);

    // Flatten all services from all groups for easier access
    const allServices = useMemo(() => {
        return serviceGroups.flatMap((group) =>
            (group.services || []).map((service) => ({
                ...service,
                groupId: group.id,
                groupName: group.group,
            })),
        );
    }, [serviceGroups]);

    // Get employee options from settings
    const employeeOptions = useMemo(() => {
        if (settings?.employees && settings.employees.length > 0) {
            return settings.employees.map((employee: any) => ({
                value: String(employee.id),
                label: employee.name,
            }));
        }
        return [];
    }, [settings?.employees]);

    // Memoize the filters object to prevent unnecessary updates
    const filtersToSave = useMemo(
        () => ({
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            employee: filters.employee,
            treatments: selectedTreatments,
        }),
        [filters.fromDate, filters.toDate, filters.employee, selectedTreatments],
    );

    // Set default employee when logged-in employee becomes available and employee options are loaded
    useEffect(() => {
        if (loggedInEmployeeId && employeeOptions.length > 0 && (!filters.employee || filters.employee === '')) {
            // Check if the logged-in employee exists in the options
            const employeeExists = employeeOptions.some((emp: any) => String(emp.value) === String(loggedInEmployeeId));
            if (employeeExists) {
                setFilters((prev: any) => ({ ...prev, employee: String(loggedInEmployeeId) }));
            }
        }
    }, [loggedInEmployeeId, employeeOptions, filters.employee]);

    const customerGroupNames = useMemo(() => {
        const mapping: string[] = [];
        if (customerGroupsData?.groups && option2SelectedGroup && group2Value === 'CUSTOMER_GROUP') {
            const found = customerGroupsData.groups.find(
                (g: GetApiCustomerGroups200GroupsItem) => g.id === option2SelectedGroup,
            );
            if (found) mapping.push(found.name);
        }
        return mapping;
    }, [customerGroupsData, option2SelectedGroup, group2Value]);

    // Update Redux store in real-time. group2Value used by footer for validation (customer group required when selected).
    useEffect(() => {
        if (!readonly) {
            dispatch(
                updateStepData({
                    step: 'step2',
                    data: {
                        selectedGroup,
                        selectedGroups: selectedGroups as string[],
                        group2Value: group2Value ?? null,
                        customerGroupName: group2Value === 'CUSTOMER_GROUP' ? option2SelectedGroup || '' : '',
                        filters: filtersToSave,
                        customerGroupNames,
                    },
                }),
            );
        }
    }, [
        selectedGroup,
        selectedGroups,
        group2Value,
        option2SelectedGroup,
        filtersToSave,
        customerGroupNames,
        dispatch,
        readonly,
    ]);

    const handleGroup2Change = (value: SelectedGroup | null) => {
        setGroup2Value(value);
        if (value !== 'BOOKING') {
            bookingFormik.setErrors({});
            bookingFormik.setTouched({});
        }

        if (value !== 'CUSTOMER_GROUP') {
            handleOption2Change('');
        }
    };

    /** Toggle Group 2 option: select segment if not selected, deselect if already selected (used for 2.1 Customer group & 2.2 Booking interval). */
    const toggleGroup2 = (segment: SelectedGroup) => {
        if (readonly) return;
        if (group2Value === segment) {
            handleGroup2Change(null);
            if (segment === 'CUSTOMER_GROUP') {
                setOption2SelectedGroup('');
            } else if (segment === 'BOOKING') {
                setFilters({
                    fromDate: '',
                    toDate: '',
                    employee: String(loggedInEmployeeId),
                    treatments: [],
                });
            }
        } else {
            handleGroup2Change(segment);
        }
    };

    const handleOption2Change = (value: string) => {
        setOption2SelectedGroup(value);
    };

    // Formik form for booking filters
    const bookingFormik = useFormik({
        initialValues: {
            fromDate: filters.fromDate || '',
            toDate: filters.toDate || '',
            employee: filters.employee || '',
            treatments: selectedTreatments || [],
        },
        validationSchema: group2Value === 'BOOKING' ? BOOKING_VALIDATION_SCHEMA : undefined,
        enableReinitialize: true,
        validateOnChange: group2Value === 'BOOKING',
        validateOnBlur: group2Value === 'BOOKING',
        validateOnMount: false,
        onSubmit: () => {
            // Validation handled in footer component
        },
    });

    // Update validation when group2 is booking
    useEffect(() => {
        if (group2Value === 'BOOKING') {
            bookingFormik.validateForm();
        } else {
            bookingFormik.setErrors({});
            bookingFormik.setTouched({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group2Value]);

    useEffect(() => {
        if (step2Data.validationErrors && group2Value === 'BOOKING') {
            bookingFormik.setErrors(step2Data.validationErrors);
            const touchedFields: Record<string, boolean> = {};
            Object.keys(step2Data.validationErrors).forEach((key) => {
                touchedFields[key] = true;
            });
            bookingFormik.setTouched(touchedFields);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step2Data.validationErrors, group2Value]);

    // Autofill from Redux: group1 always; group2 only when we have a second segment (BOOKING or customer group name).
    useEffect(() => {
        const selectedGroupsFromRedux =
            typeof step2Data.selectedGroups === 'string' ? [step2Data.selectedGroups] : step2Data.selectedGroups || [];
        const hasBooking = selectedGroupsFromRedux.includes('BOOKING');
        const customerGroupIdentifiers = selectedGroupsFromRedux.filter(
            (g) => g !== 'WITHOUT_CONSENT' && g !== 'BOOKING' && g !== 'ACTIVE' && g !== 'ALL_WITH_CONSENT',
        );
        const hasGroup2 = selectedGroupsFromRedux.length >= 2 || customerGroupIdentifiers.length > 0;

        if (selectedGroupsFromRedux.length >= 1) {
            setGroup1Value(initialGroup1);
            setGroup2Value(hasGroup2 ? (hasBooking ? 'BOOKING' : 'CUSTOMER_GROUP') : null);
        }
        if (customerGroupIdentifiers.length > 0 && step2Data.customerGroupName) {
            setOption2SelectedGroup(step2Data.customerGroupName);
        }
        if (step2Data.filters) {
            setFilters(step2Data.filters);
            if (step2Data.filters.treatments) {
                setSelectedTreatments(step2Data.filters.treatments);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step2Data.selectedGroups, step2Data.filters, step2Data.customerGroupName, customerGroupsData]);

    useEffect(() => {
        if (group2Value === 'BOOKING') {
            setFilters({
                fromDate: bookingFormik.values.fromDate,
                toDate: bookingFormik.values.toDate,
                employee: bookingFormik.values.employee,
            });
            setSelectedTreatments(bookingFormik.values.treatments);
        }
    }, [bookingFormik.values, group2Value]);

    // Use service groups directly from API
    const groupedServices = useMemo(() => {
        return serviceGroups.map((group: ServiceGroup) => ({
            groupId: String(group.id || 0),
            groupName: group.group || 'Ungrouped services',
            services: group.services || [],
        }));
    }, [serviceGroups]);

    // Determine if accordion should be open based on URL hash
    // In readonly mode: always open
    // In step mode: only open if hash matches this step
    const hashMatches = location?.hash === '#step2';
    const shouldBeOpen = readonly ? true : hashMatches || forceOpen;
    const shouldBeDisabled = readonly;

    const shouldShowOption = (option: SelectedGroup) => {
        if (readonly) {
            if (option === 'ALL_WITH_CONSENT' || option === 'WITHOUT_CONSENT') {
                return group1Value === option;
            }
            if (option === 'CUSTOMER_GROUP' || option === 'BOOKING') {
                return group2Value === option;
            }
            return false;
        }
        return true;
    };

    return (
        <RadixAccordion
            hideIcon={readonly}
            key={`step2-${location?.hash}`}
            value="step2"
            disabled={shouldBeDisabled}
            open={shouldBeOpen}
            onChange={(open) => {
                // Only handle opening - closing is handled by hash change
                if (!readonly && open) {
                    dispatch(setCurrentStep(2));
                }
            }}
            triggerClassName={cnMerge(readonly && '!opacity-100 cursor-default')}
            titleClassName="w-full pr-4"
            title={
                <div className="flex items-center gap-3 justify-between w-full">
                    <span className="flex items-center gap-3 ">
                        <img
                            src={location?.hash === '#step2' || readonly ? CustomerGroupIconActive : PeopleIcon}
                            alt="People Icon"
                            className="h-5 shrink-0"
                        />
                        <span className="text-lg capitalize m-0">{t('POS.CustomerGroup')}</span>
                    </span>
                    {!readonly && (
                        <img
                            src={step2Valid ? CheckIcon : WarningIcon}
                            alt=""
                            className={cnMerge(
                                'h-5 w-5 shrink-0',
                                step2Valid
                                    ? 'opacity-100 [filter:invert(48%)_sepia(79%)_saturate(2476%)_hue-rotate(86deg)]'
                                    : 'opacity-80',
                            )}
                            aria-hidden
                        />
                    )}
                </div>
            }
        >
            <div className="space-y-4 mb-6">
                <RadixRadioGroup
                    value={group1Value}
                    onValueChange={(value) => !readonly && setGroup1Value(value as SelectedGroup)}
                    className="flex flex-col border-[1px] border-border-default border-solid  p-2 md:p-4 rounded-md w-full "
                    disabled={readonly}
                >
                    <span className="border-0 border-b-[1px] border-border-default border-solid px-2 pb-2">
                        <h3 className="text-lg font-medium text-text-primary m-0 ">
                            {t('Marketing.SelectAudienceType')}
                        </h3>
                    </span>
                    <div className="flex flex-col gap-2 md:pl-6 w-full md:w-fit">
                        {/* Option 1: All customers */}
                        {shouldShowOption('ALL_WITH_CONSENT') && (
                            <React.Fragment>
                                <div className="flex items-start gap-3">
                                    <RadixRadio value="ALL_WITH_CONSENT" className="mt-1 shrink-0" />
                                    <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => !readonly && setGroup1Value('ALL_WITH_CONSENT')}
                                        onKeyDown={(e) =>
                                            !readonly &&
                                            (e.key === 'Enter' || e.key === ' ') &&
                                            setGroup1Value('ALL_WITH_CONSENT')
                                        }
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <span className="block text-base text-text-primary font-medium">
                                            {t('Marketing.EmailCampaignsAllCustomers')}
                                            {allCustomersCount !== undefined && (
                                                <span className="font-normal text-text-secondary">
                                                    {' '}
                                                    ({allCustomersCount})
                                                </span>
                                            )}
                                        </span>
                                        <p className="text-sm text-text-secondary m-0 mt-1">
                                            {t('Marketing.EmailCampaignsSendToAllYourCustomersGivenConsent')}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-px bg-border-default" />
                            </React.Fragment>
                        )}

                        {/* Option 2: Consent */}
                        {shouldShowOption('WITHOUT_CONSENT') && (
                            <React.Fragment>
                                <div className="flex items-start gap-3">
                                    <RadixRadio value="WITHOUT_CONSENT" className="mt-1 shrink-0" />
                                    <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => !readonly && setGroup1Value('WITHOUT_CONSENT')}
                                        onKeyDown={(e) =>
                                            !readonly &&
                                            (e.key === 'Enter' || e.key === ' ') &&
                                            setGroup1Value('WITHOUT_CONSENT')
                                        }
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <span className="block text-base text-text-primary font-medium">
                                            {t('Marketing.EmailCampaignsCustomersWithAndWithoutConsent')}
                                        </span>
                                        <p className="text-sm text-text-secondary m-0 my-1">
                                            {t('Marketing.EmailCampaignsSendToAllCustomers')}
                                        </p>
                                    </div>
                                </div>
                                {group1Value === 'WITHOUT_CONSENT' && (
                                    <p className="text-sm text-red-500 md:max-w-[80%] m-0" role="alert">
                                        {t('Marketing.ConsentMixedAudienceWarning')}
                                    </p>
                                )}
                                {/* <div className="h-px bg-border-default" /> */}
                            </React.Fragment>
                        )}
                    </div>
                </RadixRadioGroup>

                <div className="flex flex-col border-[1px] border-border-default border-solid  p-2 md:p-4 rounded-md w-full ">
                    <span className="border-0 border-b-[1px] border-border-default border-solid px-2 pb-2">
                        <h3 className="text-lg font-medium text-text-primary m-0 ">
                            {t('Marketing.SelectCustomerGroup')} - {`(${t('Common.Optional')})`}
                        </h3>
                    </span>
                    <span className="flex flex-col gap-2 md:pl-6 w-full md:w-fit mt-4">
                        {/* Option 3: Customer group — RadixRadio standalone (no RadioGroup) */}
                        {shouldShowOption('CUSTOMER_GROUP') && (
                            <React.Fragment>
                                <div className="space-y-2">
                                    <div
                                        className={cnMerge('flex items-start gap-3', !readonly && 'cursor-pointer')}
                                        role="button"
                                        tabIndex={readonly ? -1 : 0}
                                        onClick={() => toggleGroup2('CUSTOMER_GROUP')}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                toggleGroup2('CUSTOMER_GROUP');
                                            }
                                        }}
                                        aria-pressed={group2Value === 'CUSTOMER_GROUP'}
                                        aria-label={t('Marketing.EmailCampaignsCustomerGroupOption')}
                                    >
                                        <RadixRadio
                                            value="CUSTOMER_GROUP"
                                            standalone
                                            checked={group2Value === 'CUSTOMER_GROUP'}
                                            disabled={readonly}
                                            className="mt-1 shrink-0"
                                        />
                                        <div
                                            className=""
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* <label className="flex items-center gap-2 text-sm font-medium text-text-primary ">
                                {t('Marketing.EmailCampaignsSelectCustomerGroup')}
                            </label> */}
                                            <RadixSelect
                                                isLoading={isCustomerGroupsLoading}
                                                placeholder={t('Marketing.EmailCampaignsPleaseSelectCustomerGroup')}
                                                value={option2SelectedGroup}
                                                onValueChange={handleOption2Change}
                                                options={customerGroupOptions}
                                                className="h-[36px] max-w-fit"
                                                disabled={readonly || isCustomerGroupsLoading}
                                                onPointerDown={() => {
                                                    if (group2Value !== 'CUSTOMER_GROUP') {
                                                        setGroup2Value('CUSTOMER_GROUP');
                                                    }
                                                }}
                                                triggerClassName={cnMerge(
                                                    'opacity-100',
                                                    group2Value !== 'CUSTOMER_GROUP' && 'opacity-50',
                                                )}
                                            />
                                            {step2Data.validationErrors?.customerGroup && (
                                                <p
                                                    className="text-xs text-error-500 mt-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    {step2Data.validationErrors.customerGroup}
                                                </p>
                                            )}
                                            {option2SelectedGroup && (
                                                <div
                                                    className="mt-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    {(() => {
                                                        const selectedOption = customerGroupOptions.find(
                                                            (opt) => opt.value === option2SelectedGroup,
                                                        );
                                                        return selectedOption?.description ? (
                                                            <div className="flex items-center gap-2">
                                                                <img
                                                                    src={InfoDarkIcon}
                                                                    alt="Info Icon"
                                                                    className="w-4 h-4"
                                                                />
                                                                <p className="text-xs text-text-secondary m-0">
                                                                    {selectedOption.description}
                                                                </p>
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-px bg-border-default mt-3" />
                            </React.Fragment>
                        )}

                        {/* Option 4: Booking interval — RadixRadio standalone (no RadioGroup) */}
                        {shouldShowOption('BOOKING') && (
                            <div
                                className={cnMerge('flex items-start gap-3 mt-2', !readonly && 'cursor-pointer')}
                                role="button"
                                tabIndex={readonly ? -1 : 0}
                                onClick={() => toggleGroup2('BOOKING')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleGroup2('BOOKING');
                                    }
                                }}
                                aria-pressed={group2Value === 'BOOKING'}
                                aria-label={t('Marketing.EmailCampaignsBookingIntervalOption')}
                            >
                                <RadixRadio
                                    value="BOOKING"
                                    standalone
                                    checked={group2Value === 'BOOKING'}
                                    disabled={readonly}
                                    className="mt-1 shrink-0"
                                    labelClass="text-base text-text-primary font-medium"
                                    itemClassName="!opacity-100"
                                />
                                <div className="flex flex-col items-start gap-1">
                                    <p className="text-base text-text-primary font-medium m-0">
                                        {t('Marketing.EmailCampaignsBookingIntervalOption')}
                                    </p>
                                    <p className="text-sm text-text-secondary m-0">
                                        {t('Marketing.EmailCampaignsBookingInChosenIntervals')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </span>
                </div>
            </div>

            {showFilters && (
                <div className="my-8 space-y-4">
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <RadixDatePicker
                                label={t('Marketing.FromDate')}
                                value={moment(bookingFormik.values.fromDate).toDate()}
                                onChange={(date) => {
                                    if (!readonly) {
                                        const dateStr = formatDateToISO(date);
                                        bookingFormik.setFieldValue('fromDate', dateStr);
                                    }
                                }}
                                disabled={readonly}
                                hideIcon={readonly}
                            />
                            {bookingFormik.touched.fromDate && bookingFormik.errors.fromDate && (
                                <p className="text-xs text-error-500 mt-1">
                                    {typeof bookingFormik.errors.fromDate === 'string'
                                        ? bookingFormik.errors.fromDate
                                        : ''}
                                </p>
                            )}
                        </div>
                        <div>
                            <RadixDatePicker
                                label={t('Marketing.ToDate')}
                                value={moment(bookingFormik.values.toDate).toDate()}
                                onChange={(date) => {
                                    if (!readonly) {
                                        const dateStr = formatDateToISO(date);
                                        bookingFormik.setFieldValue('toDate', dateStr);
                                    }
                                }}
                                disabled={readonly}
                                hideIcon={readonly}
                            />
                            {bookingFormik.touched.toDate && bookingFormik.errors.toDate && (
                                <p className="text-xs text-error-500 mt-1">
                                    {typeof bookingFormik.errors.toDate === 'string' ? bookingFormik.errors.toDate : ''}
                                </p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-primary dark:text-text-primary">
                            {t('Setting.Employee')}
                        </label>
                        <RadixSelect
                            placeholder={t('Setting.Employee')}
                            value={bookingFormik.values.employee}
                            onValueChange={(value: string) =>
                                !readonly && bookingFormik.setFieldValue('employee', value)
                            }
                            options={employeeOptions}
                            className="h-[45px]"
                            disabled={readonly}
                            hideIcon={readonly}
                        />
                        {bookingFormik.touched.employee && bookingFormik.errors.employee && (
                            <p className="text-xs text-error-500 mt-1">
                                {typeof bookingFormik.errors.employee === 'string' ? bookingFormik.errors.employee : ''}
                            </p>
                        )}
                    </div>
                    {readonly ? (
                        <RadixAccordion
                            value="treatments"
                            defaultOpen={true}
                            title={
                                <label className="block text-sm font-medium text-text-primary">
                                    {t('Marketing.SelectedTreatments')}
                                </label>
                            }
                            children={
                                <div className="flex flex-col gap-1 rounded-md">
                                    {allServices
                                        .filter((service: Service) =>
                                            (step2Data.filters?.treatments || []).includes(String(service.id)),
                                        )
                                        .map((service: Service, index: number) => (
                                            <React.Fragment key={service.id}>
                                                {index === 0 && (
                                                    <div className="h-px bg-border-default w-full mx-auto" />
                                                )}
                                                <RadixCheckbox
                                                    checked={true}
                                                    onChange={() => {}}
                                                    label={
                                                        <span className="text-sm text-text-primary">
                                                            {service.name}
                                                            {service.groupName && (
                                                                <span className="text-text-secondary ml-1">
                                                                    ({service.groupName})
                                                                </span>
                                                            )}
                                                        </span>
                                                    }
                                                    disabled={true}
                                                    className="m-2"
                                                />
                                                {index < (step2Data.filters?.treatments || []).length - 1 && (
                                                    <div className="h-px bg-border-default w-full mx-auto" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                </div>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-text-primary">
                                {t('Marketing.EmailCampaignsSelectTreatments')}
                            </label>
                            <div className="space-y-3 border-solid border-border-default border-[1px] rounded-md p-2">
                                {/* Select All checkbox at root level */}
                                <RadixCheckbox
                                    checked={bookingFormik.values.treatments.length === allServices.length}
                                    onChange={(checked) => {
                                        if (!readonly) {
                                            if (checked) {
                                                const allTreatmentIds = allServices
                                                    .filter((service: Service) => service?.id != null)
                                                    .map((service: Service) => String(service.id));
                                                bookingFormik.setFieldValue('treatments', allTreatmentIds);
                                            } else {
                                                bookingFormik.setFieldValue('treatments', []);
                                            }
                                        }
                                    }}
                                    label={t('SpOffers.SelAll')}
                                    className="ml-2"
                                    disabled={readonly}
                                />

                                <div className="h-px bg-border-default" />
                                {/* Groups in accordions */}
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    <RadixAccordionGroup
                                        value={openTreatmentGroup}
                                        onValueChange={(value) => {
                                            if (!readonly) {
                                                setOpenTreatmentGroup(value as string | undefined);
                                            }
                                        }}
                                        className="space-y-3"
                                    >
                                        {groupedServices.map((group: any) => {
                                            const groupServices = group.services || [];
                                            const groupServiceIds = groupServices
                                                .filter((service: Service) => service?.id != null)
                                                .map((service: Service) => String(service.id));
                                            const allGroupServicesSelected =
                                                groupServiceIds.length > 0 &&
                                                groupServiceIds.every((id: string) =>
                                                    bookingFormik.values.treatments.includes(id),
                                                );
                                            const someGroupServicesSelected = groupServiceIds.some((id: string) =>
                                                bookingFormik.values.treatments.includes(id),
                                            );

                                            return (
                                                <RadixAccordion
                                                    key={group.groupId}
                                                    value={`treatment-group-${group.groupId}`}
                                                    asItem={true}
                                                    title={
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <RadixCheckbox
                                                                checked={allGroupServicesSelected}
                                                                onChange={(checked) => {
                                                                    if (!readonly) {
                                                                        if (checked) {
                                                                            bookingFormik.setFieldValue('treatments', [
                                                                                ...bookingFormik.values.treatments,
                                                                                ...groupServiceIds,
                                                                            ]);
                                                                        } else {
                                                                            bookingFormik.setFieldValue(
                                                                                'treatments',
                                                                                bookingFormik.values.treatments.filter(
                                                                                    (id: string) =>
                                                                                        !groupServiceIds.includes(id),
                                                                                ),
                                                                            );
                                                                        }
                                                                    }
                                                                }}
                                                                label={group.groupName}
                                                                className="flex-1"
                                                                disabled={readonly}
                                                            />
                                                            {someGroupServicesSelected && !allGroupServicesSelected && (
                                                                <span className="text-xs text-text-secondary">
                                                                    (
                                                                    {
                                                                        groupServiceIds.filter((id: string) =>
                                                                            bookingFormik.values.treatments.includes(
                                                                                id,
                                                                            ),
                                                                        ).length
                                                                    }
                                                                    /{groupServiceIds.length})
                                                                </span>
                                                            )}
                                                        </div>
                                                    }
                                                    triggerClassName="flex items-center justify-between"
                                                >
                                                    <div className="space-y-5 pl-6">
                                                        {groupServices.map((service: any) => {
                                                            const serviceId = String(service.id);
                                                            return (
                                                                <div
                                                                    key={serviceId}
                                                                    className="flex items-center gap-3"
                                                                >
                                                                    <RadixCheckbox
                                                                        checked={bookingFormik.values.treatments.includes(
                                                                            serviceId,
                                                                        )}
                                                                        onChange={() => {
                                                                            if (!readonly) {
                                                                                const currentTreatments = [
                                                                                    ...bookingFormik.values.treatments,
                                                                                ];
                                                                                if (
                                                                                    currentTreatments.includes(
                                                                                        serviceId,
                                                                                    )
                                                                                ) {
                                                                                    bookingFormik.setFieldValue(
                                                                                        'treatments',
                                                                                        currentTreatments.filter(
                                                                                            (id) => id !== serviceId,
                                                                                        ),
                                                                                    );
                                                                                } else {
                                                                                    bookingFormik.setFieldValue(
                                                                                        'treatments',
                                                                                        [
                                                                                            ...currentTreatments,
                                                                                            serviceId,
                                                                                        ],
                                                                                    );
                                                                                }
                                                                            }
                                                                        }}
                                                                        labelClass="w-full"
                                                                        label={
                                                                            <div className="flex items-center gap-2 justify-between">
                                                                                <p className="text-sm text-text-primary m-0 w-1/2">
                                                                                    {service.name}
                                                                                </p>
                                                                                <p className="text-sm text-text-secondary m-0 w-1/2 text-right">
                                                                                    {group.groupName || ''}
                                                                                </p>
                                                                            </div>
                                                                        }
                                                                        className="flex-1 w-full"
                                                                        disabled={readonly}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </RadixAccordion>
                                            );
                                        })}
                                    </RadixAccordionGroup>
                                </div>
                            </div>
                            {bookingFormik.touched.treatments && bookingFormik.errors.treatments && (
                                <p className="text-xs text-error-500 mt-1">
                                    {Array.isArray(bookingFormik.errors.treatments)
                                        ? bookingFormik.errors.treatments[0] || ''
                                        : typeof bookingFormik.errors.treatments === 'string'
                                          ? bookingFormik.errors.treatments
                                          : ''}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {readonly && (
                <RadixAccordion
                    value="summary"
                    defaultOpen={true}
                    disabled={true}
                    hideIcon={true}
                    triggerClassName="!opacity-100"
                    title={<span className=" capitalize m-0 !opacity-100">{t('Statistics.ClipCardSummary')}</span>}
                >
                    <div className="h-px bg-border-default w-full" />
                    <div className="flex flex-col items-start justify-start  md:gap-4 gap-2 mt-2">
                        <span className="flex items-center justify-between w-full capitalize">
                            <p className="text-sm/3 font-medium text-text-secondary m-0">{t('POS.CustomerGroup')}</p>
                            <p className="text-text-primary m-0">
                                {summary?.campaignData?.step2?.group2Value === 'CUSTOMER_GROUP'
                                    ? summary?.campaignData?.step2?.customerGroupName
                                    : summary?.campaignData?.step2?.group2Value === 'BOOKING'
                                      ? t('Marketing.EmailCampaignsBookingIntervalOption')
                                      : '-'}
                            </p>
                        </span>

                        {summary?.campaignData?.step2?.filters?.fromDate && (
                            <React.Fragment>
                                <div className="h-px bg-border-default w-full" />
                                <span className="flex items-center justify-between w-full capitalize">
                                    <p className="text-sm/3 font-medium text-text-secondary m-0">
                                        {t('Marketing.FromDate')}
                                    </p>
                                    <p className="text-text-primary m-0">
                                        {moment(summary?.campaignData?.step2?.filters?.fromDate).format('DD/MM-YYYY') ||
                                            '-'}
                                    </p>
                                </span>
                            </React.Fragment>
                        )}

                        {summary?.campaignData?.step2?.filters?.toDate && (
                            <React.Fragment>
                                <div className="h-px bg-border-default w-full" />
                                <span className="flex items-center justify-between w-full capitalize">
                                    <p className="text-sm/3 font-medium text-text-secondary m-0">
                                        {t('Marketing.ToDate')}
                                    </p>
                                    <p className="text-text-primary m-0">
                                        {moment(summary?.campaignData?.step2?.filters?.toDate).format('DD/MM-YYYY') ||
                                            '-'}
                                    </p>
                                </span>
                            </React.Fragment>
                        )}

                        {visibleServices?.length > 0 && (
                            <React.Fragment>
                                <div className="h-px bg-border-default w-full" />
                                <div className="flex items-start justify-between w-full capitalize">
                                    <p className="text-sm font-medium text-text-secondary m-0">
                                        {t('Marketing.SelectedTreatments')}
                                    </p>

                                    <div className="flex flex-wrap items-start justify-end flex-1 text-text-primary text-right max-w-[60%]">
                                        {visibleServices?.length === 0
                                            ? '-'
                                            : visibleServices.map((service: any, index: number) => (
                                                  <span key={service.id}>
                                                      {service.name || '-'}
                                                      {index < visibleServices.length - 1 && ', '}
                                                  </span>
                                              ))}

                                        {filteredServices.length > 2 && (
                                            <span
                                                onClick={() => setExpanded(!expanded)}
                                                className="ml-2 cursor-pointer select-none text-text-secondary"
                                            >
                                                {expanded ? (
                                                    <span className="text-blue-500 text-xs cursor-pointer capitalize">
                                                        {' '}
                                                        {t('Marketing.ReadLess')}
                                                    </span>
                                                ) : (
                                                    <span className="text-blue-500 text-xs cursor-pointer capitalize">
                                                        {' '}
                                                        {t('Marketing.ReadMore')}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                </RadixAccordion>
            )}
        </RadixAccordion>
    );
}
