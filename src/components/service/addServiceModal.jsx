import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ListItem,
    Box,
    Modal,
    TextareaAutosize,
    Divider,
    List,
    IconButton,
    Grid,
    Typography,
    Checkbox,
    FormControlLabel,
    Paper,
    ListItemText,
    CircularProgress,
    Stack,
    Grid2,
    Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import axios from 'axios';
import { toast } from 'react-toastify';

import CustomTextField from '../settings/commonTextinput';
import SecondaryHeading from '../settings/commonSecondaryHeading';
import serviceNameIcon from '../../assets/nameOfServiceIcon.png';
import cameraIcon from '../../assets/cameraIcon.png';
import cashIcon from '../../assets/priceicon.png';
import CustomSearchBar from '../settings/commonSearchBar';
import ServiceTypeIcon from '../../assets/servicetypeiconNew.png';
import DescriptionIcon from '../../assets/edit.png';
import DurationIcon from '../../assets/durationClock.png';
import CustomSelect from '../settings/commonCustomSelect';
import DeleteIcon from '../../assets/DeleteIcon.png';
import AddEmployeeicon from '../../assets/whoOffersServiceIcon.png';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { t } from 'i18next';
import FSelect from '../commonComponents/F_Select';
import { CreateService, GetServiceTypes } from '../../utils/Api/Service';
import { useHealthDeclarationTemplates } from '../../hooks/api/healthDeclaration';
import { CalendarColors } from '../../data/CalendarColors';
import FTextArea from '../commonComponents/F_TextArea';
import { DeepLinkSwitch } from './DeepLinkSwitch';
import FTextInput from '../commonComponents/F_TextInput';
import InfoIcon from '../../assets/Info.svg';
import CustomCheckbox from '../commonComponents/F_Checkbox';
import FSwitch from '../commonComponents/f-switch';

const durationList = Array.from({ length: (10 * 60) / 5 }, (_, i) => {
    const minutes = (i + 1) * 5;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    let label;
    if (hours > 0 && mins > 0) {
        label = `${hours} h. ${mins} min`;
    } else if (hours > 0) {
        label = `${hours} h`;
    } else {
        label = `${mins} min`;
    }

    return {
        value: minutes,
        label,
        minutes,
    };
});

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '75%',
    bgcolor: '#FFFFFF',
    borderRadius: 3,
    boxShadow: 0,
    p: 3.5,
};

function ServiceModal(props) {
    const { open, handleClose, selectedItem, type, rooms, serviceData, isServiceLoading, setIsServiceLoading } = props;

    const formikRef = useRef(null);
    const user = useSelector((state) => state.user.data);
    const settings = useSelector((state) => state.settings.data);
    const authTokenUser = localStorage.getItem('auth_token');
    const [isLoading, setLoading] = useState(false);
    const [selectedServiceTypeButtonsOption, setSelectedServiceTypeButtonsOption] = useState('is_new_service');
    const [file, setFile] = useState(null);
    const [serviceTypeList, setServiceTypeList] = useState([]);
    const [serviceTypeFilterList, setServiceTypeFilterList] = useState([]);
    const [serviceTypeSearch, setServiceTypeSearch] = useState('');

    const {
        data: healthDeclarationTemplates,
        isLoading: loadingHealthDeclarationTemplates,
        refetch: refetchHealthDeclarationTemplates,
    } = useHealthDeclarationTemplates(undefined, true);

    // const [employeesList, setEmployeesList] = useState([]);
    const [filterList, setFilterList] = useState([]);
    // const [selectedEmplpoyeeList, setSelectedEmplpoyeeList] = useState([]);
    // const [employeeSearch, setEmployeeSearch] = useState('');
    const [showEmployeeList, setShowEmployeeList] = useState(false);

    // const [group_id, setGroup_id] = useState(null);

    const [showCetification, setShowCetification] = useState(false);

    const [initialValues, setInitialValues] = useState({
        id: selectedItem?.id ?? null,
        groupId: selectedItem?.groupId ?? 0,
        group_id: selectedItem?.group_id ?? null,
        name: type == 'create' ? '' : selectedItem?.name || '',
        selectedServiceTypeButtonsOption: 'is_new_service',
        price: type == 'create' ? '' : selectedItem?.price || '',
        selectedServiceTypes: type == 'create' ? [] : selectedItem?.service_type_ids || [],
        is_equipment_service: selectedItem?.is_equipment_service ?? false,
        description: selectedItem?.description ?? '',
        duration_min: selectedItem?.duration_min ?? 5,
        duration_text: selectedItem?.duration_text ?? '',
        is_price_starts_with: selectedItem?.is_price_starts_with ?? false,
        no_of_equipments: selectedItem?.no_of_equipments ?? null,
        available_to_multiple_clients: selectedItem?.no_of_equipments
            ? selectedItem?.no_of_equipments > 1
                ? true
                : false
            : false,
        selectedEmplpoyeeList: [],
        // disableBtn: false,
        is_certified: false,
        room_ids: selectedItem?.rooms ?? [],
        is_addon: selectedItem?.is_addon ?? false,
        main_service_ids: selectedItem?.main_service_ids ? selectedItem?.main_service_ids : [],
        can_book_alone: selectedItem?.can_book_alone ?? false,
        online_booking_color: selectedItem?.online_booking_color || 'A79C92',
        manual_booking_color: selectedItem?.manual_booking_color || 'A79C92',
        enable_popup_msg: selectedItem?.enable_popup_msg ?? false,
        additional_data: {
            is_subscription: selectedItem?.is_subscription || false,
            max_usage_count: selectedItem?.max_usage_count || 0,
        },
        popup_msg_title: selectedItem?.popup_msg_title ?? '',
        popup_msg_desc: selectedItem?.popup_msg_desc ?? '',
        popup_msg_btn_text: selectedItem?.popup_msg_btn_text ?? '',
        enable_online_booking: selectedItem?.enable_online_booking ?? true,
        require_customer_form: selectedItem?.require_customer_form ?? false,
        marketplace_hidden: selectedItem?.marketplace_hidden ?? false,
        max_addon: selectedItem?.max_addon || null,
        online_booking_gap: selectedItem?.online_booking_gap ?? 0,
        sync_service: selectedItem?.sync_service ?? false,
        health_declaration: selectedItem?.health_declaration ?? {
            email_settings: {
                initial_email_before_hours: 'SAME_AS_SETTINGS',
                reminder_email_before_hours: 'SAME_AS_SETTINGS',
            },
            is_health_declaration: false,
            health_declaration_template_id: null,
        },
    });

    const serviceTypeButtonsOption = [
        { id: 'is_new_service', name: t('Services.NewService') },
        { id: 'is_bundle_offer', name: t('Services.BundleOffer') },
        { id: 'is_consultation', name: t('Services.Consultation') },
        { id: 'is_offer_to_new_clients', name: t('Services.OfferToNewClients') },
        { id: 'is_follow_up_treatment', name: t('Services.FollowUPTreat') },
        { id: 'is_offer_to_regular_clients', name: t('Services.OfferToRegClient') },
    ];

    let validationSchema = Yup.object({
        name: Yup.string()
            .required(t('Services.YupErrNameRequired'))
            .min(3, t('Services.YupErrNameMin'))
            .max(100, t('Services.YupErrNameMax')),
        price: Yup.number()
            .typeError(t('Services.YupErrPriceTypeError'))
            .required(t('Services.YupErrPriceRequired'))
            .positive(t('Services.YupErrPricePositive'))
            .min(0, t('Services.YupErrPriceMin')),
        selectedServiceTypes: Yup.array()
            .min(1, t('Services.YupErrSelectedServiceTypesMin'))
            .required(t('Services.YupErrSelectedServiceTypesRequired')),

        is_equipment_service: Yup.boolean().nullable(),
        available_to_multiple_clients: Yup.boolean()
            .typeError(t('Services.YupErrAvailableToMultipleClientsTypeError'))
            .nullable(),
        no_of_equipments: Yup.number()
            .when('available_to_multiple_clients', {
                is: true,
                then: Yup.number()
                    .required(t('Services.YupErrNoOfEquipmentsRequired'))
                    .min(1, t('Services.YupErrNoOfEquipmentsMin'))
                    .typeError(t('Services.YupErrNoOfEquipmentsTypeError')),
            })
            .nullable(),

        selectedEmplpoyeeList: Yup.array().when('is_equipment_service', {
            is: false,
            then: Yup.array()
                .min(1, t('Services.YupErrSelectedEmployeeListMin'))
                .required(t('Services.YupErrSelectedEmployeeListRequired')),
        }),

        main_service_ids: Yup.array().when('is_addon', {
            is: true,
            then: Yup.array()
                .min(1, t('Services.YupErrSelectedAddOnServiceMin'))
                .required(t('Services.YupErrSelectedAddOnServiceRequired')),
        }),
        additional_data: Yup.object({
            is_subscription: Yup.boolean(),

            max_usage_count: Yup.string().when('is_subscription', {
                is: true,
                then: (schema) =>
                    schema
                        .required(t('Services.MaxCountErr')) // empty string → error
                        .test(
                            'len-check',
                            t('Services.MaxCountErr'),
                            (value) => value !== undefined && value.trim().length > 0,
                        )
                        .test(
                            'is-number',
                            t('Services.CountNumberErr'),
                            (value) => /^\d+$/.test(value), // only digits allowed
                        )
                        .test(
                            'min-1',
                            t('Services.MaxNumberErr'),
                            (value) => Number(value) >= 1, // convert & check min
                        ),
                otherwise: (schema) => schema.notRequired(),
            }),
        }),

        enable_popup_msg: Yup.boolean().nullable(),
        popup_msg_title: Yup.string()
            .nullable() // <-- Allow nulls globally
            .when('enable_popup_msg', {
                is: true,
                then: Yup.string()
                    .required(`Popup Title ${t('Customer.IsRequired')}`)
                    .typeError(`Popup Title ${t('Customer.IsRequired')}`),
                otherwise: Yup.string().notRequired().nullable(),
            }),

        popup_msg_desc: Yup.string()
            .nullable()
            .when('enable_popup_msg', {
                is: true,
                then: Yup.string()
                    .required(`Popup Description ${t('Customer.IsRequired')}`)
                    .typeError(`Popup Description ${t('Customer.IsRequired')}`),
                otherwise: Yup.string().notRequired().nullable(),
            }),

        popup_msg_btn_text: Yup.string()
            .nullable()
            .when('enable_popup_msg', {
                is: true,
                then: Yup.string()
                    .required(`Popup Button Text ${t('Customer.IsRequired')}`)
                    .typeError(`Popup Button Text ${t('Customer.IsRequired')}`),
                otherwise: Yup.string().notRequired().nullable(),
            }),

        // max_addon: Yup.number()
        //     .nullable()
        //     .transform((value, originalValue) => {
        //         // Convert empty string to null
        //         if (originalValue === '' || originalValue === null || originalValue === undefined) {
        //             return null;
        //         }
        //         // Convert to number if it's a valid number
        //         const num = Number(originalValue);
        //         return isNaN(num) || num === 0 ? null : num;
        //     })
        //     .min(1, t('Services.YupErrMaxAddonMin'))
        //     .typeError(t('Services.YupErrMaxAddonTypeError')),

        // room_id: Yup.number().typeError().nullable().notRequired(),

        health_declaration: Yup.object({
            email_settings: Yup.object({
                initial_email_before_hours: Yup.string().nullable(),
                reminder_email_before_hours: Yup.string().nullable(),
            }),
            is_health_declaration: Yup.boolean(),
            health_declaration_template_id: Yup.string().when('is_health_declaration', {
                is: true,
                then: Yup.string()
                    .required(t('Services.SelectValidTemplate'))
                    .typeError(t('Services.SelectValidTemplate')),
                otherwise: Yup.string().notRequired().nullable(),
            }),
        }),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            onSavePress(values);
        },
    });
    const [filterdService, setFilterdService] = useState(serviceData);
    //Filter addon service Select options
    const filterService = (serviceData, id) => {
        return serviceData?.filter((item) => item?.value !== id);
    };

    useEffect(() => {
        formik.setValues(initialValues);
        if (selectedItem?.id) {
            const service = filterService(serviceData, selectedItem?.id);
            setFilterdService(service);
        }
    }, []);

    useEffect(() => {
        if (selectedItem && type === 'edit') {
            if (selectedItem?.image) {
                const fetchImage = async () => {
                    try {
                        const response = await fetch(selectedItem.image);
                        const blob = await response.blob();
                        const fileFromImage = new File([blob], 'reuploaded-image.png', {
                            type: blob.type,
                        });
                        setFile(fileFromImage);
                    } catch (error) {
                        console.error('Error fetching the image:', error);
                    }
                };
                fetchImage();
            } else {
                setFile(null);
            }

            // setisMachine(selectedItem?.is_equipment_service || false);
            // setHowManyMachine(selectedItem?.no_of_equipments.toString() || '');
            // setIsChecked(selectedItem?.is_consultation || false);
            formik.setValues(selectedItem);

            if (selectedItem?.is_bundle_offer) {
                setSelectedServiceTypeButtonsOption('is_bundle_offer');
                formik.setFieldValue('selectedServiceTypeButtonsOption', 'is_bundle_offer');
            }

            if (selectedItem?.is_new_service) {
                formik.setFieldValue('selectedServiceTypeButtonsOption', 'is_new_service');
            }

            if (selectedItem?.is_consultation) {
                formik.setFieldValue('selectedServiceTypeButtonsOption', 'is_consultation');
            }

            if (selectedItem?.is_offer_to_new_clients) {
                formik.setFieldValue('selectedServiceTypeButtonsOption', 'is_offer_to_new_clients');
            }

            if (selectedItem?.is_offer_to_regular_clients) {
                formik.setFieldValue('selectedServiceTypeButtonsOption', 'is_offer_to_regular_clients');
            }

            if (selectedItem?.is_follow_up_treatment) {
                formik.setFieldValue('selectedServiceTypeButtonsOption', 'is_follow_up_treatment');
            }

            // compair emp sequece form main api and from props and sort it

            formik.setFieldValue('selectedEmplpoyeeList', selectedItem?.employees || []);
            formik.setFieldValue('selectedServiceTypes', selectedItem?.service_type_ids || []);

            if (selectedItem?.no_of_equipments > 1 && selectedItem?.is_equipment_service) {
                formik.setFieldValue('available_to_multiple_clients', true);
            }

            if (selectedItem?.no_of_equipments == 1 && selectedItem?.is_equipment_service) {
                formik.setFieldValue('no_of_equipments', null);
            }

            if (selectedItem?.is_certified) {
                // formik.setFieldValue('is_certified', is_certified)
                setShowCetification(selectedItem?.is_certified);
            }

            if (selectedItem?.rooms) {
                formik.setFieldValue('room_ids', selectedItem?.rooms || []);
            }

            if (selectedItem?.online_booking_color) {
                formik.setFieldValue('online_booking_color', selectedItem?.online_booking_color);
            }

            if (selectedItem?.manual_booking_color) {
                formik.setFieldValue('manual_booking_color', selectedItem?.manual_booking_color);
            }

            if (selectedItem?.enable_popup_msg) {
                formik.setFieldValue('enable_popup_msg', selectedItem?.enable_popup_msg);
                formik.setFieldValue('popup_msg_title', selectedItem?.popup_msg_title);
                formik.setFieldValue('popup_msg_desc', selectedItem?.popup_msg_desc || '');
                formik.setFieldValue('popup_msg_btn_text', selectedItem?.popup_msg_btn_text || '');
                formik.setFieldValue('require_customer_form', selectedItem?.require_customer_form);
            }

            if (selectedItem?.enable_online_booking) {
                formik.setFieldValue('enable_online_booking', selectedItem?.enable_online_booking || '');
            }

            if (selectedItem?.marketplace_hidden) {
                formik.setFieldValue('marketplace_hidden', selectedItem?.marketplace_hidden ?? false);
            }

            if (selectedItem?.max_addon !== undefined && selectedItem?.max_addon !== null) {
                formik.setFieldValue('max_addon', selectedItem?.max_addon);
            } else {
                formik.setFieldValue('max_addon', null);
            }

            if (!selectedItem?.additional_data || !selectedItem?.additional_data?.is_subscription) {
                formik.setFieldValue('additional_data', {
                    is_subscription: false,
                    max_usage_count: 0,
                });
            }

            if (selectedItem?.health_declaration) {
                formik.setFieldValue('health_declaration', {
                    ...selectedItem?.health_declaration,
                    email_settings: {
                        initial_email_before_hours:
                            selectedItem?.health_declaration?.email_settings?.initial_email_before_hours === null
                                ? 'SAME_AS_SETTINGS'
                                : selectedItem?.health_declaration?.email_settings?.initial_email_before_hours,
                        reminder_email_before_hours:
                            selectedItem?.health_declaration?.email_settings?.reminder_email_before_hours === null
                                ? 'SAME_AS_SETTINGS'
                                : selectedItem?.health_declaration?.email_settings?.reminder_email_before_hours,
                    },
                });
            } else {
                formik.setFieldValue('health_declaration', {
                    email_settings: {
                        initial_email_before_hours: 'SAME_AS_SETTINGS',
                        reminder_email_before_hours: 'SAME_AS_SETTINGS',
                    },
                    is_health_declaration: false,
                    health_declaration_template_id: null,
                });
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItem]);

    useEffect(() => {
        fetchCategoryApi();
        if (!healthDeclarationTemplates) {
            refetchHealthDeclarationTemplates();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchCategoryApi() {
        try {
            const response = await GetServiceTypes();

            if (response && response.data && response.data.data) {
                const arr = response.data.data.map((element) => ({
                    ...element,
                    value: element.id,
                    label: element.service_type,
                }));

                setServiceTypeList(arr);
                setServiceTypeFilterList(arr);

                const itemEquipment = arr.find((obj) => obj.id === selectedItem?.service_type_id);
                if (itemEquipment && itemEquipment.is_equipment_based) {
                    formik.setFieldValue('is_equipment_service', true);
                    // setisMachineVisible(true);
                    // setisMachine(true);
                } else {
                    formik.setFieldValue('is_equipment_service', false);
                    // setisMachineVisible(false);
                    // setisMachine(false);
                }
            } else {
                setServiceTypeList([]);
                setServiceTypeFilterList([]);
            }

            fetchEmployees();
        } catch (error) {
            console.error('Error fetching service type data:', error);
            setServiceTypeList([]);
            setServiceTypeFilterList([]);
        } finally {
            setLoading(false);
        }
    }

    async function fetchEmployees() {
        try {
            const response = await axios.get(`${process.env.REACT_APP_URL}/api/v1/store/employee/get`, {
                headers: {
                    Authorization: `Bearer ${authTokenUser}`,
                },
            });

            if (response) {
                // setEmployeesList(response.data.data);
                setFilterList(response.data.data);

                if (type == 'edit' && selectedItem && selectedItem.employees.length > 0) {
                    var arr = [];
                    for (let i = 0; i < response?.data.data.length; i++) {
                        const e = response?.data.data[i];
                        for (let j = 0; j < selectedItem.employees.length; j++) {
                            const element = selectedItem.employees[j];
                            if (e.id == element.id) arr.push({ ...e, price: element.price });
                        }
                    }
                    // setSelectedEmplpoyeeList(arr);
                    // formik.setFieldValue('selectedEmplpoyeeList', arr)
                    // if (formikRef.current) {
                    //     formikRef.current.setFieldValue('selectedEmplpoyeeList', arr);
                    // }
                }
            } else {
                setServiceTypeList([]);
                setServiceTypeFilterList([]);
            }
        } catch (error) {
            console.error('Error fetching employee data:', error);
            setFilterList([]);
            // setEmployeesList([]);
        } finally {
            setLoading(false);
        }
    }

    const handleRowClick = (name) => {
        setSelectedServiceTypeButtonsOption(name);
        formik.setFieldValue('selectedServiceTypeButtonsOption', name);
    };

    const handleToggle = (service) => {
        const isAlreadySelected = formik.values.selectedServiceTypes.includes(service.id);

        let updatedList;

        if (isAlreadySelected) {
            updatedList = formik.values.selectedServiceTypes.filter((el) => el !== service.id);
        } else {
            updatedList = [...formik.values.selectedServiceTypes, service.id];
        }

        formik.setFieldValue('selectedServiceTypes', updatedList);
    };

    useEffect(() => {
        let updatedList = [];
        serviceTypeList.map((serviceTypeObj) => {
            if (formik.values.selectedServiceTypes.includes(serviceTypeObj?.id)) {
                updatedList.push(serviceTypeObj);
            }
        });

        const allSelectedRequireEquipment =
            updatedList.length > 0 && updatedList.every((selectedItem) => selectedItem.is_equipment_based === true);

        const needCertification = updatedList.some((item) => item.need_certification);
        setShowCetification(needCertification);

        formik.setFieldValue('is_equipment_service', allSelectedRequireEquipment);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.selectedServiceTypes, serviceTypeList]);

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const updateServiceTypeSearch = useCallback(
        (text) => {
            if (text) {
                const searchTerm = text.trim().toUpperCase();
                const newData = serviceTypeList.filter((item) => {
                    const itemLabel = item.label ? item.label.trim().toUpperCase() : '';
                    return itemLabel.includes(searchTerm);
                });
                setServiceTypeFilterList(newData);
            } else {
                setServiceTypeFilterList(serviceTypeList);
            }
            setServiceTypeSearch(text);
        },
        [serviceTypeList],
    );

    function addEmployee(item) {
        let employeesListData = [...formik.values.selectedEmplpoyeeList];
        if (employeesListData.some((el) => el.id == item.id)) {
            const index = employeesListData.findIndex((e) => e.id == item.id);
            if (index !== undefined) employeesListData.splice(index, 1);
        } else {
            employeesListData.push({
                ...item,
                price: formik.values.price != '' ? formik.values.price : '',
            });
        }

        formik.setFieldValue('selectedEmplpoyeeList', employeesListData);
        // setSelectedEmplpoyeeList((prev) => [...prev]);
    }

    const handlePriceChange = (id, value) => {
        formik.setFieldValue(
            'selectedEmplpoyeeList',
            formik.values.selectedEmplpoyeeList.map((employee) =>
                employee.id === id ? { ...employee, price: value } : employee,
            ),
        );
    };

    const onSavePress = async (values) => {
        let selectedServiceType = {
            is_new_service: false,
            is_bundle_offer: false,
            is_consultation: false,
            is_offer_to_new_clients: false,
            is_follow_up_treatment: false,
            is_offer_to_regular_clients: false,
        };
        selectedServiceType[selectedServiceTypeButtonsOption] = true;

        setLoading(true);

        const formData = new FormData();

        var objDuration = null;
        try {
            objDuration = durationList.find((item) => item.value === values.duration_min);
        } catch (e) {
            objDuration = null;
        }

        var serviceTypesId = [];
        if (values.selectedServiceTypes.length > 0) {
            serviceTypesId = values.selectedServiceTypes.map((item) => (typeof item === 'object' ? item.id : item));
        }

        var employeeListForSubmit = [];

        if (
            formik.values.selectedEmplpoyeeList.length > 0 &&
            formik.values.selectedEmplpoyeeList.some((el) => el.price === '' || !el.price)
        ) {
            formik.setErrors({ selectedEmplpoyeeList: t('Services.YupErrEnterAll') });
            setLoading(false);
            return;
        } else if (formik.values.selectedEmplpoyeeList.length > 0) {
            employeeListForSubmit = formik.values.selectedEmplpoyeeList.map(({ id, price }) => ({
                employee_id: id,
                price,
            }));
        }

        const sendData = {
            name: values.name,
            group_id: values.group_id,
            description: values.description,
            duration_text: objDuration.label,
            duration_min: objDuration.minutes,
            price: values.price,
            is_equipment_service: values.is_equipment_service,
            no_of_equipments: values?.available_to_multiple_clients ? values?.no_of_equipments : 1,
            is_special: false,
            special_price: 0,
            service_type_id:
                typeof values.selectedServiceTypes[0] === 'object'
                    ? values.selectedServiceTypes[0].id
                    : values.selectedServiceTypes[0],
            service_type_ids: serviceTypesId,
            employees: !values.is_equipment_service ? employeeListForSubmit : [],
            group: 'abc',
            is_price_starts_with: values.is_price_starts_with,
            is_certified: values?.is_certified,
            room_ids: values?.room_ids ? values?.room_ids : [],
            is_addon: values?.is_addon,
            main_service_ids: values?.is_addon ? values?.main_service_ids : [],
            can_book_alone: values?.can_book_alone,
            manual_booking_color: values?.manual_booking_color || 'A79C92',
            online_booking_color: values?.online_booking_color || 'A79C92',

            enable_popup_msg: values?.enable_popup_msg,
            additional_data:
                values?.additional_data?.is_subscription === false
                    ? null
                    : {
                          is_subscription: values?.additional_data?.is_subscription,
                          max_usage_count: Number(values?.additional_data?.max_usage_count),
                      },
            popup_msg_title: values?.popup_msg_title,
            popup_msg_desc: values?.popup_msg_desc,
            popup_msg_btn_text: values?.popup_msg_btn_text,
            enable_online_booking: values?.enable_online_booking,
            marketplace_hidden: values.marketplace_hidden,
            sync_service: values?.sync_service,
            // require_customer_form: values?.require_customer_form,
            require_customer_form: values?.require_customer_form,
            online_booking_gap: values?.online_booking_gap || 0,
            health_declaration: {
                ...values?.health_declaration,
                email_settings: {
                    initial_email_before_hours:
                        values?.health_declaration?.email_settings?.initial_email_before_hours === 'SAME_AS_SETTINGS'
                            ? null
                            : values?.health_declaration?.email_settings?.initial_email_before_hours,
                    reminder_email_before_hours:
                        values?.health_declaration?.email_settings?.reminder_email_before_hours === 'SAME_AS_SETTINGS'
                            ? null
                            : values?.health_declaration?.email_settings?.reminder_email_before_hours,
                },
            },
            // is_consultation: isChecked,
            // is_bundle_offer: isCheckedBundelOffer,
            max_addon:
                values?.max_addon === '' ||
                values?.max_addon === null ||
                values?.max_addon === undefined ||
                values?.max_addon === 0
                    ? null
                    : values?.max_addon,
            ...selectedServiceType,
        };

        if (selectedItem) {
            sendData.remove_image = file === null ? true : false;
        }

        formData.append('req_body', JSON.stringify(sendData));

        if (file) {
            formData.append('image', file);
        }

        let API = null;
        let METHOD = '';
        if (selectedItem) {
            API = `${process.env.REACT_APP_URL}/api/v1/store/service/${selectedItem?.id}`;
            METHOD = 'PATCH';
        } else {
            API = `${process.env.REACT_APP_URL}/api/v1/store/service`;
            METHOD = 'POST';
        }

        try {
            const response = await CreateService({ METHOD, API, formData });
            if (response) {
                if (type == 'create') {
                    toast.success(t('Services.ToastSuccessServ'));
                } else {
                    toast.success(t('Services.ToastUSuccessServ'));
                }

                if (formikRef.current) {
                    formikRef.current.resetForm();
                }
                resetFields(123);
                setIsServiceLoading(true);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error during API call:', error);
        }
    };

    const resetFields = (command) => {
        // setGroup_id(null);
        // // setSelectedServiceTypes([]);
        // setServiceDesc('');
        // // setDuration(null);
        // setIsPriceStartFrom(false);
        // setFile(null);
        // // setSelectedEmplpoyeeList([]);
        // setisMachine(false);
        // setHowManyMachine('');
        // setIsChecked(false);
        // setIsCheckedBundelOffer(false);
        // setLoading(false);
        formik.handleReset();
        formik.resetForm();
        handleClose(command);
    };

    const handleNoOfPeople = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        // setHowManyMachine(value)
        formik.setFieldValue('no_of_equipments', value);
    };

    let roomOption = [
        ...rooms.map((room) => ({
            value: room.id,
            label: room.name,
        })),
    ];

    const handleAddonService = (e) => {
        const selectedValues = e.target.value;
        let allID = serviceData?.map((data) => data.value);

        if (
            (selectedValues === 0 || selectedValues.includes(0)) &&
            allID.length === formik?.values?.main_service_ids?.length
        ) {
            formik.setFieldValue('main_service_ids', []);
        } else if (selectedValues === 0 || selectedValues.includes(0)) {
            formik.setFieldValue('main_service_ids', allID);
        } else if (selectedValues.length === 0) {
            formik.setFieldValue('main_service_ids', []);
        } else {
            formik.setFieldValue('main_service_ids', selectedValues);
        }
    };

    const ColorContainer = ({ name, color, border }) => {
        return (
            <Stack flexDirection={'row'} justifyContent={'flex-start'} gap={2} alignItems={'center'}>
                <Stack
                    sx={{
                        width: 22,
                        height: 22,
                        borderRadius: 1,
                        backgroundColor: color,
                        border: border,
                    }}
                />
                <Typography variant="body1" color="black" sx={{ ml: 2 }}>
                    {name}
                </Typography>
            </Stack>
        );
    };

    const OnlineBookingOptions = Object.entries(CalendarColors).map(([key, { bgColor, name }]) => {
        return {
            value: key,
            label: <ColorContainer name={name} color={bgColor} border={`1px solid ${bgColor}`} />,
        };
    });

    const FormikErrorComponent = ({ field }) => {
        if (formik.touched[field] && formik.errors[field]) {
            return <Typography style={{ color: 'red' }}>{formik.errors[field]}</Typography>;
        }
    };

    useEffect(() => {
        if (healthDeclarationTemplates) {
            const template = healthDeclarationTemplates.data.items.find(
                (item) => item.id === selectedItem?.health_declaration?.health_declaration_template_id,
            );
            if (template) {
                formik.setFieldValue('health_declaration.health_declaration_template_id', template.id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [healthDeclarationTemplates]);

    return (
        <Modal
            disableAutoFocus
            open={open}
            onClose={handleClose}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    width: { xs: '90%', md: 'auto' },
                    maxWidth: '80%',
                    maxHeight: '90%',
                    display: 'flex',
                    overflow: 'hidden',
                    flexDirection: 'column',
                    position: 'relative',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    borderRadius: 8,
                    py: 4,
                    px: 4,
                }}
            >
                <IconButton
                    onClick={() => resetFields()}
                    sx={{
                        position: 'absolute',
                        top: 5,
                        right: 10,
                        zIndex: 10,
                        color: 'black',
                        width: 'auto',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {isServiceLoading ? (
                    <Stack
                        sx={{
                            py: 30,
                            px: 50,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <CircularProgress size="2.5rem" sx={{ color: '#6f6f6f' }} />
                    </Stack>
                ) : (
                    <Grid2 spacing={3} container>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                }}
                            >
                                <img src={serviceNameIcon} style={{ width: 22, height: 22, marginRight: 10 }} alt="" />

                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Services.SrvName')}
                                </Typography>
                            </Box>
                            <CustomTextField
                                id="name"
                                name="name"
                                value={formik.values.name}
                                mt={1}
                                onChange={formik.handleChange}
                                placeholder={t('Services.PlaceHLDSrv')}
                                onBlur={formikRef.handleBlur}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div style={{ color: 'red', fontSize: '12px' }}>{formik.errors.name}</div>
                            )}

                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    marginTop: 20,
                                }}
                            >
                                <img src={ServiceTypeIcon} style={{ width: 20, height: 20, marginRight: 10 }} alt="" />

                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Services.SrvType')}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    mt: 1,
                                    width: '100%',
                                    justifyContent: 'space-between',
                                }}
                            >
                                {serviceTypeButtonsOption.slice(0, 6).map((item) => (
                                    <Paper
                                        key={item.id}
                                        sx={{
                                            cursor: 'pointer',
                                            padding: 1,
                                            borderRadius: '12px',
                                            height: 30,
                                            width: '50%',
                                            backgroundColor:
                                                formik.values.selectedServiceTypeButtonsOption === item.id
                                                    ? '#44B904'
                                                    : 'white',
                                            color:
                                                formik.values.selectedServiceTypeButtonsOption === item.id
                                                    ? 'white'
                                                    : 'black',
                                            flex: '1 1 calc(50% - 10px)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            border:
                                                formik.values.selectedServiceTypeButtonsOption === item.id
                                                    ? `1px solid #44B904`
                                                    : `1px solid #A79C92`,
                                        }}
                                        elevation={0}
                                        onClick={() => handleRowClick(item.id)}
                                    >
                                        <Typography
                                            variant="body1"
                                            textAlign="center"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: 13,
                                                color:
                                                    formik.values.selectedServiceTypeButtonsOption === item.id
                                                        ? 'white'
                                                        : '#A79C92',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {item.name}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>

                            <Stack>
                                <Box
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'flex-start',
                                        alignItems: 'center',
                                        marginTop: 20,
                                    }}
                                >
                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                        {' '}
                                        {t('Services.SelectRoom')}
                                    </Typography>
                                </Box>
                                <FSelect
                                    value={formik.values.room_ids}
                                    onChange={formik.handleChange}
                                    defaultValue={[]}
                                    name="room_ids"
                                    placeholderText={t('Services.SelectRoom')}
                                    options={roomOption}
                                    disabledDefaultValue={false}
                                    showPlaceHolder
                                    isMultiSelect
                                    allowSelectAll={false}
                                    selectAllRenderText={t('Services.AllRooms')}
                                    TextToDisplayWithCount={t('Services.Rooms')}
                                />
                                {formik.touched.room_ids && formik.errors.room_ids && (
                                    <div style={{ color: 'red', fontSize: '12px' }}>{formik.errors.room_ids}</div>
                                )}
                            </Stack>

                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    marginTop: 20,
                                }}
                            >
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Services.SrvTreatment')}
                                </Typography>
                            </Box>

                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowY: 'auto',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: '320px',
                                    marginTop: 10,
                                    borderRadius: '12px',
                                    border: '1px solid #A79C92',
                                }}
                            >
                                <Box
                                    style={{
                                        display: 'flex',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                        backgroundColor: 'white',
                                        width: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <CustomSearchBar
                                        width={'95%'}
                                        height={40}
                                        value={serviceTypeSearch}
                                        onChange={(e) => updateServiceTypeSearch(e.target.value)}
                                    />
                                </Box>

                                <List
                                    style={{
                                        width: '100%',
                                        overflowY: 'scroll',
                                        scrollbarWidth: 'none',
                                    }}
                                >
                                    {serviceTypeFilterList.map((service) => (
                                        <React.Fragment key={service.id}>
                                            <ListItem
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    paddingTop: 0,
                                                    paddingBottom: 0,
                                                }}
                                                onClick={() => handleToggle(service)}
                                            >
                                                <Typography
                                                    sx={{
                                                        color: '#545454',
                                                        fontWeight: 400,
                                                        fontSize: '15px',
                                                    }}
                                                >
                                                    {service.label}
                                                </Typography>

                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            disableRipple
                                                            // checked={formik.values.selectedServiceTypes.some((selectedItem) => {
                                                            //     if (typeof selectedItem === 'object' && selectedItem !== null) {
                                                            //         return selectedItem.id === service.id;
                                                            //     }
                                                            //     return selectedItem === service.id;
                                                            // })}

                                                            checked={formik.values.selectedServiceTypes.some(
                                                                (selectedItem) => {
                                                                    if (
                                                                        typeof selectedItem === 'object' &&
                                                                        selectedItem !== null
                                                                    ) {
                                                                        return selectedItem.id === service.id;
                                                                    }
                                                                    return selectedItem === service.id;
                                                                },
                                                            )}
                                                            onChange={() => handleToggle(service)}
                                                            sx={{
                                                                '&.Mui-checked .MuiSvgIcon-root': {
                                                                    backgroundColor: 'transparent',
                                                                    borderColor: '#A79C92',
                                                                    color: 'green',
                                                                },
                                                                mt: 0,
                                                                mb: 0,
                                                            }}
                                                        />
                                                    }
                                                    label=""
                                                />
                                            </ListItem>
                                            <Divider
                                                sx={{
                                                    borderColor: '#A79C92',
                                                    margin: '3px 0',
                                                    borderBottomWidth: 1,
                                                    marginLeft: 2,
                                                    marginRight: 2,
                                                }}
                                            />
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Box>

                            {formik.touched.selectedServiceTypes && formik.errors.selectedServiceTypes && (
                                <div style={{ color: 'red', fontSize: '12px' }}>
                                    {formik.errors.selectedServiceTypes}
                                </div>
                            )}

                            <Stack
                                sx={{
                                    width: '100%',
                                    gap: 2,
                                    mt: 2,
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                }}
                            >
                                <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                        {' '}
                                        {t('Services.CoFoOB')}
                                    </Typography>
                                    <FSelect
                                        name="online_booking_color"
                                        value={formik.values.online_booking_color}
                                        onChange={(e) => formik.setFieldValue('online_booking_color', e.target.value)}
                                        // defaultValue={"A79C92"}
                                        options={OnlineBookingOptions}
                                    />
                                </Stack>

                                <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                        {' '}
                                        {t('Services.CoFoMB')}
                                    </Typography>
                                    <FSelect
                                        name="manual_booking_color"
                                        value={formik.values.manual_booking_color}
                                        onChange={(e) => formik.setFieldValue('manual_booking_color', e.target.value)}
                                        // defaultValue={"A79C92"}
                                        options={OnlineBookingOptions}
                                    />
                                </Stack>
                            </Stack>

                            <Stack
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    p: 0,
                                    gap: 2,
                                    mt: 2,
                                }}
                            >
                                <CustomCheckbox
                                    // label={t("Services.ShowPopMsg")}
                                    checked={formik.values.enable_popup_msg}
                                    name="enable_popup_msg"
                                    value={formik.values.enable_popup_msg}
                                    onChange={(e) =>
                                        formik.setFieldValue('enable_popup_msg', !formik.values.enable_popup_msg)
                                    }
                                />
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Services.ShowPopMsg')}
                                </Typography>
                            </Stack>

                            {formik.values.enable_popup_msg && (
                                <React.Fragment>
                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%', mt: 2 }}>
                                        {' '}
                                        {t('Services.PopUpTitle')}
                                    </Typography>
                                    <CustomTextField
                                        sx={{ mt: 0 }}
                                        name="popup_msg_title"
                                        onBlur={formik.handleBlur}
                                        value={formik.values.popup_msg_title}
                                        onChange={(e) => formik.setFieldValue('popup_msg_title', e.target.value)}
                                    />
                                    <FormikErrorComponent field="popup_msg_title" />

                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%', mt: 2 }}>
                                        {' '}
                                        {t('Services.PopUpBtnText')}
                                    </Typography>
                                    <CustomTextField
                                        sx={{ mt: 0 }}
                                        name="popup_msg_btn_text"
                                        onBlur={formik.handleBlur}
                                        value={formik.values.popup_msg_btn_text}
                                        onChange={(e) => formik.setFieldValue('popup_msg_btn_text', e.target.value)}
                                    />
                                    <FormikErrorComponent field="popup_msg_btn_text" />

                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%', mt: 2 }}>
                                        {' '}
                                        {t('Services.PopUpDesc')}
                                    </Typography>
                                    <FTextArea
                                        sx={{ mt: 0 }}
                                        name="popup_msg_desc"
                                        onBlur={formik.handleBlur}
                                        value={formik.values.popup_msg_desc}
                                        onChange={(e) => formik.setFieldValue('popup_msg_desc', e.target.value)}
                                    />
                                    <FormikErrorComponent field="popup_msg_desc" />
                                </React.Fragment>
                            )}

                            <Stack
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    p: 0,
                                    gap: 2,
                                    mt: 2,
                                }}
                            >
                                <CustomCheckbox
                                    checked={formik?.values?.additional_data?.is_subscription}
                                    name="additional_data.is_subscription"
                                    value={formik?.values?.additional_data?.is_subscription}
                                    onChange={(e) => {
                                        formik.setFieldValue(
                                            'additional_data.is_subscription',
                                            !formik?.values?.additional_data?.is_subscription,
                                        );
                                        !formik?.values?.additional_data?.max_usage_count &&
                                            formik.setFieldValue('additional_data.max_usage_count', 1);
                                    }}
                                />
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {t('Services.ServiceAsSubscription')}
                                </Typography>
                            </Stack>

                            {formik.values.additional_data?.is_subscription && (
                                <React.Fragment>
                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%', mt: 2 }}>
                                        {t('Services.SubscriptionMaxCount')}
                                    </Typography>
                                    <FTextInput
                                        sx={{ mt: 0 }}
                                        name="additional_data.max_usage_count"
                                        onBlur={formik.handleBlur}
                                        value={formik.values.additional_data?.max_usage_count}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^\d*$/.test(value)) {
                                                formik.setFieldValue('additional_data.max_usage_count', value);
                                            }
                                        }}
                                    />

                                    {formik?.errors?.additional_data?.max_usage_count &&
                                        formik?.touched?.additional_data?.max_usage_count && (
                                            <Typography style={{ color: 'red' }}>
                                                {formik?.errors?.additional_data?.max_usage_count}
                                            </Typography>
                                        )}
                                </React.Fragment>
                            )}

                            <FSwitch
                                label={t('Services.SyncService')}
                                sx={{ color: '#6F6F6F', mt: 2 }}
                                checked={formik?.values?.sync_service}
                                onChange={(e) => formik?.setFieldValue('sync_service', e.target.checked)}
                                name={'sync_service'}
                            />

                            <DeepLinkSwitch
                                formik={formik}
                                idtype={'sid'}
                                selectid={selectedItem === null ? 0 : selectedItem?.id}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                }}
                            >
                                <img src={DescriptionIcon} style={{ width: 20, height: 20, marginRight: 10 }} alt="" />
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Services.SrvDesc')} {`(${t('Common.Optional')})`}
                                </Typography>
                            </Box>
                            <TextareaAutosize
                                id="description"
                                minRows={3}
                                maxRows={6}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    fontSize: '16px',
                                    borderRadius: '10px',
                                    border: '1px solid #A79C92',
                                    outline: 'none',
                                    resize: 'none',
                                    marginTop: 5,
                                }}
                                maxLength={2000}
                            />
                            <Typography variant="caption" sx={{ color: '#6F6F6F', width: '100%', textAlign: 'right' }}>
                                {' '}
                                {formik.values.description?.length}/2000
                            </Typography>

                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    marginTop: 1,
                                }}
                            >
                                <img src={DurationIcon} style={{ width: 20, height: 20, marginRight: 10 }} alt="" />

                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Common.Duration')}
                                </Typography>
                            </Box>
                            <CustomSelect
                                id="duration_min"
                                value={formik.values.duration_min}
                                onChange={(e) => {
                                    formik.setFieldValue('duration_min', e.target.value);
                                }}
                                options={durationList}
                                sx={{ width: '100%', mt: 0.5, height: 40 }}
                                borderColor="#A79C92"
                                borderThickness="1px"
                                noLabel
                            />

                            <Stack
                                flexDirection={'row'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                sx={{ width: '100%', mt: 3, mb: 0 }}
                            >
                                <Stack
                                    flex={0.9}
                                    flexDirection={'row'}
                                    justifyContent={'flex-start'}
                                    alignItems={'center'}
                                >
                                    <img src={cashIcon} style={{ width: 20, height: 20, marginRight: 10 }} alt="" />

                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                        {' '}
                                        {t('Common.Price')} (kr.)
                                    </Typography>
                                </Stack>

                                <Stack
                                    flexDirection={'row'}
                                    justifyContent={'space-between'}
                                    alignItems={'center'}
                                    onClick={() =>
                                        formik.setFieldValue(
                                            'is_price_starts_with',
                                            !formik.values.is_price_starts_with,
                                        )
                                    }
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <Checkbox
                                        checked={formik.values.is_price_starts_with}
                                        onChange={formik.handleChange}
                                        sx={{
                                            '&.Mui-checked .MuiSvgIcon-root': {
                                                backgroundColor: 'transparent',
                                                borderColor: '#A79C92',
                                                color: 'green',
                                            },
                                            p: 0,
                                        }}
                                    />

                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                        {' '}
                                        {t('Services.StartingFr')}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <CustomTextField
                                id="price"
                                name="price"
                                type="text"
                                placeholder={t('Services.EnterPrice')}
                                inputMode="decimal"
                                onKeyPress={(e) => {
                                    const regex = /^[0-9]*\.?[0-9]*$/;
                                    if (!regex.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => {
                                    const newPrice = e.target.value;
                                    formik.setFieldValue('price', newPrice);
                                    // setStandardPrice(newPrice);
                                }}
                                value={formik.values.price}
                            />
                            {formik.touched.price && formik.errors.price && (
                                <div style={{ color: 'red', fontSize: '12px' }}>{formik.errors.price}</div>
                            )}

                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    marginTop: 15,
                                }}
                            >
                                <img src={cameraIcon} style={{ width: 20, height: 20, marginRight: 10 }} alt="" />
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Services.SrvPic')}
                                    {`(${t('Common.Optional')})`}
                                </Typography>
                            </Box>

                            {!file && (
                                <label
                                    htmlFor="file-upload"
                                    style={{
                                        display: 'inline-block',
                                        padding: '10px',
                                        border: '1px solid #6F6F6F',
                                        width: '137px',
                                        height: 40,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: '#f5f5f5',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.3s',
                                        marginTop: '6px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: 400,
                                            fontSize: '15px',
                                            color: '#6F6F6F',
                                        }}
                                    >
                                        {t('Services.SrvUpl')}
                                    </span>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="file-upload"
                                        onChange={handleFileChange}
                                        style={{
                                            display: 'none',
                                        }}
                                    />
                                </label>
                            )}

                            {file && (
                                <Stack
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 6,
                                    }}
                                >
                                    <>
                                        <Paper
                                            elevation={0}
                                            style={{
                                                width: '137px',
                                                height: 40,
                                                borderRadius: '12px',
                                                border: '1px solid #367B3D',
                                                opacity: 1,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                padding: '0 10px',
                                                backgroundColor: 'transparent',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontWeight: 400,
                                                    fontSize: '15px',
                                                    color: '#367B3D',
                                                }}
                                            >
                                                {t('Common.Uploaded')}!
                                            </span>
                                        </Paper>

                                        <IconButton onClick={handleRemoveFile} style={{ padding: 0 }} disableRipple>
                                            <img
                                                src={DeleteIcon}
                                                alt="Delete"
                                                style={{
                                                    width: '17px',
                                                    height: '19px',
                                                    marginLeft: 20,
                                                }}
                                            />
                                        </IconButton>
                                    </>
                                </Stack>
                            )}

                            {formik.values.is_equipment_service && (
                                <>
                                    <Stack
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginTop: '22px',
                                            paddingLeft: 0,
                                            marginLeft: 0,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() =>
                                            formik.setFieldValue(
                                                'available_to_multiple_clients',
                                                !formik.values.available_to_multiple_clients,
                                            )
                                        }
                                    >
                                        <Checkbox
                                            disableRipple
                                            checked={formik.values.available_to_multiple_clients}
                                            onChange={() =>
                                                formik.setFieldValue(
                                                    'available_to_multiple_clients',
                                                    !formik.values.available_to_multiple_clients,
                                                )
                                            }
                                            sx={{
                                                '& .MuiSvgIcon-root': {
                                                    border: '0.1px solid #A79C92',
                                                    borderRadius: '4px',
                                                },
                                                '&.Mui-checked .MuiSvgIcon-root': {
                                                    backgroundColor: 'transparent',
                                                    borderColor: '#A79C92',
                                                    color: 'green',
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                },
                                                paddingLeft: 0,
                                            }}
                                        />

                                        <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                            {' '}
                                            {t('Services.SrvAtMulti')}
                                        </Typography>
                                    </Stack>

                                    {!formik.values.available_to_multiple_clients && (
                                        <div style={{ marginTop: '10px' }}>
                                            <SecondaryHeading
                                                fontColor="#6F6F6F"
                                                size={'15px'}
                                                text={t('Services.SrvAtMultiDes')}
                                            />
                                        </div>
                                    )}

                                    {formik.values.available_to_multiple_clients && (
                                        <div style={{ marginTop: '10px', width: '100%' }}>
                                            <CustomTextField
                                                id="no_of_equipments"
                                                value={formik.values.no_of_equipments}
                                                onChange={(event) => handleNoOfPeople(event)}
                                                placeholder={'Number of clients'}
                                            />
                                            {formik.touched.no_of_equipments && formik.errors.no_of_equipments && (
                                                <div style={{ color: 'red', fontSize: '12px' }}>
                                                    {formik.errors.no_of_equipments}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {showCetification && (
                                <Stack>
                                    <Stack
                                        onClick={() =>
                                            formik.setFieldValue('is_certified', !formik.values.is_certified)
                                        }
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginTop: '22px',
                                            paddingLeft: 0,
                                            marginLeft: 0,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Checkbox
                                            disableRipple
                                            checked={formik.values.is_certified}
                                            sx={{
                                                // '& .MuiSvgIcon-root': {
                                                //     border: '0.1px solid #A79C92',
                                                //     borderRadius: '4px',
                                                // },
                                                '&.Mui-checked .MuiSvgIcon-root': {
                                                    backgroundColor: 'transparent',
                                                    borderColor: '#A79C92',
                                                    color: 'green',
                                                },
                                                // '&:hover': {
                                                //     backgroundColor: 'transparent',
                                                // },
                                                paddingLeft: 0,
                                            }}
                                        />

                                        <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                            {' '}
                                            {t('Services.SrvGov')}
                                        </Typography>
                                    </Stack>

                                    {formik.touched.is_certified && formik.errors.is_certified && (
                                        <Typography style={{ color: 'red', fontSize: '12px' }}>
                                            {formik.errors.is_certified}
                                        </Typography>
                                    )}
                                </Stack>
                            )}

                            {!formik.values.is_equipment_service && (
                                <>
                                    <Box
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                            marginTop: 15,
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                            {' '}
                                            {t('Services.SrvWho')}?
                                        </Typography>
                                    </Box>

                                    <Box
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            scrollbarWidth: 'none',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                            width: '100%',
                                            marginTop: '10px',
                                            borderRadius: '12px',
                                            boxShadow: '0px 4px 55px 0px #0000001A',
                                            paddingBottom: 10,
                                        }}
                                    >
                                        <Box
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                width: '100%',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <Box
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    width: '15%',
                                                    height: '155px',
                                                    marginRight: 8,
                                                }}
                                            >
                                                <img
                                                    src={AddEmployeeicon}
                                                    style={{
                                                        width: 35,
                                                        height: 35,
                                                        margin: 20,
                                                        cursor: 'pointer',
                                                    }}
                                                    alt=""
                                                    onClick={() => setShowEmployeeList(true)}
                                                />
                                            </Box>

                                            <Stack
                                                flex={1}
                                                flexDirection={'row'}
                                                justifyContent={'center'}
                                                alignItems={'flex-start'}
                                            >
                                                <Grid container spacing={0}>
                                                    {formik.values.selectedEmplpoyeeList.map((employee) => (
                                                        <Grid item xs={12} sm={4} key={employee.id} sx={{ mt: 1 }}>
                                                            <Stack
                                                                flex={1}
                                                                flexDirection={'column'}
                                                                alignItems={'center'}
                                                                justifyContent={'flex-start'}
                                                                sx={{ m: 0, p: 0 }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: '#1f1f1f',
                                                                        width: '100%',
                                                                        textAlign: 'center',
                                                                        fontSize: 14,
                                                                        fontWeight: 600,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: '2',
                                                                        WebkitBoxOrient: 'vertical',
                                                                        lineHeight: 1.3,
                                                                    }}
                                                                >
                                                                    {employee.name}
                                                                </Typography>

                                                                <CustomTextField
                                                                    value={employee.price}
                                                                    onChange={(e) =>
                                                                        handlePriceChange(employee.id, e.target.value)
                                                                    }
                                                                    width={'80%'}
                                                                    height={40}
                                                                    onKeyPress={(e) => {
                                                                        const regex = /^[0-9]*\.?[0-9]*$/;
                                                                        if (
                                                                            !regex.test(e.key) &&
                                                                            e.key !== 'Backspace' &&
                                                                            e.key !== 'Tab'
                                                                        ) {
                                                                            e.preventDefault();
                                                                        }
                                                                    }}
                                                                    lineHeight={0.2}
                                                                    mt={0.4}
                                                                    pt={0}
                                                                    // placeholder={'Price'}
                                                                    placeholderFontSize={14}
                                                                    inputFontSize={14}
                                                                    // sx={{ pl:1,pt:0 }}
                                                                />
                                                            </Stack>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Stack>
                                        </Box>
                                    </Box>

                                    {formik.touched.selectedEmplpoyeeList && formik.errors.selectedEmplpoyeeList && (
                                        <div style={{ color: 'red', fontSize: '12px' }}>
                                            {formik.errors.selectedEmplpoyeeList}
                                        </div>
                                    )}
                                </>
                            )}

                            <Stack
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    width: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mt: 2,
                                    pl: 2,
                                }}
                            >
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {t('Services.OnlineBookingGap')}
                                </Typography>
                                <FTextInput
                                    mt={0}
                                    name="online_booking_gap"
                                    value={formik.values.online_booking_gap}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        formik.setFieldValue('online_booking_gap', value === '' ? 0 : parseInt(value));
                                    }}
                                    type="text"
                                    placeholder="0"
                                />
                            </Stack>

                            <Stack display={'flex'} flexDirection={'row'} mt={2} width={'100%'} alignItems={'center'}>
                                <Stack
                                    sx={{
                                        display: 'flex',
                                        width: '50%',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Stack
                                        onClick={() => formik.setFieldValue('is_addon', !formik.values.is_addon)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingLeft: 0,
                                            marginLeft: 0,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <CustomCheckbox checked={formik.values.is_addon} />
                                        <Typography variant="body1" sx={{ color: '#6F6F6F', mr: 1 }}>
                                            {' '}
                                            {t('Services.AddOn')}
                                        </Typography>
                                        <img src={InfoIcon} alt="" />
                                    </Stack>

                                    {formik.touched.is_addon && formik.errors.is_addon && (
                                        <Typography style={{ color: 'red', fontSize: '12px' }}>
                                            {formik.errors.is_addon}
                                        </Typography>
                                    )}
                                </Stack>

                                {formik?.values?.is_addon && (
                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            width: '50%',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <FSelect
                                            isMultiSelect={true}
                                            value={formik?.values?.main_service_ids || []}
                                            options={filterdService || []}
                                            onChange={(e) => handleAddonService(e)}
                                            selectAllRenderCheckBoxText={t('Services.AllServ')}
                                            selectAllRenderText={t('Services.AllServ')}
                                            placeholderText={t('Services.SelectServ')}
                                            TextToDisplayWithCount={t('Common.Services')}
                                        />

                                        {formik.touched.main_service_ids && formik.errors.main_service_ids && (
                                            <Typography style={{ color: 'red', fontSize: '12px' }}>
                                                {formik.errors.main_service_ids}
                                            </Typography>
                                        )}
                                    </Stack>
                                )}
                            </Stack>

                            <Stack
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    width: '100%',
                                    mt: 2,
                                    pl: 2,
                                }}
                            >
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {t('Services.AddOnLimit')}
                                    <Tooltip title={t('Services.AddOnLimitTooltip')}>
                                        <img src={InfoIcon} alt="" style={{ marginLeft: '5px' }} />
                                    </Tooltip>
                                </Typography>
                                <FTextInput
                                    mt={0}
                                    value={formik?.values?.max_addon || ''}
                                    onChange={(e) => {
                                        formik.setFieldValue('max_addon', e.target.value);
                                    }}
                                    onKeyPress={(e) => {
                                        const regex = /^[0-9]*$/;
                                        if (!regex.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder={t('Services.AddOnLimit')}
                                />
                                {formik.touched.max_addon && formik.errors.max_addon && (
                                    <Typography style={{ color: 'red', fontSize: '12px' }}>
                                        {formik.errors.max_addon}
                                    </Typography>
                                )}
                            </Stack>

                            {formik?.values?.is_addon && (
                                <Stack>
                                    <Stack
                                        onClick={() =>
                                            formik.setFieldValue('can_book_alone', !formik.values.can_book_alone)
                                        }
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginTop: '22px',
                                            paddingLeft: 0,
                                            marginLeft: 0,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <CustomCheckbox checked={formik.values.can_book_alone} />

                                        <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                            {' '}
                                            {t('Services.BookedAlone')}
                                        </Typography>
                                    </Stack>

                                    {formik.touched.can_book_alone && formik.errors.can_book_alone && (
                                        <Typography style={{ color: 'red', fontSize: '12px' }}>
                                            {formik.errors.can_book_alone}
                                        </Typography>
                                    )}
                                </Stack>
                            )}

                            <Stack
                                onClick={() =>
                                    formik.setFieldValue('enable_online_booking', !formik.values.enable_online_booking)
                                }
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: '22px',
                                    paddingLeft: 0,
                                    marginLeft: 0,
                                    cursor: 'pointer',
                                }}
                            >
                                <CustomCheckbox checked={formik.values.enable_online_booking} />

                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Services.CanBeBookedOnine')}
                                </Typography>
                            </Stack>

                            {settings?.from_dashboard && (
                                <Stack
                                    onClick={() =>
                                        formik.setFieldValue(
                                            'require_customer_form',
                                            !formik?.values?.require_customer_form,
                                        )
                                    }
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: '22px',
                                        paddingLeft: 0,
                                        marginLeft: 0,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <CustomCheckbox checked={formik?.values?.require_customer_form} />

                                    <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                        {' '}
                                        {t('Services.ReqCustForm')}
                                    </Typography>
                                </Stack>
                            )}

                            {/* Health Declaration Section */}
                            <React.Fragment>
                                <Stack
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', md: 'row' },
                                        alignItems: 'flex-start',
                                        mt: 2,
                                        gap: 2,
                                    }}
                                >
                                    <CustomCheckbox
                                        label={t('Services.RequiredHealthDeclaration')}
                                        checked={formik?.values?.health_declaration?.is_health_declaration}
                                        onClick={() =>
                                            formik.setFieldValue(
                                                'health_declaration.is_health_declaration',
                                                !formik?.values?.health_declaration?.is_health_declaration,
                                            )
                                        }
                                        sx={{ width: { xs: '100%', md: '50%' }, mt: 2 }}
                                    />

                                    {formik?.values?.health_declaration?.is_health_declaration && (
                                        <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                            <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                                {t('Services.SelectHealthDeclarationTemplate')}
                                            </Typography>
                                            {!loadingHealthDeclarationTemplates &&
                                            healthDeclarationTemplates?.data?.items?.length > 0 ? (
                                                <FSelect
                                                    componentKey={`health-declaration-template-${formik?.values?.health_declaration?.health_declaration_template_id || 'none'}`}
                                                    id="health_declaration_template_id"
                                                    options={
                                                        healthDeclarationTemplates?.data?.items?.map((template) => ({
                                                            value: template.id,
                                                            label: (
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{
                                                                        color: '#6F6F6F',
                                                                        width: '100%',
                                                                        textOverflow: 'ellipsis',
                                                                        overflow: 'hidden',
                                                                        whiteSpace: 'nowrap',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: '2',
                                                                        WebkitBoxOrient: 'vertical',
                                                                    }}
                                                                >
                                                                    {template.name}
                                                                </Typography>
                                                            ),
                                                        })) || []
                                                    }
                                                    placeholderText={
                                                        loadingHealthDeclarationTemplates
                                                            ? t('Common.Loading')
                                                            : t('Services.SelectHealthDeclarationTemplate')
                                                    }
                                                    value={
                                                        loadingHealthDeclarationTemplates
                                                            ? undefined
                                                            : formik?.values?.health_declaration
                                                                  ?.health_declaration_template_id
                                                    }
                                                    onChange={(e) =>
                                                        formik.setFieldValue(
                                                            'health_declaration.health_declaration_template_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <Stack
                                                    sx={{
                                                        color: '#6F6F6F',
                                                        width: '100%',
                                                        p: 1,
                                                        border: '1px solid #E0E0E0',
                                                        borderRadius: '12px',
                                                    }}
                                                >
                                                    {loadingHealthDeclarationTemplates ? (
                                                        <Stack
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <CircularProgress size={20} />
                                                            <Typography variant="body1">
                                                                {t('Common.Loading')}
                                                            </Typography>
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="body1">
                                                            {' '}
                                                            {t('Services.NoTemplatesFound')}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            )}
                                            {formik.touched.health_declaration?.health_declaration_template_id &&
                                                formik.errors.health_declaration?.health_declaration_template_id && (
                                                    <Typography style={{ color: 'red', fontSize: '12px' }}>
                                                        {
                                                            formik.errors.health_declaration
                                                                ?.health_declaration_template_id
                                                        }
                                                    </Typography>
                                                )}
                                        </Stack>
                                    )}
                                </Stack>

                                {formik?.values?.health_declaration?.is_health_declaration && (
                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', md: 'row' },
                                            alignItems: 'flex-start',
                                            mt: 2,
                                            gap: 2,
                                        }}
                                    >
                                        <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                            <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                                {t('Setting.InitialEmailBeforeHours')}
                                            </Typography>
                                            <FSelect
                                                options={[
                                                    {
                                                        label: t('Services.SameAsSettings', {
                                                            hours: settings?.OnlineBooking?.health_declaration
                                                                ?.email_settings?.initial_email_before_hours,
                                                        }),
                                                        value: 'SAME_AS_SETTINGS',
                                                    },
                                                    { label: `1 ${t('Statistics.Hour')}`, value: 1 },
                                                    { label: `2 ${t('Statistics.Hours')}`, value: 2 },
                                                    { label: `6 ${t('Statistics.Hours')}`, value: 6 },
                                                    { label: `12 ${t('Statistics.Hours')}`, value: 12 },
                                                    { label: `24 ${t('Statistics.Hours')}`, value: 24 },
                                                    { label: `48 ${t('Statistics.Hours')}`, value: 48 },
                                                    { label: `72 ${t('Statistics.Hours')}`, value: 72 },
                                                ]}
                                                placeholderText={t('Services.SameAsSettings', {
                                                    hours: settings?.OnlineBooking?.health_declaration?.email_settings
                                                        ?.initial_email_before_hours,
                                                })}
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
                                            />
                                        </Stack>

                                        <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                            <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                                {t('Setting.ReminderEmailBeforeHours')}
                                            </Typography>
                                            <FSelect
                                                options={[
                                                    {
                                                        label: t('Services.SameAsSettings', {
                                                            hours: settings?.OnlineBooking?.health_declaration
                                                                ?.email_settings?.reminder_email_before_hours,
                                                        }),
                                                        value: 'SAME_AS_SETTINGS',
                                                    },
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
                                                placeholderText={t('Services.SameAsSettings', {
                                                    hours: settings?.OnlineBooking?.health_declaration?.email_settings
                                                        ?.reminder_email_before_hours,
                                                })}
                                            />
                                        </Stack>
                                    </Stack>
                                )}
                            </React.Fragment>
                        </Grid2>

                        {(user?.settings.crud_services || user?.role === 'ADMIN') && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'flex-end',
                                    width: '100%',
                                    flexDirection: 'column',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={formik.handleSubmit}
                                    disabled={isLoading || (showCetification && !formik.values.is_certified)}
                                    style={{
                                        backgroundColor:
                                            showCetification && !formik.values.is_certified ? '#D9D9D9' : '#44B904',
                                        color: 'white',
                                        border: 0,
                                        borderRadius: '12px',
                                        width: '50%',
                                        height: '40px',
                                        fontSize: '16px',
                                        fontWeight: 400,
                                        position: 'relative',
                                    }}
                                >
                                    {isLoading ? (
                                        <CircularProgress
                                            size={24}
                                            sx={{
                                                color: 'white',
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                marginTop: '-12px',
                                                marginLeft: '-12px',
                                                zIndex: 1,
                                            }}
                                        />
                                    ) : (
                                        <span style={{ zIndex: 2 }}>
                                            {showCetification && !formik.values.is_certified
                                                ? t('Services.SrvGovErr')
                                                : type === 'create'
                                                  ? t('Services.CreateSrv')
                                                  : t('Services.UpdateSrv')}
                                        </span>
                                    )}
                                </button>
                            </Box>
                        )}
                    </Grid2>
                )}
                {showEmployeeList && (
                    <Modal
                        open={showEmployeeList}
                        disableAutoFocus
                        // onClose={() => setShowEmployeeList(false)}
                        onClose={() => {}}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box
                            sx={[
                                style,
                                {
                                    zIndex: 12,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflowY: { xs: 'auto', sm: '85vh' },
                                    overflowX: 'hidden',
                                    maxHeight: { xs: '90vh', sm: '85vh' },
                                    position: 'relative',
                                    padding: 4,
                                    maxWidth: '60vh',
                                    borderRadius: '25px',
                                },
                            ]}
                        >
                            <Box
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                }}
                            >
                                <IconButton
                                    edge="end"
                                    color="inherit"
                                    onClick={() => setShowEmployeeList(false)}
                                    aria-label="close"
                                    sx={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '30px',
                                        zIndex: 10,
                                        color: 'black',
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* <PrimaryHeading fontColor='##1f1f1f' text={'Employee list'}  sx={{textAlign:'center', }}/> */}
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: '#1f1f1f',
                                    textAlign: 'center',
                                }}
                            >
                                {t('Services.EmpList')}
                            </Typography>

                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowY: 'auto',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: '500px',
                                    marginTop: '10px',
                                    borderRadius: '12px',
                                    border: '1px solid #A79C92',
                                }}
                            >
                                {/* <CustomSearchBar
                                    width={'98%'}
                                    value={employeeSearch}
                                    onChange={(e) => updateEmployeeSearch(e.target.value)}
                                /> */}

                                <List style={{ width: '100%', paddingTop: 0, paddingBottom: 0 }}>
                                    {filterList.map((employee) => (
                                        <Stack
                                            key={employee.id}
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => addEmployee(employee)}
                                        >
                                            {/* <React.Fragment key={employee.id}> */}
                                            <ListItem
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <ListItemText>
                                                    <Typography
                                                        variant="body1"
                                                        sx={{ color: '#545454', fontWeight: 400 }}
                                                    >
                                                        {employee.name}
                                                    </Typography>
                                                </ListItemText>

                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            disableRipple
                                                            checked={formik.values.selectedEmplpoyeeList.some(
                                                                (el) => el.id === employee.id,
                                                            )}
                                                            onChange={() => addEmployee(employee)}
                                                            sx={{
                                                                // '& .MuiSvgIcon-root': {
                                                                //     border: '0.1px solid #A79C92',
                                                                //     borderRadius: '4px',
                                                                // },
                                                                '&.Mui-checked .MuiSvgIcon-root': {
                                                                    backgroundColor: 'transparent',
                                                                    borderColor: '#A79C92',
                                                                    color: 'green',
                                                                },
                                                                // '&:hover': {
                                                                //     backgroundColor: 'transparent',
                                                                // },
                                                            }}
                                                        />
                                                    }
                                                    label=""
                                                />
                                            </ListItem>
                                            <Divider
                                                sx={{
                                                    borderColor: '#A79C92',
                                                    margin: '3px 0',
                                                    borderBottomWidth: 1,
                                                    marginLeft: 2,
                                                    marginRight: 2,
                                                }}
                                            />
                                            {/* </React.Fragment> */}
                                        </Stack>
                                    ))}
                                </List>
                            </Box>
                        </Box>
                    </Modal>
                )}
            </Paper>
        </Modal>
    );
}

export default ServiceModal;
