import React from 'react';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import CampaignWizard from '../Campaigns/CampaignForm/CampaignWizard';
import { EMAIL_CAMPAIGN_CONFIG } from '../Campaigns/types';

export default function EmailCampaignWizard() {
    return (
        <CampaignWizard
            campaignType={PostApiCampaignsBodyCampaignType.EMAIL}
            baseRoute={EMAIL_CAMPAIGN_CONFIG.baseRoute}
            breadcrumbAccountLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.account}
            breadcrumbCreateLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.createNew}
            breadcrumbEditLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.editCampaign}
            titleCreateLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.createNewCampaign}
            titleEditLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.editCampaign}
            descriptionCreateLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.createNewCampaignDesc}
            descriptionEditLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.editCampaignDesc}
            cannotEditTriggeredLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.cannotEditTriggered}
            createSuccessLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.createSuccess}
            createErrorLabel={EMAIL_CAMPAIGN_CONFIG.translationKeys.createError}
        />
    );
}
