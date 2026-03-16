import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Modal,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { t } from 'i18next';
import CustomTextField from '../../commonTextinput';
import callImg from '../../../../assets/call.jpg';
import userImg from '../../../../assets/User.png';
import lockImg from '../../../../assets/lock.png';

import uploadImg from '../../../../assets/Group.png';
import CloseIcon from '@mui/icons-material/Close';

import { InputAdornment } from '@mui/material';
import { Loader2Icon } from 'lucide-react';
import FButton from '../../../commonComponents/F_Button';

import { useSelector } from 'react-redux';
import { Close } from '@mui/icons-material';
export default function EmployeeModel({ open, onClose, data, setData, handleRemove }) {
    moment.locale('en');
    const [imgSource, setImgSource] = useState(null);

    const user = useSelector((state) => state.user.data);

    useEffect(() => {
        if (open) {
            setImgSource(null);

            //     getEmployees()
            if (data) {
                formik.setFieldValue('country_code', data?.country_code ?? '+45');
                // if(data?.country_code)
            }

            //     const {event, employee, detailId} = formProps
            //     // setEmpID(employee?.id)
            //     if(formProps.event){

            //     formik.setValues({
            //         id: event?.id ?? null,
            //         detailId: detailId,
            //         employee_id: event?.employee_id,
            //         start_date: event?.start_date ? moment(event?.start_date) : null,
            //         start_time: event?.start_time ? moment(event?.start_time, "HH:mm:ss") : null,
            //         end_date: event?.end_date ? moment(event?.end_date) : null,
            //         end_time: event?.end_time ? moment(event?.end_time, "HH:mm:ss") : null,
            //         repeat: event?.repeat === null ? "DO_NOT_REPEAT" : event?.repeat,
            //         add_break: event?.add_break || false,
            //         start_break_time: event?.start_break_time ? moment(event?.start_break_time, "HH:mm:ss") : null,
            //         end_break_time: event?.end_break_time ? moment(event?.end_break_time, "HH:mm:ss") : null,
            //         quit: event?.end_date === null ? "NEVER_QUIT" : "TIME"
            //     });
            // } else {
            //     formik.setValues({
            //         id: null,
            //         detailId: detailId,
            //         employee_id: employee?.id,
            //         start_date: formProps?.weekday,
            //         start_time: null,
            //         end_date: null,
            //         end_time: null,
            //         repeat: "DO_NOT_REPEAT",
            //         add_break: false,
            //         start_break_time: null,
            //         end_break_time: null,
            //         quit: "NEVER_QUIT"
            //     });
            // }
        }
    }, [open]);

    const validationSchema = Yup.object({
        name: Yup.string().required(t('Setting.PleaseEnterName')).typeError(t('Setting.PleaseEnterValidName')),

        access_code: Yup.string()
            .required(t('Setting.PleaseEnterAccessCode'))
            .min(6, t('Setting.MustBeExactly6Digits'))
            .max(6, t('Setting.MustBeExactly6Digits'))
            .typeError(t('Setting.PleaseEnterValidAccessCode')),

        phone_number: Yup.string()
            .nullable()
            .min(8, t('Setting.MustBeExactly8Digits'))
            .max(8, t('Setting.MustBeExactly8Digits'))
            .typeError(t('Setting.PleaseEnterValidMobileNumber')),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: null,
            name: '',
            country_code: '+45',
            phone_number: '',
            access_code: '',
            journal_access: false,
            image: '',
            role: 'EMPLOYEE',
            remove_image: false,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            setData(values);
            onClose();

            // handleSubmit(values);
        },
    });

    const formatPhoneNumber = (number) => {
        if (number != '') {
            return number.replace(/(\d{2})(?=\d)/g, '$1 ');
        } else {
            return '';
        }
    };

    function BootstrapDialogTitle(props) {
        const { children, onClose, ...other } = props;

        return (
            <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
                {children}
                {onClose ? (
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: '#6f6f6f',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                ) : null}
            </DialogTitle>
        );
    }

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');

        // const value =  e.target.value.replace(/\D/g, "");
        formik.setFieldValue('phone_number', value);
    };

    const handleAccessCodeChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        formik.setFieldValue('access_code', value);
    };

    return (
        <Modal
            disableAutoFocus
            open={open}
            onClose={onClose}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    width: { xs: '90%', md: 'auto' },
                    height: '80%',
                    display: 'flex',
                    borderRadius: 8,
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    py: 4,
                    px: 2,
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                }}
            >
                <IconButton
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                    sx={{ position: 'absolute', right: 8, top: 8, zIndex: 11 }}
                    onClick={onClose}
                >
                    <Close />
                </IconButton>

                <BootstrapDialogTitle
                    id="customized-dialog-title"
                    onClose={() => onClose()}
                    sx={{
                        textAlign: 'center',
                        color: '#1F1F1F',
                        fontWeight: 700,
                        pt: 2,
                        mb: 0,
                    }}
                >
                    {formik.values?.id ? t('Setting.EditEmployee') : t('Setting.AddEmployee')}
                </BootstrapDialogTitle>

                <Box
                    noValidate
                    component="form"
                    sx={{
                        p: 0,
                        mt: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                    }}
                >
                    <Box
                        noValidate
                        component="form"
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            m: 'auto',
                            width: '100%',
                        }}
                    >
                        <Stack flex={1} flexDirection={'column'}>
                            <Stack flex={1} flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                                <img src={userImg} style={{ width: 18, height: 18, marginRight: 2 }} alt="user" />
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Setting.EmployeeName')}
                                </Typography>
                            </Stack>

                            <CustomTextField
                                id="name"
                                name="name"
                                value={formik.values.name}
                                mt={1}
                                onChange={formik.handleChange}
                                placeholder={t('Setting.EmployeeName')}
                                onBlur={() => formik.setFieldTouched('name', true)}
                                sx={{ minWidth: { xs: '100%', md: 600 }, width: '100%' }}
                                // error={formik.touched.name && formik.errors.name}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {/* <Error sx={{ color: "red" }} /> */}
                                    <Typography variant="caption" color="red">
                                        {formik.errors.name}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>

                        <Stack flex={1} flexDirection={'column'} sx={{ mt: 2 }}>
                            <Stack flex={1} flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                                <img src={callImg} style={{ width: 18, height: 18, marginRight: 2 }} alt="Phone" />
                                <Typography variant="body1" sx={{ color: '#6F6F6F' }}>
                                    {t('Setting.MobileNumber(optional)')}
                                </Typography>
                            </Stack>

                            <CustomTextField
                                id="phone_number"
                                value={formik.values.phone_number ? formatPhoneNumber(formik.values.phone_number) : ''}
                                mt={1}
                                // maxLength={8}
                                inputProps={{ maxLength: 11 }}
                                onChange={handlePhoneChange}
                                placeholder={t('Common.MobileNumber')}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Typography sx={{ color: '#1f1f1f' }}>
                                                    {formik.values.country_code}
                                                </Typography>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                onBlur={() => formik.setFieldTouched('phone_number', true)}
                            />
                            {formik.touched.phone_number && formik.errors.phone_number && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {/* <Error sx={{ color: "red" }} /> */}
                                    <Typography variant="caption" color="red">
                                        {formik.errors.phone_number}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>

                        <Stack flex={1} flexDirection={'column'} sx={{ mt: 2 }}>
                            <Stack flex={1} flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                                <img src={lockImg} style={{ width: 18, height: 18, marginRight: 2 }} alt="Phone" />
                                <Typography variant="body1" sx={{ color: '#6F6F6F' }}>
                                    {' '}
                                    {t('Setting.Passcode(6-digits)')}
                                </Typography>
                            </Stack>

                            <CustomTextField
                                id="access_code"
                                value={formik.values.access_code}
                                mt={1}
                                onChange={handleAccessCodeChange}
                                inputProps={{ maxLength: 6, pattern: '[0-9]{6}', inputMode: 'numeric' }}
                                placeholder={'XXXXXX'}
                                sx={{ maxLength: 6 }}
                                onBlur={() => formik.setFieldTouched('access_code', true)}
                            />

                            {formik.touched.access_code && formik.errors.access_code && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {/* <Error sx={{ color: "red" }} /> */}
                                    <Typography variant="caption" color="red">
                                        {formik.errors.access_code}
                                    </Typography>
                                </Box>
                            )}

                            {/* </Stack> */}
                        </Stack>

                        <Stack flex={1} flexDirection={'column'} sx={{ mt: 2 }}>
                            <Stack
                                flex={1}
                                flexDirection={'row'}
                                justifyContent={'flex-start'}
                                alignItems={'center'}
                                sx={{ mb: 1 }}
                            >
                                <Typography variant="body1" sx={{ color: '#6F6F6F' }}>
                                    {' '}
                                    {t('Setting.EmployeeImage(optional)')}
                                </Typography>
                            </Stack>

                            <div className="image-upload-container" style={{ marginTop: 0, mb: 0 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        // setImage(file);
                                        formik.setFieldValue('image', file);
                                        var reader = new FileReader();
                                        var url = reader.readAsDataURL(file);

                                        reader.onloadend = function (e) {
                                            setImgSource([reader.result]);
                                        };
                                    }}
                                    id="file-upload"
                                    className="d-none"
                                />
                                <label htmlFor="file-upload" className="image-upload-label">
                                    <div className="image-upload-icon" style={{ padding: 0, marginBottom: 0 }}>
                                        {formik.values.image ? (
                                            <img
                                                onLoad={() => {
                                                    <Loader2Icon />;
                                                }}
                                                src={
                                                    typeof formik.values.image == 'string'
                                                        ? `${process.env.REACT_APP_IMG_URL}${formik.values.image}`
                                                        : imgSource
                                                }
                                                alt="Upload"
                                                style={{
                                                    height: 80,
                                                    maxHeight: 80,
                                                    objectFit: 'contain',
                                                }}
                                            />
                                        ) : (
                                            <img src={uploadImg} alt="Upload" style={{ width: 38 }} />
                                        )}
                                    </div>

                                    <Typography variant="caption" sx={{ color: '#6F6F6F' }}>
                                        {' '}
                                        {formik.values.image
                                            ? formik.values.image?.name
                                            : t('Setting.UploadEmployeeImage')}
                                    </Typography>
                                </label>

                                <Button
                                    variant="contained"
                                    className="upload-button"
                                    disableTouchRipple
                                    disableElevation={true}
                                    sx={{
                                        borderRadius: '12px',
                                        opacity: '0px',
                                        height: 30,
                                        minWidth: 100,
                                        textTransform: 'capitalize',
                                        color: '#BBB0A4',
                                        fontWeight: 700,
                                        backgroundColor: ' rgba(111, 111, 111, 0.20);',
                                    }}
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    {t('Common.Upload')}
                                </Button>

                                <Button
                                    variant="contained"
                                    className="upload-button"
                                    disableTouchRipple
                                    disableElevation={true}
                                    sx={{
                                        borderRadius: '12px',
                                        opacity: '0px',
                                        height: 30,
                                        minWidth: 100,
                                        textTransform: 'capitalize',
                                        fontWeight: 700,
                                        color: '#BBB0A4',
                                        backgroundColor: ' rgba(111, 111, 111, 0.20)',
                                        ml: 2,
                                    }}
                                    onClick={() => {
                                        formik.setFieldValue('image', null);
                                        formik.setFieldValue('remove_image', true);
                                    }}
                                >
                                    {t('Common.Remove')}
                                </Button>
                            </div>
                        </Stack>
                    </Box>
                </Box>

                <DialogActions
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { md: 'center' },
                        justifyContent: 'center',
                        gap: 2,
                    }}
                >
                    {formik.values.id ? (
                        <>
                            {user?.id !== data?.id && data?.role != 'ADMIN' && (
                                <FButton
                                    variant={'delete'}
                                    height={40}
                                    sx={{ width: { xs: '100%', md: 'auto' } }}
                                    onClick={handleRemove}
                                    title={t('Setting.DeleteEmployee')}
                                    loading={formik.isSubmitting}
                                    disabled={formik.isSubmitting}
                                />
                            )}
                            <FButton
                                type="submit"
                                height={40}
                                title={t('Setting.SaveChanges')}
                                variant={'save'}
                                sx={{ width: { xs: '100%', md: 'auto' } }}
                                onClick={formik.handleSubmit}
                            />
                        </>
                    ) : (
                        <FButton
                            variant={'f_outline'}
                            onClick={formik.handleSubmit}
                            height={40}
                            title={t('Setting.AddEmployee')}
                            sx={{ width: { xs: '100%', md: 'auto' } }}
                        />
                    )}
                </DialogActions>
            </Paper>
        </Modal>
    );
}
