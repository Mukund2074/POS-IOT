import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { t } from 'i18next';
import { updateStepData, setCurrentStep, getStepValidationStatus } from '@/redux/slices/Marketing/campaigns';
import { RadixInput, RadixAccordion } from '@/components/radix';
import BellIcon from '@/assets/Marketing/Campgain.svg';
import BellIconActive from '@/assets/Marketing/CampgainActive.svg';
import CheckIcon from '@/assets/Marketing/Check.svg';
import WarningIcon from '@/assets/Marketing/Warning.svg';
import { useLocation } from 'react-router-dom';
import { cnMerge } from '@/utils/cnMerge';

interface Step1DetailsProps {
    readonly?: boolean;
    forceOpen?: boolean;
}

export default function Step1Details({ readonly = false, forceOpen = false }: Step1DetailsProps) {
    const dispatch = useDispatch();
    const { campaignData, campaignType } = useSelector((state: any) => state.campaigns);
    const { step1: step1Data } = campaignData;
    const [campaignName, setCampaignName] = useState(step1Data.campaignName || '');
    const location = useLocation();
    const stepStatus = getStepValidationStatus(campaignData, campaignType);
    const step1Valid = stepStatus.step1;

    useEffect(() => {
        if (step1Data.campaignName !== undefined) {
            setCampaignName(step1Data.campaignName);
        }
    }, [step1Data.campaignName]);

    // Determine if accordion should be open based on URL hash
    // In readonly mode: always open
    // In step mode: only open if hash matches this step
    const hashMatches = location?.hash === '#step1';
    const shouldBeOpen = readonly ? true : hashMatches || forceOpen;
    const shouldBeDisabled = readonly;

    return (
        <RadixAccordion
            hideIcon={readonly}
            key={`step1-${location?.hash}`}
            value="step1"
            open={shouldBeOpen}
            disabled={shouldBeDisabled}
            onChange={(open) => {
                // Only handle opening - closing is handled by hash change
                if (!readonly && open) {
                    dispatch(setCurrentStep(1));
                }
            }}
            titleClassName="w-full pr-4"
            triggerClassName={cnMerge(readonly && '!opacity-100 cursor-default')}
            title={
                <div className="flex items-center gap-3 justify-between w-full">
                    <span className="flex items-center gap-3">
                        <img
                            src={location?.hash === '#step1' || readonly ? BellIconActive : BellIcon}
                            alt="Bell Icon"
                            className="h-5 shrink-0"
                        />
                        <span className="text-lg capitalize m-0">{t('Marketing.EmailCampaignsCampaignDetails')}</span>
                    </span>
                    <span className="flex items-center justify-center">
                        <img
                            src={step1Valid ? CheckIcon : WarningIcon}
                            alt=""
                            className={cnMerge(
                                'h-5 w-5 shrink-0',
                                step1Valid
                                    ? 'opacity-100 [filter:invert(48%)_sepia(79%)_saturate(2476%)_hue-rotate(86deg)]'
                                    : 'opacity-80',
                            )}
                            aria-hidden
                        />
                    </span>
                </div>
            }
        >
            <RadixInput
                label={t('Marketing.EmailCampaignsCampaignNameLabel')}
                value={campaignName}
                onChange={(e) => {
                    if (!readonly) {
                        const newValue = e.target.value;
                        setCampaignName(newValue);
                        // Update Redux state immediately so footer can reactively enable/disable Next button
                        dispatch(updateStepData({ step: 'step1', data: { campaignName: newValue } }));
                    }
                }}
                placeholder="15% off facials - October"
                className={cnMerge(
                    readonly ? '!border-0 !p-0 !m-0 !h-auto' : 'h-[40px] mb-1',
                    'border-none',
                    'text-text-primary text-sm',
                    'opacity-100',
                    !readonly && 'bg-background-subtle',
                )}
                disabled={readonly}
            />
            {!readonly && (
                <span className="text-sm text-text-secondary dark:text-text-secondary">
                    {t('Marketing.EmailCampaignsCampaignNameHelper')}
                </span>
            )}
        </RadixAccordion>
    );
}
