import { AxiosRequestConfig } from 'axios';
import apiFetcher2 from '../../utils/Api/POS/Interceptor2';

export const customFetcher = async <T>(
  config: {
    url: string;
    method: string;
    headers?: Record<string, any>;
    params?: Record<string, any>;
    data?: any;
  },
  _options?: AxiosRequestConfig, // you can forward if needed
): Promise<T> => {
  const { url, method, headers, params, data } = config;

  const response = await apiFetcher2.request<T>({
    url,
    method,
    headers,
    params,
    data,
    withCredentials: true,
  });

  return response.data as T;
};
