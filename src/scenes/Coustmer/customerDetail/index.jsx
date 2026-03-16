import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import { Stack } from '@mui/material';
import AppbarComponent from '../../../components/AppBar';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCustomer } from '../../../context/customer/CustomerContext';
import { useDispatch } from 'react-redux';
import { route } from '../../../context/routeSlice';

import FSelect from '../../../components/commonComponents/F_Select';

function CustomerDetailContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { id } = useParams();
    const { customer } = useCustomer(); // ✅ from context
    const settings = useSelector((state) => state?.settings.data);
    const [selectedMore, setSelectedMore] = useState('MORE');

    const [selectedOption, setSelectedOption] = useState(t('Customer.CustomerInformation'));

    useEffect(() => {
        const pathname = location?.pathname.split('/')[3];
        if (pathname === 'journalgroups') {
            setSelectedOption(t('Common.JournalGroups'));
        } else if (pathname === 'customerinformation' || !pathname) {
            setSelectedOption(t('Customer.CustomerInformation'));
        } else if (pathname === 'subscription') {
            setSelectedOption(t('Calendar.Subscription'));
        } else if (pathname === 'bookings') {
            setSelectedOption(t('Common.Bookings'));
        } else if (pathname === 'advancedjournal') {
            setSelectedOption(t('Customer.AdvancedJournal'));
        } else if (
            pathname === 'sales' ||
            pathname === 'products' ||
            pathname === 'gift-cards' ||
            pathname === 'punch-cards' ||
            pathname === 'health-declaration-booking'
        ) {
            setSelectedOption('MORE');
        }
    }, [location.pathname]);

    let labels = [
        t('Common.Bookings'),
        t('Customer.CustomerInformation'),
        settings?.profile?.inspection_module && t('Calendar.Subscription'),
        settings?.profile?.allow_journal && t('Common.JournalGroups'),
        settings?.profile?.allow_advance_journal && t('Customer.AdvancedJournal'),
    ];

    if (settings?.isDoctor) {
        labels = labels.filter(Boolean);
    } else {
        labels = [
            ...labels.filter(Boolean),
            <FSelect
                value={selectedMore}
                onChange={(e) => {
                    setSelectedMore(e.target.value);
                    e.target.value === 'MORE'
                        ? navigate(`/customers/${id}`)
                        : navigate(`/customers/${id}/${e.target.value}`);
                    dispatch(route(`/customers/${id}/${e.target.value}`));
                }}
                label={t('Customer.More')}
                // borderThickness={selectedOption === 'MORE' ? '1px' : '0px'}
                fontColor="#827A72"
                sx={{
                    borderBottom: selectedOption === 'MORE' ? '3px solid #BBB0A4' : '0px',
                    borderRadius: 0,
                    borderTop: '0',
                    borderLeft: '0',
                    borderRight: '0',
                }}
                options={[
                    { label: t('Customer.More'), value: 'MORE' },
                    { label: t('POS.Sales'), value: 'sales' },
                    { label: t('Customer.ProductSales'), value: 'products' },
                    { label: t('POS.GiftCards'), value: 'gift-cards' },
                    { label: t('Customer.PunchCards'), value: 'punch-cards' },
                    { label: t('Customer.HealthDeclarationBooking'), value: 'health-declaration-booking' },
                ]}
            />,
            ];
    }

    const handleClick = (option) => {
        if (option === t('Common.Bookings')) {
            navigate(`bookings`, { replace: true });
            dispatch(route(`/customers/${customer?.id}/bookings`));
        } else if (option === t('Customer.CustomerInformation')) {
            navigate(`customerinformation`, {
                state: { data: customer, isEdit: true },
                replace: true,
            });
            dispatch(route(`/customers/${customer?.id}/customerinformation`));
        } else if (option === t('Calendar.Subscription')) {
            navigate('subscription');
        } else if (option === t('Common.JournalGroups')) {
            navigate(`journalgroups`, { replace: true });
            dispatch(route(`/customers/${customer?.id}/journalgroups`));
        } else if (option === t('Customer.AdvancedJournal')) {
            navigate(`advancedjournal`, { state: { data: customer }, replace: true });
            dispatch(route(`/customers/${customer?.id}/advancedjournal`));
        }
    };

    return (
        <React.Fragment>
            <AppbarComponent
                labels={location?.pathname === '/customers/create' ? [t('Customer.CustomerInformation')] : labels}
                selectedButton={selectedOption}
                handleClick={handleClick}
                ShowUser={location?.pathname !== '/customers/create'}
                userName={customer?.name}
                UserImage={customer?.image}
            />
            <Stack
                id="customer-Details"
                sx={{
                    px: location?.pathname.includes(`/customers/${id}/customerinformation`) ? 0 : { xs: 1, md: 4 },
                    pb: 4,
                    pt: id === 'create' ? 4 : 16,
                    scrollbarWidth: 'none',
                }}
            >
                <Outlet />
            </Stack>
        </React.Fragment>
    );
}

export default function CustomerDetail() {
    return <CustomerDetailContent />;
}
