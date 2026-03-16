import { Service } from '../../punch-card/Types/punch-card-api.types';
import { QueryClient } from '@tanstack/react-query';

export class SoldPunchCardApi {
    private serviceList: Service[];
    private queryClient: QueryClient;
    private toast: (message: string, type: 'success' | 'error') => void;
    private navigate: (path: string) => void;

    constructor(
        showToast: (message: string, type: 'success' | 'error') => void,
        navigate: (path: string) => void,
        queryClient: QueryClient,
    ) {
        this.serviceList = [];
        this.queryClient = queryClient;
        this.toast = showToast;
        this.navigate = navigate;
    }
}
