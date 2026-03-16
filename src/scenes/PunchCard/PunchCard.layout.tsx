import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import POSNavbar from '@/components/POS/Common/POSNavbar';
import Permission from '@/utils/POS/Permission';

export default function PunchCardLayout() {
    const { isAllowed } = Permission();
    const NavOptions = [
        { id: 1, title: t('PunchCard.PunchCard'), link: '/punch-card/list' },
        { id: 2, title: t('PunchCard.SoldPunchCards'), link: '/punch-card/sold' },
    ];
    if (isAllowed('PunchCardSettings', 'update')) {
        NavOptions.push({ id: 3, title: t('PunchCard.PunchCardSettings'), link: '/punch-card/settings' });
    }

    const navigate = useNavigate();
    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState(1);

    useEffect(() => {
        if (location.pathname === '/punch-card/list' || location.pathname === '/punch-card') {
            setSelectedTab(1);
            navigate('/punch-card/list');
        } else if (location.pathname?.includes('/punch-card/sold')) {
            setSelectedTab(2);
        } else if (location.pathname === '/punch-card/settings') {
            setSelectedTab(3);
        } else {
            // setSelectedTab(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return (
        <Stack sx={{ p: 2, pt: 8, position: 'relative' }}>
            <POSNavbar
                labels={NavOptions}
                selectedButton={selectedTab !== undefined ? selectedTab : 1}
                handleClick={(e) => {
                    setSelectedTab(e.id);
                    navigate(e.link);
                }}
            />
            <Stack sx={{ px: { xs: 1, sm: 1 }, my: 1 }}>
                <Outlet />
            </Stack>
        </Stack>
    );
}
