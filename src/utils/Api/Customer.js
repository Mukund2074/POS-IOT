import { HttpStatusCode } from 'axios';
import apiFetcher from '../interCeptor';

export const CreateCustomerApi = async (payload) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/customer/outlet`, payload);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw error;
    }
};
export const DeleteCustomerApi = async (id, soft_delete = true) => {
    try {
        const response = await apiFetcher.delete(`api/v1/store/customer?id=${id}&soft_delete=${soft_delete}`);
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const GetCustomerByIdApi = async (id) => {
    try {
        const response = await apiFetcher.get(`api/v1/store/customer/${id}`);
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const getCustomerBookingsApi = async ({ id, params = {} }) => {
    try {
        const response = await apiFetcher.get(`api/v1/store/customer/booking/${id}`, { params });
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const BlockCustomerApi = async (payload) => {
    try {
        const res = await apiFetcher.patch(`api/v1/store/customer/outlet?id=${payload?.id}`, payload);
        if (res.status === HttpStatusCode.Ok) {
            return res;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const SendBookingConfirmationEmailApi = async ({ payload }) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/booking/advance-journal-booking-email`, payload);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const GetCustomersApi = async (payload) => {
    try {
        const response = await apiFetcher.get(
            `api/v1/store/customer/outlet?search=${payload?.search}&employees=${payload?.employees}&offset=${payload?.offset}&limit=${payload?.limit}&sort_by=${payload?.sort_by}&sort=${payload?.sort}`,
        );
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};
