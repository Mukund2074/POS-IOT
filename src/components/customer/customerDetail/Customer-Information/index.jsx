import { Grid2, InputAdornment, Stack, Tooltip, Typography, Button, AppBar, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FTextInput from '../../../commonComponents/F_TextInput';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import FButton from '../../../commonComponents/F_Button';
import FTextArea from '../../../commonComponents/F_TextArea';
import LockIcon from '../../../../assets/lock.png';
import moment from 'moment';
import apiFetcher from '../../../../utils/interCeptor';
import { HttpStatusCode } from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import CustomDeleteModal from '../../../deleteAlertModal';
import FSelect from '../../../commonComponents/F_Select';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
import Upload from '../../../../assets/uploadFile.svg';
import { BlockCustomerApi, DeleteCustomerApi } from '../../../../utils/Api/Customer';
import { useMode } from '../../../../theme';
import FPhonePicker from '../../../commonComponents/F_PhonePicker';
import { CountryList } from '../../../../data/CountryList';
import { useCustomer } from '../../../../context/customer/CustomerContext';
import CustomerCards from './CustomerCards';
import AttachmentsList from './AttachmentsList';
import { formatPrice } from '../../../../scenes/POS/Core/pos.utils';
import FSwitch from '../../../commonComponents/f-switch';

const dateObject = {
    dates: Array.from({ length: 31 }, (_, i) => i + 1),
    months: Array.from({ length: 12 }, (_, i) => i + 1),
    years: Array.from({ length: 100 }, (_, i) => moment().year() - i),
};

const CustomerInformation = () => {
    const [theme] = useMode();

    const navigate = useNavigate();

    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [isChanges, setIsChanges] = useState(false);
    const [havePermission, setHavePermission] = useState(false);
    const [deleteCustomerModel, setDeleteCustomerModel] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [deletedFileIds, setDeletedFileIds] = useState([]);
    const [selectedDate, setSelectedDate] = useState({
        day: '',
        month: '',
        year: '',
    });
    const { id } = useParams();
    const [customer, setCustomer] = useState({});
    const [phoneLength, setPhoneLength] = useState({
        phone1: { maxLength: 11, minLength: 11 },
        phone2: { maxLength: 11, minLength: 11 },
    });
    const [blockCustomerModal, setBlockCustomerModal] = useState(false);
    const isEdit = id !== 'create' && id;
    const user = useSelector((state) => state.user.data);
    const [BlockCustomerLoading, setBlockCustomerLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    const { customer: customerData, customerSaleDetails, loading } = useCustomer();

    useEffect(() => {
        if (customerData && isEdit) {
            setCustomer(customerData);
            setIsBlocked(customerData?.block_booking);
            setInitialValues({
                ...customerData,
                block_booking: customerData?.block_booking,
            });
            setUploadedFiles(customerData?.attachment_objs);
        }
    }, [customerData, isEdit]);

    useEffect(() => {
        if (user && (user?.settings?.edit_customers || user?.role === 'ADMIN')) {
            setHavePermission(true);
        }
    }, [user]);

    useEffect(() => {
        if (selectedDate && selectedDate.year && selectedDate.month && selectedDate.day) {
            const formattedDate = `${selectedDate.year}-${
                selectedDate.month < 10 ? `0${selectedDate.month}` : selectedDate.month
            }-${selectedDate.day < 10 ? `0${selectedDate.day}` : selectedDate.day}`;
            formik.setFieldValue('birthday', formattedDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const isLeapYear = (year) => moment(`${year}-02-29`, 'YYYY-MM-DD').isValid();

    const getDisabledMonths = () => {
        const { day } = selectedDate;
        if (!day) return [];
        if (day === 30) return [2];
        if (day === 31) return [2, 4, 6, 9, 11];
        return [];
    };

    const getDisabledYears = () => {
        const { day, month } = selectedDate;
        if (day === 29 && month === 2) {
            return dateObject.years.filter((year) => !isLeapYear(year));
        }
        return [];
    };

    const mapOptions = (array, disabledItems = []) => {
        return array.map((item) => ({
            value: item,
            label: item,
            disabled: disabledItems.includes(item),
        }));
    };

    const handleSelectDate = ({ date, type }) => {
        if (type === 'day') {
            setSelectedDate((prevState) => ({
                ...prevState,
                month: 0,
                year: 0,
            }));
        }
        if (type === 'month') {
            setSelectedDate((prevState) => ({
                ...prevState,
                year: 0,
            }));
        }
        setSelectedDate((prevState) => ({
            ...prevState,
            [type]: date,
        }));
    };

    useEffect(() => {
        if (customer?.birthday) {
            setSelectedDate({
                day: moment(customer.birthday).date(),
                month: moment(customer.birthday).month() + 1,
                year: moment(customer.birthday).year(),
            });
        }
    }, [customer?.birthday]);

    const validationSchema = Yup.object({
        name: Yup.string().required(t('Customer.CustomerNameError')),
        address: Yup.string().nullable(),
        email: Yup.string().email(t('Customer.EmailError')).nullable(),
        zip_code: Yup.string().nullable(),
        city: Yup.string().nullable(),
        country_code: Yup.string().nullable(),
        country_code2: Yup.string().nullable(),
        phone_number: Yup.string()
            .required(t('Customer.PhoneNumberError'))
            .matches(
                new RegExp(`^\\d{${phoneLength?.phone1?.minLength},${phoneLength?.phone1?.maxLength}}$`),
                `${t('Customer.InvalidPhone')}`,
            )
            .typeError(t('Customer.PhoneNumberTypeError')),
        marketplace_pointer: Yup.string().nullable(),
        note: Yup.string().nullable(),
        phone_number2: Yup.string()
            // .matches(/^\d{8}$/, t('Customer.PhoneNumber2Invalid'))
            .matches(
                new RegExp(`^\\d{${phoneLength?.phone2?.minLength},${phoneLength?.phone2?.maxLength}}$`),
                `${t('Customer.InvalidPhone')}`,
            )
            .typeError(t('Customer.PhoneNumber2TypeError'))
            .nullable()
            .notRequired(),
        birthday: Yup.string()
            .nullable()
            .notRequired()
            .matches(/^\d{4}-\d{2}-\d{2}$/, t('Customer.BirthdayInvalidFormat'))
            .test('is-valid-date', t('Customer.BirthdayInvalidDate'), (value) => {
                return (
                    !value ||
                    (moment(value, 'YYYY-MM-DD', true).isValid() &&
                        moment(value, 'YYYY-MM-DD', true).format('YYYY-MM-DD') === value)
                );
            })
            .max(new Date(), t('Customer.BirthdayMaxDate')),

        cpr: Yup.string().nullable().min(11, t('Customer.CprError')),
        attachments: Yup.array().nullable(),
        isBlocked: Yup.boolean(),
        marketing_permission: Yup.boolean(),
    });

    const [initialValues, setInitialValues] = useState({
        name: customer?.name || '',
        address: customer?.address || '',
        email: customer?.email || '',
        zip_code: customer?.zip_code || '',
        city: customer?.city || '',
        phone_number: customer?.phone_number || '',
        marketplace_pointer: customer?.marketplace_pointer || '',
        note: customer?.note || '',
        phone_number2: customer?.phone_number2 || '',
        birthday: customer?.birthday || null,
        cpr: customer?.cpr || '',
        attachments: customer?.attachments || [],
        country_code: customer?.country_code ?? '+45',
        country_code2: customer?.country_code2 ?? '+45',
        country_iso_code: customer?.country_iso_code || 'DK',
        country_iso_code2: customer?.country_iso_code2 || 'DK',
        isBlocked: customer?.block_booking,
        bonus: customer?.bonus || 0,
        marketing_permission: customer?.marketing_permission || false,
    });

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            const payload = {
                name: values.name || '',
                address: values.address || '',
                email: values.email || '',
                zip_code: values.zip_code || '',
                city: values.city || '',
                phone_number: values.phone_number?.startsWith('+45')
                    ? values?.phone_number?.replace('+45', '')
                    : values.phone_number || '',
                marketplace_pointer: values.marketplace_pointer || '',
                note: values.note || '',
                phone_number2: values.phone_number2?.startsWith('+45')
                    ? values?.phone_number2?.replace('+45', '')
                    : values.phone_number2 || '',
                birthday: values.birthday || null,
                cpr: values.cpr || '',
                attachments: values?.attachments || [],
                country_code: values?.country_code || '+45',
                country_code2: values?.country_code2 || '+45',
                country_iso_code: values?.country_iso_code || 'DK',
                country_iso_code2: values?.country_iso_code2 || 'DK',
                bonus: values?.bonus || 0,
                marketing_permission: values?.marketing_permission || false,
            };

            if (payload) {
                submitUser(payload);
                // formik.resetForm();
            }
        },
    });

    const handleBlockCustomer = async () => {
        try {
            setBlockCustomerLoading(true);
            setBlockCustomerModal(false);

            const res = await BlockCustomerApi({
                ...formik.values,
                block_booking: !isBlocked,
                id: customer?.id,
            });

            if (res.data.success) {
                setIsBlocked(!isBlocked);
                toast.success(
                    isBlocked ? t('Customer.CustomerUnblockedSuccess') : t('Customer.CustomerBlockedSuccess'),
                );
                setInitialValues({
                    ...formik.values,
                    block_booking: !isBlocked,
                });
            } else {
                toast.error(isBlocked ? t('Customer.CustomerUnblockedError') : t('Customer.CustomerBlockedError'));
            }
        } catch (error) {
            console.error('Error blocking customer:', error);
            toast.error(isBlocked ? t('Customer.CustomerUnblockError') : t('Customer.CustomerBlockError'));
        } finally {
            setBlockCustomerLoading(false);
        }
    };
    const submitUser = async (payload) => {
        let apiRequestMaker;
        try {
            setSaveLoading(true);
            // First, delete the files that were removed locally
            if (deletedFileIds.length > 0) {
                try {
                    await Promise.all(deletedFileIds.map((fileId) => apiFetcher.delete(`api/v1/store/file/${fileId}`)));
                } catch (error) {
                    console.error('Error deleting files:', error);
                    toast.error(t('Customer.FileDeleteError'));
                    return; // Stop the save process if file deletion fails
                }
            }

            if (!isEdit) {
                apiRequestMaker = await apiFetcher.post(`api/v1/store/customer/outlet`, payload);
            } else {
                if (!customer?.id) {
                    toast.error(t('Customer.ToastCustomerIDError'));
                    return;
                }
                apiRequestMaker = await apiFetcher.patch(`api/v1/store/customer/outlet?id=${customer?.id}`, payload);
            }

            const response = apiRequestMaker;

            if (response.status === 201 || response.status === 200) {
                toast.success(isEdit ? t('Customer.CustomerUpdateSuccess') : t('Customer.CustomerCreateSuccess'));
                const ids = response.data.data.id;
                setIsChanges(false);
                setDeletedFileIds([]); // Reset deleted files tracking
                setInitialValues(formik.values);
                navigate(`/customers/${ids}/customerinformation`, { state: { data: customer } });
            } else if (response.status === 400) {
                toast.error(
                    `${isEdit ? t('Customer.CustomerUpdateError') : t('Customer.CustomerCreateError')} - ${
                        response?.data?.detail
                    }`,
                );
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error';
            toast.error(`Failed to ${isEdit ? 'update' : 'create'} customer - ${errorMessage}`);
            console.error('Error creating customer:', errorMessage, error?.response || error);
        } finally {
            setSaveLoading(false);
        }
    };

    const deleteCustomer = async (id) => {
        try {
            const Deleted = await DeleteCustomerApi(id);
            if (Deleted) {
                toast.success(t('Customer.CustomerDeleteSuccess'));
                const timeout = setTimeout(() => {
                    navigate(`/customers`);
                }, 800);
                return () => clearTimeout(timeout);
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error(t('Customer.CustomerDeleteError'));
        }
    };

    const handleCprChange = (e) => {
        let input = e.target.value?.replace(/\D/g, '');
        if (input.length > 10) {
            input = input.slice(0, 10);
        }
        const formattedCpr = input.length > 6 ? `${input.slice(0, 6)}-${input.slice(6)}` : input;
        formik.setFieldValue('cpr', formattedCpr);
        if (formattedCpr.length === 11) {
            formik.setFieldValue('cpr', formattedCpr);
        }
    };

    useEffect(() => {
        const phone1Len = CountryList[formik.values.country_iso_code || 'DK'];
        const phone2Len = CountryList[formik.values.country_iso_code2 || 'DK'];

        let phone1MinLength, phone1MaxLength, phone2MinLength, phone2MaxLength;

        // Handle phone1 length
        if (phone1Len?.minLength && phone1Len?.maxLength) {
            phone1MinLength = phone1Len.minLength;
            phone1MaxLength = phone1Len.maxLength;
        } else if (phone1Len?.phoneLength) {
            phone1MinLength = phone1Len.phoneLength;
            phone1MaxLength = phone1Len.phoneLength;
        }

        // Handle phone2 length
        if (phone2Len?.minLength && phone2Len?.maxLength) {
            phone2MinLength = phone2Len.minLength;
            phone2MaxLength = phone2Len.maxLength;
        } else if (phone2Len?.phoneLength) {
            phone2MinLength = phone2Len.phoneLength;
            phone2MaxLength = phone2Len.phoneLength;
        }

        setPhoneLength({
            phone1: { minLength: phone1MinLength, maxLength: phone1MaxLength },
            phone2: { minLength: phone2MinLength, maxLength: phone2MaxLength },
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.country_iso_code, formik.values.country_iso_code2]);

    useEffect(() => {
        // Debounce the changes check
        const timeoutId = setTimeout(() => {
            if (formik.dirty) {
                setIsChanges(true);
            } else {
                setIsChanges(false);
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [formik.dirty]);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        const maxSize = 30 * 1024 * 1024; // 15MB in bytes
        const validFiles = [];
        const invalidFiles = [];

        if (files.length > 3) {
            toast.error(t('Customer.FileLimit'));
            return;
        }

        files.forEach((file) => {
            if (file.size > maxSize) {
                invalidFiles.push(file.name);
            } else {
                validFiles.push(file);
            }
        });

        if (invalidFiles.length > 0) {
            toast.error(`${t('Customer.FileSize')}: ${invalidFiles.join(', ')}`);
            return;
        }
        if (validFiles.length > 0) {
            const fileArray = Array.from(validFiles);
            let uploadedCount = 0;
            const toastId = toast.loading(`${t('Common.Uploading')} 0/${fileArray.length}...`);

            const uploadNext = (index) => {
                if (index >= fileArray.length) {
                    toast.update(toastId, {
                        render: `${t('Common.Uploading')} ${uploadedCount}/${fileArray.length} (100%)`,
                        isLoading: false,
                        type: 'success',
                        autoClose: 1500,
                    });
                    return;
                }

                const file = fileArray[index];
                const payload = new FormData();
                payload.append('file', file);

                // Reset progress to 0% at start of each upload
                toast.update(toastId, {
                    render: `${t('Common.Uploading')} ${index + 1}/${fileArray.length} (0%)`,
                    isLoading: true,
                });

                apiFetcher
                    .post(`api/v1/store/file`, payload, {
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            toast.update(toastId, {
                                render: `${t('Common.Uploading')} ${index + 1}/${
                                    fileArray.length
                                } (${percentCompleted}%)`,
                                isLoading: true,
                            });
                        },
                    })
                    .then((response) => {
                        if (response.status === HttpStatusCode.Created || response.status === HttpStatusCode.Ok) {
                            const newFile = {
                                id: response?.data?.data?.id,
                                file_name: response?.data?.data?.file_name,
                                url: response?.data?.data?.url,
                                denmark_created_at: moment(response?.data?.data?.denmark_created_at).format(
                                    'YYYY-MM-DD HH:mm:ss',
                                ),
                            };
                            setUploadedFiles((prevFiles) => [...prevFiles, newFile]);
                            uploadedCount++;
                            uploadNext(index + 1);
                        } else {
                            toast.update(toastId, {
                                render: `${t('Common.Uploading')} ${index + 1}/${fileArray.length} (Failed)`,
                                isLoading: false,
                                type: 'error',
                                autoClose: 1500,
                            });
                        }
                    })
                    .catch((error) => {
                        toast.update(toastId, {
                            render: `${t('Common.Uploading')} ${index + 1}/${fileArray.length} (Failed)`,
                            isLoading: false,
                            type: 'error',
                            autoClose: 1500,
                        });
                    });
            };

            uploadNext(0); // Start the chain
        }
    };

    const handleRemoveFile = async (fileId) => {
        // Add fileId to deletedFileIds array
        setDeletedFileIds((prev) => [...prev, fileId]);

        // Optimistically remove file from state
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
        const currentAttachments = formik.values.attachments || [];
        formik.setFieldValue(
            'attachments',
            currentAttachments.filter((id) => id !== fileId),
        );

        // Set changes to true to enable save button
        setIsChanges(true);
    };

    useEffect(() => {
        if (uploadedFiles) {
            formik.setFieldValue(
                'attachments',
                uploadedFiles.map((f) => f.id),
            );
        }
    }, [uploadedFiles]);

    return (
        <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* {!loading && */}
            {/* <Stack display={"flex"} flexDirection={'row'} gap={2} alignItems={'center'} justifyContent={'flex-end'}>

               

            </Stack> */}
            {isChanges && formik.dirty && (
                <AppBar
                    sx={{
                        position: 'fixed',
                        zIndex: 2,
                        top: isEdit ? 125 : 45,
                        left: 0,
                        right: 0,
                        py: 1,
                        px: isMobile ? 2 : 4,
                        height: 50,
                        bgcolor: '#fff',
                        display: 'flex',
                        alignItems: 'flex-end',
                        width: '100%',
                        borderWidth: 0,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    {isEdit
                        ? (user?.settings?.edit_customers || user?.role === 'ADMIN') && (
                              <FButton
                                  title={t('Customer.SaveCh')}
                                  sx={{ borderRadius: 50, py: 1 }}
                                  variant="save"
                                  color="primary"
                                  onClick={() => formik.handleSubmit()}
                                  loading={saveLoading}
                                  disabled={saveLoading}
                              />
                          )
                        : (user?.settings?.create_customers || user?.role === 'ADMIN') && (
                              <FButton
                                  title={t('Customer.AddCust')}
                                  sx={{ borderRadius: 50, py: 1 }}
                                  variant="save"
                                  color="primary"
                                  onClick={() => formik.handleSubmit()}
                                  loading={saveLoading}
                                  disabled={saveLoading}
                              />
                          )}
                </AppBar>
            )}

            <Stack
                spacing={1}
                sx={{
                    mx: { xs: 2, md: 10 },
                    bgcolor: '#fff',
                    borderRadius: '25px',
                    py: { xs: 2, md: 6 },
                    px: { xs: 2, md: 18 },
                    mt: isChanges ? 8 : 4,
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <FPrimaryHeading fontColor="#545454" fontSize="22px" text={t('Customer.CustomerInformation')} />

                <form
                    style={{ width: '100%' }}
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Grid2 container spacing={2} columnSpacing={20} marginTop={{ xs: 1, sm: 5 }} paddingBottom={2}>
                        <Grid2 sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} item size={{ xs: 12, md: 6 }}>
                            <Stack
                                sx={{
                                    width: 'full',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Customer.CustomerName')}
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <FTextInput
                                            disabled={isEdit && !havePermission}
                                            onBlur={formik.handleBlur}
                                            mt={1}
                                            name="name"
                                            placeholder={t('Customer.CustomerName')}
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            fontColor="#545454"
                                            width={{ xs: '100%', md: '100%' }}
                                            slotProps={
                                                isBlocked && {
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Typography sx={{ color: '#1f1f1f' }}>🚫</Typography>
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }
                                            }
                                        />
                                        {formik.touched.name && formik.errors.name && (
                                            <Typography variant="caption" color="red">
                                                {formik.errors.name}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack
                                sx={{
                                    width: 'full',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Common.Email')}
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <FTextInput
                                            disabled={isEdit && !havePermission}
                                            onBlur={formik.handleBlur}
                                            mt={1}
                                            name="email"
                                            placeholder={t('Common.Email')}
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            fontColor="#545454"
                                            width={{ xs: '100%', md: '100%' }}
                                        />
                                        {formik.touched.email && formik.errors.email && (
                                            <Typography variant="caption" color="red">
                                                {formik.errors.email}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack
                                sx={{
                                    width: 'full',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Common.Phone')}
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <FPhonePicker
                                            value={{
                                                phone: formik.values.phone_number,
                                                country_code: formik.values.country_code,
                                                country_iso_code: formik.values.country_iso_code,
                                            }}
                                            onBlur={() => formik.setFieldTouched('phone_number', true)}
                                            onChange={(e) => formik.setFieldValue('phone_number', e)}
                                            onCountryChange={(value) => {
                                                formik.setFieldValue('country_code', value.country_code);
                                                formik.setFieldValue('country_iso_code', value.country_iso_code);
                                            }}
                                            disabled={isEdit && !havePermission}
                                        />
                                        {formik.touched.phone_number && formik.errors.phone_number && (
                                            <Typography variant="caption" color="red">
                                                {formik.errors.phone_number}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack
                                sx={{
                                    width: 'full',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Common.AlternativePhoneNumber')} ({t('Common.Optional')})
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <FPhonePicker
                                            value={{
                                                phone: formik.values.phone_number2,
                                                country_code: formik.values.country_code2,
                                                country_iso_code: formik.values.country_iso_code2,
                                            }}
                                            onBlur={() => formik.setFieldTouched('phone_number2', true)}
                                            onChange={(e) => formik.setFieldValue('phone_number2', e)}
                                            onCountryChange={(value) => {
                                                formik.setFieldValue('country_code2', value.country_code);
                                                formik.setFieldValue('country_iso_code2', value.country_iso_code);
                                            }}
                                            disabled={isEdit && !havePermission}
                                        />
                                        {formik.touched.phone_number2 && formik.errors.phone_number2 && (
                                            <Typography variant="caption" color="red">
                                                {formik.errors.phone_number2}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack
                                sx={{
                                    width: 'full',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Common.Birthday')}{' '}
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <Stack width={'100%'} gap={2} alignItems={'center'} flexDirection={'row'}>
                                            <FSelect
                                                disabled={isEdit && !havePermission}
                                                onBlur={formik.handleBlur}
                                                value={selectedDate.day}
                                                placeholderText={'DD'}
                                                sx={{ width: '30%' }}
                                                onChange={(e) =>
                                                    handleSelectDate({ date: e.target.value, type: 'day' })
                                                }
                                                options={mapOptions(dateObject.dates)}
                                            />

                                            <FSelect
                                                disabled={isEdit && !havePermission}
                                                value={selectedDate.month}
                                                placeholderText={'MM'}
                                                sx={{ width: '30%' }}
                                                onChange={(e) =>
                                                    handleSelectDate({ date: e.target.value, type: 'month' })
                                                }
                                                // disabled={!selectedDate.day}
                                                options={mapOptions(dateObject.months, getDisabledMonths())}
                                            />

                                            <FSelect
                                                disabled={isEdit && !havePermission}
                                                value={selectedDate.year}
                                                sx={{ width: '40%' }}
                                                placeholderText={'YYYY'}
                                                onChange={(e) =>
                                                    handleSelectDate({ date: e.target.value, type: 'year' })
                                                }
                                                // disabled={!selectedDate.month}
                                                options={mapOptions(dateObject.years, getDisabledYears())}
                                            />
                                        </Stack>

                                        {formik.touched.birthday && formik.errors.birthday && (
                                            <Typography variant="caption" color="red">
                                                {formik.errors.birthday}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack
                                sx={{
                                    width: 'full',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {' '}
                                    {t('Common.CPRNumber')}
                                    <Tooltip placement="right" couser title={t('Customer.CprHoverMsg')}>
                                        <img
                                            style={{ marginLeft: 5 }}
                                            src={LockIcon}
                                            alt="lock"
                                            height={'15px'}
                                            width={'15px'}
                                        />
                                    </Tooltip>
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <FTextInput
                                        disabled={isEdit && !havePermission}
                                        size="small"
                                        id={'cpr'}
                                        name={'cpr'}
                                        value={formik.values.cpr}
                                        onChange={handleCprChange}
                                        // onChange={(e => formik.setFieldValue('cpr', e.target.value))}
                                        // onBlur={handleBlurCpr}
                                        onBlur={formik.handleBlur}
                                        placeholder="000000-XXXX"
                                        inputProps={{ maxLength: 11 }}
                                        sx={{
                                            width: '100%',
                                            '& input::placeholder': { color: '#747474', fontSize: '1rem', opacity: 1 },
                                            fontSize: '1rem',
                                        }}
                                    />
                                </Stack>
                                <div style={{ zIndex: 50 }}>
                                    {formik.touched.cpr && formik.errors.cpr && (
                                        <Typography variant="caption" color="red">
                                            {formik.errors.cpr}
                                        </Typography>
                                    )}
                                </div>
                            </Stack>

                            <Stack>
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('POS.Bonus')}
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <FTextInput
                                            disabled={isEdit && !havePermission}
                                            onBlur={formik.handleBlur}
                                            mt={1}
                                            name="bonus"
                                            placeholder={t('POS.Bonus')}
                                            value={formik.values.bonus}
                                            onChange={(e) => {
                                                const input = formatPrice(e.target.value);
                                                formik.setFieldValue('bonus', input);
                                            }}
                                            fontColor="#545454"
                                            width={{ xs: '100%', md: '100%' }}
                                        />
                                        {formik.touched.bonus && formik.errors.bonus && (
                                            <Typography variant="caption" color="red">
                                                {formik.errors.bonus}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Grid2>

                        <Grid2 sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} item size={{ xs: 12, md: 6 }}>
                            <Stack
                                sx={{
                                    width: 'full',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Common.Address')}
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <FTextInput
                                            disabled={isEdit && !havePermission}
                                            onBlur={formik.handleBlur}
                                            mt={1}
                                            name="address"
                                            placeholder={t('Common.Address')}
                                            value={formik.values.address}
                                            onChange={formik.handleChange}
                                            fontColor="#545454"
                                            width={{ xs: '100%', md: '100%' }}
                                        />
                                        {formik.touched.address && formik.errors.address && (
                                            <Typography variant="caption" color="red">
                                                {formik.errors.address}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack
                                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
                                item
                                size={6}
                            >
                                <Stack
                                    sx={{
                                        width: '40%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        justifyContent: 'flex-start',
                                    }}
                                >
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t('Common.ZipCode')}
                                    </Typography>
                                    <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                        <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                            <FTextInput
                                                disabled={isEdit && !havePermission}
                                                onBlur={formik.handleBlur}
                                                mt={1}
                                                name="zip_code"
                                                placeholder={t('Common.ZipCode')}
                                                value={formik.values.zip_code}
                                                onChange={formik.handleChange}
                                                fontColor="#545454"
                                                width={{ xs: '100%', md: '100%' }}
                                            />
                                            {formik.touched.zip_code && formik.errors.zip_code && (
                                                <Typography variant="caption" color="red">
                                                    {formik.errors.zip_code}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Stack>

                                <Stack
                                    sx={{
                                        width: '60%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        justifyContent: 'flex-start',
                                    }}
                                >
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t('Common.City')}
                                    </Typography>
                                    <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                        <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                            <FTextInput
                                                disabled={isEdit && !havePermission}
                                                onBlur={formik.handleBlur}
                                                mt={1}
                                                name="city"
                                                placeholder={t('Common.City')}
                                                value={formik.values.city}
                                                onChange={formik.handleChange}
                                                fontColor="#545454"
                                                width={{ xs: '100%', md: '100%' }}
                                            />
                                            {formik.touched.city && formik.errors.city && (
                                                <Typography variant="caption" color="red">
                                                    {formik.errors.city}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack
                                sx={{
                                    width: 'full',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Customer.CustomerNotes')}
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <FTextArea
                                            disabled={isEdit && !havePermission}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.marketplace_pointer}
                                            placeholder={t('Customer.CustomerNotes')}
                                            onChange={formik.handleChange}
                                            name="marketplace_pointer"
                                            showCopyButton={false}
                                            fontColor="#545454"
                                            width={{ xs: '100%', md: '100%' }}
                                            rows={5}
                                        />

                                        {formik.touched.marketplace_pointer && formik.errors.marketplace_pointer && (
                                            <Typography variant="caption" color="red">
                                                {formik.errors.marketplace_pointer}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack
                                sx={{
                                    width: 'full',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    Note
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <FTextArea
                                            disabled={isEdit && !havePermission}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.note}
                                            placeholder="Note"
                                            onChange={formik.handleChange}
                                            name="note"
                                            showCopyButton={false}
                                            fontColor="#545454"
                                            width={{ xs: '100%', md: '100%' }}
                                            rows={5}
                                        />

                                        {formik.touched.note && formik.errors.note && (
                                            <Typography variant="caption" color="red">
                                                {formik.errors.note}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Stack>
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Customer.MarketingPermission')}
                                </Typography>
                                <Stack width={'100%'} flexDirection={'row'} sx={{ alignItems: 'center' }}>
                                    <Stack flex={1} flexDirection={'column'} justifyContent={'center'}>
                                        <FSwitch
                                            checked={formik.values.marketing_permission}
                                            onChange={(event, checked) =>
                                                formik.setFieldValue('marketing_permission', checked)
                                            }
                                            name="marketing_permission"
                                            label={t('Customer.SendMarketingEmailsAndSMS')}
                                        />
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Grid2>
                    </Grid2>
                </form>

                <Stack sx={{ mt: 4 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f', mb: 2 }}>
                        {t('Customer.UploadImageText')}
                    </Typography>
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{
                            width: '200px',
                            mb: 2,
                            gap: 2,
                            borderRadius: 3,
                            textTransform: 'none',
                            borderColor: '#D9D9D9',
                            color: '#1f1f1f',
                            '&:hover': {
                                backgroundColor: 'rgba(31, 31, 31, 0.04)',
                            },
                        }}
                    >
                        <img src={Upload} alt="upload" style={{ height: '20px', width: '20px' }} />
                        {t('Customer.ChsFiles')}
                        <input type="file" multiple hidden accept="*/*" onChange={handleFileUpload} />
                    </Button>

                    {uploadedFiles.length > 0 && (
                        <AttachmentsList uploadedFiles={uploadedFiles} handleRemoveFile={handleRemoveFile} />
                    )}
                </Stack>

                <CustomerCards loading={loading} customerSaleDetails={customerSaleDetails} />
                {/* </Formik> */}
            </Stack>
            {isEdit && (user?.settings?.delete_customers || user?.role === 'ADMIN') && (
                <Stack
                    sx={{
                        justifyContent: { xs: 'center', md: 'flex-end' },
                        alignItems: 'center',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        px: { xs: 2, md: 10 },
                        mt: 2,
                        width: '100%',
                    }}
                >
                    {/* Delete Customer Button */}
                    <FButton
                        title={
                            <Typography noWrap fontWeight={700}>
                                {t('Customer.DelCust')}
                            </Typography>
                        }
                        sx={{
                            borderRadius: 50,
                            py: 1,
                            width: { xs: '100%', md: 180 }, // Fixed width for consistency
                        }}
                        variant="delete"
                        color="primary"
                        onClick={() => setDeleteCustomerModel(true)}
                        disabled={customer?.id === 'create'}
                    />

                    {/* Block Customer Button */}
                    <FButton
                        title={
                            <Typography noWrap fontWeight={700}>
                                {isBlocked ? t('Customer.UnblockCustomer') : t('Customer.BlockCustomer')}
                            </Typography>
                        }
                        sx={{
                            borderRadius: 50,
                            py: 1,
                            width: { xs: '100%', md: 180 },
                            backgroundColor: '#e19957',
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: 'none',
                            },
                        }}
                        variant="contained"
                        onClick={() => {
                            setBlockCustomerModal(true);
                        }} // Changed to different handler
                        disabled={customer?.id === 'create'}
                    />
                </Stack>
            )}

            {deleteCustomerModel && (
                <CustomDeleteModal
                    open={deleteCustomerModel}
                    handleClose={() => setDeleteCustomerModel(false)}
                    title={t('Common.Delete')}
                    description={
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {t('Customer.DeleteMsg')}
                        </Typography>
                    }
                    onClickDismiss={() => setDeleteCustomerModel(false)}
                    onClickConfirm={() => deleteCustomer(customer?.id)}
                />
            )}

            {blockCustomerModal && (
                <CustomDeleteModal
                    open={blockCustomerModal}
                    handleClose={() => setBlockCustomerModal(false)}
                    title={isBlocked ? t('Customer.UnblockCustomer') : t('Customer.BlockCustomer')}
                    description={
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {isBlocked ? t('Customer.UnblockCustomerDesc') : t('Customer.BlockCustomerDesc')}
                        </Typography>
                    }
                    onClickDismiss={() => setBlockCustomerModal(false)}
                    onClickConfirm={() => {
                        handleBlockCustomer();
                    }}
                    confirmTitle={t('Customer.ButtonTitleYes')}
                    dismissTitle={t('Customer.ButtonTitleNo')}
                    loading={BlockCustomerLoading}
                />
            )}
        </Stack>
    );
};
export default CustomerInformation;
