import { Grid2, IconButton, InputAdornment, Stack, Typography } from '@mui/material';
import FPrimaryHeading from '../commonComponents/F_PrimaryHeading';
import FTextInput from '../commonComponents/F_TextInput';
import FButton from '../commonComponents/F_Button';
import { t } from 'i18next';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import DeleteIcon from '../../assets/DeleteIcon.png';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import apiFetcher2 from '../../utils/Api/POS/Interceptor2';

const GroupServiceDrivingFees = ({ serviceGroup, selectedServiceGroup, handleClose }) => {
    const [initialValues, setInitialValues] = useState({
        inspection_module: {
            distance_charges: [{ distance_upto: 0, amount: 0 }],
        },
    });

    const DistanceChargesValidation = Yup.object({
        inspection_module: Yup.object({
            distance_charges: Yup.array().of(
                Yup.object({
                    distance_upto: Yup.number().required(t('Services.RequiredDistance')),
                    amount: Yup.number().required(t('POS.YuprequiredAmount')),
                }),
            ),
        }),
    });

    const formik = useFormik({
        initialValues,
        validationSchema: DistanceChargesValidation,
        validateOnChange: true,
        validateOnBlur: true,
        enableReinitialize: initialValues?.inspection_module?.distance_charges.length === 0 ? false : true,
        onSubmit: (value) => {
            const patchApiData = async () => {
                try {
                    await apiFetcher2.patch(
                        `/api/service-groups/${selectedServiceGroup?.groupId}/driving-fees`, value?.inspection_module,
                    );
                    toast.success(t('Services.ToastUpSuccess'));
                    handleClose(true)
                } catch (error) {
                 console.log('error : ',error)
                 toast.error(t('Services.ToastErrUpdateSrvGrp'));
                }
            }

            patchApiData()
        },
    });

    const getDistanceValidationError = (index) => {
        const charges = formik.values.inspection_module?.distance_charges || [];
        if (charges.length === 0) return null;

        const current = charges[index]?.distance_upto ?? 0;
        const prev = charges[index - 1]?.distance_upto;
        const next = charges[index + 1]?.distance_upto;

        if (index > 0 && current <= prev) {
            return (
                t('Setting.DistanceMustBeGreaterThanPrevious') || 'Distance must be greater than the previous distance'
            );
        }

        if (index < charges.length - 1 && current >= next) {
            return t('Setting.DistanceMustBeLessThanNext') || 'Distance must be less than the next distance';
        }

        return null;
    };

    const handleReset = () => {
        formik.setValues(initialValues);
    };

    useEffect(() => {
        if (!serviceGroup) return;

        const formatted = {
            inspection_module: {
                distance_charges: serviceGroup.distance_charges ?? [{ distance_upto: 0, amount: 0 }],
            },
        };

        setInitialValues(formatted);
    }, [serviceGroup]);

    return (
        <Grid2 size={{ xs: 12, md: 8 }}>
            <Typography sx={{ my: 2, mt: 4, fontWeight: 700, fontSize: 18 }}>
                {t('Services.DistanceChargesText')} {selectedServiceGroup?.title}
            </Typography>

            <Stack sx={{ gap: 2, p: 2 }}>
                {(formik?.values?.inspection_module?.distance_charges || []).map((charge, index) => (
                    <Stack
                        key={index}
                        sx={{
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 2,
                            alignItems: 'center',
                            border: { xs: '1px solid #E0E0E0', md: 'none' },
                            borderRadius: 3,
                            p: { xs: 2, md: 0 },
                        }}
                    >
                        <Stack sx={{ width: { xs: '100%', md: '45%' } }}>
                            <FPrimaryHeading
                                text={t('Setting.DistanceUpto') || 'Distance Upto'}
                                fontSize={16}
                                sx={{
                                    display: { xs: 'block', md: index === 0 ? 'block' : 'none' },
                                    color: '#bbb0a4',
                                }}
                            />

                            <FTextInput
                                name={`inspection_module.distance_charges.${index}.distance_upto`}
                                value={charge.distance_upto || '0'}
                                onChange={(e) => {
                                    const numeric = e.target.value.replace(/[^0-9]/g, '');
                                    const value = numeric === '' ? null : parseInt(numeric, 10);

                                    const updated = [...formik.values.inspection_module.distance_charges];
                                    updated[index].distance_upto = value;

                                    formik.setFieldValue('inspection_module.distance_charges', updated);
                                }}
                                placeholder="Distance (km)"
                                sx={{
                                    mt: 1,
                                    '& .MuiOutlinedInput-root fieldset': {
                                        borderColor: getDistanceValidationError(index) ? 'error.main' : undefined,
                                    },
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end">{t('Setting.Km')}</InputAdornment>,
                                    },
                                }}
                            />

                            {formik.touched.inspection_module?.distance_charges?.[index]?.distance_upto &&
                                formik.errors.inspection_module?.distance_charges?.[index]?.distance_upto && (
                                    <Typography sx={{ color: 'error.main', fontSize: 12, mt: 0.5 }}>
                                        {formik.errors.inspection_module.distance_charges[index].distance_upto}
                                    </Typography>
                                )}

                            {getDistanceValidationError(index) && (
                                <Typography sx={{ color: 'error.main', fontSize: 12, mt: 0.5 }}>
                                    {getDistanceValidationError(index)}
                                </Typography>
                            )}
                        </Stack>

                        <Stack sx={{ width: { xs: '100%', md: '45%' } }}>
                            <FPrimaryHeading
                                text={t('Setting.Charges') || '0'}
                                fontSize={16}
                                sx={{
                                    display: { xs: 'block', md: index === 0 ? 'block' : 'none' },
                                    color: '#bbb0a4',
                                }}
                            />

                            <FTextInput
                                name={`inspection_module.distance_charges.${index}.amount`}
                                value={charge.amount}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    value = value.replace(/[^0-9.]/g, '');
                                    const numericValue = value === '' ? '' : Number(value);

                                    const updated = [...formik.values.inspection_module.distance_charges];
                                    updated[index].amount = numericValue;

                                    formik.setFieldValue('inspection_module.distance_charges', updated);
                                }}
                                onBlur={() => {
                                    const updated = [...formik.values.inspection_module.distance_charges];

                                    if (!updated[index].amount) updated[index].amount = 0;
                                    formik.setFieldValue('inspection_module.distance_charges', updated);
                                }}
                                placeholder="Amount"
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">{t('POS.Currency')}</InputAdornment>
                                        ),
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*',
                                    },
                                }}
                            />

                            {formik.touched.inspection_module?.distance_charges?.[index]?.amount &&
                                formik.errors.inspection_module?.distance_charges?.[index]?.amount && (
                                    <Typography sx={{ color: 'error.main', fontSize: 12, mt: 0.5 }}>
                                        {formik.errors.inspection_module.distance_charges[index].amount}
                                    </Typography>
                                )}
                        </Stack>

                        {formik.values.inspection_module.distance_charges.length > 1 && (
                            <IconButton
                                onClick={() => {
                                    const updated = formik.values.inspection_module.distance_charges.filter(
                                        (_, i) => i !== index,
                                    );

                                    formik.setFieldValue('inspection_module.distance_charges', updated);
                                }}
                                TouchRippleProps={false}
                                focusRipple={false}
                                disableRipple={true}
                            >
                                <img src={DeleteIcon} alt="Delete" style={{ width: 20, marginTop: '20px' }} />
                            </IconButton>
                        )}
                    </Stack>
                ))}

                <FButton
                    variant="f_outline"
                    title={`+ ${t('Setting.AddCharges')}`}
                    onClick={() => {
                        const list = formik.values.inspection_module.distance_charges;
                        const last = list[list.length - 1];

                        const newCharge = {
                            distance_upto: last.distance_upto + 10,
                            amount: 0,
                        };

                        formik.setFieldValue('inspection_module.distance_charges', [...list, newCharge]);
                    }}
                    disabled={formik.values.inspection_module.distance_charges.length >= 10}
                    sx={{
                        width: { xs: '100%', md: 'fit-content' },
                        mt: 1,
                        borderRadius: 4,
                    }}
                />

                <Stack direction="row" justifyContent="center" gap={2}>
                    <FButton
                        onClick={() => formik.handleSubmit()}
                        title={'Save'}
                        sx={{ background: '#44b904', color: '#fff' }}
                    />

                    <FButton onClick={handleReset} title={'Reset'} sx={{ background: '#d9d9d9', color: '#fff' }} />
                </Stack>
            </Stack>
        </Grid2>
    );
};

export default GroupServiceDrivingFees;
