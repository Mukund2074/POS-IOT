import { Box, Button, Stack, Typography } from '@mui/material';

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import callImg from '../../../assets/call.jpg';
import userImg from '../../../assets/User.png';
import lockImg from '../../../assets/lock.png';

import uploadImg from '../../../assets/Group.png';

import { Loader2Icon } from 'lucide-react';
import { useSelector } from 'react-redux';
import RadixButton from '../../radix/RadixButton';
import RadixInput from '../../radix/RadixInput';
import RadixDialog from '../../radix/RadixDialog';
import RadixPhoneField from '../../radix/RadixPhoneField';

export default function EmployeeModel({ open, onClose, data, setData, handleRemove }) {
    moment.locale('en');
    const [imgSource, setImgSource] = useState(null);

    const user = useSelector((state) => state.user.data);

    useEffect(() => {
        if (open) {
            setImgSource(null);
            if (data) {
                setInitialValues({
                    ...data,
                    country_code: data?.country_code ?? '+91',
                });
            }
        }
    }, [open, data]);

    const validationSchema = Yup.object({
        name: Yup.string().required('Please enter name').typeError('Please enter valid name'),

        access_code: Yup.string()
            .required('Please enter access code')
            .min(6, 'Must be exactly 6 digits')
            .max(6, 'Must be exactly 6 digits')
            .typeError('Please enter valid access code'),

        phone_number: Yup.string()
            .nullable()
            .min(10, 'Must be exactly 10 digits')
            .max(10, 'Must be exactly 10 digits')
            .typeError('Please enter valid mobile number'),
    });

    const [initialValues, setInitialValues] = useState(() => ({
        id: null,
        name: '',
        country_code: '+91',
        phone_number: '',
        access_code: '',
        journal_access: false,
        image: '',
    }));

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            setData(values);
            onClose();

            // handleSubmit(values);
        },
    });

    const handleAccessCodeChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        formik.setFieldValue('access_code', value);
    };

    return (
        <RadixDialog
            title={formik.values?.id ? 'Edit Employee' : 'Add Employee'}
            disableAutoFocus
            onOpenChange={onClose}
            open={open}
            onClose={onClose}
            children={
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
                                    Employee Name
                                </Typography>
                            </Stack>

                            <RadixInput
                                id="name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                placeholder="Employee Name"
                                onBlur={() => formik.setFieldTouched('name', true)}
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
                                    Mobile Number (optional)
                                </Typography>
                            </Stack>

                            <RadixPhoneField
                                id="phone_number"
                                name="phone_number"
                                value={formik.values.phone_number}
                                onChange={(value) => formik.setFieldValue('phone_number', value.phone)}
                                placeholder="Mobile Number"
                                onBlur={() => formik.setFieldTouched('phone_number', true)}
                                onCountryChange={(code) => {
                                    formik.setFieldValue('country_code', code);
                                }}
                                disabled={false}
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
                                    Passcode (6-digits)
                                </Typography>
                            </Stack>

                            <RadixInput
                                id="access_code"
                                value={formik.values.access_code}
                                onChange={handleAccessCodeChange}
                                placeholder="XXXXXX"
                                inputProps={{ maxLength: 6, pattern: '[0-9]{6}', inputMode: 'numeric' }}
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
                                    Employee Image (optional)
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
                                        reader.onloadend = function (e) {
                                            setImgSource([reader.result]);
                                        };
                                    }}
                                    id="file-upload"
                                    sx={{ display: 'none' }}
                                    hidden
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
                                        {formik.values.image ? formik.values.image?.name : 'Upload Employee Image'}
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
                                    Upload
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
                                    Remove
                                </Button>
                            </div>
                        </Stack>
                    </Box>
                </Box>
            }
            footer={
                <React.Fragment>
                    {formik.values.id ? (
                        <>
                            {user?.id !== data?.id && data?.role != 'ADMIN' && (
                                <RadixButton variant="danger" onClick={handleRemove}>
                                    Delete
                                </RadixButton>
                            )}
                            <RadixButton variant="primary" onClick={formik.handleSubmit}>
                                Save Changes
                            </RadixButton>
                        </>
                    ) : (
                        <RadixButton variant="primary" onClick={formik.handleSubmit}>
                            Add Employee
                        </RadixButton>
                    )}
                </React.Fragment>
            }
        />
    );
}
