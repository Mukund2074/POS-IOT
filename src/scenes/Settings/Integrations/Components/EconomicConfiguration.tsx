import React from 'react';
// import ConfigSection from './ConfigSection';
import { Box, Divider, Skeleton, Stack, Typography } from '@mui/material';
import POSInput from '@/components/POS/Common/POSInput';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import { t } from 'i18next';
import { PutApiEconomicConfigBody } from '@/shared/api/models';

type EconomicConfigurationProps = {
    formData: PutApiEconomicConfigBody;
    setFormData: React.Dispatch<React.SetStateAction<PutApiEconomicConfigBody>>;
    isLoading: boolean;
};

export default function EconomicConfiguration({ formData, setFormData, isLoading }: EconomicConfigurationProps) {
    // const paymentMethodFilter = [
    //     { label: 'Cash', stateKey: 'cash', value: formData?.cash },
    //     { label: 'Payment Card', stateKey: 'paymentCard', value: formData?.paymentCard },
    //     { label: 'Mobile Pay', stateKey: 'mobilePay', value: formData?.mobilePay },
    //     { label: 'Invoice', stateKey: 'invoice', value: formData?.invoice },
    //     { label: 'Explaint', stateKey: 'explaint', value: formData?.explaint },
    //     { label: 'Gift Card', stateKey: 'giftCard', value: formData?.giftCard },
    //     { label: 'Klipping Card', stateKey: 'klippingCard', value: formData?.klippingCard },
    //     { label: 'Online Payment', stateKey: 'onlinePayment', value: formData?.onlinePayment },
    // ];

    // const generalFilter = [
    //     { label: 'General', stateKey: 'general', value: formData?.toTheBank },
    //     { label: 'Disadvertisement', stateKey: 'disadvertisement', value: formData?.disadvertisement },
    // ];

    const productAndService = [
        {
            label: 'PRODUCT_WITH_VAT',
            state: 'productWithVat',
            value: formData?.coaConfiguration?.PRODUCT_GROUP.PRODUCT_WITH_VAT,
        },
        {
            label: 'SERVICE_WITH_VAT',
            state: 'serviceWithVat',
            value: formData?.coaConfiguration?.PRODUCT_GROUP.SERVICE_WITH_VAT,
        },
        {
            label: 'PRODCUT_WITHOUT_VAT',
            state: 'productWithoutVat',
            value: formData?.coaConfiguration?.PRODUCT_GROUP.PRODCUT_WITHOUT_VAT,
        },
        {
            label: 'SERVICE_WITHOUT_VAT',
            state: 'serviceWithoutVat',
            value: formData?.coaConfiguration?.PRODUCT_GROUP.SERVICE_WITHOUT_VAT,
        },
    ];

    const customerGroup = [{ CUSTOMER_GROUP: formData?.coaConfiguration?.CUSTOMER_GROUP }];

    // const sections = [
    //     {
    //         title: t('Integration.FinancialYear'),
    //         description: t('Integration.FinancialYearDescription'),
    //         items: [2],
    //     },
    //     {
    //         title: t('Integration.CassleyJournal'),
    //         description: t('Integration.CassleyJournalDescription'),
    //         items: [2],
    //     },
    //     {
    //         title: t('Integration.VatAccount'),
    //         description: t('Integration.VatAccountDescription'),
    //         items: [2],
    //     },
    //     {
    //         title: t('POS.PaymentMethod'),
    //         description: t('Integration.PaymentMethodDescription'),
    //         items: paymentMethodFilter,
    //     },
    //     {
    //         title: t('Insights.General'),
    //         description: t('Integration.GeneralDescription'),
    //         items: generalFilter,
    //     },
    // ];

    return (
        <>
            {/* {sections.map((section, index) => (
                <ConfigSection
                    key={index}
                    title={section.title}
                    description={section.description}
                    items={section.items}
                    setFormData={setFormData}
                />
            ))} */}

            <>
                {/* product and service box */}
                <Box
                    sx={{
                        background: '#fff',
                        display: { xs: 'block', sm: 'block', md: 'flex' },
                        p: { xs: 2, sm: 2, md: 4 },
                    }}
                >
                    {/* Left Description Box */}
                    <Box
                        sx={{
                            width: { xs: '100%', sm: '100%', md: '30%' },
                            pr: 3,
                        }}
                    >
                        <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                            {t('Integration.ProductAndService')}
                        </Typography>
                        <Typography sx={{ fontSize: 16, fontWeight: 400, color: '#666' }}>{'description'}</Typography>
                    </Box>

                    {isLoading ? (
                        <Box
                            sx={{
                                width: '100%',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 3,
                            }}
                        >
                            <Skeleton variant="rounded" height={50} />
                            <Skeleton variant="rounded" height={50} />
                            <Skeleton variant="rounded" height={50} />
                            <Skeleton variant="rounded" height={50} />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: 'repeat(1,100%)', md: 'repeat(2,50%)' },
                                width: '100%',
                                gap: 2,
                            }}
                        >
                            {productAndService.map(({ label, state, value }) => (
                                <Box key={state}>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {label
                                            .replace(/_/g, ' ')
                                            .split(' ')
                                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                            .join(' ')}
                                    </Typography>

                                    <POSInput
                                        type="number"
                                        value={value?.toString().replace(/[^0-9.]/g, '') ?? ''}
                                        onChange={(e) => {
                                            const formatted =
                                                e.target.value.split('.').length > 2
                                                    ? e.target.value.split('.').slice(0, 2).join('.')
                                                    : e.target.value;
                                            const numeric = parseFloat(formatted) || 0;
                                            setFormData((prev) => ({
                                                ...prev,
                                                coaConfiguration: {
                                                    ...prev.coaConfiguration!,
                                                    PRODUCT_GROUP: {
                                                        ...prev.coaConfiguration!.PRODUCT_GROUP,
                                                        [label]: numeric,
                                                    },
                                                },
                                            }));
                                        }}
                                        sx={{
                                            '& input[type=number]': { MozAppearance: 'textfield' },
                                            '& input[type=number]::-webkit-outer-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            '& input[type=number]::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                <Divider
                    sx={{
                        border: '2.5px solid #F3F3F3',
                        backgroundColor: '#F3F3F3',
                        width: '100%',
                    }}
                />

                {/* Customer group description */}
                <Box
                    sx={{
                        background: '#fff',
                        display: { xs: 'block', sm: 'block', md: 'flex' },
                        p: { xs: 2, sm: 2, md: 4 },
                    }}
                >
                    {/* Left Description Box */}
                    <Box
                        sx={{
                            width: { xs: '100%', sm: '100%', md: '30%' },
                            pr: 3,
                        }}
                    >
                        <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{t('POS.CustomerGroup')}</Typography>
                        <Typography sx={{ fontSize: 16, fontWeight: 400, color: '#666' }}>{'description'}</Typography>
                    </Box>

                    {isLoading ? (
                        <Stack sx={{ width: '100%' }}>
                            <Skeleton variant="rounded" sx={{ width: '100%' }} height={50} />
                        </Stack>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(1fr)',
                                width: '100%',
                                gap: 2,
                            }}
                        >
                            {customerGroup?.map((item) => (
                                <Box key={'customer-group'}>
                                    <Typography sx={{ fontWeight: 700 }}>{t('POS.CustomerGroup')}</Typography>

                                    <POSInput
                                        // value={item.CUSTOMER_GROUP ?? 0}
                                        value={item.CUSTOMER_GROUP?.toString().replace(/[^0-9.]/g, '') ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const formatted =
                                                e.target.value.split('.').length > 2
                                                    ? e.target.value.split('.').slice(0, 2).join('.')
                                                    : e.target.value;
                                            const numeric = parseFloat(formatted) || 0;

                                            if (/^\d*$/.test(value)) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    coaConfiguration: {
                                                        ...prev.coaConfiguration!,
                                                        CUSTOMER_GROUP: numeric,
                                                    },
                                                }));
                                            }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                <Divider
                    sx={{
                        border: '2.5px solid #F3F3F3',
                        backgroundColor: '#F3F3F3',
                        width: '100%',
                    }}
                />

                {/* send email from economic*/}
                <Box
                    sx={{
                        background: '#fff',
                        display: { xs: 'block', sm: 'block', md: 'flex' },
                        p: { xs: 2, sm: 2, md: 4 },
                    }}
                >
                    {/* Left Description Box */}
                    <Box
                        sx={{
                            width: { xs: '100%', sm: '100%', md: '30%' },
                            pr: 3,
                        }}
                    >
                        <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                            {t('Integration.SendEmailFromEconomic')}
                        </Typography>
                        <Typography sx={{ fontSize: 16, fontWeight: 400, color: '#666' }}>
                            {t('Integration.SendEmailFromEconomic')}
                        </Typography>
                    </Box>

                    {isLoading ? (
                        <Stack sx={{ width: '100%' }}>
                            <Skeleton variant="rounded" sx={{ width: '100%' }} height={50} />
                        </Stack>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2,50%)',
                                width: '100%',
                                gap: 2,
                            }}
                        >
                            <POSSwitch
                                checked={formData?.sendEmail as boolean}
                                onChange={(e, checked) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        sendEmail: checked,
                                    }))
                                }
                            />
                        </Box>
                    )}
                </Box>

                <Divider
                    sx={{
                        border: '2.5px solid #F3F3F3',
                        backgroundColor: '#F3F3F3',
                        width: '100%',
                    }}
                />
            </>
        </>
    );
}
