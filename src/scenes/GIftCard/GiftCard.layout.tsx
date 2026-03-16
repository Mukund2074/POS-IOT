import POSNavbar from '@/components/POS/Common/POSNavbar';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Permission from '@/utils/POS/Permission';

const GiftCardLayout = () => {
    const { isAllowed } = Permission();
    const NavOptions = [{ id: 1, title: t('GiftCard.GiftCards'), link: '/gift-card/' }];
    if (isAllowed('GiftCardSettings', 'update')) {
        NavOptions.push({ id: 2, title: t('GiftCard.GiftCardSettings'), link: '/gift-card/settings' });
    }
    if (isAllowed('GiftCardSettings', 'update')) {
        NavOptions.push({ id: 3, title: t('GiftCard.OnlineGiftCard'), link: '/gift-card/online' });
    }

    const navigate = useNavigate();
    const location = useLocation();

    const [selectedTab, setSelectedTab] = useState(1);

    useEffect(() => {
        if (location.pathname === '/gift-card') {
            setSelectedTab(1);
            navigate('/gift-card');
        } else if (location.pathname === '/gift-card/settings') {
            setSelectedTab(2);
        } else if (location.pathname === '/gift-card/online') {
            setSelectedTab(3);
        } else if (location.pathname === '/gift-card/online/create') {
            setSelectedTab(3);
        } else {
            setSelectedTab(1);
            navigate('/gift-card');
        }
    }, []);

    return (
        <Stack sx={{ p: 2, pt: 8 }}>
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
};

export default GiftCardLayout;
