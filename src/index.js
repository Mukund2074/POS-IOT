import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './theme/theme.css'; // Theme CSS variables
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/locales';
import { Provider } from 'react-redux';
import store, { persistor } from './context/store';
import { PersistGate } from 'redux-persist/integration/react';
import * as Sentry from '@sentry/react';
import { POSProvider } from './context/POS/POSContext';
import { CartProvider } from './context/POS/CartContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './context/SocketContext';
import { DataProvider } from './context/DataContext';
import { router } from './router';
import { RouterProvider } from 'react-router-dom';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
        Sentry.consoleLoggingIntegration({ levels: ['error'] }),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    enabled: process.env.REACT_APP_NODE_ENV === 'production',
    enableLogs: true,
});

const root = ReactDOM.createRoot(document.getElementById('root')); // Import the service worker to enable

if ('serviceWorker' in navigator) {
    // Unregister all existing service workers
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
            registration.unregister();
        });
    });
}
if (window.caches) {
    caches.keys().then((names) => {
        names.forEach((name) => {
            caches.delete(name);
        });
    });
}

const Main = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <I18nextProvider i18n={i18n}>
                        <SocketProvider>
                            <POSProvider>
                                <CartProvider>
                                    <DataProvider>
                                        <RouterProvider router={router} />
                                    </DataProvider>
                                </CartProvider>
                            </POSProvider>
                        </SocketProvider>
                    </I18nextProvider>
                </PersistGate>
            </Provider>
        </QueryClientProvider>
    );
};

root.render(<Main />);
