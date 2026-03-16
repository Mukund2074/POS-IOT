import { Box, List, ListItem, Typography } from '@mui/material';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';

const categories = {
    sales: {
        label: t('Statistics.Sales'),
        reports: [
            {
                id: t('Report.SalesOverview'),
                route: '/sales',
            },
            {
                id: t('Report.WeeklyRevenue'),
                route: '/sales/weekly-revenue',
            },
            {
                id: t('Customer.ProductSales'),
                route: '/sales/products',
            },
            {
                id: t('Report.ServiceSales'),
                route: '/sales/services',
            },
            {
                id: t('POS.PaymentMethod'),
                route: '/sales/payment-methods',
            },
            {
                id: t('Report.VATReport'),
                route: '/sales/vat',
            },
            {
                id: t('Report.ActiveGiftCard'),
                route: '/sales/gift-cards',
            },
            {
                id: t('Report.ActivePunchCard'),
                route: '/sales/punch-cards',
            },
            {
                id: t('POS.StockStatus'),
                route: '/sales/stock',
            },
        ],
    },
    customer: {
        label: t('Common.Customers'),
        reports: [
            {
                id: t('Report.CustomerByPostal'),
                route: '/customers/postal-codes',
            },
            {
                id: t('Report.Top100Customer'),
                route: '/customers/top-100',
            },
            {
                id: t('Report.UniqueCustomers'),
                route: '/customers/unique',
            },
            {
                id: t('Insights.NewCustomers'),
                route: '/customers/new',
            },
            {
                id: t('POS.Outstanding'),
                route: '/customers/outstanding',
            },
            {
                id: t('Report.Receivables'),
                route: '/customers/receivables',
            },
            {
                id: t('Report.ExcludedFromBooking'),
                route: '/customers/excluded-booking',
            },
        ],
    },
    // business: {
    //     label: 'business',
    //     reports: [
    //         {
    //             id: 'consumption-goods',
    //             route: '/business/consumption',
    //         },
    //     ],
    // },
};

const ReportSection = () => {
    const navigate = useNavigate();
    return (
        <Box>
            <Box pt={3} pb={3}>
                <Typography sx={{ color: '#1F1F1F', fontSize: '22px' }} fontWeight={700} variant="h6">
                    {t('Report.AllReport')}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 100%)', sm: 'repeat(2, 49%)', md: 'repeat(3, 32.33%)' },
                    gap: 3,
                }}
            >
                {Object.entries(categories).map(([key, value]) => {
                    return (
                        <Box sx={{ background: '#fff', p: 5, borderRadius: 3, boxShadow: 2 }} key={key}>
                            <Typography variant="h4" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                                {value.label}
                            </Typography>
                            <List sx={{ mt: 1 }}>
                                {value.reports.map((report) => (
                                    <ListItem key={report.id} sx={{ pl: 0, borderBottom: '1px solid #ddd' }}>
                                        <Typography
                                            sx={{
                                                textDecoration: 'none',
                                                color: '#000',
                                                textTransform: 'capitalize',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {
                                                navigate(`/pos/report${report?.route}`);
                                            }}
                                        >
                                            {report.id}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default ReportSection;
