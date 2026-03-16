import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import POSNavbar from '../../components/POS/Common/POSNavbar';
import { Stack } from '@mui/material';
import { t } from 'i18next';

const ServiceLayout = () => {
    const NavOptions = [
        {
            id: 1,
            title: t('Statistics.AppointmentsServices'),
            link: '',
        },
        {
            id: 2,
            title: t('Services.Deposit'),
            link: 'deposit',
        },
        {
            id: 3,
            title: t('Services.HealthDeclarationTemplate'),
            link: 'health-declaration-template',
        },
    ];

    const reminderItem = {
        id: 4,
        title: t('Setting.AdvanceReminderTemplate'),
        link: 'advanced-reminder-templates',
    };

    if (process.env.REACT_APP_SHOW_ADVANCED_REMINDER_TEMPLATES === 'true') {
        NavOptions.push(reminderItem);
    }

    const navigate = useNavigate();
    const location = useLocation();

    const [selectedTab, setSelectedTab] = useState(1);
    useEffect(() => {
        if (location.pathname === '/services') {
            setSelectedTab(1);
            navigate('/services');
        } else if (location.pathname === '/services/deposit') {
            setSelectedTab(2);
        } else if (location.pathname === '/services/health-declaration-template') {
            setSelectedTab(3);
        } else if (location.pathname === '/services/advanced-reminder-templates') {
            setSelectedTab(4);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return (
        <React.Fragment>
            <POSNavbar
                labels={NavOptions}
                selectedButton={selectedTab !== undefined ? selectedTab : 1}
                handleClick={(e) => {
                    setSelectedTab(e.id);
                    navigate(e.link);
                }}
            />
            <Stack sx={{ py: { xs: 2, md: 4 } }}>
                <Outlet />
            </Stack>
        </React.Fragment>
    );
};

export default ServiceLayout;
