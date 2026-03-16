import { Box, IconButton, Modal, Paper, Stack, Typography } from '@mui/material';
import PrimaryHeading from '../../settings/commonPrimaryHeading';
import { Close } from '@mui/icons-material';
import { t } from 'i18next';
import FTextInput from '../../commonComponents/F_TextInput';
import moment from 'moment';
import FSelect from '../../commonComponents/F_Select';
import FButton from '../../commonComponents/F_Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { api } from '../../../utils/Api/POS';
import { toast } from 'react-toastify';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    bgcolor: '#FFFFFF',
    borderRadius: 3,
    boxShadow: 0,
    p: 4,
};

const SubscriptionEditModal = ({
    openEditModel = false,
    setOpenEditModel = () => {},
    selectedService = null,
    fetchServiceSubscription = () => {},
}) => {
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState({
        usedCredit: 0,
        totalCredit: 0,
        subscriptionStatus: 'ACTIVE',
    });
    const validationSchema = Yup.object({
        usedCredit: Yup.number()
            .typeError(t('Calendar.UsedCreditTypeError'))
            .required(t('Calendar.UsedCreditRequired'))
            .min(0, t('Calendar.UsedCreditMinLength'))
            .test('usedCredit-less-than-totalCredit', t('Calendar.UsedCreditTest'), function (value) {
                const { totalCredit } = this.parent;
                if (value === undefined || totalCredit === undefined) return true;
                return value <= totalCredit;
            }),

        totalCredit: Yup.number()
            .typeError(t('Calendar.TotalCreditTypeError'))
            .required(t('Calendar.TotalCreditRequired'))
            .min(0, t('Calendar.TotalCreditMinLength')),

        subscriptionStatus: Yup.string(),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: () => {
            handleEditAPI(selectedService?.subscription?.id);
        },
    });

    const handleEditAPI = async (uuid) => {
        try {
            setLoading(true);
            await api.putApiServiceSubscriptionId(uuid, {
                subscriptionCredit: formik?.values?.totalCredit,
                subscriptionCreditUsed: formik?.values?.usedCredit,
                subscriptionStatus: formik?.values?.subscriptionStatus,
            });

            setOpenEditModel(false);
            toast.success(t('Calendar.SubscriptionUpdateSuccess'));
            fetchServiceSubscription();
        } catch (error) {
            console.error('Error : ', error);
            toast.error(t('Calendar.FailedSubscriptionUpdate'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedService && selectedService?.subscription) {
            console.log(selectedService);
            setInitialValues({
                subscriptionStatus: selectedService?.subscription?.subscriptionStatus,
                totalCredit: selectedService?.subscription?.subscriptionCredit,
                usedCredit: selectedService?.subscription?.subscriptionCreditUsed,
            });
        }
    }, [selectedService]);
    return (
        <Modal
            disableAutoFocus
            open={openEditModel}
            onClose={false}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Paper
                sx={[
                    style,
                    {
                        zIndex: 12,
                        overflowY: { xs: 'auto', sm: '85vh' },
                        overflowX: 'hidden',
                        maxHeight: { xs: '90vh', sm: '85vh' },
                        position: 'relative',
                        width: '30%',
                        borderRadius: '25px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    },
                ]}
            >
                <PrimaryHeading text={t('Customer.SaveChanges')} />
                <IconButton
                    sx={{ position: 'absolute', top: 15, right: 8 }}
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                    onClick={() => setOpenEditModel(false)}
                >
                    <Close />
                </IconButton>
                <Stack spacing={3} marginTop={2}>
                    <Box>
                        <Typography>{t('Calendar.ServiceName')}</Typography>
                        <FTextInput value={selectedService?.subscription?.serviceName} disabled={true} sx={{ m: 0 }} />
                    </Box>
                    <Box>
                        <Typography>{t('Calendar.SubscriptionStartDate')}</Typography>
                        <FTextInput
                            value={moment(selectedService?.subscription?.subscriptionStartDate).format(
                                'DD/MM/YYYY HH:mm',
                            )}
                            disabled={true}
                            sx={{ m: 0 }}
                        />
                    </Box>
                    <Box>
                        <Typography>{t('Calendar.SubscriptionUsed')}</Typography>
                        <FTextInput
                            name="usedCredit"
                            value={formik.values.usedCredit}
                            onChange={(e) => {
                                const val = e.target.value;

                                if (/^\d*$/.test(val)) {
                                    formik.setFieldValue('usedCredit', val);
                                }
                            }}
                            sx={{ m: 0 }}
                        />
                        {formik.errors.usedCredit && formik.touched.usedCredit && (
                            <Typography color="error" fontSize="12px">
                                {formik.errors.usedCredit}
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography>{t('Calendar.SubscriptionCount')}</Typography>
                        <FTextInput
                            name="totalCredit"
                            value={formik.values.totalCredit}
                            onChange={(e) => {
                                const val = e.target.value;

                                if (/^\d*$/.test(val)) {
                                    formik.setFieldValue('totalCredit', val);
                                }
                            }}
                            sx={{ m: 0 }}
                        />
                        {formik.errors.totalCredit && formik.touched.totalCredit && (
                            <Typography color="error" fontSize="12px">
                                {formik.errors.totalCredit}
                            </Typography>
                        )}
                    </Box>
                    <Box>
                        <Typography>{t('Calendar.SubscriptionStatus')}</Typography>

                        <FSelect
                            name="subscriptionStatus"
                            options={[
                                { label: t('Calendar.StatusActive'), value: 'ACTIVE' },
                                { label: t('Calendar.StatusCancelled'), value: 'CANCELLED' },
                                { label: t('Calendar.StatusCompleted'), value: 'COMPLETED' },
                            ]}
                            value={formik.values.subscriptionStatus}
                            onChange={(e) => formik.setFieldValue('subscriptionStatus', e.target.value)}
                            sx={{ width: '100%' }}
                        />
                    </Box>
                </Stack>

                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 2,
                        mt: 4,
                    }}
                >
                    <FButton
                        sx={{ width: '150px', backgroundColor: '#D9D9D9' }}
                        titleColor={'#fff'}
                        onClick={() => setOpenEditModel(false)}
                        title={t('Customer.SaveChangeCan')}
                    />

                    <FButton
                        sx={{ width: '150px', backgroundColor: '#44B904' }}
                        titleColor={'#fff'}
                        onClick={formik.handleSubmit}
                        title={t('Customer.SaveChangeConf')}
                        loading={loading}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
};

export default SubscriptionEditModal;
