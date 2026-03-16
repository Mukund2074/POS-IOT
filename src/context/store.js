import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { persistReducer, persistStore } from 'redux-persist';
import PermissionSlice from './permissionSlice';
import SettingsSlice from './settingsSlice';
import RouteSlice from './routeSlice';
import CampaignsSlice from '../redux/slices/Marketing/campaigns/campaignsSlice';
import TriggerFlowSlice from '../redux/slices/Marketing/triggerFlow/triggerFlowSlice';
import PaymentModalSlice from '@/redux/slices/Sales/payment/paymentModalSlice';

// Configuration for redux-persist
const persistConfig = {
    key: 'root',
    storage,
};

const settingPersistConfig = {
    key: 'settings',
    storage,
};

const routePersistConfig = {
    key: 'route',
    storage,
};

const campaignsPersistConfig = {
    key: 'campaigns',
    storage,
    whitelist: [
        'currentStep',
        'stepsCompleted',
        'campaignData',
        'editingCampaignId',
        'createdCampaign',
        'campaignType',
        'testCampaign',
    ],
};

const triggerFlowPersistConfig = {
    key: 'triggerFlow',
    storage,
};
const paymentModalPersistConfig = {
    key: 'paymentModal',
    storage,
    // Persist modal and UI state
    whitelist: [],
};

const persistedReducer = persistReducer(persistConfig, PermissionSlice);
const persistedSettingsReducer = persistReducer(settingPersistConfig, SettingsSlice);
const persistedRouteReducer = persistReducer(routePersistConfig, RouteSlice);
const persistedCampaignsReducer = persistReducer(campaignsPersistConfig, CampaignsSlice);
const persistedTriggerFlowReducer = persistReducer(triggerFlowPersistConfig, TriggerFlowSlice);
const persistedPaymentModalReducer = persistReducer(paymentModalPersistConfig, PaymentModalSlice);

const store = configureStore({
    reducer: {
        user: persistedReducer,
        settings: persistedSettingsReducer,
        route: persistedRouteReducer,
        campaigns: persistedCampaignsReducer,
        triggerFlow: persistedTriggerFlowReducer,
        paymentModal: persistedPaymentModalReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore redux-persist actions which contain non-serializable functions
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
            },
        }),
});

export const persistor = persistStore(store);
export default store;
