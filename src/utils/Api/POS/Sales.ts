import { api } from '.';
import { GetApiPreviousSalesItemsCustomerIdParams, PostApiSaleBody } from '../../../shared/api/models';

export const GetSalesListingApi = async () => {
    try {
        const response = await api.getApiSalesList();
        return response;
    } catch (error) {
        throw error;
    }
};

export const CreateSaleApi = async (data: PostApiSaleBody) => {
    try {
        const response = await api.postApiSale(data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const GetPreviousSalesApi = async ({
    customerId,
    params,
}: {
    customerId: number;
    params?: GetApiPreviousSalesItemsCustomerIdParams;
}) => {
    try {
        const response = await api.getApiPreviousSalesItemsCustomerId(customerId, params);
        return response;
    } catch (error) {
        throw error;
    }
};
