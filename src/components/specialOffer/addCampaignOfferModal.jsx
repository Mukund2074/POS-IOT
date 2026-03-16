import React, { useState, useEffect } from 'react';
import { Box, Modal, TextField, IconButton, FormControl, Autocomplete, Typography, Divider, ListSubheader, Grid2, Paper, Stack } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import { useForm, useFieldArray } from 'react-hook-form';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { DeepLinkSwitch } from "../service/DeepLinkSwitch";
import axios from 'axios';
import { toast } from "react-toastify";

import CustomTextField from '../settings/commonTextinput';
import CommonButton from '../settings/commonButton';
import SecondaryHeading from '../settings/commonSecondaryHeading';
import DeleteIcon from "../../assets/DeleteIcon.png";
import CustomDatePicker from '../settings/commonDatePicker';
import CustomTimePicker from '../settings/commonTimePicker';

import { useFormik } from "formik";
import * as Yup from "yup";

import moment from 'moment';
import FSelect from '../commonComponents/F_Select';
import { t } from 'i18next';

// const style = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: '75%',
//     // maxWidth: 'lg',
//     bgcolor: '#FFFFFF',
//     borderRadius: 3,
//     boxShadow: 0,
//     p: 3.5,
// };

function AddCampaignOfferModal(props) {
    const { user, open, handleClose, selectedCampaignOffer, type } = props;

    const authTokenUser = localStorage.getItem('auth_token');
     // const [isLoading, setLoading] = useState(false);
    const [serviceList, setServiceList] = useState([]);
    const [searchText, setSearchText] = useState('');

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
        campaignTitle: '',
        isActive: false
    });

    const { control, register, setValue, getValues, watch } = useForm({
        defaultValues: {
            services: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'services',
    });



    watch('services', fields); 







    useEffect(() => {
        if (type == 'edit') {
            const startDate = new Date(selectedCampaignOffer?.start_datetime);
            const endDate = new Date(selectedCampaignOffer?.end_datetime);

            formik.setValues({
                start_date: moment(startDate),
                start_time: moment(startDate),
                ending_date: moment(endDate),
                ending_time: moment(endDate),
                campaignTitle: selectedCampaignOffer?.title,
                marketplace_hidden : selectedCampaignOffer.marketplace_hidden || false,
            });



            selectedCampaignOffer?.services.forEach(item => {
                const service = item.service;
                const selectedEmployeeIds = item.employees.map(emp => emp.id);
                append({
                    id1: item.id,
                    serviceId: service.id,
                    newPrice: service.special_price,
                    percentage: service.special_percentage,
                    oldPrice: service.price,
                    dropdownValue: '',
                    employeeId: selectedEmployeeIds,
                    serviceName: service.name,
                    employees: service.employees || [],
                });
            });

        }
    }, [selectedCampaignOffer]);

    useEffect(() => {
        fetchServiceApi();
    }, []);

    const transformServiceList = (data) => {

        const filteredData = data.map(group => ({
            ...group,
            services: group.services.filter(service => {
                return !fields.some(field => field.serviceId === service.id);
            })
        }));

        const groupedServices = filteredData
            .filter(group => group.id !== 0)
            .map(group => ({
                title: group.group,
                groupId: group.id,
                data: group.services.length > 0 ? group.services : [{ name: t("SpOffers.NoServ"), groupId: group.id }],
            }));

        const ungroupedServices = filteredData
            .filter(group => group.id === 0)
            .flatMap(group => group.services)
            .map(service => ({
                ...service,
                groupId: 0,
            }));

        return [
            {
                title: t("Calendar.ServicesWithoutGroup"),
                groupId: 0,
                data: ungroupedServices.length > 0 ? ungroupedServices : [{ name: t("SpOffers.NoServ"), groupId: 0 }],
            },
            ...groupedServices,
        ];
    };

    async function fetchServiceApi() {
        // setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_URL}/api/v1/store/service_group`, {
                headers: {
                    Authorization: `Bearer ${authTokenUser}`
                }
            });

            if (response) {
                setServiceList(transformServiceList(response.data.data));
                // setLoading(false);
            } else {
                setServiceList([]);
                // setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching service data:", error);
            setServiceList([]);
            // setLoading(false);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceApi();
    }, [fields.length]);

    const handleServiceSelect = (service) => {
        const updatedServices = serviceList.map(group => ({
            ...group,
            data: group.data.filter(serviceItem => serviceItem.id !== service.id),
        }));

        setServiceList(updatedServices);

        append({
            serviceId: service.id,
            newPrice: '',
            oldPrice: service.price,
            dropdownValue: '',
            employeeId: [],
            serviceName: service.name,
            employees: service.employees || [],
            percentage: ''
        });
    };

    const resetFields = (command) => {
        handleClose(command);
    };

    const handleCloseModal = (event, reason) => {
        if (reason === 'backdropClick') {
            return;
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

        campaignTitle: Yup.string()
            .required(t('SpOffers.YupErrCampaignTitleRequired')),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: async (values) => {

            const updatedFields = getValues('services');

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

            if (updatedFields.length == 0) {
                toast.error(t("SpOffers.ToastErrOneServ"));
                return;
            }

            const specialOffers = updatedFields.map(field => {
                const serviceId = field.serviceId;
                const specialPrice = Number(field.newPrice);

                let formattedPercentage = Number(field.percentage);
                if (isNaN(formattedPercentage)) {
                    formattedPercentage = parseFloat(field.percentage);
                }

                formattedPercentage = formattedPercentage % 1 === 0
                    ? formattedPercentage
                    : formattedPercentage.toFixed(2).replace('.00', '');

                const employeeIds = field.employeeId;

                if (!specialPrice || !formattedPercentage) {
                    toast.error(t("SpOffers.ToastErrPrPer"));
                    return true;
                }

                return type === 'edit' && selectedCampaignOffer?.services?.length > 0 ? {
                    service_id: serviceId,
                    special_price: specialPrice,
                    special_percentage: formattedPercentage,
                    employee_ids: employeeIds,
                    id: field.id1
                } : {
                    service_id: serviceId,
                    special_price: specialPrice,
                    special_percentage: formattedPercentage,
                    employee_ids: employeeIds
                }
            }).filter(offer => offer !== null);


            if (specialOffers.length === 0) {
                return;
            }

            try {
                const data = {
                    campaign_name: values.campaignTitle,
                    start_datetime: `${startDate} ${startTime}`,
                    end_datetime: `${endDate} ${endTime}`,
                    special_offers: specialOffers,
                    marketplace_hidden: values.marketplace_hidden,
                };


                let response;

                if (type === 'create') {
                    response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/store/campaign`, data, {
                        headers: {
                            Authorization: `Bearer ${authTokenUser}`
                        }
                    });

                    if (response.status === 200) {
                        toast.success(t("SpOffers.ToastSCmpOffCr"));
                        resetFields('callApi');
                    } else {
                        toast.error(t("SpOffers.ToastErrCmpCr"));
                    }

                } else if (type === 'edit') {
                    response = await axios.patch(`${process.env.REACT_APP_URL}/api/v1/store/campaign/${selectedCampaignOffer?.groupId}`, data, {
                        headers: {
                            Authorization: `Bearer ${authTokenUser}`
                        }
                    });

                    if (response.status === 200) {
                        toast.success(t("SpOffers.ToastSUpCmpOff"));
                        resetFields('callApi');
                    } else {
                        toast.error(t("SpOffers.ToastErrCmpUp"));
                    }

                } else {
                    toast.error(t("SpOffers.ToastErrCmpOff"));
                }

            } catch (error) {
                console.error(`Error while ${type} capaign offer:`, error);
            }
            // finally {
            //     setLoading(false);
            // }
        }
    });


    const handleCheckboxChange = (e, index) => {
        const selectedValues = e.target.value; // get the selected values from the event


        const updatedFields = getValues('services').map((field, i) => {
            if (i === index) {
                const currentEmployeeIds = field.employeeId || [];
                let updatedEmployeeIds;

                // If the selected value is 0 or contains 0, handle the select-all behavior
                if (((selectedValues.includes(0)) && (fields[index].employeeId.length == fields[index].employees.length))) {
                    updatedEmployeeIds = []; // Deselect all if all are selected
                } else if (selectedValues.includes(0)) {
                    updatedEmployeeIds = fields[index]?.employees.map((empObj) => empObj?.id); // Select all employees
                } else if (fields[index].employeeId.length == fields[index].employees.length) {
                    updatedEmployeeIds = []; // Deselect all
                } else {
                    updatedEmployeeIds = selectedValues; // Update employee IDs with selected ones
                }

                return {
                    ...field,
                    employeeId: updatedEmployeeIds,
                };
            }
            return field;

        });



        setValue('services', updatedFields);
    };

    const allServices = serviceList.flatMap((groupData) =>
        groupData.data.map((service) => ({
            ...service,
            group: groupData.title,
        }))
    );

    const handleSearchInputChange = (event, value) => {
        setSearchText(value);
    };

    const filteredOptions = allServices.filter((service) =>
        service.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Modal
            open={open}
            disableAutoFocus
            onClose={handleCloseModal}
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

                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
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
                </Box>


                <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f1f1f', textAlign: 'center', mb: 4 }}>
                    {type == 'edit' ? t("SpOffers.UpCmp") : t("SpOffers.CrCmp")}
                </Typography>

                <form onReset={() => formik.resetForm()} onSubmit={formik.handleSubmit}>

                    <Grid2 container spacing={3}>

                        <Grid2 size={{ xs: 12, md: 3 }}>


                            {!formik.values.isActive &&
                                <>
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'space-between', alignItems: formik.values.start_date === 'custom' ? null : 'center', mt: 2 }}>
                                        <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f', width: { xs: '100%', md: "50%" }, textAlign: { xs: 'left', md: 'right' }, pr: 3 }}>
                                            {t("SpOffers.SetStDate")}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                // width: '100%',
                                                width: { xs: '100%', md: '50%' },

                                            }}>

                                            <CustomDatePicker
                                                disabled={!user?.settings?.crud_special_offers}
                                                value={formik.values.start_date}
                                                onChange={(e) => { formik.setFieldValue('start_date', e) }}
                                                sx={{ width: '100%' }}
                                                onBlur={formik.handleBlur}
                                                format="DD/MM-YYYY"
                                                size="small"
                                                borderColor="#D9D9D9"
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
                                        <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f', width: { xs: '100%', md: "50%" }, textAlign: { xs: 'left', md: 'right' }, pr: 3 }}>
                                            {t("SpOffers.SetStTime")}
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            // gap: 2,
                                            width: { xs: '100%', md: '50%' },
                                            // maxWidth: '50%',
                                            // '@media (max-width: 1440px)': {
                                            //     maxWidth: '40%',
                                            // },
                                            // '@media (max-width: 900px)': {
                                            //     maxWidth: '30%',
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
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'space-between', alignItems: formik.values.ending_date === 'custom' ? null : 'center', mt: 2 }}>
                                <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f', width: { xs: '100%', md: "50%" }, textAlign: { xs: 'left', md: 'right' }, pr: 3 }}>
                                    {t("SpOffers.SetEndDate")}
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: { xs: '100%', md: '50%' },
                                    // maxWidth: '50%',
                                    // '@media (max-width: 1440px)': {
                                    //     maxWidth: '40%',
                                    // },
                                    // '@media (max-width: 900px)': {
                                    //     maxWidth: '30%',
                                    // }
                                }}>

                                    <CustomDatePicker
                                        disabled={!user?.settings?.crud_special_offers}
                                        value={formik.values.ending_date}
                                        onChange={(e) => { formik.setFieldValue('ending_date', e) }}
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
                                    {formik.errors.ending_date && formik.touched.ending_date && (
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography variant="caption" color="red">{formik.errors.ending_date}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', justifyContent: 'space-between', alignItems: formik.values.ending_time === 'custom' ? null : 'center', mt: 2 }}>
                                <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f', width: { xs: '100%', md: "50%" }, textAlign: { xs: 'left', md: 'right' }, pr: 3 }}>
                                    {t("SpOffers.SetEndTime")}
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: { xs: '100%', md: '50%' },
                                    // maxWidth: '50%',
                                    // '@media (max-width: 1440px)': {
                                    //     maxWidth: '40%',
                                    // },
                                    // '@media (max-width: 900px)': {
                                    //     maxWidth: '30%',
                                    // }
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

                        </Grid2 >

                        <Grid2 size={{ xs: 12, md: 9 }}>

                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 3 }}>
                                <Typography variant='body1' sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t("SpOffers.Cmp")}
                                </Typography>
                            </Box>

                            <Box sx={{
                                height: 45,
                                backgroundColor: '#D9D9D9',
                                borderRadius: '13px',
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <CustomTextField
                                    disabled={!user?.settings?.crud_special_offers}
                                    value={formik.values.campaignTitle}
                                    onChange={(e) => formik.setFieldValue('campaignTitle', e.target.value)}
                                    placeholder={t("SpOffers.CmpTitle")}
                                    mt={0}
                                    ml={3}
                                    height={40}
                                    borderRadius={'20px'}
                                    width={'40%'}
                                />
                            </Box>

                            {formik.errors.campaignTitle && formik.touched.campaignTitle && (
                                <Box sx={{ display: "flex", alignItems: "center", width: '90%' }}>
                                    <Typography variant="caption" color="red">{formik.errors.campaignTitle}</Typography>
                                </Box>
                            )}

                            <Box >

                                {fields.length > 0 && (

                                    <Box
                                        sx={{
                                            display: { xs: 'none', md: 'flex' },
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                            mt: 2,
                                            height: 0,
                                            border: '1.5px solid transparent',
                                            borderRadius: '12px',
                                            padding: '8px',
                                            backgroundColor: '#fff',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '24%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                '@media (max-width: 1440px)': { width: '30%' },
                                                '@media (max-width: 900px)': { width: '40%' },
                                            }}
                                        >
                                            <SecondaryHeading text={''} fontColor={'#A0A0A0'} />
                                        </Box>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 400,
                                                color: '#1F1F1F',
                                                width: '10%',
                                                '@media (max-width: 1440px)': { width: '12%' },
                                                '@media (max-width: 900px)': { width: '18%' },
                                            }}>
                                            {t("SpOffers.Percentage")}
                                        </Typography>

                                        {/* <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                '@media (max-width: 1440px)': { mr: 2 },
                                                '@media (max-width: 900px)': { mr: 2 },
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 400,
                                                    color: '#d50f0f',
                                                }}
                                            >
                                                {''}
                                            </Typography>
                                        </Box> */}

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: '15%',
                                                '@media (max-width: 1440px)': { width: '15%' },
                                                '@media (max-width: 900px)': { width: '25%', marginBottom: '8px' },
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 400,
                                                    color: '#1F1F1F',
                                                    mr: 2
                                                }}>
                                                {t("SpOffers.OldPr")}
                                            </Typography>
                                        </Box>


                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 400,
                                                color: '#1F1F1F',
                                                width: '13%',
                                                '@media (max-width: 1440px)': { width: '15%' },
                                                '@media (max-width: 900px)': { width: '18%' },
                                                ml: 1
                                            }}>
                                            {t("SpOffers.NewPr")}
                                        </Typography>

                                        {/* <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                '@media (max-width: 1440px)': { mr: 2 },
                                                '@media (max-width: 900px)': { mr: 2 },
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 400,
                                                    color: '#d50f0f',
                                                }}
                                            >

                                            </Typography>
                                        </Box> */}

                                        <FormControl sx={{ width: '20%' }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 400,
                                                    color: '#1F1F1F',
                                                    '@media (max-width: 1440px)': { width: '110%', mr: 2 },
                                                    '@media (max-width: 900px)': { width: '120%', mr: 2 },
                                                }}>
                                                {t("SpOffers.WhOffPr")}?
                                            </Typography>
                                        </FormControl>

                                        <Box sx={{ width: '17px' }} />
                                    </Box>

                                )}

                                {fields.map((field, index) => (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', md: 'row' },
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                            height: { xs: '100%', md: 43 },
                                            border: '1.5px solid #ddd',
                                            borderRadius: '12px',
                                            padding: '8px',
                                            backgroundColor: '#fff',
                                            mt: { xs: 2, md: 0 },
                                            // gap: { xs: 2, md: 0 }
                                        }}
                                    >
                                        <Box
                                            id={`services.${index}.serviceName`}
                                            sx={{
                                                width: { xs: '100%', md: '23%' },
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                // whiteSpace: 'nowrap',
                                                // '@media (max-width: 1440px)': {
                                                //     width: '30%',
                                                // },
                                                // '@media (max-width: 900px)': {
                                                //     width: '40%',
                                                // },
                                            }}
                                        >
                                            <SecondaryHeading sx={{ textAlign: { xs: 'center', md: 'start' } }} text={field.serviceName} fontColor={'#A0A0A0'} />
                                        </Box>

                                        <Divider
                                            sx={{
                                                display: { xs: 'block', md: 'none' },
                                                width: '100%',
                                                borderWidth: 1,
                                                borderColor: '#000'
                                            }}
                                        />

                                        <React.Fragment id={`services.${index}.percentage`}>
                                            <Typography
                                                display={{ xs: 'block', md: 'none' }}
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 400,
                                                    color: '#1F1F1F',
                                                    mt: 2,
                                                    width: { xs: '100%', md: '10%', },
                                                    // '@media (max-width: 1440px)': { width: '12%' },
                                                    // '@media (max-width: 900px)': { width: '18%' },
                                                }}>
                                                {t("SpOffers.Percentage")}
                                            </Typography>

                                            <Box

                                                sx={{
                                                    width: { xs: '100%', md: '23%' },
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center', gap: 1
                                                }}
                                            >
                                                <TextField
                                                    {...register(`services.${index}.percentage`)}
                                                    name={`services.${index}.percentage`}
                                                    // inputRef={register({ required: true })}
                                                    disabled={!user?.settings?.crud_special_offers}
                                                    size="small"
                                                    onKeyPress={(e) => {
                                                        const regex = /^[0-9]/;
                                                        if (!regex.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
                                                            e.preventDefault();
                                                        }

                                                    }}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        if (value === '') {
                                                            setValue(`services.${index}.newPrice`, '');
                                                        } else {
                                                            const percentage = parseFloat(value);
                                                            let newPrice = field.oldPrice
                                                            if (percentage > 100) {
                                                                setValue(`services.${index}.percentage`, 100)
                                                                newPrice = 0;

                                                            } else {
                                                                setValue(`services.${index}.percentage`, value);
                                                                newPrice = (field.oldPrice - (field.oldPrice * (percentage / 100)));

                                                            }


                                                            setValue(`services.${index}.newPrice`, newPrice.toFixed(2));
                                                        }
                                                    }}
                                                    placeholder='0.0%'
                                                    sx={{
                                                        border: '1.5px solid #D9D9D9',
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            border: 'none',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#D9D9D9',
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#D9D9D9',
                                                        },
                                                        '& input': {
                                                            color: 'black',
                                                            fontSize: '0.8rem',
                                                            padding: '5px',
                                                        },
                                                        '& input::placeholder': {
                                                            color: '#747474',
                                                            fontSize: '0.8rem',
                                                            opacity: 1,
                                                        },
                                                        width: { xs: '100%' },
                                                        height: 30,
                                                        backgroundColor: 'white',
                                                        borderRadius: '12px',
                                                        // '@media (max-width: 1440px)': {
                                                        //     width: '12%',
                                                        // },
                                                        // '@media (max-width: 900px)': {
                                                        //     width: '18%',
                                                        // },
                                                    }}
                                                />


                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 400,
                                                        color: '#d50f0f',
                                                    }}
                                                >
                                                    %
                                                </Typography>
                                            </Box>
                                        </React.Fragment>

                                        <Box
                                            id={`services.${index}.oldPrice`}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                flexDirection: { xs: ' column', md: 'row' },
                                                alignItems: { xs: 'start', md: 'center' },
                                                width: { xs: '100%', md: '15%' },
                                                mt: { xs: 2, md: 0 },
                                                ml: { xs: 0, md: 3 }
                                                // '@media (max-width: 1440px)': {
                                                //     width: '15%',
                                                // },
                                                // '@media (max-width: 900px)': {
                                                //     width: '25%',
                                                //     marginBottom: '8px',
                                                // },
                                            }}
                                        >
                                            <Typography
                                                display={{ xs: 'block', md: 'none' }}
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 400,
                                                    color: '#1F1F1F',
                                                    mr: 2
                                                }}>
                                                {t("SpOffers.OldPr")}
                                            </Typography>
                                            <SecondaryHeading
                                                text={`${field.oldPrice} kr`}
                                                fontColor={'#A0A0A0'}
                                                sx={{
                                                    fontSize: '1rem',
                                                    width: '100%',
                                                    border: { xs: '1px solid #D9D9D9', md: 'none' },
                                                    py: { xs: 0.5, md: '0' },
                                                    px: { xs: 1.5, md: '0' },
                                                    borderRadius: { xs: 2, md: '0' },
                                                    // '@media (max-width: 1440px)': {
                                                    //     fontSize: '0.9rem',
                                                    // },
                                                    // '@media (max-width: 900px)': {
                                                    //     fontSize: '0.85rem',
                                                    // },
                                                }}
                                            />
                                        </Box>


                                        <React.Fragment id={`services.${index}.newPrice`}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: { xs: 'block', md: 'none' },
                                                    fontWeight: 400,
                                                    color: '#1F1F1F',
                                                    width: '100%',
                                                    ml: 1,
                                                    mt: { xs: 2, md: 0 }
                                                }}>
                                                {t("SpOffers.NewPr")}
                                            </Typography>
                                            <Stack sx={{ display: 'flex', flexDirection: 'row' }} width={{ xs: '100%', md: '15%' }} >

                                                <TextField
                                                    {...register(`services.${index}.newPrice`)}
                                                    name={`services.${index}.newPrice`}
                                                    size="medium"
                                                    disabled={!user?.settings?.crud_special_offers}
                                                    // onChange={(e) => handlePriceChange(e, index, field, 'newPrice')}
                                                    onKeyPress={(e) => {
                                                        const regex = /^([0-9]+(\.[0-9])?)/;
                                                        if (!regex.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        if (value === '') {
                                                            setValue(`services.${index}.newPrice`, '');
                                                        } else {

                                                            let newPrice = parseFloat(value);


                                                            let percentage = 0
                                                            if (newPrice > field?.oldPrice) {
                                                                percentage = 100
                                                                setValue(`services.${index}.newPrice`, field?.oldPrice);
                                                                percentage = 0;

                                                            } else {

                                                                setValue(`services.${index}.newPrice`, newPrice);
                                                                percentage = ((field.oldPrice - newPrice) / field.oldPrice) * 100;
                                                            }


                                                            setValue(`services.${index}.percentage`, percentage.toFixed(2));




                                                        }
                                                    }}


                                                    placeholder='0.00'
                                                    sx={{
                                                        border: '1.5px solid #D9D9D9',
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            border: 'none',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#D9D9D9',
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#D9D9D9',
                                                        },
                                                        '& input': {
                                                            color: 'black',
                                                            fontSize: '1rem',
                                                            padding: '5px',
                                                        },
                                                        '& input::placeholder': {
                                                            color: '#747474',
                                                            fontSize: '1rem',
                                                            opacity: 1,
                                                        },
                                                        width: "100%",
                                                        backgroundColor: 'white',
                                                        borderRadius: '12px',
                                                        // '@media (max-width: 1440px)': {
                                                        //     width: '15%',
                                                        // },
                                                        // '@media (max-width: 900px)': {
                                                        //     width: '18%',
                                                        // },
                                                    }}
                                                />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 400,
                                                        color: '#367B3D',
                                                    }}
                                                >
                                                    Kr.
                                                </Typography>
                                            </Stack>
                                        </React.Fragment>



                                        <FormControl
                                            id={`services.${index}.employeeId`}
                                            sx={{
                                                width: { xs: "100%", md: '20%' },
                                                mt: { xs: 2, md: 0 },
                                                ml: { xs: 0, md: 2 }
                                            }}>

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 400,
                                                    color: '#1F1F1F',
                                                    width: '100%',
                                                    display: { xs: 'block', md: 'none' }
                                                    // '@media (max-width: 1440px)': { width: '110%', mr: 2 },
                                                    // '@media (max-width: 900px)': { width: '120%', mr: 2 },
                                                }}>
                                                {t("SpOffers.WhOffPr")}?
                                            </Typography>
                                            <FSelect
                                                disabled={!user?.settings?.crud_special_offers}
                                                name={`services.${index}.employeeId`}
                                                value={field.employeeId}
                                                TextToDisplayWithCount={t("SpOffers.EmpSel")}
                                                onChange={(e) => { handleCheckboxChange(e, index) }}
                                                isMultiSelect
                                                options={[
                                                    // { label: 'All employees', value: 0   },
                                                    ...getValues('services')[index].employees.map((emp) => ({
                                                        label: emp.name,
                                                        value: emp.id,
                                                    })),
                                                ]}
                                            />


                                        </FormControl>

                                        {user?.settings?.crud_special_offers &&
                                            <IconButton disableRipple onClick={() => { remove(index) }}>
                                                <img
                                                    src={DeleteIcon}
                                                    alt="Delete"
                                                    style={{ width: '17px', height: '19px', marginLeft: '@media (max-width: 1440px)' ? 10 : 0 }}
                                                />
                                            </IconButton>}
                                    </Box>
                                ))}

                                <Autocomplete
                                    popupIcon={<KeyboardArrowDownIcon style={{ color: '#d9d9d9' }} />}
                                    value={null}
                                    disabled={!user?.settings?.crud_special_offers}
                                    options={filteredOptions}
                                    getOptionLabel={(option) => option.name}
                                    inputValue={searchText}
                                    onInputChange={handleSearchInputChange}
                                    groupBy={(option) => option.group}
                                    fullWidth
                                    // disabled={type === 'edit'}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            placeholder={`+ ${t("Services.AddService")}`}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                mt: 2,
                                                height: 40,
                                                fontSize: '0.85rem',
                                                borderRadius: '13px',
                                                border: `1px solid #D9D9D9`,
                                                '& .MuiInputBase-root': {
                                                    padding: '5px',
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: '#545454',
                                                    fontSize: '15px',
                                                    fontWeight: 400,
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
                                                '& .MuiAutocomplete-popupIndicator': {
                                                    color: '#000',
                                                },
                                                width: '100%',
                                                '& .MuiInputBase-input::placeholder': {
                                                    color: '#A0A0A0',
                                                    fontSize: '14px',
                                                    fontWeight: 400
                                                },
                                            }}
                                        />
                                    }
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    renderOption={(props, option) => (
                                        <>
                                            <li
                                                {...props}
                                                key={option.id}
                                                value={option.id}
                                                onClick={(e) => {
                                                    if (option.name !== t("SpOffers.NoServ")) {
                                                        handleServiceSelect(option);
                                                    }
                                                    e.preventDefault();
                                                }}
                                            >
                                                {/* <Typography
                                                    sx={{
                                                        color: '#545454',
                                                        fontSize: '14px',
                                                        fontWeight: 400,
                                                    }}
                                                > */}
                                                <Typography variant="body1" color='#545454'>
                                                    {option.name}
                                                </Typography>
                                            </li>
                                            <Divider sx={{ margin: '8px 0' }} />
                                        </>
                                    )}
                                    renderNoOptions={(props) => (
                                        <Box {...props} sx={{ padding: 1 }}>
                                            <Typography variant="body1" color="error" align="center">
                                                {t("SpOffers.NoRes")}
                                            </Typography>
                                        </Box>
                                    )}
                                    renderGroup={(params) => (
                                        <li>
                                            <ListSubheader
                                                component="div"
                                                sx={{
                                                    fontWeight: '700',
                                                    fontSize: '18px',
                                                    color: '#1F1F1F',
                                                    '&.Mui-disabled': {
                                                        color: '#1F1F1F',
                                                    },
                                                    position: 'relative',
                                                }}
                                            >
                                                {params.group}
                                            </ListSubheader>
                                            <Divider sx={{ margin: '8px 0' }} />
                                            {params.children}
                                        </li>
                                    )}
                                />

                            </Box>
                         
                            <Grid2>
                                <DeepLinkSwitch  formik={formik} idtype={'cmp'} selectid={ selectedCampaignOffer === null ? 0 : selectedCampaignOffer?.groupId}        />
                            </Grid2>

                        </Grid2 >

                    </Grid2>

                </form>

                {user?.settings?.crud_special_offers && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        marginTop: 4
                    }}>
                        <CommonButton
                            width={{ xs: '100%', sm: '40%' }}
                            height="40px"
                            backgroundColor={'#44B904'}
                            onClick={formik.handleSubmit}
                            title={type == 'edit' ? t("SpOffers.UpCmp") : t("SpOffers.AddCmp")}
                        />
                    </Box>
                )}
            </Paper>

        </Modal >
    )
}

export default AddCampaignOfferModal;
