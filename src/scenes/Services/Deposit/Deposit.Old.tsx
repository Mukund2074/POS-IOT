import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import {
    GetApiServicesDeposit200DataDepositSetting,
    GetApiServicesDeposit200DataGroupedServicesItem,
} from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { AppBar, Box, CircularProgress, Grid2, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';

interface Group {
    groupedServices?: GetApiServicesDeposit200DataGroupedServicesItem[];
    sharedFinalAmount: number;
    sharedPercentage: number;
    depositSetting?: GetApiServicesDeposit200DataDepositSetting;
    percentage: number;
}

interface GroupForm extends Group {
    // frontend-only percentages
    _servicePercentages?: Record<string, number>;
}

const Deposit = () => {
    const [isLoading, setLoading] = useState(false);
    const [isChanges, setChanges] = useState(false);
    const [isChecked, setChecked] = useState<boolean>(false);
    const [duplicateData, setDuplicateData] = useState<GetApiServicesDeposit200DataGroupedServicesItem[]>([]);

    const { control, watch, setValue } = useForm<GroupForm>({
        defaultValues: {
            groupedServices: [],
            sharedFinalAmount: 0,
            sharedPercentage: 0,
            depositSetting: {},
            percentage: 0,
            _servicePercentages: {},
        },
    });

    const { replace } = useFieldArray({
        control,
        name: 'groupedServices',
    });

    const groupedServices = watch('groupedServices');
    const sharedFinalAmount = watch('sharedFinalAmount');
    const sharedPercentage = watch('sharedPercentage');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getApiServicesDeposit();

                replace((response?.data?.groupedServices || []) as GetApiServicesDeposit200DataGroupedServicesItem[]);
                setDuplicateData(response?.data?.groupedServices as GetApiServicesDeposit200DataGroupedServicesItem[]);
            } catch (error) {
                console.error('Error fetching deposit data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [replace]);

    // for add all services amount
    useEffect(() => {
        if (isChecked) {
            groupedServices?.map((group, groupIndex) => {
                group.services?.map((service, serviceIndex) => {
                    setValue(`groupedServices.${groupIndex}.services.${serviceIndex}.depositValue`, sharedFinalAmount);
                });
            });
        } else {
            if (Array.isArray(duplicateData)) {
                setValue('groupedServices', [...duplicateData]);
            }
        }
    }, [isChecked, sharedFinalAmount, setValue, duplicateData]);

    // for add all services percentage
    useEffect(() => {
        if (isChecked) {
            groupedServices?.map((group, gIndex) => {
                group?.services?.map((services, sIndex) => {
                    setValue(`_servicePercentages.${gIndex}-${sIndex}`, sharedPercentage);
                });
            });
        } else {
            if (Array.isArray(duplicateData)) {
                setValue('groupedServices', [...duplicateData]);
            }
        }
    }, [isChecked, sharedPercentage, setValue, duplicateData]);

    // Update all services depositValue and percentage when isChecked is true
    useEffect(() => {
        if (isChecked) {
            groupedServices?.forEach((group, groupIndex) => {
                group.services?.forEach((service, serviceIndex) => {
                    const servicePrice = service.price ?? 0;

                    // 1️⃣ Determine depositValue based on sharedFinalAmount if set, else from sharedPercentage
                    let depositAmount = sharedFinalAmount;

                    if (sharedFinalAmount === 0 && sharedPercentage > 0) {
                        depositAmount = Math.round((servicePrice * sharedPercentage) / 100);
                    }

                    // 2️⃣ Cap depositAmount at servicePrice
                    depositAmount = Math.min(depositAmount, servicePrice);

                    // 3️⃣ Update depositValue
                    setValue(`groupedServices.${groupIndex}.services.${serviceIndex}.depositValue`, depositAmount);

                    // 4️⃣ Calculate percentage based on depositValue
                    const percentage = servicePrice
                        ? Math.min(Math.round((depositAmount / servicePrice) * 100), 100)
                        : 0;

                    // 5️⃣ Update frontend-only percentage map
                    setValue(`_servicePercentages.${groupIndex}-${serviceIndex}`, percentage);
                });
            });
        } else {
            // Reset all services when unchecked
            if (Array.isArray(duplicateData)) {
                replace([...duplicateData]); // reset groupedServices
                setValue('_servicePercentages', {});
            }
        }
    }, [isChecked, sharedFinalAmount, sharedPercentage]);

    const groupedServicess = useWatch({
        control,
        name: 'groupedServices',
    });

    useEffect(() => {
        const hasChange = JSON.stringify(groupedServices) !== JSON.stringify(duplicateData);
        setChanges(hasChange);
    }, [groupedServicess]);

    const handlePatchApi = async () => {};

    return (
        <>
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
                        onClick={handlePatchApi}
                        sx={{ background: '#44b904', fontWeight: 700 }}
                        titleColor="#fff"
                        width="auto"
                        height={40}
                        title={t('Setting.SaveChanges')}
                    />
                </AppBar>
            )}
            <Stack sx={{ p: { xs: 2, md: 4 }, mt: 3 }}>
                {isLoading ? (
                    <CircularProgress
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: 30, sm: 40, md: 50 },
                            height: { xs: 30, sm: 40, md: 50 },
                        }}
                    />
                ) : (
                    <>
                        <Stack sx={{ background: '#fff', borderRadius: '25px' }}>
                            <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={3}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <POSHeading text={t('Deposit.UpFrontPayment')} />
                                    <POSHeading
                                        text={t('Deposit.DepoositDescription')}
                                        sx={{ fontWeight: 400 }}
                                        fontColor="#666"
                                        fontSize="16px"
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 8 }}>
                                    {/* 🔹 Shared Controls */}
                                    <Stack
                                        sx={{
                                            display: { xs: 'block', lg: 'flex' },
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Typography sx={{ fontWeight: 400, color: '#1F1F1F', mr: 2 }}>
                                                Fælles for alle
                                            </Typography>
                                            <POSSwitch
                                                checked={isChecked}
                                                onChange={(e, checked) => {
                                                    setChecked(checked);
                                                }}
                                            />
                                        </Box>

                                        {/* update button and overall amount and percentag add */}
                                        <Box
                                            sx={{
                                                display: { xs: 'block', sm: 'flex' },
                                                gap: 3,
                                                alignItems: 'center',
                                            }}
                                        >
                                            {/* Shared Final Amount */}
                                            <Controller
                                                name="sharedFinalAmount"
                                                control={control}
                                                render={({ field }) => (
                                                    <POSInput
                                                        {...field}
                                                        type="number"
                                                        onChange={field.onChange}
                                                        disabled={isChecked === false ? true : false}
                                                        value={field.value}
                                                    />
                                                )}
                                            />
                                            <Controller
                                                name="sharedPercentage"
                                                control={control}
                                                render={({ field }) => (
                                                    <POSInput
                                                        {...field}
                                                        type="number"
                                                        onChange={field.onChange}
                                                        disabled={isChecked === false ? true : false}
                                                        value={field.value}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Stack>

                                    <Stack>
                                        {groupedServices?.map((grService, groupIndex) => (
                                            <Box key={grService.id} sx={{ mt: 3 }}>
                                                <POSHeading text={grService.group as string} />

                                                {grService.services?.map((service, serviceIndex) => (
                                                    <Stack
                                                        key={service.id}
                                                        sx={{
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            border: '1px solid #A79C92',
                                                            borderRadius: '12px',
                                                            px: 3,
                                                            py: 1,
                                                            mt: 2,
                                                        }}
                                                    >
                                                        <Typography>{service.name}</Typography>

                                                        <Stack
                                                            direction={{ xs: 'column', sm: 'row' }}
                                                            gap={3}
                                                            alignItems="center"
                                                        >
                                                            <Typography fontWeight={800}>
                                                                {service.price} kr.
                                                            </Typography>

                                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                                {/* 🔹 Service Deposit Amount (kr.) */}
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Controller
                                                                        control={control}
                                                                        name={`groupedServices.${groupIndex}.services.${serviceIndex}.depositValue`}
                                                                        render={({ field }) => (
                                                                            <POSInput
                                                                                type="number"
                                                                                {...field}
                                                                                disabled={isChecked}
                                                                                onChange={(e) => {
                                                                                    const value =
                                                                                        Number(e.target.value) || 0;
                                                                                    const maxPrice = service.price ?? 0;
                                                                                    const validAmount =
                                                                                        value > maxPrice
                                                                                            ? maxPrice
                                                                                            : value;

                                                                                    setValue(
                                                                                        `groupedServices.${groupIndex}.services.${serviceIndex}.depositValue`,
                                                                                        validAmount,
                                                                                    );

                                                                                    // 🔹 Auto-update percentage
                                                                                    const newPercentage = maxPrice
                                                                                        ? (validAmount / maxPrice) * 100
                                                                                        : 0;
                                                                                    setValue(
                                                                                        `percentage`,
                                                                                        Number(
                                                                                            newPercentage.toFixed(2),
                                                                                        ),
                                                                                    );
                                                                                }}
                                                                                value={field.value ?? ''}
                                                                            />
                                                                        )}
                                                                    />

                                                                    <Typography
                                                                        sx={{ color: '#367B3D', fontWeight: 700 }}
                                                                    >
                                                                        kr.
                                                                    </Typography>
                                                                </Stack>

                                                                {/* 🔹 Service Deposit Percentage (%) */}
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Controller
                                                                        control={control}
                                                                        name={`_servicePercentages.${groupIndex}-${serviceIndex}`}
                                                                        render={({ field }) => (
                                                                            <POSInput
                                                                                type="number"
                                                                                {...field}
                                                                                disabled={isChecked}
                                                                                value={
                                                                                    field.value ??
                                                                                    Math.round(
                                                                                        ((service?.depositValue ?? 0) /
                                                                                            (service?.price ?? 1)) *
                                                                                            100,
                                                                                    )
                                                                                }
                                                                                onChange={(e) => {
                                                                                    const percent =
                                                                                        Number(e.target.value) || 0;
                                                                                    const validPercent =
                                                                                        percent > 100 ? 100 : percent;

                                                                                    setValue(
                                                                                        `_servicePercentages.${groupIndex}-${serviceIndex}`,
                                                                                        validPercent,
                                                                                    );

                                                                                    // update depositValue for this service
                                                                                    const newAmount = service.price
                                                                                        ? (service.price *
                                                                                              validPercent) /
                                                                                          100
                                                                                        : 0;
                                                                                    setValue(
                                                                                        `groupedServices.${groupIndex}.services.${serviceIndex}.depositValue`,
                                                                                        Number(newAmount.toFixed(2)),
                                                                                    );
                                                                                }}
                                                                            />
                                                                        )}
                                                                    />

                                                                    <Typography
                                                                        sx={{ color: '#D30000', fontWeight: 700 }}
                                                                    >
                                                                        %
                                                                    </Typography>
                                                                </Stack>
                                                            </Box>
                                                        </Stack>
                                                    </Stack>
                                                ))}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid2>
                            </Grid2>
                        </Stack>
                    </>
                )}
            </Stack>
        </>
    );
};

export default Deposit;
