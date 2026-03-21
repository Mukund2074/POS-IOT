import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import { Stack } from '@mui/material';
import AppbarComponent from '../../../components/AppBar';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCustomer } from '../../../context/customer/CustomerContext';
import { useDispatch } from 'react-redux';
import { route } from '../../../context/routeSlice';

function CustomerDetailContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { id } = useParams();
    const { customer } = useCustomer();

    const [selectedOption, setSelectedOption] = useState(t('Customer.CustomerInformation'));

    useEffect(() => {
        const pathname = location?.pathname.split('/')[3];

        if (pathname === 'products') {
            setSelectedOption(t('Customer.ProductSales'));
        } else if (pathname === 'gift-cards') {
            setSelectedOption(t('POS.GiftCards'));
        } else if (pathname === 'punch-cards') {
            setSelectedOption(t('Customer.PunchCards'));
        } else {
            setSelectedOption(t('Customer.CustomerInformation'));
        }
    }, [location.pathname]);

    const labels = [
        t('Customer.CustomerInformation'),
        t('Customer.ProductSales'),
        t('POS.GiftCards'),
        t('Customer.PunchCards'),
    ];

    const handleClick = (option) => {
        if (option === t('Customer.CustomerInformation')) {
            navigate(`customerinformation`, {
                state: { data: customer, isEdit: true },
                replace: true,
            });
            dispatch(route(`/customers/${customer?.id}/customerinformation`));
        } else if (option === t('Customer.ProductSales')) {
            navigate(`products`, { replace: true });
            dispatch(route(`/customers/${customer?.id}/products`));
        } else if (option === t('POS.GiftCards')) {
            navigate(`gift-cards`, { replace: true });
            dispatch(route(`/customers/${customer?.id}/gift-cards`));
        } else if (option === t('Customer.PunchCards')) {
            navigate(`punch-cards`, { replace: true });
            dispatch(route(`/customers/${customer?.id}/punch-cards`));
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
