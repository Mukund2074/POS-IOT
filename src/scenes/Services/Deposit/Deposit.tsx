import POSHeading from '@/components/POS/Common/POSHeading';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import POSInput from '@/components/POS/Common/POSInput';
import { Grid2, Stack, AppBar, CircularProgress, InputAdornment, Typography } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useForm, useFieldArray, useWatch, FormProvider, useController } from 'react-hook-form';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import POSButton from '@/components/POS/Common/POSButton';
import { api } from '@/utils/Api/POS';
import { PatchApiServicesDepositBody } from '@/shared/api/models';
import { toast } from 'react-toastify';

// ------------------ Types ------------------

interface ServiceFieldProps {
    control: any;
    groupIndex: number;
    serviceIndex: number;
    service: ServiceForm;
    sameForAllServices?: boolean;
}

interface GroupForm {
    groupedServices: GroupedServicesForm[];
    depositSetting: DepositSettingForm;
}

interface ServiceForm {
    id: number;
    name: string;
    sequence: number | null;
    groupId: number | null;
    groupName: string | null;
    depositType: 'PERCENTAGE' | 'AMOUNT';
    depositValue: number;
    price: number;
}

interface GroupedServicesForm {
    id: number;
    group: string;
    createdAt: string | null;
    sequence: number | null;
    services: ServiceForm[];
}

interface DepositSettingForm {
    enableDeposit: boolean;
    sameForAllServices: boolean;
}

// ------------------ Service Field Component ------------------

const ServiceField = ({ control, groupIndex, serviceIndex, service, sameForAllServices }: ServiceFieldProps) => {
    const namePath = `groupedServices.${groupIndex}.services.${serviceIndex}.name` as const;
    const pricePath = `groupedServices.${groupIndex}.services.${serviceIndex}.price` as const;
    const depositValuePath = `groupedServices.${groupIndex}.services.${serviceIndex}.depositValue` as const;
    const depositTypePath = `groupedServices.${groupIndex}.services.${serviceIndex}.depositType` as const;

    const { field: nameField } = useController({ control, name: namePath });
    const { field: priceField } = useController({ control, name: pricePath });
    const { field: depositValueField } = useController({ control, name: depositValuePath });
    const { field: depositTypeField } = useController({ control, name: depositTypePath });

    const price = Number(priceField.value) || 0;
    const depositValue = Number(depositValueField.value) || 0;

    const depositAmount = depositTypeField.value === 'AMOUNT' ? depositValue : (price * depositValue) / 100;

    const depositPercentage =
        depositTypeField.value === 'PERCENTAGE' ? depositValue : price > 0 ? (depositValue / price) * 100 : 0;

    return (
        <Grid2
            container
            spacing={3}
            sx={{
                border: '1px solid #A79C92',
                borderRadius: '12px',
                px: 3,
                py: 0.5,
                mt: 2,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {/* Name */}
            <Grid2 size={{ xs: 12, md: 4 }}>
                <POSHeading text={nameField.value} sx={{ fontWeight: 400, fontSize: '16px' }} />
            </Grid2>

            {/* Price */}
            <Grid2 size={{ xs: 12, md: 2 }}>
                <POSHeading text={formatCurrency(priceField.value)} sx={{ fontWeight: 400, fontSize: '16px' }} />
            </Grid2>

            {/* Amount */}
            <Grid2 size={{ xs: 12, md: 3 }}>
                <POSInput
                    type="number"
                    value={Math.round(depositAmount)}
                    disabled={sameForAllServices}
                    onChange={(e) => {
                        if (sameForAllServices) return;
                        const amount = Number(e.target.value);
                        const validAmount = Math.min(amount, price);
                        depositTypeField.onChange('AMOUNT');
                        depositValueField.onChange(validAmount);
                    }}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Typography variant="body2" color="text.secondary">
                                        {t('POS.Currency')}
                                    </Typography>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Grid2>

            {/* Percentage */}
            <Grid2 size={{ xs: 12, md: 3 }}>
                <POSInput
                    type="number"
                    value={Math.round(depositPercentage)}
                    disabled={sameForAllServices}
                    onChange={(e) => {
                        if (sameForAllServices) return;
                        const percentage = Number(e.target.value);
                        const validPercentage = Math.min(percentage, 100);
                        depositTypeField.onChange('PERCENTAGE');
                        depositValueField.onChange(validPercentage);
                    }}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Typography variant="body2" color="text.secondary">
                                        %{' '}
                                    </Typography>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Grid2>
        </Grid2>
    );
};

// ------------------ Component ------------------

export default function Deposit() {
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const methods = useForm<GroupForm>({
        defaultValues: {} as GroupForm,
    });

    const { control, setValue, handleSubmit, watch, getValues } = methods;

    // ✅ Watch the entire form
    const watchedData = watch();

    // ✅ Compare current vs initial
    const [isChanges, setIsChanges] = useState(false);

    // ✅ Memoize initial data so it's stable across re-renders
    const initialDataRef = useRef(
        JSON.stringify({
            groupedServices: [],
            depositSetting: { enableDeposit: false, sameForAllServices: false },
        } as GroupForm),
    );

    useEffect(() => {
        const currentData = JSON.stringify(watchedData);
        const hasChanges = initialDataRef.current !== currentData;

        // Only update state when necessary to prevent flicker
        setIsChanges((prev) => (prev !== hasChanges ? hasChanges : prev));
    }, [watchedData]);

    const { fields } = useFieldArray({
        control,
        name: 'groupedServices',
    });

    // ✅ Watch deposit settings
    const depositSetting = useWatch({
        control,
        name: 'depositSetting',
    });

    const sameForAllServices = depositSetting?.sameForAllServices;

    // ✅ Controller for toggles
    const { field: sameForAllServicesField } = useController({
        control,
        name: 'depositSetting.sameForAllServices',
    });

    const { field: enableDepositField } = useController({
        control,
        name: 'depositSetting.enableDeposit',
    });

    // ✅ State for global inputs
    const [globalAmount, setGlobalAmount] = React.useState(0);
    const [globalPercentage, setGlobalPercentage] = React.useState(0);

    // ------------------ Validation Helper ------------------

    /**
     * Validates and normalizes deposit values to ensure they don't exceed service prices
     * This is called when data is loaded from API or when prices change
     */
    const validateAndNormalizeDeposits = useCallback(() => {
        const currentData = getValues();
        if (!currentData.groupedServices) return;

        currentData.groupedServices.forEach((group, groupIndex) => {
            group.services.forEach((service, serviceIndex) => {
                const price = service.price || 0;
                const depositType = service.depositType || 'AMOUNT';
                let depositValue = service.depositValue || 0;

                // If deposit type is AMOUNT, ensure it doesn't exceed price
                if (depositType === 'AMOUNT') {
                    depositValue = Math.min(depositValue, price);
                }
                // If deposit type is PERCENTAGE, ensure the calculated amount doesn't exceed price
                else if (depositType === 'PERCENTAGE') {
                    const calculatedAmount = (price * depositValue) / 100;
                    if (calculatedAmount > price) {
                        // If percentage would result in amount > price, cap the percentage
                        depositValue = price > 0 ? 100 : 0;
                    }
                }

                // Update the value if it was changed
                if (service.depositValue !== depositValue) {
                    setValue(`groupedServices.${groupIndex}.services.${serviceIndex}.depositValue`, depositValue);
                }
            });
        });
    }, [getValues, setValue]);

    // ------------------ Global Logic ------------------

    const handleGlobalAmountChange = (value: number) => {
        setGlobalAmount(value);
        setGlobalPercentage(0);
        if (value <= 0) return;

        fields.forEach((group, groupIndex) => {
            group.services.forEach((service, serviceIndex) => {
                const price = service.price || 0;
                const validAmount = Math.min(value, price);
                setValue(`groupedServices.${groupIndex}.services.${serviceIndex}.depositType`, 'AMOUNT');
                setValue(`groupedServices.${groupIndex}.services.${serviceIndex}.depositValue`, validAmount);
            });
        });
    };

    const handleGlobalPercentageChange = (value: number) => {
        setGlobalPercentage(value);
        setGlobalAmount(0);
        if (value <= 0) return;

        const validPercentage = Math.min(value, 100);
        fields.forEach((group, groupIndex) => {
            group.services.forEach((service, serviceIndex) => {
                setValue(`groupedServices.${groupIndex}.services.${serviceIndex}.depositType`, 'PERCENTAGE');
                setValue(`groupedServices.${groupIndex}.services.${serviceIndex}.depositValue`, validPercentage);
            });
        });
    };

    // ------------------ Watch for Price Changes ------------------
    // Track previous prices to detect changes
    const previousPricesRef = useRef<string>('');

    useEffect(() => {
        if (!watchedData.groupedServices || watchedData.groupedServices.length === 0) return;

        // Create a string representation of all prices
        const currentPrices = watchedData.groupedServices
            .map((group) => group.services.map((service) => `${service.id}:${service.price}`).join(','))
            .join('|');

        // Only validate if prices have actually changed
        if (previousPricesRef.current && previousPricesRef.current !== currentPrices) {
            validateAndNormalizeDeposits();
        }

        // Update the ref with current prices
        previousPricesRef.current = currentPrices;
    }, [watchedData.groupedServices, validateAndNormalizeDeposits]);

    // ------------------ Submit Handler ------------------
    const onSubmit = useCallback(async () => {
        setProcessing(true);
        // Validate deposits before submitting
        validateAndNormalizeDeposits();

        // Get the validated data after normalization
        const validatedData = getValues();

        // ✅ Flatten services array
        const allServices = validatedData.groupedServices.flatMap((group) =>
            group.services.map((s) => {
                const price = s.price || 0;
                let depositValue = s.depositValue || 0;

                // Final validation: ensure deposit value doesn't exceed price
                if (s.depositType === 'AMOUNT') {
                    depositValue = Math.min(depositValue, price);
                } else if (s.depositType === 'PERCENTAGE') {
                    const calculatedAmount = (price * depositValue) / 100;
                    if (calculatedAmount > price) {
                        depositValue = price > 0 ? 100 : 0;
                    }
                }

                return {
                    id: s.id,
                    depositType: s.depositType,
                    depositValue: depositValue,
                };
            }),
        );

        const payload = {
            depositSetting: validatedData.depositSetting,
            services: allServices,
        };

        await handlePatchApi({ payload });
    }, [fields, getValues, setValue, validateAndNormalizeDeposits]);

    const handlePatchApi = async ({ payload }: { payload: PatchApiServicesDepositBody }) => {
        try {
            const response = await api.patchApiServicesDeposit(payload);
            if (response.success) {
                toast.success(t('Services.ToastSuccessServicesDeposit'));
                setIsChanges(false);

                // Update initialDataRef after successful save
                // This ensures the "Save Changes" AppBar doesn't show after saving
                const currentData = getValues();
                initialDataRef.current = JSON.stringify(currentData);

                handleGetApi();
            }
        } catch (error) {
            console.error('Error updating services deposit:', error);
            toast.error(t('Services.ToastErrorServicesDeposit'));
        } finally {
            setProcessing(false);
        }
    };

    const handleGetApi = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.getApiServicesDeposit();
            if (response.success) {
                setValue('groupedServices', response.data?.groupedServices as GroupedServicesForm[]);
                setValue('depositSetting', response.data?.depositSetting as DepositSettingForm);

                // Validate deposit values after loading data from API
                // Use setTimeout to ensure setValue has completed
                setTimeout(() => {
                    validateAndNormalizeDeposits();

                    // Update initialDataRef after loading and validating data
                    // This prevents the "Save Changes" AppBar from showing on initial load
                    const validatedData = getValues();
                    initialDataRef.current = JSON.stringify(validatedData);
                    setIsChanges(false);
                }, 0);
            }
        } catch (error) {
            console.error('Error fetching services deposit:', error);
        } finally {
            setLoading(false);
        }
    }, [setValue, validateAndNormalizeDeposits, getValues]);

    // ✅ Handler for button click (gets current form values)

    useEffect(() => {
        handleGetApi();
    }, [handleGetApi]);

    if (loading) {
        return (
            <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress
                    sx={{
                        position: 'absolute',
                        width: 40,
                        height: 40,
                        color: 'inherit',
                    }}
                />
            </Stack>
        );
    }

    // ------------------ Render ------------------
    return (
        <FormProvider {...methods}>
            {isChanges && (
                <AppBar
                    sx={{
                        position: 'sticky',
                        zIndex: 20,
                        top: 47,
                        left: 0,
                        py: 1,
                        px: 4,
                        height: 50,
                        bgcolor: '#fff',
                        display: 'flex',
                        alignItems: 'flex-end',
                        width: '100%',
                        borderWidth: 0,
                    }}
                >
                    <POSButton
                        onClick={onSubmit}
                        sx={{ background: '#44b904', fontWeight: 700 }}
                        titleColor="#fff"
                        width="auto"
                        height={40}
                        title={
                            processing ? (
                                <Stack sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}>
                                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                                    {t('POS.Processing')}
                                </Stack>
                            ) : (
                                t('Setting.SaveChanges')
                            )
                        }
                        disabled={processing}
                    />
                </AppBar>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack sx={{ p: { xs: 2, md: 4 }, mt: 3 }}>
                    <Grid2 container spacing={3} sx={{ background: '#fff', borderRadius: '25px', p: { xs: 2, md: 4 } }}>
                        {/* Left Section */}
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <POSHeading text={t('Services.UpFrontPayment')} />
                            <POSHeading
                                text={t('Services.DepoositDescription')}
                                sx={{ fontWeight: 400 }}
                                fontColor="#666"
                                fontSize="16px"
                            />
                        </Grid2>

                        {/* Right Section */}
                        <Grid2 size={{ xs: 12, md: 8 }}>
                            {/* Enable Deposit */}
                            <POSHeading text={t('Services.EnableUpFrontPayment')} />
                            <POSSwitch
                                checked={enableDepositField.value}
                                onChange={(e, checked) => enableDepositField.onChange(checked)}
                            />

                            {enableDepositField.value && (
                                <React.Fragment>
                                    {/* Same For All Services */}
                                    <POSHeading
                                        text={t('Services.SameForAllServices')}
                                        sx={{ mt: 2, fontWeight: 400, fontSize: '16px' }}
                                    />

                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <POSSwitch
                                            checked={sameForAllServicesField.value}
                                            onChange={(e, checked) => sameForAllServicesField.onChange(checked)}
                                        />

                                        {/* Global Inputs */}
                                        <POSInput
                                            type="number"
                                            value={globalAmount}
                                            disabled={!sameForAllServicesField.value}
                                            onChange={(e) => {
                                                const largestServicePrice = Math.max(
                                                    ...fields.flatMap((group) =>
                                                        group.services.map((service) => service.price || 0),
                                                    ),
                                                );
                                                const value = Number(e.target.value);
                                                if (value > largestServicePrice) {
                                                    handleGlobalAmountChange(largestServicePrice);
                                                } else {
                                                    handleGlobalAmountChange(value);
                                                }
                                            }}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Typography variant="body2" color="text.secondary">
                                                                {t('POS.Currency')}
                                                            </Typography>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                        <POSInput
                                            type="number"
                                            value={globalPercentage}
                                            disabled={!sameForAllServicesField.value}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                if (value > 100) {
                                                    handleGlobalPercentageChange(100);
                                                } else {
                                                    handleGlobalPercentageChange(value);
                                                }
                                            }}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Typography variant="body2" color="text.secondary">
                                                                %{' '}
                                                            </Typography>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    </Stack>

                                    {/* Services */}
                                    {fields.map((group, groupIndex) => (
                                        <Stack key={group.id} sx={{ mt: 2 }}>
                                            <POSHeading text={group.group} />
                                            {group.services.map((service, serviceIndex) => (
                                                <ServiceField
                                                    key={service.id}
                                                    control={control}
                                                    groupIndex={groupIndex}
                                                    serviceIndex={serviceIndex}
                                                    service={service}
                                                    sameForAllServices={sameForAllServices}
                                                />
                                            ))}
                                        </Stack>
                                    ))}
                                </React.Fragment>
                            )}
                        </Grid2>
                    </Grid2>
                </Stack>
            </form>
        </FormProvider>
    );
}
