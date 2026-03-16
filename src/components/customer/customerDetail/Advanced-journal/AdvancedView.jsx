import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    CircularProgress,
    Divider,
    Stack,
    Typography,
    Tab,
    Tabs,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import moment from 'moment';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import '../../../../cssQuill.css';
import FButton from '../../../commonComponents/F_Button';
import { Add, ExpandMore, MoreVert } from '@mui/icons-material';
import FCommonTable from '../../../commonComponents/F_commonTable';
import DynamicDate from './dynamicFields/DynamicDate';
import DynamicUpload from './dynamicFields/DynamicUpload';
import DynamicCpr from './dynamicFields/DynamicCpr';
import DynamicEditor from './dynamicFields/DynamicEditor';
import DynamicTabs from './dynamicFields/DynamicTabs';
import DynamicCheckBox from './dynamicFields/DynamicCheckBox';
import DynamicSelect from './dynamicFields/DynamicSelect';
import DynamicTextinput from './dynamicFields/DynamicTextinput';
import DynamicTextarea from './dynamicFields/DynamicTextarea';
import DynamicSignature from './dynamicFields/DynamicSignature';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import DynamicRadio from './dynamicFields/DynamicRadio';
import apiFetcher from '../../../../utils/interCeptor';
import { HttpStatusCode } from 'axios';
import CompairImage from './CompairImage';
import { t } from 'i18next';
import SaveModal from './popup/SaveModal';
import { useSelector } from 'react-redux';
import { useBlocker, useNavigate } from 'react-router-dom';
import { route } from '../../../../context/routeSlice';
import { useDispatch } from 'react-redux';
import DynamicImage from './dynamicFields/DynamicImage';
import DynamicTitle from './dynamicFields/DynamicTitle';
import DynamicBookingSummary from './dynamicFields/DynamicBookingSummary';
import FTextInput from '../../../commonComponents/F_TextInput';
import { v4 as uuidv4 } from 'uuid';

export default function AdvancedJournalView({
    setShow,
    templates,
    setup,
    selectedAdvancedJournalId,
    customer,
    recallApi,
}) {
    const [activeTab, setActiveTab] = useState();
    const [formattedData, setFormattedData] = useState([]);
    const [initialValues, setInitialValues] = useState({});
    const [currentTabFields, setCurrentTabFields] = useState([]);
    const [remainingFields, setRemainingFields] = useState([]);
    const [validationSchema, setValidationSchema] = useState(null);
    const [allImagesForCompair, setAllImagesForCompair] = useState([]);
    const [logs, setLogs] = useState([]);
    const [selectedAdvancedJournal, setSelectedAdvancedJournal] = useState({});
    const [loading, setLoading] = useState({});
    const [btnType, setBtnType] = useState('save');
    const [saveConfirm, setSaveConfirm] = useState(false);
    const [confirmCompleted, setConfirmCompleted] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [compairModal, setCompairModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [propsForCompair, setPropsForCompair] = useState(null);
    const [confirmQuit, setConfirmQuit] = useState({
        modal: false,
        prop: null,
    });
    const user = useSelector((state) => state.user.data);
    const dispatch = useDispatch();
    const selectedRoute = useSelector((state) => state.route.route);
    const pathname = new URL(window.location.href).pathname;
    const navigate = useNavigate();
    const [isBlocking, setIsBlocking] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [title, setTitle] = useState('');
    const [activeRepeatableTab, setActiveRepeatableTab] = useState(null);
    const [deleteTabModal, setDeleteTabModal] = useState({ open: false, tabId: null, tab_name: null });
    const [tabMenuAnchor, setTabMenuAnchor] = useState({ element: null, tabId: null, index: null });
    const [editTabModal, setEditTabModal] = useState({ open: false, tabId: null, tab_name: '' });

    const fetchFixedData = useCallback(async (shouldChangeTab = true) => {
        setLoading(true);
        try {
            const response = await apiFetcher.get(
                `api/v1/store/advance_journal/${selectedAdvancedJournalId?.id}?employee_id=${user?.id}`,
            );
            if (response.status === HttpStatusCode.Ok) {
                let advancedJournal = response?.data?.data?.advance_journal;
                setPropsForCompair({
                    date: advancedJournal?.created_at,
                    employee_name: advancedJournal?.employee_name,
                });
                if (advancedJournal?.data === null) {
                    const formatResponse = await setup.find(
                        (temp) => temp.id === selectedAdvancedJournalId.template_id,
                    );
                    if (formatResponse) {
                        setIsCreating(true);
                        advancedJournal.data = formatResponse;
                        // in the advancedjournal.format.taboptions[0].details[0].fields.map((field) => field.type = 'editor' ? field.value = templates.find((temp) => temp.id === selectedAdvancedJournalId.template_id).detail : null);
                        let newEditorFilled = {
                            ...advancedJournal,
                            data: {
                                ...advancedJournal.data,
                                format: {
                                    ...advancedJournal.data.format,
                                    tabsOptions: advancedJournal.data.format.tabsOptions.map((tabOption, index) => {
                                        return {
                                            ...tabOption,
                                            details: tabOption.details.map((detail, detailIndex) => {
                                                return {
                                                    ...detail,
                                                    fields: detail.fields.map((field) => {
                                                        if (
                                                            field.type === 'editor' &&
                                                            field?.autofill_template_on_load
                                                        ) {
                                                            const template = templates.find(
                                                                (temp) =>
                                                                    temp.id ==
                                                                    (field?.attached_templates &&
                                                                        field?.attached_templates[0]),
                                                            );
                                                            field.value = template?.detail || null;
                                                        }
                                                        return field;
                                                    }),
                                                };
                                            }),
                                        };
                                    }),
                                },
                            },
                        };

                        setSelectedAdvancedJournal(newEditorFilled || advancedJournal);
                        setLogs(response?.data?.data?.log);
                        setBookings(response?.data?.data?.customer_bookings);
                    }
                } else {
                    setSelectedAdvancedJournal(advancedJournal);
                    setLogs(response?.data?.data?.log);
                    setBookings(response?.data?.data?.customer_bookings);
                }

                if (advancedJournal?.data?.format?.tabsOptions?.length > 0) {
                    if (shouldChangeTab) {
                        setActiveTab(advancedJournal?.data?.format?.tabsOptions[0]?.tab_id);
                        handleCurrentChange(null, advancedJournal?.data?.format?.tabsOptions[0]?.tab_id);
                    } else if (activeTab) {
                        handleCurrentChange(null, activeTab);
                    }
                }
            }
        } catch (error) {
            toast.error(t('Customer.ADVDefaultError'));
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchFixedData();
        setTitle(selectedAdvancedJournalId?.title);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (activeTab) {
            handleCurrentChange(null, activeTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleCurrentChange = async (currentId, tabId, version = null) => {
        if (tabId) {
            const selectedTab = selectedAdvancedJournal?.data?.format?.tabsOptions.find((tab) => tab.tab_id === tabId);

            if (!selectedTab || !selectedTab.details?.length) {
                console.error('Tab details not found!');
                setCurrentTabFields([]);
                setFormattedData({});
                return;
            }

            let currentDetail;
            if (version) {
                currentDetail = version; // Load the selected version instead of the latest detail
                if (version?.version_title) {
                    setTitle(version?.version_title);
                }
            } else {
                currentDetail = currentId
                    ? selectedTab.details.find((detail) => detail.detail_id === currentId)
                    : selectedTab.details[0]; // Default to first detail
            }

            if (!currentDetail) {
                console.error('Current detail not found!');
                return;
            }

            // Determine tabs source: use version.tabs if version exists, otherwise use current detail's tabs
            const tabsSource = version?.tabs ? version.tabs : selectedTab?.details?.[0]?.tabs || currentDetail.fields;

            // Update formattedData with version's tabs when viewing a version
            const formattedDataToSet =
                version?.tabs?.length > 0 && selectedTab.is_repeatable
                    ? {
                        ...selectedTab,
                        details: [
                            {
                                ...selectedTab.details[0],
                                tabs: version.tabs,
                            },
                        ],
                    }
                    : selectedTab;
            setFormattedData(formattedDataToSet);

            // Initialize activeRepeatableTabTemp based on tabsSource
            let activeRepeatableTabTemp = null;
            if (selectedTab.is_repeatable) {
                if (version?.tabs?.length > 0) {
                    // For versions, use the version's tabs directly
                    const firstTabId = version.tabs[0].tab_id;
                    setActiveRepeatableTab(firstTabId);
                    activeRepeatableTabTemp = firstTabId;
                } else if (selectedTab.details?.[0] && !selectedTab.details[0].tabs) {
                    // Initialize tabs in details[0] if tabs don't exist (only for current, not versions)
                    const firstDetail = selectedTab.details[0];
                    const tabId = firstDetail.tab_id || uuidv4();
                    const newTab = {
                        tab_id: tabId,
                        tab_name: 'Behandlingsforløb',
                        fields: firstDetail.fields || [],
                        create_timestamp: moment().format('YYYY-MM-DDTHH:mm:ss'),
                        save_timestamp: moment().format('YYYY-MM-DDTHH:mm:ss'),
                    };
                    firstDetail.tabs = [newTab];
                    setActiveRepeatableTab(tabId);
                    activeRepeatableTabTemp = tabId;
                } else if (selectedTab.details?.[0]?.tabs?.length > 0) {
                    // Set active tab to first tab if not set
                    const tabs = selectedTab.details[0].tabs;
                    const firstTabId = tabs[0].tab_id;
                    if (!activeRepeatableTabTemp || !tabs.some((tab) => tab.tab_id === activeRepeatableTabTemp)) {
                        setActiveRepeatableTab(firstTabId);
                        activeRepeatableTabTemp = firstTabId;
                    }
                }
            }

            const filteredVersions = selectedTab.earlier_version?.length
                ? selectedTab.earlier_version.sort((a, b) => b.version_id - a.version_id)
                : [];

            let fieldsToUse = currentDetail.fields;
            if (selectedTab?.is_repeatable && tabsSource && activeRepeatableTabTemp) {
                const activeTabData = tabsSource.find((tab) => tab.tab_id === activeRepeatableTabTemp);
                if (activeTabData) {
                    fieldsToUse = activeTabData.fields;
                }
            }

            const { schemaObject, initialValues } = createValidationSchema(fieldsToUse);

            let disableField = selectedAdvancedJournalId.completed ? true : false;
            const images = fieldsToUse?.filter((field) => field.type === 'upload')?.flatMap((field) => field.value);

            // For repeatable tabs, create a detail object with fields from active tab
            let detailToSet = currentDetail;
            if (selectedTab.is_repeatable && tabsSource && activeRepeatableTabTemp) {
                const activeTabData = tabsSource.find((tab) => tab.tab_id === activeRepeatableTabTemp);
                if (activeTabData) {
                    detailToSet = {
                        ...currentDetail,
                        fields: activeTabData.fields,
                    };
                }
            }

            setCurrentTabFields([detailToSet]); // Set the selected version's fields
            setRemainingFields(filteredVersions);
            setInitialValues({ ...initialValues, disabled: disableField });
            setValidationSchema(schemaObject);
            setAllImagesForCompair(images);
        }
    };

    const createValidationSchema = (fields = []) => {
        const schemaObject = {};
        const initialValues = {};

        fields.forEach((field, i) => {
            let validation;

            // Initialize initial values for each field
            // if (field.type === 'editor') {
            //     // For editor, you need both value and name in initialValues
            //     initialValues[`${field.type}-${field?.field_id}-value`] = field?.value;
            //     initialValues[`${field.type}-${field?.field_id}-journal_title`] = field?.journal_title;
            // } else
            if (field.type === 'select') {
                initialValues[`${field.type}-${field?.field_id}-value`] = field?.value;
                initialValues[`${field.type}-${field?.field_id}-value_other`] = field?.value_other;
            } else if (field.type === 'autoFill_name' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.name; // Use ?? for nullish coalescing
            } else if (field.type === 'autoFill_email' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.email;
            } else if (field.type === 'autoFill_phone' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.phone_number;
            } else if (field.type === 'autoFill_birthday' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.birthday;
            } else if (field.type === 'autoFill_address' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.address;
            } else if (field.type === 'autoFill_cpr' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.cpr;
            } else if (field.type === 'autoFill_zip' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.zip_code;
            } else if (field.type === 'autoFill_city' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.city;
            } else if (field.type === 'autoFill_phone_alt' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.phone_number2;
            } else if (field.type === 'autoFill_notes' && field?.autofill) {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? customer?.marketplace_pointer;
            } else {
                initialValues[`${field.type}-${field?.field_id}`] = field?.value ?? ''; // Default empty string if value is null or undefined
            }

            // Now handle the validation schema based on the field type
            if (field.type === 'date') {
                validation = field.required
                    ? Yup.date()
                        .required(`${field.name} ${t('Customer.IsRequired')}`)
                        .typeError(`${field.name} ${t('Customer.IsRequired')}`)
                    : Yup.date();
            } else if (field.type === 'cpr' || field.type === 'autoFill_cpr') {
                validation = field.required
                    ? Yup.string()
                        .required(`${field.name} ${t('Customer.IsRequired')}`)
                        .typeError(`${field.name} ${t('Customer.IsRequired')}`)
                        .min(11, t('Customer.CprError'))
                        .max(11, t('Customer.CprError'))
                    : Yup.string()
                        .nullable()
                        .optional()
                        .min(11, t('Customer.CprError'))
                        .max(11, t('Customer.CprError'))
                        .typeError(t('Customer.CprError'));
            } else if (field.type === 'upload') {
                validation = field.required
                    ? Yup.array()
                        .min(1, `At least one image ${t('Customer.IsRequired')}`)
                        .typeError(`At least one image ${t('Customer.IsRequired')}`)
                    : Yup.array();
            } else if (field.type === 'radio') {
                validation = field.required
                    ? Yup.string()
                        .required(`${field.name} ${t('Customer.IsRequired')}`)
                        .typeError(`${field.name} ${t('Customer.IsRequired')}`)
                    : Yup.string().nullable();
            } else if (field.type === 'signature') {
                validation = field?.required
                    ? Yup.object()
                        .required(`${field.name} ${t('Customer.IsRequired')}`)
                        .test(
                            'required',
                            `${field.name} ${t('Customer.IsRequired')}`,
                            (value) => value && Object.keys(value).length > 0,
                        )
                    : Yup.object().nullable();
            } else if (field.type === 'checkbox') {
                validation = field?.required
                    ? Yup.array()
                        .required(`${field.name} ${t('Customer.IsRequired')}`)
                        .test(
                            'required',
                            `${field.name} ${t('Customer.IsRequired')}`,
                            (value) => value && value.length > 0,
                        )
                    : Yup.array().nullable();
            } else if (field.type === 'autoFill_phone' || field.type === 'autoFill_phone_alt') {
                validation = field?.required
                    ? Yup.string()
                        .required(`${field.name} ${t('Customer.IsRequired')}`)
                        //   .min(8, t('Customer.PhoneNumberInvalid'))
                        //   .max(8, t('Customer.PhoneNumberInvalid'))
                        .typeError(`${field.name} ${t('Customer.IsRequired')}`)
                    : Yup.string()
                        //   .min(8, t('Customer.PhoneNumberInvalid'))
                        //   .max(8, t('Customer.PhoneNumberInvalid'))
                        .nullable();
            } else if (field.type === 'autoFill_zip') {
                validation = field?.required
                    ? Yup.number()
                        .required(`${field.name} ${t('Customer.IsRequired')}`)
                        .typeError(`${field.name} ${t('Customer.IsRequired')}`)
                    : Yup.number().nullable();
            } else if (field.type === 'autoFill_email') {
                validation = field?.required
                    ? Yup.string()
                        .email(`${field.name} ${t('Setting.InvalidEmailFormat')}`)
                        .required(`${field.name} ${t('Customer.IsRequired')}`)
                    : Yup.string()
                        .email(t(`${field.name} ${t('Setting.InvalidEmailFormat')}`))
                        .nullable();
            } else if (
                field.type === 'select-value_other' ||
                field.type === 'select-value' ||
                field.type === 'select'
            ) {
                validation = field?.required
                    ? Yup.string()
                        .required(`${field.name} ${t('Customer.IsRequired')}`)
                        .typeError(`${field.name} ${t('Customer.IsRequired')}`)
                    : Yup.string().nullable().optional().typeError('');
            } else {
                validation =
                    (field?.type !== 'editor' || field?.type !== 'select') && field?.required
                        ? Yup.string()
                            .required(`${field.name} ${t('Customer.IsRequired')}`)
                            .typeError(`${field.name} ${t('Customer.IsRequired')}`)
                        : Yup.string().nullable();
            }

            // Add the validation schema to schemaObject
            if (field.type === 'select') {
                // Create separate validation rules for select sub-fields
                schemaObject[`${field.type}-${field?.field_id}-value`] = validation;
                schemaObject[`${field.type}-${field?.field_id}-value_other`] = Yup.string().nullable(); // Usually optional
            } else {
                schemaObject[`${field.type}-${field?.field_id}`] = validation;
            }
        });

        return { schemaObject, initialValues };
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: Yup.object(validationSchema),
        onSubmit: (values) => {
            let { disabled, ...nonDisabled } = values;

            let newVal = {
                ...Object.entries(nonDisabled).reduce((acc, [key, value]) => {
                    const parts = key.split('-');

                    // if (parts[0] === 'editor') {
                    //     const editorKey = parts[2];

                    //     if (editorKey === 'journal_title' || editorKey === 'value') {
                    //         acc['editor'] = acc['editor'] || {};
                    //         acc['editor'][editorKey] = value;
                    //     }
                    // } else
                    if (parts[0] === 'select') {
                        const selectKey = parts[2];

                        if (selectKey === 'value' || selectKey === 'value_other') {
                            const fieldId = parts[1];
                            acc[`select-${fieldId}`] = acc[`select-${fieldId}`] || {};
                            acc[`select-${fieldId}`][selectKey] = value;
                        }
                    } else {
                        const newKey = parts[1];
                        acc[newKey] = value;
                    }
                    return acc;
                }, {}),
            };

            const updateDetailUtil = ({ detail, newVal, isVersion = false }) => {
                // Update the first detail (current detail)
                if (detail.detail_id === formattedData.details[0]?.detail_id) {
                    const { save, posted, ...rest } = detail;

                    const updateFields = (fields) => {
                        return fields.map((field) => {
                            // Check if field_id exists in newVal (even if value is null)
                            if (field.field_id in newVal) {
                                return {
                                    ...field,
                                    value: newVal[field.field_id],
                                };
                            }
                            if (field.type === 'select' && `select-${field.field_id}` in newVal) {
                                return {
                                    ...field,
                                    value: newVal[`select-${field.field_id}`]?.value ?? field.value,
                                    value_other: newVal[`select-${field.field_id}`]?.value_other ?? field.value_other,
                                };
                            }
                            return field;
                        });
                    };

                    // If repeatable and has tabs, update the active tab's fields
                    if (formattedData.is_repeatable && detail.tabs && activeRepeatableTab) {
                        return {
                            ...rest,
                            tabs: detail.tabs.map((tab) => {
                                if (tab.tab_id === activeRepeatableTab) {
                                    return {
                                        ...tab,
                                        fields: updateFields(tab.fields),
                                        save_timestamp: moment().format('YYYY-MM-DDTHH:mm:ss'),
                                    };
                                }
                                return tab;
                            }),
                            fields: updateFields(detail.fields), // Keep fields for backward compatibility
                            version_id: isVersion ? moment().valueOf() : undefined,
                            version_date: isVersion ? moment().format('YYYY-MM-DDTHH:mm:ss') : undefined,
                            version_title: title,
                        };
                    }

                    return {
                        ...rest,
                        fields: updateFields(detail.fields),
                        version_id: isVersion ? moment().valueOf() : undefined,
                        version_date: isVersion ? moment().format('YYYY-MM-DDTHH:mm:ss') : undefined,
                        version_title: title,
                    };
                }
                return detail;
            };

            const newFormattedData = {
                ...formattedData,
                earlier_version: formattedData.earlier_version
                    ? [
                        ...formattedData.earlier_version.map((version) => ({
                            ...version,
                        })),
                        ...formattedData.details.map((detail) =>
                            updateDetailUtil({ detail, newVal, isVersion: true }),
                        ),
                    ]
                    : formattedData.details.map((detail) => updateDetailUtil({ detail, newVal, isVersion: true })),
                details: formattedData.details.map((detail) => updateDetailUtil({ detail, newVal, isVersion: false })),
            };

            setFormattedData(newFormattedData);
            handleSaveOrPosted(newFormattedData);
        },
    });

    const handleSaveOrPosted = useCallback(
        async (data, isAutoSave = false, toastId = null) => {
            const newSelectedAdvancedJournal = {
                id: selectedAdvancedJournal.id,
                employee_id: selectedAdvancedJournal.employee_id,
                completed: btnType === 'save' ? false : true,
                data: {
                    ...selectedAdvancedJournal.data,
                    format: {
                        ...selectedAdvancedJournal.data.format,
                        tabsOptions: selectedAdvancedJournal.data.format.tabsOptions.map((tab) => {
                            if (tab.tab_id === data.tab_id) {
                                return {
                                    ...data,
                                };
                            }
                            return tab;
                        }),
                    },
                },
            };

            let StringiFiedData = {
                ...newSelectedAdvancedJournal,
                data: JSON.stringify(newSelectedAdvancedJournal?.data),
                title: title,
            };

            if (newSelectedAdvancedJournal) {
                await apiFetcher
                    .patch(`/api/v1/store/advance_journal`, StringiFiedData)
                    .then((response) => {
                        if (isAutoSave) {
                            if (toastId) {
                                toast.update(toastId, {
                                    render: t('Customer.ADVSaveSuccess'),
                                    type: 'success',
                                    isLoading: false,
                                    autoClose: 2000,
                                });
                            }
                            recallApi(customer?.id);
                            return;
                        }

                        if (response.status === HttpStatusCode.Ok) {
                            toast.success(
                                btnType === 'save' ? t('Customer.ADVSaveSuccess') : t('Customer.ADVCompleteSuccess'),
                            );
                            const timeout = setTimeout(() => {
                                recallApi(customer?.id);
                                setShow('Table');
                            }, 1000);
                            return () => clearTimeout(timeout);
                        }
                    })
                    .catch((error) => {
                        if (isAutoSave && toastId) {
                            toast.update(toastId, {
                                render: t('Customer.ADVChangeError'),
                                type: 'error',
                                isLoading: false,
                                autoClose: 3000,
                            });
                        } else {
                            toast.error(t('Customer.ADVChangeError'));
                        }
                    });
            }

            // if(newSelectedAdvancedJournal){
            //     formik.handleSubmit()
            // }
        },

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedAdvancedJournal, btnType, customer?.id, toast, recallApi],
    );

    const autoSave = useCallback(
        (fieldUpdates = {}, toastId = null) => {
            if (!formattedData?.tab_id || !selectedAdvancedJournal?.id) {
                return;
            }

            // Show loading toast for auto-save immediately when function is called
            // This ensures the toast appears even if autoSave is called with a delay
            const loadingToastId = toastId || toast.loading(t('Customer.Saving'));

            // Read the latest formik values directly at execution time
            const currentValues = formik.values;

            // Merge field updates into current values
            const mergedValues = { ...currentValues, ...fieldUpdates };
            let { disabled, ...nonDisabled } = mergedValues;

            let newVal = {
                ...Object.entries(nonDisabled).reduce((acc, [key, value]) => {
                    const parts = key.split('-');

                    if (parts[0] === 'select') {
                        const selectKey = parts[2];

                        if (selectKey === 'value' || selectKey === 'value_other') {
                            const fieldId = parts[1];
                            acc[`select-${fieldId}`] = acc[`select-${fieldId}`] || {};
                            acc[`select-${fieldId}`][selectKey] = value;
                        }
                    } else {
                        const newKey = parts[1];
                        acc[newKey] = value;
                    }
                    return acc;
                }, {}),
            };

            const updateDetailUtil = ({ detail, newVal }) => {
                // Update the first detail (current detail)
                if (detail.detail_id === formattedData.details[0]?.detail_id) {
                    const { save, posted, ...rest } = detail;

                    const updateFields = (fields) => {
                        return fields.map((field) => {
                            // Check if field_id exists in newVal (even if value is null)
                            if (field.field_id in newVal) {
                                return {
                                    ...field,
                                    value: newVal[field.field_id],
                                };
                            }
                            if (field.type === 'select' && `select-${field.field_id}` in newVal) {
                                return {
                                    ...field,
                                    value: newVal[`select-${field.field_id}`]?.value ?? field.value,
                                    value_other: newVal[`select-${field.field_id}`]?.value_other ?? field.value_other,
                                };
                            }
                            return field;
                        });
                    };

                    // If repeatable and has tabs, update the active tab's fields
                    if (formattedData.is_repeatable && detail.tabs && activeRepeatableTab) {
                        return {
                            ...rest,
                            tabs: detail.tabs.map((tab) => {
                                if (tab.tab_id === activeRepeatableTab) {
                                    return {
                                        ...tab,
                                        fields: updateFields(tab.fields),
                                        save_timestamp: moment().format('YYYY-MM-DDTHH:mm:ss'),
                                    };
                                }
                                return tab;
                            }),
                            fields: updateFields(detail.fields), // Keep fields for backward compatibility
                        };
                    }

                    return {
                        ...rest,
                        fields: updateFields(detail.fields),
                    };
                }
                return detail;
            };

            const newFormattedData = {
                ...formattedData,
                details: formattedData.details.map((detail) => updateDetailUtil({ detail, newVal })),
            };

            handleSaveOrPosted(newFormattedData, true, loadingToastId);
            formik.setErrors({});
        },
        [formik, formattedData, selectedAdvancedJournal, handleSaveOrPosted, activeRepeatableTab],
    );

    useEffect(() => {
        formik.setValues(initialValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues]);

    const logColumns = [
        { id: 'id', label: t('Common.ID'), sortable: false },
        { id: 'incident', label: t('Customer.Incedent'), sortable: false },
        { id: 'date', label: t('Common.Date'), sortable: true },
        { id: 'employees', label: t('Setting.Employees'), sortable: false },
        { id: 'ip', label: t('Customer.IP'), sortable: false },
    ];
    const logObj = {
        OPENED: 'Åbnet',
        EDITED: 'Redigeret',
        CREATED: 'Oprettet',
    };
    let lang = localStorage.getItem('language');

    const dataForLogs =
        logs &&
        logs?.map((log) => ({
            id: log.id,
            incident: lang == 'en' ? log.event : logObj[log.event],
            // 2025-02-13T10:56:40.223348Z
            date: moment(log.denmark_created_at, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM-YY HH:mm'),
            employees: log.employee_name,
            ip: log.ip_address,
        }));

    const handlePrint = async (id) => {
        try {
            setDownloading(true);
            const response = await apiFetcher.get(`api/v1/store/advance_journal/pdf/${id}`, { responseType: 'blob' });
            if (response.status === HttpStatusCode.Ok) {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `journal-${customer?.name}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            toast.error(t('Customer.PDFError'));
        } finally {
            setDownloading(false);
        }
    };

    const handleTouched = () => {
        Object.keys(formik.values).forEach((key) => {
            formik.setFieldTouched(key, true);
        });
    };

    const handleBeforeUnload = (event) => {
        if (formik.dirty) {
            // window.onbeforeunload = function () {
            //     return;
            // };
            // setConfirmQuit((prev) => ({ modal: true, prop: activeTab }));
            event.preventDefault();
            event.returnValue = ''; // Required for Chrome
        }
    };

    const blocker = useBlocker(() => {
        return isBlocking;
    });

    useEffect(() => {
        if (formik && formik.dirty) {
            window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });
            setIsBlocking(formik.dirty);
        } else {
            window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
            setIsBlocking(false);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik]);

    const handleTabChange = (tab) => {
        if (formik?.dirty) {
            setConfirmQuit((prev) => ({ modal: true, prop: tab }));
        } else {
            setActiveTab(tab);
        }
    };

    const handleAddRepeatableTab = () => {
        if (!formattedData?.is_repeatable || !formattedData?.details?.[0]) return;

        const firstDetail = formattedData.details[0];
        let existingTabs = firstDetail.tabs || [];

        if (!activeRepeatableTab || !formik) return;

        const tabIndex = existingTabs.findIndex(t => t.tab_id === activeRepeatableTab);
        if (tabIndex === -1) return;

        // 1. Normalize formik values (exclude disabled)
        const { disabled, ...values } = formik.values;

        const normalizedValues = Object.entries(values).reduce((acc, [key, value]) => {
            const parts = key.split('-');

            if (parts[0] === 'select') {
                const fieldId = parts[1];
                const subKey = parts[2];

                acc[`select-${fieldId}`] ??= { value: '', value_other: null };

                if (subKey === 'value') acc[`select-${fieldId}`].value = value;
                if (subKey === 'value_other') acc[`select-${fieldId}`].value_other = value;

                return acc;
            }

            acc[parts[1]] = value;
            return acc;
        }, {});


        // 2. Update fields for active tab
        const updatedFields = existingTabs[tabIndex].fields.map(field => {
            if (field.type === 'title' || field.type === 'image') return field;

            if (field.type === 'select') {
                const selectValues = normalizedValues[`select-${field.field_id}`];
                if (!selectValues) return field;

                return {
                    ...field,
                    value: String(selectValues.value ?? ''),
                    value_other: selectValues.value_other ?? null,
                };
            }

            return field.field_id in normalizedValues
                ? { ...field, value: normalizedValues[field.field_id] }
                : field;
        });

        // 3. Persist back to tabs
        existingTabs = existingTabs.map((tab, i) =>
            i === tabIndex ? { ...tab, fields: updatedFields } : tab
        );


        const newTabId = uuidv4();
        const newTab = {
            tab_id: newTabId,
            tab_name: `Behandlingsforløb ${existingTabs.length + 1}`,
            fields:
                firstDetail.fields?.map((field) => ({
                    ...field,
                    value:
                        field.type === 'title' || field.type === 'image'
                            ? field.value // Preserve title and image values
                            : field.type === 'upload'
                                ? [] // Preserve upload values
                                : field.type === 'checkbox'
                                    ? [] // Preserve checkbox values
                                    : field.type === 'select'
                                        ? { value: '', value_other: '' }
                                        : '', // Preserve select values
                })) || [],
            create_timestamp: moment().format('YYYY-MM-DDTHH:mm:ss'),
            save_timestamp: moment().format('YYYY-MM-DDTHH:mm:ss'),
        };

        const updatedFormattedData = {
            ...formattedData,
            details: formattedData.details.map((detail, index) => {
                if (index === 0) {
                    return {
                        ...detail,
                        tabs: [...existingTabs, newTab],
                    };
                }
                return detail;
            }),
        };

        // Update selectedAdvancedJournal so the changes persist
        const updatedSelectedAdvancedJournal = {
            ...selectedAdvancedJournal,
            data: {
                ...selectedAdvancedJournal.data,
                format: {
                    ...selectedAdvancedJournal.data.format,
                    tabsOptions: selectedAdvancedJournal.data.format.tabsOptions.map((tab) => {
                        if (tab.tab_id === formattedData.tab_id) {
                            return updatedFormattedData;
                        }
                        return tab;
                    }),
                },
            },
        };

        setSelectedAdvancedJournal(updatedSelectedAdvancedJournal);
        setFormattedData(updatedFormattedData);
        setActiveRepeatableTab(newTabId);

        // Update fields and initial values for the new tab
        const newTabFields = newTab.fields;
        const { schemaObject, initialValues: newInitialValues } = createValidationSchema(newTabFields);
        const images = newTabFields?.filter((field) => field.type === 'upload')?.flatMap((field) => field.value);

        let disableField = selectedAdvancedJournalId.completed ? true : false;
        setCurrentTabFields([{ ...firstDetail, fields: newTabFields }]);
        setInitialValues({ ...newInitialValues, disabled: disableField });
        setValidationSchema(schemaObject);
        setAllImagesForCompair(images);
    };

    // Helper function to save current formik values to the active tab
    const saveCurrentTabValues = () => {
        if (!formattedData?.is_repeatable || !formattedData?.details?.[0]?.tabs || !activeRepeatableTab || !formik) {
            return;
        }

        const firstDetail = formattedData.details[0];
        const currentTabIndex = firstDetail.tabs.findIndex((tab) => tab.tab_id === activeRepeatableTab);
        if (currentTabIndex === -1) return;

        // Convert formik values back to field values
        let { disabled, ...nonDisabled } = formik.values;
        let newVal = {
            ...Object.entries(nonDisabled).reduce((acc, [key, value]) => {
                const parts = key.split('-');
                if (parts[0] === 'select') {
                    const selectKey = parts[2];
                    if (selectKey === 'value' || selectKey === 'value_other') {
                        const fieldId = parts[1];
                        acc[`select-${fieldId}`] = acc[`select-${fieldId}`] || {};
                        acc[`select-${fieldId}`][selectKey] = value;
                    }
                } else {
                    const newKey = parts[1];
                    acc[newKey] = value;
                }
                return acc;
            }, {}),
        };

        // Update fields with current formik values
        // Preserve values for 'title' and 'image' field types even if not in newVal
        const updatedFields = firstDetail.tabs[currentTabIndex].fields.map((field) => {
            // Preserve title and image field values - don't overwrite them
            if (field.type === 'title' || field.type === 'image') {
                return field; // Keep original value
            }
            if (field.field_id in newVal) {
                return {
                    ...field,
                    value: newVal[field.field_id],
                };
            }
            if (field.type === 'select' && `select-${field.field_id}` in newVal) {
                return {
                    ...field,
                    value: newVal[`select-${field.field_id}`]?.value ?? field.value,
                    value_other: newVal[`select-${field.field_id}`]?.value_other ?? field.value_other,
                };
            }
            return field;
        });

        // Update the tab's fields in formattedData
        const updatedTabs = firstDetail.tabs.map((tab, index) => {
            if (index === currentTabIndex) {
                return {
                    ...tab,
                    fields: updatedFields,
                };
            }
            return tab;
        });

        const updatedFormattedData = {
            ...formattedData,
            details: formattedData.details.map((detail, index) => {
                if (index === 0) {
                    return {
                        ...detail,
                        tabs: updatedTabs,
                    };
                }
                return detail;
            }),
        };

        // Also update selectedAdvancedJournal to keep it in sync
        const updatedSelectedAdvancedJournal = {
            ...selectedAdvancedJournal,
            data: {
                ...selectedAdvancedJournal.data,
                format: {
                    ...selectedAdvancedJournal.data.format,
                    tabsOptions: selectedAdvancedJournal.data.format.tabsOptions.map((tab) => {
                        if (tab.tab_id === formattedData.tab_id) {
                            return updatedFormattedData;
                        }
                        return tab;
                    }),
                },
            },
        };

        setFormattedData(updatedFormattedData);
        setSelectedAdvancedJournal(updatedSelectedAdvancedJournal);
    };

    const handleRepeatableTabChange = (tabId) => {
        // Save current tab's formik values before switching
        if (activeRepeatableTab && activeRepeatableTab !== tabId) {
            saveCurrentTabValues();
        }

        setActiveRepeatableTab(tabId);

        // Update fields and initial values for the selected tab immediately
        if (formattedData?.is_repeatable && formattedData?.details?.[0]?.tabs) {
            const activeTabData = formattedData.details[0].tabs.find((tab) => tab.tab_id === tabId);
            if (activeTabData) {
                const { schemaObject, initialValues: newInitialValues } = createValidationSchema(activeTabData.fields);
                const images = activeTabData.fields
                    ?.filter((field) => field.type === 'upload')
                    ?.flatMap((field) => field.value);

                let disableField = selectedAdvancedJournalId.completed ? true : false;
                const firstDetail = formattedData.details[0];

                setCurrentTabFields([{ ...firstDetail, fields: activeTabData.fields }]);
                const updatedInitialValues = { ...newInitialValues, disabled: disableField };
                setInitialValues(updatedInitialValues);
                setValidationSchema(schemaObject);
                setAllImagesForCompair(images);

                // Load formik values from the tab's saved data
                if (formik) {
                    formik.setValues(updatedInitialValues);
                    formik.setTouched({});
                    formik.setErrors({});
                }
            }
        }
    };

    const handleTabMenuOpen = (event, tabId, index) => {
        event.stopPropagation(); // Prevent tab change when clicking menu
        setTabMenuAnchor({ element: event.currentTarget, tabId, index });
    };

    const handleTabMenuClose = () => {
        setTabMenuAnchor({ element: null, tabId: null, index: null });
    };

    const handleEditTabName = () => {
        if (!tabMenuAnchor) return;
        const tab = formattedData?.details?.[0]?.tabs?.find((t) => t.tab_id === tabMenuAnchor.tabId);
        setEditTabModal({ open: true, tabId: tabMenuAnchor.tabId, tab_name: tab?.tab_name || '' });
        handleTabMenuClose();
    };

    const handleDeleteTab = () => {
        if (!tabMenuAnchor) return;
        const tab = formattedData?.details?.[0]?.tabs?.find((t) => t.tab_id === tabMenuAnchor.tabId);
        setDeleteTabModal({ open: true, tabId: tabMenuAnchor.tabId, tab_name: tab?.tab_name || '' });
        handleTabMenuClose();
    };

    const handleSaveTabName = () => {
        if (!editTabModal.tabId || !editTabModal.tab_name.trim()) {
            toast.error(t('Customer.TabNameRequired'));
            return;
        }

        const firstDetail = formattedData.details[0];
        const updatedTabs = firstDetail.tabs.map((tab) => {
            if (tab.tab_id === editTabModal.tabId) {
                return {
                    ...tab,
                    tab_name: editTabModal.tab_name.trim(),
                };
            }
            return tab;
        });

        const updatedFormattedData = {
            ...formattedData,
            details: formattedData.details.map((detail, index) => {
                if (index === 0) {
                    return {
                        ...detail,
                        tabs: updatedTabs,
                    };
                }
                return detail;
            }),
        };

        // Update selectedAdvancedJournal
        const updatedSelectedAdvancedJournal = {
            ...selectedAdvancedJournal,
            data: {
                ...selectedAdvancedJournal.data,
                format: {
                    ...selectedAdvancedJournal.data.format,
                    tabsOptions: selectedAdvancedJournal.data.format.tabsOptions.map((tab) => {
                        if (tab.tab_id === formattedData.tab_id) {
                            return updatedFormattedData;
                        }
                        return tab;
                    }),
                },
            },
        };

        setFormattedData(updatedFormattedData);
        setSelectedAdvancedJournal(updatedSelectedAdvancedJournal);
        setEditTabModal({ open: false, tabId: null, tab_name: '' });
    };

    const confirmDeleteTab = () => {
        if (!deleteTabModal.tabId || !formattedData?.is_repeatable || !formattedData?.details?.[0]) return;

        const firstDetail = formattedData.details[0];

        // Prevent deleting the first tab (index 0)
        const tabIndex = firstDetail.tabs.findIndex((tab) => tab.tab_id === deleteTabModal.tabId);
        if (tabIndex === 0) {
            toast.error(t('Customer.CannotDeleteFirstTab'));
            setDeleteTabModal({ open: false, tabId: null, tab_name: null });
            return;
        }

        const updatedTabs = firstDetail.tabs.filter((tab) => tab.tab_id !== deleteTabModal.tabId);

        // Don't allow deleting if it's the last tab
        if (updatedTabs.length === 0) {
            toast.error(t('Customer.CannotDeleteLastTab'));
            setDeleteTabModal({ open: false, tabId: null, tab_name: null });
            return;
        }

        const updatedFormattedData = {
            ...formattedData,
            details: formattedData.details.map((detail, index) => {
                if (index === 0) {
                    return {
                        ...detail,
                        tabs: updatedTabs,
                    };
                }
                return detail;
            }),
        };

        // Update selectedAdvancedJournal
        const updatedSelectedAdvancedJournal = {
            ...selectedAdvancedJournal,
            data: {
                ...selectedAdvancedJournal.data,
                format: {
                    ...selectedAdvancedJournal.data.format,
                    tabsOptions: selectedAdvancedJournal.data.format.tabsOptions.map((tab) => {
                        if (tab.tab_id === formattedData.tab_id) {
                            return updatedFormattedData;
                        }
                        return tab;
                    }),
                },
            },
        };

        // If deleted tab was active, switch to first tab
        const newActiveTabId =
            deleteTabModal.tabId === activeRepeatableTab ? updatedTabs[0].tab_id : activeRepeatableTab;

        setSelectedAdvancedJournal(updatedSelectedAdvancedJournal);
        setFormattedData(updatedFormattedData);
        setActiveRepeatableTab(newActiveTabId);
        setDeleteTabModal({ open: false, tabId: null });

        // Refresh fields for the active tab
        const activeTabData = updatedTabs.find((tab) => tab.tab_id === newActiveTabId) || updatedTabs[0];
        const { schemaObject, initialValues: newInitialValues } = createValidationSchema(activeTabData.fields);
        const images = activeTabData.fields
            ?.filter((field) => field.type === 'upload')
            ?.flatMap((field) => field.value);

        let disableField = selectedAdvancedJournalId.completed ? true : false;
        setCurrentTabFields([{ ...firstDetail, fields: activeTabData.fields }]);
        setInitialValues({ ...newInitialValues, disabled: disableField });
        setValidationSchema(schemaObject);
        setAllImagesForCompair(images);
    };

    if (loading)
        return (
            <Stack
                sx={{
                    position: 'absolute',
                    zIndex: 110,
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                }}
            >
                <CircularProgress size="2.5rem" sx={{ color: '#6f6f6f' }} />
            </Stack>
        );

    return (
        <Stack id={'top-of-customer-advanced-journal'} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack>
                {/* <FPrimaryHeading text={t('Customer.AdvancedJournal')} fontColor="#545454" sx={{ my: 0 }} /> */}
                <FTextInput
                    // borderThickness="0"
                    disabled={selectedAdvancedJournalId?.completed}
                    mt={1}
                    inputFontSize={24}
                    fontColor={'#545454'}
                    inputFontWeight={700}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    name="title"
                />
            </Stack>

            <DynamicTabs
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                tabOptions={selectedAdvancedJournal?.data?.format?.tabsOptions}
            />

            <Stack
                mt={-5}
                bgcolor={'#fff'}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    p: { xs: 2, md: 6 },
                    borderRadius: 6,
                    zIndex: 1,
                    minHeight: '100vh',
                }}
            >
                {activeTab === formattedData?.tab_id ? (
                    <React.Fragment>
                        {formattedData?.is_repeatable && formattedData?.details?.[0]?.tabs && (
                            <Stack
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    mt: { xs: 3, md: 0 },
                                }}
                            >
                                <Tabs
                                    value={
                                        activeRepeatableTab &&
                                            formattedData?.details?.[0]?.tabs?.some(
                                                (tab) => tab.tab_id === activeRepeatableTab,
                                            )
                                            ? activeRepeatableTab
                                            : formattedData?.details?.[0]?.tabs?.[0]?.tab_id || false
                                    }
                                    onChange={(event, newValue) => {
                                        handleRepeatableTabChange(newValue);
                                    }}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                >
                                    {formattedData?.details?.[0]?.tabs?.map((tab, index) => (
                                        <Tab
                                            disableFocusRipple
                                            disableRipple
                                            disableTouchRipple
                                            key={tab.tab_id}
                                            sx={{ maxWidth: 'fit-content' }}
                                            label={
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <Typography textTransform="none">
                                                        {tab?.tab_name || `Behandlingsforløb ${index + 1}`}
                                                    </Typography>
                                                    {!selectedAdvancedJournalId?.completed && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                handleTabMenuOpen(e, tab?.tab_id, index);
                                                            }}
                                                            onMouseDown={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            sx={{
                                                                padding: '4px',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                                },
                                                            }}
                                                        >
                                                            <MoreVert fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Stack>
                                            }
                                            value={tab?.tab_id}
                                        />
                                    ))}
                                </Tabs>
                                {/* <FButton
                                    title={<Add />}
                                    variant="save"
                                    onClick={handleAddRepeatableTab}
                                    disabled={selectedAdvancedJournalId?.completed}
                                    sx={{ minWidth: 'fit-content', px: 0 }}
                                /> */}
                                <IconButton
                                    onClick={handleAddRepeatableTab}
                                    disabled={selectedAdvancedJournalId?.completed}
                                    disableRipple
                                    disableFocusRipple
                                    disableTouchRipple
                                    sx={{
                                        border: '1px solid #D9D9D9',
                                        borderRadius: '8px',
                                        width: 40,
                                        height: 40,
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                        },
                                    }}
                                >
                                    <Add />
                                </IconButton>
                            </Stack>
                        )}

                        {tabMenuAnchor.element && (
                            <Menu
                                anchorEl={tabMenuAnchor.element}
                                open={Boolean(tabMenuAnchor.element)}
                                onClose={handleTabMenuClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem onClick={handleEditTabName}>
                                    <Typography>{t('Common.Edit')}</Typography>
                                </MenuItem>
                                {tabMenuAnchor.index !== 0 && (
                                    <MenuItem onClick={handleDeleteTab} sx={{ color: '#D30000' }}>
                                        <Typography>{t('Common.Delete')}</Typography>
                                    </MenuItem>
                                )}
                            </Menu>
                        )}

                        {!isCreating && (
                            <Stack
                                ml={'auto'}
                                display={'flex'}
                                flexDirection={'column'}
                                width={{ xs: '100%', md: 'fit-content' }}
                                style={{}}
                                sx={{ mt: { xs: 4, md: 0 } }}
                            >
                                <FButton
                                    disabled={downloading}
                                    onClick={() => handlePrint(selectedAdvancedJournal?.id)}
                                    title={
                                        downloading ? (
                                            <CircularProgress size="1.5rem" sx={{ color: '#fff' }} />
                                        ) : (
                                            t('Customer.PrintPDF')
                                        )
                                    }
                                    variant={'save'}
                                    sx={{ width: { xs: '100%', md: 'fit-content' }, bgcolor: '#d9d9d9' }}
                                />
                            </Stack>
                        )}
                        <React.Fragment>
                            {currentTabFields &&
                                currentTabFields[0]?.fields?.length &&
                                currentTabFields[0]?.fields
                                    .sort((a, b) => a.fieldSequence - b.fieldSequence)
                                    .map((field, index) => (
                                        <React.Fragment key={index}>
                                            {field.type === 'date' || field.type === 'autoFill_birthday' ? (
                                                <DynamicDate
                                                    btnType={btnType}
                                                    formik={formik}
                                                    field={field}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                />
                                            ) : field.type === 'cpr' || field.type === 'autoFill_cpr' ? (
                                                <DynamicCpr
                                                    btnType={btnType}
                                                    formik={formik}
                                                    field={field}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                />
                                            ) : field.type === `upload` ? (
                                                <DynamicUpload
                                                    allImagesForCompair={allImagesForCompair}
                                                    setAllImagesForCompair={setAllImagesForCompair}
                                                    isCreating={isCreating}
                                                    advancedJournalId={selectedAdvancedJournal?.id}
                                                    compairImage={() => setCompairModal(true)}
                                                    field={field}
                                                    formik={formik}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                    autoSave={autoSave}
                                                />
                                            ) : field.type === `image` ? (
                                                <DynamicImage
                                                    field={field}
                                                    formik={formik}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                    autoSave={autoSave}
                                                />
                                            ) : field.type === 'editor' ? (
                                                <DynamicEditor
                                                    templates={templates}
                                                    formik={formik}
                                                    field={field}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                />
                                            ) : field.type === 'checkbox' ? (
                                                <DynamicCheckBox
                                                    field={field}
                                                    formik={formik}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                />
                                            ) : field.type === 'select' ? (
                                                <DynamicSelect
                                                    formik={formik}
                                                    field={field}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}-value`,
                                                    )}
                                                    otherName={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}-value_other`,
                                                    )}
                                                />
                                            ) : field.type === 'radio' ? (
                                                <DynamicRadio
                                                    field={field}
                                                    formik={formik}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                />
                                            ) : field.type === 'text' ||
                                                field.type === 'autoFill_name' ||
                                                field.type === 'autoFill_city' ||
                                                field.type === 'autoFill_zip' ||
                                                field.type === 'autoFill_email' ||
                                                field.type === 'autoFill_phone' ||
                                                field.type === 'autoFill_phone_alt' ||
                                                field.type === 'small_text' ? (
                                                <DynamicTextinput
                                                    formik={formik}
                                                    field={field}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                />
                                            ) : field.type === 'textarea' ||
                                                field.type === 'autoFill_address' ||
                                                field.type === 'autoFill_notes' ? (
                                                <DynamicTextarea
                                                    formik={formik}
                                                    field={field}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                />
                                            ) : field.type === 'signature' ? (
                                                <DynamicSignature
                                                    advancedJournalId={selectedAdvancedJournal?.id}
                                                    formik={formik}
                                                    field={field}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                    autoSave={autoSave}
                                                />
                                            ) : field.type === 'title' ? (
                                                <DynamicTitle
                                                    formik={formik}
                                                    field={field}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                />
                                            ) : field.type === 'booking_summary' ? (
                                                <DynamicBookingSummary
                                                    formik={formik}
                                                    name={Object.keys(initialValues).find(
                                                        (key) => key === `${field.type}-${field?.field_id}`,
                                                    )}
                                                    field={field}
                                                    bookings={bookings}
                                                    fetchFixedData={fetchFixedData}
                                                    customer={customer}
                                                />
                                            ) : null}
                                        </React.Fragment>
                                    ))}

                            {/* <DynamicBookingSummary formik={formik} customer={customer} /> */}
                            <Divider sx={{ borderWidth: '1.5px', borderColor: '#a2a2a2' }} />

                            {formik.values?.disabled === false && (
                                <Stack
                                    m={0}
                                    display={'flex'}
                                    flexDirection={{ xs: 'column', md: 'row' }}
                                    alignItems={'center'}
                                >
                                    <FButton
                                        onClick={async () => {
                                            handleTouched();
                                            setBtnType('save');
                                            const validFields = await formik.validateForm();
                                            if (Object.keys(validFields).length > 0) {
                                                // make all field touched
                                                Object.keys(validFields).forEach((error) => {
                                                    formik.setFieldTouched(error, true);
                                                });
                                                toast.error(t('Customer.FormError'));
                                                return;
                                            } else {
                                                setSaveConfirm(true);
                                            }
                                        }}
                                        title={t('Common.Save')}
                                        variant="save"
                                        sx={{ width: { xs: '100%', md: '10%' } }}
                                    />
                                    {!isCreating && (
                                        <FButton
                                            onClick={() => {
                                                handleTouched();
                                                setConfirmCompleted(true);
                                            }}
                                            title={t('Customer.CompleteJournal')}
                                            variant="primary"
                                            sx={{
                                                width: { xs: '100%', md: '15%' },
                                                ml: 'auto',
                                                bgcolor: '#E19957',
                                                color: 'white',
                                                mt: { xs: 2, md: 0 },
                                                '& .MuiTypography-root': {
                                                    whiteSpace: 'nowrap',
                                                },
                                            }}
                                        />
                                    )}
                                </Stack>
                            )}
                        </React.Fragment>

                        {remainingFields && remainingFields.length >= 1 ? (
                            <Accordion
                                defaultExpanded
                                sx={{
                                    boxShadow: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: '#fff',
                                    borderRadius: '15px',
                                    border: '1px solid #D9D9D9',
                                    scrollbarWidth: 'none',
                                    overflowX: 'hidden',
                                    width: '100%',
                                }}
                            >
                                <AccordionSummary
                                    sx={{ border: 'none' }}
                                    expandIcon={<ExpandMore />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    {/* <FPrimaryHeading text='Earlier versions' fontColor="#545454" /> */}
                                    <Typography variant="body1" fontWeight={700} color="#545454">
                                        {t('Customer.EarlierVersions')}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0, overflow: 'hidden' }}>
                                    <TableContainer sx={{ borderRadius: 3 }} component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#F8F8F8' }}>
                                                    <TableCell width={'10%'}>
                                                        <Typography
                                                            sx={{
                                                                ml: 2,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                            variant="body1"
                                                            fontWeight={700}
                                                        >
                                                            {' '}
                                                            {t('Common.View')}{' '}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell width={'10%'}>
                                                        <Typography
                                                            sx={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                            variant="body1"
                                                            fontWeight={700}
                                                        >
                                                            {' '}
                                                            {t('Common.Date')}{' '}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell width={'30%'}>
                                                        <Typography
                                                            sx={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                            variant="body1"
                                                            fontWeight={700}
                                                        >
                                                            {t('Customer.Journal')}{' '}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell width={'15%'}>
                                                        <Typography
                                                            sx={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                            variant="body1"
                                                            fontWeight={700}
                                                        >
                                                            {' '}
                                                            {t('Customer.PictureBefre')}{' '}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell width={'15%'}>
                                                        <Typography
                                                            sx={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                            variant="body1"
                                                            fontWeight={700}
                                                        >
                                                            {' '}
                                                            {t('Customer.PictureAfter')}{' '}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell width={'15%'}>
                                                        <Typography
                                                            sx={{
                                                                ml: 2,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                            variant="body1"
                                                            fontWeight={700}
                                                        >
                                                            {' '}
                                                            {t('Customer.JournalNotes')}{' '}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody sx={{ bgcolor: '#fff' }}>
                                                {remainingFields.map((journal, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <FButton
                                                                variant={'save'}
                                                                title={t('Common.View')}
                                                                onClick={() => {
                                                                    // scroll to the top of the page
                                                                    let id = document.getElementById(
                                                                        'top-of-customer-advanced-journal',
                                                                    );
                                                                    id?.scrollIntoView({ behavior: 'smooth' });
                                                                    handleCurrentChange(
                                                                        journal?.detail_id,
                                                                        activeTab,
                                                                        journal,
                                                                    );
                                                                }}
                                                                sx={{ backgroundColor: '#d9d9d9' }}
                                                            />
                                                        </TableCell>

                                                        <TableCell>
                                                            <Typography variant="caption">
                                                                {moment(
                                                                    journal?.version_date,
                                                                    'YYYY-MM-DDTHH:mm:ss',
                                                                ).isValid() &&
                                                                    moment(
                                                                        journal?.version_date,
                                                                        'YYYY-MM-DDTHH:mm:ss',
                                                                    ).format('DD/MM/YYYY HH:mm')}
                                                            </Typography>
                                                        </TableCell>

                                                        <TableCell>
                                                            {/* <div
                                                                dangerouslySetInnerHTML={{
                                                                    __html: journal?.fields?.find(
                                                                        (field) => field.type === 'editor',
                                                                    )?.value,
                                                                }}
                                                            /> */}
                                                            {journal?.version_title}
                                                        </TableCell>

                                                        <TableCell>
                                                            <Stack
                                                                p={0}
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    maxWidth: '180px',
                                                                    overflow: 'hidden',
                                                                    overflowX: 'scroll',
                                                                    gap: 2,
                                                                    scrollbarWidth: 'none',
                                                                }}
                                                            >
                                                                {journal?.tabs?.length > 0
                                                                    ? // If tabs exist, show all images from all tabs
                                                                    journal.tabs
                                                                        .flatMap((tab) =>
                                                                            tab?.fields
                                                                                ?.filter(
                                                                                    (field) =>
                                                                                        field.type === 'upload',
                                                                                )
                                                                                ?.flatMap(
                                                                                    (field) => field?.value || [],
                                                                                ),
                                                                        )
                                                                        ?.slice(0, 1)
                                                                        ?.map((img, imgIndex) => (
                                                                            <Stack mt={2} key={imgIndex}>
                                                                                <img
                                                                                    src={`${process.env.REACT_APP_IMG_URL}${img?.attachment}`}
                                                                                    alt={`Uploaded-image`}
                                                                                    style={{
                                                                                        width: '150px',
                                                                                        height: '150px',
                                                                                        objectFit: 'contain',
                                                                                    }}
                                                                                />
                                                                            </Stack>
                                                                        ))
                                                                    : // Otherwise, show 1 image from journal.fields
                                                                    journal?.fields
                                                                        ?.filter((field) => field.type === 'upload')
                                                                        ?.slice(0, 1)
                                                                        ?.map((field, index) =>
                                                                            field?.value?.map((img, imgIndex) => (
                                                                                <Stack mt={2} key={imgIndex}>
                                                                                    <img
                                                                                        src={`${process.env.REACT_APP_IMG_URL}${img?.attachment}`}
                                                                                        alt={`Uploaded-image`}
                                                                                        style={{
                                                                                            width: '150px',
                                                                                            height: '150px',
                                                                                            objectFit: 'contain',
                                                                                        }}
                                                                                    />
                                                                                </Stack>
                                                                            )),
                                                                        )}
                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell>
                                                            <Stack
                                                                p={0}
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    maxWidth: '180px',
                                                                    overflow: 'hidden',
                                                                    overflowX: 'scroll',
                                                                    gap: 2,
                                                                    scrollbarWidth: 'none',
                                                                }}
                                                            >
                                                                {journal?.tabs?.length > 0
                                                                    ? // If tabs exist, show all images from all tabs
                                                                    journal.tabs
                                                                        .flatMap((tab) =>
                                                                            tab?.fields
                                                                                ?.filter(
                                                                                    (field) =>
                                                                                        field.type === 'upload',
                                                                                )
                                                                                ?.flatMap(
                                                                                    (field) => field?.value || [],
                                                                                ),
                                                                        )
                                                                        ?.slice(1, 2)
                                                                        ?.map((img, imgIndex) => (
                                                                            <Stack mt={2} key={imgIndex}>
                                                                                <img
                                                                                    src={`${process.env.REACT_APP_IMG_URL}${img?.attachment}`}
                                                                                    alt={`Uploaded-image`}
                                                                                    style={{
                                                                                        width: '150px',
                                                                                        height: '150px',
                                                                                        objectFit: 'contain',
                                                                                    }}
                                                                                />
                                                                            </Stack>
                                                                        ))
                                                                    : // Otherwise, show 1 image from journal.fields
                                                                    journal?.fields
                                                                        ?.filter((field) => field.type === 'upload')
                                                                        ?.slice(1, 2)
                                                                        ?.map((img, imgIndex) => (
                                                                            <Stack mt={2} key={imgIndex}>
                                                                                <img
                                                                                    src={`${process.env.REACT_APP_IMG_URL}${img?.attachment}`}
                                                                                    alt={`Uploaded-image`}
                                                                                    style={{
                                                                                        width: '150px',
                                                                                        height: '150px',
                                                                                        objectFit: 'contain',
                                                                                    }}
                                                                                />
                                                                            </Stack>
                                                                        ))}
                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell>
                                                            <Typography variant="caption">
                                                                {
                                                                    journal?.fields?.find(
                                                                        (field) => field.type === 'textarea',
                                                                    )?.value
                                                                }
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        ) : null}

                        <Accordion
                            sx={{
                                boxShadow: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                bgcolor: '#fff',
                                borderRadius: '15px',
                                border: '1px solid #D9D9D9',
                                scrollbarWidth: 'none',
                                overflowX: 'hidden',
                                width: '100%',
                            }}
                            m={0}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography sx={{ color: '#545454' }} variant="body1" fontWeight={700}>
                                    {t('Customer.Logs')}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, overflow: 'hidden' }}>
                                <FCommonTable
                                    headerColor="#F8F8F8"
                                    borderRadius={0}
                                    visibleColumns={['incident', 'date', 'employees', 'ip']}
                                    columnWidths={{ incident: '30%', date: '30%', employees: '30%', ip: '15%' }}
                                    columns={logColumns}
                                    data={dataForLogs}
                                    wrap={true}
                                // loading={asComponent ? loadingAsComp.previous : false} onRowClick={() => { }}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </React.Fragment>
                ) : (activeTab === formattedData?.tab_id?.length) === 0 ? (
                    <Stack sx={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress size="2.5rem" sx={{ color: '#6f6f6f' }} />
                    </Stack>
                ) : (
                    <Stack sx={{ height: '100dvh', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="body1">{t('Customer.NoDataFound')}</Typography>
                    </Stack>
                )}
            </Stack>

            {saveConfirm && (
                <SaveModal
                    title={t('Customer.SaveJournal')}
                    open={saveConfirm}
                    handleClose={() => setSaveConfirm(false)}
                    dismissColor={'#fff'}
                    dismissBg={'#D9D9D9'}
                    ConfirmColor={'#fff'}
                    ConfirmBg={'#44B904'}
                    description={
                        <Typography sx={{ whiteSpace: 'pre-line' }}>{t('Customer.SaveJournalMOdelText')}</Typography>
                    }
                    onClickDismiss={() => setSaveConfirm(false)}
                    onClickConfirm={() => {
                        formik.handleSubmit();
                        setSaveConfirm(false);
                    }}
                />
            )}

            {confirmCompleted && (
                <SaveModal
                    title={t('Common.Complete')}
                    open={confirmCompleted}
                    dismissColor={'#fff'}
                    dismissBg={'#D9D9D9'}
                    dismissText={t('Common.Dismiss')}
                    ConfirmColor={'#fff'}
                    ConfirmBg={'#44B904'}
                    ConfirmText={t('Common.Complete')}
                    handleClose={() => setConfirmCompleted(false)}
                    description={
                        <Typography sx={{ whiteSpace: 'pre-line' }}>
                            {t('Customer.CompleteAdvJournalMOdelText')}
                        </Typography>
                    }
                    onClickDismiss={() => setConfirmCompleted(false)}
                    onClickConfirm={() => {
                        setConfirmCompleted(false);
                        setBtnType('posted');
                        formik.handleSubmit();
                        // handleSaveOrPosted('posted');
                    }}
                />
            )}

            {compairModal && (
                <CompairImage
                    isCreating={isCreating}
                    propsForCompair={propsForCompair}
                    oepn={compairModal}
                    onClose={() => setCompairModal(false)}
                    imagesForProps={allImagesForCompair}
                />
            )}

            {(confirmQuit?.modal || blocker.state === 'blocked') && (
                <SaveModal
                    ConfirmBg={'#44B904'}
                    dismissColor={'#fff'}
                    dismissBg={'#d9d9d9'}
                    dismissText={t('Customer.ConfirmWithoutSave')}
                    ConfirmText={t('Setting.Cancel')}
                    title={t('Customer.SaveChangesTitle')}
                    description={t('Customer.SaveChangesDescription')}
                    open={confirmQuit?.modal || blocker.state === 'blocked'}
                    handleClose={() => {
                        blocker.state === 'blocked' && blocker?.reset();
                        setConfirmQuit(() => ({ prop: null, modal: false }));
                        dispatch(route(pathname));
                    }}
                    onClickDismiss={() => {
                        setActiveTab(confirmQuit?.prop);
                        blocker.state === 'blocked' && blocker?.proceed();
                        setConfirmQuit(() => ({ prop: null, modal: false }));
                        blocker.state === 'blocked' && navigate('/' + selectedRoute);
                    }}
                    onClickConfirm={() => {
                        blocker.state === 'blocked' && blocker?.reset();
                        setConfirmQuit(() => ({ prop: null, modal: false }));
                        dispatch(route(pathname));
                    }}
                />
            )}

            {deleteTabModal.open && (
                <SaveModal
                    title={t('Customer.DeleteDetail')}
                    open={deleteTabModal.open}
                    handleClose={() => setDeleteTabModal({ open: false, tabId: null, tab_name: null })}
                    dismissColor={'#fff'}
                    dismissBg={'#D9D9D9'}
                    dismissText={t('Setting.Cancel')}
                    ConfirmColor={'#fff'}
                    ConfirmBg={'#D30000'}
                    ConfirmText={t('Common.Delete')}
                    description={
                        <Typography sx={{ whiteSpace: 'pre-line' }}>
                            {t('Customer.DeleteDetailConfirmation', { name: deleteTabModal.tab_name })}
                        </Typography>
                    }
                    onClickDismiss={() => setDeleteTabModal({ open: false, tabId: null, tab_name: null })}
                    onClickConfirm={confirmDeleteTab}
                />
            )}

            {editTabModal.open && (
                <SaveModal
                    title={t('Customer.EditTabName') || 'Edit Tab Name'}
                    open={editTabModal.open}
                    handleClose={() => setEditTabModal({ open: false, tabId: null, tab_name: '' })}
                    dismissColor={'#fff'}
                    dismissBg={'#D9D9D9'}
                    dismissText={t('Setting.Cancel')}
                    ConfirmColor={'#fff'}
                    ConfirmBg={'#44B904'}
                    ConfirmText={t('Common.Save')}
                    description={
                        <Stack gap={2} sx={{ mt: 2 }}>
                            <FTextInput
                                value={editTabModal.tab_name}
                                onChange={(e) => setEditTabModal({ ...editTabModal, tab_name: e.target.value })}
                                placeholder={t('Customer.TabName') || 'Tab Name'}
                                name="tab_name"
                            />
                        </Stack>
                    }
                    onClickDismiss={() => setEditTabModal({ open: false, tabId: null, tab_name: '' })}
                    onClickConfirm={handleSaveTabName}
                />
            )}
        </Stack>
    );
}
