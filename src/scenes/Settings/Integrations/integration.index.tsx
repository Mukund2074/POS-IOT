import React, { useEffect, useState } from 'react';
import POSIntegration from './UI/List/POSIntegration';
import { Box, Divider } from '@mui/material';
import POSRatingAndReview from './UI/List/RatingAndReview/POSRatingAndReview';
import POSCrm from './UI/List/CRM/POSCrm';
import apiFetcher2 from '@/utils/Api/POS/Interceptor2';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { CategoryAddon } from './Types/Integration-type';
import { useSelector } from 'react-redux';
import SyncBookings from './UI/List/SyncBooking/SyncBookings';

//@ts-ignore
import { dividerSx } from '../../../scenes/Settings/Index';

const dummyAddonsJson = require('./Core/dummy-addons.json') as { data: { data: CategoryAddon[] } };
const DUMMY_ADDONS: CategoryAddon[] = dummyAddonsJson?.data?.data ?? [];

function mergeAddonsWithApi(base: CategoryAddon[], apiData: CategoryAddon[] | undefined): CategoryAddon[] {
    if (!apiData?.length) return base;

    // Merge base categories with API data
    const mergedCategories = base.map((category) => {
        const apiCategory = apiData.find((c) => c.categoryId === category.categoryId);
        if (!apiCategory?.addons?.length) return category;

        // Merge base addons with API addons
        const mergedAddons = category.addons.map((addon) => {
            const apiAddon = apiCategory.addons.find((a) => a.id === addon.id);
            if (!apiAddon) return { ...addon, isAvailableOnStore: false };
            return {
                ...addon,
                isActive: apiAddon.isActive,
                meta: apiAddon.meta ?? addon.meta,
                isAvailableOnStore: true,
            };
        });

        // Add any API addons that don't exist in base
        const baseAddonIds = new Set(category.addons.map((a) => a.id));
        const newApiAddons = apiCategory.addons
            .filter((apiAddon) => !baseAddonIds.has(apiAddon.id))
            .map((apiAddon) => ({ ...apiAddon, isAvailableOnStore: true }));

        return { ...category, addons: [...mergedAddons, ...newApiAddons] };
    });

    // Add any API categories that don't exist in base
    const baseCategoryIds = new Set(base.map((c) => c.categoryId));
    const newApiCategories = apiData
        .filter((apiCategory) => !baseCategoryIds.has(apiCategory.categoryId))
        .map((apiCategory) => ({
            ...apiCategory,
            addons: apiCategory.addons.map((addon) => ({ ...addon, isAvailableOnStore: true })),
        }));

    return [...mergedCategories, ...newApiCategories];
}

const IntegrationPage = () => {
    const [addonData, setAddonData] = useState<CategoryAddon[]>(DUMMY_ADDONS);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const settings = useSelector((state: any) => state?.settings.data);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await apiFetcher2.get('/api/addons');
            const apiData = response?.data?.data as CategoryAddon[] | undefined;
            setAddonData(mergeAddonsWithApi(DUMMY_ADDONS, apiData));
        } catch (err) {
            setError(t('Integration.FailedToLoadIntegration'));
            toast.error(error);
            setAddonData(DUMMY_ADDONS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const posCategory = addonData.find((d) => d.categoryId === 1);
    const ratingCategory = addonData.find((d) => d.categoryId === 3);
    const crmCategory = addonData.find((d) => d.categoryId === 4);
    const syncCategory = addonData.find((d) => d.categoryId === 5);

    return (
        <Box sx={{ mt: 5, mx: 4, pb: 5 }}>
            {posCategory && (
                <>
                    <POSIntegration
                        CategoryAddon={posCategory}
                        fetchData={fetchData}
                        settings={settings}
                        isLoading={isLoading}
                    />
                    <Divider sx={{ ...dividerSx, my: 0 }} />
                </>
            )}
            {ratingCategory && (
                <>
                    <POSRatingAndReview CategoryAddons={ratingCategory} fetchData={fetchData} isLoading={isLoading} />
                    <Divider sx={{ ...dividerSx, my: 0 }} />
                </>
            )}
            {crmCategory && (
                <>
                    <POSCrm CategoryAddons={crmCategory} fetchData={fetchData} isLoading={isLoading} />
                    <Divider sx={{ ...dividerSx, my: 0 }} />
                </>
            )}
            {syncCategory && <SyncBookings fetchData={fetchData} CategoryAddons={syncCategory} isLoading={isLoading} />}
        </Box>
    );
};

export default IntegrationPage;
