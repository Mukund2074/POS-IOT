import {
    PutApiEconomicConfigBodyCoaConfigurationCARD,
    PutApiEconomicConfigBodyCoaConfigurationCUTCARD,
    PutApiEconomicConfigBodyCoaConfigurationGIFTCARD,
    PutApiEconomicConfigBodyCoaConfigurationMOBILEPAY,
    PutApiEconomicConfigBodyCoaConfigurationOUTSTANDING,
    PutApiEconomicConfigBodyCoaConfigurationPRODUCTGROUP,
} from '@/shared/api/models';

export type CoaConfigType = {
    coaConfiguration: {
        CASH: number;
        CARD: PutApiEconomicConfigBodyCoaConfigurationCARD;
        CUT_CARD: PutApiEconomicConfigBodyCoaConfigurationCUTCARD;
        GIFT_CARD: PutApiEconomicConfigBodyCoaConfigurationGIFTCARD;
        MOBILE_PAY: PutApiEconomicConfigBodyCoaConfigurationMOBILEPAY;
        OUTSTANDING: PutApiEconomicConfigBodyCoaConfigurationOUTSTANDING;
        BANK_TRANSFER: number;
        salesWithVat: number;
        salesWithoutVat: number;
        PRODUCT_GROUP: PutApiEconomicConfigBodyCoaConfigurationPRODUCTGROUP;
        CUSTOMER_GROUP: number;
    };
    sendEmail: boolean;
};

type AddonMeta = {
    authUrl?: string;
} | null;

type Addon = {
    id: number;
    label: string;
    isActive: boolean;
    meta: AddonMeta;
    isAvailableOnStore?: boolean;
};

export type CategoryAddon = {
    categoryId: number;
    category: string;
    addons: Addon[];
};

export interface POSIntegrationPropsType {
    CategoryAddons: CategoryAddon;
    fetchData: () => void;
    isLoading? : boolean;
}
