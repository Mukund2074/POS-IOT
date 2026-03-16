import React from 'react';
import { Stack, Typography, Box, Paper, Divider } from '@mui/material';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';

interface StatisticItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

interface StatisticItem {
    title: string;
    description: string;
    path: string;
}

interface StatisticSection {
    id: string;
    title: string;
    description?: string;
    items: StatisticItem[];
}

const StatisticItem: React.FC<StatisticItemProps> = ({ icon, title, description, onClick }) => (
    <Paper
        sx={{
            px: 2,
            py: 1,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
        }}
        onClick={onClick}
    >
        <Stack direction="row" spacing={2} alignItems="center">
            {icon}
            <Box>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '16px', fontWeight: 'bold', mb: 0 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px', pt: 0, mt: 0 }}>
                    {description}
                </Typography>
            </Box>
        </Stack>
    </Paper>
);

const Statistics: React.FC = () => {
    const navigate = useNavigate();

    const statisticsItems: StatisticSection[] = [
        {
            id: 'appointments',
            title: t('Statistics.Appointments'),
            items: [
                {
                    title: t('Statistics.AppointmentsList'),
                    description: t('Statistics.AppointmentsListDesc'),
                    path: 'appointments/list',
                },
                {
                    title: t('Statistics.AppointmentsCount'),
                    description: t('Statistics.AppointmentsCountDesc'),
                    path: 'appointments/count',
                },
                {
                    title: t('Statistics.AppointmentsServices'),
                    description: t('Statistics.AppointmentsServicesDesc'),
                    path: 'appointments/services',
                },
                {
                    title: t('Statistics.AppointmentsTime'),
                    description: t('Statistics.AppointmentsTimeDesc'),
                    path: 'appointments/time',
                },
                {
                    title: t('Statistics.AppointmentTimes'),
                    description: t('Statistics.AppointmentTimesDesc'),
                    path: 'appointments/appointment-times',
                },
                {
                    title: t('Statistics.BookingTimes'),
                    description: t('Statistics.BookingTimesDesc'),
                    path: 'appointments/appointment-times?type=booking',
                },
                {
                    title: t('Statistics.NoShows'),
                    description: t('Statistics.NoShowsDesc'),
                    path: 'appointments/count?noshow=true',
                },
                {
                    title: t('Statistics.Value'),
                    description: t('Statistics.ValueDesc'),
                    path: 'appointments/revenue',
                },
            ],
        },
        {
            id: 'classes',
            title: t('Statistics.Classes'),
            description: t('Statistics.ClassesDesc'),
            items: [
                {
                    title: t('Statistics.ClassesList'),
                    description: t('Statistics.ClassesListDesc'),
                    path: 'classes/list',
                },
            ],
        },
        {
            id: 'cashRegister',
            title: t('Statistics.CashRegister'),
            description: t('Statistics.CashRegisterDesc'),
            items: [
                {
                    title: t('Statistics.Sales'),
                    description: t('Statistics.SalesDesc'),
                    path: 'cash-register/sales',
                },
                {
                    title: t('Statistics.PeriodReport'),
                    description: t('Statistics.PeriodReportDesc'),
                    path: 'cash-register/salesSummary',
                },
            ],
        },
        {
            id: 'clipCards',
            title: t('Statistics.ClipCards'),
            description: t('Statistics.ClipCardsDesc'),
            items: [
                {
                    title: t('Statistics.ClipCardsList'),
                    description: t('Statistics.ClipCardsListDesc'),
                    path: 'clip-card/summary',
                },
            ],
        },
        {
            id: 'discountCodes',
            title: t('Statistics.DiscountCodes'),
            description: t('Statistics.DiscountCodesDesc'),
            items: [
                {
                    title: t('Statistics.DiscountCodesList'),
                    description: t('Statistics.DiscountCodesListDesc'),
                    path: 'discount-codes/list',
                },
            ],
        },
    ];

    return (
        <Stack sx={{ p: 2, pt: 4, px: 4 }}>
            <Box sx={{ mt: 1 }}>
                {statisticsItems.map((section) => (
                    <Box key={section.id} sx={{ mb: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                {section.title}
                            </Typography>
                        </Stack>

                        <Stack spacing={1}>
                            {section.items.map((item, index) => (
                                <StatisticItem
                                    key={`${section.id}-${index}`}
                                    icon={<BarChartIcon color="action" />}
                                    title={item.title}
                                    description={item.description}
                                    onClick={() => navigate(`${item.path}`)}
                                />
                            ))}
                        </Stack>
                        {section.id !== statisticsItems[statisticsItems.length - 1].id && <Divider sx={{ mt: 2 }} />}
                    </Box>
                ))}
            </Box>
        </Stack>
    );
};

export default Statistics;
