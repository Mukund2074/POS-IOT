import React, { useState } from 'react';
import { Grid2 } from '@mui/material';
import { Card, Typography } from '@mui/material';
import { t } from 'i18next';
import { formatCurrency } from '../../../../scenes/POS/Core/pos.utils';

export default function CustomerCards({ loading, customerSaleDetails }) {
    const [isOutstandingBlurred, setIsOutstandingBlurred] = useState(true);
    return (
        <Grid2 container spacing={2}>
            {/* Total Sales Card */}
            <Grid2 item size={{ xs: 12, md: 6, xl: 4 }}>
                <Card
                    sx={{
                        p: 3,
                        bgcolor: '#fff',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #f0f0f0',
                        borderBottom: '4px solid #20B2AA',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        width: '100%',
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: '#333',
                            mb: 1,
                            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                        }}
                    >
                        {loading ? '...' : customerSaleDetails?.totalSales || 0}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#666',
                            fontWeight: 400,
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {t('POS.Sales')}
                    </Typography>
                </Card>
            </Grid2>

            {/* Total Turnover Card */}
            <Grid2 item size={{ xs: 12, md: 6, xl: 4 }}>
                <Card
                    sx={{
                        p: 3,
                        bgcolor: '#fff',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #f0f0f0',
                        borderBottom: '4px solid #90EE90',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        width: '100%',
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: '#333',
                            mb: 1,
                            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                        }}
                    >
                        {loading
                            ? '...'
                            : customerSaleDetails?.totalTurnover
                              ? formatCurrency(customerSaleDetails.totalTurnover)
                              : formatCurrency(0)}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#666',
                            fontWeight: 400,
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {t('POS.Turnover')}
                    </Typography>
                </Card>
            </Grid2>

            {/* Outstanding Amount Card */}
            <Grid2 item size={{ xs: 12, md: 6, xl: 4 }}>
                <Card
                    onClick={() => setIsOutstandingBlurred(false)}
                    sx={{
                        p: 3,
                        bgcolor: '#fff',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #f0f0f0',
                        borderBottom:
                            customerSaleDetails?.outstandingAmount > 0 ? '4px solid #FF6B6B' : '4px solid #90EE90',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        cursor: 'pointer',
                        width: '100%',
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: '#333',
                            mb: 1,
                            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                            filter: isOutstandingBlurred ? 'blur(8px)' : 'none',
                            transition: 'filter 0.3s ease-in-out',
                        }}
                    >
                        {loading
                            ? '...'
                            : customerSaleDetails?.outstandingAmount
                              ? formatCurrency(customerSaleDetails.outstandingAmount)
                              : formatCurrency(0)}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#666',
                            fontWeight: 400,
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {t('POS.Outstanding')}
                    </Typography>
                </Card>
            </Grid2>
        </Grid2>
    );
}
