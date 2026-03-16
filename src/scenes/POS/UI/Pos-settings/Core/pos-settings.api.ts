// @ts-expect-error: JS module, no types
import apiFetcher from '@/utils/interCeptor';
import { PosSetting } from '../Types/pos-settings.types';
import { HttpStatusCode } from 'axios';
import { api } from '@/utils/Api/POS';

export class PosSettingsApi {
    //methods

    // #1 Get all pos settings
    async getPosSettings() {
        try {
            const response = await apiFetcher.get('/api/v1/store/outlet/setting');
            if (response.status === HttpStatusCode.Ok) {
                return response?.data?.data;
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    // #2 Update a pos setting
    async updatePosSetting(payload: PosSetting) {
        try {
            const response = await apiFetcher.patch('/api/v1/store/outlet/setting', payload);
            if (response.status === HttpStatusCode.Ok) {
                return response?.data?.data;
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    // #3 Reconnect terminal
    async reconnectTerminal() {
        try {
            const response = await api.getApiIotConnectionStatus();
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
