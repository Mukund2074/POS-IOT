import React from 'react';
import { Box, Typography } from '@mui/material';
import Chart from 'react-apexcharts';
import { t } from 'i18next';
import { formatCurrency, formatDurationToHours } from '@/scenes/POS/Core/pos.utils';

interface ChartData {
    value: string;
    count: number;
}

interface BarChartProps {
    data: ChartData[];
    loading?: boolean;
    formaCurrency?: boolean;
    tooltipLabel?: string;
    formatDuration?: boolean;
}

export const CommonBarChart: React.FC<BarChartProps> = ({
    data,
    loading = true,
    formaCurrency = false,
    formatDuration = false,
    tooltipLabel = 'Count',
}) => {
    // Filter out zero values
    const filteredData = data.filter((item) => item.count > 0);

    const chartOptions = {
        chart: {
            type: 'bar' as const,
            height: 300,
            toolbar: {
                show: false,
            },
            animations: {
                enabled: true,
                easing: 'easeinout' as const,
                speed: 800,
            },
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                borderRadiusApplication: 'end' as const,
                columnWidth: '40%',
                dataLabels: {
                    position: 'top',
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        colors: ['#1E88E5'],
        xaxis: {
            categories: filteredData.map((item) => item.value),
            labels: {
                style: {
                    fontSize: '12px',
                },
                rotate: 0,
            },
            axisBorder: {
                show: true,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '12px',
                },
                formatter: (value: number) =>
                    formaCurrency
                        ? formatCurrency(value)
                        : formatDuration
                          ? formatDurationToHours(value)
                          : value.toString(),
            },
            axisBorder: {
                show: true,
            },
            axisTicks: {
                show: false,
            },
            min: 0,
        },
        grid: {
            show: true,
            borderColor: '#d4d4d4d4',
            strokeDashArray: 0,
            position: 'back' as const,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        tooltip: {
            theme: 'dark' as const,
            style: {
                fontSize: '13px',
            },
            custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
                const value = series[seriesIndex][dataPointIndex];
                const label = w.globals.labels[dataPointIndex];
                const formattedValue = formaCurrency
                    ? formatCurrency(value)
                    : formatDuration
                      ? formatDurationToHours(value)
                      : value;

                return `
                    <div style="padding: 12px; background: rgba(0, 0, 0, 0.8); border-radius: 6px;">
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${label}</div>
                        <div style="font-size: 13px;">${tooltipLabel}: ${formattedValue}</div>
                    </div>
                `;
            },
        },
        legend: {
            show: false,
        },
    };

    const series = [
        {
            name: tooltipLabel,
            data: filteredData.map((item) => item.count),
        },
    ];

    return (
        <Box
            height="300px"
            width="100%"
            position="relative"
            px={2}
            zIndex={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '300px' }}
        >
            {data.length > 0 ? (
                <Box width="100%" height="100%" position="relative">
                    <Chart options={chartOptions} series={series} type="bar" height="100%" width="100%" />
                </Box>
            ) : (
                <Typography variant="h6" color="#A0A0A0" fontWeight={500}>
                    {loading ? `${t('Common.Loading')}...` : t('Insights.NoDataFound')}
                </Typography>
            )}
        </Box>
    );
};
