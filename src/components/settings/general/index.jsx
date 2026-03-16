import React, { useEffect, useState } from 'react';
import './index.css';

import Masonry from '@mui/lab/Masonry';
import {
    Box,
    Typography,
    Grid2,
    IconButton,
    Stack,
    Divider,
    TextareaAutosize,
    Button,
    Checkbox,
    InputAdornment,
    Paper,
    Skeleton,
    AppBar,
    CircularProgress,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CustomTextField from '../commonTextinput';
import PrimaryHeading from '../commonPrimaryHeading';
import SecondaryHeading from '../commonSecondaryHeading';
import { Add, Cancel } from '@mui/icons-material';
import { useFormik } from 'formik';
// import { generalSettingsValidate } from "./validations";
import apiFetcher from '../../../utils/interCeptor';
import { toast } from 'react-toastify';
import CommonButton from '../commonButton';
import _ from 'lodash';
import FimageUpload from '../../commonComponents/F_imageUpload';
import { useSelector } from 'react-redux';
import { t } from 'i18next';
import * as Yup from 'yup';
import FTextInput from '../../commonComponents/F_TextInput';
import FTextArea from '../../commonComponents/F_TextArea';
import FSwitch from '../../commonComponents/f-switch';
import { dividerSx } from '../../../scenes/Settings/Index';
import { HttpStatusCode } from 'axios';
import { formatPhoneNumber } from '../../calanderComponents/booking/utils/functions';
import { useData } from '../../../context/DataContext';

const extractCoordinates = (geoLocation) => {
    if (!geoLocation) return { lng: '', lat: '' }; // Default values if geoLocation is missing

    const match = geoLocation.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
    if (match) {
        return {
            lng: parseFloat(match[1]), // Longitude
            lat: parseFloat(match[2]), // Latitude
        };
    }

    return { lng: '', lat: '' }; // Return empty values if format is incorrect
};

const GeneralSettingsOption = () => {
    const user = useSelector((state) => state.user.data);
    const setting = useSelector((state) => state.settings.data);
    const { refreshSettings } = useData();
    const calendarSetting = setting?.profile?.settings?.find((s) => s.settingName === 'OnlineBooking');
    const calendarValue = calendarSetting ? JSON.parse(calendarSetting.value) : {};

    // const [file, setNewFile] = useState([]);
    const [initialValues, setInitialValues] = useState({
        name: '',
        address: '',
        city: '',
        contact_number: '',
        contact_number2: '',
        about: '',
        cvr_number: '',
        lng: '',
        zip_code: '',
        lat: '',
        email: '',
        hide_email: false,
        website: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        profile_image: '',
        banner_image: '',
        images: [],
        gtmId: '',
        autocomplete_booking: false,
        outletEmailCancelNotification: calendarValue?.onlineBooking?.outletEmailCancelNotification,
        merchant_id: '',
        bank_info: {
            bank_account_number: '',
            registration_number: '',
        },
    });
    const [bookingUrl, setBookingUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [isChanges, setIsChanges] = useState(false);

    const fetchData = async ({ needLoad = false }) => {
        try {
            needLoad && setLoading(true);
            const response = await apiFetcher.get('/api/v1/store/setting/profile');
            const getImg = await apiFetcher.get('/api/v1/store/gallery');

            setBookingUrl(response.data.data.web_store_name);

            const data = response.data.data;
            const mainResonse = { ...data, ...getImg.data.data };

            const { lng, lat } = extractCoordinates(data.geo_location);

            setInitialValues((prevValues) => ({
                ...prevValues,
                ...mainResonse,
                lng,
                lat,
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData({ needLoad: true });
    }, []);

    const validationSchema = Yup.object({
        name: Yup.string()
            .required(t('Setting.BusinessNameIsRequired'))
            .typeError(t('Setting.PleaseEnterValidBusinessName')),
        address: Yup.string()
            .required(t('Setting.BusinessStreetNameIsRequired'))
            .typeError(t('Setting.PleaseEnterValidAddress')),

        about: Yup.string().nullable(),

        contact_number: Yup.string()
            .required(t('Setting.BusinessPhoneNumberIsRequired'))
            .min(8, t('Setting.MustBeExactly8Digits'))
            .max(8, t('Setting.MustBeExactly8Digits'))
            .typeError(t('Setting.BusinessPhoneNumberIsRequired')),

        contact_number2: Yup.string()
            .nullable()
            .min(8, t('Setting.MustBeExactly8Digits'))
            .max(8, t('Setting.MustBeExactly8Digits'))
            .typeError(t('Setting.BusinessPhoneNumberIsRequired')),

        cvr_number: Yup.string()
            .required(t('Setting.CVRNumberIsRequired'))
            .typeError(t('Setting.PleaseEnterValidCvrNumber')),
        lng: Yup.number()
            .typeError(t('Setting.LongitudeMustBeANumber'))
            .required(t('Setting.LongitudeIsRequired'))
            .typeError(t('Setting.PleaseEnterValidLongitude')),
        lat: Yup.number()
            .typeError(t('Setting.LatitubeMustBeANumber'))
            .required(t('Setting.LatitudeIsRequired'))
            .typeError(t('Setting.PleaseEnterValidLatitude')),
        email: Yup.string().email(t('Setting.InvalidEmailFormat')).required(t('Setting.EmailIsRequired')),
        hide_email: Yup.boolean().default(false),
        website: Yup.string().nullable().typeError(t('Setting.PleaseEnterValidWebsite')),
        instagram: Yup.string().nullable().typeError(t('Setting.PleaseEnterInstagramUrl')),
        facebook: Yup.string().nullable().typeError(t('Setting.PleaseEnterFacebookUrl')),
        tiktok: Yup.string().nullable().typeError(t('Setting.PleaseEnterTiktokUrl')),
        images: Yup.array(),
        profile_image: Yup.string(),
        banner_image: Yup.string(),
        gtmId: Yup.string().nullable(),
        autocomplete_booking: Yup.boolean(),
        outletEmailCancelNotification: Yup.boolean(),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            handlesubmit(values);
        },
    });

    useEffect(() => {
        const hasChanged = !_.isEqual(initialValues, formik.values);
        if (hasChanged !== isChanges) {
            const interval = setTimeout(() => {
                setIsChanges(hasChanged);
            }, 200);
            return () => clearTimeout(interval);
        }
    }, [initialValues, formik.values, isChanges]);

    //
    const handleCopy = () => {
        navigator.clipboard
            .writeText(`bahlou.dk/${bookingUrl}`)
            .then(() => {
                // alert("Text copied");
                toast.info(t('Setting.BookingURLCopied'));
            })
            .catch((err) => {
                console.error('err', err);
            });
    };

    const handleDrop = (setter) => (acceptedFiles) => {
        setter((prevFiles) => [...prevFiles, ...acceptedFiles]);
    };

    // Generic Remove Handler
    const handleFilesRemove = async ({ ids = [], profile_image = false, banner_image = false }) => {
        try {
            const res = await apiFetcher.delete('/api/v1/store/gallery', {
                data: { ids, profile_image, banner_image },
            });
            if (res.status === HttpStatusCode.Ok) {
                toast.success(t('Setting.ImageRemoved'));
                let newValues;

                if (profile_image) {
                    newValues = {
                        ...formik.values,
                        profile_image: '',
                    };
                } else if (banner_image) {
                    newValues = {
                        ...formik.values,
                        banner_image: '',
                    };
                } else {
                    newValues = {
                        ...formik.values,
                        images: formik.values.images.filter((img) => !ids.includes(img.id)),
                    };
                }
                formik.setValues(newValues);
                setInitialValues(newValues);
            }
        } catch (error) {
            toast.error(t('Setting.FailedToRemoveImage'));
        }
    };

    // Dropzone Configuration for Profile Image
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: handleDrop((file) => formik.setFieldValue('images', file)),
        accept: 'image/*',
        multiple: false,
    });

    const handleInputImageFileChange = (event) => {
        const filee = event.target.files[0];

        if (filee) {
            const reader = new FileReader();
            reader.onload = () => {
                formik.setFieldValue('images', [...formik.values.images, filee]);
            };
            reader.readAsDataURL(filee);
        }
    };

    const handlesubmit = async (values) => {
        const profile_validation = typeof formik.values.profile_image === 'object';
        const banner_validation = typeof formik.values.banner_image === 'object';
        const file_validation = typeof formik.values.images === 'object' && formik.values.images.length > 0;

        try {
            const parsed = setting.profile.settings.find((s) => s.settingName === 'OnlineBooking');

            let parsedValue = {};
            if (parsed.value) {
                try {
                    parsedValue = JSON.parse(parsed.value);
                } catch {
                    parsedValue = {};
                }
            }
            parsedValue.onlineBooking = parsedValue.onlineBooking || {};
            parsedValue.onlineBooking.outletEmailCancelNotification = formik.values.outletEmailCancelNotification;

            const payload = {
                settings: [
                    {
                        settingCategory: 'outlet',
                        settingName: 'OnlineBooking',
                        value: JSON.stringify(parsedValue),
                        type: 'JSON',
                    },
                ],
            };

            const response = await apiFetcher.patch('/api/v1/store/outlet/setting', payload);
            if (response.data.success) {
                setInitialValues((prev) => ({
                    ...prev,
                    outletEmailCancelNotification: formik.values.outletEmailCancelNotification,
                }));
            }
        } catch (error) {
            console.error('error : ', error);
        }

        try {
            if (formik.values.images.length === 0 && !profile_validation && !banner_validation) {
                const response = await apiFetcher.post(`/api/v1/store/setting/profile`, values);

                const { success } = response.data;

                if (success) {
                    toast.success(t('Setting.GeneralSettingsUpdated'));
                    await setInitialValues(formik.values);
                } else {
                    toast.error(t('Setting.FailedToUpdateGeneralSettings'));
                }
            }
        } catch (error) {
            console.error('Error uploading images:', error.images);
        } finally {
            await fetchData({ needLoad: false });
        }

        const formdata = new FormData();

        // Append single images
        if (profile_validation) {
            formdata.append('profile_image', formik.values.profile_image);
        }

        if (banner_validation) {
            formdata.append('banner_image', formik.values.banner_image);
        }

        // Append multiple images correctly
        let hasNewImages = false;
        if (file_validation) {
            const filteredImages = formik.values.images.filter((image) => !image?.image);

            if (filteredImages.length > 0) {
                hasNewImages = true;
                filteredImages.forEach((image, index) => {
                    formdata.append(`images`, image);
                });
            }
        }

        // Only make API call if there are actually files to upload
        const hasFilesToUpload = hasNewImages || profile_validation || banner_validation;

        if (hasFilesToUpload) {
            try {
                const imgup = await apiFetcher.post('/api/v1/store/gallery', formdata);

                const { success } = imgup.data;

                if (success) {
                    toast.success(t('Setting.GeneralSettingsUpdated'));
                } else {
                    toast.error(t('Setting.FailedToUpdateGeneralSettings'));
                }
            } catch (error) {
                console.error('Error uploading images:', error.images);
            } finally {
                await fetchData({ needLoad: false });
            }
        } else {
            // If we skipped both profile update AND file upload, we need to save profile settings
            if (formik.values.images.length > 0) {
                try {
                    const response = await apiFetcher.post(`/api/v1/store/setting/profile`, values);

                    const { success } = response.data;

                    if (success) {
                        toast.success(t('Setting.GeneralSettingsUpdated'));
                        await setInitialValues(formik.values);
                    } else {
                        toast.error(t('Setting.FailedToUpdateGeneralSettings'));
                    }
                } catch (error) {
                    toast.error(t('Setting.FailedToUpdateGeneralSettings'));
                } finally {
                    await fetchData({ needLoad: false });
                }
            }
        }

        refreshSettings();
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        // const value =  e.target.value.replace(/\D/g, "");
        formik.setFieldValue('contact_number2', value);
    };

    const handleAlternativePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        // const value =  e.target.value.replace(/\D/g, "");
        formik.setFieldValue('contact_number', value);
    };

    if (!formik?.values) return null;

    return (
        <form style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            {isChanges && (
                <AppBar
                    sx={{
                        position: 'sticky',
                        zIndex: 20,
                        top: 45,
                        left: 0,
                        py: 1,
                        px: 4,
                        height: 50,
                        bgcolor: '#fff',
                        display: 'flex',
                        // justifyContent: "flex-end",
                        alignItems: 'flex-end',
                        width: '100%',
                        borderWidth: 0,
                        // boxShadow:'none'
                    }}
                >
                    <CommonButton
                        onClick={() => {
                            formik.handleSubmit();
                        }}
                        width="auto"
                        minWidth={'150px'}
                        ml={'auto'}
                        height={40}
                        title={
                            formik.isSubmitting ? (
                                <CircularProgress sx={{ mx: 4 }} color="inherit" size={20} />
                            ) : (
                                t('Customer.SaveCh')
                            )
                        }
                        disabled={formik.isSubmitting}
                    />
                </AppBar>
            )}

            <Stack sx={{ p: { xs: 2, md: 2 }, width: '100%' }}>
                <Stack sx={{ bgcolor: '#fff', borderRadius: '25px', scrollbarWidth: 'none', overflowX: 'hidden' }}>
                    {/* Store Information */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Setting.StoreInformation')} />
                            <SecondaryHeading text={t('Setting.Description1')} />
                        </Grid2>

                        {loading ? (
                            <Stack flexDirection={'column'} width={'67%'} justifyContent={'flex-start'}>
                                {/* make it copy for 5 rows */}
                                {Array.from({ length: 5 }, (_, i) => {
                                    return (
                                        <Stack
                                            flexDirection={'row'}
                                            width={'100%'}
                                            justifyContent={'flex-start'}
                                            gap={6}
                                            mb={2}
                                        >
                                            <Stack sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <Skeleton variant="text" width={'50%'} height={40} />
                                                <Skeleton variant="rounded" width={'100%'} height={40} />
                                            </Stack>
                                            <Stack sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <Skeleton variant="text" width={'50%'} height={40} />
                                                <Skeleton variant="rounded" width={'100%'} height={40} />
                                            </Stack>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        ) : (
                            <Grid2 size={{ xs: 12, md: 8 }}>
                                <Grid2 container spacing={3}>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        {/* Business Name */}
                                        <React.Fragment>
                                            <CommonTypoGraphy sx={{ mt: 0 }} text={t('Setting.NameOfYourBusiness')} />
                                            <CustomTextField
                                                mt={0}
                                                disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                                {...formik.getFieldProps('name')}
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                id={'name'}
                                                name={'name'}
                                            />

                                            {formik.errors.name && formik.touched.name && (
                                                <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                    {formik.errors.name}
                                                </Box>
                                            )}
                                        </React.Fragment>

                                        {/* Booking URL */}
                                        <React.Fragment>
                                            <CommonTypoGraphy text={t('Setting.BookingURL')} />
                                            <CustomTextField
                                                mt={0}
                                                disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                                value={bookingUrl !== '' && `bahlou.dk/${bookingUrl}`}
                                                onFocus={(e) => e.target.select()}
                                                onChange={() => {}}
                                                showCopyButton
                                                handleCopy={handleCopy}
                                                bgColor={'#D9D9D9'}
                                            />
                                        </React.Fragment>

                                        {/* Business Phone Number */}
                                        <React.Fragment>
                                            <CommonTypoGraphy text={t('Setting.BusinessPhoneNumber')} />
                                            <CustomTextField
                                                mt={0}
                                                disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                                id="contact_number"
                                                value={
                                                    formik.values.contact_number
                                                        ? formatPhoneNumber(formik.values.contact_number)
                                                        : ''
                                                }
                                                inputProps={{ maxLength: 11 }}
                                                onChange={handleAlternativePhoneChange}
                                                placeholder={t('Setting.AlternativeMobileNumber')}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Typography sx={{ color: '#1f1f1f' }}>+45</Typography>
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                                onBlur={() => formik.setFieldTouched('contact_number', true)}
                                            />

                                            {formik.errors.contact_number && formik.touched.contact_number && (
                                                <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                    <Typography variant="caption" color="red">
                                                        {formik.errors.contact_number}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </React.Fragment>

                                        {/* Alternative Business Phone Number */}
                                        <React.Fragment>
                                            <CommonTypoGraphy text={t('Setting.AlternativePhoneNumber')} />
                                            <CustomTextField
                                                disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                                id="contact_number2"
                                                value={
                                                    formik.values.contact_number2
                                                        ? formatPhoneNumber(formik.values.contact_number2)
                                                        : ''
                                                }
                                                mt={1}
                                                inputProps={{ maxLength: 11 }}
                                                onChange={handlePhoneChange}
                                                placeholder={t('Setting.MobileNumber')}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Typography sx={{ color: '#1f1f1f' }}>+45</Typography>
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                                onBlur={() => formik.setFieldTouched('contact_number2', true)}
                                            />
                                            {formik.touched.contact_number2 && formik.errors.contact_number2 && (
                                                <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                    <Typography variant="caption" color="red">
                                                        {formik.errors.contact_number2}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </React.Fragment>

                                        {/*  Email */}
                                        <React.Fragment>
                                            <CommonTypoGraphy text={t('Setting.Email')} />
                                            <CustomTextField
                                                mt={0}
                                                disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                                {...formik.getFieldProps('email')}
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                name={'email'}
                                                id={'email'}
                                            />
                                            {formik.touched.email && formik.errors.email && (
                                                <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                    <Typography variant="caption" color="red">
                                                        {formik.errors.email}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Stack sx={{ display: 'flex', flexDirection: 'row' }}>
                                                <Checkbox
                                                    disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                                    {...formik.getFieldProps('hide_email')}
                                                    onChange={formik.handleChange}
                                                    name={'hide_email'}
                                                    id={'hide_email'}
                                                    checked={formik.values.hide_email}
                                                />
                                                <Typography
                                                    sx={{
                                                        height: 20,
                                                        fontWeight: 100,
                                                        fontFamily: 'DM Sans',
                                                        marginTop: 1.15,
                                                    }}
                                                >
                                                    {t('Setting.Don’tShareEmailAddress')}
                                                </Typography>
                                            </Stack>
                                        </React.Fragment>
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        {/* Address */}
                                        <React.Fragment>
                                            <CommonTypoGraphy sx={{ mt: 0 }} text={t('Setting.Street')} />
                                            <CustomTextField
                                                mt={0}
                                                disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                                {...formik.getFieldProps('address')}
                                                value={formik.values.address}
                                                onChange={formik.handleChange}
                                                name={'address'}
                                                id={'address'}
                                            />
                                            {formik.errors.address && formik.touched.address && (
                                                <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                    {formik.errors.address}
                                                </Box>
                                            )}
                                        </React.Fragment>

                                        {/* Marketplace Pointer = Lat & Long */}
                                        <React.Fragment>
                                            <CommonTypoGraphy text={t('Setting.MarketplacePointer')} />
                                            <Stack style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Stack
                                                    style={{
                                                        display: 'flex',
                                                        width: '203px',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <SecondaryHeading text={t('Setting.Latitude')} />
                                                    <CustomTextField
                                                        mt={0}
                                                        disabled={
                                                            user?.role !== 'ADMIN' && !user?.settings.edit_about_us
                                                        }
                                                        {...formik.getFieldProps('lat')}
                                                        value={formik.values.lat || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and dot
                                                            const dotCount = (value.match(/\./g) || []).length; // Count the number of dots
                                                            if (dotCount <= 1) {
                                                                // Allow only one dot
                                                                formik.setFieldValue('lat', parseFloat(value));
                                                            }
                                                        }}
                                                        name={'lat'}
                                                        id={'lat'}
                                                    />
                                                    {formik.errors.lat && formik.touched.lat && (
                                                        <Box
                                                            component={'span'}
                                                            style={{ color: 'red', fontSize: '12px' }}
                                                        >
                                                            {formik.errors.lat}
                                                        </Box>
                                                    )}
                                                </Stack>

                                                <Stack
                                                    style={{
                                                        display: 'flex',
                                                        marginLeft: 10,
                                                        flexDirection: 'column',
                                                        width: '203px',
                                                    }}
                                                >
                                                    <SecondaryHeading text={t('Setting.Longitude')} />
                                                    <CustomTextField
                                                        mt={0}
                                                        disabled={
                                                            user?.role !== 'ADMIN' && !user?.settings.edit_about_us
                                                        }
                                                        {...formik.getFieldProps('lng')}
                                                        value={formik.values.lng || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and dot
                                                            const dotCount = (value.match(/\./g) || []).length; // Count the number of dots
                                                            if (dotCount <= 1) {
                                                                // Allow only one dot
                                                                formik.setFieldValue('lng', parseFloat(value));
                                                            }
                                                        }}
                                                        name={'lng'}
                                                        id={'lng'}
                                                    />
                                                    {formik.errors.lng && formik.touched.lng && (
                                                        <Box
                                                            component={'span'}
                                                            style={{ color: 'red', fontSize: '12px' }}
                                                        >
                                                            {formik.errors.lng}
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </React.Fragment>

                                        {/* CVR Number */}
                                        <React.Fragment>
                                            <CommonTypoGraphy
                                                sx={{ mt: { xs: 2, md: 8 } }}
                                                text={t('Setting.CVRNumber')}
                                            />
                                            <CustomTextField
                                                mt={0}
                                                disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                                {...formik.getFieldProps('cvr_number')}
                                                value={formik.values.cvr_number}
                                                onChange={formik.handleChange}
                                                name={'cvr_number'}
                                                id={'cvr_number'}
                                            />
                                            {formik.errors.cvr_number && formik.touched.cvr_number && (
                                                <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                    {formik.errors.cvr_number}
                                                </Box>
                                            )}
                                        </React.Fragment>
                                    </Grid2>

                                    {/* About Us */}
                                    <Grid2 size={12}>
                                        <CommonTypoGraphy text={t('Setting.AboutUs')} />
                                        <TextareaAutosize
                                            disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                            {...formik.getFieldProps('about')}
                                            minRows={10}
                                            maxRows={50}
                                            value={formik.values.about}
                                            onChange={formik.handleChange}
                                            name="about"
                                            id="about"
                                            style={{
                                                width: '100%',
                                                height: '20px',
                                                padding: '10px',
                                                fontSize: '16px',
                                                borderRadius: '10px',
                                                border: '2px solid #D9D9D9',
                                                outline: 'none',
                                                resize: 'none',
                                            }}
                                        />
                                        {formik.errors.about && formik.touched.about && (
                                            <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                {formik.errors.about}
                                            </Box>
                                        )}
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                        )}
                    </Grid2>

                    <Divider sx={{ ...dividerSx }} />

                    {/* Bank Info */}
                    {!loading && (
                        <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.BankInfo')} />
                                <SecondaryHeading text={t('Setting.BankInfoDesc')} />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 8 }}>
                                <Stack>
                                    <CommonTypoGraphy text={t('Setting.BankAccountNumber')} />
                                    <FTextInput
                                        value={formik.values?.bank_info?.bank_account_number}
                                        disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                        onChange={(e) =>
                                            formik.setFieldValue('bank_info.bank_account_number', e.target.value)
                                        }
                                        name={'bank_account_number'}
                                        id={'bank_account_number'}
                                        placeholder={t('Setting.BankAccountNumber')}
                                        sx={{ mt: 0, width: { xs: '100%', md: '40%' } }}
                                    />
                                </Stack>

                                <Stack sx={{ mt: 2 }}>
                                    <CommonTypoGraphy text={t('Setting.RegestrationNumber')} />
                                    <FTextInput
                                        value={formik.values?.bank_info?.registration_number}
                                        disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                        onChange={(e) =>
                                            formik.setFieldValue('bank_info.registration_number', e.target.value)
                                        }
                                        name={'registration_number'}
                                        id={'registration_number'}
                                        placeholder={t('Setting.RegestrationNumber')}
                                        sx={{ mt: 0, width: { xs: '100%', md: '40%' } }}
                                    />
                                </Stack>
                            </Grid2>
                        </Grid2>
                    )}

                    <Divider sx={{ ...dividerSx }} />

                    {/* Merchant ID FOR MOBILE PAYMENT */}
                    {!loading && (
                        <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.MerchantID')} />
                                <SecondaryHeading text={t('Setting.MerchantIDDesc')} />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 8 }}>
                                <Stack>
                                    <CommonTypoGraphy text={t('Setting.MerchantID')} />
                                    <FTextInput
                                        value={formik.values?.merchant_id}
                                        disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                        onChange={(e) => formik.setFieldValue('merchant_id', e.target.value)}
                                        name={'merchant_id'}
                                        id={'merchant_id'}
                                        placeholder={t('Setting.MerchantID')}
                                        sx={{ mt: 0, width: { xs: '100%', md: '40%' } }}
                                    />
                                </Stack>
                            </Grid2>
                        </Grid2>
                    )}

                    <Divider sx={{ ...dividerSx }} />

                    {/* AutoComplete Booking */}
                    {!loading && (
                        <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.AutoCompleteBooking')} />
                                <SecondaryHeading text={t('Setting.AutoCompleteBookingDesc')} />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 8 }} sx={{ mt: { xs: 2, md: 0 } }}>
                                <CommonTypoGraphy text={t('Setting.AutoCompleteBooking')} />
                                <FSwitch
                                    checked={formik?.values?.autocomplete_booking}
                                    onChange={() => {
                                        formik.setFieldValue(
                                            'autocomplete_booking',
                                            !formik.values.autocomplete_booking,
                                        );
                                    }}
                                />
                            </Grid2>
                        </Grid2>
                    )}

                    <Divider sx={{ ...dividerSx }} />

                    {/* Cancel Booking */}
                    {!loading && (
                        <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Calendar.CancelBooking')} />
                                <SecondaryHeading text={t('Setting.CancelBookingDescription')} />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 8 }} sx={{ mt: { xs: 2, md: 0 } }}>
                                {/* <CommonTypoGraphy text={t('Calendar.CancelBooking')} /> */}
                                <FSwitch
                                    checked={formik?.values?.outletEmailCancelNotification}
                                    onChange={() => {
                                        formik.setFieldValue(
                                            'outletEmailCancelNotification',
                                            !formik.values.outletEmailCancelNotification,
                                        );
                                    }}
                                />
                            </Grid2>
                        </Grid2>
                    )}

                    <Divider sx={{ ...dividerSx }} />

                    {/* GTM */}
                    {!loading && (
                        <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.GtmTitle')} />
                                <SecondaryHeading text={t('Setting.GtmDescription')} />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 8 }} sx={{ mt: { xs: 2, md: 0 } }}>
                                <CommonTypoGraphy text={t('Setting.GtmCode')} />
                                <FTextInput
                                    disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                    value={formik.values.gtmId}
                                    name="GTM"
                                    placeholder={'GTM-XXXXXXXX'}
                                    onChange={(e) => formik.setFieldValue('gtmId', e.target.value)}
                                />

                                <FTextArea
                                    disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                    rows={10}
                                    value={`<script>
(function() {
  var originalPush = window.dataLayer.push;
  window.dataLayer.push = function(obj) {
    originalPush.apply(window.dataLayer, arguments);
    if (obj && (obj.event === 'purchase' || obj.event === 'aboutUsVisit' || obj.event === 'picturesVisit'||obj.event === 'profileVisit')) {
      fetch('https://api-pdn.fiind.app/api/v1/web/save_gtm_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      });
    }
  };
})();
</script>`}
                                    onFocus={(e) => e.target.select()}
                                    onChange={() => {}}
                                    showCopyButton
                                    handleCopy={() => {
                                        navigator.clipboard
                                            .writeText(
                                                `<script>
(function() {
  var originalPush = window.dataLayer.push;
  window.dataLayer.push = function(obj) {
    originalPush.apply(window.dataLayer, arguments);
    if (obj && (obj.event === 'purchase' || obj.event === 'aboutUsVisit' || obj.event === 'picturesVisit'||obj.event === 'profileVisit')) {
      fetch('https://api-pdn.fiind.app/api/v1/web/save_gtm_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      });
    }
  };
})();
</script>`,
                                            )
                                            .then(() => {
                                                toast.info(t('Setting.GTMCodeCopied'));
                                            })
                                            .catch((err) => {
                                                console.err('err', err);
                                            });
                                    }}
                                    bgColor={'#D9D9D9'}
                                />
                            </Grid2>
                        </Grid2>
                    )}

                    <Divider sx={{ ...dividerSx }} />

                    {/* Marketplace Links */}
                    {!loading && (
                        <Grid2 container sx={{ p: { xs: 2, md: 5 } }} spacing={3}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.MarketplaceLinks')} />
                                <SecondaryHeading text={t('Setting.Description2')} />
                            </Grid2>

                            <Grid2 container size={{ xs: 12, md: 8 }}>
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    {/* Website Link */}
                                    <React.Fragment>
                                        <CommonTypoGraphy text={t('Setting.WebsiteLink')} />
                                        <CustomTextField
                                            mt={0}
                                            disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                            {...formik.getFieldProps('website')}
                                            value={formik.values.website}
                                            onChange={formik.handleChange}
                                            id={'website'}
                                            name={'website'}
                                        />
                                        {formik.errors.website && formik.touched.website && (
                                            <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                {formik.errors.website}
                                            </Box>
                                        )}
                                    </React.Fragment>

                                    {/* TikTok Link */}
                                    <React.Fragment>
                                        <CommonTypoGraphy text={t('Setting.TikTokLink')} />
                                        <CustomTextField
                                            mt={0}
                                            disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                            {...formik.getFieldProps('tiktok')}
                                            id={'tiktok'}
                                            name={'tiktok'}
                                            value={formik.values.tiktok}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                newValue = newValue.replace(/^([^@])/, '@$1');
                                                formik.setFieldValue('tiktok', newValue);
                                            }}
                                            onBlur={() => {
                                                let currentValue = formik.values.tiktok;
                                                currentValue = currentValue.replace(/^([^@])/, '@$1');
                                                formik.setFieldValue('tiktok', currentValue);
                                            }}
                                        />
                                        {formik.errors.tiktok && formik.touched.tiktok && (
                                            <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                {formik.errors.tiktok}
                                            </Box>
                                        )}
                                    </React.Fragment>
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    {/* Instagram Link */}
                                    <React.Fragment>
                                        <CommonTypoGraphy text={t('Setting.InstagramLink')} />
                                        <CustomTextField
                                            disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                            id={'instagram'}
                                            name={'instagram'}
                                            {...formik.getFieldProps('instagram')}
                                            value={formik.values.instagram}
                                            onChange={formik.handleChange}
                                            sx={{marginTop : 0}}
                                        />
                                        {formik.errors.instagram && formik.touched.instagram && (
                                            <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                {formik.errors.instagram}
                                            </Box>
                                        )}
                                    </React.Fragment>

                                    {/* Facebook Link */}
                                    <React.Fragment>
                                        <CommonTypoGraphy text={t('Setting.FacebookLink')} />
                                        <CustomTextField
                                            disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                            id="facebook"
                                            name={'facebook'}
                                            {...formik.getFieldProps('facebook')}
                                            value={formik.values.facebook}
                                             sx={{marginTop : 0}}
                                            onChange={formik.handleChange}
                                        />
                                        {formik.errors.facebook && formik.touched.facebook && (
                                            <Box component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                                                {formik.errors.facebook}
                                            </Box>
                                        )}
                                    </React.Fragment>
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    )}

                    <Divider sx={{ ...dividerSx }} />

                    {/* Gallery */}
                    {!loading && (
                        <Grid2 container sx={{ p: { xs: 2, md: 5 } }} spacing={3}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.Gallery')} />
                                <SecondaryHeading text={t('Setting.Description3')} />
                            </Grid2>

                            <Grid2 container size={{ xs: 12, md: 8 }}>
                                {(user?.role === 'ADMIN' || user?.settings.upload_pictures) && (
                                    <Stack
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: { xs: 'column', md: 'row' },
                                        }}
                                    >
                                        {/* Profile Picture */}
                                        <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                            <CommonTypoGraphy text={t('Setting.ProfilePicture')} />
                                            <Stack marginLeft={-2.2} spacing={2} sx={{ marginTop: '20px' }}>
                                                <FimageUpload
                                                    formik={formik}
                                                    setter={(file) => formik.setFieldValue('profile_image', file)}
                                                    id={'profile_image'}
                                                    field={formik.values.profile_image}
                                                    handleFileRemove={() => handleFilesRemove({ profile_image: true })}
                                                />
                                            </Stack>
                                        </Stack>

                                        {/* Banner Picture */}
                                        <Stack sx={{ marginLeft: '10px', width: { xs: '100%', md: '50%' } }}>
                                            <CommonTypoGraphy text={t('Setting.BannerPicture')} />
                                            <Stack spacing={2} style={{ marginTop: '20px', marginLeft: '-16px' }}>
                                                <FimageUpload
                                                    formik={formik}
                                                    setter={(file) => formik.setFieldValue('banner_image', file)}
                                                    id="banner_image"
                                                    field={formik.values.banner_image}
                                                    handleFileRemove={() => handleFilesRemove({ banner_image: true })}
                                                />
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                )}

                                <CommonTypoGraphy text={t('Setting.Gallery')} />

                                <Masonry
                                    columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
                                    spacing={5}
                                    sx={{ maxWidth: '100%', zIndex: 0 }}
                                >
                                    {formik?.values?.images?.length > 0 &&
                                        formik.values.images.map((item, index) => (
                                            <Paper
                                                key={index}
                                                sx={{
                                                    zIndex: 0,
                                                    position: 'relative',
                                                }}
                                            >
                                                {(user?.role === 'ADMIN' || user?.settings.upload_pictures) && (
                                                    <IconButton
                                                        sx={{ position: 'absolute', top: 0, right: 7 }}
                                                        disableRipple
                                                        onClick={() => {
                                                            if (typeof item === 'object' && item?.id) {
                                                                handleFilesRemove({ ids: [item?.id] });
                                                            } else {
                                                                const filterdImages = formik.values.images.filter(
                                                                    (img) => img !== item,
                                                                );
                                                                formik.setFieldValue('images', filterdImages);
                                                            }
                                                        }}
                                                    >
                                                        <Cancel
                                                            sx={{ backgroundColor: 'transparent', color: 'white' }}
                                                        />
                                                    </IconButton>
                                                )}
                                                <img
                                                    src={
                                                        item?.image && typeof item?.image === 'string'
                                                            ? `${process.env.REACT_APP_IMG_URL}${item.image}`
                                                            : URL.createObjectURL(item)
                                                    }
                                                    alt="img"
                                                    style={{
                                                        borderBottomLeftRadius: 4,
                                                        borderBottomRightRadius: 4,
                                                        borderRadius: '12px',
                                                        display: 'block',
                                                        width: '100%',
                                                        border: '5px solid transparent',
                                                        transition: 'border-color 0.3s ease', // Smooth hover transition
                                                        '&:hover': {
                                                            borderColor: 'rgb(60, 155, 234)',
                                                        },
                                                    }}
                                                    loading="lazy"
                                                />
                                            </Paper>
                                        ))}

                                    {/* Upload Section */}
                                    {(user?.role === 'ADMIN' || user?.settings.upload_pictures) && (
                                        <Box
                                            {...getRootProps()}
                                            component={'div'}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '300px',
                                                borderRadius: '12px',
                                                padding: 2,
                                                backgroundColor: '#f5f5f5', // Light background to distinguish
                                                border: '1px solid #ddd',
                                            }}
                                        >
                                            <Stack
                                                sx={{
                                                    width: '100%',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <input {...getInputProps()} onChange={handleInputImageFileChange} />
                                                <Button
                                                    sx={{
                                                        height: '80px',
                                                        width: '80px',
                                                        backgroundColor: '#fff',

                                                        borderRadius: '58px',
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            backgroundColor: '#6F6F6F50',
                                                        },
                                                    }}
                                                >
                                                    <Add
                                                        sx={{
                                                            height: '48px',
                                                            width: '48px',
                                                            color: '#A79C92',
                                                        }}
                                                    />
                                                </Button>
                                            </Stack>
                                        </Box>
                                    )}
                                </Masonry>
                            </Grid2>
                        </Grid2>
                    )}
                </Stack>
            </Stack>
        </form>
    );
};

export default GeneralSettingsOption;

const CommonTypoGraphy = ({ text, sx }) => {
    return (
        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F', mt: 2, ...sx }}>
            {text}
        </Typography>
    );
};
