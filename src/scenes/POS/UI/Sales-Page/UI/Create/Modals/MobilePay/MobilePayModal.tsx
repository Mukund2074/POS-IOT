import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSPhoneField from '@/components/POS/Common/POSPhoneField';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import { CountryList, CountryListSchema } from '@/data/CountrylistTyped';
import { GetApiCustomers200CustomersItem, PostApiMobilepayCreateMobilepayOrderBody } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { Close } from '@mui/icons-material';
import { CircularProgress, IconButton, Modal, Paper, Stack } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { CartOverride } from '@/types/CartContext.type';
import { PaymentMethod } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';
import { getPaymentMethods } from '../Payment/utils/payment-methods';
import { toast } from 'react-toastify';

export default function MobilePayModal({
    open,
    onClose,
    amount,
    customer,
    MOOBILE_PAY_LIMIT,
    setMobilepayReference,
    cart,
    socket2IsOn,
    handlePaymentMethodClick,
}: {
    open: boolean;
    onClose: () => void;
    amount: number;
    customer: GetApiCustomers200CustomersItem | null;
    MOOBILE_PAY_LIMIT: number;
    setMobilepayReference: React.Dispatch<React.SetStateAction<string>>;
    cart: CartOverride;
    socket2IsOn: any;
    handlePaymentMethodClick: (method: PaymentMethod, mobileByPass?: boolean, referenceId?: string | null) => void;
}) {
    const [phoneLength, setPhoneLength] = useState<{ minLength: number; maxLength: number }>({
        minLength: 8,
        maxLength: 8,
    });
    const validationSchema = Yup.object({
        contactPersonPhone: Yup.string()
            .nullable()
            .matches(
                new RegExp(`^\\d{${phoneLength?.minLength},${phoneLength?.maxLength}}$`),
                t('Customer.PhoneNumberTypeError'),
            )
            .typeError(t('Customer.PhoneNumberTypeError')),
        amount: Yup.number()
            .min(1, t('POS.AmountRequired'))
            .max(MOOBILE_PAY_LIMIT, t('POS.MobilePayLimit'))
            .required(t('POS.AmountRequired')),
        description: Yup.string(),
    });
    const empID = cart?.sellBy;
    const outletID = useSelector((state: any) => state?.settings?.data?.profile?.id);
    const storeSettings = useSelector((state: any) => state?.settings?.data);
    const formik = useFormik({
        initialValues: {
            countryCode: '+45',
            phoneNumber: '',
            countryISOCode: 'DK',
            amount: amount,
            description: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const reference = `${empID}${outletID}${moment().unix()}`;
            setMobilepayReference(reference);

            const payload = {
                phoneNumber: `${values.countryCode?.split('+')[1]}${values.phoneNumber}`,
                currency: 'DKK',
                amount: values.amount * 100,
                reference: reference,
                description: values.description,
                customerId: Number(customer?.id),
            };
            await handleMobilePay({ payload });
        },
    });
    const paymentMethods = getPaymentMethods(false /* asCreditSale */, false /* asEditSale */, 0, storeSettings as any);
    const mobilePaymentMethod = paymentMethods?.find((method: PaymentMethod) => method.type === 'MOBILE_PAY');

    const handleMobilePay = async ({ payload }: { payload: PostApiMobilepayCreateMobilepayOrderBody }) => {
        try {
            const response = await api.postApiMobilepayCreateMobilepayOrder(payload);
            if (response?.data) {
                if (mobilePaymentMethod) {
                    handlePaymentMethodClick(mobilePaymentMethod, true, payload.reference);
                } else {
                    toast.error(t('POS.MobilePayError'));
                }

                if (socket2IsOn && socket2IsOn.connected) {
                    socket2IsOn.emit('join-room', payload.reference);
                }

                onClose();
            }
        } catch (error) {
            console.error('MobilePay error:', error);
            toast?.error(t('POS.MobilePayError'));
            window.dispatchEvent(new Event('mobilepay-payment-error'));
        }
    };

    useEffect(() => {
        if (customer && customer.countryCode === '+45' && customer.countryISOCode === 'DK') {
            formik.setFieldValue('countryCode', customer.countryCode);
            formik.setFieldValue('phoneNumber', customer.phoneNumber);
            formik.setFieldValue('countryISOCode', customer.countryISOCode);
        }
    }, [customer]);

    return (
        <Modal
            open={open}
            onClose={(event, reason) => {
                if (reason === 'backdropClick') {
                    return;
                }
                onClose();
            }}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: 500,
                    maxHeight: '90vh',
                    minHeight: '25dvh',
                    overflow: 'auto',
                    borderRadius: 4,
                    p: 3,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        cursor: formik?.isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => {
                        if (!formik?.isSubmitting) {
                            onClose();
                        }
                    }}
                >
                    <Close />
                </IconButton>

                <POSHeading text={t('POS.MOBILE_PAY')} />

                <Stack>
                    <POSHeading text={t('Calendar.PhoneNumber')} sx={{ fontSize: 16, fontWeight: 600 }} />
                    <POSPhoneField
                        name="customerPhone"
                        placeholder={t('Calendar.PhoneNumber')}
                        disabledSelect={true}
                        value={{
                            country_code: formik.values.countryCode,
                            phone: formik.values.phoneNumber,
                            countryISOCode: formik.values.countryISOCode,
                        }}
                        onChange={(phoneNumber) => {
                            formik.setFieldValue('phoneNumber', phoneNumber);
                        }}
                        onCountryChange={(value, countryISOCode) => {
                            const newLength = CountryList[
                                countryISOCode as keyof typeof CountryList
                            ] as CountryListSchema;
                            formik.setFieldValue('countryCode', value);
                            formik.setFieldValue('countryISOCode', countryISOCode);

                            let minLength, maxLength;

                            if (newLength?.minLength && newLength?.maxLength) {
                                minLength = newLength?.minLength;
                                maxLength = newLength?.maxLength;
                            } else {
                                minLength = newLength?.phoneLength ?? 8;
                                maxLength = newLength?.phoneLength ?? 8;
                            }

                            setPhoneLength({
                                minLength: minLength ?? 8,
                                maxLength: maxLength ?? 8,
                            });
                        }}
                        onBlur={() => formik.setFieldTouched('contactPersonPhone', true)}
                    />
                </Stack>

                <Stack>
                    <POSHeading text={t('Setting.Description')} sx={{ fontSize: 16, fontWeight: 600 }} />
                    <POSTextArea
                        name="description"
                        value={formik.values.description}
                        placeholder={t('Setting.Description')}
                        onChange={(e) => {
                            formik.setFieldValue('description', e.target.value);
                        }}
                        onBlur={() => formik.setFieldTouched('description', true)}
                    />
                </Stack>

                <POSButton
                    sx={{ mt: 'auto', mx: 'auto' }}
                    disabled={!formik?.values?.amount || !formik?.values?.phoneNumber}
                    width={{ xs: '100%', md: 'fit-content' }}
                    variant="save"
                    title={
                        formik?.isSubmitting ? (
                            <Stack sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}>
                                <CircularProgress size={20} color="inherit" />
                                {t('POS.Processing')}
                            </Stack>
                        ) : (
                            t('POS.Proceed')
                        )
                    }
                    onClick={() => {
                        formik.handleSubmit();
                    }}
                />
            </Paper>
        </Modal>
    );
}
