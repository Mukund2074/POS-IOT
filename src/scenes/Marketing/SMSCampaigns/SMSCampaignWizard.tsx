import React from 'react';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import CampaignWizard from '../Campaigns/CampaignForm/CampaignWizard';
import { SMS_CAMPAIGN_CONFIG } from '../Campaigns/types';

export default function SMSCampaignWizard() {
    return (
        <CampaignWizard
            campaignType={PostApiCampaignsBodyCampaignType.SMS}
            baseRoute={SMS_CAMPAIGN_CONFIG.baseRoute}
            breadcrumbAccountLabel={SMS_CAMPAIGN_CONFIG.translationKeys.account}
            breadcrumbCreateLabel={SMS_CAMPAIGN_CONFIG.translationKeys.createNew}
            breadcrumbEditLabel={SMS_CAMPAIGN_CONFIG.translationKeys.editCampaign}
            titleCreateLabel={SMS_CAMPAIGN_CONFIG.translationKeys.createNewCampaign}
            titleEditLabel={SMS_CAMPAIGN_CONFIG.translationKeys.editCampaign}
            descriptionCreateLabel={SMS_CAMPAIGN_CONFIG.translationKeys.createNewCampaignDesc}
            descriptionEditLabel={SMS_CAMPAIGN_CONFIG.translationKeys.editCampaignDesc}
            cannotEditTriggeredLabel={SMS_CAMPAIGN_CONFIG.translationKeys.cannotEditTriggered}
            createSuccessLabel={SMS_CAMPAIGN_CONFIG.translationKeys.createSuccess}
            createErrorLabel={SMS_CAMPAIGN_CONFIG.translationKeys.createError}
        />
    );
}
