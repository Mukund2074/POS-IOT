export type PredifinedAmount = {
    value: number;
    onlineAvailable: boolean;
};

export type CommonLayoutProps = {
    children: React.ReactNode;
    HeadingText: string;
    descriptionText: string;
    text?: string;
    error?: string | boolean;
};

export type TaxId = {
    label: string;
    id: string;
    taxRate: number;
    isActive: boolean;
};

export type giftCardAttachmentType = {
    id: number;
    created_at: string;
    deleted_at: string | null;
    url: string;
    file_name: string;
    updated_at: string | null;
    denmark_created_at: string;
};

export type GiftCardSettingsFormValues = {
    taxIds: TaxId[];
    expiryMonths: number;
    sendDesignBySale: boolean;
    cardColor: string;
    personalMessage: string;
    predefinedAmounts: PredifinedAmount[];
    onlineSaleDescription: string;
    showServiceOnDesign: boolean;
    GiftCardAttachment: giftCardAttachmentType | null;
};
