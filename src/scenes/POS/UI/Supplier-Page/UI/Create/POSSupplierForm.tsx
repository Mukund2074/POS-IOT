import { Divider, Grid2, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import { FormikTouched, useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CountryList, CountryListSchema } from '@/data/CountrylistTyped';
import { PostApiSupplierBody, PutApiSupplierId200, PutApiSupplierIdBody } from '@/shared/api/models';
import POSHeading from '@/components/POS/Common/POSHeading';
import { POSFormSkeleton } from '@/scenes/POS/UI/Product-Page/UI/Shared/ProductFormSkeleton';
import POSButton from '@/components/POS/Common/POSButton';
import POSInput from '@/components/POS/Common/POSInput';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import POSPhoneField from '@/components/POS/Common/POSPhoneField';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import { supplierApi } from '@/scenes/POS/UI/Supplier-Page/Core/supplier.api.';
import Permission from '@/utils/POS/Permission';
import { useQueryClient } from '@tanstack/react-query';

export default function POSSupplierForm() {
    const { isAllowed } = Permission();
    const [loading, setLoading] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<PutApiSupplierIdBody>({
        name: '',
        address: '',
        email: '',
        description: '',
        zipCode: '',
        city: '',
        country: '',
        cvrNumber: '',
        website: '',
        contactPersonName: '',
        contactPersonEmail: '',
        contactPersonPhone: '',
        countryCode: '+45',
    });
    const [phoneLength, setPhoneLength] = useState<{ minLength: number; maxLength: number }>({
        minLength: 8,
        maxLength: 8,
    });
    const navigate = useNavigate();
    const path = window.location.pathname;
    const id = path.split('/').pop();
    const isCreate = id === 'create';
    const [isReady, setIsReady] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const showToast = (message: string, type: 'success' | 'error') => toast(message, { type });

    useEffect(() => {
        if (id && !isCreate && isAllowed('Supplier', 'update')) {
            supplierApi.GetSupplierById({ id, showToast, navigate, setFormikValues, setLoading });
        } else if (isCreate && !isAllowed('Supplier', 'create')) {
            toast.error(t('POS.PermissionDenied'));
            const timeout = setTimeout(() => {
                navigate('/pos/suppliers');
            }, 2000);
            return () => clearTimeout(timeout);
        } else if (id && !isCreate && !isAllowed('Supplier', 'update')) {
            toast.error(t('POS.PermissionDenied'));
            const timeout = setTimeout(() => {
                navigate('/pos/suppliers');
            }, 2000);
            return () => clearTimeout(timeout);
        }

        setIsReady(true);
    }, []);

    const setFormikValues = (values: PutApiSupplierId200) => {
        setInitialValues({
            name: values.name,
            email: values.email ?? '',
            address: values.address ?? '',
            description: values.description ?? '',
            zipCode: values.zipCode ?? '',
            city: values.city ?? '',
            country: values.country ?? '',
            cvrNumber: values.cvrNumber ?? '',
            website: values.website ?? '',
            contactPersonName: values.contactPersonName ?? '',
            contactPersonEmail: values.contactPersonEmail ?? '',
            contactPersonPhone: values.contactPersonPhone ?? '',
            countryCode: values.countryCode ?? '',
            countryISOCode: values.countryISOCode ?? '',
        });
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required(t('Customer.ADVJournalFieldNameError'))
            .typeError(t('Customer.ADVJournalFieldNameError')),
        contactPersonPhone: Yup.string()
            .nullable()
            .matches(
                new RegExp(`^\\d{${phoneLength?.minLength},${phoneLength?.maxLength}}$`),
                t('Customer.PhoneNumberTypeError'),
            )
            .typeError(t('Customer.PhoneNumberTypeError')),
        contactPersonEmail: Yup.string()
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
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            if (id && !isCreate) {
                await supplierApi.UpdateSupplier({
                    id: id,
                    body: values as PutApiSupplierIdBody,
                    showToast,
                    navigate,
                    queryClient,
                });
            } else {
                await supplierApi.CreateSupplier({
                    body: values as PostApiSupplierBody,
                    showToast,
                    navigate,
                    queryClient,
                });
            }
        },
    });

    const ErrorComponent: React.FC<{ field: keyof typeof formik.initialValues }> = ({ field }) => {
        const touched = formik.touched[field as keyof typeof formik.touched];
        const error = formik.errors[field as keyof typeof formik.errors];

        if (touched && typeof error === 'string') {
            return <Typography style={{ color: 'red' }}>{error}</Typography>;
        }

        return null;
    };

    if (!isReady) {
        return <POSFormSkeleton />;
    }

    return (
        <Stack
            sx={{
                p: { xs: 0, md: 2 },
            }}
        >
            {!loading && (
                <Stack
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 1,
                        width: '100%',
                    }}
                >
                    <POSHeading text={id && !isCreate ? t('POS.EditSupplier') : t('POS.CreateSupplier')} />

                    {formik?.dirty && (
                        <POSButton
                            title={id && !isCreate ? t('Customer.SaveCh') : t('POS.CreateSupplier')}
                            variant="save"
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={() => formik.submitForm()}
                            disabled={formik?.isSubmitting}
                        />
                    )}
                </Stack>
            )}

            <form
                style={{
                    width: '100%',
                    backgroundColor: '#fff',
                    minHeight: '85dvh',
                    borderRadius: '25px',
                    marginTop: 10,
                }}
                onSubmit={formik.handleSubmit}
            >
                {loading ? (
                    <POSFormSkeleton />
                ) : (
                    <React.Fragment>
                        <Grid2 container spacing={{ xs: 0, md: 3 }} sx={{ mt: 2, p: { xs: 2, md: 4 } }}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <POSHeading text={t('POS.Information')} />
                                <POSHeading
                                    text={t('POS.SupplierDesc')}
                                    sx={{ fontSize: 16, color: '#afafaf', fontWeight: 400 }}
                                />
                            </Grid2>

                            <Grid2
                                sx={{
                                    mt: { xs: 2, md: 0 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: { xs: 2, md: 4, xl: 5 },
                                }}
                                size={{ xs: 12, md: 4 }}
                            >
                                <Stack>
                                    <POSHeading text={t('POS.Company')} fontSize={16} />
                                    <POSInput
                                        name="name"
                                        value={formik.values.name ?? ''}
                                        onChange={formik.handleChange}
                                        placeholder={t('POS.Company')}
                                        onBlur={() => formik.setFieldTouched('name', true)}
                                    />
                                    <ErrorComponent field="name" />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('Common.Email')} fontSize={16} />
                                    <POSInput
                                        name="email"
                                        placeholder={t('Common.Email')}
                                        value={formik?.values?.email ?? ''}
                                        onChange={(e) => formik.setFieldValue('email', e.target.value)}
                                        onBlur={() => formik.setFieldTouched('email', true)}
                                    />
                                    <ErrorComponent field="email" />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('Common.Address')} fontSize={16} />
                                    <POSInput
                                        name="address"
                                        placeholder={t('Common.Address')}
                                        value={formik.values.address ?? ''}
                                        onChange={formik.handleChange}
                                        onBlur={() => formik.setFieldTouched('address', true)}
                                    />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('POS.PostcodeCity')} fontSize={16} />
                                    <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                                        <POSInput
                                            name="zipCode"
                                            placeholder={t('Common.ZipCode')}
                                            value={formik.values.zipCode ?? ''}
                                            onChange={(e) => {
                                                const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
                                                formik.setFieldValue('zipCode', onlyNumber);
                                            }}
                                            onBlur={() => formik.setFieldTouched('zipCode', true)}
                                        />

                                        <POSInput
                                            name="city"
                                            placeholder={t('Common.City')}
                                            value={formik.values.city ?? ''}
                                            onChange={formik.handleChange}
                                            onBlur={() => formik.setFieldTouched('city', true)}
                                        />
                                    </Stack>
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('POS.Country')} fontSize={16} />
                                    <POSInput
                                        name="country"
                                        placeholder={t('POS.Country')}
                                        value={formik.values.country ?? ''}
                                        onChange={formik.handleChange}
                                        onBlur={() => formik.setFieldTouched('country', true)}
                                    />
                                </Stack>
                            </Grid2>

                            <Grid2
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: { xs: 2, md: 4, xl: 5 },
                                    mt: { xs: 2, md: 0 },
                                }}
                                size={{ xs: 12, md: 4 }}
                            >
                                <Stack>
                                    <POSHeading text={t('Setting.CVRNumber')} fontSize={16} />
                                    <POSInput
                                        name="cvrNumber"
                                        placeholder={t('Setting.CVRNumber')}
                                        value={formik.values.cvrNumber ?? ''}
                                        onChange={(e) => {
                                            const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
                                            formik.setFieldValue('cvrNumber', onlyNumber);
                                        }}
                                        onBlur={() => formik.setFieldTouched('cvrNumber', true)}
                                    />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('POS.Homepage')} fontSize={16} />
                                    <POSInput
                                        name="website"
                                        value={formik?.values?.website ?? ''}
                                        onChange={(e) => formik.setFieldValue('website', e.target.value)}
                                        onBlur={() => formik.setFieldTouched('website', true)}
                                    />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('Setting.Description')} fontSize={16} />
                                    <POSTextArea
                                        placeholder={t('Setting.Description')}
                                        name="description"
                                        value={formik?.values?.description ?? ''}
                                        onChange={formik.handleChange}
                                        onBlur={() => formik.setFieldTouched('description', true)}
                                    />
                                </Stack>
                            </Grid2>
                        </Grid2>
                        <Divider sx={{ borderWidth: 2, width: '100%', borderColor: '#D2D2D2' }} />
                        <Grid2 container spacing={{ xs: 0, md: 3 }} sx={{ p: { xs: 3, md: 4 } }}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <POSHeading text={t('POS.ContactPerson')} />
                                <POSHeading
                                    text={t('POS.ContactPersDesc')}
                                    sx={{ fontSize: 16, color: '#afafaf', fontWeight: 400 }}
                                />
                            </Grid2>

                            <Grid2
                                sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 4, xl: 5 } }}
                                size={{ xs: 12, md: 4 }}
                            >
                                <Stack>
                                    <POSHeading text={t('Common.Name')} fontSize={16} />
                                    <POSInput
                                        name="contactPersonName"
                                        placeholder={t('Common.Name')}
                                        value={formik.values?.contactPersonName ?? ''}
                                        onChange={formik.handleChange}
                                        onBlur={() => formik.setFieldTouched('contactPersonName', true)}
                                    />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('Common.MobileNumber')} fontSize={16} />
                                    <POSPhoneField
                                        name="contactPersonPhone"
                                        placeholder={t('Common.MobileNumber')}
                                        value={{
                                            country_code: formik?.values?.countryCode ?? '',
                                            phone: formik?.values?.contactPersonPhone ?? '',
                                            countryISOCode: formik?.values?.countryISOCode ?? 'DK',
                                        }}
                                        onChange={(e) => {
                                            formik.setFieldValue('contactPersonPhone', e);
                                        }}
                                        onCountryChange={(value, countryISOCode) => {
                                            const newLength = CountryList[
                                                countryISOCode as keyof typeof CountryList
                                            ] as CountryListSchema;

                                            let minLength, maxLength;

                                            if (newLength?.minLength && newLength?.maxLength) {
                                                minLength = newLength?.minLength;
                                                maxLength = newLength?.maxLength;
                                            } else {
                                                minLength = newLength?.phoneLength ?? 8;
                                                maxLength = newLength?.phoneLength ?? 8;
                                            }
                                            formik.setFieldValue('countryCode', value);
                                            formik.setFieldValue('countryISOCode', countryISOCode);
                                            setPhoneLength({ minLength, maxLength });
                                        }}
                                        onBlur={() => formik.setFieldTouched('contactPersonPhone', true)}
                                    />
                                    <ErrorComponent field="contactPersonPhone" />
                                </Stack>
                            </Grid2>

                            <Grid2
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: { xs: 2, md: 4, xl: 5 },
                                    mt: { xs: 2, md: 0 },
                                }}
                                size={{ xs: 12, md: 4 }}
                            >
                                <Stack>
                                    <POSHeading text={t('Common.Email')} fontSize={16} />
                                    <POSInput
                                        name="contactPersonEmail"
                                        placeholder={t('Common.Email')}
                                        value={formik?.values?.contactPersonEmail ?? ''}
                                        onChange={(e) => formik.setFieldValue('contactPersonEmail', e.target.value)}
                                        onBlur={() => formik.setFieldTouched('contactPersonEmail', true)}
                                    />
                                    <ErrorComponent field="contactPersonEmail" />
                                </Stack>
                            </Grid2>
                        </Grid2>
                    </React.Fragment>
                )}
            </form>

            {id && id !== 'create' && isAllowed('Supplier', 'delete') && (
                <POSButton
                    variant="delete"
                    title={t('POS.RemoveSupplier')}
                    sx={{
                        mt: 2,
                        ml: 'auto',
                    }}
                    width={{ xs: '100%', md: 'auto' }}
                    onClick={() => {
                        setShowDeleteModal(true);
                    }}
                    disabled={formik?.isSubmitting}
                />
            )}

            {showDeleteModal && (
                <POSDeleteModal
                    open={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    onClickDismiss={() => setShowDeleteModal(false)}
                    onClickConfirm={async () => {
                        if (id && id !== 'create') {
                            setShowDeleteModal(false);
                            await supplierApi.DeleteSupplier({ id: id, showToast, navigate, queryClient });
                        }
                    }}
                    title={t('POS.RemoveSupplier')}
                    description={t('POS.RemoveSupplierDesc')}
                />
            )}
        </Stack>
    );
}
