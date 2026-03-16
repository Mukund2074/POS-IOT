import { HttpStatusCode } from 'axios';
import apiFetcher from '../interCeptor';

export const GetTimingsApi = async ({ params, body, byEmoployee = false }) => {
    try {
        let url;
        if (params?.booking_id) {
            url = `api/v1/store/booking/timings?service_id=${params.service_id}&date=${params.date}&employee_id=${params.employee_id}&custom_duration=${params.custom_duration}&whole_day=true&ignore_booking_id=${params.booking_id}`;
        } else if (byEmoployee) {
            url = `api/v1/store/booking/multi-timings-by-employee?date=${params?.date}&ignore_booking_id=${params?.ignore_booking_id}&whole_day=true&consider_employee_hours=false`;
        } else {
            url = `api/v1/store/booking/timings?service_id=${params.service_id}&date=${params.date}&employee_id=${params.employee_id}&custom_duration=${params.custom_duration}&whole_day=true`;
        }
        const response = await apiFetcher.post(url, body);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const CreateBookingApi = async ({ isEdit, body }) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/booking/${isEdit ? 'edit-multi' : 'multi'}`, body);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const DeleteBookingApi = async ({ body, soft_delete = true }) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/booking/delete?soft_delete=${soft_delete}`, body);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const GetFormNotificationApi = async () => {
    try {
        const response = await apiFetcher.get(`api/v1/store/form-notifications`);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const ReadFormNotificationApi = async ({ id }) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/form-notifications/${id}/read`);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const SendFormEmailApi = async ({ id }) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/booking/send-customer-info-email/${id}`);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const SendFormSmsApi = async ({ id }) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/booking/send-customer-info-sms/${id}`);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const getInspectionExtraCostApi = async ({ zip_code, latitude, longitude, service_group_ids }) => {
    const payloadParams = {
        customer_zip_code: zip_code,
        customer_latitude: latitude,
        customer_longitude: longitude,
        service_group_ids: service_group_ids,
    };
    try {
        const response = await apiFetcher.get(
            `api/v1/store/booking/get_inspection_extra_cost?${new URLSearchParams(payloadParams).toString()}`,
        );
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};
