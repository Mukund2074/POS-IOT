import POSNavbar from '@/components/POS/Common/POSNavbar';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { t } from 'i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

interface NavOptions {
    id: number;
    title: string;
    link: string;
}

const Report = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navOptions: NavOptions[] = [
        {
            id: 1,
            title: t('POS.Sales'),
            link: '/pos/report/sales',
        },
        {
            id: 2,
            title: t('Report.Report'),
            link: '/pos/report/allreport',
        },
    ];

    const [selectedTab, setSelectedTab] = useState<number>(1);

    useEffect(() => {
        if (location.pathname === '/pos/report') {
            navigate('/pos/report/sales');
        }
    }, [navigate, location.pathname]);

    useEffect(() => {
        if (
            location.pathname === '/pos/report/sales/weekly-revenue' ||
            location.pathname === '/pos/report/sales/products' ||
            location.pathname === '/pos/report/sales/services' ||
            location.pathname === '/pos/report/sales/payment-methods' ||
            location.pathname === '/pos/report/sales/vat' ||
            location.pathname === '/pos/report/sales/gift-cards' ||
            location.pathname === '/pos/report/sales/punch-cards' ||
            location.pathname === '/pos/report/sales/stock' ||
            location.pathname === '/pos/report/customers/top-100' ||
            location.pathname === '/pos/report/customers/unique' ||
            location.pathname === '/pos/report/customers/postal-codes' ||
            location.pathname === '/pos/report/customers/new' ||
            location.pathname === '/pos/report/customers/excluded-booking' ||
            location.pathname === '/pos/report/customers/outstanding' ||
            location.pathname === '/pos/report/customers/receivables'
        ) {
            setSelectedTab(2);
        } else if (location.pathname.startsWith('/pos/report/sales')) {
            setSelectedTab(1);
        } else if (location.pathname.startsWith('/pos/report/allreport')) {
            setSelectedTab(2);
        } else {
            setSelectedTab(1);
        }
    }, [location.pathname]);

    return (
        <Box>
            <POSNavbar
                labels={navOptions.sort((a, b) => a.id - b.id)}
                selectedButton={selectedTab}
                handleClick={(e) => {
                    setSelectedTab(e.id);
                    navigate(e.link);
                }}
            />
            <Outlet />
        </Box>
    );
};

export default Report;
