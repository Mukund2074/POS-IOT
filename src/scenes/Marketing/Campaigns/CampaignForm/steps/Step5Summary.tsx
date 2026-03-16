import React from 'react';
import { useSelector } from 'react-redux';
import { t } from 'i18next';
import { RadixCard } from '@/components/radix';
import Step2CustomerGroup from './Step2CustomerGroup';
import Step3Content from './Step3Content';
import Step5PriceReceivers from './Step5PriceReceivers';
import BellIconActive from '@/assets/Marketing/CampgainActive.svg';
import SenderIconActive from '@/assets/Marketing/SenderActive.svg';
import moment from 'moment';

export default function Step5Summary({ canEditCampaign }: { canEditCampaign?: boolean }) {
    const campaignsState = useSelector((state: any) => state.campaigns);
    const { step1: step1Data, step4: step4Data } = campaignsState.campaignData ?? {};
    const campaignId = campaignsState.createdCampaign?.id ?? campaignsState.editingCampaignId ?? null;

    const campaignName = step1Data?.campaignName || '';
    const isManualTrigger = step4Data?.isManualTrigger !== undefined ? step4Data.isManualTrigger : true;
    const sendDateTime = step4Data?.sendDateTime || '';

    // Format scheduled date time
    const formattedDateTime = sendDateTime ? moment(sendDateTime).format('DD/MM/YYYY HH:mm') : '-';

    return (
        <div className="space-y-3 mt-4">
            {/* Campaign Details Card */}
            <RadixCard className="p-4 border-[1px] border-solid border-border-default">
                <div className="flex items-center gap-3 mb-4">
                    <img src={BellIconActive} alt="Bell Icon" className="w-6 h-6" />
                    <h3 className="text-lg font-semibold text-text-primary m-0">
                        {t('Marketing.EmailCampaignsCampaignDetails')}
                    </h3>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-text-secondary">
                        {t('Marketing.EmailCampaignsCampaignNameLabel')}
                    </label>
                    <p className="text-base font-medium text-text-primary bg-background-subtle p-3 rounded-md">
                        {campaignName || '-'}
                    </p>
                </div>
            </RadixCard>

            <Step2CustomerGroup readonly={true} />
            <Step3Content readonly={true} />

            {/* Sender Card */}
            <RadixCard className="p-4 border-[1px] border-solid border-border-default">
                <div className="flex items-center gap-3 mb-4">
                    <img src={SenderIconActive} alt="Sender Icon" className="w-6 h-6" />
                    <h3 className="text-lg font-semibold text-text-primary m-0">{t('Setting.Sender')}</h3>
                </div>
                <div className="space-y-4">
                    {/* Send Immediately */}
                    <div className="space-y-1">
                        <label className="text-base font-medium text-text-primary">
                            {isManualTrigger
                                ? t('Marketing.EmailCampaignsSendImmediately')
                                : t('Marketing.EmailCampaignsScheduleBroadcast')}
                        </label>
                        <p className="text-base font-medium text-text-secondary">
                            {isManualTrigger
                                ? t('Marketing.EmailCampaignsSendImmediatelyDesc')
                                : t('Marketing.EmailCampaignsScheduleBroadcastDesc')}
                        </p>
                    </div>

                    {/* Scheduled Date Time */}
                    {!isManualTrigger && sendDateTime && (
                        <div className="space-y-1">
                            <label className="text-base font-medium text-text-primary">
                                {t('Marketing.EmailCampaignsSelectDateTime')}
                            </label>
                            <p className="text-sm font-medium text-text-secondary p-2 border border-solid border-border-default rounded-md">
                                {formattedDateTime}
                            </p>
                        </div>
                    )}
                </div>
            </RadixCard>

            <Step5PriceReceivers campaignId={campaignId} canEdit={canEditCampaign} />
        </div>
    );
}
