import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    GetApiBundleOffersSettings200,
    GetApiGiftCardsSettings200,
    GetApiProductsListing200,
    GetApiProductsListingParams,
    GetApiTax200Item,
} from '../../shared/api/models';
import { useProductService } from '../../hooks/api/pos/products/useProducts';
import { api } from '@/utils/Api/POS';

const POSContext = createContext({} as POSContextType);

export type POSContextType = {
    product: {
        data: GetApiProductsListing200 | null;
        isLoading: boolean;
        error: Error | null;
        refetch: () => void;
    };
    giftCardSettings: {
        data: GetApiGiftCardsSettings200 | null;
        isLoading: boolean;
        error: Error | null;
        refetch: () => void;
    };
    punchCardSettings: {
        data: GetApiBundleOffersSettings200 | null;
        isLoading: boolean;
        error: Error | null;
        refetch: () => void;
    };
    tax: {
        data: GetApiTax200Item[] | null;
        isLoading: boolean;
        error: Error | null;
        refetch: () => void;
    };
};

export const POSProvider = ({ children }: React.PropsWithChildren) => {
    const [giftCardSettings, setGiftCardSettings] = useState<POSContextType['giftCardSettings']>({
        data: null,
        isLoading: false,
        error: null,
        refetch: () => {},
    });
    const [punchCardSettings, setPunchCardSettings] = useState<POSContextType['punchCardSettings']>({
        data: null,
        isLoading: false,
        error: null,
        refetch: () => {},
    });
    const [tax, setTax] = useState<POSContextType['tax']>({
        data: null,
        isLoading: false,
        error: null,
        refetch: () => {},
    });
    // Memoize the parameters to prevent unnecessary re-renders
    const queryParams = useMemo(
        () =>
            ({
                page: 1,
                limit: 10000,
                getServices: false,
                text: '',
            }) as GetApiProductsListingParams,
        [],
    );

    const { data, isLoading, error, refetch } = useProductService(queryParams);

    // get gift card settings
    const getGiftCardSettings = useCallback(async () => {
        try {
            setGiftCardSettings((prev) => ({
                ...prev,
                isLoading: true,
            }));
            const response = await api.getApiGiftCardsSettings();
            setGiftCardSettings((prev) => ({
                ...prev,
                data: response,
                isLoading: false,
            }));
        } catch (error) {
            console.error('Error fetching gift card settings:', error);
        } finally {
            setGiftCardSettings((prev) => ({
                ...prev,
                isLoading: false,
            }));
        }
    }, []);
    const getPunchCardSettings = useCallback(async () => {
        try {
            setPunchCardSettings((prev) => ({
                ...prev,
                isLoading: true,
            }));
            const response = await api.getApiBundleOffersSettings();
            setPunchCardSettings((prev) => ({
                ...prev,
                data: response,
                isLoading: false,
            }));
        } catch (error) {
            console.error('Error fetching punch card settings:', error);
        } finally {
            setPunchCardSettings((prev) => ({
                ...prev,
                isLoading: false,
            }));
        }
    }, []);

    // get tax
    const getTax = useCallback(async () => {
        try {
            setTax((prev) => ({
                ...prev,
                isLoading: true,
            }));
            const response = await api.getApiTax();
            setTax((prev) => ({
                ...prev,
                data: response,
                isLoading: false,
            }));
        } catch (error) {
            console.error('Error fetching tax:', error);
        } finally {
            setTax((prev) => ({
                ...prev,
                isLoading: false,
            }));
        }
    }, []);

    useEffect(() => {
        getGiftCardSettings();
        getPunchCardSettings();
        getTax();
    }, [getGiftCardSettings, getPunchCardSettings, getTax]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => {
        const product = { data, isLoading, error, refetch };
        return {
            product,
            giftCardSettings: { ...giftCardSettings, refetch: getGiftCardSettings },
            punchCardSettings: { ...punchCardSettings, refetch: getPunchCardSettings },
            tax: { ...tax, refetch: getTax },
        };
    }, [
        data,
        isLoading,
        error,
        refetch,
        giftCardSettings,
        punchCardSettings,
        tax,
        getGiftCardSettings,
        getPunchCardSettings,
        getTax,
    ]);

    return <POSContext.Provider value={contextValue}>{children}</POSContext.Provider>;
};

export const usePOS = () => useContext(POSContext);
