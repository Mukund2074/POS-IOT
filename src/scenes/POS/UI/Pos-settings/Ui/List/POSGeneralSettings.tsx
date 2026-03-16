import React, { useCallback, useEffect, useState } from 'react';
import SettingUiCard, { SettingUiCardSkleton } from '../Shared/SettingUiCard';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import { AppBar, Grid2, IconButton, Stack } from '@mui/material';
import { t } from 'i18next';
import POSHeading from '@/components/POS/Common/POSHeading';
import { useFormik } from 'formik';
import { defaultPosPermissions, POS_GENERAL_SETTINGS } from '../../Core/pos-settings.data';
import POSButton from '@/components/POS/Common/POSButton';
import POSInput from '@/components/POS/Common/POSInput';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { PosSettingsApi } from '../../Core/pos-settings.api';
import { PosSetting, Settings } from '../../Types/pos-settings.types';
import { useSelector } from 'react-redux';
// @ts-ignore
import { useData } from '@/context/DataContext';
import { PermissionList } from '../Shared/PermissionList';
import { Circle, Replay } from '@mui/icons-material';
import { GetApiIotConnectionStatus200, GetApiIotConnectionStatus200Status } from '@/shared/api/models';

const posSettingsApi = new PosSettingsApi();

export default function POSGeneralSettings() {
    const storeSettings = useSelector((state: any) => state?.settings?.data);
    const employees = storeSettings?.employees || [];
    const user = useSelector((state: any) => state?.user?.data);
    const currentEmployeeId = Number(localStorage.getItem('employee_id'));
    const isAdmin = user?.role === 'ADMIN';

    const filteredEmployees = employees.filter((employee: any) => {
        if (isAdmin) {
            return employee.role !== 'ADMIN';
        } else {
            return employee?.id === currentEmployeeId;
        }
    });
    const [initialValues, setInitialValues] = useState<Settings>(POS_GENERAL_SETTINGS);
    const [isChanges, setIsChanges] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(filteredEmployees[0]?.id || 0);
    const { refreshSettings } = useData();

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setLoading(true);
            await handleSubmit(values);
        },
    });

    const [IOTStatus, setIOTStatus] = useState<GetApiIotConnectionStatus200 | undefined>({
        status: GetApiIotConnectionStatus200Status.DISCONNECTED,
    });

    const handleSubmit = async (values: any) => {
        try {
            const payload = {
                settings: [
                    {
                        settingCategory: 'pos_settings',
                        settingName: 'pos_general_settings',
                        value: JSON.stringify(values),
                        type: 'JSON',
                    },
                ],
            };
            await posSettingsApi.updatePosSetting(payload as unknown as PosSetting);
            await refreshSettings();
            toast.success(t('POS.ToastSuccSettingsUp'));
            setInitialValues(values);
            setIsChanges(false);
        } catch (err) {
            console.error(err);
            toast.error(t('POS.ToastErrSettingsUp'));
            // Only fetch settings on error to reset to server state
            fetchSettings();
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await posSettingsApi.getPosSettings();
            const found = res?.settings?.find(
                (s: PosSetting) => s.settingName === 'pos_general_settings' && s.settingCategory === 'pos_settings',
            );
            const PermisionEmployees: number[] = [];
            if (found && found.value) {
                let parsed: any;
                try {
                    parsed = JSON.parse(found.value);
                    Object.keys(parsed.employeePermissions).forEach((employeeId) => {
                        PermisionEmployees.push(Number(employeeId));
                    });

                    // add defualt permission which is not have object in employeePermissions
                    filteredEmployees.forEach((employee: any) => {
                        if (!PermisionEmployees.includes(employee.id)) {
                            parsed.employeePermissions[employee.id] = defaultPosPermissions;
                        }
                    });
                    // console.log('parsed', parsed);
                    // console.log('emper', PermisionEmployees);
                    // console.log('employees', filteredEmployees);
                } catch (e) {
                    parsed = POS_GENERAL_SETTINGS;
                }
                setInitialValues(JSON.parse(JSON.stringify(parsed)));
                setSelectedEmployeeId(filteredEmployees[0]?.id);
            } else {
                setInitialValues(POS_GENERAL_SETTINGS);
                setSelectedEmployeeId(filteredEmployees[0]?.id);
            }
        } catch (err) {
            setInitialValues(POS_GENERAL_SETTINGS);
            setSelectedEmployeeId(filteredEmployees[0]?.id);
        } finally {
            setFetching(false);
        }
    };

    const fetchIOTStatus = useCallback(async ({ showToast = false }: { showToast?: boolean } = {}) => {
        await posSettingsApi.reconnectTerminal().then((res) => {
            if (res?.status === 'CONNECTED') {
                setIOTStatus({
                    status: GetApiIotConnectionStatus200Status.CONNECTED,
                    deviceId: res?.deviceId,
                    outletId: res?.outletId,
                    deviceType: res?.deviceType,
                });
                if (showToast) {
                    toast.success(t('POS.ReconnectTerminalSuccess'));
                }
            } else {
                setIOTStatus({
                    status: GetApiIotConnectionStatus200Status.DISCONNECTED,
                    deviceId: res?.deviceId,
                    outletId: res?.outletId,
                    deviceType: res?.deviceType,
                });

                if (showToast) {
                    toast.error(t('POS.ReconnectTerminalError'));
                }
            }
        });
    }, []);

    useEffect(() => {
        fetchSettings();
        fetchIOTStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!_.isEqual(JSON.stringify(formik.values), JSON.stringify(initialValues))) {
            const timeOut = setTimeout(() => {
                setIsChanges(true);
            }, 300);
            return () => clearTimeout(timeOut);
        } else {
            setIsChanges(false);
        }
    }, [formik.values, initialValues]);

    // Handler for employee select
    const handleEmployeeChange = (employeeId: number) => {
        setSelectedEmployeeId(employeeId);
        // If employee doesn't exist, add with default permissions
        if (!formik.values.employeePermissions[employeeId]) {
            formik.setFieldValue(`employeePermissions.${employeeId}`, defaultPosPermissions);
        }
    };

    // Handler for permission change
    const handlePermissionChange = (module: string, permission: string, checked: boolean) => {
        const allowedSalesCreate = formik.values.employeePermissions[selectedEmployeeId]?.Sales?.create;
        const allowedGiftCardEdit = formik.values.employeePermissions[selectedEmployeeId]?.GiftCard?.update;
        const allowedGiftCardRead = formik.values.employeePermissions[selectedEmployeeId]?.GiftCard?.read;
        // const allowedCashDrawerRead = formik.values.employeePermissions[selectedEmployeeId]?.CashDrawer?.read;
        const allowedPunchCardRead = formik.values.employeePermissions[selectedEmployeeId]?.PunchCard?.read;
        const allowedPunchCardEdit = formik.values.employeePermissions[selectedEmployeeId]?.PunchCard?.update;
        if (module === 'GiftCard' && permission === 'create' && checked && !allowedSalesCreate) {
            toast.error(t('POS.GiftCardPermissionError'));
            return;
        } else if (module === 'Sales' && permission === 'create' && !checked) {
            formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${'GiftCard'}.${'create'}`, checked);
        } else if (module === 'GiftCard' && permission === 'read' && !checked) {
            formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${'GiftCard'}.${'update'}`, false);
            formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${'GiftCard'}.${'delete'}`, false);
        } else if (module === 'GiftCard' && permission === 'delete' && checked && !allowedGiftCardEdit) {
            toast.error(t('POS.DeleteGiftCardControl'));
            return;
        } else if (module === 'GiftCard' && permission === 'update' && checked && !allowedGiftCardRead) {
            toast.error(t('POS.UpdateGiftCardControl'));
            return;
        } else if (module === 'GiftCard' && permission === 'update' && !checked) {
            formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${'GiftCard'}.${'delete'}`, checked);
        } else if (module === 'PunchCard' && permission === 'update' && checked && !allowedPunchCardRead) {
            toast.error(t('POS.UpdatePunchCardControl'));
            return;
        } else if (module === 'PunchCard' && permission === 'delete' && checked && !allowedPunchCardEdit) {
            toast.error(t('POS.DeletePunchCardControl'));
            return;
        } else if (module === 'PunchCard' && permission === 'update' && !checked) {
            formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${'PunchCard'}.${'delete'}`, checked);
        } else if (module === 'PunchCard' && permission === 'read' && !checked) {
            formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${'PunchCard'}.${'update'}`, false);
            formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${'PunchCard'}.${'delete'}`, false);
        }

        // else if (module === 'CashDrawer' && permission === 'read' && !checked) {
        //     formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${'CashDrawer'}.${'update'}`, false);
        // } else if (module === 'CashDrawer' && permission === 'update' && checked && !allowedCashDrawerRead) {
        //     toast.error(t('POS.UpdateCashDrawerControl'));
        //     return;
        // }
        formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${module}.${permission}`, checked);
    };

    return (
        <React.Fragment>
            {isChanges && !loading && !fetching && (
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
                    }}
                >
                    <POSButton
                        onClick={formik.handleSubmit}
                        variant="save"
                        width="auto"
                        height={35}
                        title={t('Setting.SaveChanges')}
                        loading={loading}
                        disabled={loading}
                    />
                </AppBar>
            )}
            <Stack sx={{ borderRadius: 4, minHeight: '86vh', overflow: 'hidden', p: { md: 2 } }}>
                {fetching && <SettingUiCardSkleton />}
                <SettingUiCard
                    title={t('POS.SendEmailOnSaleCreated')}
                    description={t('POS.SendEmailOnSaleCreatedDescription')}
                    processContent={
                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                justifyContent: 'center',
                            }}
                        >
                            <POSHeading
                                text={t('POS.SendEmailReceiptToCustomer')}
                                sx={{ fontSize: 16, fontWeight: 700 }}
                            />
                            <POSSwitch
                                checked={formik.values.sendEmailReceipt}
                                onChange={(_, checked) => formik.setFieldValue('sendEmailReceipt', checked)}
                            />
                        </Stack>
                    }
                    topDivider={false}
                    bottomDivider={false}
                    containerSx={{ display: fetching ? 'none' : '', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                />
                <SettingUiCard
                    title={t('Setting.Permissions')}
                    description={t('POS.PermissionsDescription')}
                    processContent={
                        <React.Fragment>
                            <PermissionList
                                formik={formik}
                                selectedEmployeeId={selectedEmployeeId}
                                onEmployeeChange={handleEmployeeChange}
                                onPermissionChange={handlePermissionChange}
                                filteredEmployees={filteredEmployees}
                            />
                        </React.Fragment>
                    }
                    topDivider={true}
                    bottomDivider={false}
                    containerSx={{
                        display: fetching ? 'none' : '',
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                    }}
                />

                <SettingUiCard
                    title={t('POS.printCashDrawer')}
                    description={t('POS.printCashDrawerDescription')}
                    processContent={
                        <Stack sx={{ gap: 2 }}>
                            <POSSwitch
                                label={t('POS.ShowCashCountOnPrint')}
                                onChange={() => {
                                    formik?.setFieldValue(
                                        'cashDrawerPermissions.printCashDrawer.showCountOnPrint',
                                        !formik?.values?.cashDrawerPermissions?.printCashDrawer?.showCountOnPrint,
                                    );
                                }}
                                checked={formik?.values?.cashDrawerPermissions?.printCashDrawer?.showCountOnPrint}
                            />
                            <POSSwitch
                                label={t('POS.ShowSpecificationsOfPayments')}
                                onChange={() => {
                                    formik?.setFieldValue(
                                        'cashDrawerPermissions.printCashDrawer.showPaymentSpecification',
                                        !formik?.values?.cashDrawerPermissions?.printCashDrawer
                                            ?.showPaymentSpecification,
                                    );
                                }}
                                checked={
                                    formik?.values?.cashDrawerPermissions?.printCashDrawer?.showPaymentSpecification
                                }
                            />
                            <POSSwitch
                                label={t('POS.showPaymentMethods')}
                                onChange={() => {
                                    formik?.setFieldValue(
                                        'cashDrawerPermissions.printCashDrawer.showPaymentMethods',
                                        !formik?.values?.cashDrawerPermissions?.printCashDrawer?.showPaymentMethods,
                                    );
                                }}
                                checked={formik?.values?.cashDrawerPermissions?.printCashDrawer?.showPaymentMethods}
                            />
                        </Stack>
                    }
                    topDivider={true}
                    bottomDivider={false}
                    containerSx={{
                        display: fetching ? 'none' : '',
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                    }}
                />
                <SettingUiCard
                    title={t('POS.RoundingAmount')}
                    description={t('POS.RoundingAmountDesc')}
                    processContent={
                        <Stack sx={{ gap: 2 }}>
                            <POSSwitch
                                label={t('POS.RoundAmount')}
                                onChange={() => {
                                    formik?.setFieldValue(
                                        'cashDrawerPermissions.roundingAmount.roundDiscount',
                                        !formik?.values?.cashDrawerPermissions?.roundingAmount?.roundDiscount,
                                    );
                                }}
                                checked={formik?.values?.cashDrawerPermissions?.roundingAmount?.roundDiscount}
                            />
                        </Stack>
                    }
                    topDivider={true}
                    bottomDivider={false}
                    containerSx={{
                        display: fetching ? 'none' : '',
                    }}
                />
                <SettingUiCard
                    title={t('POS.TerminalConfiguration')}
                    description={t('POS.TerminalConfigurationDescription')}
                    processContent={
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <POSHeading text={t('POS.TerminalIP')} fontSize={16} />
                                <POSInput
                                    value={formik?.values?.terminalConfiguration?.terminalIp}
                                    onChange={(e) => {
                                        const onlyNumbers = e.target.value.replace(/[^0-9.]/g, '');
                                        formik.setFieldValue('terminalConfiguration.terminalIp', onlyNumbers);
                                    }}
                                    placeholder={t('POS.EnterTerminalIP')}
                                    width="100%"
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <POSHeading text={t('POS.TerminalPort')} fontSize={16} />
                                <POSInput
                                    value={formik?.values?.terminalConfiguration?.terminalPort}
                                    onChange={(e) => {
                                        const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                                        formik.setFieldValue(
                                            'terminalConfiguration.terminalPort',
                                            parseInt(onlyNumbers) || 0,
                                        );
                                    }}
                                    placeholder={t('POS.EnterTerminalPort')}
                                    width="100%"
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <POSHeading text={t('POS.ConnectionStatus')} fontSize={16} />
                                <Stack
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 2,
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 3,
                                        bgcolor:
                                            IOTStatus?.status === GetApiIotConnectionStatus200Status.CONNECTED
                                                ? '#E6F4EA'
                                                : '#FEE2E2',
                                    }}
                                >
                                    {' '}
                                    <Circle
                                        sx={{
                                            fontSize: 12,
                                            color:
                                                IOTStatus?.status === GetApiIotConnectionStatus200Status.CONNECTED
                                                    ? 'green'
                                                    : 'red',
                                        }}
                                    />{' '}
                                    <span>
                                        {IOTStatus?.status === GetApiIotConnectionStatus200Status.CONNECTED
                                            ? t('POS.Connected')
                                            : t('POS.Disconnected')}
                                    </span>{' '}
                                    <IconButton
                                        sx={{ ml: 'auto' }}
                                        disableFocusRipple
                                        disableRipple
                                        disableTouchRipple
                                        onClick={() => {
                                            fetchIOTStatus({ showToast: true });
                                        }}
                                    >
                                        <Replay sx={{ fontSize: 24 }} />
                                    </IconButton>
                                </Stack>

                                {/* <POSInput
                                    value={formik?.values?.terminalConfiguration?.integrationKey || ''}
                                    onChange={(e) =>
                                        formik.setFieldValue('terminalConfiguration.integrationKey', e.target.value)
                                    }
                                    placeholder={t('POS.EnterIntegrationKey')}
                                    width="100%"
                                /> */}
                            </Grid2>

                            {/* <Grid2 size={{ xs: 12, md: 6 }}>
                                <POSHeading text={t('POS.SecretKey')} fontSize={16} />
                                <POSInput
                                    type={showSecretKey ? 'text' : 'password'}
                                    value={formik?.values?.terminalConfiguration?.secretKey || ''}
                                    onChange={(e) =>
                                        formik.setFieldValue('terminalConfiguration.secretKey', e.target.value)
                                    }
                                    placeholder={t('POS.EnterSecretKey')}
                                    width="100%"
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowSecretKey(!showSecretKey)}>
                                                        {showSecretKey ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid2> */}
                        </Grid2>
                    }
                    topDivider={true}
                    bottomDivider={false}
                    containerSx={{
                        display: fetching ? 'none' : '',
                    }}
                />
                <SettingUiCard
                    title={t('POS.PaymentOptions')}
                    description={t('POS.PaymentOptionsDescription')}
                    processContent={
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <POSSwitch
                                    label={t('POS.Card')}
                                    checked={formik?.values?.paymentOptions?.card}
                                    onChange={(_, checked) => formik.setFieldValue('paymentOptions.card', checked)}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <POSSwitch
                                    label={t('POS.CardTerminal')}
                                    checked={formik?.values?.paymentOptions?.cardTerminal || false}
                                    onChange={(_, checked) =>
                                        formik.setFieldValue('paymentOptions.cardTerminal', checked)
                                    }
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <POSSwitch
                                    label={t('POS.BankTransfer')}
                                    checked={formik?.values?.paymentOptions?.bankTransfer}
                                    onChange={(_, checked) =>
                                        formik.setFieldValue('paymentOptions.bankTransfer', checked)
                                    }
                                />
                            </Grid2>
                            <Grid2
                                size={{ xs: 12, md: 6 }}
                                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                            >
                                <POSSwitch
                                    label={t('POS.MobilePay')}
                                    checked={formik?.values?.paymentOptions?.mobilePay}
                                    onChange={(_, checked) => {
                                        // if (!checked) {
                                        //     // Always allow - no validation needed
                                        //     formik.setFieldValue('paymentOptions.mobilePay', false);
                                        // }

                                        // // Scenario 2: User turns ON MobilePay
                                        // if (checked) {
                                        //     if (storeSettings?.profile?.merchant_id) {
                                        //         // Allow the change
                                        //         formik.setFieldValue('paymentOptions.mobilePay', true);
                                        //     } else {
                                        //         // Show error and prevent the change
                                        //         toast.error('MobilePay validation message');
                                        //         formik.setFieldValue('paymentOptions.mobilePay', false);
                                        //     }
                                        // }

                                        formik.setFieldValue('paymentOptions.mobilePay', checked);
                                    }}
                                />
                                {/* <Tooltip title={t('POS.MobilePayControl')}>
                                    <InfoOutlined sx={{ fontSize: 16, color: 'gray' }} />
                                </Tooltip> */}
                            </Grid2>
                        </Grid2>
                    }
                    topDivider={true}
                    bottomDivider={false}
                    containerSx={{
                        display: fetching ? 'none' : '',
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                    }}
                />
                {/* <SettingUiCard
                    title={t('POS.generalSetup')}
                    description={t('POS.generalSetupDescription')}
                    processContent={
                        <Stack sx={{ gap: 2 }}>
                            <POSSwitch
                                label={t('POS.hideLastCount')}
                                onChange={() => {
                                    formik?.setFieldValue(
                                        'cashDrawerPermissions.generalSetup.hideLastCount',
                                        !formik?.values?.cashDrawerPermissions?.generalSetup?.hideLastCount,
                                    );
                                }}
                                checked={formik?.values?.cashDrawerPermissions?.generalSetup?.hideLastCount}
                            />
                        </Stack>
                    }
                    topDivider={true}
                    bottomDivider={false}
                    containerSx={{
                        display: fetching ? 'none' : '',
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                    }}
                /> */}
            </Stack>
        </React.Fragment>
    );
}
