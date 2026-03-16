import axios, { HttpStatusCode } from "axios";
import apiFetcher from "../interCeptor";

export const authLogin = async ({ payload }) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/store/auth/login`, payload);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error)
    }
};

export const getLocationsApi = async () => {
    try {
        const response = await apiFetcher.get(`api/v1/store/get_accounts`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error)
    }
}


export const getOTPApi = async ({ payload }) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/auth/requestOTP`, payload);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error)
    }
}

export const authEmployeeApi = async ({ token, employee_id, access_code }) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/store/auth/employee_login`, {
            id: employee_id,
            access_code
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error)
    }
}

export const resetPasswordApi = async ({ token, password }) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/store/auth/resetPassword`, {
            token,
            password
        });
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error)
    }
}

export const requestOTPApi = async ({ payload }) => {
    try {
        const response = await apiFetcher.post(`api/v1/store/auth/requestOTP`, payload);
        if (response.status === HttpStatusCode.Ok) {
            return response;
        }
    } catch (error) {
        throw new Error(error)
    }
}