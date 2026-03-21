
import axios, { HttpStatusCode } from 'axios';

const apiFetcher = axios.create({
    baseURL: process.env.REACT_APP_URL,
});

// Add request interceptor to include Authorization header
apiFetcher.interceptors.request.use(
    (config) => {
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor
apiFetcher.interceptors.response.use(
    (response) => {
        // if (response.status === HttpStatusCode.Ok) {
        //     return response;
        // } else {
        //     return Promise.reject(`Error: ${response.status}`);
        // }
        if (response.status === HttpStatusCode.Ok) {
            return response;
        } else if (response.status === HttpStatusCode.Forbidden) {
            return Promise.reject('Forbidden');
        } else if (response.status === HttpStatusCode.BadRequest) {
            return Promise.reject('Bad Request');
        } else if (response.status === HttpStatusCode.NotFound) {
            return Promise.reject('Not Found');
        } else if (response.status === HttpStatusCode.InternalServerError) {
            return Promise.reject('Internal Server Error');
        } else if (response.status === HttpStatusCode.ServiceUnavailable) {
            return Promise.reject('Service Unavailable');
        } else if (response.status === HttpStatusCode.Unauthorized) {
            return Promise.reject('Unauthorized');
        }
    },
    (error) => {
        if (error.response.status === HttpStatusCode.Forbidden) {
            window.location.href = '/';
            localStorage.clear();
            return Promise.reject('Forbidden');
        }
        return Promise.reject(error);
    },
);

export default apiFetcher;
