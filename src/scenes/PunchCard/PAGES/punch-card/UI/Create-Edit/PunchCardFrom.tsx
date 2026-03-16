import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import { AppBar, CircularProgress, Grid2, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import * as Yup from 'yup';
import React, { useEffect, useState } from 'react';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import { PunchCardFormikValues, serviceArray, serviceType } from '../../Types/punch-card-api.types';
import { formatPrice } from '@/scenes/POS/Core/pos.utils';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSButton from '@/components/POS/Common/POSButton';
import { POSFormSkeleton } from '@/scenes/POS/UI/Product-Page/UI/Shared/ProductFormSkeleton';
import { punchCardHandler } from '../../Core/punch-card.handler';
import { PostApiBundleOffersBody } from '@/shared/api/models';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PunchCardApi } from '../../Core/punch-card.api';
import { useGetServiceList } from '@/hooks/api/punchCard';
import POSSwitch from '@/components/POS/Common/POSSwitch';
const DeleteIcon = require('@/assets/Delete.svg').default;

export default function PunchCardFrom() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const pathname = window.location.pathname;
    const id = pathname.split('/').pop();
    const isCreate = !id || id === 'create';
    const [loadingPunchCard, setLoadingPunchCard] = useState(false);
    const [serviceList, setServiceList] = useState<serviceType[]>([]);

    const defaultValue = {
        0: { name: t('PunchCard.AnyService'), original: '1', residue: '1' },
    };

    const { data: serviceData, isLoading: loadingServices } = useGetServiceList();

    const [initialValues, setInitialValues] = useState<PunchCardFormikValues>({
        name: '',
        description: '',
        expiryMonths: 1,
        bundleOfferType: 'SERVICE_BASED',
        price: '1',
        applicableService: {
            services: defaultValue,
            residuePunch: '1',
            originalPunch: '1',
        },
        sellOnline: false,
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        if (type === 'success') {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    const punchCardApi = new PunchCardApi(showToast, navigate, queryClient);

    // get punchcard by id
    useEffect(() => {
        if (!isCreate && id) {
            punchCardApi.GetPunchCardById(id, setInitialValues, setLoadingPunchCard);
        }
    }, [id, isCreate]);

    const punchCardValidationSchema = Yup.object({
        name: Yup.string().required('Required'),
        description: Yup.string().nullable(),
        bundleOfferType: Yup.string()
            .oneOf(['PUNCH_BASED', 'SERVICE_BASED'], 'Invalid Offer Type')
            .required('Required'),
        price: Yup.string()
            .matches(/^\d+(\.\d{1,2})?$/, 'Invalid price')
            .required('Required'),

        applicableService: Yup.object({
            services: Yup.mixed()
                .nullable()
                .test('validate-all-services', 'Invalid services', function (services) {
                    const { path, createError } = this;
                    const errors: Yup.ValidationError[] = [];
                    if (formik?.values?.bundleOfferType === 'SERVICE_BASED') {
                        const entries = services ? Object.entries(services) : [];

                        entries.forEach(([key, value], idx) => {
                            const service = value as serviceArray;
                            if (!service.name) {
                                errors.push(createError({ path: `${path}.${key}.name`, message: 'Required' }));
                            }

                            const originalNum = Number(service.original);
                            if (!Number.isFinite(originalNum) || originalNum < 1) {
                                errors.push(
                                    createError({
                                        path: `${path}.${key}.original`,
                                        message: t('PunchCard.MustBeGreaterThanZero'),
                                    }),
                                );
                            }

                            // const residueNum = Number(service.residue);
                            // if (!Number.isFinite(residueNum) || residueNum < 1) {
                            //     errors.push(
                            //         createError({
                            //             path: `${path}.${key}.residue`,
                            //             message: t('PunchCard.MustBeGreaterThanZero'),
                            //         }),
                            //     );
                            // }
                        });
                    }
                    return errors.length ? new Yup.ValidationError(errors) : true;
                }),

            residuePunch: Yup.string().test('is-number-min-1', 'Must be greater than or equal to 1', (value) => {
                // skip validation for service-based and any selected services
                // if (
                //     formik?.values?.bundleOfferType === 'SERVICE_BASED' &&
                //     Object.values(formik.values.applicableService.services['0']).length !== 0
                // ) {
                //     return true;
                // }

                if (value === undefined || value === null || value === '') return false;
                const num = Number(value);
                return !isNaN(num) && num >= 1;
            }),
            originalPunch: Yup.string().test('is-number-min-1', 'Must be greater than or equal to 1', (value) => {
                // skip validation for service-based and any selected services
                // if (
                //     formik?.values?.bundleOfferType === 'SERVICE_BASED' &&
                //     Object.values(formik.values.applicableService.services['0']).length !== 0
                // ) {
                //     return true;
                // }

                if (value === undefined || value === null || value === '') return false;
                const num = Number(value);
                return !isNaN(num) && num >= 1;
            }),
        }),
    });

    const formik = useFormik({
        initialValues,
        validationSchema: punchCardValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const payload = await punchCardHandler.buildPayload(values);

            if (isCreate) {
                await punchCardApi.CreatePunchCard({ payload } as {
                    payload: PostApiBundleOffersBody;
                });
            } else {
                await punchCardApi.UpdatePunchCard({ id, payload } as {
                    id: string;
                    payload: PostApiBundleOffersBody;
                });
            }
        },
    });

    // console.log('formik:', formik);
    // console.log('initial values', JSON.stringify(formik.initialValues));
    // console.log('values', JSON.stringify(formik.values));
    // console.log('errors', JSON.stringify(formik.errors));

    useEffect(() => {
        if (serviceData && serviceData.length) {
            const anyOption = {
                id: '0',
                name: t('PunchCard.AnyService'),
            };
            const formattedServices = [
                anyOption,
                ...serviceData.map((service: serviceType) => ({
                    id: service.id?.toString() || '',
                    name: service.name,
                })),
            ];
            setServiceList(formattedServices);
            if (formik?.initialValues?.bundleOfferType === 'SERVICE_BASED' && isCreate) {
                setInitialValues({
                    ...initialValues,
                    applicableService: {
                        services: {
                            [serviceData[0].id]: { name: serviceData[0].name, original: '1', residue: '1' },
                        },
                        residuePunch: '1',
                        originalPunch: '1',
                    },
                });
            }
        }
        // punchCardApi.GetServicesList({ setServiceList, setLoadingServices });
    }, [serviceData, setServiceList]);

    if (loadingServices || loadingPunchCard) {
        return <POSFormSkeleton />;
    }

    return (
        <Stack sx={{ p: { md: 1 } }}>
            {formik.dirty && (
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
                        title={
                            <React.Fragment>
                                {formik?.isSubmitting ? (
                                    <Stack sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}>
                                        <CircularProgress size={20} sx={{ color: '#fff' }} /> {t('POS.Processing')}
                                    </Stack>
                                ) : (
                                    t('Setting.SaveChanges')
                                )}
                            </React.Fragment>
                        }
                        disabled={formik.isSubmitting}
                    />
                </AppBar>
            )}

            <POSHeading
                sx={{ mt: formik.dirty ? 5 : 0 }}
                text={isCreate ? t('PunchCard.CreatePunchCard') : t('PunchCard.EditPunchCard')}
            />
            <Grid2 spacing={2} container sx={{ p: 2, bgcolor: ' #fff', borderRadius: 3 }}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ mt: 2 }}>
                        <POSHeading fontSize={16} text={t('Common.Name')} />
                        <POSInput
                            placeholder={t('Common.Name')}
                            value={formik.values.name}
                            name="name"
                            onBlur={() => formik.setFieldTouched('name')}
                            onChange={formik.handleChange}
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
                                let formatValue = e.target.value;

                                // If the current value is "0" and the user is typing something new, replace it
                                if (formik.values.price === '0' && formatValue !== '') {
                                    formatValue = formatValue.replace(/^0+/, ''); // remove leading zeros
                                }

                                formik.setFieldValue('price', formatPrice(formatValue) || '0');
                            }}
                        />
                        {formik.touched.price && formik.errors.price && (
                            <Typography variant="caption" color="error">
                                {formik.errors.price}
                            </Typography>
                        )}
                    </Stack>

                    <Stack sx={{ mt: 2 }}>
                        <POSHeading fontSize={16} text={t('PunchCard.OfferType')} />
                        <POSSelect
                            borderRadius={2}
                            options={[
                                { value: 'SERVICE_BASED', label: t('PunchCard.ServiceBasedOffer') },
                                { value: 'PUNCH_BASED', label: t('PunchCard.PunchBasedOffer') },
                            ]}
                            value={formik.values.bundleOfferType}
                            onBlur={() => formik.setFieldTouched('bundleOfferType')}
                            onChange={(e) => {
                                formik.setFieldValue('bundleOfferType', e.target.value);
                                if (e.target.value === 'PUNCH_BASED') {
                                    formik.setFieldValue('applicableService.services', defaultValue);
                                } else {
                                    serviceData &&
                                        formik.setFieldValue('applicableService', {
                                            services: {
                                                [serviceData[0].id]: {
                                                    name: serviceData[0].name,
                                                    original: '1',
                                                    residue: '1',
                                                },
                                            },
                                            residuePunch: '1',
                                            originalPunch: '1',
                                        });
                                }
                            }}
                        />
                        {formik.touched.bundleOfferType && formik.errors.bundleOfferType && (
                            <Typography variant="caption" color="error">
                                {formik.errors.bundleOfferType}
                            </Typography>
                        )}
                    </Stack>

                    <Stack sx={{ mt: 2 }}>
                        <POSSwitch
                            checked={formik.values.sellOnline}
                            onChange={() => formik.setFieldValue('sellOnline', !formik.values.sellOnline)}
                            label={<POSHeading fontSize={16} text={t('PunchCard.SellOnline')} />}
                        />
                    </Stack>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ mt: 2 }}>
                        <POSHeading fontSize={16} text={t('PunchCard.ExpiryMonths')} />
                        <POSSelect
                            borderRadius={2}
                            options={Array.from({ length: 48 }, (_, index) => ({
                                value: index + 1,
                                label: index + 1,
                            }))}
                            value={formik.values.expiryMonths}
                            onBlur={() => formik.setFieldTouched('expiryMonths')}
                            onChange={(e) => {
                                formik.setFieldValue('expiryMonths', e.target.value);
                            }}
                        />
                    </Stack>

                    {formik.values.bundleOfferType === 'PUNCH_BASED' && (
                        <>
                            <Stack sx={{ mt: 2 }}>
                                <POSHeading fontSize={16} text={t('PunchCard.MaximumPunch')} />
                                <POSInput
                                    placeholder={t('PunchCard.MaximumPunch')}
                                    value={formik.values.applicableService.originalPunch}
                                    name="originalPunch"
                                    onBlur={() => formik.setFieldTouched('applicableService.originalPunch')}
                                    onChange={(e) => {
                                        let formatValue = e.target.value.replace(/[^0-9]/g, '');
                                        if (
                                            formik.values.applicableService.originalPunch === '0' &&
                                            formatValue !== ''
                                        ) {
                                            formatValue = formatValue.replace(/^0+/, '');
                                        }
                                        formik.setFieldValue('applicableService.originalPunch', formatValue || '0');
                                        if (isCreate) {
                                            formik.setFieldValue('applicableService.residuePunch', formatValue || '0');
                                        }
                                    }}
                                />
                                {formik.touched?.applicableService?.originalPunch &&
                                    formik.errors?.applicableService?.originalPunch && (
                                        <Typography variant="caption" color="error">
                                            {formik.errors?.applicableService?.originalPunch}
                                        </Typography>
                                    )}
                            </Stack>

                            {/* <Stack sx={{ mt: 2 }}>
                                <POSHeading fontSize={16} text={t('PunchCard.RemainingPunch')} />
                                <POSInput
                                    placeholder={t('PunchCard.RemainingPunch')}
                                    value={formik.values.applicableService.residuePunch}
                                    name="residuePunch"
                                    onBlur={() => formik.setFieldTouched('applicableService.residuePunch')}
                                    onChange={(e) => {
                                        let formatValue = e.target.value.replace(/[^0-9]/g, '');
                                        if (
                                            formik.values.applicableService.residuePunch === '0' &&
                                            formatValue !== ''
                                        ) {
                                            formatValue = formatValue.replace(/^0+/, '');
                                        }
                                        formik.setFieldValue('applicableService.residuePunch', formatValue || '0');
                                    }}
                                />
                                {formik.touched?.applicableService?.residuePunch &&
                                    formik.errors?.applicableService?.residuePunch && (
                                        <Typography variant="caption" color="error">
                                            {formik.errors?.applicableService?.residuePunch}
                                        </Typography>
                                    )}
                            </Stack> */}
                        </>
                    )}

                    <Stack sx={{ mt: 2 }}>
                        <POSHeading fontSize={16} text={t('Setting.Description')} />
                        <POSTextArea
                            placeholder={t('Setting.Description')}
                            value={formik.values.description}
                            name="description"
                            onBlur={() => formik.setFieldTouched('description')}
                            onChange={formik.handleChange}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <Typography variant="caption" color="error">
                                {formik.errors.description}
                            </Typography>
                        )}
                    </Stack>
                </Grid2>

                <Grid2
                    size={12}
                    sx={{
                        mt: 2,
                        overflow: 'hidden',
                        maxHeight: '35dvh',
                        scrollbarWidth: 'none',
                        overflowY: 'scroll',
                        gap: 1,
                        border: { xs: '1px solid #e3e3e36c', md: 'none' },
                        p: { xs: 1, md: 0 },
                        borderRadius: 3,
                    }}
                >
                    {/* Render existing services */}
                    {formik.values.applicableService.services &&
                        Object.entries(formik.values.applicableService.services).map(([serviceId, serviceData]) => {
                            const selectedIds = Object.keys(formik.values.applicableService.services);
                            const filteredOptions = serviceList
                                .filter((s) => {
                                    // Exclude "Any Service" for SERVICE_BASED
                                    if (formik.values.bundleOfferType === 'SERVICE_BASED' && String(s.id) === '0') {
                                        return false;
                                    }

                                    // Keep selected or not already chosen
                                    return String(s.id) === String(serviceId) || !selectedIds.includes(String(s.id));
                                })
                                .map((s) => ({
                                    value: s.id,
                                    label: s.name,
                                }));

                            return (
                                <Grid2
                                    container
                                    key={serviceId}
                                    spacing={2}
                                    sx={{ bgcolor: '#e3e3e36c', p: 2, borderRadius: 3, mt: 1 }}
                                >
                                    <Grid2
                                        size={{
                                            xs: formik?.values?.bundleOfferType === 'PUNCH_BASED' ? 10 : 12,
                                            md: 6,
                                        }}
                                    >
                                        <POSHeading sx={{ fontSize: 12 }} text={t('Common.Service')} />
                                        <POSSelect
                                            borderRadius={2}
                                            options={filteredOptions}
                                            sx={{ bgcolor: '#fff', width: { xs: '100%', md: '100%' } }}
                                            value={serviceId}
                                            onChange={(e) => {
                                                const newId = e.target.value;

                                                if (String(newId) === '0') {
                                                    formik.setFieldValue('applicableService.services', defaultValue);
                                                } else {
                                                    const updatedServices = {
                                                        ...formik.values.applicableService.services,
                                                    };

                                                    // Find the selected service label
                                                    const selectedService = serviceList.find(
                                                        (s) => String(s.id) === String(newId),
                                                    );
                                                    const newLabel = selectedService?.name || '';

                                                    // Copy the old service object, but replace the name
                                                    updatedServices[newId as string] = {
                                                        ...updatedServices[serviceId],
                                                        name: newLabel,
                                                    };

                                                    // Remove the old key
                                                    delete updatedServices[serviceId];

                                                    formik.setFieldValue('applicableService.services', updatedServices);
                                                }
                                            }}
                                            placeholderText={t('Services.SelectService')}
                                        />
                                    </Grid2>

                                    {formik.values.bundleOfferType === 'SERVICE_BASED' && (
                                        <React.Fragment>
                                            <Grid2 size={{ xs: 12, md: 2.5 }}>
                                                <POSHeading sx={{ fontSize: 12 }} text={t('PunchCard.MaximumPunch')} />
                                                <POSInput
                                                    placeholder={t('PunchCard.Punch')}
                                                    value={serviceData.original || 0}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                        formik.setFieldValue(
                                                            `applicableService.services.${serviceId}.original`,
                                                            value ? Number(value) : 0,
                                                        );

                                                        if (isCreate) {
                                                            formik.setFieldValue(
                                                                `applicableService.services.${serviceId}.residue`,
                                                                value ? Number(value) : 0,
                                                            );
                                                        }
                                                    }}
                                                />
                                                {formik.touched?.applicableService?.services?.[serviceId]?.original &&
                                                    formik.errors?.applicableService?.services?.[serviceId]
                                                        ?.original && (
                                                        <Typography variant="caption" color="error">
                                                            {
                                                                formik.errors?.applicableService?.services?.[serviceId]
                                                                    ?.original
                                                            }
                                                        </Typography>
                                                    )}
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, md: 2.5 }}>
                                                {/* <POSHeading sx={{ fontSize: 12 }} text={t('PunchCard.RemainingPunch')} />
                                            <POSInput
                                                placeholder={t('PunchCard.Punch')}
                                                value={serviceData.residue || 0}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    formik.setFieldValue(
                                                        `applicableService.services.${serviceId}.residue`,
                                                        value ? Number(value) : 0,
                                                    );
                                                }}
                                            />
                                            {formik.touched?.applicableService?.services?.[serviceId]?.residue &&
                                                formik.errors?.applicableService?.services?.[serviceId]?.residue && (
                                                    <Typography variant="caption" color="error">
                                                        {
                                                            formik.errors?.applicableService?.services?.[serviceId]
                                                                ?.residue
                                                        }
                                                    </Typography>
                                                )} */}
                                            </Grid2>
                                        </React.Fragment>
                                    )}

                                    <Grid2
                                        size={{
                                            xs: formik?.values?.bundleOfferType === 'PUNCH_BASED' ? 2 : 12,
                                            md: formik?.values?.bundleOfferType === 'PUNCH_BASED' ? 6 : 1,
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: { xs: 'center', md: 'flex-end' },
                                        }}
                                    >
                                        {serviceId !== '0' && (
                                            <img
                                                src={DeleteIcon}
                                                alt="delete"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    const updated = { ...formik.values.applicableService.services };
                                                    delete updated[serviceId];

                                                    if (
                                                        formik.values?.bundleOfferType === 'SERVICE_BASED' &&
                                                        Object.keys(updated).length === 0
                                                    ) {
                                                        formik.setFieldValue('applicableService.services', {
                                                            [`${serviceList[1].id}`]: {
                                                                name: serviceList[1].name,
                                                                original: '1',
                                                                residue: '1',
                                                            },
                                                        });
                                                        return;
                                                    }
                                                    formik.setFieldValue(
                                                        'applicableService.services',
                                                        Object.keys(updated)?.length ? updated : defaultValue,
                                                    );
                                                }}
                                            />
                                        )}
                                    </Grid2>
                                </Grid2>
                            );
                        })}
                </Grid2>

                {/* Add Service Button */}
                {!formik.values.applicableService.services?.['0'] && (
                    <POSButton
                        sx={{
                            border: '1px dashed #d3d3d3',
                            borderRadius: 2,
                            color: '#787878ff',
                        }}
                        width={'100%'}
                        title={`+ ${t('Services.AddService')}`}
                        onClick={() => {
                            const newServices = formik.values.applicableService.services
                                ? { ...formik.values.applicableService.services }
                                : {};

                            let filterdServices: serviceType[] = [];
                            if (
                                formik?.values?.applicableService?.services &&
                                Object.keys(formik?.values?.applicableService?.services).length > 0
                            ) {
                                filterdServices = serviceList.filter((service) => service?.id !== '0');
                            } else {
                                filterdServices = serviceList;
                            }

                            const available = filterdServices.find((s) => !newServices[s.id]);
                            if (!available) return;

                            newServices[available.id] = {
                                name: available.name,
                                original: '1',
                                residue: '1',
                            };

                            formik.setFieldValue('applicableService.services', newServices);
                        }}
                        variant="f_outline"
                    />
                )}
            </Grid2>
        </Stack>
    );
}
