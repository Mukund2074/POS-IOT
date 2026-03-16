import { PostApiSendSalesEmailBody } from '@/shared/api/models';
import { t } from 'i18next';
import { CustomerListingSchema, CustomerListingSchemaParams } from '../Types/sales.types';
// @ts-ignore
import { GetCustomersApi } from '@/utils/Api/Customer';

import { ToastSchema } from '@/scenes/POS/Types';
import { api } from '@/utils/Api/POS';
import { AxiosError } from 'axios';

export class SalesApi {
    async getCustomers({
        params,
        setCustomers,
        showToast = () => {},
        setLoading = () => {},
    }: {
        params: CustomerListingSchemaParams;
        setCustomers: React.Dispatch<React.SetStateAction<CustomerListingSchema[]>>;
        showToast: ToastSchema;
        setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    }) {
        try {
            setLoading(true);
            const response = await GetCustomersApi(params);
            setCustomers(response.data?.data?.data ?? []);
        } catch (error) {
            showToast(t('POS.ToastErrGetCustomers'), 'error');
        } finally {
            setLoading(false);
        }
    }

    async sendEmailReceipt({ body }: { body: PostApiSendSalesEmailBody }) {
        try {
            await api.postApiSendSalesEmail(body);
        } catch (error) {
            throw error;
        }
    }

    async cancelSale({ invoiceId, showToast = () => {} }: { invoiceId: string; showToast?: ToastSchema }) {
        try {
            await api.deleteApiSalesId(invoiceId);
            showToast(t('POS.ToastSuccCancelSale'), 'success');
        } catch (error) {
            if (error instanceof AxiosError) {
                showToast(error.response?.data?.msg ?? t('POS.ToastErrCancelSale'), 'error');
            } else {
                showToast(t('POS.ToastErrCancelSale'), 'error');
            }
        }
    }

    async sendEmailReceiptOnSaleCreated({ body }: { body: PostApiSendSalesEmailBody }) {
        try {
            await api.postApiSendSalesEmail(body);
        } catch (error) {
            console.error(error);
        }
    }
}

export const salesApi = new SalesApi();
