import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { t } from 'i18next';
import { updateStepData, setCurrentStep, getStepValidationStatus } from '@/redux/slices/Marketing/campaigns';
import { RadixAccordion, RadixSwitch, RadixDateTimePicker } from '@/components/radix';
import SenderIcon from '@/assets/Marketing/Sender.svg';
import SenderIconActive from '@/assets/Marketing/SenderActive.svg';
import CheckIcon from '@/assets/Marketing/Check.svg';
import WarningIcon from '@/assets/Marketing/Warning.svg';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { cnMerge } from '@/utils/cnMerge';

interface Step4SenderProps {
    readonly?: boolean;
    isCurrentStep?: boolean;
    isDisabled?: boolean;
    forceOpen?: boolean;
}

export default function Step4Sender({
    readonly = false,
    isCurrentStep = false,
    isDisabled = false,
    forceOpen = false,
}: Step4SenderProps) {
    const dispatch = useDispatch();
    const { campaignData, campaignType } = useSelector((state: any) => state.campaigns);
    const { step4: step4Data } = campaignData;
    const location = useLocation();
    const stepStatus = getStepValidationStatus(campaignData, campaignType);
    const step4Valid = stepStatus.step4;

    // Determine if accordion should be open based on URL hash
    // In readonly mode: always open
    // In step mode: only open if hash matches this step
    const hashMatches = location?.hash === '#step4';
    const shouldBeOpen = readonly ? true : hashMatches || forceOpen;
    const shouldBeDisabled = readonly;

    // Schedule options: 'immediate' or 'scheduled'
    const [sendImmediately, setSendImmediately] = useState(
        step4Data.isManualTrigger !== undefined ? step4Data.isManualTrigger : true,
    );
    // Create default: next full hour (e.g. 10:01 → 11:00, 11:05 → 12:00)
    const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(() =>
        step4Data.sendDateTime
            ? moment(step4Data.sendDateTime).toDate()
            : moment().add(1, 'hour').startOf('hour').toDate(),
    );

    useEffect(() => {
        const localDateTimeString = sendImmediately
            ? ''
            : scheduledDateTime
              ? moment(scheduledDateTime).format('YYYY-MM-DD HH:mm:ss')
              : '';

        const reduxSerialized = {
            isManualTrigger: step4Data.isManualTrigger,
            sendDateTime: step4Data.sendDateTime || '',
        };

        if (
            reduxSerialized.isManualTrigger === sendImmediately &&
            reduxSerialized.sendDateTime === localDateTimeString
        ) {
            return;
        }

        if (step4Data.isManualTrigger !== undefined && step4Data.isManualTrigger !== sendImmediately) {
            setSendImmediately(step4Data.isManualTrigger);
        }

        if (step4Data.sendDateTime && step4Data.sendDateTime !== '') {
            const currentDateString = scheduledDateTime ? moment(scheduledDateTime).format('YYYY-MM-DD HH:mm:ss') : '';
            if (currentDateString !== step4Data.sendDateTime) {
                setScheduledDateTime(moment(step4Data.sendDateTime).toDate());
            }
        } else if (!sendImmediately && scheduledDateTime && step4Data.sendDateTime === '') {
            setScheduledDateTime(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step4Data.sendDateTime, step4Data.isManualTrigger]);

    useEffect(() => {
        const sendDateTimeString = sendImmediately
            ? ''
            : scheduledDateTime
              ? moment(scheduledDateTime).format('YYYY-MM-DD HH:mm:ss')
              : '';

        dispatch(
            updateStepData({
                step: 'step4',
                data: {
                    isManualTrigger: sendImmediately,
                    sendDateTime: sendDateTimeString,
                },
            }),
        );
    }, [sendImmediately, scheduledDateTime, dispatch]);

    const minDate = useMemo(() => moment().toDate(), []);

    return (
        <RadixAccordion
            hideIcon={readonly}
            key={`step4-${location?.hash}`}
            value="step4"
            disabled={shouldBeDisabled}
            open={shouldBeOpen ?? false}
            onChange={(open) => {
                // Only handle opening - closing is handled by hash change
                if (!readonly && open) {
                    dispatch(setCurrentStep(4));
                }
            }}
            triggerClassName={cnMerge(readonly && '!opacity-100 cursor-default')}
            titleClassName="w-full pr-4"
            title={
                <div className="flex items-center gap-3 justify-between w-full">
                    <span className="flex items-center gap-3 ">
                        <img
                            src={location?.hash === '#step4' || readonly ? SenderIconActive : SenderIcon}
                            alt="Sender Icon"
                            className="h-5 shrink-0"
                        />
                        <span className="text-lg capitalize m-0">{t('Setting.Sender')}</span>
                    </span>
                    <img
                        src={step4Valid ? CheckIcon : WarningIcon}
                        alt=""
                        className={cnMerge(
                            'h-5 w-5 shrink-0',
                            step4Valid
                                ? 'opacity-100 [filter:invert(48%)_sepia(79%)_saturate(2476%)_hue-rotate(86deg)]'
                                : 'opacity-80',
                        )}
                        aria-hidden
                    />
                </div>
            }
        >
            <div className="space-y-4 pb-3 pl-1">
                <div className="space-y-4">
                    {/* Send Immediately Switch */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1 mb-1 w-full">
                            <label className="text-base font-medium text-text-primary dark:text-text-primary cursor-pointer">
                                {t('Marketing.EmailCampaignsSendImmediately')}
                            </label>
                            <p className="text-base text-text-secondary dark:text-text-secondary m-0">
                                {t('Marketing.EmailCampaignsSendImmediatelyDesc')}
                            </p>
                        </div>
                        <RadixSwitch
                            checked={sendImmediately}
                            onChange={(checked) => {
                                if (!readonly) {
                                    setSendImmediately(checked);
                                    if (checked) {
                                        setScheduledDateTime(null);
                                    }
                                }
                            }}
                            disabled={readonly}
                        />
                    </div>

                    <React.Fragment>
                        {/* Schedule Broadcast Switch */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1 mb-1 w-full">
                                <label className="text-base font-medium text-text-primary dark:text-text-primary cursor-pointer">
                                    {t('Marketing.EmailCampaignsScheduleBroadcast')}
                                </label>
                                <p className="text-base text-text-secondary dark:text-text-secondary m-0">
                                    {t('Marketing.EmailCampaignsScheduleBroadcastDesc')}
                                </p>
                            </div>
                            <RadixSwitch
                                checked={!sendImmediately}
                                onChange={(checked) => {
                                    if (!readonly) {
                                        setSendImmediately(!checked);
                                        if (checked && !scheduledDateTime) {
                                            setScheduledDateTime(moment().add(1, 'hour').startOf('hour').toDate());
                                        }
                                    }
                                }}
                                disabled={readonly}
                            />
                        </div>

                        {/* Date Time Picker - shown only when Schedule Broadcast is selected */}
                        {!sendImmediately && (
                            <div className="my-4 md:max-w-fit">
                                <RadixDateTimePicker
                                    label={t('Marketing.EmailCampaignsSelectDateTime')}
                                    value={scheduledDateTime}
                                    onChange={(date) => {
                                        if (readonly) return;
                                        setScheduledDateTime(date);
                                    }}
                                    placeholder={t('Marketing.EmailCampaignsSelectDateTime')}
                                    minDate={minDate}
                                    disabled={readonly}
                                    minuteSelectable={false}
                                    iconClassName="text-text-primary"
                                    iconStyle={{ filter: 'brightness(0)' }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                </div>
            </div>
        </RadixAccordion>
    );
}
