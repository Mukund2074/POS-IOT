import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RadixButton } from '@/components/radix';
import { t } from 'i18next';
import { toast } from '@/utils/toast';
import { setTestDialogOpen, setCurrentStep } from '@/redux/slices/Marketing/campaigns';
import MobilePreview from '@/scenes/Marketing/TriggerFlaws/TriggerBuilder/components/MobilePreview';

interface StepperProps {
    // Preview-only mode for TriggerBuilder
    previewOnly?: boolean;
    // When true, hides "Edit campaign" and "Send test" actions on step 5.
    hideCampaignActions?: boolean;
    previewContent?: {
        sender?: string;
        replyTo?: string;
        subject?: string;
        content?: string;
    };
    previewTriggerType?: 'Email' | 'SMS';
}

export default function Stepper({
    previewOnly = false,
    hideCampaignActions = false,
    previewContent,
    previewTriggerType,
}: StepperProps = {}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const url = new URL(window.location.href);
    const urlCampaignId = url.searchParams.get('id');
    const { campaignData, currentStep, campaignType, editingCampaignId, createdCampaign } = useSelector(
        (state: any) => state.campaigns,
    );
    const { step3: step3Data } = campaignData;

    // Use preview props if in preview-only mode, otherwise use Redux state
    const isSMSCampaign = previewOnly ? previewTriggerType === 'SMS' : campaignType === 'SMS';

    // For preview mode, use previewContent; otherwise use step3Data
    const contentData = previewOnly
        ? {
              sender: previewContent?.sender || step3Data?.sender,
              replyTo: previewContent?.replyTo || step3Data?.replyTo,
              subject: previewContent?.subject || step3Data?.subject,
              content: previewContent?.content || step3Data?.content,
          }
        : step3Data;

    // Edit Campaign handler
    const handleEditCampaign = () => {
        const campaignId = editingCampaignId || createdCampaign?.id || urlCampaignId;
        if (!campaignId) {
            console.error('Cannot edit campaign: No campaign ID available', { editingCampaignId, createdCampaign });
            toast.error(t('Marketing.CannotEditCampaignNoId'));
            return;
        }

        const finalCampaignId = urlCampaignId ? urlCampaignId : campaignId;

        dispatch(setCurrentStep(1));
        const baseRoute = isSMSCampaign ? '/marketing/sms-campaigns' : '/marketing/email-campaigns';
        const targetUrl = `${baseRoute}/${finalCampaignId}#step1`;
        navigate(targetUrl, { replace: false });
    };

    // Send Test handler - opens dialog managed by WizardFooter
    const handleSendTest = () => {
        dispatch(setTestDialogOpen(true));
    };

    // Determine if we're in editing mode
    const isEditing = !!editingCampaignId;

    // Show mobile content:
    // - In preview-only mode: always show
    // - When editing: show on all steps
    // - When creating: show on steps 3, 4, 5
    const shouldShowContent = previewOnly || isEditing || currentStep === 3 || currentStep === 4 || currentStep === 5;

    return (
        <div className="w-full max-w-[360px] shrink-0 mx-auto">
            {/* Action Buttons - Only show on Step 5 (Summary) and not in preview-only mode */}
            {!previewOnly && !hideCampaignActions && currentStep === 5 && (
                <div className="flex gap-2 w-full">
                    <RadixButton
                        onClick={handleEditCampaign}
                        variant="outline"
                        className="flex-1 border-primary-500 !text-primary-500 !font-[urbanist]"
                    >
                        {t('Marketing.EditCampaign')}
                    </RadixButton>
                    <RadixButton
                        onClick={handleSendTest}
                        variant="outline"
                        className="flex-1 border-primary-500 !text-primary-500 !font-[urbanist]"
                    >
                        {isSMSCampaign
                            ? t('Marketing.SMSCampaignsSendTestSMS')
                            : t('Marketing.EmailCampaignsSendTestEmail')}
                    </RadixButton>
                </div>
            )}

            {/* Mobile Preview - Show content based on editing/creating mode */}
            {shouldShowContent ? (
                <MobilePreview
                    content={contentData?.content || ''}
                    sender={contentData?.sender}
                    subject={contentData?.subject}
                    triggerType={isSMSCampaign ? 'SMS' : 'EMAIL'}
                />
            ) : (
                // Empty/black screen for other steps
                <MobilePreview
                    content={`${
                        isSMSCampaign
                            ? t('Marketing.NoContent')
                            : `<span class='text-text-secondary h-[200px] items-center justify-center rounded-xl m-0 w-full mt-4 flex px-2'>
                    ${t('Marketing.NoContent')}</span>`
                    }`}
                    triggerType={isSMSCampaign ? 'SMS' : 'EMAIL'}
                />
            )}
        </div>
    );
}
