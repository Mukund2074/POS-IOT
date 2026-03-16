import { HttpStatusCode } from "axios"
import apiFetcher from "../interCeptor"

export const CreateEmployeeApi = async ({ formdata }) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/employee`, formdata)
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error)
    }
}

export const DeleteEmployeeApi = async ({ id, soft_delete = true }) => {
    try {
        const response = await apiFetcher.delete(`api/v1/store/employee/${id}?soft_delete=${soft_delete}`)
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error)
    }
}

export const GetEmpOpeningHourApi = async () => {
    try {
        const response = await apiFetcher.get(`api/v1/store/opening_hour`);
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error)
    }
}

export const GetPublicHolidaysApi = async ({ currentYear }) => {
    try {
        const response = await apiFetcher.get(`/api/v1/store/opening_hour/public/holidays?year=${currentYear}`);
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error)
    }
}

export const UpdateOpeningHourApi = async ({ payload }) => {
    try {
        const response = await apiFetcher.patch(`api/v1/store/opening_hour`, payload);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response;
        }
    } catch (error) {
        throw new Error(error)
    }
}