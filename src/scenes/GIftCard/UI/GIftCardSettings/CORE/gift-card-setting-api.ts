// @ts-nocheck
import apiFetcher from '@/utils/interCeptor.js';

export class GiftCardSettingApi {
    // #logo upload api
    async UploadImage(file: any) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiFetcher.post(`api/v1/store/file`, formData);
            return response;
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    async DeleteImage(id: any) {
        try {
            const response = await apiFetcher.delete(`api/v1/store/file/${id}`);
            return response;
        } catch (error) {
            console.error(error);
            return error;
        }
    }
}

export const giftCardSettingApi = new GiftCardSettingApi();
