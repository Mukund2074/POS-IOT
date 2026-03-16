import React from 'react';
import {
    CreditCard as CardsIcon,
    AttachMoney as CashIcon,
    PhoneAndroid as MobilePayIcon,
    AccountBalance as BankTransferIcon,
    Schedule as OutstandingIcon,
    Receipt as ReceivableIcon,
    CardGiftcard as GiftCardIcon,
    PointOfSale as CardTerminalIcon,
} from '@mui/icons-material';
import { overridePayment } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';

/**
 * Helper function to get payment method icon by type
 */
export const getPaymentMethodIcon = (paymentType: string, payment?: overridePayment): React.ReactNode => {
    // Check if it's a card terminal payment (converted from CARD_TERMINAL to CARD with terminal info)
    if (paymentType === 'CARD' && payment && payment?.paymentId) {
        return <CardsIcon />; // Use card terminal icon (same as card for now, but can be different)
    }

    const iconMap: Record<string, React.ReactNode> = {
        CARD: <CardsIcon />,
        CARD_TERMINAL: <CardTerminalIcon />, // Card terminal uses same icon as card
        CASH: <CashIcon />,
        MOBILE_PAY: <MobilePayIcon />,
        BANK_TRANSFER: <BankTransferIcon />,
        OUTSTANDING: <OutstandingIcon />,
        GIFT_CARD: <GiftCardIcon />,
        ECOMMERCE: <ReceivableIcon />,
        CUT_CARD: <ReceivableIcon />,
    };
    return iconMap[paymentType] || <ReceivableIcon />;
};
