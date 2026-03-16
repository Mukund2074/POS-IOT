import { useEffect, useMemo, useState } from 'react';
import IntegrationCard from '../Shared/IntegrationCard';
import { AppBar, Box, Divider, Grid, Skeleton, Stack, Typography } from '@mui/material';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSButton from '@/components/POS/Common/POSButton';
import { t } from 'i18next';
import { api } from '@/utils/Api/POS';
import { toast } from 'react-toastify';

interface CoaConfig {
    BANK_TRANSFER?: number | null;
    CASH?: number | null;
    CARD?: number | null;
    CUT_CARD?: number | null;
    MOBILE_PAY?: number | null;
    OUTSTANDING?: number | null;
    salesWithVat?: number | null;
    salesWithoutVat?: number | null;
    GIFT_CARD?: number | null;
}

interface accountOption {
    label: string;
    value: number;
}

interface DuplicateState {
    values: CoaConfig;
    emailBtn: boolean;
}

const defaultCoa = {
    BANK_TRANSFER: null,
    CASH: null,
    CARD: null,
    CUT_CARD: null,
    MOBILE_PAY: null,
    OUTSTANDING: null,
    salesWithVat: null,
    salesWithoutVat: null,
    GIFT_CARD: null,
};

const DineroBox = () => {
    const [companyList, setCompanyList] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>('587677');
    const [accountList, setAccountList] = useState<accountOption[]>([]);

    const [activeBar, setActivebar] = useState(false);
    const [coaConfig, setCoaConfig] = useState<CoaConfig>(defaultCoa);
    const [isLoading, setIsLoading] = useState(true);
    const [duplicateStates, setDuplicateState] = useState<DuplicateState>({
        values: {},
        emailBtn: false,
    });
    const [sendEmail, setSendEmail] = useState<boolean>(false);
    const [cid, setCid] = useState('');

    const paymentAccountOptions = useMemo(() => {
        return accountList.filter((accountObj) => accountObj.value >= 5000 && accountObj.value <= 6000);
    }, [accountList]);

    const salessAccountOptions = useMemo(() => {
        return accountList.filter((accountObj) => accountObj.value >= 1000 && accountObj.value <= 2000);
    }, [accountList]);

    const fetchCompaniesAndAccounts = async (cid: string) => {
        try {
            setIsLoading(true);
            const organizationList = await api.getApiDineroOrganizations();
            setCompanyList(organizationList?.data || []);
            if (organizationList?.data && organizationList.data.length > 0) {
                const selected = organizationList.data.find((company) => company.Id === cid);
                if (selected) {
                    setSelectedCompany(selected.Id);
                    await fetchCompanyMenuList(selected.Id);
                }
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCompanyMenuList = async (companyId: string) => {
        try {
            const accounts = await api.getApiDineroOrganizationsOrganizationIdAccounts(companyId);
            setCid(companyId);

            if (!accounts.success) {
                throw new Error('Failed to fetch accounts');
            }

            if (accounts?.data) {
                const options = accounts.data.map((account) => ({
                    label: `${account.AccountNumber}-${account.Name}`,
                    value: account.AccountNumber,
                }));
                setAccountList(options);
            }

            const coaData: CoaConfig = accounts.coaConfiguration || defaultCoa;
            setCoaConfig(coaData);

            if (accounts?.sendEmailFromDinero) {
                setSendEmail(accounts?.sendEmailFromDinero);
            }
            setDuplicateState((prev) => ({
                ...prev,
                values: coaData,
                emailBtn: accounts?.sendEmailFromDinero ?? false,
            }));
        } catch (err) {
            setAccountList([]);
            setCoaConfig(defaultCoa);
            toast.error('Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchCompaniesAndAccounts(selectedCompany);
    }, []);

    const handleSave = async () => {
        const saveData = {
            organizationId: selectedCompany,
            coaConfiguration: { ...coaConfig },
            sendEmailFromDinero: sendEmail,
        };

        try {
            const response = await api.putApiDineroConfig({ ...saveData });
            setActivebar(false);
            fetchCompanyMenuList(cid);
            toast.success(response?.message);
        } catch (err) {
            console.log('Error saving data:', err);
        }
    };

    const handleAccountChange = (field: string, value: any) => {
        setCoaConfig((prev) => ({
            ...prev,
            [field]: value ? Number(value) : value,
        }));
    };

    useEffect(() => {
        if (
            JSON.stringify(coaConfig) === JSON.stringify(duplicateStates.values) &&
            sendEmail === duplicateStates.emailBtn
        ) {
            setActivebar(false);
        } else {
            setActivebar(true);
        }
    }, [JSON.stringify(coaConfig), sendEmail, duplicateStates]);

    if (isLoading) {
        return (
            <>
                <Stack
                    flex={1}
                    width={'100%'}
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignContent={'flex-start'}
                >
                    <Skeleton variant="text" height={40} width={'70%'} sx={{ borderRadius: '10px' }} />
                    <Skeleton variant="text" height={40} width={'29%'} sx={{ borderRadius: '10px', ml: 2 }} />
                </Stack>
                <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                    <Skeleton variant="text" height={60} width={'100%'} sx={{ borderRadius: '10px' }} />
                </Stack>
            </>
        );
    }

    return (
        <>
            {activeBar && (
                <AppBar
                    sx={{
                        position: 'fixed',
                        top: 45,
                        left: 0,
                        right: 0,
                        py: 1,
                        px: 4,
                        bgcolor: '#fff',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        width: '100%',
                        zIndex: 8,
                        mb: 5,
                    }}
                >
                    <POSButton
                        variant="save"
                        width="auto"
                        height={35}
                        title={t('Setting.SaveChanges')}
                        onClick={() => handleSave()}
                    />
                </AppBar>
            )}
            {/* Company Selection */}
            <Box sx={{ mt: activeBar ? 8 : 0 }}>
                <IntegrationCard
                    title="Dinero"
                    processContent={
                        <Box>
                            <Typography sx={{ mb: 1, fontWeight: 'bold' }}>{t('POS.Company')}</Typography>
                            <POSSelect
                                options={companyList.map((company) => ({
                                    label: company.Name,
                                    value: company.Id,
                                }))}
                                value={selectedCompany}
                                onChange={async (e) => {
                                    const newCompanyId = e.target.value as string;
                                    setSelectedCompany(newCompanyId);
                                    await fetchCompaniesAndAccounts(newCompanyId); // Fetch details for the selected company
                                }}
                            />
                        </Box>
                    }
                />

                <Divider sx={{ border: '2.7px solid #D9D9D9', backgroundColor: '#F3F3F3', width: '100%' }} />

                {/* Send Email Switch */}
                <IntegrationCard
                    title="Send email from dinero"
                    description={t('Integration.DineroDescription')}
                    processContent={
                        <Box>
                            <Typography sx={{ mb: 1, fontWeight: 'bold' }}>
                                {t('Integration.SendEmailFromDinero')}
                            </Typography>
                            <POSSwitch
                                checked={sendEmail}
                                onChange={() => {
                                    setSendEmail(!sendEmail);
                                    setActivebar(!activeBar);
                                }}
                            />
                        </Box>
                    }
                />

                <Divider sx={{ border: '2.7px solid #D9D9D9', backgroundColor: '#F3F3F3', width: '100%' }} />

                {/* Sales Mapping */}
                <IntegrationCard
                    title={`${t('Integration.MappingSale')} dinero`}
                    description={t('Integration.MappingSaleDescription')}
                    processContent={
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>
                                    {t('Integration.SaleWithVAT')}
                                </Typography>
                                <POSSelect
                                    options={salessAccountOptions}
                                    value={coaConfig['salesWithVat']}
                                    onChange={(e) => {
                                        handleAccountChange('salesWithVat', e.target.value);
                                    }}
                                    sx={{
                                        '.css-bgp2v2-MuiTypography-root': {
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>
                                    {t('Integration.SalesWithoutVAT')}
                                </Typography>
                                <POSSelect
                                    options={salessAccountOptions}
                                    value={coaConfig['salesWithoutVat']}
                                    onChange={(e) => {
                                        handleAccountChange('salesWithoutVat', e.target.value);
                                    }}
                                    sx={{
                                        '.css-bgp2v2-MuiTypography-root': {
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    }
                />

                <Divider sx={{ border: '2.7px solid #D9D9D9', backgroundColor: '#F3F3F3', width: '100%' }} />

                {/* Payment Mapping */}
                <IntegrationCard
                    title={`${t('Integration.MappingPayment')}`}
                    description={t('Integration.MappingPaymentDescription')}
                    processContent={
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>{t('POS.Cash')}</Typography>
                                <POSSelect
                                    options={paymentAccountOptions}
                                    value={coaConfig['CASH']}
                                    onChange={(e) => {
                                        handleAccountChange('CASH', e.target.value);
                                    }}
                                    sx={{
                                        '.css-bgp2v2-MuiTypography-root': {
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>{t('POS.BankTransfer')}</Typography>
                                <POSSelect
                                    options={paymentAccountOptions}
                                    value={coaConfig['BANK_TRANSFER']}
                                    onChange={(e) => {
                                        handleAccountChange('BANK_TRANSFER', e.target.value);
                                    }}
                                    sx={{
                                        '.css-bgp2v2-MuiTypography-root': {
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>{t('Integration.MobilePay')}</Typography>
                                <POSSelect
                                    options={paymentAccountOptions}
                                    value={coaConfig['MOBILE_PAY']}
                                    onChange={(e) => {
                                        handleAccountChange('MOBILE_PAY', e.target.value);
                                    }}
                                    sx={{
                                        '.css-bgp2v2-MuiTypography-root': {
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>{t('POS.Card')}</Typography>
                                <POSSelect
                                    options={paymentAccountOptions}
                                    value={coaConfig['CARD']}
                                    onChange={(e) => {
                                        handleAccountChange('CARD', e.target.value);
                                    }}
                                    sx={{
                                        '.css-bgp2v2-MuiTypography-root': {
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>{t('POS.Outstanding')}</Typography>
                                <POSSelect
                                    options={paymentAccountOptions}
                                    value={coaConfig['OUTSTANDING']}
                                    onChange={(e) => {
                                        handleAccountChange('OUTSTANDING', e.target.value);
                                    }}
                                    sx={{
                                        '.css-bgp2v2-MuiTypography-root': {
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>{t('POS.GiftCard')}</Typography>
                                <POSSelect
                                    options={paymentAccountOptions}
                                    value={coaConfig['GIFT_CARD']}
                                    onChange={(e) => {
                                        handleAccountChange('GIFT_CARD', e.target.value);
                                    }}
                                    sx={{
                                        '.css-bgp2v2-MuiTypography-root': {
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>{t('PunchCard.PunchCard')}</Typography>
                                <POSSelect
                                    options={paymentAccountOptions}
                                    value={coaConfig['CUT_CARD']}
                                    onChange={(e) => {
                                        const newValue = e.target.value as string;
                                        handleAccountChange('CUT_CARD', newValue);
                                    }}
                                    sx={{
                                        '.css-bgp2v2-MuiTypography-root': {
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    }
                />
            </Box>
        </>
    );
};

export default DineroBox;
