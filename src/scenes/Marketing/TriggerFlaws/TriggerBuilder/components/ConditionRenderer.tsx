import React, { useImperativeHandle } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { MarketingConditionSchema } from '@/data/Marketing/MarketingCondition';
import {
    PostalCodeInput,
    BirthdayInput,
    AgeRangeInput,
    DaysRangeInput,
    ActiveBookingServiceInput,
    ProductMultiSelect,
    ProductCategoryMultiSelect,
    RevenueThresholdInput,
    GiftCardBalanceInput,
    ClipCardBalanceInput,
    TriggerSettingForm,
    CommunicationInput,
} from './renderers';
import { setSelectedTriggerCondition, setConsent, type TriggerFlowData } from '@/redux/slices/Marketing/triggerFlow';
import { RadixButton, RadixRadio, RadixRadioGroup } from '@/components/radix';
import CloseIconSvg from '../../../../../assets/Marketing/Close.svg';
import { t } from 'i18next';
import MobilePreview from './MobilePreview';
import { useFormik } from 'formik';
import { useMediaQuery } from '@/hooks/shared';

type RevenueThresholdValue = {
    type: 'AGGREGATE_GT' | 'AGGREGATE_LT' | 'AGGREGATE_EQ';
    amount?: number | null;
};

type ConditionValue =
    | number[]
    | string[]
    | [number | null, number | null]
    | [string | null, string | null]
    | string
    | number
    | null
    | undefined
    | Record<string, unknown>;

interface ConditionRendererProps {
    condition: MarketingConditionSchema;
    value?: ConditionValue;
    compositeValues?: Record<string, unknown>;
    /** Instance id from Redux (condition.id) - used to register validator so we can validate all at once */
    conditionInstanceId: string;
}

// Common interface for all condition component refs
export interface ConditionComponentRef {
    validate: () => Promise<boolean>;
    getValues: () => ConditionValue | Record<string, unknown>;
}

const ConditionRenderer = ({ condition, value, compositeValues, conditionInstanceId }: ConditionRendererProps) => {
    const conditionId = condition?.conditionId ?? 0;
    const conditionRenderId = condition?.condition_render_id ?? conditionId;

    if (!condition || !conditionId) {
        return <div className="text-sm text-text-secondary">{t('Marketing.InvalidConditionMissingConditionId')}</div>;
    }

    if (conditionRenderId === 0) {
        return <div className="text-sm text-text-secondary">{t('Marketing.ConditionTypeDoesNotRequireInput')}</div>;
    }

    switch (conditionRenderId) {
        // ---------------- CustomerProfile ----------------
        case 1: // Birthday
            return (
                <BirthdayInput
                    conditionInstanceId={conditionInstanceId}
                    value={Array.isArray(value) ? (value as number[]) : typeof value === 'string' ? value : null}
                    fieldValue={
                        (compositeValues?.fieldValue || value) as
                            | {
                                  milestone?: boolean;
                                  last?: number;
                                  next?: number;
                              }
                            | undefined
                    }
                />
            );
        case 2: // New customer
            return (
                <DaysRangeInput
                    conditionInstanceId={conditionInstanceId}
                    value={Array.isArray(value) ? (value as number[]) : null}
                />
            );
        case 4: // Age group
            return (
                <AgeRangeInput
                    conditionInstanceId={conditionInstanceId}
                    value={
                        Array.isArray(value) && value.length === 2 ? (value as [number | null, number | null]) : null
                    }
                />
            );
        case 6: // Postal code
            return (
                <PostalCodeInput
                    conditionInstanceId={conditionInstanceId}
                    value={Array.isArray(value) ? (value as [string] | [string, string]) : null}
                />
            );

        // ---------------- BookingBehavior ----------------
        case 7: // Active Booking
            return (
                <DaysRangeInput
                    conditionInstanceId={conditionInstanceId}
                    value={Array.isArray(value) ? (value as number[]) : null}
                    isBooking={true}
                />
            );
        case 8: // Active booking – selected service
            return (
                <ActiveBookingServiceInput
                    conditionInstanceId={conditionInstanceId}
                    value={Array.isArray(value) ? (value as number[] | string[]) : null}
                    compositeValues={
                        compositeValues as
                            | {
                                  serviceIds?: number[] | string[];
                                  days?: [number | null, number | null];
                                  status?: ('BOOKED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED')[];
                              }
                            | undefined
                    }
                    fixedStatus={undefined}
                    renderId={8}
                />
            );
        case 9: // Cancelled Booking
            return (
                <ActiveBookingServiceInput
                    conditionInstanceId={conditionInstanceId}
                    value={Array.isArray(value) ? (value as number[] | string[]) : null}
                    compositeValues={
                        compositeValues as
                            | {
                                  serviceIds?: number[] | string[];
                                  days?: [number | null, number | null];
                                  status?: 'CANCELLED'[];
                              }
                            | undefined
                    }
                    fixedStatus="CANCELLED"
                    renderId={9}
                />
            );

        // ---------------- PurchasesBehavior ----------------
        case 10: // Purchase by item number
            return (
                <ProductMultiSelect
                    conditionInstanceId={conditionInstanceId}
                    value={value as string[] | string | number[] | null | undefined}
                />
            );
        case 11: // Purchase by item number – period
            return (
                <ProductMultiSelect
                    conditionInstanceId={conditionInstanceId}
                    value={value as string[] | string | number[] | null | undefined}
                    compositeValues={
                        compositeValues as
                            | { productIds?: string[] | string; days?: [number | null, number | null] }
                            | undefined
                    }
                    hasPeriod={true}
                />
            );
        case 12: // Purchase by product group
            return (
                <ProductCategoryMultiSelect
                    conditionInstanceId={conditionInstanceId}
                    value={value as string[] | string | number[] | null | undefined}
                />
            );
        case 13: // Purchase by product group – period
            return (
                <ProductCategoryMultiSelect
                    conditionInstanceId={conditionInstanceId}
                    value={value as string[] | string | number[] | null | undefined}
                    compositeValues={
                        compositeValues as
                            | { categoryIds?: string[] | number[]; days?: [number | null, number | null] }
                            | undefined
                    }
                    hasPeriod={true}
                />
            );
        case 14: // Revenue
            return (
                <RevenueThresholdInput
                    conditionInstanceId={conditionInstanceId}
                    value={value as RevenueThresholdValue | null | undefined}
                    compositeValues={compositeValues}
                />
            );

        case 15: // Revenue – period
            return (
                <RevenueThresholdInput
                    conditionInstanceId={conditionInstanceId}
                    value={value as RevenueThresholdValue | null | undefined}
                    compositeValues={compositeValues}
                    hasPeriod
                />
            );

        // ---------------- GiftCardAndClipCard ----------------
        case 17: // Gift card balance
            return (
                <GiftCardBalanceInput
                    conditionInstanceId={conditionInstanceId}
                    value={typeof value === 'number' ? value : null}
                    compositeValues={
                        compositeValues as
                            | {
                                  balanceOperator: '>' | '<' | '=';
                                  balanceAmount: number | null;
                                  expirationPeriod: [number | null, number | null];
                              }
                            | undefined
                    }
                />
            );
        case 18: // Clip card balance
            return (
                <ClipCardBalanceInput
                    conditionInstanceId={conditionInstanceId}
                    value={typeof value === 'number' ? value : null}
                    compositeValues={
                        compositeValues as
                            | {
                                  minClips: number | null;
                                  maxClips: number | null;
                                  expirationPeriod: [number | null, number | null];
                              }
                            | undefined
                    }
                />
            );

        // ---------------- Communication ----------------
        case 19: // Previous campaign
            return (
                <CommunicationInput
                    conditionInstanceId={conditionInstanceId}
                    value={value as string[] | string | null | undefined}
                />
            );

        default:
            return <div className="text-sm text-text-secondary">{t('Marketing.UnsupportedConditionType')}</div>;
    }
};

ConditionRenderer.displayName = 'ConditionRenderer';

// Special mode renderer for consent, trigger setting, and content box modes
export interface SpecialModeRendererProps {
    mode: 'consent' | 'trigger-setting' | 'content-box';
    consentValue?: boolean | null | undefined;
    triggerSetting?: TriggerFlowData['triggerSetting'];
    content?: TriggerFlowData['content'];
    conditionRef?: React.MutableRefObject<ConditionComponentRef | null>;
    onConsentChange?: (value: boolean | null | undefined) => void;
    onTriggerSettingChange?: (value: TriggerFlowData['triggerSetting']) => void;
}

export const SpecialModeRenderer: React.FC<SpecialModeRendererProps> = ({
    mode,
    consentValue,
    triggerSetting,
    content,
    conditionRef,
    onTriggerSettingChange,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isDesktop = useMediaQuery('(min-width: 960px)');
    const clearUrlParameter = () => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('c');
        navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    };

    const handleClose = () => {
        dispatch(setSelectedTriggerCondition(null));
        clearUrlParameter();
    };

    const formik = useFormik({
        initialValues: {
            consent: consentValue,
        },
        enableReinitialize: true,
        onSubmit: () => {
            // Validation handled automatically
        },
    });

    // Expose consent value through conditionRef when in consent mode
    useImperativeHandle(
        mode === 'consent' ? conditionRef : null,
        () => ({
            validate: async () => {
                // Consent doesn't require validation - it can be undefined, null, true, or false
                return true;
            },
            getValues: () => {
                // Return consent value - for consent mode, we return boolean | null | undefined
                // Cast to ConditionValue which includes null and undefined
                const consentVal = formik.values.consent;
                return (consentVal === undefined || consentVal === null ? consentVal : consentVal) as ConditionValue;
            },
        }),
        [formik.values.consent],
    );

    if (mode === 'consent') {
        // Use formik values for the radio to reflect current state
        // Only select a radio if value is explicitly true or false
        // If undefined, no radio should be selected
        const currentConsentValue = formik.values.consent;
        const radioValue =
            typeof currentConsentValue === 'boolean' ? (currentConsentValue ? 'true' : 'false') : undefined;

        // Show warning if "No" is selected (value is false)
        const showWarning = currentConsentValue === false;

        return (
            <div className="h-full flex flex-col">
                {isDesktop && (
                    <div className="flex items-center justify-between mb-2 md:px-4 pt-4">
                        <h3 className="text-lg font-semibold text-text-primary m-0 p-0">
                            {t('Marketing.ChooseTrigger')}
                        </h3>
                        <RadixButton
                            onClick={handleClose}
                            iconOnly
                            title="Close"
                            className="p-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0"
                        >
                            <img src={CloseIconSvg} alt="Close" className="w-4 h-4" />
                        </RadixButton>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto flex flex-col gap-6 md:px-4">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm leading-5 font-medium text-text-primary m-0">
                            {t('Marketing.SendToCustomersWithConsentOnly')}
                        </p>

                        <RadixRadioGroup
                            value={radioValue}
                            onValueChange={(value) => {
                                const consentVal = value === 'true';
                                formik.setFieldValue('consent', consentVal);
                                dispatch(setConsent(consentVal));
                            }}
                        >
                            <RadixRadio value="true" label={t('Marketing.ConsentOnlyYes')} />
                            <RadixRadio value="false" label={t('Marketing.ConsentOnlyNo')} />
                        </RadixRadioGroup>

                        {showWarning && (
                            <div className="bg-background-subtle border border-border-default rounded-md p-2 mt-1">
                                <p className="text-sm leading-5 font-normal whitespace-pre-line">
                                    ⚠️<span className="text-text-primary">{t('Calendar.impNote')}: </span>
                                    <span className="text-error-500">{t('Marketing.ConsentGDPRWarning')}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'trigger-setting') {
        return (
            <div className="h-full flex flex-col">
                {isDesktop && (
                    <div className="flex items-center justify-between mb-2 px-4 pt-4">
                        <h3 className="text-lg font-semibold text-text-primary m-0 p-0">
                            {t('Marketing.SettingDetails')}
                        </h3>
                        <RadixButton
                            onClick={handleClose}
                            iconOnly
                            title="Close"
                            className="p-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0"
                        >
                            <img src={CloseIconSvg} alt="Close" className="w-4 h-4" />
                        </RadixButton>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto flex flex-col gap-4 md:px-4 md:py-5">
                    <TriggerSettingForm
                        conditionRef={conditionRef}
                        value={triggerSetting}
                        onChange={onTriggerSettingChange}
                    />
                </div>
            </div>
        );
    }

    if (mode === 'content-box') {
        return (
            <div className="">
                <div className="flex items-center justify-between mb-2 px-4 pt-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-text-primary m-0 p-0">{t('Marketing.ContentBox')}</h3>
                    <RadixButton
                        onClick={handleClose}
                        iconOnly
                        title="Close"
                        className="p-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0"
                    >
                        <img src={CloseIconSvg} alt="Close" className="w-4 h-4" />
                    </RadixButton>
                </div>

                <MobilePreview
                    content={content?.content || ''}
                    sender={content?.sender || ''}
                    subject={content?.subject}
                    triggerType={triggerSetting?.triggerType || 'EMAIL'}
                />
            </div>
        );
    }

    return null;
};

SpecialModeRenderer.displayName = 'SpecialModeRenderer';
export default ConditionRenderer;
