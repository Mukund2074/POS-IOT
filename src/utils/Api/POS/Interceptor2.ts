import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Custom params serializer to handle arrays without brackets
const paramsSerializer = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value === null || value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            // Serialize arrays without brackets: campaign_status=SCHEDULED&campaign_status=TRIGGERED
            value.forEach((item) => {
                searchParams.append(key, String(item));
            });
        } else {
            searchParams.append(key, String(value));
        }
    });

    return searchParams.toString();
};

// Create the Axios instance
const apiFetcher2: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_URL2,
    paramsSerializer,
});

const WHITE_LIST_URLS: string[] = [
    // Integration endpoints
    'api/billy/export',
    'api/bookings/export',
    'api/addons',
    'api/services/export',
    'api/service-groups/:id/driving-fees',
    '/api/webhooks',
    '/api/webhooks/:id',
    // Campaign endpoints
    'api/campaigns',
    'api/campaigns/statistics',
    'api/campaigns/:id/status',
    'api/campaigns/:id/trigger',
    'api/campaigns/:id/send-test-email',
    'api/recipients',
    'api/trigger-templates',
    'api/campaigns/email/overview',
    'api/campaigns/sms/overview',
    // Customer groups endpoints
    'api/customer-groups',
    'api/customer-groups/:id',
    'api/customer-groups/:id/customers',
    'api/customer-groups/:id/members',
    'api/customers/:customerId/groups',
    // Google Calendar endpoints
    '/api/google-calendar/settings',
    '/api/google-calendar/auth-url',
    '/api/google-calendar/callback',
    '/api/google-calendar/disconnect',
    '/api/google-calendar/status',
    '/api/google-calendar/booking-sync',
    '/api/google-calendar/booking-sync-by-group-uuid',
    '/api/google-calendar/booking-status-by-group-uuid',
    '/api/google-calendar/webhook',
    '/api/google-calendar/status',
    // Calendly endpoints
    '/api/calendly/auth-url',
    '/api/calendly/callback',
    '/api/calendly/disconnect',
    '/api/calendly/status',
    '/api/services/employee-assign',
    // Health Declaration
    '/api/health-declarations',
    '/api/health-declaration-template',
    '/api/health-declaration-templates',
    '/api/health-declaration-template/:id',
    '/api/health-declaration/booking',
    '/api/health-declaration/booking/:id/send-email',
    '/api/health-declaration/',
    // Doctors portal (Node API)
    '/api/doctors-portal/doctors',
    '/api/doctors-portal/invite',
    // Advance reminder template
    '/api/service/advanced-reminder-templates',
    '/api/service/advanced-reminder-templates/:reminderTemplateId',
    // Deposit
    '/api/services/deposit',
];

// Helper function to check if POS is enabled
const isPOSEnabled = (): boolean => {
    try {
        // Access Redux store from localStorage
        const storeData = localStorage.getItem('persist:settings');
        if (storeData) {
            const parsedData = JSON.parse(storeData);
            const settingsData = JSON.parse(parsedData.data || '{}');
            const outletAddons = settingsData?.profile?.outlet_addons || [];
            return outletAddons.some((addon: any) => addon.addon_category === 'pos');
        }
        return false;
    } catch (error) {
        console.warn('Error checking POS status:', error);
        return false;
    }
};

// Helper function to check if URL is in whitelist
const isWhitelistURL = (url: string): boolean => {
    return WHITE_LIST_URLS.some((whitelistUrl) => url.includes(whitelistUrl));
};

// Request Interceptor: Add Bearer token and check POS status
apiFetcher2.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }

        // Check if POS is enabled, if not, block request unless it's a whitelist URL
        const currentUrl = config.url || '';
        const isPOSActive = isPOSEnabled();

        if (!isPOSActive) {
            if (!isWhitelistURL(currentUrl)) {
                // Throw an error to block the request
                throw new Error('POS is not enabled. This request is blocked.');
            }
        }

        return config;
    },
    (error) => {
        return error;
    },
);

// Response Interceptor: Handle common HTTP status codes
apiFetcher2.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        return response as AxiosResponse;
    },
    (error) => {
        throw error;
    },
);

export default apiFetcher2;
