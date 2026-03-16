import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import CustomTextField from '../../settings/commonTextinput';
import CommonButton from '../../settings/commonButton';

import { t } from 'i18next';
import { apiMangerBooking } from './utils/api';
import { toast } from 'react-toastify';
import { CountryList } from '../../../data/CountryList';
import FPhonePicker from '../../commonComponents/F_PhonePicker';

export default function CreateCustomerForm({ open, closeForm, setCustomer, props }) {
    const [phoneLength, setPhoneLength] = useState({ minLength: 8, maxLength: 8 });

    const initialValues = {
        customerName: '',
        phoneNumber: '',
        email: '',
        country_code: '+45',
        country_iso_code: 'DK',
    };

    const validationSchema = Yup.object().shape({
        customerName: Yup.string().required(t('Customer.CustomerNameError')),

        phoneNumber: Yup.string()
            .required(t('Customer.PhoneNumberError'))
            .matches(
                new RegExp(`^\\d{${phoneLength?.minLength},${phoneLength?.maxLength}}$`),
                `${t('Customer.InvalidPhone')}`,
            )
            .typeError(t('Customer.PhoneNumberTypeError')),

        email: Yup.string()
            .nullable()
            .test('is-valid-email', t('Customer.EmailError'), (value) => {
                if (value && value.trim() !== '') {
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    return emailRegex.test(value);
                }
                return true;
            }),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            let payload = {
                name: values.customerName,
                phone_number: values.phoneNumber,
                email: values.email,
                country_code: values.country_code,
                country_iso_code: values.country_iso_code,
            };
            apiMangerBooking.createCustomer(payload, closeForm, toast, t, setCustomer);
        },
    });

    useEffect(() => {
        if (isNaN(parseInt(props))) {
            formik.setFieldValue('customerName', props);
        } else {
            formik.setFieldValue('phoneNumber', props);
        }
    }, [props]);

    useEffect(() => {
        const phone1Len = CountryList[formik.values.country_iso_code || 'DK'];

        if (phone1Len?.minLength && phone1Len?.maxLength) {
            setPhoneLength({ minLength: phone1Len.minLength, maxLength: phone1Len.maxLength });
        } else {
            setPhoneLength({ minLength: phone1Len.phoneLength, maxLength: phone1Len.phoneLength });
        }
        // setPhoneLength({ minLength: phone1Len.minLength, maxLength: phone1Len.maxLength });
    }, [formik.values]);

    return (
        <Dialog
            PaperProps={{ sx: { borderRadius: '25px' } }}
            keepMounted
            fullWidth
            maxWidth="sm"
            open={open}
            disableAutoFocus
        >
            <DialogTitle>
                <Typography variant="h5" sx={{ color: '#1f1f1f', fontWeight: 700, px: 3 }}>
                    {t('Calendar.CreateCus')}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pl: 6, pr: 6, pt: 0, pb: 0, mt: 0, mb: 0 }}>
                <Typography variant="body1">{t('Common.Name')}</Typography>

                <CustomTextField
                    value={formik.values.customerName}
                    onChange={(e) => formik.setFieldValue('customerName', e.target.value)}
                    placeholder={t('Customer.CustomerName')}
                    id={'customerName'}
                    name={'customerName'}
                    mt={1}
                    borderRadius={'15px'}
                />
                {formik.touched.customerName && formik.errors.customerName && (
                    <Typography variant="caption" color="red">
                        {formik.errors.customerName}
                    </Typography>
                )}

                <Typography variant="body1" sx={{ mt: 2 }}>
                    {t('Common.Phone')}
                </Typography>

                {/* <CustomTextField
                    value={formik.values.phoneNumber ? formatPhoneNumber(formik.values.phoneNumber) : ''}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // This ensures only numbers are allowed
                        formik.setFieldValue('phoneNumber', value);
                    }}
                    inputProps={{ maxLength: 11 }}
                    placeholder={t('Calendar.PhoneNumber')}
                    id={'phoneNumber'}
                    name={'phoneNumber'}
                    mt={1}
                    borderRadius={'15px'}
                /> */}

                <FPhonePicker
                    value={{
                        phone: formik.values.phoneNumber,
                        country_code: formik.values.country_code,
                        country_iso_code: formik.values.country_iso_code,
                    }}
                    onBlur={() => formik.setFieldTouched('phoneNumber', true)}
                    onChange={(e) => formik.setFieldValue('phoneNumber', e)}
                    onCountryChange={(value) => {
                        formik.setFieldValue('country_code', value.country_code);
                        formik.setFieldValue('country_iso_code', value.country_iso_code);
                    }}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                    <Typography variant="caption" color="red">
                        {formik.errors.phoneNumber}
                    </Typography>
                )}

                <Typography variant="body1" sx={{ mt: 2 }}>
                    {t('Setting.Email') + ` (${t('Common.Optional')})`}
                </Typography>

                <CustomTextField
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    placeholder={t('Setting.Email')}
                    id={'email'}
                    name={'email'}
                    mt={1}
                    borderRadius={'15px'}
                />
                {formik.touched.email && formik.errors.email && (
                    <Typography variant="caption" color="red">
                        {formik.errors.email}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', mb: 2, mt: 2, ml: 3, mr: 3, gap: 2 }}>
                <CommonButton
                    height={40}
                    title={t('Setting.Cancel')}
                    backgroundColor={'#D9D9D9'}
                    style={{ minWidth: 50 }}
                    onClick={closeForm}
                />

                <CommonButton
                    type="submit"
                    height={40}
                    title={t('Calendar.CreateCus')}
                    backgroundColor={'#44B904'}
                    style={{ minWidth: 50 }}
                    onClick={formik.handleSubmit}
                />
            </DialogActions>
        </Dialog>
    );
}
