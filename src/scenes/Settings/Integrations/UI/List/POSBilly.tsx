import { useState, useCallback, useMemo, useEffect } from 'react';
import { Alert, Box, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import IntegrationCard from '../Shared/IntegrationCard';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSButton from '@/components/POS/Common/POSButton';
import POSInput from '@/components/POS/Common/POSInput';
import { api } from '@/utils/Api/POS';
// @ts-ignore
import apiFetcher from '@/utils/interCeptor.js';
import { AxiosError } from 'axios';
import { t } from 'i18next';

type TypeOption = 'itemized' | 'simple' | 'typewise';

interface SelectOption {
    label: string;
    value: string;
    type: TypeOption;
}

interface Employee {
    name: string;
    id: number;
}

interface POSSelectOption {
    value: number;
    label: string;
}

enum TransactionType {
    Cash = 'CASH',
    PaymentCards = 'PAYMENT_CARDS',
    MobilePay = 'MOBILEPAY',
    Invoice = 'INVOICE',
    Outstanding = 'OUTSTANDING',
    Service = 'SERVICE',
    Product = 'PRODUCT',
    GiftCard = 'GIFT_CARD',
    KlippingCard = 'KLIPPING_CARD',
}

interface coaBilly {
    withVAT: Record<TransactionType, { account: string; counterAccount: string; typeNumber: number }>;
    withoutVAT: Record<TransactionType, { account: string; counterAccount: string; typeNumber: number }>;
}

const defaultCoa: coaBilly = {
    withVAT: {
        CASH: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        PAYMENT_CARDS: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        MOBILEPAY: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        INVOICE: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        OUTSTANDING: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        SERVICE: { account: '1100', counterAccount: '5710', typeNumber: 2 },
        PRODUCT: { account: '1100', counterAccount: '5710', typeNumber: 2 },
        GIFT_CARD: { account: '1100', counterAccount: '5710', typeNumber: 2 },
        KLIPPING_CARD: { account: '1100', counterAccount: '5710', typeNumber: 2 },
    },
    withoutVAT: {
        CASH: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        PAYMENT_CARDS: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        MOBILEPAY: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        INVOICE: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        OUTSTANDING: { account: '1100', counterAccount: '5710', typeNumber: 1 },
        SERVICE: { account: '1100', counterAccount: '5710', typeNumber: 2 },
        PRODUCT: { account: '1100', counterAccount: '5710', typeNumber: 2 },
        GIFT_CARD: { account: '1100', counterAccount: '5710', typeNumber: 2 },
        KLIPPING_CARD: { account: '1100', counterAccount: '5710', typeNumber: 2 },
    },
};

interface CoaInputProps {
    label: string;
    section: 'withVAT' | 'withoutVAT';
    type: TransactionType;
    coaConfig: coaBilly;
    onValueChange: (
        section: 'withVAT' | 'withoutVAT',
        type: TransactionType,
        field: 'account' | 'counterAccount',
        value: string,
    ) => void;
}

const BillyBox = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState('itemized');
    const [coaConfig, setCoaConfig] = useState<coaBilly>(defaultCoa);
    const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(dayjs());
    const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(dayjs());
    const [employee, setEmployee] = useState<Employee[]>([]);
    const allEmployees = [{ name: 'All employee', id: 0 }, ...employee];
    const [selectedEmployee, setSelectedEmployee] = useState<number>(allEmployees[0].id);

    const employeeOptions: POSSelectOption[] = allEmployees.map((emp) => ({
        value: emp.id,
        label: emp.name,
    }));

    const options: SelectOption[] = useMemo(
        () => [
            {
                label: t('Integration.ItemizedTitle'),
                value: 'itemized',
                type: 'itemized',
            },
            {
                label: t('Integration.SimpleTitle'),
                value: 'simple',
                type: 'simple',
            },
            {
                label: t('Integration.TypewiseTitle'),
                value: 'typewise',
                type: 'typewise',
            },
        ],
        [],
    );

    const [coaTransactionTypes] = useState<{ label: string; type: TransactionType; typeNumber: number }[]>([
        {
            label: t('POS.Cash'),
            type: TransactionType.Cash,
            typeNumber: 1,
        },
        {
            label: t('Integration.PaymentCard'),
            type: TransactionType.PaymentCards,
            typeNumber: 1,
        },
        {
            label: t('Integration.MobilePay'),
            type: TransactionType.MobilePay,
            typeNumber: 1,
        },
        {
            label: t('Integration.InvoiceBankTransfer'),
            type: TransactionType.Invoice,
            typeNumber: 1,
        },
        {
            label: t('POS.Outstanding'),
            type: TransactionType.Outstanding,
            typeNumber: 1,
        },
        {
            label: t('Common.Service'),
            type: TransactionType.Service,
            typeNumber: 2,
        },
        {
            label: t('POS.Product'),
            type: TransactionType.Product,
            typeNumber: 2,
        },
        {
            label: t('POS.GiftCard'),
            type: TransactionType.GiftCard,
            typeNumber: 2,
        },
        {
            label: t('Integration.KlippingCard'),
            type: TransactionType.KlippingCard,
            typeNumber: 2,
        },
    ]);

    const handleValueChange = useCallback(
        (
            section: 'withVAT' | 'withoutVAT',
            type: TransactionType,
            field: 'account' | 'counterAccount',
            value: string,
        ) => {
            setCoaConfig((prev) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [type]: {
                        ...prev[section][type],
                        [field]: value,
                    },
                },
            }));
        },
        [],
    );

    const fetchEmployee = async () => {
        try {
            setIsLoading(true);
            const response = await apiFetcher.get('/api/v1/store/employee/get');
            setEmployee(response?.data?.data || []);
            setIsLoading(false);
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleSave = async () => {
        if (!startDate?.date()) {
            toast.error(t('Customer.BirthdayInvalidDate'));
            return;
        }

        if (!endDate?.date()) {
            toast.error(t('Customer.BirthdayInvalidDate'));
            return;
        }

        const updatedCoaConfig = JSON.parse(JSON.stringify(coaConfig));

        Object.keys(updatedCoaConfig).forEach((section) => {
            Object.keys(updatedCoaConfig[section as keyof coaBilly]).forEach((type) => {
                const transaction =
                    updatedCoaConfig[section as keyof coaBilly][type as keyof typeof updatedCoaConfig.withVAT];

                if (transaction.account === '') {
                    transaction.account = null;
                } else if (transaction.account && !isNaN(Number(transaction.account))) {
                    transaction.account = Number(transaction.account);
                }

                if (transaction.counterAccount === '') {
                    transaction.counterAccount = null;
                } else if (transaction.counterAccount && !isNaN(Number(transaction.counterAccount))) {
                    transaction.counterAccount = Number(transaction.counterAccount);
                }
            });
        });

        try {
            await setExportLoading(true);

            if (startDate && endDate) {
                const response = await api.getApiBillyExport({
                    coaMapping: JSON.stringify(updatedCoaConfig),
                    toDate: endDate.format('YYYY-MM-DD'),
                    fromDate: startDate.format('YYYY-MM-DD'),
                    type: selectedTypes as any,
                    employee: selectedEmployee,
                });

                if (response) {
                    const blob = new Blob([response as string], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `bookings_${dayjs().format('YYYY_MM_DD_HH_mm_ss')}.csv`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                }
                toast.success(t('Integration.SuccessExporter'));
            }
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err?.response?.data?.message);
        } finally {
            setExportLoading(false);
        }
    };

    const CoaInput = useCallback(
        ({ label, section, type, coaConfig, onValueChange }: CoaInputProps) => (
            <IntegrationCard
                title={label}
                description="Choose how you want the data to be extracted from the system"
                processContent={
                    isLoading && !employee.length ? (
                        <Stack sx={{ width: '100%' }}>
                            <Skeleton variant="rounded" sx={{ width: '100%' }} height={50} />
                        </Stack>
                    ) : (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Box>
                                <Typography>{t('Integration.AccountPlan')}</Typography>
                                <POSInput
                                    value={coaConfig[section][type].account}
                                    width="230px"
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        if (/^\d*$/.test(newValue)) {
                                            onValueChange(section, type, 'account', newValue);
                                        }
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography>{t('Integration.Countership')}</Typography>
                                <POSInput
                                    value={coaConfig[section][type].counterAccount}
                                    width="230px"
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        if (/^\d*$/.test(newValue)) {
                                            onValueChange(section, type, 'counterAccount', newValue);
                                        }
                                    }}
                                />
                            </Box>
                        </Stack>
                    )
                }
            />
        ),
        [isLoading, employee],
    );

    const memoizedTransactionTypes = useMemo(() => {
        const typeFilter = selectedTypes === 'typewise' ? 2 : 1;

        return coaTransactionTypes.filter((coaType) => coaType.typeNumber === typeFilter);
    }, [coaTransactionTypes, selectedTypes]);

    useEffect(() => {
        fetchEmployee();
    }, []);

    return (
        <Box p={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography fontWeight={'bold'} sx={{ fontSize: '22px' }}>
                    {t('Integration.Billy')}
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                    {t('Integration.BillyWarning')}
                </Alert>
            </Box>

            <Box sx={{ position: 'relative', top: 8 }}>
                <IntegrationCard
                    title={t('Integration.Interval')}
                    description={t('Integration.IntervalDescription')}
                    processContent={
                        isLoading && !employee.length ? (
                            <Stack sx={{ width: '100%' }}>
                                <Skeleton variant="rounded" sx={{ width: '100%' }} height={50} />
                            </Stack>
                        ) : (
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <LocalizationProvider
                                    localeText={{ calendarWeekNumberHeaderText: t('Common.Week') }}
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        displayWeekNumber={true}
                                        label="From date"
                                        value={startDate}
                                        onChange={setStartDate}
                                    />
                                    <DatePicker
                                        displayWeekNumber={true}
                                        label="To date"
                                        value={endDate}
                                        onChange={setEndDate}
                                    />
                                </LocalizationProvider>
                            </Stack>
                        )
                    }
                />
                <Divider sx={{ border: '2.7px solid #D9D9D9', backgroundColor: '#F3F3F3', width: '100%' }} />
                <IntegrationCard
                    title={t('Integration.Staff')}
                    description={t('Integration.StaffDescription')}
                    processContent={
                        isLoading && !employee.length ? (
                            <Stack sx={{ width: '100%' }}>
                                <Skeleton variant="rounded" sx={{ width: '100%' }} height={50} />
                            </Stack>
                        ) : (
                            <POSSelect
                                options={employeeOptions}
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                                showPlaceHolder={false}
                            />
                        )
                    }
                />
                <Divider sx={{ border: '2.7px solid #D9D9D9', backgroundColor: '#F3F3F3', width: '100%' }} />
                <IntegrationCard
                    title={t('Integration.Type')}
                    description={t('Integration.TypeDescription')}
                    processContent={
                        isLoading && !employee.length ? (
                            <Stack sx={{ width: '100%' }}>
                                <Skeleton variant="rounded" sx={{ width: '100%' }} height={50} />
                            </Stack>
                        ) : (
                            <POSSelect
                                options={options}
                                value={selectedTypes}
                                sx={{
                                    '.css-bgp2v2-MuiTypography-root': {
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                    },
                                }}
                                onChange={(e) => setSelectedTypes(e.target.value as string)}
                            />
                        )
                    }
                />
                <Divider sx={{ border: '2.7px solid #D9D9D9', backgroundColor: '#F3F3F3', width: '100%' }} />

                {selectedTypes === 'typewise' ? (
                    <>
                        <Box>
                            <Typography sx={{ fontWeight: 'bold', padding: 2, fontSize: 30 }}>
                                {t('Integration.WithVAT')}
                            </Typography>
                            {memoizedTransactionTypes.map(({ label, type }) => (
                                <Box key={type}>
                                    <CoaInput
                                        label={label}
                                        type={type}
                                        section="withVAT"
                                        coaConfig={coaConfig}
                                        onValueChange={handleValueChange}
                                    />
                                    <Divider
                                        sx={{
                                            border: '2.7px solid #D9D9D9',
                                            backgroundColor: '#F3F3F3',
                                            width: '100%',
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>

                        <Box>
                            <Typography sx={{ fontWeight: 'bold', padding: 2, fontSize: 30 }}>
                                {t('Integration.WithoutVAT')}
                            </Typography>
                            {memoizedTransactionTypes.map(({ label, type }) => (
                                <Box key={type}>
                                    <CoaInput
                                        label={label}
                                        type={type}
                                        section="withoutVAT"
                                        coaConfig={coaConfig}
                                        onValueChange={handleValueChange}
                                    />
                                    <Divider
                                        sx={{
                                            border: '2.7px solid #D9D9D9',
                                            backgroundColor: '#F3F3F3',
                                            width: '100%',
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </>
                ) : (
                    <>
                        {memoizedTransactionTypes.map(({ label, type }) => (
                            <Box key={type}>
                                <CoaInput
                                    label={label}
                                    type={type}
                                    section="withVAT"
                                    coaConfig={coaConfig}
                                    onValueChange={handleValueChange}
                                />
                                <Divider
                                    sx={{
                                        border: '2.7px solid #D9D9D9',
                                        backgroundColor: '#F3F3F3',
                                        width: '100%',
                                    }}
                                />
                            </Box>
                        ))}
                    </>
                )}

                <POSButton
                    title={t('Integration.Exporter')}
                    sx={{
                        background: '#44B904',
                        ml: 'auto',
                        mb: 2,
                        mt: 2,
                        display: 'flex',
                    }}
                    width={2}
                    titleColor="#fff"
                    loading={exportLoading}
                    onClick={handleSave}
                />
            </Box>
        </Box>
    );
};

export default BillyBox;
