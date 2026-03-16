import React, { useState, useEffect } from 'react';
import { Box, Modal, Select, MenuItem, IconButton, Typography, Checkbox, TextField, Autocomplete, Paper, Grid2 } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { DeepLinkSwitch } from "../service/DeepLinkSwitch";
import axios from 'axios';
import { toast } from "react-toastify";

import CustomTextField from '../settings/commonTextinput';
// import PrimaryHeading from '../settings/commonPrimaryHeading';
import CommonButton from '../settings/commonButton';
import CustomDatePicker from '../settings/commonDatePicker';
import CustomTimePicker from '../settings/commonTimePicker';

import { useFormik } from "formik";
import * as Yup from "yup";

import moment from 'moment';
import { t } from 'i18next';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    // maxWidth: "md",
    bgcolor: '#FFFFFF',
    borderRadius: 3,
    boxShadow: 0,
    p: 3.5,
};

function AddSpecialOfferModal(props) {
    const { user, open, handleClose, selectedSpecialOffer, type } = props;
    const authTokenUser = localStorage.getItem('auth_token');

    // const [isLoading, setLoading] = useState(false);
    const [standardprice, setStandardPrice] = useState('0');
    const [serviceList, setServiceList] = useState([]);
    const [searchService, setSearchService] = useState('');
    const [initialValues, setInitialValues] = useState({
        start_date: null,
        start_time: null,
        ending_date: null,
        ending_time: null,
        endOf_Offer: '',
        customStartDate: '',
        customEndDate: '',
        customStartTime: '',
        customEndTime: '',
        newPrice: '',
        percentage: '',
        isActive: false,
        selectedService: null,
        selectedEmployeeIds: [],
    });


    useEffect(() => {
        if (type === 'edit' && selectedSpecialOffer) {
            const startDate = new Date(selectedSpecialOffer?.start_datetime);
            const endDate = new Date(selectedSpecialOffer?.end_datetime);

            formik.setValues({
                start_date: moment(startDate),
                start_time: moment(startDate),
                ending_date: moment(endDate),
                ending_time: moment(endDate),
                marketplace_hidden : selectedSpecialOffer?.service.marketplace_hidden || false,
            });
        }
    }, [type, selectedSpecialOffer]);

    useEffect(() => {
        fetchServiceApi();
    }, []);

    async function fetchServiceApi() {
        // setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_URL}/api/v1/store/service`, {
                headers: {
                    Authorization: `Bearer ${authTokenUser}`
                }
            });

            if (response) {
                setServiceList(response.data.data);
                // setLoading(false);
            } else {
                setServiceList([]);
                // setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching service data:", error);
            setServiceList([]);
            // setLoading(false);
        }
        // finally {
        //     setLoading(false);
        // }
    };

    useEffect(() => {
        if (type === 'edit' && selectedSpecialOffer && serviceList.length > 0) {


            serviceList.forEach(service => {
                if (service.id === selectedSpecialOffer?.service.special_source_id) {
                    formik.setFieldValue('selectedService', service);

                    setStandardPrice(parseFloat(service.price));

                    const selectedEmployeeIds = selectedSpecialOffer?.employees?.map(employee => employee.id) || [];
                    const matchedEmployeeIds = service.employees?.filter(employee => selectedEmployeeIds.includes(employee.id)).map(employee => employee.id) || [];
                    formik.setFieldValue('selectedEmployeeIds', matchedEmployeeIds);

                    const newPrice = parseFloat(selectedSpecialOffer?.service.special_price);
                    const percentage = parseFloat(selectedSpecialOffer?.service.special_percentage);
                    formik.setFieldValue('newPrice', newPrice);
                    formik.setFieldValue('percentage', percentage);
                }
            });
        }
    }, [serviceList]);

    const handleServiceChange = (event) => {
        const selectedServiceId = event.target.value;
        const service = serviceList.find(service => service.id === selectedServiceId);

        if (service) {
            formik.setFieldValue('selectedService', service)
            setStandardPrice(parseFloat(service.price));
            // formik.setFieldValue('selectedEmployeeIds', service.employees.map(employee => employee.id))
            formik.setFieldValue('selectedEmployeeIds', []);
        } else {
            formik.setFieldValue('selectedService', null)
            setStandardPrice(0);
            formik.setFieldValue('selectedEmployeeIds', []);
        }
    };

    // const handleEmployeeToggle = (employeeId) => {
    //     const currentSelectedEmployeeIds = formik.values.selectedEmployeeIds;

    //     const isEmployeeSelected = currentSelectedEmployeeIds.includes(employeeId);

    //     const newSelectedEmployeeIds = isEmployeeSelected
    //         ? currentSelectedEmployeeIds.filter(id => id !== employeeId)
    //         : [...currentSelectedEmployeeIds, employeeId];

    //     formik.setFieldValue('selectedEmployeeIds', newSelectedEmployeeIds);
    // };

    let timeoutId;

    const handleEmployeeToggle = (employeeId) => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            const currentSelectedEmployeeIds = formik.values.selectedEmployeeIds || [];

            const isEmployeeSelected = currentSelectedEmployeeIds.includes(employeeId);

            const newSelectedEmployeeIds = isEmployeeSelected
                ? currentSelectedEmployeeIds.filter(id => id !== employeeId)
                : [...currentSelectedEmployeeIds, employeeId];

            formik.setFieldValue('selectedEmployeeIds', newSelectedEmployeeIds);
        }, 300);
        return () => clearTimeout(timeoutId);
    };

    const resetFields = (command) => {
        handleClose(command);
    };

    const handleCloseModal = (event, reason) => {
        if (reason === 'backdropClick') {
            return;
        }
    };

    const handlePercentageChange = (e) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d{0,2}$/;

        if (value === '.') {
            return;
        }

        if (value === '') {
            formik.setFieldValue('percentage', '');
            formik.setFieldValue('newPrice', '');
            return;
        }

        if (regex.test(value)) {
            const percentage = parseFloat(value);

            if (percentage > 100) {
                formik.setFieldValue('percentage', '100');
                formik.setFieldValue('newPrice', (standardprice * 1).toFixed(2));
            } else {
                const calculatedNewPrice = standardprice - (standardprice * (percentage / 100));
                formik.setFieldValue('percentage', value);
                formik.setFieldValue('newPrice', calculatedNewPrice.toFixed(2));
            }
        }
    };

    const handleNewPriceChange = (e) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d{0,2}$/;

        if (value === '.') {
            return;
        }

        if (value === '') {
            formik.setFieldValue('newPrice', '');
            formik.setFieldValue('percentage', '');
            return;
        }

        if (regex.test(value)) {
            const newPrice = parseFloat(value);

            if (newPrice > standardprice) {
                formik.setFieldValue('newPrice', standardprice.toString());
                formik.setFieldValue('percentage', '0.00');
            } else {
                const calculatedPercentage = ((standardprice - newPrice) / standardprice) * 100;
                formik.setFieldValue('newPrice', value);
                formik.setFieldValue('percentage', calculatedPercentage.toFixed(2));
            }
        }
    };



    const validationSchema = Yup.object({
        isActive: Yup.boolean(),

        start_date: Yup.date()
            .nullable()
            .when('isActive', {
                is: false,
                then: Yup.date()
                    .required(t('SpOffers.YupErrStartDateRequired'))
                    .nullable()
                    .typeError(t('SpOffers.YupErrStartDateTypeError')),
                otherwise: Yup.date().nullable(),
            }),

        start_time: Yup.string()
            .when('isActive', {
                is: false,
                then: Yup.string()
                    .required(t('SpOffers.YupErrStartTimeRequired'))
                    .nullable(),
                otherwise: Yup.string().nullable(),
            }),

        ending_date: Yup.date()
            .nullable()
            .when('isActive', {
                is: false,
                then: Yup.date()
                    .required(t('SpOffers.YupErrEndingDateRequired'))
                    .nullable()
                    .typeError(t('SpOffers.YupErrEndingDateTypeError')),
                otherwise: Yup.date()
                    .required(t('SpOffers.YupErrEndingDateRequired'))
                    .nullable()
                    .typeError(t('SpOffers.YupErrEndingDateTypeError')),
            }),

        ending_time: Yup.string()
            .when('isActive', {
                is: false,
                then: Yup.string()
                    .required(t('SpOffers.YupErrEndingTimeRequired'))
                    .nullable(),
                otherwise: Yup.string()
                    .required(t('SpOffers.YupErrEndingTimeRequired'))
                    .nullable(),
            }),

        selectedService: Yup.object()
            .required(t('SpOffers.YupErrSelectedServiceRequired'))
            .nullable(),

        newPrice: Yup.number()
            .required(t('SpOffers.YupErrNewPriceRequired'))
            .positive(t('SpOffers.YupErrNewPricePositive'))
            .min(0, t('SpOffers.YupErrNewPriceMin'))
            .typeError(t('SpOffers.YupErrNewPriceTypeError')),

        percentage: Yup.number()
            .required(t('SpOffers.YupErrPercentageRequired'))
            .min(0, t('SpOffers.YupErrPercentageMin'))
            .max(100, t('SpOffers.YupErrPercentageMax'))
            .typeError(t('SpOffers.YupErrPercentageTypeError')),
    });


    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: async (values) => {         


            let startDate = null;
            let startTime = null;
            let endDate = null;
            let endTime = null;

            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const formatTime = (date) => {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${hours}:${minutes}:${seconds}`;
            };

            if (!values.isActive) {
                startDate = formatDate(new Date(values.start_date));
                startTime = formatTime(new Date(values.start_time));
                endDate = formatDate(new Date(values.ending_date));
                endTime = formatTime(new Date(values.ending_time));
            } else {
                const currentDate = new Date();
                startDate = formatDate(currentDate);
                startTime = formatTime(currentDate);
                endDate = formatDate(new Date(values.ending_date));
                endTime = formatTime(new Date(values.ending_time));
            }

            const specialPrice = Number(values.newPrice);
            const formattedPercentage = Number(values.percentage) % 1 === 0 ? Number(values.percentage) : Number(values.percentage).toFixed(2).replace('.00', '');

            try {
                const data = {
                    start_datetime: `${startDate} ${startTime}`,
                    end_datetime: `${endDate} ${endTime}`,
                    service_id: type === 'edit' ? selectedSpecialOffer?.service_id : values.selectedService?.id,
                    special_price: specialPrice,
                    special_percentage: formattedPercentage,
                    employee_ids: values.selectedEmployeeIds,
                    marketplace_hidden:values.marketplace_hidden,
                };

                let response;

                if (type === 'create') {
                    response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/store/special_offer`, data, {
                        headers: {
                            Authorization: `Bearer ${authTokenUser}`
                        }
                    });

                    if (response?.status === 200) {
                        toast.success(t("SpOffers.ToastSSpOFCr"));
                        resetFields('Callapi');
                    }

                } else if (type === 'edit') {
                    response = await axios.patch(`${process.env.REACT_APP_URL}/api/v1/store/special_offer/${selectedSpecialOffer?.id}`, data, {
                        headers: {
                            Authorization: `Bearer ${authTokenUser}`
                        }
                    });

                    if (response?.status === 200) {
                        toast.success(t("SpOffers.ToastSSpOU"));
                        resetFields('Callapi');
                    }

                } else {
                    // toast.error(`Failed to ${type} special offer`);
                    toast.error(t("SpOffers.ToastSSpOU"));
                }

            } catch (error) {
                console.error(`Error while ${type} special offer:`, error);
            }
            // finally {
            //     setLoading(false);
            // }
        },
    });

    const filteredServices = serviceList.filter(service =>
        service.name.toLowerCase().includes(searchService?.toLowerCase())
    );

    const handleSearchChange = (e) => {
        setSearchService(e.target.value);
    };

    return (
        <Modal
            open={open}
            onClose={handleCloseModal}
            disableAutoFocus
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            <Paper
                sx={{
                    width: '80%',
                    maxHeight: "80%",
                    overflowY: "auto",
                    scrollbarWidth: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    position: "relative",
                    borderRadius: 8, py: 4, px: 2,
                }}>

                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={() => resetFields()}
                    aria-label="close"
                    sx={{
                        position: 'absolute',
                        top: '10px',
                        right: '30px',
                        zIndex: 10,
                        color: 'black'
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%'
                }}> */}
                {/* <PrimaryHeading text={type == 'edit' ? 'Update special offer' : 'Create a special offer'} fontSize='26px' /> */}
                <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f1f1f', textAlign: 'center', }}>
                    {type == 'edit' ? t("SpOffers.UpSpOf") : t("SpOffers.CrSpOf")}
                </Typography>
                {/* </Box> */}

                <form onReset={() => formik.resetForm()} onSubmit={formik.handleSubmit}>

                    <Grid2 container spacing={4} >

                        <Grid2 size={{ xs: 12, md: 6 }}>



                            {!formik.values.isActive &&
                                <>
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'space-between', alignItems: formik.values.start_date === 'custom' ? null : 'center', mt: 2 }}>
                                        {/* <PrimaryHeading text={'Set starting date'} /> */}
                                        <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f', width: { xs: '100%', md: '50%' }, textAlign: { xs: 'left', md: 'right' }, pr: 3 }}>
                                            {t("SpOffers.SetStDate")}
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            width: { xs: '100%', md: '50%' },
                                            // maxWidth: '60%',
                                            // '@media (max-width: 1440px)': {
                                            //     maxWidth: '50%',
                                            // },
                                            // '@media (max-width: 900px)': {
                                            //     maxWidth: '40%',
                                            // }
                                        }}>


                                            <CustomDatePicker
                                                disabled={!user?.settings?.crud_special_offers}
                                                value={formik.values.start_date}
                                                onChange={(e) => { formik.setFieldValue('start_date', e) }}
                                                sx={{ width: '100%' }}
                                                onBlur={formik.handleBlur}
                                                size="small"
                                                borderColor="#D9D9D9"
                                                format="DD/MM-YYYY"
                                                padding={1}
                                                borderThickness="2px"
                                                inputColor="#A0A0A0"
                                                iconVisibility={false}
                                            />
                                            {formik.errors.start_date && formik.touched.start_date && (
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <Typography variant="caption" color="red">{formik.errors.start_date}</Typography>
                                                </Box>
                                            )}


                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'space-between', alignItems: formik.values.start_time === 'custom' ? null : 'center', mt: 2 }}>
                                        {/* <PrimaryHeading text={'Set starting time'} /> */}
                                        <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f', width: { xs: '100%', md: '50%' }, textAlign: { xs: 'left', md: 'right' }, pr: 3 }}>
                                            {t('SpOffers.SetStTime')}
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            // gap: 2,
                                            width: { xs: '100%', md: '50%' },
                                            // maxWidth: '60%',
                                            // '@media (max-width: 1440px)': {
                                            //     maxWidth: '50%',
                                            // },
                                            // '@media (max-width: 900px)': {
                                            //     maxWidth: '40%',
                                            // }
                                        }}>

                                            <CustomTimePicker
                                                disabled={!user?.settings?.crud_special_offers}
                                                value={formik.values.start_time}
                                                onChange={(newTime) => { formik.setFieldValue('start_time', newTime) }}
                                                sx={{ width: '100%' }}
                                            />
                                            {formik.errors.start_time && formik.touched.start_time && (
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <Typography variant="caption" color="red">{formik.errors.start_time}</Typography>
                                                </Box>
                                            )}


                                        </Box>
                                    </Box>
                                </>
                            }



                            {/* {formik.values.endOf_Offer === 'custom' && */}
                            {/* <> */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'space-between', alignItems: formik.values.ending_date === 'custom' ? null : 'center', mt: 2 }}>
                                {/* <PrimaryHeading text={'Set ending date'} /> */}
                                <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f', width: { xs: '100%', md: '50%' }, textAlign: { xs: 'left', md: 'right' }, pr: 3 }}>
                                    {t('SpOffers.SetEndDate')}
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    // gap: 2,
                                    width: { xs: '100%', md: '50%' },
                                }}>

                                    <CustomDatePicker
                                        disabled={!user?.settings?.crud_special_offers}
                                        value={formik.values.ending_date}
                                        onChange={(e) => { formik.setFieldValue('ending_date', e) }}
                                        sx={{ width: '100%' }}
                                        onBlur={formik.handleBlur}
                                        size="small"
                                        borderColor="#D9D9D9"
                                        padding={1}
                                        format="DD/MM-YYYY"
                                        borderThickness="2px"
                                        inputColor="#A0A0A0"
                                        iconVisibility={false}
                                    />
                                    {formik.errors.ending_date && formik.touched.ending_date && (
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography variant="caption" color="red">{formik.errors.ending_date}</Typography>
                                        </Box>
                                    )}


                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'space-between', alignItems: formik.values.ending_time === 'custom' ? null : 'center', mt: 2 }}>
                                <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f', width: { xs: '100%', md: '50%' }, textAlign: { xs: 'left', md: 'right' }, pr: 3 }}>
                                    {t('SpOffers.SetEndTime')}
                                </Typography>



                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: { xs: '100%', md: '50%' },
                                }}>

                                    <CustomTimePicker
                                        disabled={!user?.settings?.crud_special_offers}
                                        value={formik.values.ending_time}
                                        onChange={(newTime) => formik.setFieldValue('ending_time', newTime)}
                                        sx={{ width: '100%' }}
                                    />
                                    {formik.errors.ending_time && formik.touched.ending_time && (
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography variant="caption" color="red">{formik.errors.ending_time}</Typography>
                                        </Box>
                                    )}


                                </Box>
                            </Box>

                            <Grid2 sx={{
                                display: 'flex',
                                justifyContent: 'end',
                             
                                }}>
                                <DeepLinkSwitch  formik={formik}  idtype={'spc'} selectid={selectedSpecialOffer === null ? 0 : selectedSpecialOffer?.id} />
                            </Grid2>
                            {/* </> */}
                            {/* } */}
                        </Grid2>


                        <Grid2 item size={{ xs: 12, md: 6 }}>


                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'flex-end', alignItems: { xs: 'start', md: 'center' }, mt: 2 }}>
                                <Box sx={{ mr: 4, width: { xs: '100%', md: '50%' } }}>
                                    <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t("SpOffers.ChServ")}
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    width: '100%',

                                }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Autocomplete
                                            disabled={type === 'edit' || !user?.settings?.crud_special_offers}
                                            value={formik.values.selectedService}
                                            onChange={handleServiceChange}
                                            options={filteredServices}
                                            getOptionLabel={(option) => option.name}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            fullWidth
                                            popupIcon={<KeyboardArrowDownIcon style={{ color: '#d9d9d9' }} />}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    value={searchService}
                                                    onChange={handleSearchChange}
                                                    placeholder={t("Common.SelectService")}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        mt: 1,
                                                        height: 40,
                                                        fontSize: '0.85rem',
                                                        borderRadius: '13px',
                                                        border: `1px solid #D9D9D9`,
                                                        '& .MuiInputBase-root': { padding: '5px' },
                                                        '& .MuiInputBase-input': {
                                                            color: '#545454',
                                                            fontSize: '14px',
                                                            fontWeight: 400,
                                                        },
                                                        '& .MuiInputBase-input::placeholder': { fontSize: '14px' },
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D9D9D9' },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#D9D9D9' },
                                                        '& .MuiAutocomplete-popupIndicator': { color: '#000' },
                                                    }}
                                                    onFocus={(event) => { event.stopPropagation(); }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <MenuItem
                                                    {...props}
                                                    value={option.id}
                                                    sx={{
                                                        color: '#545454',
                                                        fontSize: '15px',
                                                        fontWeight: 400,
                                                        '&:hover': { backgroundColor: '#f5f5f5' },
                                                    }}
                                                >
                                                    {option.name}
                                                </MenuItem>
                                            )}
                                            noOptionsText={t("SpOffers.NoRes")}
                                            disableClearable
                                        />
                                        {formik.errors.selectedService && formik.touched.selectedService && (
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Typography variant="caption" color="red">{formik.errors.selectedService}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>



                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'flex-end', alignItems: { xs: 'start', md: 'center' }, mt: 2 }}>

                                <Box sx={{ mr: 4, width: { xs: '100%', md: '50%' } }}>
                                    {/* <PrimaryHeading text={'Who has the offer?'} /> */}
                                    <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {`${t("SpOffers.WhOffer")} ?`}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        width: '100%',
                                    }}>
                                    <Select
                                        multiple
                                        fullWidth
                                        value={formik.values.selectedEmployeeIds}
                                        onChange={() => { }}
                                        disabled={formik.values.selectedService == null ? true : false || !user?.settings?.crud_special_offers}
                                        IconComponent={(props) => (
                                            <KeyboardArrowDownIcon style={{ color: '#d9d9d9' }} {...props} />
                                        )}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backgroundColor: '#fff',
                                                    color: '#A0A0A0',
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                },
                                            },
                                        }}
                                        renderValue={(selected = []) => {
                                            const serviceEmployees = formik.values.selectedService ? formik.values.selectedService?.employees : [];

                                            if (selected.length === 0) {
                                                return t("Common.SelectEmployees");
                                            }

                                            if (selected.length === serviceEmployees.length) {
                                                return t("Common.AllEmployees");
                                            }

                                            if (selected.length === 1) {
                                                const selectedEmployee = serviceEmployees.find(employee => employee.id === selected[0]);
                                                return selectedEmployee ? selectedEmployee.name : '';
                                            }

                                            return `${selected.length} ${t("Common.Employees")}`;
                                        }}

                                        sx={{
                                            height: 40,
                                            fontSize: '0.85rem',
                                            borderRadius: '13px',
                                            border: `1px solid #D9D9D9`,
                                            '& .MuiSelect-select': {
                                                color: '#545454',
                                                fontSize: '15px',
                                                fontWeight: 400
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#D9D9D9',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#D9D9D9',
                                            },
                                            '& .MuiSelect-icon': {
                                                color: '#000',
                                            },
                                            backgroundColor: formik.values.selectedService == null ? '#D9D9D9' : 'transparent' == null ? '#D9D9D9' : 'transparent'
                                        }}
                                        displayEmpty
                                    >
                                        {formik.values.selectedService?.employees.length > 1 && (
                                            <MenuItem
                                                value="selectAll"
                                                onClick={() => {
                                                    const allEmployeeIds = formik.values.selectedService?.employees.map((employee) => employee.id);
                                                    if (formik.values.selectedEmployeeIds.length === formik.values.selectedService?.employees.length) {
                                                        formik.setFieldValue('selectedEmployeeIds', []);
                                                    } else {
                                                        formik.setFieldValue('selectedEmployeeIds', allEmployeeIds);
                                                    }
                                                }}
                                                sx={{
                                                    color: '#545454',
                                                    fontSize: '14px',
                                                    fontWeight: 400,
                                                    margin: 0,
                                                    '&:hover': {
                                                        backgroundColor: '#f5f5f5',
                                                    },
                                                }}
                                            >
                                                <Checkbox
                                                    checked={
                                                        formik.values.selectedEmployeeIds.length ===
                                                        formik.values.selectedService?.employees.length
                                                    }
                                                    sx={{
                                                        '&.Mui-checked .MuiSvgIcon-root': {
                                                            backgroundColor: 'transparent',
                                                            borderColor: '#A79C92',
                                                            color: 'green',
                                                        },
                                                    }}
                                                />
                                                {formik.values.selectedEmployeeIds.length ===
                                                    formik.values.selectedService?.employees.length
                                                    ? t("SpOffers.DSelAll")
                                                    : t("SpOffers.SelAll")}
                                            </MenuItem>
                                        )}

                                        {formik.values.selectedService && formik.values.selectedService?.employees.length === 0 ? (
                                            <MenuItem disabled sx={{ color: 'black', fontSize: '15px' }}>
                                                {t("Calendar.NoEmpAvailable")}
                                            </MenuItem>
                                        ) : (
                                            formik.values.selectedService && formik.values.selectedService?.employees.map(employee => (
                                                <MenuItem
                                                    key={employee.id}
                                                    value={employee.id}
                                                    onClick={() => handleEmployeeToggle(employee.id)}
                                                    sx={{
                                                        color: '#545454',
                                                        fontSize: '14px',
                                                        fontWeight: 400,
                                                        margin: 0,
                                                        '&:hover': {
                                                            backgroundColor: '#f5f5f5',
                                                        },
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={formik.values.selectedEmployeeIds.includes(employee.id)}
                                                        sx={{
                                                            '&.Mui-checked .MuiSvgIcon-root': {
                                                                backgroundColor: 'transparent',
                                                                borderColor: '#A79C92',
                                                                color: 'green',
                                                            }
                                                        }}
                                                    />
                                                    {employee.name}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </Box>
                            </Box>



                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'flex-end', alignItems: { xs: 'start', md: 'center' }, mt: 2 }}>
                                <Box sx={{ mr: 4, width: { xs: '100%', md: '50%' } }}>
                                    {/* <PrimaryHeading text={'Standard price'} /> */}
                                    <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t("SpOffers.AddStPR")}
                                    </Typography>
                                </Box>


                                {/* <Box
                                    sx={{
                                        backgroundColor: '#D9D9D9',
                                        width: '50%',
                                        padding: '6px',
                                        borderRadius: '13px',
                                        display: 'flex',
                                        // justifyContent: 'flex-start',
                                        // alignItems: 'center',
                                        border: '1px solid #D9D9D9',
                                        mt: 1.5,
                                    }}
                                > */}
                                <Typography
                                    variant='body1'
                                    sx={{
                                        color: 'black',
                                        border: '1px solid #D9D9D9',
                                        fontWeight: 400,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        width: '100%',
                                        backgroundColor: '#D9D9D9',
                                        borderRadius: '13px',
                                        padding: '6px',
                                    }}
                                >
                                    {`${standardprice} kr.`}
                                </Typography>
                                {/* </Box> */}

                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'flex-end', alignItems: { xs: 'start', md: 'center' }, mt: 2 }}>
                                <Box sx={{ mr: 4, width: { xs: '100%', md: '50%' } }}>
                                    <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t("SpOffers.NewPR")}
                                    </Typography>
                                </Box>

                                <Box sx={{ width: '100%' }}>
                                    <CustomTextField
                                        disabled={formik.values.selectedService == null ? true : false || !user?.settings?.crud_special_offers}
                                        bgColor={formik.values.selectedService == null ? '#D9D9D9' : 'transparent'}
                                        placeholder={t("SpOffers.NewPrPlHLD")}
                                        placeholderFontSize={'15px'}
                                        height={40}
                                        width={'100%'}
                                        value={formik.values.newPrice}
                                        onChange={handleNewPriceChange}
                                    />
                                    {formik.errors.newPrice && formik.touched.newPrice && (
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography variant="caption" color="red">{formik.errors.newPrice}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'flex-end', alignItems: { xs: 'start', md: 'center' }, mt: 2 }}>
                                <Box sx={{ mr: 4, width: { xs: '100%', md: '50%' } }}>
                                    {/* <PrimaryHeading text={'Percentage'} /> */}
                                    <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t("SpOffers.Percentage")}
                                    </Typography>
                                </Box>

                                <Box sx={{ width: '100%' }}>
                                    <CustomTextField
                                        disabled={formik.values.selectedService == null ? true : false || !user?.settings?.crud_special_offers}
                                        bgColor={formik.values.selectedService == null ? '#D9D9D9' : 'transparent'}
                                        placeholder={t("SpOffers.PerPlHLD")}
                                        placeholderFontSize={'15px'}
                                        height={40}
                                        width={'100%'}
                                        value={formik.values.percentage}
                                        onChange={handlePercentageChange}
                                    />
                                    {formik.errors.percentage && formik.touched.percentage && (
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography variant="caption" color="red">{formik.errors.percentage}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                        </Grid2>

                    </Grid2>

                </form>

                {user?.settings?.crud_special_offers &&
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: { xs: '100%', md: '25%' },
                        height: '100%',
                        mt: 4,
                        mx: 'auto'
                    }}>
                        <CommonButton
                            width="100%"
                            height="40px"
                            backgroundColor={'#44B904'}
                            onClick={formik.handleSubmit}
                            title={type == 'edit' ? t("SpOffers.UpSingleOff") : t("SpOffers.AddSingleOff")}
                        />
                    </Box>}

            </Paper>

        </Modal >
    )
}

export default AddSpecialOfferModal;
