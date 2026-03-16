import { GetApiProductsId200InventoryTransactionItemTransactionType } from '@/shared/api/models';
import { t } from 'i18next';

export const getTransactionType = (transactionType: GetApiProductsId200InventoryTransactionItemTransactionType) => {
    switch (transactionType) {
        case 'RESTOCKED':
            return t('POS.Restocked');
        case 'SOLD':
            return t('POS.Sold');
        case 'RETURNED-TO-SUPPLIER':
            return t('POS.ReturnedToSupplier');
        case 'TRANSFERRED':
            return t('POS.Transferred');
        case 'DAMAGED':
            return t('POS.Damaged');
        case 'LOST':
            return t('POS.Lost');
        case 'RE-COUNTED':
            return t('POS.ReCounted');
        case 'REFUNDED':
            return t('POS.Refunded');
        case 'THEFT':
            return t('POS.Theft');
        case 'EXPIRED':
            return t('POS.Expired');
        case 'RECEIVED':
            return t('POS.NewItem');
        case 'RETURNED':
            return t('POS.Returned');
        default:
            return '';
    }
};
