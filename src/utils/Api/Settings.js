import { HttpStatusCode } from 'axios';
import apiFetcher from '../interCeptor';
// eslint-disable-next-line no-unused-vars
import apiFetcher2 from '../Api/POS/Interceptor2';

export async function GetProfileInfoApi() {
    try {
        const response = await apiFetcher.get('/api/v1/store/profile/info');
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
}

export async function ExportBookingsApi({ params, shouldIncludeCreatedBy = false }) {
    let url = `/api/bookings/export?fromDate=${params?.fromDate}&toDate=${params?.toDate}&status=${params?.status}&dateType=${params?.dateType}`;
    if (params?.employeeId) {
        url += `&employeeId=${params?.employeeId}`;
    }
    if (params.serviceId) {
        url += `&serviceId=${params?.serviceId}`;
    }
    if (shouldIncludeCreatedBy) {
        url += `&include_created_by=true`;
    }
    try {
        const response = await apiFetcher2.get(url);
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
}
