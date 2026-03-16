import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Stack,
    Divider,
    Tooltip,
    Skeleton,
    Button,
    AppBar,
    Grid2,
    IconButton,
    InputAdornment,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    CircularProgress,
} from '@mui/material';
import CommonButton from '../commonButton';
import TooltipIcon from '../../../assets/IconTooltip.png';
import PrimaryHeading from '../commonPrimaryHeading';
import SecondaryHeading from '../commonSecondaryHeading';
// import FSelect from '../commonCustomSelect';
import CustomTextField from '../commonTextinput';
import { useFormik } from 'formik';
import apiFetcher from '../../../utils/interCeptor';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { MultipleContainers } from '../../MultipleContainers/MultipleContainers';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import FSwitch from '../../commonComponents/f-switch';
import { useSelector } from 'react-redux';
import { Copy } from 'lucide-react';
import { t } from 'i18next';
import FTextInput from '../../commonComponents/F_TextInput';
import ArrowDown from '../../../assets/arrow-down.svg';
import FTextArea from '../../commonComponents/F_TextArea';
import FSelect from '../../commonComponents/F_Select';
import PreviewModal from './Popup/PreviewModal';
import { Visibility, VisibilityOff, CloudUpload, InfoOutlined } from '@mui/icons-material';
import Info from '../../../assets/Info.svg';
import Warning from '../../../assets/Warning.svg';
import { SmsEmailTemplates } from './DefaultSmsEmails';
import * as Yup from 'yup';
import FButton from '../../commonComponents/F_Button';
import FPrimaryHeading from '../../commonComponents/F_PrimaryHeading';
import { dividerSx } from '../../../scenes/Settings/Index';
import { formatPriceInput } from '../../../utils/format-amout';
import DeleteIcon from '../../../assets/Delete.svg';
import { useData } from '../../../context/DataContext';
import { EmailTemplateSection } from './EmailTemplateSection';
import { HttpStatusCode } from 'axios';
import { useNavigate } from 'react-router-dom';

const onlinBookingsIntervals = [
    { value: 5, label: '5 min' },
    { value: 15, label: '15 min (standard)' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hour' },
];
const howLongBeforeCustomerOptions = [
    { value: 5, label: '5 min' },
    { value: 15, label: '15 min (standard)' },
    { value: 45, label: '30 min' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 360, label: '6 hours' },
    { value: 480, label: '8 hours' },
    { value: 720, label: '12 hours' },
    { value: 1440, label: '24 hours' },
];

const howFarFutureCustomerOptions = [
    { value: 7, label: '1 week' },
    { value: 14, label: '2 weeks' },
    { value: 30, label: '1 month (standard)' },
    { value: 60, label: '2 months' },
    { value: 120, label: '4 months' },
    { value: 180, label: '6 months' },
    { value: 365, label: '1 year' },
];

const longBeforeCustomerCancelBookingOptions = [
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 360, label: '6 hours' },
    { value: 720, label: '12 hours' },
    { value: 1440, label: '24 hours (standard)' },
    { value: 2880, label: '48 hours' },
    { value: 4320, label: '72 hours' },
    { value: 2628000, label: 'Never' },
];

const AttachTermsAndConditionSection = ({ formik, setShowToastMsg }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (file) => {
        if (!file) return;

        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxFileSize) {
            toast.error(t('Calendar.fileSizeExceeded', { fileName: file.name, maxSize: '5MB' }));
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiFetcher.post('api/v1/store/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            formik.setFieldValue('inspection_module.attach_terms_and_condition', {
                enable: true,
                file_id: response.data?.data?.id,
                file_url: response.data?.data?.url,
                file_name: response.data?.data?.file_name,
            });

            toast.success(t('Setting.FileUploadedSuccessfully'));
        } catch (error) {
            console.error('Error uploading file:', error);
            // toast.error(t('Calendar.UploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            handleFileUpload(file);
            e.target.value = '';
        }
    };

    const handleRemoveFile = async () => {
        const fileId = formik?.values?.inspection_module?.attach_terms_and_condition?.file_id;
        if (!fileId) return;

        try {
            const removeApiCall = await apiFetcher.delete(`/api/v1/store/file/${fileId}`);

            toast.success(t('Setting.FileRemovedSuccessfully'));

            if (removeApiCall && removeApiCall?.data?.success) {
                const newValues = { ...formik.values };
                delete newValues.inspection_module.attach_terms_and_condition;
                await formik.setValues(newValues);
                setShowToastMsg(false);
                await formik.handleSubmit();
            }
        } catch (error) {
            console.error('Error removing file:', error);
            if (error.response.status === HttpStatusCode.NotFound) {
                const newValues = { ...formik.values };
                delete newValues.inspection_module.attach_terms_and_condition;
                await formik.setValues(newValues);
                setShowToastMsg(false);
                await formik.handleSubmit();
            } else {
                toast.error(t('Setting.FileRemoveFailed'));
            }
        }
    };

    const handleSwitchChange = async (e) => {
        const isEnabled = e.target.checked;
        formik.setFieldValue('inspection_module.attach_terms_and_condition.enable', isEnabled);

        // If disabling, remove the file
        if (!isEnabled && formik?.values?.inspection_module?.attach_terms_and_condition?.file_id) {
            await handleRemoveFile();
        }
    };

    const currentFile = formik?.values?.inspection_module?.attach_terms_and_condition;
    const isEnabled = currentFile?.enable;

    return (
        <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
            <Grid2 size={{ xs: 12, md: 4 }}>
                <PrimaryHeading text={t('Setting.AttachTermsAndCondition')} />
                <SecondaryHeading text={t('Setting.AttachTermsAndConditionDescription')} />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 8 }}>
                <FSwitch
                    label={t('Setting.AttachTermsAndCondition')}
                    checked={isEnabled}
                    onChange={handleSwitchChange}
                />

                {isEnabled && (
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="*/*"
                        />

                        {!currentFile?.file_id ? (
                            <Button
                                variant="outlined"
                                startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                sx={{ width: 'fit-content' }}
                            >
                                {uploading ? t('Common.Uploading') : t('Setting.UploadFile')}
                            </Button>
                        ) : (
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{
                                    p: 2,
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    textDecoration: 'underline',
                                    color: 'blue',
                                }}
                            >
                                <Stack sx={{ flex: 1 }}>
                                    <Typography
                                        onClick={() =>
                                            currentFile?.file_url &&
                                            window.open(
                                                `${process.env.REACT_APP_IMG_URL}${currentFile?.file_url}`,
                                                '_blank',
                                            )
                                        }
                                        variant="body2"
                                        sx={{ fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                                    >
                                        {currentFile?.file_name || t('Common.Uploaded')}
                                    </Typography>
                                </Stack>
                                <IconButton
                                    onClick={handleRemoveFile}
                                    disabled={uploading}
                                    sx={{ ml: 2 }}
                                    color="error"
                                    size="small"
                                >
                                    <img src={DeleteIcon} alt="delete_icon" />
                                </IconButton>
                            </Stack>
                        )}
                    </Stack>
                )}
            </Grid2>
        </Grid2>
    );
};

const OnlineBookingSettingsOption = () => {
    const [showToast, setShowToast] = useState(false);
    const user = useSelector((state) => state.user.data);
    const set = useSelector((state) => state.settings.data);
    const { refreshSettings } = useData();
    const isPosEnabled = set?.profile?.outlet_addons?.some((addon) => addon.addon_name === 'POS');
    const outletId = set?.profile?.id;
    const isInspectionEnabled = set?.profile?.inspection_module;
    // const settings = useSelector((state) => state.setting.data)
    const [Employee, setEmployee] = useState([]);
    const [reOrderEmp, setReorderEmp] = useState({});
    const dataNeedsFromClintsFirst = [
        { id: 1, label: t('Common.Name'), field: 'name' },
        { id: 2, label: t('Calendar.PhoneNumber'), field: 'phoneNumber' },
        { id: 3, label: t('Common.Email'), field: 'email' },
        { id: 4, label: t('Common.Address'), field: 'address' },
    ];

    const dataNeedsFromClintsSec = [
        { id: 11, label: t('Setting.NoteBox'), field: 'noteBox' },
        { id: 12, label: t('Common.Birthday'), field: 'birthday' },
        { id: 13, label: t('Setting.CPR'), field: 'cpr' },
    ];

    const [isChanges, setIsChanges] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serviceGroup, setServiceGroup] = useState([]);
    const navigate = useNavigate();

    // const [showPassword, setShowPassword] = useState(false);

    const embedCode =
        set.profile.web_store_name !== '' && set.profile.web_store_name != null
            ? `<script
src="https://bahlou.dk/assets/js/fiind-embed.js"
data-booking-url="https://bahlou.dk/${set.profile.web_store_name}"
data-height="800px"
data-language="da"
data-theme="light"
data-show-language-switcher="false"
data-show-theme-switcher="true"
</script>`
            : null;

    const [initialValues, setInitialValues] = useState({
        onlineBooking: {
            allowOnlineBooking: true,
            specificEmployee: [],
            outletEmailNotification: false,
            outletEmailCancelNotification: set?.OnlineBooking?.onlineBooking?.outletEmailCancelNotification,
        },

        BookingInterval: {
            miniGapCalEmployee: [],
            sameIntervalForAllEmployee: true,
            intervalForOnlineBooking: 5,
            intervalForIndividualEmployee: null,
        },

        restrictionForBooking: {
            howLongBeforeCustomerBook: 15,
            howFarFutureCustomerbook: 30,
            longBeforeCustomerCancelBookingOptionBook: 1440,
            messageForTooLate: '',
        },

        DataFromClients: {
            name: true,
            phoneNumber: true,
            email: true,
            address: true,
            noteBox: true,
            birthday: false,
            cpr: false,
        },

        communication: {
            Sender: 'Bahlou',
            OTP: {
                sms: false,
                email: false,
                sms_body: SmsEmailTemplates.OTP.sms_body,
                email_body: SmsEmailTemplates.OTP.email_body,
                email_sub: SmsEmailTemplates.OTP.email_sub,
            },
            bookingConfirmation: {
                sms: false,
                email: false,
                sms_body: SmsEmailTemplates.bookingConfirmation.sms_body,
                email_body: SmsEmailTemplates.bookingConfirmation.email_body,
                email_sub: SmsEmailTemplates.bookingConfirmation.email_sub,
            },
            reminder: {
                sms: false,
                email: false,
                reminder_before: outletId === 547 ? 2880 : 1440,
                reminder_before_booking_start: null,
                sms_body: SmsEmailTemplates.reminder.sms_body,
                email_body: SmsEmailTemplates.reminder.email_body,
                email_sub: SmsEmailTemplates.reminder.email_sub,
            },
            bookingReschedule: {
                sms: false,
                email: false,
                sms_body: SmsEmailTemplates.bookingReschedule.sms_body,
                email_body: SmsEmailTemplates.bookingReschedule.email_body,
                email_sub: SmsEmailTemplates.bookingReschedule.email_sub,
            },
            cancellation: {
                sms: false,
                email: false,
                sms_body: SmsEmailTemplates.cancellation.sms_body,
                email_body: SmsEmailTemplates.cancellation.email_body,
                email_sub: SmsEmailTemplates.cancellation.email_sub,
            },
            EmailFormrequest: {
                email: false,
                email_body: SmsEmailTemplates.EmailFormrequest.email_body,
                email_sub: SmsEmailTemplates.EmailFormrequest.email_sub,
            },
            EmailFormConfirm: {
                email: false,
                email_body: SmsEmailTemplates.EmailFormConfirm.email_body,
                email_sub: SmsEmailTemplates.EmailFormConfirm.email_sub,
            },

            EmailOnlineFormConfirm: {
                email: false,
                email_body: SmsEmailTemplates.EmailOnlineFormConfirm.email_body,
                email_sub: SmsEmailTemplates.EmailOnlineFormConfirm.email_sub,
            },

            // health declaration
            health_declaration_initial_email: {
                email_body: SmsEmailTemplates.health_declaration_initial_email.email_body,
                email_subject: SmsEmailTemplates.health_declaration_initial_email.email_subject,
            },
            health_declaration_reminder_email: {
                email_body: SmsEmailTemplates.health_declaration_reminder_email.email_body,
                email_subject: SmsEmailTemplates.health_declaration_reminder_email.email_subject,
            },
        },
        autoToggle: {
            sms: true,
            email: true,
        },
        noShow: {
            enable: false,
            chargeType: 'FIXED',
            charge: 250,
            reminder_days: 7,
        },
        employeSectionOrder: [],
        iframeCode: embedCode,
        iframe: {
            iframeCode: embedCode,
            singlePage: false,
            hideBookingStepper: false,
        },
        policy: null,
        redirect: {
            enabled: false,
            url: '',
            duration: null,
            service_ids: [],
        },
        payment_checkout: {
            enabled: false,
            merchant_id: '',
            api_key: '',
        },
        pixel_config: {
            pixel_id: '',
            access_token: '',
        },
        inspection_module: {
            distance_charges: [
                {
                    distance_upto: 0,
                    amount: 0,
                },
            ],
            bridge_toll: {
                zip_code_above: 0,
                amount: 0,
            },
            cancelation_settings: {
                cancel_before: 1440,
                cancelation_charges: 0,
            },
            email_order_confirmation: true,
            attach_terms_and_condition: {
                enable: false,
                file_id: null,
                file_url: null,
                file_name: null,
            },
            auto_sms_employee_before_hours: 'NO_SMS',
            file_upload_checkout: {
                enable: true,
                max_files: 5,
                files_required: false,
            },
            custom_terms_and_conditions: {
                is_enabled: true,
                url: '',
            },
        },
        custom_iframe: {
            border_color: '#fc985d',
            button_color: '#fc985d',
            default_theme: true,
        },
        health_declaration: {
            email_settings: {
                initial_email_before_hours: 24,
                reminder_email_before_hours: 24,
            },
        },
        termsAndConditions: '',
        show_employee_above_calendar: false,
    });

    const [boolState, setBoolState] = useState({
        bookingConfirmation: {
            ShowSMS: false,
            ShowEmail: false,
        },
        reminder: {
            ShowSMS: false,
            ShowEmail: false,
        },
        bookingReschedule: {
            ShowSMS: false,
            ShowEmail: false,
        },
        cancellation: {
            ShowSMS: false,
            ShowEmail: false,
        },
        EmailFormrequest: {
            ShowEmail: false,
        },
        EmailFormConfirm: {
            ShowEmail: false,
        },
        EmailOnlineFormConfirm: {
            ShowEmail: false,
        },
        payment_checkout: {
            ShowAPIKey: false,
        },
        pixel_config: {
            ShowAPIKey: false,
        },
        health_declaration_initial_email: {
            ShowEmail: false,
        },
        health_declaration_reminder_email: {
            ShowEmail: false,
        },
    });

    const [showPreview, setShowPreview] = useState(false);
    const [props, setProps] = useState({});

    const handleCopy = () => {
        navigator.clipboard
            .writeText(embedCode)
            .then(() => {
                // alert("Text copied");
                toast.info(t('Setting.iframeCodeCopied'));
            })
            .catch((err) => {
                // alert("Failed to copy text: " + err);
                console.error('error');
            });
    };

    async function submitOnlineBookingSettings({ values, showToastMessage = false }) {
        try {
            const payload = {
                settings: [
                    {
                        settingCategory: 'outlet',
                        settingName: 'OnlineBooking',
                        value: JSON.stringify(values),
                        type: 'JSON',
                    },
                ],
                policy: formik.values?.policy,
                pixel_config: {
                    pixel_id: formik?.values?.pixel_config?.pixel_id,
                    access_token: formik?.values?.pixel_config?.access_token,
                },
            };

            const response = await apiFetcher.patch('/api/v1/store/outlet/setting', payload);
            const { success } = response.data;
            if (success) {
                setInitialValues(formik.values);
                setIsChanges(false);
                if (showToastMessage) {
                    toast.success(t('Setting.OnlineBookingSettingsUpdated'));
                }
                fetchSettings(Employee);
                refreshSettings();
            }
        } catch (err) {
            toast.error(t('Setting.FailedToUpdateOnlineBookingSettings'));
            console.error('err', err);
        } finally {
            setShowToast(false); // reset flag
            formik.setSubmitting(false);
        }
    }

    async function updateEmpSequence(payload) {
        try {
            //  const payload =  Employee.map((empObj)=>{return{id: empObj.id, sequence: empObj.sequence}})

            const response = await apiFetcher.post('/api/v1/store/employee/sequence', payload);
            const { success } = response.data;
            if (success) {
                setIsChanges(false);
                toast.success(t('Setting.EmployeeSelectionOrderUpdated'));
            }
        } catch (err) {
            toast.error(t('Setting.FailedToUpdateEmployeeSelectionOrder'));
        }
    }

    const communicationSchema = Yup.object().shape({
        Sender: Yup.string(),

        OTP: Yup.object().shape({
            sms: Yup.boolean(),
            email: Yup.boolean(),
            sms_body: Yup.string(),
            email_body: Yup.string(),
            email_sub: Yup.string().when('email', {
                is: true,
                then: (schema) => schema.required('email subject is required'),
                otherwise: (schema) => schema.notRequired(),
            }),
        }),

        bookingConfirmation: Yup.object().shape({
            sms: Yup.boolean(),
            email: Yup.boolean(),
            sms_body: Yup.string(),
            email_body: Yup.string(),
            email_sub: Yup.string().when('email', {
                is: true,
                then: (schema) => schema.required('email subject is required'),
                otherwise: (schema) => schema.notRequired(),
            }),
        }),

        reminder: Yup.object().shape({
            sms: Yup.boolean(),
            email: Yup.boolean(),
            reminder_before: Yup.number(),
            reminder_before_booking_start: Yup.number().nullable().notRequired(),
            sms_body: Yup.string(),
            email_body: Yup.string(),
            email_sub: Yup.string().when('email', {
                is: true,
                then: (schema) => schema.required('email subject is required'),
                otherwise: (schema) => schema.notRequired(),
            }),
        }),

        bookingReschedule: Yup.object().shape({
            sms: Yup.boolean(),
            email: Yup.boolean(),
            sms_body: Yup.string(),
            email_body: Yup.string(),
            email_sub: Yup.string().when('email', {
                is: true,
                then: (schema) => schema.required(t('Setting.EmailSubjectIsRequired')),
                otherwise: (schema) => schema.notRequired(),
            }),
        }),

        cancellation: Yup.object().shape({
            sms: Yup.boolean(),
            email: Yup.boolean(),
            sms_body: Yup.string(),
            email_body: Yup.string(),
            email_sub: Yup.string().when('email', {
                is: true,
                then: (schema) => schema.required(t('Setting.EmailSubjectIsRequired')),
                otherwise: (schema) => schema.notRequired(),
            }),
        }),

        // health declaration
        health_declaration_initial_email: Yup.object().shape({
            email_body: Yup.string()
                .required(t('Setting.EmailBodyIsRequired'))
                .typeError(t('Setting.EmailBodyIsRequired')),
            email_subject: Yup.string()
                .required(t('Setting.EmailSubjectIsRequired'))
                .typeError(t('Setting.EmailSubjectIsRequired')),
        }),
        health_declaration_reminder_email: Yup.object().shape({
            email_body: Yup.string()
                .required(t('Setting.EmailBodyIsRequired'))
                .typeError(t('Setting.EmailBodyIsRequired')),
            email_subject: Yup.string()
                .required(t('Setting.EmailSubjectIsRequired'))
                .typeError(t('Setting.EmailSubjectIsRequired')),
        }),
    });

    const pixelConfigSchema = Yup.object().shape({
        pixel_id: Yup.string(),
        access_token: Yup.string(),
    });

    const paymentCheckoutSchema = Yup.object().shape({
        enabled: Yup.boolean(),
        merchant_id: Yup.string().when('enabled', {
            is: true,
            then: (schema) => schema.required('Merchant ID is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        api_key: Yup.string().when('enabled', {
            is: true,
            then: (schema) => schema.required('API Key is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
    });

    const noShowSchema = Yup.object().shape({
        enable: Yup.boolean().notRequired(),
        chargeType: Yup.string().oneOf(['FIXED', 'PERCENTAGE'], t('Setting.InvalidChargeType')),
        charge: Yup.number().when(['enable', 'chargeType'], {
            is: (enable, chargeType) => enable && chargeType === 'PERCENTAGE',
            then: (schema) =>
                schema.min(0, t('Setting.MinZero')).max(100, t('Setting.Max100')).required(t('Setting.ChargeRequired')),
            otherwise: (schema) =>
                schema.when('enable', {
                    is: true,
                    then: (s) => s.min(0, t('Setting.MinZero')).required(t('Setting.ChargeRequired')),
                    otherwise: (s) => s.notRequired(),
                }),
        }),
    });

    const customTermsAndConditionSchema = Yup.object({
        is_enabled: Yup.boolean(),

        url: Yup.string().when('is_enabled', {
            is: true,
            then: (urlValidation) => urlValidation.required(t('Setting.EnterTermsAndCondition')),
            otherwise: (urlValidation) => urlValidation.notRequired(),
        }),
    });

    const healthDeclarationSchema = Yup.object().shape({
        email_settings: Yup.object().shape({
            initial_email_before_hours: Yup.number().required(t('Setting.InitialEmailBeforeHoursIsRequired')),
            reminder_email_before_hours: Yup.number().required(t('Setting.ReminderEmailBeforeHoursIsRequired')),
        }),
    });

    const validationSchema = {
        communication: communicationSchema,
        pixel_config: pixelConfigSchema,
        inspection_module: Yup.object({
            custom_terms_and_conditions: customTermsAndConditionSchema,
        }),
        health_declaration: healthDeclarationSchema,
    };

    if (isPosEnabled) {
        validationSchema.noShow = noShowSchema;
        validationSchema.payment_checkout = paymentCheckoutSchema;
    }

    // payment_checkout: paymentCheckoutSchema,
    const formik = useFormik({
        initialValues,
        validationSchema: Yup.object().shape(validationSchema),
        validateOnChange: true,
        validateOnBlur: true,
        enableReinitialize: true,
        // context: formik.values?.communication,

        onSubmit: async (values) => {
            const payload = {
                ...values,
            };

            if (values?.redirect?.enabled) {
                payload.redirect = {
                    enabled: values.redirect?.enabled,
                    url: values.redirect?.url,
                    duration: values.redirect?.duration === 'IMMEDIATE' ? 0 : values.redirect?.duration,
                    service_ids: !values?.redirect?.service_ids?.length > 0 ? null : values?.redirect?.service_ids,
                };
            } else {
                payload.redirect = { enabled: false, url: '', duration: null, service_ids: [] };
            }
            await submitOnlineBookingSettings({ values: payload, showToastMessage: showToast });
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // First fetch employees and settings (faster operations)
                const res = await apiFetcher.get('/api/v1/store/employee/get');
                const data = res.data?.data;

                let empObj = {};
                // let empIds = []

                data.map((dataObj) => {
                    delete dataObj.settings;
                    empObj[dataObj?.id] = {
                        ...dataObj,
                        title: dataObj.name,
                        groupId: dataObj?.id,
                        services: [],
                        noSubGroup: true,
                    };
                    // empIds.push(dataObj?.id)
                });

                setReorderEmp(empObj);

                setEmployee(data);
                // Call fetchSettings first (without service groups - it will use existing data or empty array)
                const parsedData = await fetchSettings(data);

                // After fetchSettings completes, fetch service groups in the background
                // This is a slow API, so we do it after everything else is done
                fetchServiceGroup().then((serviceGroupsData) => {
                    // If service_ids is empty or not set, update it with all service groups
                    if (!parsedData?.redirect?.service_ids || parsedData?.redirect?.service_ids?.length === 0) {
                        const allServiceIds = serviceGroupsData?.map((service) => service?.value) || [];

                        const newParsedData = {
                            ...parsedData,
                            redirect: {
                                ...(parsedData?.redirect || {}),
                                service_ids: allServiceIds,
                            },
                        };
                        setInitialValues(newParsedData);
                        formik.setValues(newParsedData);
                        return newParsedData;
                    }
                });
            } catch (error) {
                console.error('Error fetching employees:', error);
                setLoading(false);
            }
        };
        setLoading(true);
        fetchData();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsChanges(!_.isEqual(initialValues, formik.values));
        }, 300); // debounce to avoid flickering

        return () => clearTimeout(timeout);
    }, [formik.values]);

    const fetchSettings = async (empList) => {
        try {
            const res = await apiFetcher.get('/api/v1/store/outlet/setting');

            const data1 = res.data.data.settings.filter(
                (setting) => setting.settingCategory === 'outlet' && setting.settingName === 'OnlineBooking',
            );

            let data = null;

            if (data1.length) {
                data = data1[0].value;
            } else {
                let specificEmployee = [];
                let intervalForIndividualEmployee = {};
                empList.map((empObj) => {
                    specificEmployee.push(empObj.id);
                    intervalForIndividualEmployee[empObj.id] = {
                        id: empObj.id,
                        name: empObj.name,
                        interval: 5,
                    };
                });

                setInitialValues({
                    ...initialValues,
                    onlineBooking: {
                        allowOnlineBooking: true,
                        specificEmployee,
                    },
                    BookingInterval: {
                        miniGapCalEmployee: [],
                        sameIntervalForAllEmployee: true,
                        intervalForOnlineBooking: 5,
                        intervalForIndividualEmployee,
                    },
                    payment_checkout: {
                        enabled: false,
                        merchant_id: '',
                        api_key: '',
                    },
                    inspection_module: {
                        distance_charges: [
                            {
                                distance_upto: 0,
                                amount: 0,
                            },
                        ],
                        bridge_toll: {
                            zip_code_above: 0,
                            amount: 0,
                        },
                        cancelation_settings: {
                            cancel_before: 1440,
                            cancelation_charges: 0,
                        },
                        email_order_confirmation: true,
                        attach_terms_and_condition: {
                            enable: false,
                            file_id: null,
                            file_url: null,
                            file_name: null,
                        },
                        auto_sms_employee_before_hours: 'NO_SMS',
                        file_upload_checkout: {
                            enable: true,
                            max_files: 5,
                            files_required: false,
                        },
                    },
                    custom_iframe: {
                        border_color: '#fc985d',
                        button_color: '#fc985d',
                        default_theme: true,
                    },
                    health_declaration: {
                        email_settings: {
                            initial_email_before_hours: 24,
                            reminder_email_before_hours: 24,
                        },
                    },
                    noShow: {
                        enable: false,
                        chargeType: 'FIXED',
                        charge: 250,
                        reminder_days: 7,
                    },
                });
                formik.setValues({
                    ...formik.values,
                    onlineBooking: {
                        allowOnlineBooking: true,
                        specificEmployee,
                    },
                    BookingInterval: {
                        miniGapCalEmployee: [],
                        sameIntervalForAllEmployee: true,
                        intervalForOnlineBooking: 5,
                        intervalForIndividualEmployee,
                    },
                    payment_checkout: {
                        enabled: false,
                        merchant_id: '',
                        api_key: '',
                    },
                    custom_iframe: {
                        border_color: '#fc985d',
                        button_color: '#fc985d',
                        default_theme: true,
                    },
                    health_declaration: {
                        email_settings: {
                            initial_email_before_hours: 24,
                            reminder_email_before_hours: 24,
                        },
                    },
                    noShow: {
                        enable: false,
                        chargeType: 'FIXED',
                        charge: 250,
                        reminder_days: 7,
                    },
                });
                setLoading(false);
                return;
            }

            let parsedData = JSON.parse(data);
            const getSafeBody = (field, type, bodyType) => {
                const value = parsedData?.communication?.[field]?.[bodyType];
                const fallback = initialValues?.communication?.[field]?.[bodyType];
                return value !== undefined && value !== null && value !== '' ? value : fallback;
            };

            const newIndividual = res.data.data.employee?.reduce((acc, empObj) => {
                acc[empObj.id] = {
                    id: empObj.id,
                    name: empObj.name,
                    interval: parsedData?.BookingInterval?.intervalForIndividualEmployee?.[empObj.id]?.interval || 5,
                };
                return acc;
            }, {});

            parsedData = {
                ...parsedData,
                BookingInterval: {
                    ...parsedData.BookingInterval,
                    intervalForIndividualEmployee: newIndividual,
                },
                onlineBooking: {
                    ...parsedData?.onlineBooking,
                    outletEmailCancelNotification: parsedData?.onlineBooking?.outletEmailCancelNotification,
                },
                payment_checkout: {
                    enabled: parsedData?.payment_checkout?.enabled ?? initialValues?.payment_checkout?.enabled ?? false,
                    merchant_id:
                        parsedData?.payment_checkout?.merchant_id ?? initialValues?.payment_checkout?.merchant_id ?? '',
                    api_key: parsedData?.payment_checkout?.api_key ?? initialValues?.payment_checkout?.api_key ?? '',
                },
                redirect: {
                    ...parsedData?.redirect,
                    service_ids:
                        parsedData?.redirect?.service_ids && parsedData?.redirect?.service_ids?.length > 0
                            ? parsedData?.redirect?.service_ids
                            : serviceGroup?.map((service) => service?.value) || [],
                },
                policy: res.data.data.policy,
                iframe: {
                    ...parsedData?.iframe,
                    iframeCode: parsedData?.iframe?.iframeCode || embedCode,
                    singlePage: parsedData?.iframe?.singlePage || false,
                    hideBookingStepper: parsedData?.iframe?.hideBookingStepper || false,
                },
                communication: {
                    Sender: parsedData?.communication?.Sender ?? initialValues?.communication?.Sender,
                    OTP: {
                        sms: getSafeBody('OTP', 'sms', 'sms'),
                        email: getSafeBody('OTP', 'email', 'email'),
                        sms_body: getSafeBody('OTP', 'sms', 'sms_body'),
                        email_body: getSafeBody('OTP', 'email', 'email_body'),
                        email_sub: getSafeBody('OTP', 'email', 'email_sub'),
                    },
                    bookingConfirmation: {
                        sms: getSafeBody('bookingConfirmation', 'sms', 'sms'),
                        email: getSafeBody('bookingConfirmation', 'email', 'email'),
                        sms_body: getSafeBody('bookingConfirmation', 'sms', 'sms_body'),
                        email_body: getSafeBody('bookingConfirmation', 'email', 'email_body'),
                        email_sub: getSafeBody('bookingConfirmation', 'email', 'email_sub'),
                    },
                    reminder: {
                        sms: getSafeBody('reminder', 'sms', 'sms'),
                        email: getSafeBody('reminder', 'email', 'email'),
                        reminder_before: outletId === 547 ? 2880 : 1440,
                        reminder_before_booking_start:
                            parsedData?.communication?.reminder?.reminder_before_booking_start ?? null,
                        sms_body: getSafeBody('reminder', 'sms', 'sms_body'),
                        email_body: getSafeBody('reminder', 'email', 'email_body'),
                        email_sub: getSafeBody('reminder', 'email', 'email_sub'),
                    },
                    bookingReschedule: {
                        sms: getSafeBody('bookingReschedule', 'sms', 'sms'),
                        email: getSafeBody('bookingReschedule', 'email', 'email'),
                        sms_body: getSafeBody('bookingReschedule', 'sms', 'sms_body'),
                        email_body: getSafeBody('bookingReschedule', 'email', 'email_body'),
                        email_sub: getSafeBody('bookingReschedule', 'email', 'email_sub'),
                    },
                    cancellation: {
                        sms: getSafeBody('cancellation', 'sms', 'sms'),
                        email: getSafeBody('cancellation', 'email', 'email'),
                        sms_body: getSafeBody('cancellation', 'sms', 'sms_body'),
                        email_body: getSafeBody('cancellation', 'email', 'email_body'),
                        email_sub: getSafeBody('cancellation', 'email', 'email_sub'),
                    },
                    EmailFormrequest: {
                        email: getSafeBody('EmailFormrequest', 'email', 'email'),
                        email_body: getSafeBody('EmailFormrequest', 'email', 'email_body'),
                        email_sub: getSafeBody('EmailFormrequest', 'email', 'email_sub'),
                    },
                    EmailFormConfirm: {
                        email: getSafeBody('EmailFormConfirm', 'email', 'email'),
                        email_body: getSafeBody('EmailFormConfirm', 'email', 'email_body'),
                        email_sub: getSafeBody('EmailFormConfirm', 'email', 'email_sub'),
                    },

                    EmailOnlineFormConfirm: {
                        email: getSafeBody('EmailOnlineFormConfirm', 'email', 'email'),
                        email_body: getSafeBody('EmailOnlineFormConfirm', 'email', 'email_body'),
                        email_sub: getSafeBody('EmailOnlineFormConfirm', 'email', 'email_sub'),
                    },

                    // health declaration
                    health_declaration_initial_email: {
                        email_body: getSafeBody('health_declaration_initial_email', 'email_body', 'email_body'),
                        email_subject: getSafeBody(
                            'health_declaration_initial_email',
                            'email_subject',
                            'email_subject',
                        ),
                    },
                    health_declaration_reminder_email: {
                        email_body: getSafeBody('health_declaration_reminder_email', 'email_body', 'email_body'),
                        email_subject: getSafeBody(
                            'health_declaration_reminder_email',
                            'email_subject',
                            'email_subject',
                        ),
                    },
                },
                inspection_module: {
                    distance_charges: parsedData?.inspection_module?.distance_charges ?? [],
                    bridge_toll: {
                        zip_code_above: parsedData?.inspection_module?.bridge_toll?.zip_code_above ?? 0,
                        amount: parsedData?.inspection_module?.bridge_toll?.amount ?? 0,
                    },
                    cancelation_settings: {
                        cancel_before: parsedData?.inspection_module?.cancelation_settings?.cancel_before ?? 1440,
                        cancelation_charges:
                            parsedData?.inspection_module?.cancelation_settings?.cancelation_charges ?? 0,
                    },
                    email_order_confirmation: parsedData?.inspection_module?.email_order_confirmation ?? true,
                    attach_terms_and_condition: {
                        enable: parsedData?.inspection_module?.attach_terms_and_condition?.enable ?? false,
                        file_id: parsedData?.inspection_module?.attach_terms_and_condition?.file_id ?? null,
                        file_url: parsedData?.inspection_module?.attach_terms_and_condition?.file_url ?? null,
                        file_name: parsedData?.inspection_module?.attach_terms_and_condition?.file_name ?? null,
                    },
                    auto_sms_employee_before_hours:
                        parsedData?.inspection_module?.auto_sms_employee_before_hours ?? 'NO_SMS',
                    file_upload_checkout: {
                        enable: parsedData?.inspection_module?.file_upload_checkout?.enable ?? true,
                        max_files: parsedData?.inspection_module?.file_upload_checkout?.max_files ?? 5,
                        files_required: parsedData?.inspection_module?.file_upload_checkout?.files_required ?? false,
                    },
                    custom_terms_and_conditions: {
                        is_enabled: parsedData?.inspection_module?.custom_terms_and_conditions?.is_enabled || false,
                        url: parsedData?.inspection_module?.custom_terms_and_conditions?.url || '',
                    },
                },
                custom_iframe: {
                    border_color: parsedData?.custom_iframe?.border_color || '#fc985d',
                    button_color: parsedData?.custom_iframe?.button_color || '#fc985d',
                    default_theme: parsedData?.custom_iframe?.default_theme ?? true,
                },
                noShow: {
                    enable: parsedData?.noShow?.enable ?? false,
                    chargeType: parsedData?.noShow?.chargeType ?? 'FIXED',
                    charge: parsedData?.noShow?.charge ?? 250,
                    reminder_days: parsedData?.noShow?.reminder_days ?? 7,
                },
                health_declaration: {
                    email_settings: {
                        initial_email_before_hours:
                            parsedData?.health_declaration?.email_settings?.initial_email_before_hours ?? 24,
                        reminder_email_before_hours:
                            parsedData?.health_declaration?.email_settings?.reminder_email_before_hours ?? 24,
                    },
                },
                termsAndConditions: parsedData?.termsAndConditions ?? '',
                show_employee_above_calendar: parsedData?.show_employee_above_calendar || false,
            };

            setLoading(false);

            setInitialValues({
                ...parsedData,
            });

            formik.setValues({
                ...parsedData,
            });

            return parsedData;
        } catch (error) {
            setLoading(false);
            console.error('error', error);
        }
    };

    const tooltipContent = <div style={{ padding: '5px' }}>content here</div>;

    const handleDataNeedsChange = (option) => {
        const { id, field } = option;
        if (![1, 2].includes(id)) {
            formik.setFieldValue(`DataFromClients.${field}`, !formik.values.DataFromClients[field]);
        }
    };

    const handleEmployeeToggle = (id) => {
        const selectedEmployees = formik.values.onlineBooking.specificEmployee;
        const updatedEmployees = selectedEmployees.includes(id)
            ? selectedEmployees.filter((empId) => empId !== id) // Remove if already selected
            : [...selectedEmployees, id]; // Add if not selected

        formik.setFieldValue('onlineBooking.specificEmployee', updatedEmployees);
    };

    const handleMiniGapCalEmployeeToggle = (id) => {
        const selectedEmployees = formik.values.BookingInterval.miniGapCalEmployee;
        const updatedEmployees = selectedEmployees.includes(id)
            ? selectedEmployees.filter((empId) => empId !== id) // Remove if already selected
            : [...selectedEmployees, id]; // Add if not selected

        formik.setFieldValue('BookingInterval.miniGapCalEmployee', updatedEmployees);
    };

    const handleMiniGapCalEmployeeToggleAll = () => {
        let allEmpId = [];
        if (formik.values.BookingInterval.miniGapCalEmployee.length != Employee.length) {
            allEmpId = Employee.map((empObj) => empObj.id);
        }

        // const selectedEmployees = formik.values.BookingInterval.miniGapCalEmployee;
        // const updatedEmployees = selectedEmployees.includes(id)
        //   ? selectedEmployees.filter((empId) => empId !== id) // Remove if already selected
        //   : [...selectedEmployees, id]; // Add if not selected

        formik.setFieldValue('BookingInterval.miniGapCalEmployee', allEmpId);
    };

    const setIndividualInterval = (id, intervalData) => {
        let updatedInterval = {
            ...formik.values.BookingInterval.intervalForIndividualEmployee,
        };
        updatedInterval[id] = { ...updatedInterval[id], interval: intervalData };
        formik.setFieldValue('BookingInterval.intervalForIndividualEmployee', updatedInterval);
    };

    // const checkPermission = ({ id = 0 }) => {
    //   if (user?.role !== "ADMIN" && !user?.settings?.change_all_calender_interval) {
    //     if (user?.settings?.change_own_calender_interval && user?.id === id) {
    //       return true
    //     }
    //     return false;
    //   }
    //   return true;
    // }

    const isDisable = ({ id = 0, allowToAllOnly = false }) => {
        if (user?.role == 'ADMIN') {
            return false;
        } else {
            if (user?.settings?.change_all_calender_interval) {
                return false;
            } else {
                if (allowToAllOnly) {
                    return true;
                }
                if (user?.settings?.change_own_calender_interval && user?.id === id) {
                    return false;
                }
                return true;
            }
        }
    };

    const fetchServiceGroup = async () => {
        try {
            const response = await apiFetcher.get('/api/v1/store/service_group');
            const formattedServiceGroups = response?.data?.data
                .map((group) => group?.services)
                .flat()
                .filter((service) => service != null && service.id != null)
                .map((service) => ({
                    label: service.name,
                    value: service.id,
                }));

            setServiceGroup(formattedServiceGroups);

            return formattedServiceGroups;
        } catch (error) {
            console.error('Error : ', error);
            return [];
        }
    };

    const getSmsInfo = (smsBodyLength) => {
        if (smsBodyLength <= 0) {
            return { maxChars: 0, numberOfMessages: 0 };
        }

        let maxChars;
        if (smsBodyLength <= 160) {
            maxChars = 160;
        } else if (smsBodyLength <= 480) {
            maxChars = 320;
        } else {
            maxChars = Math.ceil(smsBodyLength / 320) * 320;
        }

        const numberOfMessages = Math.ceil(smsBodyLength / 160);

        return { maxChars, numberOfMessages };
    };

    const getDistanceValidationError = (index) => {
        const charges = formik.values.inspection_module?.distance_charges || [];
        if (charges.length === 0) return null;

        const currentDistance = charges[index]?.distance_upto || 0;

        // Check if current distance is less than or equal to previous
        if (index > 0 && currentDistance <= charges[index - 1].distance_upto) {
            return (
                t('Setting.DistanceMustBeGreaterThanPrevious') || 'Distance must be greater than the previous distance'
            );
        }

        // Check if current distance is greater than or equal to next
        if (index < charges.length - 1 && currentDistance >= charges[index + 1].distance_upto) {
            return t('Setting.DistanceMustBeLessThanNext') || 'Distance must be less than the next distance';
        }

        return null;
    };

    const handleServiceGroupSelect = (e) => {
        const selectedValues = e.target.value;
        let allServiceID = serviceGroup?.map((data) => data.value) || [];

        if (
            (selectedValues === 0 || selectedValues.includes(0)) &&
            allServiceID.length === formik.values?.redirect?.service_ids?.length
        ) {
            formik.setFieldValue('redirect.service_ids', []);
        } else if (selectedValues === 0 || selectedValues.includes(0)) {
            formik.setFieldValue('redirect.service_ids', allServiceID);
        } else if (selectedValues.length === 0) {
            formik.setFieldValue('redirect.service_ids', []);
        } else {
            formik.setFieldValue('redirect.service_ids', selectedValues);
        }
    };

    useEffect(() => {
        console.log('formik.values', formik.values);
    }, [formik.values]);

    const commonProps = {
        formik,
        boolState,
        setBoolState,
        setProps,
        setShowPreview,
        fromDashboard: set?.from_dashboard,
    };

    return (
        <React.Fragment>
            {isChanges && !loading && (
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
                    }}
                >
                    <CommonButton
                        onClick={(e) => {
                            e.preventDefault();
                            setShowToast(true);
                            formik.handleSubmit();
                            formik?.values?.redirect?.enabled && formik.setFieldTouched('redirect.url', true);
                        }}
                        width="auto"
                        ml={'auto'}
                        height={40}
                        title={t('Setting.SaveChanges')}
                        loading={formik.isSubmitting}
                        backgroundColor={formik.isSubmitting && '#eee'}
                        // disabled={formik.isSubmitting}
                    />
                </AppBar>
            )}

            <Stack p={{ xs: 2, md: 2 }}>
                <Stack spacing={6} sx={{ bgcolor: '#fff', borderRadius: '25px', minHeight: '86vh' }}>
                    {/* Online Booking */}
                    <Grid2 container sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Setting.OnlineBooking')} />
                            <SecondaryHeading text={t('Setting.Enable/disableOnlineBooking')} />
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 8 }}>
                            {loading ? (
                                <Stack
                                    flex={1}
                                    flexDirection={'row'}
                                    justifyContent={'space-evenly'}
                                    alignItems={'flex-start'}
                                >
                                    <Stack width="100%" spacing={1}>
                                        <Box
                                            sx={{
                                                width: '52%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                mr: 2,
                                            }}
                                        >
                                            <Skeleton variant="rounded" width="100%" height={48} />
                                        </Box>
                                    </Stack>
                                    <Stack width="100%" spacing={1}>
                                        {[...Array(9)].map((_, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    gap: 4,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: '52%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mr: 2,
                                                    }}
                                                >
                                                    <Skeleton variant="rounded" width="100%" height={48} />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Stack>
                            ) : (
                                <Stack
                                    flex={1}
                                    flexDirection={{ xs: 'column', md: 'row' }}
                                    justifyContent={'space-between'}
                                    alignItems={'flex-start'}
                                    gap={{ xs: 2, md: 0 }}
                                >
                                    {/* Block for Allow Online Booking and Email Notification */}
                                    <Stack
                                        flex={1}
                                        flexDirection={'column'}
                                        justifyContent={'space-evenly'}
                                        alignItems={'flex-start'}
                                        gap={2}
                                        mt={{ xs: 4, md: 0 }}
                                    >
                                        {/* Allow Online Booking */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                width: '100%',
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                {t('Setting.AllowOnlineBooking')}
                                            </Typography>
                                            <FSwitch
                                                checked={formik.values.onlineBooking.allowOnlineBooking}
                                                onChange={(event) => {
                                                    formik.setValues({
                                                        ...formik.values,
                                                        onlineBooking: {
                                                            ...formik.values.onlineBooking,
                                                            allowOnlineBooking: event.target.checked,
                                                        },
                                                    });
                                                }}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                                sx={{
                                                    '& .MuiSwitch-switchBase': {
                                                        '&.Mui-checked': {
                                                            color: '#fff',
                                                        },
                                                        '&.Mui-checked + .MuiSwitch-track': {
                                                            backgroundColor: '#44B904',
                                                        },
                                                    },
                                                    '& .MuiSwitch-track': {
                                                        backgroundColor: '#D9D9D9',
                                                    },
                                                }}
                                            />
                                        </Box>

                                        {/* Email Notification */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                width: '100%',
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                {t('Setting.EmailNotification')}
                                            </Typography>
                                            <FSwitch
                                                checked={formik.values.onlineBooking.outletEmailNotification}
                                                onChange={(event) => {
                                                    formik.setValues({
                                                        ...formik.values,
                                                        onlineBooking: {
                                                            ...formik.values.onlineBooking,
                                                            outletEmailNotification: event.target.checked,
                                                        },
                                                    });
                                                }}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                                sx={{
                                                    '& .MuiSwitch-switchBase': {
                                                        '&.Mui-checked': {
                                                            color: '#fff',
                                                        },
                                                        '&.Mui-checked + .MuiSwitch-track': {
                                                            backgroundColor: '#44B904',
                                                        },
                                                    },
                                                    '& .MuiSwitch-track': {
                                                        backgroundColor: '#D9D9D9',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Stack>

                                    {/* Select Employees Block */}
                                    {formik.values.onlineBooking.allowOnlineBooking && (
                                        <Stack
                                            flex={1}
                                            flexDirection={'column'}
                                            justifyContent={'space-evenly'}
                                            alignItems={'flex-start'}
                                            gap={2}
                                            mt={{ xs: 4, md: 0 }}
                                        >
                                            <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                {t('Setting.SelectEmployees')}
                                            </Typography>
                                            {Employee.map((option, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        width: '100%',
                                                        gap: 4,
                                                        mb: 1,
                                                    }}
                                                >
                                                    <FSwitch
                                                        checked={formik.values.onlineBooking.specificEmployee.includes(
                                                            option.id,
                                                        )}
                                                        onChange={() => handleEmployeeToggle(option.id)}
                                                        sx={{
                                                            '& .MuiSwitch-switchBase': {
                                                                '&.Mui-checked': { color: '#fff' },
                                                                '&.Mui-checked + .MuiSwitch-track': {
                                                                    backgroundColor: '#44B904',
                                                                },
                                                            },
                                                            '& .MuiSwitch-track': {
                                                                backgroundColor: '#D9D9D9',
                                                            },
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body1"
                                                        sx={{ fontWeight: 400, color: '#1F1F1F' }}
                                                    >
                                                        {option.name}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                </Stack>
                            )}
                        </Grid2>
                    </Grid2>

                    {!loading && (
                        <React.Fragment>
                            <Divider sx={{ ...dividerSx }} />

                            {/* Booking Interval */}
                            <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.BookingInterval')} />
                                    <SecondaryHeading text={t('Setting.Description4')} />
                                </Grid2>

                                <Grid2 container size={{ xs: 12, md: 8 }}>
                                    <Stack
                                        flex={1}
                                        flexDirection={{ xs: 'column', md: 'row' }}
                                        justifyContent={'space-evenly'}
                                        alignItems={'flex-start'}
                                        gap={{ xs: 2, md: 0 }}
                                    >
                                        <Stack
                                            flex={1}
                                            width={{ xs: '100%', md: '50%' }}
                                            flexDirection={'column'}
                                            justifyContent={'space-evenly'}
                                            alignItems={'flex-start'}
                                            mt={{ xs: 4, md: 0 }}
                                        >
                                            <Stack
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                    {t('Setting.ChooseIntervalForOnlineBookings')}
                                                </Typography>

                                                <Tooltip arrow title={tooltipContent}>
                                                    <img
                                                        src={TooltipIcon}
                                                        alt="IconOne"
                                                        style={{
                                                            marginLeft: 4,
                                                            width: 18,
                                                            height: 18,
                                                        }}
                                                    />
                                                </Tooltip>
                                            </Stack>
                                            <FSelect
                                                value={formik?.values?.BookingInterval?.intervalForOnlineBooking}
                                                disabled={
                                                    !formik?.values?.BookingInterval?.sameIntervalForAllEmployee &&
                                                    isDisable({ id: user?.id, allowToAllOnly: true })
                                                }
                                                onChange={(event) => {
                                                    formik.setValues({
                                                        ...formik.values,
                                                        BookingInterval: {
                                                            ...formik.values.BookingInterval,
                                                            intervalForOnlineBooking: event.target.value,
                                                        },
                                                    });
                                                }}
                                                options={onlinBookingsIntervals}
                                                sx={{
                                                    width: { xs: '100%', md: '50%' },
                                                    marginTop: 1,
                                                }}
                                            />

                                            <Stack
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    marginTop: 20,
                                                }}
                                            >
                                                <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                    {t('Setting.SameIntervalForAllEmployees')}
                                                </Typography>
                                                <Tooltip arrow title={tooltipContent}>
                                                    <img
                                                        src={TooltipIcon}
                                                        alt="IconOne"
                                                        style={{
                                                            marginLeft: 4,
                                                            width: 18,
                                                            height: 18,
                                                        }}
                                                    />
                                                </Tooltip>
                                            </Stack>

                                            <FSwitch
                                                checked={formik?.values?.BookingInterval?.sameIntervalForAllEmployee}
                                                disabled={isDisable({
                                                    id: user?.id,
                                                    allowToAllOnly: true,
                                                })}
                                                onChange={(event) => {
                                                    formik.setValues({
                                                        ...formik.values,
                                                        BookingInterval: {
                                                            ...formik.values.BookingInterval,
                                                            sameIntervalForAllEmployee: event.target.checked,
                                                        },
                                                    });
                                                }}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                                sx={{
                                                    '& .MuiSwitch-switchBase': {
                                                        '&.Mui-checked': {
                                                            color: '#fff',
                                                        },
                                                        '&.Mui-checked + .MuiSwitch-track': {
                                                            backgroundColor: '#44B904',
                                                        },
                                                    },
                                                    '& .MuiSwitch-track': {
                                                        backgroundColor: '#D9D9D9',
                                                    },
                                                }}
                                            />

                                            {formik?.values?.BookingInterval?.intervalForIndividualEmployee &&
                                                !formik?.values?.BookingInterval?.sameIntervalForAllEmployee &&
                                                Object.values(
                                                    formik?.values?.BookingInterval?.intervalForIndividualEmployee,
                                                ).map((obj) => {
                                                    return (
                                                        !isDisable({ id: obj.id }) && (
                                                            <Stack
                                                                flexDirection={'row'}
                                                                flex={1}
                                                                alignItems={'center'}
                                                                key={obj.id}
                                                            >
                                                                <FSelect
                                                                    width="50%"
                                                                    value={obj?.interval}
                                                                    onChange={(event) => {
                                                                        setIndividualInterval(
                                                                            obj.id,
                                                                            event.target.value,
                                                                        );
                                                                        // formik.setValues({
                                                                        //   ...formik.values,
                                                                        //   BookingInterval: {
                                                                        //     ...formik.values.BookingInterval,
                                                                        //     intervalForOnlineBooking: event.target.value,
                                                                        //   },
                                                                        // });
                                                                    }}
                                                                    options={onlinBookingsIntervals}
                                                                    sx={{
                                                                        max: '50%',
                                                                        marginTop: 1,
                                                                        minWidth: 160,
                                                                    }}
                                                                />
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{
                                                                        color: '#1f1f1f',
                                                                        fontWeight: 700,
                                                                        ml: 2,
                                                                        width: '50%',
                                                                    }}
                                                                >
                                                                    {obj.name}
                                                                </Typography>
                                                            </Stack>
                                                        )
                                                    );
                                                })}
                                        </Stack>
                                        {formik.values.onlineBooking.allowOnlineBooking && (
                                            <Stack
                                                flex={1}
                                                flexDirection={'column'}
                                                justifyContent={'space-evenly'}
                                                alignItems={'flex-start'}
                                            >
                                                <Stack flex={1} flexDirection={'row'} alignItems={'center'}>
                                                    <Typography
                                                        variant="body1"
                                                        sx={{ color: '#1f1f1f', fontWeight: 700 }}
                                                    >
                                                        {t('Setting.MinimizeGapsInTheCalendar')}
                                                    </Typography>
                                                    <Tooltip arrow title={tooltipContent}>
                                                        <img
                                                            src={TooltipIcon}
                                                            alt="IconOne"
                                                            style={{
                                                                marginLeft: 4,
                                                                width: 18,
                                                                height: 18,
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Stack>

                                                {!isDisable({
                                                    id: user?.id,
                                                    allowToAllOnly: true,
                                                }) && (
                                                    <Box
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <FSwitch
                                                            checked={
                                                                formik.values.BookingInterval.miniGapCalEmployee
                                                                    .length == Employee.length
                                                            }
                                                            onChange={() => handleMiniGapCalEmployeeToggleAll()}
                                                            sx={{
                                                                '& .MuiSwitch-switchBase': {
                                                                    '&.Mui-checked': { color: '#fff' },
                                                                    '&.Mui-checked + .MuiSwitch-track': {
                                                                        backgroundColor: '#44B904',
                                                                    },
                                                                },
                                                                '& .MuiSwitch-track': {
                                                                    backgroundColor: '#D9D9D9',
                                                                },
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 400,
                                                                color: '#1F1F1F',
                                                            }}
                                                        >
                                                            {t('Common.All')}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {Employee.map(
                                                    (option, index) =>
                                                        !isDisable({ id: option.id }) && (
                                                            <Box
                                                                key={index}
                                                                style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <FSwitch
                                                                    checked={formik.values.BookingInterval.miniGapCalEmployee.includes(
                                                                        option.id,
                                                                    )}
                                                                    onChange={() =>
                                                                        handleMiniGapCalEmployeeToggle(option.id)
                                                                    }
                                                                    sx={{
                                                                        '& .MuiSwitch-switchBase': {
                                                                            '&.Mui-checked': { color: '#fff' },
                                                                            '&.Mui-checked + .MuiSwitch-track': {
                                                                                backgroundColor: '#44B904',
                                                                            },
                                                                        },
                                                                        '& .MuiSwitch-track': {
                                                                            backgroundColor: '#D9D9D9',
                                                                        },
                                                                    }}
                                                                />
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{
                                                                        fontWeight: 400,
                                                                        color: '#1F1F1F',
                                                                    }}
                                                                >
                                                                    {option.name}
                                                                </Typography>
                                                            </Box>
                                                        ),
                                                )}
                                            </Stack>
                                        )}
                                    </Stack>
                                </Grid2>
                            </Grid2>

                            <Divider sx={{ ...dividerSx }} />

                            {/* Restrictions For Bookings */}
                            <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.RestrictionsForBookings')} />
                                    <SecondaryHeading text={t('Setting.Description5')} />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 8 }}>
                                    {/* How Long Before Customer Book */}
                                    <React.Fragment>
                                        <Stack
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                {t('Setting.HowLongBeforeBookOnline')}
                                            </Typography>

                                            <Tooltip arrow title={tooltipContent}>
                                                <img
                                                    src={TooltipIcon}
                                                    alt="IconOne"
                                                    style={{ marginLeft: 4, width: 18, height: 18 }}
                                                />
                                            </Tooltip>
                                        </Stack>

                                        <FSelect
                                            mt={0}
                                            value={formik?.values?.restrictionForBooking?.howLongBeforeCustomerBook}
                                            onChange={(event) => {
                                                formik.setValues({
                                                    ...formik?.values,
                                                    restrictionForBooking: {
                                                        ...formik?.values?.restrictionForBooking,
                                                        howLongBeforeCustomerBook: event.target.value,
                                                    },
                                                });
                                            }}
                                            options={howLongBeforeCustomerOptions}
                                            sx={{ width: { xs: '100%', md: '25%' } }}
                                        />
                                    </React.Fragment>

                                    {/* How Far Into The Future */}
                                    <React.Fragment>
                                        <Stack
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginTop: 20,
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                {t('Setting.HowFarIntoTheFutureBook')}
                                            </Typography>

                                            <Tooltip arrow title={tooltipContent}>
                                                <img
                                                    src={TooltipIcon}
                                                    alt="IconOne"
                                                    style={{ marginLeft: 4, width: 18, height: 18 }}
                                                />
                                            </Tooltip>
                                        </Stack>

                                        <FSelect
                                            mt={0}
                                            value={formik?.values?.restrictionForBooking?.howFarFutureCustomerbook}
                                            onChange={(event) => {
                                                formik.setValues({
                                                    ...formik?.values,
                                                    restrictionForBooking: {
                                                        ...formik?.values?.restrictionForBooking,
                                                        howFarFutureCustomerbook: event.target.value,
                                                    },
                                                });
                                            }}
                                            options={howFarFutureCustomerOptions}
                                            sx={{ width: { xs: '100%', md: '25%' } }}
                                        />
                                    </React.Fragment>

                                    {/* How Long Before Customer Cancel Booking */}
                                    <React.Fragment>
                                        <Stack
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginTop: 20,
                                            }}
                                            alignItems={'center'}
                                        >
                                            <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                {t('Setting.HowLongBeforeCustomerCancelBooking')}
                                            </Typography>

                                            <Tooltip arrow title={tooltipContent}>
                                                <img
                                                    src={TooltipIcon}
                                                    alt="IconOne"
                                                    style={{ marginLeft: 4, width: 18, height: 18 }}
                                                />
                                            </Tooltip>
                                        </Stack>

                                        <FSelect
                                            mt={0}
                                            value={
                                                formik?.values?.restrictionForBooking
                                                    ?.longBeforeCustomerCancelBookingOptionBook
                                            }
                                            onChange={(event) => {
                                                formik.setValues({
                                                    ...formik?.values,
                                                    restrictionForBooking: {
                                                        ...formik?.values?.restrictionForBooking,
                                                        longBeforeCustomerCancelBookingOptionBook: event.target.value,
                                                    },
                                                });
                                            }}
                                            options={longBeforeCustomerCancelBookingOptions}
                                            sx={{ width: { xs: '100%', md: '25%' } }}
                                        />
                                    </React.Fragment>

                                    {/* Cancellation Policy */}
                                    <React.Fragment>
                                        <Stack
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginTop: 20,
                                            }}
                                            alignItems={'center'}
                                        >
                                            <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                {t('Setting.CancellationPolicy')}
                                            </Typography>

                                            <Tooltip arrow title={tooltipContent}>
                                                <img
                                                    src={TooltipIcon}
                                                    alt="IconOne"
                                                    style={{ marginLeft: 4, width: 18, height: 18 }}
                                                />
                                            </Tooltip>
                                        </Stack>
                                        <FTextArea
                                            minRows={10}
                                            maxRows={40}
                                            mt={0}
                                            value={formik.values.policy}
                                            placeholder={t('Setting.CancellationPolicy')}
                                            onChange={(event) => {
                                                formik.setFieldValue('policy', event.target.value);
                                            }}
                                        />
                                    </React.Fragment>

                                    {/* Message When Customer Tries To Cancel */}
                                    <React.Fragment>
                                        <Stack
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginTop: 20,
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                                {t('Setting.MessageWhenCustomerTriesToCancelTooLate')}
                                            </Typography>

                                            <Tooltip arrow title={tooltipContent}>
                                                <img
                                                    src={TooltipIcon}
                                                    alt="IconOne"
                                                    style={{ marginLeft: 4, width: 18, height: 18 }}
                                                />
                                            </Tooltip>
                                        </Stack>

                                        <CustomTextField
                                            mt={0}
                                            value={formik.values.restrictionForBooking.messageForTooLate}
                                            onChange={(event) => {
                                                formik.setValues({
                                                    ...formik.values,
                                                    restrictionForBooking: {
                                                        ...formik.values.restrictionForBooking,
                                                        messageForTooLate: event.target.value,
                                                    },
                                                });
                                            }}
                                        />
                                    </React.Fragment>
                                </Grid2>
                            </Grid2>

                            <Divider sx={{ ...dividerSx }} />

                            {/* Terms and Conditions */}
                            <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.TermsAndConditionTitleStore')} />
                                    <SecondaryHeading text={t('Setting.TermsAndConditionDescriptionStore')} />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 8 }}>
                                    <PrimaryHeading fontSize={16} text={t('Setting.TermsAndConditionTitle')} />
                                    <FTextArea
                                        placeholder={t('Setting.TermsAndConditionTitleStore')}
                                        minRows={10}
                                        maxRows={40}
                                        mt={0}
                                        value={formik.values.termsAndConditions}
                                        onChange={(e) => formik.setFieldValue('termsAndConditions', e.target.value)}
                                    />
                                </Grid2>
                            </Grid2>

                            <Divider sx={{ ...dividerSx }} />

                            {/* Data You Need From Your Clients */}
                            <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.DataYouNeedFromYourClients')} />
                                    <SecondaryHeading
                                        sx={{ whiteSpace: 'pre-line' }}
                                        text={t('Setting.Description6')}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 8 }} container>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        {dataNeedsFromClintsFirst.map((option, index) => (
                                            <Box
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                <FSwitch
                                                    disabled={option.id === 1 || option.id === 2}
                                                    checked={formik.values.DataFromClients[option.field]}
                                                    onChange={(e) => {
                                                        handleDataNeedsChange(option);
                                                    }}
                                                />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 400,
                                                        color: '#1F1F1F',
                                                    }}
                                                >
                                                    {option.label}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        {dataNeedsFromClintsSec.map((option, index) => (
                                            <Box
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                <FSwitch
                                                    checked={formik.values.DataFromClients[option.field]}
                                                    onChange={() => handleDataNeedsChange(option)}
                                                />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 400,
                                                        color: '#1F1F1F',
                                                    }}
                                                >
                                                    {option.label}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Grid2>
                                </Grid2>
                            </Grid2>

                            <Divider sx={{ ...dividerSx }} />

                            {/* Employee Selection Order */}
                            <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                {(user?.role === 'ADMIN' || user?.settings.view_all_employees) && (
                                    <React.Fragment>
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <PrimaryHeading text={t('Setting.EmployeeSelectionOrder')} />
                                            <SecondaryHeading text={t('Setting.Description7')} />
                                        </Grid2>

                                        <Grid2
                                            size={{ xs: 12, md: 8 }}
                                            sx={{
                                                overflow: 'hidden',
                                                overflowX: 'scroll',
                                                scrollbarWidth: 'none',
                                            }}
                                        >
                                            <Stack sx={{ minWidth: 400 }}>
                                                {Object.keys(reOrderEmp).length > 0 && (
                                                    <MultipleContainers
                                                        modelType={'Emp'}
                                                        itemCount={Object.keys(reOrderEmp).length}
                                                        items={reOrderEmp}
                                                        setItems={setReorderEmp}
                                                        strategy={rectSortingStrategy}
                                                        vertical
                                                        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                                                        onDragToAnotherContainer={(containerId, itemId) => {}}
                                                        onDragComplete={(
                                                            isContainer,
                                                            containerId,
                                                            updatedcontainers,
                                                        ) => {
                                                            let dataToUpdate = [];
                                                            if (isContainer) {
                                                                let newjournalGroups = { ...reOrderEmp };
                                                                updatedcontainers.map((containerId, index) => {
                                                                    if (containerId != 0) {
                                                                        dataToUpdate.push({
                                                                            id: containerId,
                                                                            sequence: index,
                                                                        });
                                                                    }
                                                                    newjournalGroups[containerId].sequence = index;
                                                                });

                                                                setReorderEmp(newjournalGroups);
                                                                updateEmpSequence(dataToUpdate);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                        </Grid2>
                                    </React.Fragment>
                                )}
                            </Grid2>

                            <Divider sx={{ ...dividerSx }} />

                            {/* SMS & Email */}
                            <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={3}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading fontSize={22} text={t('Setting.SMSEmailTitle')} />
                                    <SecondaryHeading
                                        fontColor={'#a0a0a0'}
                                        sx={{ whiteSpace: 'pre-line', mt: 2 }}
                                        text={t('Setting.SMSEmailDesc')}
                                    />
                                </Grid2>

                                <Grid2
                                    size={{ xs: 12, md: 8 }}
                                    sx={{
                                        mt: { xs: 2, md: 0 },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 3,
                                    }}
                                >
                                    <Stack m={0} p={0}>
                                        <Stack gap={3} flex={1} flexDirection={'row'}>
                                            <FPrimaryHeading
                                                variant={'body1'}
                                                fontSize={'auto'}
                                                text={t('Setting.Sender')}
                                            />
                                            <img src={Info} alt="info" style={{ width: '20px' }} />
                                        </Stack>
                                        <FTextInput
                                            sx={{ width: { xs: '100%', sm: '35%' } }}
                                            name="communication.Sender"
                                            inputProps={{ maxLength: 11 }}
                                            mt={0}
                                            value={formik?.values?.communication?.Sender}
                                            placeholder={t('Setting.Sender')}
                                            onChange={(e) => {
                                                formik.setFieldValue('communication.Sender', e.target.value);
                                            }}
                                        />
                                    </Stack>

                                    <Stack m={0} p={0}>
                                        <FPrimaryHeading
                                            variant={'body1'}
                                            fontSize={'auto'}
                                            text={t('Setting.VerifyCustomer')}
                                        />
                                        <Stack
                                            gap={{ xs: 1, sm: 3 }}
                                            flex={1}
                                            flexDirection={{ xs: 'column', sm: 'row' }}
                                        >
                                            <FSwitch
                                                disabled={!set?.profile?.enable_sms}
                                                sx={{ width: { xs: 'auto ', sm: '35%' } }}
                                                label={t('Calendar.SMS')}
                                                checked={
                                                    set?.profile?.enable_sms && formik?.values?.communication?.OTP?.sms
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue('communication.OTP.sms', e.target.checked)
                                                }
                                            />

                                            {/* THIS IS REMOVED BECAUSE EMAIL IS OPTIONAL FIELD SO NO EFFECTED VALIDATED FORM API SIDE  */}
                                            {/* <FSwitch
                                                disabled={!set?.profile?.enable_email}
                                                sx={{ width: { xs: 'auto ', sm: '65%' } }}
                                                label={t('Setting.Email')}
                                                checked={
                                                    set?.profile?.enable_email &&
                                                    formik?.values?.communication?.OTP?.email
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue('communication.OTP.email', e.target.checked)
                                                }
                                            /> */}
                                        </Stack>
                                    </Stack>

                                    <Stack m={0} p={0}>
                                        <FPrimaryHeading
                                            variant={'body1'}
                                            fontSize={'auto'}
                                            text={t('Setting.BkConf')}
                                        />
                                        <Stack
                                            gap={{ xs: 1, sm: 3 }}
                                            flex={1}
                                            flexDirection={{ xs: 'column', sm: 'row' }}
                                        >
                                            <FSwitch
                                                disabled={!set?.profile?.enable_sms}
                                                sx={{ width: { xs: 'auto ', sm: '35%' } }}
                                                label={t('Calendar.SMS')}
                                                checked={
                                                    set?.profile?.enable_sms &&
                                                    formik?.values?.communication?.bookingConfirmation?.sms
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'communication.bookingConfirmation.sms',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <FSwitch
                                                disabled={!set?.profile?.enable_email}
                                                sx={{ width: { xs: 'auto ', sm: '65%' } }}
                                                label={t('Setting.Email')}
                                                checked={
                                                    set?.profile?.enable_email &&
                                                    formik?.values?.communication?.bookingConfirmation?.email
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'communication.bookingConfirmation.email',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                        </Stack>
                                    </Stack>

                                    <Stack
                                        m={0}
                                        p={0}
                                        gap={{ xs: 1, sm: 3 }}
                                        flexDirection={{ xs: 'column', sm: 'row' }}
                                    >
                                        <Stack m={0} p={0} width={{ xs: 'auto', sm: '35%' }}>
                                            <Typography
                                                onClick={(e) => {
                                                    setBoolState({
                                                        ...boolState,
                                                        bookingConfirmation: {
                                                            ...boolState?.bookingConfirmation,
                                                            ShowSMS: !boolState?.bookingConfirmation?.ShowSMS,
                                                        },
                                                    });
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}
                                                noWrap
                                                color="#1F1F1F"
                                            >
                                                {t('Setting.SmsConMsg')}
                                                <IconButton
                                                    sx={{
                                                        transform: boolState?.bookingConfirmation?.ShowSMS
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                    }}
                                                    disableFocusRipple
                                                    disableRipple
                                                    disableTouchRipple
                                                >
                                                    <img src={ArrowDown} alt="" />
                                                </IconButton>
                                            </Typography>
                                            {boolState?.bookingConfirmation?.ShowSMS && (
                                                <React.Fragment>
                                                    <FTextArea
                                                        m={0}
                                                        borderRadius={5}
                                                        borderColor="#D9D9D9"
                                                        disabled={
                                                            !formik?.values?.communication?.bookingConfirmation?.sms ||
                                                            !set?.profile?.enable_sms
                                                        }
                                                        bgColor={
                                                            (!formik?.values?.communication?.bookingConfirmation?.sms ||
                                                                !set?.profile?.enable_sms) &&
                                                            '#D9D9D9'
                                                        }
                                                        fontColor="#1F1F1F"
                                                        value={
                                                            formik?.values?.communication?.bookingConfirmation?.sms_body
                                                        }
                                                        onChange={(e) =>
                                                            formik.setFieldValue(
                                                                'communication.bookingConfirmation.sms_body',
                                                                e.target.value,
                                                            )
                                                        }
                                                        // InputProps={{ maxLength: 320 }}
                                                        placeholder={'bahlou'}
                                                        rows={10}
                                                    />
                                                    <Typography fontSize={20} color="#1F1F1F">
                                                        {formik?.values?.communication?.bookingConfirmation?.sms_body
                                                            ?.length || 0}
                                                        /
                                                        {
                                                            getSmsInfo(
                                                                formik?.values?.communication?.bookingConfirmation
                                                                    ?.sms_body?.length,
                                                            ).maxChars
                                                        }
                                                        &nbsp; {t('Setting.Chars')}
                                                        {/* lenght / 160 (sms) */}
                                                        {` (${
                                                            getSmsInfo(
                                                                formik?.values?.communication?.bookingConfirmation
                                                                    ?.sms_body?.length,
                                                            ).numberOfMessages
                                                        } sms)`}
                                                        {getSmsInfo(
                                                            formik?.values?.communication?.bookingConfirmation?.sms_body
                                                                ?.length,
                                                        ).numberOfMessages > 1 && (
                                                            <img
                                                                src={Warning}
                                                                style={{ transform: 'translateY(-2px)' }}
                                                                alt="warning"
                                                            />
                                                        )}
                                                    </Typography>
                                                </React.Fragment>
                                            )}
                                        </Stack>

                                        <Stack m={0} p={0} width={{ xs: 'auto', sm: '65%' }}>
                                            <Typography
                                                onClick={(e) => {
                                                    setBoolState({
                                                        ...boolState,
                                                        bookingConfirmation: {
                                                            ...boolState?.bookingConfirmation,
                                                            ShowEmail: !boolState?.bookingConfirmation?.ShowEmail,
                                                        },
                                                    });
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}
                                                noWrap
                                                color="#1F1F1F"
                                            >
                                                {t('Setting.EmailConMsg')}
                                                <IconButton
                                                    sx={{
                                                        transform: boolState?.bookingConfirmation?.ShowEmail
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                    }}
                                                    disableFocusRipple
                                                    disableRipple
                                                    disableTouchRipple
                                                >
                                                    <img src={ArrowDown} alt="" />
                                                </IconButton>
                                            </Typography>
                                            {boolState?.bookingConfirmation?.ShowEmail && (
                                                <React.Fragment>
                                                    {set?.from_dashboard && (
                                                        <React.Fragment>
                                                            <FTextInput
                                                                mt={0}
                                                                disabled={
                                                                    !(
                                                                        set?.from_dashboard &&
                                                                        formik?.values?.communication
                                                                            ?.bookingConfirmation?.email
                                                                    )
                                                                }
                                                                bgColor={
                                                                    !(
                                                                        set?.from_dashboard &&
                                                                        formik?.values?.communication
                                                                            ?.bookingConfirmation?.email
                                                                    ) && '#D9D9D9'
                                                                }
                                                                value={
                                                                    formik?.values?.communication?.bookingConfirmation
                                                                        ?.email_sub
                                                                }
                                                                placeholder={t('Setting.Subject')}
                                                                onChange={(e) => {
                                                                    formik.setFieldValue(
                                                                        'communication.bookingConfirmation.email_sub',
                                                                        e.target.value,
                                                                    );
                                                                }}
                                                                onBlur={(e) => {
                                                                    formik.setFieldTouched(
                                                                        'communication.bookingConfirmation.email_sub',
                                                                        true,
                                                                    );
                                                                }}
                                                            />
                                                            {(formik.touched.communication?.bookingConfirmation
                                                                ?.email_sub ||
                                                                formik?.errors?.communication?.bookingConfirmation
                                                                    ?.email_sub) && (
                                                                <Typography style={{ color: 'red' }}>
                                                                    {
                                                                        formik?.errors?.communication
                                                                            ?.bookingConfirmation?.email_sub
                                                                    }
                                                                </Typography>
                                                            )}

                                                            <FTextArea
                                                                m={0}
                                                                disabled={
                                                                    !formik?.values?.communication?.bookingConfirmation
                                                                        ?.email
                                                                }
                                                                bgColor={
                                                                    !formik?.values?.communication?.bookingConfirmation
                                                                        ?.email && '#D9D9D9'
                                                                }
                                                                borderRadius={5}
                                                                fontColor="#1F1F1F"
                                                                borderColor="#D9D9D9"
                                                                value={
                                                                    formik?.values?.communication?.bookingConfirmation
                                                                        ?.email_body
                                                                }
                                                                onChange={(e) =>
                                                                    formik.setFieldValue(
                                                                        'communication.bookingConfirmation.email_body',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder={'bahlou'}
                                                                rows={8}
                                                            />
                                                        </React.Fragment>
                                                    )}

                                                    <FButton
                                                        startIcon={<Visibility />}
                                                        sx={{ width: { xs: '100%', md: '30%', marginTop: '12px' } }}
                                                        variant="save"
                                                        title={t('Setting.Preview')}
                                                        disabled={
                                                            !formik?.values?.communication?.bookingConfirmation?.email
                                                        }
                                                        onClick={() => {
                                                            setProps({
                                                                content:
                                                                    formik?.values?.communication?.bookingConfirmation
                                                                        ?.email_body,
                                                                title: 'Confirmation SMS',
                                                            });
                                                            setShowPreview(true);
                                                        }}
                                                    />
                                                </React.Fragment>
                                            )}
                                        </Stack>
                                    </Stack>

                                    <Stack m={0} p={0}>
                                        <FPrimaryHeading
                                            variant={'body1'}
                                            fontSize={'auto'}
                                            text={t('Setting.BkReminder')}
                                        />
                                        <Stack
                                            gap={{ xs: 1, sm: 3 }}
                                            flex={1}
                                            flexDirection={{ xs: 'column', sm: 'row' }}
                                        >
                                            <FSwitch
                                                disabled={!set?.profile?.enable_sms}
                                                sx={{ width: { xs: 'auto ', sm: '35%' } }}
                                                label={t('Calendar.SMS')}
                                                checked={
                                                    set?.profile?.enable_sms &&
                                                    formik?.values?.communication?.reminder?.sms
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue('communication.reminder.sms', e.target.checked)
                                                }
                                            />
                                            <FSwitch
                                                disabled={!set?.profile?.enable_email}
                                                sx={{ width: { xs: 'auto ', sm: '65%' } }}
                                                label={t('Setting.Email')}
                                                checked={
                                                    set?.profile?.enable_email &&
                                                    formik?.values?.communication?.reminder?.email
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'communication.reminder.email',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                        </Stack>
                                    </Stack>

                                    <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                                        {/* <Stack gap={1} width={{ xs: '100%', md: '35%' }}>
                                            <FPrimaryHeading
                                                variant={'body1'}
                                                fontSize={'auto'}
                                                text={t('Setting.BkReminderBeforeMinutes')}
                                            />
                                            <FSelect
                                                sx={{ width: '100%' }}
                                                defaultValue={5}
                                                options={[
                                                    { value: 5, label: `5 ${t('POS.Minutes')}` },
                                                    { value: 10, label: `10 ${t('POS.Minutes')}` },
                                                    { value: 15, label: `15 ${t('POS.Minutes')}` },
                                                ]}
                                                value={
                                                    formik?.values?.communication?.reminder
                                                        ?.reminder_before_booking_start
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'communication.reminder.reminder_before_booking_start',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Stack> */}

                                        <Stack gap={1} width={{ xs: '100%', md: '35%' }} maxWidth={'300px'}>
                                            <FPrimaryHeading
                                                variant={'body1'}
                                                fontSize={'auto'}
                                                text={t('Setting.BkReminderDesc')}
                                            />
                                            <FSelect
                                                sx={{ width: '100%' }}
                                                defaultValue={outletId === 547 ? 2880 : 1440}
                                                disabled={true}
                                                options={[
                                                    // { value: 120, label: "2 hours" },
                                                    // { value: 360, label: "6 hours" },
                                                    // { value: 720, label: "12 hours" },
                                                    { value: 1440, label: '24 hours (standard)' },
                                                    { value: 2880, label: '48 hours' },
                                                ]}
                                                // value={formik?.values?.communication?.reminder?.reminder_before}
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'communication.reminder.reminder_before',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Stack>
                                    </Stack>

                                    <Stack
                                        m={0}
                                        p={0}
                                        gap={{ xs: 1, sm: 3 }}
                                        flexDirection={{ xs: 'column', sm: 'row' }}
                                    >
                                        <Stack m={0} p={0} width={{ xs: 'auto', sm: '35%' }}>
                                            <Typography
                                                onClick={() => {
                                                    setBoolState({
                                                        ...boolState,
                                                        reminder: {
                                                            ...boolState?.reminder,
                                                            ShowSMS: !boolState?.reminder?.ShowSMS,
                                                        },
                                                    });
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}
                                                noWrap
                                                color="#1F1F1F"
                                            >
                                                {t('Setting.SmsConMsg')}
                                                <IconButton
                                                    sx={{
                                                        transform: boolState?.reminder?.ShowSMS
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                    }}
                                                    disableFocusRipple
                                                    disableRipple
                                                    disableTouchRipple
                                                >
                                                    <img src={ArrowDown} alt="" />
                                                </IconButton>
                                            </Typography>

                                            {boolState?.reminder?.ShowSMS && (
                                                <React.Fragment>
                                                    <FTextArea
                                                        m={0}
                                                        disabled={
                                                            !formik?.values?.communication?.reminder?.sms ||
                                                            !set?.profile?.enable_sms
                                                        }
                                                        bgColor={
                                                            (!formik?.values?.communication?.reminder?.sms ||
                                                                !set?.profile?.enable_sms) &&
                                                            '#D9D9D9'
                                                        }
                                                        fontColor="#1F1F1F"
                                                        borderRadius={5}
                                                        borderColor="#D9D9D9"
                                                        value={formik?.values?.communication?.reminder?.sms_body}
                                                        onChange={(e) =>
                                                            formik.setFieldValue(
                                                                'communication.reminder.sms_body',
                                                                e.target.value,
                                                            )
                                                        }
                                                        // InputProps={{ maxLength: 160 }}
                                                        placeholder={'bahlou'}
                                                        rows={10}
                                                    />
                                                    <Typography fontSize={20} color="#1F1F1F">
                                                        {formik?.values?.communication?.reminder?.sms_body?.length || 0}
                                                        /
                                                        {
                                                            getSmsInfo(
                                                                formik?.values?.communication?.reminder?.sms_body
                                                                    ?.length,
                                                            ).maxChars
                                                        }
                                                        &nbsp; {t('Setting.Chars')}
                                                        {/* lenght / 160 (sms) */}
                                                        {` (${
                                                            getSmsInfo(
                                                                formik?.values?.communication?.reminder?.sms_body
                                                                    ?.length,
                                                            ).numberOfMessages
                                                        } sms)`}
                                                        {getSmsInfo(
                                                            formik?.values?.communication?.reminder?.sms_body?.length,
                                                        ).numberOfMessages > 1 && (
                                                            <img
                                                                src={Warning}
                                                                style={{ transform: 'translateY(-2px)' }}
                                                                alt="warning"
                                                            />
                                                        )}
                                                    </Typography>
                                                </React.Fragment>
                                            )}
                                        </Stack>

                                        <Stack m={0} p={0} width={{ xs: 'auto', sm: '65%' }}>
                                            <Typography
                                                onClick={() => {
                                                    setBoolState({
                                                        ...boolState,
                                                        reminder: {
                                                            ...boolState?.reminder,
                                                            ShowEmail: !boolState?.reminder?.ShowEmail,
                                                        },
                                                    });
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}
                                                noWrap
                                                color="#1F1F1F"
                                            >
                                                {t('Setting.EmailConMsg')}
                                                <IconButton
                                                    sx={{
                                                        transform: boolState?.reminder?.ShowEmail
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                    }}
                                                    disableFocusRipple
                                                    disableRipple
                                                    disableTouchRipple
                                                >
                                                    <img src={ArrowDown} alt="" />
                                                </IconButton>
                                            </Typography>
                                            {boolState?.reminder?.ShowEmail && (
                                                <React.Fragment>
                                                    {set?.from_dashboard && (
                                                        <React.Fragment>
                                                            <FTextInput
                                                                mt={0}
                                                                disabled={
                                                                    !(
                                                                        set?.from_dashboard &&
                                                                        formik?.values?.communication?.reminder?.email
                                                                    )
                                                                }
                                                                bgColor={
                                                                    !(
                                                                        set?.from_dashboard &&
                                                                        formik?.values?.communication?.reminder?.email
                                                                    ) && '#D9D9D9'
                                                                }
                                                                value={
                                                                    formik?.values?.communication?.reminder?.email_sub
                                                                }
                                                                placeholder={t('Setting.Subject')}
                                                                onChange={(e) => {
                                                                    formik.setFieldValue(
                                                                        'communication.reminder.email_sub',
                                                                        e.target.value,
                                                                    );
                                                                }}
                                                                onBlur={() => {
                                                                    formik.setFieldTouched(
                                                                        'communication.reminder.email_sub',
                                                                    );
                                                                }}
                                                            />
                                                            {(formik.touched.communication?.reminder?.email_sub ||
                                                                formik?.errors?.communication?.reminder?.email_sub) && (
                                                                <Typography style={{ color: 'red' }}>
                                                                    {formik?.errors?.communication?.reminder?.email_sub}
                                                                </Typography>
                                                            )}

                                                            <FTextArea
                                                                m={0}
                                                                disabled={
                                                                    !formik?.values?.communication?.reminder?.email
                                                                }
                                                                bgColor={
                                                                    !formik?.values?.communication?.reminder?.email &&
                                                                    '#D9D9D9'
                                                                }
                                                                borderRadius={5}
                                                                fontColor="#1F1F1F"
                                                                borderColor="#D9D9D9"
                                                                value={
                                                                    formik?.values?.communication?.reminder?.email_body
                                                                }
                                                                onChange={(e) =>
                                                                    formik.setFieldValue(
                                                                        'communication.reminder.email_body',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder={'bahlou'}
                                                                rows={8}
                                                            />
                                                        </React.Fragment>
                                                    )}

                                                    <FButton
                                                        startIcon={<Visibility />}
                                                        sx={{ width: { xs: '100%', md: '30%', marginTop: '12px' } }}
                                                        variant="save"
                                                        title={t('Setting.Preview')}
                                                        disabled={!formik?.values?.communication?.reminder?.email}
                                                        onClick={() => {
                                                            setProps({
                                                                content:
                                                                    formik?.values?.communication?.reminder?.email_body,
                                                                title: 'Confirmation SMS',
                                                            });
                                                            setShowPreview(true);
                                                        }}
                                                    />
                                                </React.Fragment>
                                            )}
                                        </Stack>
                                    </Stack>

                                    <Stack m={0} p={0}>
                                        <FPrimaryHeading
                                            variant={'body1'}
                                            fontSize={'auto'}
                                            text={t('Setting.BkCancellation')}
                                        />
                                        <Stack
                                            gap={{ xs: 1, sm: 3 }}
                                            flex={1}
                                            flexDirection={{ xs: 'column', sm: 'row' }}
                                        >
                                            <FSwitch
                                                disabled={!set?.profile?.enable_sms}
                                                sx={{ width: { xs: 'auto ', sm: '35%' } }}
                                                label={t('Calendar.SMS')}
                                                checked={
                                                    set?.profile?.enable_sms &&
                                                    formik?.values?.communication?.cancellation?.sms
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'communication.cancellation.sms',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <FSwitch
                                                disabled={!set?.profile?.enable_email}
                                                sx={{ width: { xs: 'auto ', sm: '65%' } }}
                                                label={t('Setting.Email')}
                                                checked={
                                                    set?.profile?.enable_email &&
                                                    formik?.values?.communication?.cancellation?.email
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'communication.cancellation.email',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                        </Stack>
                                    </Stack>

                                    <Stack
                                        m={0}
                                        p={0}
                                        gap={{ xs: 1, sm: 3 }}
                                        flexDirection={{ xs: 'column', sm: 'row' }}
                                    >
                                        <Stack m={0} p={0} width={{ xs: 'auto', sm: '35%' }}>
                                            <Typography
                                                onClick={() => {
                                                    setBoolState({
                                                        ...boolState,
                                                        cancellation: {
                                                            ...boolState?.cancellation,
                                                            ShowSMS: !boolState?.cancellation?.ShowSMS,
                                                        },
                                                    });
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}
                                                noWrap
                                                color="#1F1F1F"
                                            >
                                                {t('Setting.SmsConMsg')}
                                                <IconButton
                                                    sx={{
                                                        transform: boolState?.cancellation?.ShowSMS
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                    }}
                                                    disableFocusRipple
                                                    disableRipple
                                                    disableTouchRipple
                                                >
                                                    <img src={ArrowDown} alt="" />
                                                </IconButton>
                                            </Typography>

                                            {boolState?.cancellation?.ShowSMS && (
                                                <React.Fragment>
                                                    <FTextArea
                                                        m={0}
                                                        disabled={
                                                            !formik?.values?.communication?.cancellation?.sms ||
                                                            !set?.profile?.enable_sms
                                                        }
                                                        bgColor={
                                                            (!formik?.values?.communication?.cancellation?.sms ||
                                                                !set?.profile?.enable_sms) &&
                                                            '#D9D9D9'
                                                        }
                                                        fontColor="#1F1F1F"
                                                        borderRadius={5}
                                                        borderColor="#D9D9D9"
                                                        value={formik?.values?.communication?.cancellation?.sms_body}
                                                        onChange={(e) =>
                                                            formik.setFieldValue(
                                                                'communication.cancellation.sms_body',
                                                                e.target.value,
                                                            )
                                                        }
                                                        // InputProps={{ maxLength: 160 }}
                                                        placeholder={'bahlou'}
                                                        rows={10}
                                                    />
                                                    <Typography fontSize={20} color="#1F1F1F">
                                                        {formik?.values?.communication?.cancellation?.sms_body
                                                            ?.length || 0}
                                                        /
                                                        {
                                                            getSmsInfo(
                                                                formik?.values?.communication?.cancellation?.sms_body
                                                                    ?.length,
                                                            ).maxChars
                                                        }
                                                        &nbsp; {t('Setting.Chars')}
                                                        {/* lenght / 160 (sms) */}
                                                        {` (${
                                                            getSmsInfo(
                                                                formik?.values?.communication?.cancellation?.sms_body
                                                                    ?.length,
                                                            ).numberOfMessages
                                                        } sms)`}
                                                        {getSmsInfo(
                                                            formik?.values?.communication?.cancellation?.sms_body
                                                                ?.length,
                                                        ).numberOfMessages > 1 && (
                                                            <img
                                                                src={Warning}
                                                                style={{ transform: 'translateY(-2px)' }}
                                                                alt="warning"
                                                            />
                                                        )}
                                                    </Typography>
                                                </React.Fragment>
                                            )}
                                        </Stack>

                                        <Stack m={0} p={0} width={{ xs: 'auto', sm: '65%' }}>
                                            <Typography
                                                onClick={() => {
                                                    setBoolState({
                                                        ...boolState,
                                                        cancellation: {
                                                            ...boolState?.cancellation,
                                                            ShowEmail: !boolState?.cancellation?.ShowEmail,
                                                        },
                                                    });
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}
                                                noWrap
                                                color="#1F1F1F"
                                            >
                                                {t('Setting.EmailConMsg')}
                                                <IconButton
                                                    sx={{
                                                        transform: boolState?.cancellation?.ShowEmail
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                    }}
                                                    disableFocusRipple
                                                    disableRipple
                                                    disableTouchRipple
                                                >
                                                    <img src={ArrowDown} alt="" />
                                                </IconButton>
                                            </Typography>
                                            {boolState?.cancellation?.ShowEmail && (
                                                <React.Fragment>
                                                    {set?.from_dashboard && (
                                                        <React.Fragment>
                                                            <FTextInput
                                                                mt={0}
                                                                disabled={
                                                                    !(
                                                                        set?.from_dashboard &&
                                                                        formik?.values?.communication?.cancellation
                                                                            ?.email
                                                                    )
                                                                }
                                                                bgColor={
                                                                    !(
                                                                        set?.from_dashboard &&
                                                                        formik?.values?.communication?.cancellation
                                                                            ?.email
                                                                    ) && '#D9D9D9'
                                                                }
                                                                value={
                                                                    formik?.values?.communication?.cancellation
                                                                        ?.email_sub
                                                                }
                                                                placeholder={t('Setting.Subject')}
                                                                onChange={(e) => {
                                                                    formik.setFieldValue(
                                                                        'communication.cancellation.email_sub',
                                                                        e.target.value,
                                                                    );
                                                                }}
                                                                onBlur={(e) => {
                                                                    formik.setFieldValue(
                                                                        'communication.cancellation.email_sub',
                                                                        e.target.value,
                                                                    );
                                                                }}
                                                            />
                                                            {(formik.touched.communication?.cancellation?.email_sub ||
                                                                formik?.errors?.communication?.cancellation
                                                                    ?.email_sub) && (
                                                                <Typography style={{ color: 'red' }}>
                                                                    {
                                                                        formik?.errors?.communication?.cancellation
                                                                            ?.email_sub
                                                                    }
                                                                </Typography>
                                                            )}

                                                            <FTextArea
                                                                m={0}
                                                                disabled={
                                                                    !formik?.values?.communication?.cancellation?.email
                                                                }
                                                                bgColor={
                                                                    !formik?.values?.communication?.cancellation
                                                                        ?.email && '#D9D9D9'
                                                                }
                                                                borderRadius={5}
                                                                fontColor="#1F1F1F"
                                                                borderColor="#D9D9D9"
                                                                value={
                                                                    formik?.values?.communication?.cancellation
                                                                        ?.email_body
                                                                }
                                                                onChange={(e) =>
                                                                    formik.setFieldValue(
                                                                        'communication.cancellation.email_body',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder={'bahlou'}
                                                                rows={8}
                                                            />
                                                        </React.Fragment>
                                                    )}

                                                    <FButton
                                                        startIcon={<Visibility />}
                                                        sx={{ width: { xs: '100%', md: '30%', marginTop: '12px' } }}
                                                        variant="save"
                                                        title={t('Setting.Preview')}
                                                        disabled={!formik?.values?.communication?.cancellation?.email}
                                                        onClick={() => {
                                                            setProps({
                                                                content:
                                                                    formik?.values?.communication?.cancellation
                                                                        ?.email_body,
                                                                title: 'Confirmation SMS',
                                                            });
                                                            setShowPreview(true);
                                                        }}
                                                    />
                                                </React.Fragment>
                                            )}
                                        </Stack>
                                    </Stack>

                                    <Stack m={0} p={0}>
                                        <FPrimaryHeading
                                            variant={'body1'}
                                            fontSize={'auto'}
                                            text={t('Setting.BkResch')}
                                        />
                                        <Stack
                                            gap={{ xs: 1, sm: 3 }}
                                            flex={1}
                                            flexDirection={{ xs: 'column', sm: 'row' }}
                                        >
                                            <FSwitch
                                                disabled={!set?.profile?.enable_sms}
                                                sx={{ width: { xs: 'auto ', sm: '35%' } }}
                                                label={t('Calendar.SMS')}
                                                checked={
                                                    set?.profile?.enable_sms &&
                                                    formik?.values?.communication?.bookingReschedule?.sms
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'communication.bookingReschedule.sms',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <FSwitch
                                                disabled={!set?.profile?.enable_email}
                                                sx={{ width: { xs: 'auto ', sm: '65%' } }}
                                                label={t('Setting.Email')}
                                                checked={
                                                    set?.profile?.enable_email &&
                                                    formik?.values?.communication?.bookingReschedule?.email
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'communication.bookingReschedule.email',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                        </Stack>
                                    </Stack>

                                    <Stack
                                        m={0}
                                        p={0}
                                        gap={{ xs: 1, sm: 3 }}
                                        flexDirection={{ xs: 'column', sm: 'row' }}
                                    >
                                        <Stack width={{ xs: 'auto', sm: '35%' }}>
                                            <Typography
                                                disableTouchRipple
                                                onClick={(e) => {
                                                    setBoolState({
                                                        ...boolState,
                                                        bookingReschedule: {
                                                            ...boolState?.bookingReschedule,
                                                            ShowSMS: !boolState?.bookingReschedule?.ShowSMS,
                                                        },
                                                    });
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}
                                                noWrap
                                                color="#1F1F1F"
                                            >
                                                {t('Setting.SmsConMsg')}
                                                <IconButton
                                                    sx={{
                                                        transform: boolState?.bookingReschedule?.ShowSMS
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                    }}
                                                    disableFocusRipple
                                                    disableRipple
                                                >
                                                    <img src={ArrowDown} alt="" />
                                                </IconButton>
                                            </Typography>
                                            {boolState?.bookingReschedule?.ShowSMS && (
                                                <React.Fragment>
                                                    <FTextArea
                                                        m={0}
                                                        borderRadius={5}
                                                        borderColor="#D9D9D9"
                                                        disabled={
                                                            !formik?.values?.communication?.bookingReschedule?.sms ||
                                                            !set?.profile?.enable_sms
                                                        }
                                                        bgColor={
                                                            (!formik?.values?.communication?.bookingReschedule?.sms ||
                                                                !set?.profile?.enable_sms) &&
                                                            '#D9D9D9'
                                                        }
                                                        fontColor="#1F1F1F"
                                                        value={
                                                            formik?.values?.communication?.bookingReschedule?.sms_body
                                                        }
                                                        onChange={(e) =>
                                                            formik.setFieldValue(
                                                                'communication.bookingReschedule.sms_body',
                                                                e.target.value,
                                                            )
                                                        }
                                                        // InputProps={{ maxLength: 320 }}
                                                        placeholder={'bahlou'}
                                                        rows={10}
                                                    />
                                                    <Typography fontSize={20} color="#1F1F1F">
                                                        {formik?.values?.communication?.bookingReschedule?.sms_body
                                                            ?.length || 0}
                                                        /
                                                        {
                                                            getSmsInfo(
                                                                formik?.values?.communication?.bookingReschedule
                                                                    ?.sms_body?.length,
                                                            ).maxChars
                                                        }
                                                        &nbsp; {t('Setting.Chars')}
                                                        {/* lenght / 160 (sms) */}
                                                        {` (${
                                                            getSmsInfo(
                                                                formik?.values?.communication?.bookingReschedule
                                                                    ?.sms_body?.length,
                                                            ).numberOfMessages
                                                        } sms)`}
                                                        {getSmsInfo(
                                                            formik?.values?.communication?.bookingReschedule?.sms_body
                                                                ?.length,
                                                        ).numberOfMessages > 1 && (
                                                            <img
                                                                src={Warning}
                                                                style={{ transform: 'translateY(-2px)' }}
                                                                alt="warning"
                                                            />
                                                        )}
                                                    </Typography>
                                                </React.Fragment>
                                            )}
                                        </Stack>

                                        <Stack width={{ xs: 'auto', sm: '65%' }}>
                                            <Typography
                                                onClick={(e) => {
                                                    setBoolState({
                                                        ...boolState,
                                                        bookingReschedule: {
                                                            ...boolState?.bookingReschedule,
                                                            ShowEmail: !boolState?.bookingReschedule?.ShowEmail,
                                                        },
                                                    });
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}
                                                noWrap
                                                color="#1F1F1F"
                                            >
                                                {t('Setting.EmailConMsg')}
                                                <IconButton
                                                    sx={{
                                                        transform: boolState?.bookingReschedule?.ShowEmail
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                    }}
                                                    disableFocusRipple
                                                    disableRipple
                                                    disableTouchRipple
                                                >
                                                    <img src={ArrowDown} alt="" />
                                                </IconButton>
                                            </Typography>
                                            {boolState?.bookingReschedule?.ShowEmail && (
                                                <React.Fragment>
                                                    {set?.from_dashboard && (
                                                        <React.Fragment>
                                                            <FTextInput
                                                                mt={0}
                                                                disabled={
                                                                    !(
                                                                        set?.from_dashboard &&
                                                                        formik?.values?.communication?.bookingReschedule
                                                                            ?.email
                                                                    )
                                                                }
                                                                bgColor={
                                                                    !(
                                                                        set?.from_dashboard &&
                                                                        formik?.values?.communication?.bookingReschedule
                                                                            ?.email
                                                                    ) && '#D9D9D9'
                                                                }
                                                                value={
                                                                    formik?.values?.communication?.bookingReschedule
                                                                        ?.email_sub
                                                                }
                                                                placeholder={t('Setting.Subject')}
                                                                onChange={(e) => {
                                                                    formik.setFieldValue(
                                                                        'communication.bookingReschedule.email_sub',
                                                                        e.target.value,
                                                                    );
                                                                }}
                                                                onBlur={() => {
                                                                    formik.setFieldTouched(
                                                                        'communication.bookingReschedule.email_sub',
                                                                        true,
                                                                    );
                                                                }}
                                                            />
                                                            {(formik.touched.communication?.bookingReschedule
                                                                ?.email_sub ||
                                                                formik?.errors?.communication?.bookingReschedule
                                                                    ?.email_sub) && (
                                                                <Typography style={{ color: 'red' }}>
                                                                    {
                                                                        formik?.errors?.communication?.bookingReschedule
                                                                            ?.email_sub
                                                                    }
                                                                </Typography>
                                                            )}

                                                            <FTextArea
                                                                m={0}
                                                                disabled={
                                                                    !formik?.values?.communication?.bookingReschedule
                                                                        ?.email
                                                                }
                                                                bgColor={
                                                                    !formik?.values?.communication?.bookingReschedule
                                                                        ?.email && '#D9D9D9'
                                                                }
                                                                borderRadius={5}
                                                                fontColor="#1F1F1F"
                                                                borderColor="#D9D9D9"
                                                                value={
                                                                    formik?.values?.communication?.bookingReschedule
                                                                        ?.email_body
                                                                }
                                                                onChange={(e) =>
                                                                    formik.setFieldValue(
                                                                        'communication.bookingReschedule.email_body',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder={'bahlou'}
                                                                rows={8}
                                                            />
                                                        </React.Fragment>
                                                    )}

                                                    <FButton
                                                        startIcon={<Visibility />}
                                                        sx={{ width: { xs: '100%', md: '30%', marginTop: '12px' } }}
                                                        variant="save"
                                                        title={t('Setting.Preview')}
                                                        disabled={
                                                            !formik?.values?.communication?.bookingReschedule?.email
                                                        }
                                                        onClick={() => {
                                                            setProps({
                                                                content:
                                                                    formik?.values?.communication?.bookingReschedule
                                                                        ?.email_body,
                                                                title: 'Confirmation SMS',
                                                            });
                                                            setShowPreview(true);
                                                        }}
                                                    />
                                                </React.Fragment>
                                            )}
                                        </Stack>
                                    </Stack>

                                    {/* Form request */}
                                    <Stack m={0} p={0}>
                                        <FPrimaryHeading
                                            variant={'body1'}
                                            fontSize={'auto'}
                                            text={t('Setting.formrequest')}
                                        />
                                    </Stack>
                                    <Stack>
                                        <Stack
                                            m={0}
                                            p={0}
                                            gap={{ xs: 1, sm: 3 }}
                                            flexDirection={{ xs: 'column', sm: 'row' }}
                                        >
                                            <Stack width={{ xs: 'auto', sm: '35%' }}>
                                                <Typography
                                                    onClick={(e) => {
                                                        setBoolState({
                                                            ...boolState,
                                                            EmailFormrequest: {
                                                                ...boolState?.EmailFormrequest,
                                                                ShowEmail: !boolState?.EmailFormrequest?.ShowEmail,
                                                            },
                                                        });
                                                    }}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        flexDirection: 'row',
                                                    }}
                                                    noWrap
                                                    color="#1F1F1F"
                                                >
                                                    {t('Setting.Emailformreq')}
                                                    <IconButton
                                                        sx={{
                                                            transform: boolState?.EmailFormrequest?.ShowEmail
                                                                ? 'rotate(180deg)'
                                                                : 'rotate(0deg)',
                                                        }}
                                                        disableFocusRipple
                                                        disableRipple
                                                        disableTouchRipple
                                                    >
                                                        <img src={ArrowDown} alt="" />
                                                    </IconButton>
                                                </Typography>
                                                {boolState?.EmailFormrequest?.ShowEmail && (
                                                    <React.Fragment>
                                                        {/* {set?.from_dashboard && ( */}
                                                        <React.Fragment>
                                                            <FTextInput
                                                                mt={0}
                                                                // disabled={
                                                                //   !(
                                                                //     set?.from_dashboard &&
                                                                //     formik?.values?.communication
                                                                //       ?.EmailFormrequest?.email
                                                                //   )
                                                                // }
                                                                // bgColor={
                                                                //   !(
                                                                //     set?.from_dashboard &&
                                                                //     formik?.values?.communication
                                                                //       ?.EmailFormrequest?.email
                                                                //   ) && "#D9D9D9"
                                                                // }
                                                                value={
                                                                    formik?.values?.communication?.EmailFormrequest
                                                                        ?.email_sub
                                                                }
                                                                placeholder={t('Setting.Subject')}
                                                                onChange={(e) => {
                                                                    formik.setFieldValue(
                                                                        'communication.EmailFormrequest.email_sub',
                                                                        e.target.value,
                                                                    );
                                                                }}
                                                                onBlur={() => {
                                                                    formik.setFieldTouched(
                                                                        'communication.EmailFormrequest.email_sub',
                                                                        true,
                                                                    );
                                                                }}
                                                            />
                                                            {(formik.touched.communication?.EmailFormrequest
                                                                ?.email_sub ||
                                                                formik?.errors?.communication?.EmailFormrequest
                                                                    ?.email_sub) && (
                                                                <Typography style={{ color: 'red' }}>
                                                                    {
                                                                        formik?.errors?.communication?.EmailFormrequest
                                                                            ?.email_sub
                                                                    }
                                                                </Typography>
                                                            )}

                                                            <FTextArea
                                                                m={0}
                                                                // disabled={
                                                                //   !formik?.values?.communication
                                                                //     ?.EmailFormrequest?.email
                                                                // }
                                                                // bgColor={
                                                                //   !formik?.values?.communication
                                                                //     ?.EmailFormrequest?.email && "#D9D9D9"
                                                                // }
                                                                borderRadius={5}
                                                                fontColor="#1F1F1F"
                                                                borderColor="#D9D9D9"
                                                                value={
                                                                    formik?.values?.communication?.EmailFormrequest
                                                                        ?.email_body
                                                                }
                                                                onChange={(e) =>
                                                                    formik.setFieldValue(
                                                                        'communication.EmailFormrequest.email_body',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder={'bahlou'}
                                                                rows={8}
                                                            />
                                                        </React.Fragment>
                                                        {/* )} */}

                                                        <FButton
                                                            startIcon={<Visibility />}
                                                            sx={{
                                                                width: {
                                                                    xs: '100%',
                                                                    sm: 'fit-content',
                                                                    marginTop: '12px',
                                                                },
                                                            }}
                                                            variant="save"
                                                            title={t('Setting.Preview')}
                                                            // disabled={
                                                            //   !formik?.values?.communication
                                                            //     ?.bookingReschedule?.email
                                                            // }
                                                            onClick={() => {
                                                                setProps({
                                                                    content:
                                                                        formik?.values?.communication?.EmailFormrequest
                                                                            ?.email_body,
                                                                    title: 'Confirmation SMS',
                                                                });
                                                                setShowPreview(true);
                                                            }}
                                                        />
                                                    </React.Fragment>
                                                )}
                                            </Stack>

                                            <Stack width={{ xs: 'auto', sm: '65%' }}>
                                                <Typography
                                                    onClick={(e) => {
                                                        setBoolState({
                                                            ...boolState,
                                                            EmailFormConfirm: {
                                                                ...boolState?.EmailFormConfirm,
                                                                ShowEmail: !boolState?.EmailFormConfirm?.ShowEmail,
                                                            },
                                                        });
                                                    }}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        flexDirection: 'row',
                                                    }}
                                                    noWrap
                                                    color="#1F1F1F"
                                                >
                                                    {t('Setting.EmailFormconf')}
                                                    <IconButton
                                                        sx={{
                                                            transform: boolState?.EmailFormConfirm?.ShowEmail
                                                                ? 'rotate(180deg)'
                                                                : 'rotate(0deg)',
                                                        }}
                                                        disableFocusRipple
                                                        disableRipple
                                                        disableTouchRipple
                                                    >
                                                        <img src={ArrowDown} alt="" />
                                                    </IconButton>
                                                </Typography>
                                                {boolState?.EmailFormConfirm?.ShowEmail && (
                                                    <React.Fragment>
                                                        {/* {set?.from_dashboard && ( */}
                                                        <React.Fragment>
                                                            <FTextInput
                                                                mt={0}
                                                                // disabled={
                                                                //   !(
                                                                //     set?.from_dashboard &&
                                                                //     formik?.values?.communication
                                                                //       ?.EmailFormConfirm?.email
                                                                //   )
                                                                // }
                                                                // bgColor={
                                                                //   !(
                                                                //     set?.from_dashboard &&
                                                                //     formik?.values?.communication
                                                                //       ?.EmailFormConfirm?.email
                                                                //   ) && "#D9D9D9"
                                                                // }
                                                                value={
                                                                    formik?.values?.communication?.EmailFormConfirm
                                                                        ?.email_sub
                                                                }
                                                                placeholder={t('Setting.Subject')}
                                                                onChange={(e) => {
                                                                    formik.setFieldValue(
                                                                        'communication.EmailFormConfirm.email_sub',
                                                                        e.target.value,
                                                                    );
                                                                }}
                                                                onBlur={() => {
                                                                    formik.setFieldTouched(
                                                                        'communication.EmailFormConfirm.email_sub',
                                                                        true,
                                                                    );
                                                                }}
                                                            />
                                                            {(formik.touched.communication?.EmailFormConfirm
                                                                ?.email_sub ||
                                                                formik?.errors?.communication?.EmailFormConfirm
                                                                    ?.email_sub) && (
                                                                <Typography style={{ color: 'red' }}>
                                                                    {
                                                                        formik?.errors?.communication?.EmailFormConfirm
                                                                            ?.email_sub
                                                                    }
                                                                </Typography>
                                                            )}

                                                            <FTextArea
                                                                m={0}
                                                                // disabled={
                                                                //   !formik?.values?.communication
                                                                //     ?.EmailFormConfirm?.email
                                                                // }
                                                                // bgColor={
                                                                //   !formik?.values?.communication
                                                                //     ?.EmailFormConfirm?.email && "#D9D9D9"
                                                                // }
                                                                borderRadius={5}
                                                                fontColor="#1F1F1F"
                                                                borderColor="#D9D9D9"
                                                                value={
                                                                    formik?.values?.communication?.EmailFormConfirm
                                                                        ?.email_body
                                                                }
                                                                onChange={(e) =>
                                                                    formik.setFieldValue(
                                                                        'communication.EmailFormConfirm.email_body',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder={'bahlou'}
                                                                rows={8}
                                                            />
                                                        </React.Fragment>
                                                        {/* )} */}
                                                        <FButton
                                                            startIcon={<Visibility />}
                                                            sx={{
                                                                width: { xs: '100%', sm: 'fit-content' },
                                                                marginTop: '12px',
                                                            }}
                                                            variant="save"
                                                            title={t('Setting.Preview')}
                                                            // disabled={
                                                            //   !formik?.values?.communication
                                                            //     ?.bookingReschedule?.email
                                                            // }
                                                            onClick={() => {
                                                                setProps({
                                                                    content:
                                                                        formik?.values?.communication?.EmailFormConfirm
                                                                            ?.email_body,
                                                                    title: 'Confirmation SMS',
                                                                });
                                                                setShowPreview(true);
                                                            }}
                                                        />
                                                    </React.Fragment>
                                                )}
                                            </Stack>
                                        </Stack>
                                        <Stack sx={{ width: { xs: 'auto', sm: '35%' }, mt: 2 }}>
                                            <Typography
                                                onClick={(e) => {
                                                    setBoolState({
                                                        ...boolState,
                                                        EmailOnlineFormConfirm: {
                                                            ...boolState?.EmailOnlineFormConfirm,
                                                            ShowEmail: !boolState?.EmailOnlineFormConfirm?.ShowEmail,
                                                        },
                                                    });
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                }}
                                                noWrap
                                                color="#1F1F1F"
                                            >
                                                {t('Setting.EmailOnlineFormConfirm')}
                                                <Tooltip
                                                    sx={{ mx: 1 }}
                                                    arrow
                                                    title={t('Setting.EmailOnlineFormConfirmDesc')}
                                                >
                                                    <InfoOutlined sx={{ fontSize: 16, color: '#d2d2d2' }} />
                                                </Tooltip>
                                                <IconButton
                                                    sx={{
                                                        transform: boolState?.EmailOnlineFormConfirm?.ShowEmail
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                    }}
                                                    disableFocusRipple
                                                    disableRipple
                                                    disableTouchRipple
                                                >
                                                    <img src={ArrowDown} alt="" />
                                                </IconButton>
                                            </Typography>
                                            {boolState?.EmailOnlineFormConfirm?.ShowEmail && (
                                                <React.Fragment>
                                                    {/* {set?.from_dashboard && ( */}
                                                    <React.Fragment>
                                                        <FTextInput
                                                            mt={0}
                                                            // disabled={
                                                            //   !(
                                                            //     set?.from_dashboard &&
                                                            //     formik?.values?.communication
                                                            //       ?.EmailOnlineFormConfirm?.email
                                                            //   )
                                                            // }
                                                            // bgColor={
                                                            //   !(
                                                            //     set?.from_dashboard &&
                                                            //     formik?.values?.communication
                                                            //       ?.EmailOnlineFormConfirm?.email
                                                            //   ) && "#D9D9D9"
                                                            // }
                                                            value={
                                                                formik?.values?.communication?.EmailOnlineFormConfirm
                                                                    ?.email_sub
                                                            }
                                                            placeholder={t('Setting.Subject')}
                                                            onChange={(e) => {
                                                                formik.setFieldValue(
                                                                    'communication.EmailOnlineFormConfirm.email_sub',
                                                                    e.target.value,
                                                                );
                                                            }}
                                                            onBlur={() => {
                                                                formik.setFieldTouched(
                                                                    'communication.EmailOnlineFormConfirm.email_sub',
                                                                    true,
                                                                );
                                                            }}
                                                        />
                                                        {(formik.touched.communication?.EmailOnlineFormConfirm
                                                            ?.email_sub ||
                                                            formik?.errors?.communication?.EmailOnlineFormConfirm
                                                                ?.email_sub) && (
                                                            <Typography style={{ color: 'red' }}>
                                                                {
                                                                    formik?.errors?.communication
                                                                        ?.EmailOnlineFormConfirm?.email_sub
                                                                }
                                                            </Typography>
                                                        )}

                                                        <FTextArea
                                                            m={0}
                                                            // disabled={
                                                            //   !formik?.values?.communication
                                                            //     ?.EmailOnlineFormConfirm?.email
                                                            // }
                                                            // bgColor={
                                                            //   !formik?.values?.communication
                                                            //     ?.EmailOnlineFormConfirm?.email && "#D9D9D9"
                                                            // }
                                                            borderRadius={5}
                                                            fontColor="#1F1F1F"
                                                            borderColor="#D9D9D9"
                                                            value={
                                                                formik?.values?.communication?.EmailOnlineFormConfirm
                                                                    ?.email_body
                                                            }
                                                            onChange={(e) =>
                                                                formik.setFieldValue(
                                                                    'communication.EmailOnlineFormConfirm.email_body',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            placeholder={'bahlou'}
                                                            rows={8}
                                                        />
                                                    </React.Fragment>
                                                    {/* )} */}

                                                    <FButton
                                                        startIcon={<Visibility />}
                                                        sx={{
                                                            width: {
                                                                xs: '100%',
                                                                sm: 'fit-content',
                                                                marginTop: '12px',
                                                            },
                                                        }}
                                                        variant="save"
                                                        title={t('Setting.Preview')}
                                                        // disabled={
                                                        //   !formik?.values?.communication
                                                        //     ?.bookingReschedule?.email
                                                        // }
                                                        onClick={() => {
                                                            setProps({
                                                                content:
                                                                    formik?.values?.communication
                                                                        ?.EmailOnlineFormConfirm?.email_body,
                                                                title: 'Confirmation SMS',
                                                            });
                                                            setShowPreview(true);
                                                        }}
                                                    />
                                                </React.Fragment>
                                            )}
                                        </Stack>
                                    </Stack>

                                    {/* Health Declaration Email */}
                                    <Stack
                                        sx={{
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: 2,
                                            mt: 2,
                                        }}
                                    >
                                        <EmailTemplateSection
                                            title={t('Setting.HealthDeclarationTitle')}
                                            previewTitle={t('Setting.HealthDeclarationTitle')}
                                            toggleKey="health_declaration_initial_email"
                                            formikPath="communication.health_declaration_initial_email"
                                            {...commonProps}
                                        />

                                        <EmailTemplateSection
                                            title={t('Setting.HealthDeclarationReminder')}
                                            previewTitle={t('Setting.HealthDeclarationReminder')}
                                            toggleKey="health_declaration_reminder_email"
                                            formikPath="communication.health_declaration_reminder_email"
                                            {...commonProps}
                                        />
                                    </Stack>

                                    {process.env.REACT_APP_SHOW_ADVANCED_REMINDER_TEMPLATES === 'true' && (
                                        <Stack m={0} p={0} width={{ xs: 'auto', sm: '65%' }}>
                                            <PrimaryHeading fontSize={16} text={t('Setting.AdvanceReminder')} />
                                            <Typography
                                                sx={{
                                                    cursor: 'pointer',
                                                    color: '#1976d2',
                                                    textDecoration: 'underline',
                                                    wordBreak: 'break-all',
                                                    mt: 1,
                                                }}
                                                onClick={() => navigate('/services/advanced-reminder-templates')}
                                            >
                                                {t('Services.ReminderTemplates')}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Grid2>
                            </Grid2>

                            <Divider sx={{ ...dividerSx }} />
                            {/* Auto toggle sms & email */}
                            <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={3}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.AutoToggleSmsEmail')} />
                                    <SecondaryHeading text={t('Setting.AutoToggleSmsEmailDesc')} />
                                </Grid2>

                                <Grid2 container size={{ xs: 12, md: 8 }}>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <FSwitch
                                            label={t('Common.Email')}
                                            checked={formik?.values?.autoToggle?.email}
                                            disabled={!set?.profile?.enable_email}
                                            onChange={(e) => formik.setFieldValue('autoToggle.email', e.target.checked)}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <FSwitch
                                            label={t('Calendar.SMS')}
                                            checked={formik?.values?.autoToggle?.sms}
                                            disabled={!set?.profile?.enable_sms}
                                            onChange={(e) => formik.setFieldValue('autoToggle.sms', e.target.checked)}
                                        />
                                    </Grid2>
                                </Grid2>
                            </Grid2>

                            {/* No Show Fees */}
                            {isPosEnabled && (
                                <React.Fragment>
                                    <Divider sx={{ ...dividerSx }} />
                                    <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={3}>
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <PrimaryHeading text={t('Setting.NoShow')} />
                                            <SecondaryHeading text={t('Setting.NoShowDesc')} />
                                        </Grid2>

                                        <Grid2
                                            container
                                            size={{ xs: 12, md: 8 }}
                                            sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}
                                        >
                                            <FSwitch
                                                label={t('Setting.AllowNoShow')}
                                                checked={formik?.values?.noShow?.enable}
                                                disabled={!set?.profile?.enable_email}
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'noShow.enable',
                                                        !formik.values?.noShow?.enable,
                                                    )
                                                }
                                            />
                                            {formik?.values?.noShow?.enable && (
                                                <Grid2 container spacing={2}>
                                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                                        {' '}
                                                        <PrimaryHeading
                                                            variant={'body1'}
                                                            fontSize={16}
                                                            text={t('Setting.NoShowChargeType')}
                                                        />
                                                        <FSelect
                                                            options={[
                                                                {
                                                                    label: `${t('Statistics.Percentage')}`,
                                                                    value: 'PERCENTAGE',
                                                                },
                                                                { label: `${t('POS.FixedAmount')}`, value: 'FIXED' },
                                                            ]}
                                                            value={formik?.values?.noShow?.chargeType || 'FIXED'}
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target.value === 'PERCENTAGE' &&
                                                                    formik?.values?.noShow?.charge >= 100
                                                                ) {
                                                                    formik.setFieldValue('noShow.charge', 100);
                                                                }
                                                                formik.setFieldValue(
                                                                    'noShow.chargeType',
                                                                    e.target.value,
                                                                );
                                                            }}
                                                            borderRadius={2}
                                                            sx={{ mt: 0, width: '100%' }}
                                                            placeholderText={t('Setting.NoShowChargeType')}
                                                        />
                                                    </Grid2>
                                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                                        <FPrimaryHeading
                                                            variant={'body1'}
                                                            fontSize={16}
                                                            text={t('Setting.DefaultNoShow')}
                                                        />
                                                        <FTextInput
                                                            value={formik?.values?.noShow?.charge ?? '0'}
                                                            onBlur={(e) =>
                                                                formik.setFieldTouched('noShow.charge', true)
                                                            }
                                                            placeholder={t('Setting.DefaultNoShow')}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                                if (
                                                                    formik?.values?.noShow?.chargeType ===
                                                                        'PERCENTAGE' &&
                                                                    value > 100
                                                                ) {
                                                                    formik.setFieldValue('noShow.charge', 100);
                                                                    return;
                                                                }
                                                                formik.setFieldValue('noShow.charge', e.target.value);
                                                            }}
                                                            sx={{ mt: 0 }}
                                                        />
                                                        {formik?.touched?.noShow?.charge &&
                                                            formik?.errors?.noShow?.charge && (
                                                                <Typography style={{ color: 'red' }}>
                                                                    {formik?.errors?.noShow?.charge}
                                                                </Typography>
                                                            )}
                                                    </Grid2>
                                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                                        <PrimaryHeading
                                                            variant={'body1'}
                                                            fontSize={16}
                                                            text={t('Setting.AutoRemiderDuration')}
                                                        />
                                                        <FSelect
                                                            options={[
                                                                { label: `7 ${t('Setting.Days')}`, value: 7 },
                                                                { label: `14 ${t('Setting.Days')}`, value: 14 },
                                                                { label: `30 ${t('Setting.Days')}`, value: 30 },
                                                            ]}
                                                            value={formik?.values?.noShow?.reminder_days || 7}
                                                            onChange={(e) =>
                                                                formik.setFieldValue(
                                                                    'noShow.reminder_days',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            borderRadius={2}
                                                            sx={{ mt: 0, width: '100%' }}
                                                            placeholderText={t('Setting.AutoRemiderDuration')}
                                                        />
                                                    </Grid2>
                                                </Grid2>
                                            )}
                                        </Grid2>
                                    </Grid2>
                                </React.Fragment>
                            )}

                            <Divider sx={{ ...dividerSx }} />

                            {/* pixel-configration */}
                            <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={2}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.PixelConfig')} />
                                    <SecondaryHeading text={t('Setting.PixelConfig')} />
                                </Grid2>

                                <Grid2
                                    size={{ xs: 12, md: 8 }}
                                    sx={{
                                        mt: { xs: 2, md: 0 },
                                        display: { xs: 'block', md: 'flex' },
                                        flexDirection: { xs: 'column', md: 'row' },
                                        gap: 2,
                                    }}
                                >
                                    <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                        <PrimaryHeading text={t('Setting.PixelId')} variant={'body1'} fontSize={16} />
                                        <FTextInput
                                            name="pixel_config.pixel_id"
                                            value={formik?.values?.pixel_config?.pixel_id}
                                            placeholder={'Pixel Code'}
                                            onChange={(e) =>
                                                formik.setFieldValue('pixel_config.pixel_id', e.target.value)
                                            }
                                            type={'text'}
                                            autoComplete={'new-password'}
                                        />
                                    </Stack>
                                    <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                        <PrimaryHeading text={t('Setting.ApiKey')} variant={'body1'} fontSize={16} />
                                        <FTextInput
                                            name="pixel_config.access_token"
                                            value={formik?.values?.pixel_config?.access_token}
                                            placeholder="API Key"
                                            type={boolState?.pixel_config?.ShowAPIKey ? 'text' : 'password'}
                                            onChange={(e) =>
                                                formik.setFieldValue('pixel_config.access_token', e.target.value)
                                            }
                                            autoComplete={'new-password'}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <Box
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() =>
                                                                setBoolState((prev) => ({
                                                                    ...prev,
                                                                    pixel_config: {
                                                                        ShowAPIKey: !prev.pixel_config.ShowAPIKey,
                                                                    },
                                                                }))
                                                            }
                                                        >
                                                            {boolState?.pixel_config?.ShowAPIKey ? (
                                                                <Visibility />
                                                            ) : (
                                                                <VisibilityOff />
                                                            )}
                                                        </Box>
                                                    ),
                                                },
                                            }}
                                        />
                                    </Stack>
                                </Grid2>
                            </Grid2>

                            {/* Payment at checkout */}
                            {isPosEnabled && (
                                <React.Fragment>
                                    <Divider sx={{ ...dividerSx }} />
                                    <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={3}>
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <PrimaryHeading text={t('Setting.PaymentAtCheckout')} />
                                            <SecondaryHeading text={t('Setting.PaymentCheckoutDescription')} />
                                        </Grid2>

                                        <Grid2 container size={{ xs: 12, md: 8 }}>
                                            <Grid2 size={12}>
                                                <FSwitch
                                                    label={t('Setting.PaymentAtCheckout')}
                                                    checked={formik?.values?.payment_checkout?.enabled ?? false}
                                                    onChange={(e) =>
                                                        formik.setFieldValue(
                                                            'payment_checkout.enabled',
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                            </Grid2>
                                            {formik?.values?.payment_checkout?.enabled && (
                                                <React.Fragment>
                                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                                        <FPrimaryHeading text={t('Setting.MerchantID')} fontSize={16} />
                                                        <FTextInput
                                                            name="payment_checkout.merchant_id"
                                                            // id="redirect-url"
                                                            value={formik?.values?.payment_checkout?.merchant_id}
                                                            onChange={(e) =>
                                                                formik.setFieldValue(
                                                                    'payment_checkout.merchant_id',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            onBlur={() => {
                                                                formik.setFieldTouched(
                                                                    'payment_checkout.merchant_id',
                                                                    true,
                                                                );
                                                            }}
                                                            sx={{ width: '100%', mt: 0 }}
                                                            placeholder={t('Setting.MerchantID')}
                                                        />
                                                        {formik?.touched?.payment_checkout?.merchant_id &&
                                                            formik?.errors?.payment_checkout?.merchant_id && (
                                                                <Typography color="error">
                                                                    {formik.errors.payment_checkout.merchant_id}
                                                                </Typography>
                                                            )}
                                                    </Grid2>

                                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                                        <FPrimaryHeading
                                                            sx={{ mt: 0 }}
                                                            text={t('Setting.ApiKey')}
                                                            fontSize={16}
                                                        />
                                                        <FTextInput
                                                            mt={0}
                                                            name="payment_checkout.api_key"
                                                            value={formik?.values?.payment_checkout?.api_key}
                                                            onChange={(e) =>
                                                                formik.setFieldValue(
                                                                    'payment_checkout.api_key',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            onBlur={() => {
                                                                formik.setFieldTouched(
                                                                    'payment_checkout.api_key',
                                                                    true,
                                                                );
                                                            }}
                                                            type={
                                                                boolState?.payment_checkout?.ShowAPIKey
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            slotProps={{
                                                                input: {
                                                                    endAdornment: (
                                                                        <Box
                                                                            style={{ cursor: 'pointer' }}
                                                                            onClick={() =>
                                                                                setBoolState((prev) => ({
                                                                                    ...prev,
                                                                                    payment_checkout: {
                                                                                        ShowAPIKey:
                                                                                            !prev.payment_checkout
                                                                                                .ShowAPIKey,
                                                                                    },
                                                                                }))
                                                                            }
                                                                        >
                                                                            {boolState?.payment_checkout?.ShowAPIKey ? (
                                                                                <Visibility />
                                                                            ) : (
                                                                                <VisibilityOff />
                                                                            )}
                                                                        </Box>
                                                                    ),
                                                                },
                                                            }}
                                                            sx={{ width: '100%' }}
                                                        />
                                                        {formik?.touched?.payment_checkout?.api_key &&
                                                            formik?.errors?.payment_checkout?.api_key && (
                                                                <Typography color="error">
                                                                    {formik.errors.payment_checkout.api_key}
                                                                </Typography>
                                                            )}
                                                    </Grid2>
                                                </React.Fragment>
                                            )}
                                        </Grid2>
                                    </Grid2>
                                </React.Fragment>
                            )}
                            <Divider sx={{ ...dividerSx }} />

                            {/* Redirection Settings */}
                            <Grid2 sx={{ p: { xs: 2, md: 5 } }} container spacing={3}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.RedirectionSettings')} />
                                    <SecondaryHeading text={t('Setting.RedirectionSettingsDesc')} />
                                </Grid2>

                                <Grid2 container size={{ xs: 12, md: 8 }}>
                                    <Grid2 size={12}>
                                        <FSwitch
                                            label={t('Setting.EnableRedirection')}
                                            checked={formik?.values?.redirect?.enabled}
                                            onChange={(e) => formik.setFieldValue('redirect.enabled', e.target.checked)}
                                        />
                                    </Grid2>
                                    {formik?.values?.redirect?.enabled && (
                                        <React.Fragment>
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <FPrimaryHeading text={t('Setting.RedirectionURL')} fontSize={16} />
                                                <FTextInput
                                                    name="redirect.url"
                                                    id="redirect-url"
                                                    value={formik?.values?.redirect?.url}
                                                    onChange={(e) =>
                                                        formik.setFieldValue('redirect.url', e.target.value)
                                                    }
                                                    onBlur={() => {
                                                        formik.setFieldTouched('redirect.url', true);
                                                    }}
                                                    sx={{ width: '100%', mt: 0 }}
                                                    placeholder={t('Setting.EnterRedirectionURL')}
                                                />
                                                {formik?.touched?.redirect?.url && formik?.errors?.redirect?.url && (
                                                    <Typography color="error">{formik.errors.redirect.url}</Typography>
                                                )}
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <FPrimaryHeading
                                                    text={t('Setting.RedirectionDuration')}
                                                    fontSize={16}
                                                />
                                                <FSelect
                                                    value={
                                                        formik?.values?.redirect?.duration === 0
                                                            ? 'IMMEDIATE'
                                                            : formik?.values?.redirect?.duration || 'IMMEDIATE'
                                                    }
                                                    onChange={(e) =>
                                                        formik.setFieldValue('redirect.duration', e.target.value)
                                                    }
                                                    options={[
                                                        { value: 'IMMEDIATE', label: t('Setting.Immediately') },
                                                        { value: 3, label: `3 ${t('Setting.Seconds')}` },
                                                        { value: 5, label: `5 ${t('Setting.Seconds')}` },
                                                    ]}
                                                    sx={{ width: '100%', mt: 0 }}
                                                />
                                                {formik.touched.redirect?.duration &&
                                                    formik.errors.redirect?.duration && (
                                                        <Typography color="error">
                                                            {formik.errors.redirect.duration}
                                                        </Typography>
                                                    )}
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <FPrimaryHeading
                                                    text={t('Setting.RedirectServiceTitle')}
                                                    fontSize={16}
                                                />
                                                <FSelect
                                                    selectAllRenderText={t('Services.AllServ')}
                                                    isMultiSelect={true}
                                                    value={formik?.values?.redirect?.service_ids}
                                                    TextToDisplayWithCount={`${t('Common.Services')}`}
                                                    onChange={(e) => {
                                                        handleServiceGroupSelect(e);
                                                    }}
                                                    selectAllRenderCheckBoxText={t('Services.AllServ')}
                                                    options={serviceGroup}
                                                />
                                            </Grid2>
                                        </React.Fragment>
                                    )}
                                </Grid2>
                            </Grid2>

                            {/* Integrate Booking */}
                            <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.IntegrateBookingOnYourWebsite')} />
                                    <SecondaryHeading text={t('Setting.Description8')} />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 8 }}>
                                    <FTextArea
                                        disabled={user?.role !== 'ADMIN' && !user?.settings.edit_about_us}
                                        rows={10}
                                        value={embedCode}
                                        onFocus={(e) => e.target.select()}
                                        onChange={() => {}}
                                        showCopyButton
                                        handleCopy={() => {
                                            navigator.clipboard

                                                .writeText(embedCode)

                                                .then(() => {
                                                    toast.info(t('Setting.GTMCodeCopied'));
                                                })

                                                .catch((err) => {
                                                    console.err('err', err);
                                                });
                                        }}
                                        bgColor={'#D9D9D9'}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handleCopy}
                                        aria-label="Copy code"
                                        disableRipple
                                        sx={{
                                            boxShadow: 'none',
                                            position: 'absolute',
                                            right: 0,
                                            top: 2,
                                            minWidth: '48px',
                                            borderTopLeftRadius: 0,
                                            borderBottomLeftRadius: 0,
                                            height: '40px',
                                            backgroundColor: 'transparent',
                                            '&:hover': {
                                                backgroundColor: 'transparent',
                                                boxShadow: 'none',
                                            },
                                        }}
                                    >
                                        <Copy color="black" fontSize="small" />
                                    </Button>

                                    <Stack sx={{ mt: 3 }}>
                                        <Typography variant="body1" sx={{ color: '#1f1f1f', fontWeight: 700 }}>
                                            {t('Setting.IframePageType')}
                                        </Typography>
                                        <FormControl>
                                            <RadioGroup
                                                value={formik?.values?.iframe?.singlePage}
                                                onChange={(e) =>
                                                    formik.setFieldValue('iframe.singlePage', e.target.value === 'true')
                                                }
                                            >
                                                <FormControlLabel
                                                    value={true}
                                                    control={
                                                        <Radio
                                                            sx={{
                                                                '&.Mui-checked': { color: '#44B904' },
                                                                '&.Mui:hover': { backgroundColor: 'transparent' },
                                                            }}
                                                        />
                                                    }
                                                    label={t('Setting.SinglePage')}
                                                />

                                                <FormControlLabel
                                                    value={false}
                                                    control={
                                                        <Radio
                                                            sx={{
                                                                '&.Mui-checked': { color: '#44B904' },
                                                                '&.Mui:hover': { backgroundColor: 'transparent' },
                                                            }}
                                                        />
                                                    }
                                                    label={t('Setting.MultiPage')}
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                        {formik?.values?.iframe?.singlePage && (
                                            <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <FSwitch
                                                    checked={formik?.values?.iframe?.hideBookingStepper}
                                                    onChange={() =>
                                                        formik?.setFieldValue(
                                                            'iframe.hideBookingStepper',
                                                            !formik?.values?.iframe?.hideBookingStepper,
                                                        )
                                                    }
                                                />
                                                <Typography>{t('Setting.HideBookingStepper')}</Typography>
                                            </Stack>
                                        )}
                                    </Stack>
                                </Grid2>
                            </Grid2>

                            {/* Inspection Module */}
                            {isInspectionEnabled && (
                                <React.Fragment>
                                    <Divider sx={{ ...dividerSx }} />

                                    {/* Distance Charges */}
                                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <PrimaryHeading text={t('Setting.DistanceCharges') || 'Distance Charges'} />
                                            <SecondaryHeading
                                                text={
                                                    t('Setting.DistanceChargesDescription') ||
                                                    'Configure distance-based charges for inspections'
                                                }
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, md: 8 }}>
                                            <Stack sx={{ gap: 2 }}>
                                                {(formik.values.inspection_module?.distance_charges || []).map(
                                                    (charge, index) => (
                                                        <Stack
                                                            key={index}
                                                            sx={{
                                                                flexDirection: { xs: 'column', md: 'row' },
                                                                gap: 2,
                                                                alignItems: { xs: 'flex-start', md: 'center' },
                                                                border: { xs: '1px solid #E0E0E0', md: 'none' },
                                                                borderRadius: 3,
                                                                p: { xs: 2, md: 0 },
                                                            }}
                                                        >
                                                            <Stack sx={{ width: { xs: '100%', md: '45%' } }}>
                                                                <FPrimaryHeading
                                                                    text={t('Setting.DistanceUpto') || 'Distance Upto'}
                                                                    fontSize={16}
                                                                    sx={{
                                                                        display: {
                                                                            xs: 'block',
                                                                            md: index === 0 ? 'block' : 'none',
                                                                        },
                                                                    }}
                                                                />
                                                                <FTextInput
                                                                    name={`inspection_module.distance_charges.${index}.distance_upto`}
                                                                    value={charge.distance_upto || ''}
                                                                    onChange={(e) => {
                                                                        const currentCharges =
                                                                            formik.values.inspection_module
                                                                                ?.distance_charges || [];

                                                                        const onlyNumbers = e.target.value.replace(
                                                                            /[^0-9]/g,
                                                                            '',
                                                                        );
                                                                        const numValue =
                                                                            onlyNumbers === ''
                                                                                ? null
                                                                                : parseInt(onlyNumbers, 10);
                                                                        // Create new array with new object to ensure change detection works
                                                                        const updatedCharges = currentCharges.map(
                                                                            (item, i) =>
                                                                                i === index
                                                                                    ? {
                                                                                          ...item,
                                                                                          distance_upto: numValue,
                                                                                      }
                                                                                    : item,
                                                                        );
                                                                        formik.setFieldValue(
                                                                            'inspection_module.distance_charges',
                                                                            updatedCharges,
                                                                        );
                                                                    }}
                                                                    placeholder={
                                                                        t('Setting.DistanceUpto') || 'Distance (km)'
                                                                    }
                                                                    // type="number"
                                                                    sx={{
                                                                        mt: 0,
                                                                        '& .MuiOutlinedInput-root': {
                                                                            '& fieldset': {
                                                                                borderColor: getDistanceValidationError(
                                                                                    index,
                                                                                )
                                                                                    ? 'error.main'
                                                                                    : undefined,
                                                                            },
                                                                        },
                                                                    }}
                                                                    slotProps={{
                                                                        input: {
                                                                            endAdornment: (
                                                                                <InputAdornment position="end">
                                                                                    {' km'}
                                                                                </InputAdornment>
                                                                            ),
                                                                        },
                                                                    }}
                                                                />
                                                                {getDistanceValidationError(index) && (
                                                                    <Typography
                                                                        sx={{
                                                                            color: 'error.main',
                                                                            fontSize: '0.75rem',
                                                                            mt: 0.5,
                                                                        }}
                                                                    >
                                                                        {getDistanceValidationError(index)}
                                                                    </Typography>
                                                                )}
                                                            </Stack>
                                                            <Stack sx={{ width: { xs: '100%', md: '45%' } }}>
                                                                <FPrimaryHeading
                                                                    text={t('Setting.Charges') || 'Charges'}
                                                                    fontSize={16}
                                                                    sx={{
                                                                        display: {
                                                                            xs: 'block',
                                                                            md: index === 0 ? 'block' : 'none',
                                                                        },
                                                                    }}
                                                                />
                                                                <FTextInput
                                                                    name={`inspection_module.distance_charges.${index}.amount`}
                                                                    value={charge.amount ?? ''}
                                                                    onChange={(e) => {
                                                                        const currentCharges =
                                                                            formik.values.inspection_module
                                                                                ?.distance_charges || [];
                                                                        const inputValue = e.target.value;
                                                                        // Keep empty string while typing, otherwise format
                                                                        const formattedAmount =
                                                                            inputValue === ''
                                                                                ? ''
                                                                                : formatPriceInput(inputValue);
                                                                        // Create new array with new object to ensure change detection works
                                                                        const updatedCharges = currentCharges.map(
                                                                            (item, i) =>
                                                                                i === index
                                                                                    ? {
                                                                                          ...item,
                                                                                          amount: formattedAmount,
                                                                                      }
                                                                                    : item,
                                                                        );
                                                                        formik.setFieldValue(
                                                                            'inspection_module.distance_charges',
                                                                            updatedCharges,
                                                                        );
                                                                    }}
                                                                    onBlur={() => {
                                                                        const currentCharges =
                                                                            formik.values.inspection_module
                                                                                ?.distance_charges || [];
                                                                        const currentAmount =
                                                                            currentCharges[index]?.amount;
                                                                        // If empty, set zero
                                                                        if (
                                                                            currentAmount === '' ||
                                                                            currentAmount === undefined
                                                                        ) {
                                                                            const updatedCharges = currentCharges.map(
                                                                                (item, i) =>
                                                                                    i === index
                                                                                        ? {
                                                                                              ...item,
                                                                                              amount: 0,
                                                                                          }
                                                                                        : item,
                                                                            );
                                                                            formik.setFieldValue(
                                                                                'inspection_module.distance_charges',
                                                                                updatedCharges,
                                                                            );
                                                                        }
                                                                    }}
                                                                    placeholder={t('Setting.Charges') || 'Amount'}
                                                                    sx={{ mt: 0 }}
                                                                    slotProps={{
                                                                        input: {
                                                                            endAdornment: (
                                                                                <InputAdornment position="end">
                                                                                    {t('POS.Currency')}
                                                                                </InputAdornment>
                                                                            ),
                                                                        },
                                                                    }}
                                                                />
                                                            </Stack>
                                                            {(formik.values.inspection_module?.distance_charges || [])
                                                                .length > 1 && (
                                                                <IconButton
                                                                    disableTouchRipple
                                                                    disableRipple
                                                                    disableFocusRipple
                                                                    onClick={() => {
                                                                        const currentCharges =
                                                                            formik.values.inspection_module
                                                                                ?.distance_charges || [];
                                                                        if (currentCharges.length <= 1) {
                                                                            return;
                                                                        }
                                                                        const updatedCharges = currentCharges.filter(
                                                                            (_, i) => i !== index,
                                                                        );
                                                                        formik.setFieldValue(
                                                                            'inspection_module.distance_charges',
                                                                            updatedCharges,
                                                                        );
                                                                    }}
                                                                    sx={{
                                                                        m: { xs: 'auto', md: 0 },
                                                                    }}
                                                                >
                                                                    <img src={DeleteIcon} alt="Delete" />
                                                                </IconButton>
                                                            )}
                                                        </Stack>
                                                    ),
                                                )}
                                                <FButton
                                                    variant="f_outline"
                                                    title={`+ ${t('Setting.AddCharges')}`}
                                                    onClick={() => {
                                                        const currentCharges =
                                                            formik.values.inspection_module?.distance_charges || [];
                                                        if (currentCharges.length >= 10) {
                                                            return;
                                                        }
                                                        const newCharge = {
                                                            distance_upto:
                                                                currentCharges.length > 0
                                                                    ? currentCharges[currentCharges.length - 1]
                                                                          .distance_upto + 10
                                                                    : 0,
                                                            amount: 0,
                                                        };
                                                        const updatedCharges = [...currentCharges, newCharge];
                                                        formik.setFieldValue(
                                                            'inspection_module.distance_charges',
                                                            updatedCharges,
                                                        );
                                                    }}
                                                    disabled={
                                                        (formik.values.inspection_module?.distance_charges || [])
                                                            .length >= 10
                                                    }
                                                    sx={{
                                                        width: { xs: '100%', md: 'fit-content' },
                                                        mt: 1,
                                                        borderRadius: 4,
                                                        '&:disabled': {
                                                            borderColor: '#D9D9D9',
                                                            color: '#D9D9D9',
                                                        },
                                                    }}
                                                />
                                            </Stack>

                                            <Grid2 container spacing={3} sx={{ mt: 2 }}>
                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                    <FPrimaryHeading
                                                        text={
                                                            t('Setting.BridgeTollZipCodeAbove') ||
                                                            'Bridge Toll Zip Code Above'
                                                        }
                                                        fontSize={16}
                                                    />
                                                    <FTextInput
                                                        name="inspection_module.bridge_toll.zip_code_above"
                                                        value={
                                                            formik?.values?.inspection_module?.bridge_toll
                                                                ?.zip_code_above || 0
                                                        }
                                                        onChange={(e) => {
                                                            const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                                                            formik.setFieldValue(
                                                                'inspection_module.bridge_toll.zip_code_above',
                                                                onlyNumbers,
                                                            );
                                                        }}
                                                    />
                                                </Grid2>
                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                    <FPrimaryHeading
                                                        text={t('Setting.BridgeTollCharge') || 'Bridge Toll Charge'}
                                                        fontSize={16}
                                                    />
                                                    <FTextInput
                                                        name="inspection_module.bridge_toll.amount"
                                                        value={
                                                            formik?.values?.inspection_module?.bridge_toll?.amount ?? ''
                                                        }
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value;
                                                            // Keep empty string while typing, otherwise format
                                                            const formattedAmount =
                                                                inputValue === '' ? '' : formatPriceInput(inputValue);
                                                            formik.setFieldValue(
                                                                'inspection_module.bridge_toll.amount',
                                                                formattedAmount,
                                                            );
                                                        }}
                                                        onBlur={() => {
                                                            const currentValue =
                                                                formik?.values?.inspection_module?.bridge_toll?.amount;
                                                            // If empty, set zero
                                                            if (currentValue === '' || currentValue === undefined) {
                                                                formik.setFieldValue(
                                                                    'inspection_module.bridge_toll.amount',
                                                                    0,
                                                                );
                                                            }
                                                        }}
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        {t('POS.Currency')}
                                                                    </InputAdornment>
                                                                ),
                                                            },
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>

                                    <Divider sx={{ ...dividerSx }} />

                                    {/* cancelation_settings */}
                                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <PrimaryHeading text={t('Setting.CancelationSettings')} />
                                            <SecondaryHeading text={t('Setting.CancelationSettingsDescription')} />
                                        </Grid2>
                                        <Grid2
                                            size={{ xs: 12, md: 8 }}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: { xs: 'column', md: 'row' },
                                                gap: 2,
                                            }}
                                        >
                                            <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                                <FPrimaryHeading text={t('Setting.CancelBefore')} fontSize={16} />
                                                <FSelect
                                                    value={
                                                        formik?.values?.inspection_module?.cancelation_settings
                                                            ?.cancel_before || 1440
                                                    }
                                                    onChange={(e) =>
                                                        formik.setFieldValue(
                                                            'inspection_module.cancelation_settings.cancel_before',
                                                            e.target.value,
                                                        )
                                                    }
                                                    options={[
                                                        { value: 120, label: '2 hours' },
                                                        { value: 240, label: '4 hours' },
                                                        { value: 360, label: '6 hours' },
                                                        { value: 720, label: '12 hours' },
                                                        { value: 1440, label: '24 hours (standard)' },
                                                        { value: 2880, label: '48 hours' },
                                                        { value: 4320, label: '72 hours' },
                                                        { value: 2628000, label: 'Always' },
                                                    ]}
                                                    sx={{ width: '100%', mt: 0 }}
                                                />
                                            </Stack>

                                            <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                                <FPrimaryHeading text={t('Setting.CancelationCharge')} fontSize={16} />
                                                <FTextInput
                                                    name="inspection_module.cancelation_settings.cancelation_charges"
                                                    value={
                                                        formik?.values?.inspection_module?.cancelation_settings
                                                            ?.cancelation_charges ?? ''
                                                    } // allow empty string while typing
                                                    onChange={(e) => {
                                                        const inputValue = e.target.value;

                                                        // Keep empty string while typing, otherwise format
                                                        const formattedAmount =
                                                            inputValue === '' ? '' : formatPriceInput(inputValue);

                                                        formik.setFieldValue(
                                                            'inspection_module.cancelation_settings.cancelation_charges',
                                                            formattedAmount,
                                                        );
                                                    }}
                                                    onBlur={() => {
                                                        const currentValue =
                                                            formik?.values?.inspection_module?.cancelation_settings
                                                                ?.cancelation_charges;

                                                        // If empty, set zero
                                                        if (currentValue === '' || currentValue === undefined) {
                                                            formik.setFieldValue(
                                                                'inspection_module.cancelation_settings.cancelation_charges',
                                                                0,
                                                            );
                                                        }
                                                    }}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    {t('POS.Currency')}
                                                                </InputAdornment>
                                                            ),
                                                        },
                                                    }}
                                                    sx={{ width: '100%', mt: 0 }}
                                                />
                                            </Stack>
                                        </Grid2>
                                    </Grid2>

                                    <Divider sx={{ ...dividerSx }} />

                                    {/* iframe design setting */}
                                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <PrimaryHeading text={t('Setting.ThemeSetting')} />
                                            <SecondaryHeading text={t('Setting.ThemeSettingDescription')} />
                                        </Grid2>
                                        <Grid2 container spacing={3} size={{ xs: 12, md: 8 }}>
                                            <Grid2 size={12}>
                                                <FPrimaryHeading text={t('Setting.DefaultTheme')} fontSize={16} />
                                                <FSwitch
                                                    checked={formik.values.custom_iframe?.default_theme}
                                                    name="custom_iframe.default_theme"
                                                    onChange={(e, checked) => {
                                                        formik.setFieldValue('custom_iframe.default_theme', checked);
                                                        if (checked) {
                                                            formik.setFieldValue(
                                                                'custom_iframe.border_color',
                                                                '#fc985d',
                                                            );
                                                            formik.setFieldValue(
                                                                'custom_iframe.button_color',
                                                                '#fc985d',
                                                            );
                                                        } else {
                                                            formik.setFieldValue(
                                                                'custom_iframe.border_color',
                                                                initialValues.custom_iframe?.border_color,
                                                            );
                                                            formik.setFieldValue(
                                                                'custom_iframe.button_color',
                                                                initialValues.custom_iframe?.button_color,
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Grid2>

                                            {/* THEME COLOR */}
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <FPrimaryHeading text={t('Setting.ButtonBorderColor')} fontSize={16} />

                                                <FTextInput
                                                    type="color"
                                                    width={{ xs: '100%', md: '40%', xl: '20%' }}
                                                    name="custom_iframe.border_color"
                                                    value={formik.values.custom_iframe?.border_color}
                                                    onChange={(e) => {
                                                        if (e.target.value === '#fc985d') {
                                                            formik.setFieldValue('custom_iframe.default_theme', true);
                                                        } else {
                                                            formik.setFieldValue('custom_iframe.default_theme', false);
                                                        }
                                                        formik.setFieldValue(
                                                            'custom_iframe.border_color',
                                                            e.target.value,
                                                        );
                                                    }}
                                                />
                                            </Grid2>

                                            {/* BUTTON COLOR */}
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <FPrimaryHeading
                                                    text={t('Setting.ButtonBackgroundColor')}
                                                    fontSize={16}
                                                />

                                                <FTextInput
                                                    type="color"
                                                    width={{ xs: '100%', md: '40%', xl: '20%    ' }}
                                                    name="custom_iframe.button_color"
                                                    value={formik.values.custom_iframe?.button_color}
                                                    onChange={(e) => {
                                                        if (e.target.value === '#fc985d') {
                                                            formik.setFieldValue('custom_iframe.default_theme', true);
                                                        } else {
                                                            formik.setFieldValue('custom_iframe.default_theme', false);
                                                        }
                                                        formik.setFieldValue(
                                                            'custom_iframe.button_color',
                                                            e.target.value,
                                                        );
                                                    }}
                                                />
                                            </Grid2>

                                            {/* BUTTON RADIUS */}
                                            {/* <Grid2 sx={{ mt: 2 }}>
                                                <FPrimaryHeading text={'Rounded buttons'} fontSize={16} />

                                                <FSwitch
                                                    checked={formik.values.custom_iframe?.button_radius}
                                                    name="custom_iframe.button_radius"
                                                    onChange={(e, checked) =>
                                                        formik.setFieldValue('custom_iframe.button_radius', checked)
                                                    }
                                                />
                                            </Grid2> */}
                                        </Grid2>
                                    </Grid2>

                                    <Divider sx={{ ...dividerSx }} />

                                    {/* email_order_confirmation */}
                                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <PrimaryHeading text={t('Setting.EmailOrderConfirmation')} />
                                            <SecondaryHeading text={t('Setting.EmailOrderConfirmationDescription')} />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, md: 8 }}>
                                            <FSwitch
                                                label={t('Setting.EmailOrderConfirmation')}
                                                checked={formik?.values?.inspection_module?.email_order_confirmation}
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'inspection_module.email_order_confirmation',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                        </Grid2>
                                    </Grid2>

                                    <Divider sx={{ ...dividerSx }} />

                                    {/* attach_terms_and_condition */}
                                    <AttachTermsAndConditionSection formik={formik} setShowToastMsg={setShowToast} />

                                    <Divider sx={{ ...dividerSx }} />

                                    {/* file_upload_checkout */}
                                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <PrimaryHeading text={t('Setting.FileUploadCheckout')} />
                                            <SecondaryHeading text={t('Setting.FileUploadCheckoutDescription')} />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, md: 8 }}>
                                            <FSwitch
                                                label={t('Setting.FileUploadCheckout')}
                                                checked={
                                                    formik?.values?.inspection_module?.file_upload_checkout?.enable
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'inspection_module.file_upload_checkout.enable',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <Stack
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', md: 'row' },
                                                    gap: 2,
                                                    width: { xs: '100%', md: '100%' },
                                                    alignItems: 'center',
                                                    mt: 2,
                                                }}
                                            >
                                                {formik?.values?.inspection_module?.file_upload_checkout?.enable && (
                                                    <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                                        <FPrimaryHeading
                                                            text={t('Setting.MaxFilesAllowed')}
                                                            fontSize={16}
                                                        />
                                                        <FSelect
                                                            value={
                                                                formik?.values?.inspection_module?.file_upload_checkout
                                                                    ?.max_files
                                                            }
                                                            onChange={(e) =>
                                                                formik.setFieldValue(
                                                                    'inspection_module.file_upload_checkout.max_files',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            options={Array.from({ length: 10 }, (_, index) => ({
                                                                value: index + 1,
                                                                label: `${index + 1}`,
                                                            }))}
                                                            sx={{ width: '100%', mt: 0 }}
                                                        />
                                                    </Stack>
                                                )}
                                                {formik?.values?.inspection_module?.file_upload_checkout?.enable && (
                                                    <Stack sx={{ width: { xs: '100%', md: '50%' }, mt: 2 }}>
                                                        <FSwitch
                                                            label={t('Setting.FilesRequired')}
                                                            checked={
                                                                formik?.values?.inspection_module?.file_upload_checkout
                                                                    ?.files_required
                                                            }
                                                            onChange={(e) =>
                                                                formik.setFieldValue(
                                                                    'inspection_module.file_upload_checkout.files_required',
                                                                    e.target.checked,
                                                                )
                                                            }
                                                        />
                                                    </Stack>
                                                )}
                                            </Stack>
                                        </Grid2>
                                    </Grid2>

                                    <Divider sx={{ ...dividerSx }} />

                                    {/* terms and condition */}
                                    {set?.profile?.inspection_module && (
                                        <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                            <Grid2 size={{ xs: 12, md: 4 }}>
                                                <PrimaryHeading text={t('Setting.TermsAndConditionTitle')} />
                                                <SecondaryHeading text={t('Setting.TermsAndConditionDescription')} />
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, md: 8 }}>
                                                <FSwitch
                                                    label={t('Setting.EnableCustomTermAndCondition')}
                                                    checked={
                                                        formik?.values?.inspection_module?.custom_terms_and_conditions
                                                            ?.is_enabled || false
                                                    }
                                                    onChange={(e) =>
                                                        formik.setFieldValue(
                                                            'inspection_module.custom_terms_and_conditions.is_enabled',
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                                {formik?.values?.inspection_module?.custom_terms_and_conditions
                                                    ?.is_enabled && (
                                                    <Stack
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: { xs: 'column', md: 'row' },
                                                            gap: 2,
                                                            width: { xs: '100%', md: '100%' },
                                                            alignItems: 'center',
                                                            mt: 2,
                                                        }}
                                                    >
                                                        <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                                            <FPrimaryHeading
                                                                text={t('Setting.EnterTermsAndCondition')}
                                                                fontSize={16}
                                                            />
                                                            <FTextInput
                                                                value={
                                                                    formik?.values?.inspection_module
                                                                        ?.custom_terms_and_conditions?.url || ''
                                                                }
                                                                name={`inspection_module.custom_terms_and_conditions.url`}
                                                                onChange={(e) =>
                                                                    formik.setFieldValue(
                                                                        'inspection_module.custom_terms_and_conditions.url',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder={'Enter URL'}
                                                                onBlur={formik.handleBlur}
                                                            />
                                                            {formik.errors.inspection_module
                                                                ?.custom_terms_and_conditions?.url &&
                                                                formik.touched.inspection_module
                                                                    ?.custom_terms_and_conditions?.url && (
                                                                    <Typography color="error" variant="caption">
                                                                        {
                                                                            formik.errors.inspection_module
                                                                                .custom_terms_and_conditions.url
                                                                        }
                                                                    </Typography>
                                                                )}
                                                        </Stack>
                                                    </Stack>
                                                )}
                                            </Grid2>
                                        </Grid2>
                                    )}
                                </React.Fragment>
                            )}

                            <Divider sx={{ ...dividerSx }} />

                            {/* health declaration */}
                            <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.HealthDeclarationTitle')} />
                                    <SecondaryHeading text={t('Setting.HealthDeclarationDescription')} />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 8 }}>
                                    <Grid2 container spacing={3} sx={{ mt: 2 }}>
                                        <Grid2
                                            size={{ xs: 12, md: 6 }}
                                            sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}
                                        >
                                            <FPrimaryHeading
                                                text={t('Setting.InitialEmailBeforeHours')}
                                                fontSize={16}
                                            />
                                            <FSelect
                                                options={[
                                                    { label: `1 ${t('Statistics.Hour')}`, value: 1 },
                                                    { label: `2 ${t('Statistics.Hours')}`, value: 2 },
                                                    { label: `6 ${t('Statistics.Hours')}`, value: 6 },
                                                    { label: `12 ${t('Statistics.Hours')}`, value: 12 },
                                                    { label: `24 ${t('Statistics.Hours')}`, value: 24 },
                                                    { label: `48 ${t('Statistics.Hours')}`, value: 48 },
                                                    { label: `72 ${t('Statistics.Hours')}`, value: 72 },
                                                ]}
                                                value={
                                                    formik?.values?.health_declaration?.email_settings
                                                        ?.initial_email_before_hours
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'health_declaration.email_settings.initial_email_before_hours',
                                                        e.target.value,
                                                    )
                                                }
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid2>

                                        <Grid2
                                            size={{ xs: 12, md: 6 }}
                                            sx={{
                                                gap: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                mt: { xs: 3, md: 0 },
                                            }}
                                        >
                                            <FPrimaryHeading
                                                text={t('Setting.ReminderEmailBeforeHours')}
                                                fontSize={16}
                                            />
                                            <FSelect
                                                options={[
                                                    { label: `1 ${t('Statistics.Hour')}`, value: 1 },
                                                    { label: `2 ${t('Statistics.Hours')}`, value: 2 },
                                                    { label: `6 ${t('Statistics.Hours')}`, value: 6 },
                                                    { label: `12 ${t('Statistics.Hours')}`, value: 12 },
                                                    { label: `24 ${t('Statistics.Hours')}`, value: 24 },
                                                    { label: `48 ${t('Statistics.Hours')}`, value: 48 },
                                                    { label: `72 ${t('Statistics.Hours')}`, value: 72 },
                                                ]}
                                                value={
                                                    formik?.values?.health_declaration?.email_settings
                                                        ?.reminder_email_before_hours
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        'health_declaration.email_settings.reminder_email_before_hours',
                                                        e.target.value,
                                                    )
                                                }
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                            </Grid2>

                            {/* Integrate Booking */}
                            <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.EmployeeSelectionCardPreferences')} />
                                    <SecondaryHeading text={t('Setting.EmployeeSelectionCardPreferencesDescription')} />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 8 }}>
                                    <FSwitch
                                        label={t('Setting.ShowEmployeeAboveCalendar')}
                                        checked={formik.values.show_employee_above_calendar}
                                        onChange={(e) =>
                                            formik.setFieldValue('show_employee_above_calendar', e.target.checked)
                                        }
                                    />
                                </Grid2>
                            </Grid2>
                        </React.Fragment>
                    )}
                </Stack>
            </Stack>

            {showPreview && (
                <PreviewModal
                    open={showPreview}
                    onClose={() => setShowPreview(false)}
                    content={props?.content}
                    title={props?.title}
                />
            )}
        </React.Fragment>
    );
};

export default OnlineBookingSettingsOption;
