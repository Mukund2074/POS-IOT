import { Alert, Box, CircularProgress, IconButton, Modal, Paper, Stack, Tooltip, Typography } from '@mui/material';
import FTextInput from '../commonComponents/F_TextInput';
import FPrimaryHeading from '../commonComponents/F_PrimaryHeading';
import { t } from 'i18next';
import { useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import FTextArea from '../commonComponents/F_TextArea';
import FSwitch from '../commonComponents/f-switch';
import FButton from '../commonComponents/F_Button';
import { Close } from '@mui/icons-material';
import { formatPriceInput } from '../../utils/format-amout';
import InfoIcon from '../../assets/Info.svg';

const NoShowPopups = ({
    open,
    closeForm = () => {},
    data,
    BillingAmount,
    noShowSettings,
    updateBillingAmount,
    onFormSubmit = () => {},
}) => {
    const [initialValues, setInitialValues] = useState({
        addManualCharge: false,
        fees: null,
        note: '',
        email: false,
        sms: false,
    });

    const validationSchema = Yup.object({
        fees: Yup.string().nullable(),
        note: Yup.string().nullable(),
        email: Yup.string().required('Email is required'),
        sms: Yup.string().required('SMS is required'),
    });

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: async (value) => {
            await onFormSubmit({
                noShowAmount: value?.fees || BillingAmount,
                noShowNote: value?.note,
                sendEmail: value?.email,
                sendSms: value?.sms,
            });
        },
    });

    return (
        <Modal
            keepMounted
            disableAutoFocus
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
            onClose={closeForm}
            open={noShowSettings?.enable && open}
        >
            <Paper
                sx={{
                    position: 'relative',
                    px: { xs: 1.5, md: 5 },
                    py: { xs: 2, md: 3 },
                    minWidth: { xs: '95%', md: '60%' },
                    borderRadius: { xs: 5, md: 7 },
                    overflow: 'hidden',
                    maxWidth: { xs: '95%', md: '80%' },
                    maxHeight: '90%',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                }}
            >
                <IconButton
                    aria-label="close"
                    disableRipple
                    sx={{ position: 'absolute', right: 8, top: 8, color: '#6f6f6f' }}
                    onClick={closeForm}
                >
                    <Close />
                </IconButton>
                <FPrimaryHeading text={t('Calendar.NoShowFee')} />

                {!data?.booking?.outlet_customer?.phone_number && !data?.booking?.outlet_customer?.email && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'pre-line' }}>
                            {t('Calendar.NoCustomerInfo')}
                        </Typography>
                    </Alert>
                )}

                <Stack sx={{ mt: 2 }}>
                    <Typography sx={{ fontWeight: 600, my: 1, fontSize: 18 }}>
                        {t('Common.Service')} : {data?.booking?.booking_details?.service_name}
                    </Typography>

                    <FSwitch
                        label={
                            <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                {t('Calendar.AddManualCharges')}
                                <Tooltip
                                    title={`${t('Calendar.NoShowInfoPart1')} ${BillingAmount} ${t('Calendar.NoShowInfoPart2')}`}
                                >
                                    <span>{<img src={InfoIcon} alt="info" />}</span>
                                </Tooltip>
                            </Stack>
                        }
                        onChange={() => {
                            formik?.setFieldValue('addManualCharge', !formik?.values.addManualCharge);
                        }}
                        name={'sms'}
                        checked={formik.values.addManualCharge}
                    />
                    {formik.values.addManualCharge && (
                        <Stack>
                            <FPrimaryHeading text={t('Calendar.ManualCharges')} sx={{ fontSize: 16 }} />
                            <FTextInput
                                sx={{ mt: 0 }}
                                value={formik.values.fees}
                                error={Boolean(formik.touched.fees && formik.errors.fees)}
                                onChange={(e) => {
                                    updateBillingAmount({ BillingAmount: formatPriceInput(e.target.value) });
                                    formik.setFieldValue('fees', formatPriceInput(e.target.value));
                                }}
                                name={'fees'}
                                placeholder={t('Calendar.ManualCharges')}
                            />
                            <Typography sx={{ color: 'red' }}>{formik.touched.fees && formik.errors.fees}</Typography>
                        </Stack>
                    )}
                    <Stack sx={{ mt: 2 }}>
                        <FPrimaryHeading text={t('Common.Note')} sx={{ fontSize: 16 }} />
                        <FTextArea
                            sx={{ mt: 0 }}
                            placeholder={t('Setting.Description')}
                            value={formik.values.note}
                            onChange={(e) => {
                                formik.setFieldValue('note', e.target.value);
                            }}
                            name={'note'}
                        />
                    </Stack>
                    <Stack sx={{ mt: 2 }}>
                        {data?.booking?.outlet_customer?.email && (
                            <FSwitch
                                label={t('Calendar.EmailText')}
                                sx={{ display: 'block' }}
                                onChange={formik.handleChange}
                                name={'email'}
                            />
                        )}

                        {data?.booking?.outlet_customer?.phone_number && (
                            <FSwitch
                                label={t('Calendar.SmsText')}
                                onChange={formik.handleChange}
                                name={'sms'}
                                checked={formik.values.sms}
                            />
                        )}
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FButton
                            title={t('Setting.Cancel')}
                            onClick={closeForm}
                            sx={{ color: '#fff', background: '#D9D9D9', mt: 2 }}
                        />
                        <FButton
                            variant={'save'}
                            title={
                                formik?.isSubmitting ? (
                                    <Stack sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row' }}>
                                        {t('POS.Processing')}
                                        <CircularProgress color="inherit" size={20} />
                                    </Stack>
                                ) : (
                                    t('POS.Proceed')
                                )
                            }
                            titleColor={'white'}
                            disabled={(!formik.values.email && !formik.values.sms) || formik.isSubmitting}
                            sx={{
                                background: !formik.values.email && !formik.values.sms ? '#D9D9D9' : '#44b904',
                                mt: 2,
                            }}
                            onClick={formik.handleSubmit}
                        />
                    </Box>
                </Stack>
            </Paper>
        </Modal>
    );
};

export default NoShowPopups;
