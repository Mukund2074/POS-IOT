import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import POSNavbar from '../../components/POS/Common/POSNavbar';
import { usePOS } from '@/context/POS/POSContext';
import { GetApiProductsListing200 } from '@/shared/api/models';
import { useSelector } from 'react-redux';

export default function POSLayout() {
    const user = useSelector((state: any) => state?.user?.data);
    const NavOptions = [
        { id: 1, title: t('POS.CashDrawer'), link: '/pos/cashdrawer' },
        { id: 2, title: t('POS.Sale'), link: '/pos/sales' },
        { id: 3, title: t('POS.Suppliers'), link: '/pos/suppliers' },
        { id: 4, title: t('POS.Product'), link: '/pos/products' },
        { id: 5, title: t('POS.Expense'), link: '/pos/expenses' },
        { id: 7, title: t('Report.Report'), link: '/pos/report' },
        // { id: 6, title: t('GiftCard.Settings'), link: '/pos/settings' },
        // { id: 7, title: t('POS.Integration'), link: '/pos/integration' },
    ];

    if (user?.role === 'ADMIN') {
        NavOptions.push({ id: 6, title: t('GiftCard.Settings'), link: '/pos/settings' });
    }

    const navigate = useNavigate();
    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState(1);

    useEffect(() => {
        if (location.pathname === '/pos') {
            setSelectedTab(1);
            navigate('/pos/cashdrawer');
        } else if (location.pathname.startsWith('/pos/sales')) {
            setSelectedTab(2);
        } else if (location.pathname.startsWith('/pos/suppliers')) {
            setSelectedTab(3);
        } else if (location.pathname.startsWith('/pos/products')) {
            setSelectedTab(4);
        } else if (location.pathname.startsWith('/pos/cashdrawer')) {
            setSelectedTab(1);
        } else if (location.pathname.startsWith('/pos/expenses')) {
            setSelectedTab(5);
        } else if (location.pathname.startsWith('/pos/settings')) {
            setSelectedTab(6);
        } else if (location.pathname.startsWith('/pos/report')) {
            setSelectedTab(7);
        } else {
            setSelectedTab(4);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const { product } = usePOS() as {
        product: { data: GetApiProductsListing200 | null; isLoading: boolean; error: any; refetch: () => void };
    };

    useEffect(() => {
        if (!product.data) {
            product?.refetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Stack sx={{ p: 2, pt: 8, position: 'relative' }}>
            <POSNavbar
                labels={NavOptions.sort((a, b) => a.id - b.id)}
                selectedButton={selectedTab !== undefined ? selectedTab : 1}
                handleClick={(e) => {
                    setSelectedTab(e.id);
                    navigate(e.link);
                }}
            />
            <Outlet />
        </Stack>
    );
}
