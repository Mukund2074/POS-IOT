import React from 'react';
import { t } from 'i18next';
import {
    CreditCard as CardsIcon,
    AttachMoney as CashIcon,
    PhoneAndroid as MobilePayIcon,
    AccountBalance as BankTransferIcon,
    Schedule as OutstandingIcon,
    CardGiftcard as GiftCardIcon,
    StyleOutlined as CutCardIcon,
    AccountBalanceWallet as BonusIcon,
    PointOfSale as CardTerminalIcon,
} from '@mui/icons-material';
import { PaymentMethod } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';

// Define base methods once
export const BASE_METHODS: PaymentMethod[] = [
    { id: '1', name: t('POS.Cards'), icon: <CardsIcon />, type: 'CARD' },
    { id: '2', name: t('POS.Cash'), icon: <CashIcon />, type: 'CASH' },
    { id: '3', name: t('POS.MobilePay'), icon: <MobilePayIcon />, type: 'MOBILE_PAY' },
    { id: '4', name: t('POS.BankTransfer'), icon: <BankTransferIcon />, type: 'BANK_TRANSFER' },
    { id: '5', name: t('POS.Outstanding'), icon: <OutstandingIcon />, type: 'OUTSTANDING' },
    { id: '6', name: t('POS.GiftCard'), icon: <GiftCardIcon />, type: 'GIFT_CARD' },
    { id: '7', name: t('PunchCard.PunchCard'), icon: <CutCardIcon />, type: 'CUT_CARD' },
    { id: '8', name: t('POS.Bonus'), icon: <BonusIcon />, type: 'BONUS' },
    { id: '9', name: t('POS.CardTerminal'), icon: <CardTerminalIcon />, type: 'CARD_TERMINAL' },
];

// Exclusion rules
export const EXCLUDE_FOR_CREDIT_SALE: PaymentMethod['type'][] = [
    'GIFT_CARD',
    'OUTSTANDING',
    'CUT_CARD',
    'MOBILE_PAY',
    'CARD',
    'BONUS',
    'CARD_TERMINAL',
];

export const EXCLUDE_FOR_EDIT_SALE: PaymentMethod['type'][] = [
    'GIFT_CARD',
    'CUT_CARD',
    'MOBILE_PAY',
    'CARD',
    'OUTSTANDING',
    'BONUS',
    'CARD_TERMINAL',
];

export const getPaymentMethods = (
    asCreditSale: boolean,
    asEditSale: boolean,
    customerBonusAmount: number = 0,
    storeSettings?: any,
): PaymentMethod[] => {
    const addons = storeSettings?.profile?.outlet_addons ?? [];
    const posSettings = storeSettings?.posSetting?.value?.paymentOptions ?? {};

    const isPOSAvailable = addons.some((addon: any) => addon.addon_name === 'POS');
    const isAddonEnabled = (addonName: string) => addons.some((addon: any) => addon.addon_name === addonName);

    return BASE_METHODS.filter((method) => {
        const { type } = method;

        // Credit sale restriction
        if (asCreditSale && EXCLUDE_FOR_CREDIT_SALE.includes(type)) return false;

        // Edit sale restriction
        if (asEditSale && EXCLUDE_FOR_EDIT_SALE.includes(type)) return false;

        // Bonus requires balance
        if (!asCreditSale && !asEditSale && type === 'BONUS' && customerBonusAmount <= 0) {
            return false;
        }

        // Addon-based restrictions
        if (!isPOSAvailable && ['GIFT_CARD', 'CUT_CARD'].includes(type)) return false;
        if (type === 'GIFT_CARD' && !isAddonEnabled('GiftCard')) return false;
        if (type === 'CUT_CARD' && !isAddonEnabled('PunchCard')) return false;

        // POS terminal restrictions
        if (type === 'CARD_TERMINAL' && !posSettings.cardTerminal) return false;
        if (type === 'CARD' && !posSettings.card) return false;
        if (type === 'BANK_TRANSFER' && !posSettings.bankTransfer) return false;
        if (type === 'MOBILE_PAY' && !posSettings.mobilePay) return false;

        return true;
    });
};
