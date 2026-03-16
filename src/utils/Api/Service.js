import { HttpStatusCode } from 'axios';
import apiFetcher from '../interCeptor';
import apiFetcher2 from './POS/Interceptor2';

export async function GetServiceTypes() {
    try {
        const response = await apiFetcher.get(`api/v1/store/service/service_types`);
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
}

export async function CreateService({ METHOD, API, formData }) {
    try {
        const response = await apiFetcher({ method: METHOD, url: API, data: formData });
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
}

export async function GetServiceGroup() {
    try {
        const response = await apiFetcher.get(`api/v1/store/service_group`);
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
}

export async function DeleteService({ isGroup, id, soft_delete = true }) {
    try {
        const response = await apiFetcher.delete(
            `api/v1/store/${isGroup ? 'service_group' : 'service'}/${id}?soft_delete=${soft_delete}`,
        );
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
}

export async function ExportServicesApi() {
    try {
        const response = await apiFetcher2.get('api/services/export');
        return response;
    } catch (error) {
        throw new Error(error);
    }
}
