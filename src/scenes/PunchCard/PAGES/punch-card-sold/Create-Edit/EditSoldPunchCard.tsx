import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import { AppBar, CircularProgress, Grid2, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import * as Yup from 'yup';
import React, { useEffect, useState } from 'react';
import POSButton from '@/components/POS/Common/POSButton';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { serviceArray, SoldPunchCardFormikValues } from '../../punch-card/Types/punch-card-api.types';
import {
    GetApiBundleOffersSoldIdType200Item,
    PatchApiBundleOffersIdStatusBodyStatus,
    PatchApiSoldBundleOffersIdBody,
} from '@/shared/api/models';
import POSDatePicker from '@/components/POS/Common/POSDatePicker';
import moment from 'moment';
import POSSelect from '@/components/POS/Common/POSSelect';
import { api } from '@/utils/Api/POS';
import { useQueryClient } from '@tanstack/react-query';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';

export default function EditSoldPunchCard() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAllowed } = Permission();

    const soldOfferData: GetApiBundleOffersSoldIdType200Item = location?.state?.soldPunchCard;

    const [initialValues, setInitialValues] = useState<SoldPunchCardFormikValues>({
        name: '',
        expiryDate: moment(),
        bundleOfferType: 'PUNCH_BASED',
        status: 'UNUSED',
        orignalPunches: 1,
        residuePunches: 1,
        applicableService: {
            services: {},
            residuePunch: 1,
            originalPunch: 1,
        },
    });

    useEffect(() => {
        if (soldOfferData) {
            const bundleType = soldOfferData?.bundleOfferType || 'PUNCH_BASED';

            const services = soldOfferData?.applicableServices?.services;
            const formattedServices: Record<string, any> =
                typeof services === 'object' && services !== null
                    ? Object.fromEntries(
                          Object.entries(services).map(([key, service]: [string, any]) => {
                              if (bundleType === 'PUNCH_BASED') {
                                  return [key, { name: service.name }];
                              } else {
                                  return [
                                      key,
                                      {
                                          ...service,
                                          original: service.original?.toString() ?? '0',
                                          residue: service.residue?.toString() ?? '0',
                                      },
                                  ];
                              }
                          }),
                      )
                    : {};

            const newValues: SoldPunchCardFormikValues = {
                name: soldOfferData?.bundleOffer?.name || '',
                orignalPunches: soldOfferData?.orignalPunches || 1,
                residuePunches: soldOfferData?.residuePunches || 1,
                expiryDate: moment(soldOfferData?.expiryDate) || '',
                bundleOfferType: soldOfferData?.bundleOfferType || 'PUNCH_BASED',
                status: soldOfferData?.status as PatchApiBundleOffersIdStatusBodyStatus,
                applicableService: {
                    services: formattedServices,
                    residuePunch: Number(soldOfferData?.applicableServices?.residuePunch) || 1,
                    originalPunch: Number(soldOfferData?.applicableServices?.originalPunch) || 1,
                },
            };
            setInitialValues(newValues);
        }
    }, [soldOfferData]);

    const punchCardValidationSchema = Yup.object({
        name: Yup.string().required('Required'),
        applicableService: Yup.object({
            services: Yup.mixed()
                .nullable()
                .test('validate-all-services', 'Invalid services', function (services) {
                    const { path, createError } = this;
                    const errors: Yup.ValidationError[] = [];

                    if (this.parent?.bundleOfferType === 'SERVICE_BASED') {
                        const entries = services ? Object.entries(services) : [];

                        entries.forEach(([key, value]) => {
                            const service = value as serviceArray;

                            // name required
                            if (!service.name) {
                                errors.push(createError({ path: `${path}.${key}.name`, message: 'Required' }));
                            }

                            // original must be >= 1
                            const originalNum = Number(service.original);
                            if (!Number.isFinite(originalNum) || originalNum < 1) {
                                errors.push(
                                    createError({
                                        path: `${path}.${key}.original`,
                                        message: t('PunchCard.MustBeGreaterThanZero'),
                                    }),
                                );
                            }

                            // residue must be >= 1
                            const residueNum = Number(service.residue);
                            if (!Number.isFinite(residueNum) || residueNum < 1) {
                                errors.push(
                                    createError({
                                        path: `${path}.${key}.residue`,
                                        message: t('PunchCard.MustBeGreaterThanZero'),
                                    }),
                                );
                            }

                            // NEW RULE: residue ≤ original
                            if (
                                Number.isFinite(residueNum) &&
                                Number.isFinite(originalNum) &&
                                residueNum > originalNum
                            ) {
                                errors.push(
                                    createError({
                                        path: `${path}.${key}.residue`,
                                        message: t('PunchCard.ResidueCannotExceedOriginal'),
                                    }),
                                );
                            }
                        });
                    }

                    return errors.length ? new Yup.ValidationError(errors) : true;
                }),

            residuePunch: Yup.number()
                .min(0, t('PunchCard.MustBeGreaterThanZero'))
                .test('residue-lte-original', t('PunchCard.ResidueCannotExceedOriginal'), function (value) {
                    const { originalPunch } = this.parent;
                    return value === undefined || Number(value) <= Number(originalPunch);
                }),

            originalPunch: Yup.number().min(0, t('PunchCard.MustBeGreaterThanZero')),
        }),

        residuePunches: Yup.number()
            .min(0, t('PunchCard.MustBeGreaterThanZero'))
            .test('residue-lte-original', t('PunchCard.ResidueCannotExceedOriginal'), function (value) {
                const { orignalPunches } = this.parent;
                return value === undefined || Number(value) <= Number(orignalPunches);
            }),

        orignalPunches: Yup.number().min(0, t('PunchCard.MustBeGreaterThanZero')).required(t('PunchCard.Required')),
    });

    const formik = useFormik({
        initialValues,
        validationSchema: punchCardValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const payload: PatchApiSoldBundleOffersIdBody = {
                services: {
                    ...values.applicableService,

                    originalPunch:
                        values?.bundleOfferType === 'SERVICE_BASED'
                            ? Object.values(values.applicableService.services).reduce(
                                  (acc, service) => acc + Number(service.original || 0),
                                  0,
                              )
                            : values.applicableService.originalPunch,

                    residuePunch:
                        values?.bundleOfferType === 'SERVICE_BASED'
                            ? Object.values(values.applicableService.services).reduce(
                                  (acc, service) => acc + Number(service.residue || 0),
                                  0,
                              )
                            : values.applicableService.residuePunch,

                    // ✅ preserve keys instead of array
                    services: Object.fromEntries(
                        Object.entries(values.applicableService.services).map(([key, service]) => [
                            key,
                            {
                                ...service,
                                original: Number(service.original),
                                residue: Number(service.residue),
                            },
                        ]),
                    ),
                },
                expiryDate: values.expiryDate.format('YYYY-MM-DD'),
                orignalPunches:
                    values?.bundleOfferType === 'SERVICE_BASED'
                        ? Object.values(values?.applicableService?.services).reduce(
                              (acc, service) => acc + Number(service.original || 0),
                              0,
                          )
                        : values.orignalPunches,
                residuePunches:
                    values?.bundleOfferType === 'SERVICE_BASED'
                        ? Object.values(values?.applicableService?.services).reduce(
                              (acc, service) => acc + Number(service.residue || 0),
                              0,
                          )
                        : values.residuePunches,
                status: values.status,
            };

            if (soldOfferData?.id) {
                await handleSubmit({ id: soldOfferData.id, payload });
            }
        },
    });

    const handleSubmit = async ({ id, payload }: { id: string; payload: PatchApiSoldBundleOffersIdBody }) => {
        try {
            const response = await api.patchApiSoldBundleOffersId(id, payload);
            if (response) {
                toast.success(t('PunchCard.PunchCardUpdatedSuccessfully'));
                queryClient.invalidateQueries({ queryKey: ['soldPunchCardList'] });
                setTimeout(() => {
                    navigate(`/punch-card/sold`);
                }, 1000);
            }
        } catch (error) {
            toast.error(t('PunchCard.FailedToUpdatePunchCard'));
        }
    };

    if (!isAllowed('PunchCard', 'update')) {
        return <PermissionDenied />;
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

            <POSHeading sx={{ mt: formik.dirty ? 5 : 0 }} text={t('PunchCard.EditSoldPunchCard')} />
            <Grid2 spacing={2} container sx={{ p: 2, bgcolor: ' #fff', borderRadius: 3 }}>
                <Grid2 sx={{ mt: 2 }} size={{ xs: 12, md: 12 }}>
                    <POSHeading text={formik.values.name} />
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ mt: 2 }}>
                        <POSHeading fontSize={16} text={t('GiftCard.ExpiryDate')} />

                        <POSDatePicker
                            value={formik.values.expiryDate}
                            onChange={(date) => formik.setFieldValue('expiryDate', date)}
                            // onBlur={() => formik.setFieldTouched('expiryDate')}
                        />
                    </Stack>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ mt: 2 }}>
                        <POSHeading fontSize={16} text={t('Common.Status')} />

                        <POSSelect
                            options={[
                                { label: t('PunchCard.Blocked'), value: 'BLOCKED' },
                                { label: t('PunchCard.Expired'), value: 'EXPIRED' },
                                { label: t('PunchCard.Used'), value: 'USED' },
                                { label: t('PunchCard.Unused'), value: 'UNUSED' },
                                { label: t('PunchCard.PartiallyUsed'), value: 'PARTIALLY_USED' },
                            ]}
                            value={formik.values.status}
                            onChange={(e) => formik.setFieldValue('status', e.target.value)}
                        />
                    </Stack>
                </Grid2>

                {formik.values.bundleOfferType === 'PUNCH_BASED' && (
                    <React.Fragment>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <POSHeading fontSize={16} text={t('PunchCard.MaximumPunch')} />
                            <POSInput
                                placeholder={t('PunchCard.MaximumPunch')}
                                value={formik.values.orignalPunches}
                                onChange={(e) => {
                                    const numbers = e.target.value.replace(/\D/g, '');
                                    formik.setFieldValue('orignalPunches', numbers);
                                }}
                            />
                            {formik.touched.orignalPunches && formik.errors.orignalPunches && (
                                <Typography variant="caption" color="error">
                                    {formik.errors.orignalPunches}
                                </Typography>
                            )}
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <POSHeading fontSize={16} text={t('PunchCard.RemainingPunch')} />
                            <POSInput
                                placeholder={t('PunchCard.RemainingPunch')}
                                value={formik.values.residuePunches}
                                onChange={(e) => {
                                    const numbers = e.target.value.replace(/\D/g, '');
                                    formik.setFieldValue('residuePunches', numbers);
                                }}
                            />
                            {formik.touched.residuePunches && formik.errors.residuePunches && (
                                <Typography variant="caption" color="error">
                                    {formik.errors.residuePunches}
                                </Typography>
                            )}
                        </Grid2>
                    </React.Fragment>
                )}

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
                                        <POSHeading
                                            sx={{ fontSize: 12, color: '#6f6f6fff' }}
                                            text={t('Common.Service')}
                                        />
                                        <POSHeading text={serviceData.name} />
                                    </Grid2>

                                    {formik.values.bundleOfferType === 'SERVICE_BASED' && (
                                        <React.Fragment>
                                            <Grid2 size={{ xs: 12, md: 3 }}>
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
                                            <Grid2 size={{ xs: 12, md: 3 }}>
                                                <POSHeading
                                                    sx={{ fontSize: 12 }}
                                                    text={t('PunchCard.RemainingPunch')}
                                                />
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
                                                    formik.errors?.applicableService?.services?.[serviceId]
                                                        ?.residue && (
                                                        <Typography variant="caption" color="error">
                                                            {
                                                                formik.errors?.applicableService?.services?.[serviceId]
                                                                    ?.residue
                                                            }
                                                        </Typography>
                                                    )}
                                            </Grid2>
                                        </React.Fragment>
                                    )}
                                </Grid2>
                            );
                        })}
                </Grid2>
            </Grid2>
        </Stack>
    );
}
