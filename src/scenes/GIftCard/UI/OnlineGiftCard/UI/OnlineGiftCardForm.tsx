import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import { PostApiGiftCardsOnline201Description } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { AppBar, CircularProgress, Grid2, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

interface FormattedData {
    name: string | undefined;
    expiryMonth: number;
    description: PostApiGiftCardsOnline201Description;
    price: number;
    activeOnlineSale: boolean | undefined;
}

export default function OnlineGiftCardsForm() {
    const [initialValues, setInitialValue] = useState<FormattedData>({
        name: '',
        expiryMonth: 1,
        description: '',
        price: 0,
        activeOnlineSale: true,
    });
    const [showAppBar, setShowAppBar] = useState(false);
    const navigate = useNavigate();
    const params = useParams();
    const [isLoading, setLoading] = useState(false);

    const validationSchema = Yup.object({
        name: Yup.string().required(t('GiftCard.OnlineGiftCardNameRequired')),
        expiryMonth: Yup.string().required(t('GiftCard.ExpiryMonthRequired')),
        description: Yup.string().nullable(),
        price: Yup.number().min(1, t('PunchCard.MustBeGreaterThanZero')).required(t('Services.YupErrPriceRequired')),
        activeOnlineSale: Yup.boolean(),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            setShowAppBar(false);
            resetForm({ values });
            handleSubmitForm();
        },
    });

    const fetchData = async () => {
        if (params?.id !== 'create') {
            try {
                setLoading(true);
                if (params?.id) {
                    const response = await api.getApiGiftCardOnlineId(params?.id);
                    const formattedData: FormattedData = {
                        name: response?.name,
                        expiryMonth: Number(response?.expiryDays) / 30,
                        description: response?.description as PostApiGiftCardsOnline201Description,
                        price: response?.price || 0,
                        activeOnlineSale: response?.sellOnline,
                    };
                    formik.setValues(formattedData);
                    setInitialValue(formattedData);
                }
            } catch (error) {
                console.error('Error : ', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmitForm = async () => {
        console.log(formik?.values)
        try {
            const payload = {
                name: formik.values.name ?? '',
                price: Number(formik.values.price) || 0,
                sellOnline: Boolean(formik.values.activeOnlineSale),
                description: formik.values.description || '',
                expiryDays: Number(formik.values.expiryMonth) * 30,
            };

            if (params?.id === 'create') {
                await api.postApiGiftCardsOnline(payload);
            } else {
                if (params?.id) {
                    await api.putApiGiftCardsOnlineId(params.id, payload);
                }
            }

            toast.success(
                `${t('GiftCard.OnlineGiftCard')} ${params?.id === 'create' ? t('Common.Created') : t('Customer.Updated')} ${t('GiftCard.Successfully')}`,
            );
            navigate('/gift-card/online');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleChangeWithDirtyCheck = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        formik.handleChange(event);
        if (!showAppBar) setShowAppBar(true);
    };

    useEffect(() => {
        if (!initialValues) return;

        const normalize = (vals: FormattedData) => ({
            ...vals,
            price: Number(vals?.price ?? 0),
            expiryMonth: Number(vals?.expiryMonth ?? 0),
        });

        const a = normalize(initialValues);
        const b = normalize(formik.values);

        const equal = JSON.stringify(a) === JSON.stringify(b);
        setShowAppBar(!equal);
    }, [initialValues, formik.values]);

    return (
        <Stack spacing={3}>
            {showAppBar && formik.dirty && (
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
                        title={params?.id === 'create' ? t('GiftCard.Create') : t('Setting.SaveChanges')}
                        disabled={formik.isSubmitting}
                    />
                </AppBar>
            )}

            <POSHeading
                text={t(params?.id === 'create' ? 'GiftCard.CreateOnlineGiftCard' : 'GiftCard.EditOnlineGiftCard')}
                sx={{ pt: showAppBar ? 5 : 0 }}
            />

            {isLoading ? (
                <Stack sx={{ display: 'flex', justifyContent: 'center' }} gap={2} alignItems="center">
                    <CircularProgress size={40} color="inherit" />
                </Stack>
            ) : (
                <Grid2 spacing={2} container sx={{ p: 2, bgcolor: '#fff', borderRadius: 3 }}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Stack sx={{ mt: 2 }}>
                            <POSHeading fontSize={16} text={t('GiftCard.OnlineGiftCardName')} />
                            <POSInput
                                placeholder={t('GiftCard.OnlineGiftCardName')}
                                value={formik.values.name as string}
                                name="name"
                                onBlur={() => formik.setFieldTouched('name')}
                                onChange={handleChangeWithDirtyCheck}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <Typography variant="caption" color="error">
                                    {formik.errors.name}
                                </Typography>
                            )}
                        </Stack>

                        <Stack sx={{ mt: 2 }}>
                            <POSHeading fontSize={16} text={t('Common.Price')} />
                            <POSInput
                                placeholder={t('Common.Price')}
                                value={formik.values.price}
                                name="price"
                                onBlur={() => formik.setFieldTouched('price')}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const sanitized = raw.replace(/[^0-9.]/g, '');
                                    const parts = sanitized.split('.');
                                    const normalized =
                                        parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('') : parts[0];
                                    const valueToSet = normalized === '' ? '' : Number(normalized);
                                    formik.setFieldValue('price', valueToSet);
                                    if (!showAppBar) setShowAppBar(true);
                                }}
                            />
                            {formik.touched.price && formik.errors.price && (
                                <Typography variant="caption" color="error">
                                    {formik.errors.price}
                                </Typography>
                            )}
                        </Stack>

                        <Stack sx={{ mt: 2 }}>
                            <POSSwitch
                                checked={formik.values.activeOnlineSale as boolean}
                                onChange={() => {
                                    formik.setFieldValue('activeOnlineSale', !formik.values.activeOnlineSale);
                                    if (!showAppBar) setShowAppBar(true);
                                }}
                                label={<POSHeading fontSize={16} text={t('GiftCard.ActiveOnlineSale')} />}
                            />
                        </Stack>
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Stack sx={{ mt: 2 }}>
                            <POSHeading fontSize={16} text={t('PunchCard.ExpiryMonths')} />
                            <POSSelect
                                borderRadius={2}
                                onBlur={() => formik.setFieldTouched('expiryMonth')}
                                value={formik.values.expiryMonth}
                                options={Array.from({ length: 12 }, (_, i) => ({
                                    label: `${i + 1} months`,
                                    value: i + 1,
                                }))}
                                onChange={(e) => {
                                    formik.setFieldValue('expiryMonth', e.target.value);
                                    if (!showAppBar) setShowAppBar(true);
                                }}
                                showPlaceHolder={false}
                            />
                        </Stack>

                        <Stack sx={{ mt: 2 }}>
                            <POSHeading fontSize={16} text={t('Setting.Description')} />
                            <POSTextArea
                                placeholder={t('Setting.Description')}
                                value={formik.values.description as string}
                                name="description"
                                onBlur={() => formik.setFieldTouched('description')}
                                onChange={handleChangeWithDirtyCheck}
                            />
                            {formik.touched.description && formik.errors.description && (
                                <Typography variant="caption" color="error">
                                    {formik.errors.description}
                                </Typography>
                            )}
                        </Stack>
                    </Grid2>
                </Grid2>
            )}
        </Stack>
    );
}
