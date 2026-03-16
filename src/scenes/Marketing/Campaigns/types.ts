import { t } from 'i18next';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';

export interface CampaignTypeConfig {
    type: PostApiCampaignsBodyCampaignType;
    baseRoute: string;
    translationKeys: {
        title: string;
        description: string;
        createCampaign: string;
        createdCampaigns: string;
        campaignName: string;
        customerGroup: string;
        created: string;
        recipient: string;
        revenue: string;
        preference: string;
        account: string;
        createNew: string;
        editCampaign: string;
        createNewCampaign: string;
        createNewCampaignDesc: string;
        editCampaignDesc: string;
        cannotEditTriggered: string;
        updateSuccess?: string;
        createSuccess: string;
        createError: string;
    };
    draftCampaignsKeys?: {
        [key: string]: string;
    };
}

export const EMAIL_CAMPAIGN_CONFIG: CampaignTypeConfig = {
    type: PostApiCampaignsBodyCampaignType.EMAIL,
    baseRoute: '/marketing/email-campaigns',
    translationKeys: {
        title: t('Marketing.EmailCampaignsTitle'),
        description: t('Marketing.EditEmailCampaignsDescription'),
        createCampaign: t('Marketing.CreateCampaign'),
        createdCampaigns: t('Marketing.CreatedCampaigns'),
        campaignName: t('Common.Name'),
        customerGroup: t('POS.CustomerGroup'),
        created: t('Common.Created'),
        recipient: t('Marketing.Recipient'),
        revenue: t('Insights.Revenue'),
        preference: t('Marketing.EmailPreference'),
        account: t('Marketing.Account'),
        createNew: t('Marketing.EmailCampaignsCreateNewEmail'),
        editCampaign: t('Marketing.EditCampaign'),
        createNewCampaign: t('Marketing.EmailCampaignsCreateNewEmailCampaign'),
        createNewCampaignDesc: t('Marketing.EmailCampaignsDescription'),
        editCampaignDesc: t('Marketing.EmailCampaignsDescription'),
        cannotEditTriggered: t('Marketing.CannotEditTriggered'),
        createSuccess: t('Marketing.EmailCampaignsCreateSuccess'),
        createError: t('Marketing.CampaignsCreateError'),
    },
};

export const SMS_CAMPAIGN_CONFIG: CampaignTypeConfig = {
    type: PostApiCampaignsBodyCampaignType.SMS,
    baseRoute: '/marketing/sms-campaigns',
    translationKeys: {
        title: t('Marketing.SMSCampaignsTitle'),
        description: t('Marketing.SMSCampaignsDescription'),
        createCampaign: t('Marketing.CreateCampaign'),
        createdCampaigns: t('Marketing.CreatedCampaigns'),
        campaignName: t('Common.Name'),
        customerGroup: t('POS.CustomerGroup'),
        created: t('Common.Created'),
        recipient: t('Marketing.Recipient'),
        revenue: t('Insights.Revenue'),
        preference: `${t('Calendar.SMS')} ${t('Marketing.Preference')}`,
        account: t('Marketing.Account'),
        createNew: t('Marketing.SMSCampaignsCreateNewSMS'),
        editCampaign: t('Marketing.EditCampaign'),
        createNewCampaign: t('Marketing.SMSCampaignsCreateNewSMSCampaign'),
        createNewCampaignDesc: t('Marketing.SMSCampaignsDescription'),
        editCampaignDesc: t('Marketing.SMSCampaignsEditSMSCampaignDesc'),
        cannotEditTriggered: t('Marketing.CannotEditTriggered'),
        createSuccess: t('Marketing.SMSCampaignsCreateSuccess'),
        createError: t('Marketing.CampaignsCreateError'),
    },
};

export const TRIGGER_FLOW_CONFIG: CampaignTypeConfig = {
    type: PostApiCampaignsBodyCampaignType.TRIGGER,
    baseRoute: '/marketing/trigger-flows',
    translationKeys: {
        title: t('Marketing.TriggerFlowsTitle'),
        description: t('Marketing.TriggerFlowsDescription'),
        createCampaign: t('Marketing.CreateCampaign'),
        createdCampaigns: t('Marketing.CreatedCampaigns'),
        campaignName: t('Common.Name'),
        customerGroup: t('POS.CustomerGroup'),
        created: t('Common.Created'),
        recipient: t('Marketing.Recipient'),
        revenue: t('Insights.Revenue'),
        preference: `${t('Marketing.Trigger')} ${t('Marketing.Preference')}`,
        account: t('Marketing.Account'),
        createNew: t('SpOffers.CrCmp'),
        editCampaign: t('Marketing.EditCampaign'),
        createNewCampaign: t('Marketing.CreateCampaign'),
        createNewCampaignDesc: t('Marketing.TriggerFlowsDescription'),
        editCampaignDesc: t('Marketing.TriggerFlowsDescription'),
        cannotEditTriggered: t('Marketing.CannotEditTriggered'),
        updateSuccess: t('Marketing.TriggerFlowsUpdateSuccess'),
        createSuccess: t('Marketing.TriggerFlowsCreateSuccess'),
        createError: t('Marketing.CampaignsCreateError'),
    },
    draftCampaignsKeys: {
        title: t('Marketing.TriggerFlowsDraftCampaigns'),
        description: t('Marketing.DraftCampaignsDescription'),
        createCampaign: t('Marketing.CreateCampaign'),
        createdCampaigns: t('Marketing.CreatedCampaigns'),
        campaignName: t('Common.Name'),
        customerGroup: t('POS.CustomerGroup'),
        created: t('Common.Created'),
    },
};
