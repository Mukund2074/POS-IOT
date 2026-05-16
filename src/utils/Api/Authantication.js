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

export const adminLoginApi = async ({ payload }) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/admin/login`, payload);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const verifyAdminOTPApi = async ({ payload }) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/admin/verifyOTP`, payload);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};
export const getStoresApi = async ({ limit = 25, offset = 0, search = '' }) => {
    try {
        const response = await apiFetcher.get(`api/v1/admin/outlet?limit=${limit}&offset=${offset}&search=${search}`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const createStoreApi = async ({ payload }) => {
    try {
        const response = await apiFetcher.post(`api/v1/admin/outlet`, payload);
        if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const approveStoreApi = async ({ outlet_id, approve }) => {
    try {
        const response = await apiFetcher.post(`api/v1/admin/outlet/approve?outlet_id=${outlet_id}&approve=${approve}`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const deleteStoreApi = async ({ outlet_id }) => {
    try {
        const response = await apiFetcher.delete(`api/v1/admin/outlet/${outlet_id}`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const getStoreDetailApi = async ({ outlet_id }) => {
    try {
        const response = await apiFetcher.get(`api/v1/admin/outlet/${outlet_id}`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const updateStoreApi = async ({ outlet_id, payload }) => {
    try {
        const response = await apiFetcher.patch(`api/v1/admin/outlet/${outlet_id}`, payload);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const getEmployeesApi = async ({ outlet_id, limit = 25, offset = 0 }) => {
    try {
        const response = await apiFetcher.get(`api/v1/admin/employee?outlet_id=${outlet_id}&limit=${limit}&offset=${offset}&include_invited=true`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const createEmployeeApi = async ({ payload }) => {
    try {
        const response = await apiFetcher.post(`api/v1/admin/employee`, payload);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const deleteEmployeeApi = async ({ employee_id }) => {
    try {
        const response = await apiFetcher.delete(`api/v1/admin/employee/${employee_id}`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        throw new Error(error);
    }
};
