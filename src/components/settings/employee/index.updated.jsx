import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Stack,
    Divider,
    Skeleton,
    AppBar,
    Grid2,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import PrimaryHeading from '../commonPrimaryHeading';
import SecondaryHeading from '../commonSecondaryHeading';
import PencnlIconImg from '../../../assets/edit-2.png';
import DeleteIconImg from '../../../assets/DeleteIcon.png';

import apiFetcher from '../../../utils/interCeptor';
import { useFormik } from 'formik';
import CustomDeleteModal from '../../deleteAlertModal';
import { toast } from 'react-toastify';
import _ from 'lodash';

import EmployeeModel from '../calendar/popup/EmployeeModel';
import FSwitch from '../../commonComponents/f-switch';
import { useSelector, useDispatch } from 'react-redux';
import { settings as settingsSlice } from '../../../context/settingsSlice';
import Notauthorized from '../../commonComponents/F_Notauthorized';

import { t } from 'i18next';
import FSelect from '../../commonComponents/F_Select';
import { CreateEmployeeApi, DeleteEmployeeApi } from '../../../utils/Api/Employee';
import { dividerSx } from '../../../scenes/Settings/Index';
import FPrimaryHeading from '../../commonComponents/F_PrimaryHeading';
import { GetServiceGroup } from '../../../utils/Api/Service';
import FTextInput from '../../commonComponents/F_TextInput';
import { formatCurrency } from '../../../scenes/POS/Core/pos.utils';
import { useFieldArray, useForm } from 'react-hook-form';
import { api } from '../../../utils/Api/POS';
import FButton from '../../commonComponents/F_Button';

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION DOMAIN TREE
// Each domain → sub-domains → permission keys (flat keys sent to API unchanged)
// New keys: crud_deposit, view_deposit, crud_health_declaration,
//           view_health_declaration, crud_advanced_reminder,
//           view_advanced_reminder, view_pos
// ─────────────────────────────────────────────────────────────────────────────
const PERMISSION_DOMAINS = [
    {
        id: 'services',
        labelKey: 'Common.Service',
        subDomains: [
            {
                id: 'service',
                labelKey: 'Common.Service',
                isMaster: true, // master toggle controls all sibling sub-domains
                permissions: [
                    { id: 'crud_services', labelKey: 'Setting.Create/edit/deleteServices' },
                    { id: 'view_service_list', labelKey: 'Setting.ViewServiceList' },
                ],
            },
            {
                id: 'deposit',
                labelKey: 'Services.Deposit',
                permissions: [
                    { id: 'crud_deposit', labelKey: 'Setting.CrudDeposit' },
                    { id: 'view_deposit', labelKey: 'Setting.ViewDeposit' },
                ],
            },
            {
                id: 'health_declaration',
                labelKey: 'Setting.HealthDeclarationTitle',
                permissions: [
                    { id: 'crud_health_declaration', labelKey: 'Setting.CrudHealthDeclaration' },
                    { id: 'view_health_declaration', labelKey: 'Setting.ViewHealthDeclaration' },
                ],
            },
            {
                id: 'advanced_reminder',
                labelKey: 'Setting.AdvancedReminder',
                permissions: [
                    { id: 'crud_advanced_reminder', labelKey: 'Setting.CrudAdvancedReminder' },
                    { id: 'view_advanced_reminder', labelKey: 'Setting.ViewAdvancedReminder' },
                ],
            },
        ],
    },
    {
        id: 'store',
        labelKey: 'Insights.General',
        subDomains: [
            {
                id: 'department',
                labelKey: 'POS.CashDrawerBadge1Text',
                permissions: [
                    { id: 'change_department', labelKey: 'Setting.ChangeDepartment' },
                    { id: 'create_department', labelKey: 'Setting.CreateDepartment' },
                    { id: 'upload_pictures', labelKey: 'Setting.UploadPictures' },
                    { id: 'edit_about_us', labelKey: 'Setting.EditInAboutUs' },
                ],
            },
            {
                id: 'insights',
                labelKey: 'Setting.Insights',
                permissions: [{ id: 'view_insights', labelKey: 'Setting.ViewAllInsights' }],
            },
            {
                id: 'opening_hours',
                labelKey: 'Setting.OpeningHours',
                permissions: [
                    { id: 'change_all_opening_hours', labelKey: 'Setting.ChangeOpeningHoursForAll' },
                    { id: 'change_own_opening_hours', labelKey: 'Setting.ChangeOpeningHoursForOwn' },
                ],
            },
            {
                id: 'calendar_interval',
                labelKey: 'Setting.Calendar',
                permissions: [
                    { id: 'change_all_calender_interval', labelKey: 'Setting.ChangeCalendarIntervalForAll' },
                    { id: 'change_own_calender_interval', labelKey: 'Setting.ChangeCalendarIntervalForOwn' },
                ],
            },
        ],
    },
    {
        id: 'special_offers',
        labelKey: 'SpOffers.SpOffers',
        permissions: [
            { id: 'crud_special_offers', labelKey: 'Setting.Create/edit/deleteSpecialOffers' },
            { id: 'view_special_offers', labelKey: 'Setting.ViewSpecialOffers' },
        ],
    },
    {
        id: 'employees',
        labelKey: 'Common.Employees',
        subDomains: [
            {
                id: 'employee',
                labelKey: 'Setting.Employee',
                permissions: [{ id: 'create_employee', labelKey: 'Setting.CreateEmployees' }],
            },
            {
                id: 'permissions',
                labelKey: 'Setting.Permissions',
                permissions: [{ id: 'change_permissions', labelKey: 'Setting.ChangePermissions' }],
            },
        ],
    },
    {
        id: 'calendar',
        labelKey: 'Setting.Calendar',
        subDomains: [
            {
                id: 'employees_view',
                labelKey: 'Setting.EmployeesView',
                permissions: [{ id: 'view_all_employees', labelKey: 'Setting.ViewAllEmployees' }],
            },
            {
                id: 'bookings',
                labelKey: 'Common.Bookings',
                permissions: [
                    { id: 'delete_all_bookings', labelKey: 'Setting.DeleteAllBookings' },
                    { id: 'delete_own_bookings', labelKey: 'Setting.DeleteOwnBookings' },
                    { id: 'reschedule_all_bookings', labelKey: 'Setting.RescheduleAllBookings' },
                    { id: 'reschedule_own_bookings', labelKey: 'Setting.RescheduleOwnBookings' },
                ],
            },
            {
                id: 'cancellation_offer',
                labelKey: 'Setting.CancellationOffer',
                permissions: [
                    { id: 'crud_cancellation_offer', labelKey: 'Setting.Create/edit/deleteCancellationOffer' },
                ],
            },
            {
                id: 'notifications',
                labelKey: 'Calendar.Notifications',
                permissions: [
                    { id: 'read_own_notification', labelKey: 'Setting.ReadOwnNoti' },
                    { id: 'read_all_notification', labelKey: 'Setting.ReadAllNoti' },
                ],
            },
        ],
    },
    {
        id: 'customers',
        labelKey: 'Common.Customers',
        subDomains: [
            {
                id: 'customers',
                labelKey: 'Common.Customers',
                permissions: [
                    { id: 'create_customers', labelKey: 'Setting.CreateCustomers' },
                    { id: 'edit_customers', labelKey: 'Setting.EditCustomers' },
                    { id: 'delete_customers', labelKey: 'Setting.DeleteCustomers' },
                ],
            },
            {
                id: 'journal',
                labelKey: 'Setting.Journal',
                permissions: [
                    { id: 'create_journals', labelKey: 'Setting.CreateJournals' },
                    { id: 'edit_all_journals', labelKey: 'Setting.EditAllJournals' },
                    { id: 'edit_own_journals', labelKey: 'Setting.EditOwnJournals' },
                    { id: 'view_all_journals', labelKey: 'Setting.ViewAllJournals' },
                    { id: 'view_own_journals', labelKey: 'Setting.ViewOnlyOwnJournals' },
                ],
            },
        ],
    },
    {
        id: 'checkout_pos',
        labelKey: 'Setting.Checkout/POS',
        permissions: [{ id: 'view_pos', labelKey: 'Setting.ViewPOS' }],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — flatten/check domain permissions without touching API payload shape
// ─────────────────────────────────────────────────────────────────────────────

/** All permission keys inside a single domain */
const domainKeys = (domain) => {
    if (domain.subDomains?.length) {
        return domain.subDomains.flatMap((sd) => sd.permissions.map((p) => p.id));
    }
    if (domain.permissions?.length) {
        return domain.permissions.map((p) => p.id);
    }
    return [];
};
/** All permission keys inside a single sub-domain */
const subDomainKeys = (subDomain) => subDomain?.permissions?.map((p) => p.id);

/** True if every key in `keys` is true in permission object */
const allTrue = (permission, keys) => keys.every((k) => permission[k]);

/** True if at least one key in `keys` is true */
const someTrue = (permission, keys) => keys.some((k) => permission[k]);

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: PermissionRow
// ─────────────────────────────────────────────────────────────────────────────
const PermissionRow = ({ label, checked, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 1 }}>
        <FSwitch
            checked={!!checked}
            onChange={(e, val) => onChange(val)}
            sx={{
                '& .MuiSwitch-switchBase': {
                    '&.Mui-checked': { color: '#fff' },
                    '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#44B904' },
                },
                '& .MuiSwitch-track': { backgroundColor: '#D9D9D9' },
            }}
        />
        <Typography sx={{ fontWeight: 400, color: '#1F1F1F', fontSize: 14 }}>{label}</Typography>
    </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: SubDomainSection
// ─────────────────────────────────────────────────────────────────────────────
const SubDomainSection = ({ subDomain, permission, onToggleSubDomain, onTogglePermission }) => {
    const keys = subDomainKeys(subDomain);
    const masterChecked = allTrue(permission, keys);
    const indeterminate = !masterChecked && someTrue(permission, keys);

    return (
        <Box
            sx={{
                mb: 2,
                border: '1px solid #EFEFEF',
                borderRadius: '12px',
                overflow: 'hidden',
            }}
        >
            {/* Sub-domain header with master toggle */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1,
                    bgcolor: '#F9F9F9',
                    borderBottom: '1px solid #EFEFEF',
                }}
            >
                <Typography sx={{ fontWeight: 600, color: '#1F1F1F', fontSize: 14, textTransform: 'capitalize' }}>
                    {t(subDomain.labelKey)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {indeterminate && (
                        <Typography sx={{ fontSize: 11, color: '#A0A0A0', textTransform: 'capitalize' }}>
                            {t('Setting.Partial')}
                        </Typography>
                    )}
                    <FSwitch
                        checked={masterChecked}
                        onChange={(e, val) => onToggleSubDomain(keys, val)}
                        sx={{
                            '& .MuiSwitch-switchBase': {
                                '&.Mui-checked': { color: '#fff' },
                                '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#44B904' },
                            },
                            '& .MuiSwitch-track': {
                                backgroundColor: indeterminate ? '#FFB74D' : '#D9D9D9',
                            },
                        }}
                    />
                </Box>
            </Box>

            {/* Individual permission rows */}
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                {subDomain?.permissions?.map((perm) => (
                    <PermissionRow
                        key={perm.id}
                        label={t(perm.labelKey)}
                        checked={permission[perm.id]}
                        onChange={(val) => onTogglePermission(perm.id, val)}
                    />
                ))}
            </Box>
        </Box>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: DomainAccordion
// ─────────────────────────────────────────────────────────────────────────────
const DomainAccordion = ({ domain, permission, onToggleDomain, onToggleSubDomain, onTogglePermission }) => {
    const keys = domainKeys(domain);
    const masterChecked = allTrue(permission, keys);
    const indeterminate = !masterChecked && someTrue(permission, keys);

    return (
        <Accordion
            disableGutters
            elevation={0}
            sx={{
                border: '1px solid #D9D9D9',
                borderRadius: '15px !important',
                mb: 1,
                '&:before': { display: 'none' },
                overflow: 'hidden',
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    bgcolor: '#FAFAFA',
                    borderRadius: '15px',
                    '& .MuiAccordionSummary-content': {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mr: 1,
                    },
                }}
            >
                {/* Domain title */}
                <Typography sx={{ fontWeight: 700, color: '#1F1F1F', fontSize: 15, textTransform: 'capitalize' }}>
                    {t(domain.labelKey)}
                </Typography>

                {/* Domain-level master toggle — stop propagation so accordion doesn't toggle */}
                <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {indeterminate && (
                        <Typography sx={{ fontSize: 11, color: '#A0A0A0', textTransform: 'capitalize' }}>
                            {t('Setting.Partial')}
                        </Typography>
                    )}
                    <FSwitch
                        checked={masterChecked}
                        onChange={(e, val) => onToggleDomain(keys, val)}
                        sx={{
                            '& .MuiSwitch-switchBase': {
                                '&.Mui-checked': { color: '#fff' },
                                '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#44B904' },
                            },
                            '& .MuiSwitch-track': {
                                backgroundColor: indeterminate ? '#FFB74D' : '#D9D9D9',
                            },
                        }}
                    />
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2 }}>
                {domain?.subDomains?.length > 0 ? (
                    domain.subDomains.map((subDomain) => (
                        <SubDomainSection
                            key={subDomain.id}
                            subDomain={subDomain}
                            permission={permission}
                            onToggleSubDomain={onToggleSubDomain}
                            onTogglePermission={onTogglePermission}
                        />
                    ))
                ) : domain?.permissions?.length > 0 ? (
                    <Box sx={{ px: 2, pt: 0.5, pb: 0.5 }}>
                        {domain.permissions.map((perm) => (
                            <PermissionRow
                                key={perm.id}
                                label={t(perm.labelKey)}
                                checked={permission[perm.id]}
                                onChange={(val) => onTogglePermission(perm.id, val)}
                            />
                        ))}
                    </Box>
                ) : null}
            </AccordionDetails>
        </Accordion>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL FLAT PERMISSION OBJECT (includes all new keys defaulting to false)
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_PERMISSION = {
    // existing keys
    change_permissions: false,
    create_employee: false,
    crud_special_offers: false,
    view_special_offers: false,
    crud_services: false,
    view_service_list: false,
    change_department: false,
    create_department: false,
    view_insights: false,
    waiting_list: false,
    upload_pictures: false,
    edit_about_us: false,
    change_all_calender_interval: false,
    change_own_calender_interval: false,
    change_all_opening_hours: false,
    change_own_opening_hours: false,
    view_all_employees: false,
    delete_all_bookings: false,
    delete_own_bookings: false,
    reschedule_all_bookings: false,
    reschedule_own_bookings: false,
    crud_cancellation_offer: false,
    read_own_notification: false,
    read_all_notification: false,
    create_customers: false,
    edit_customers: false,
    delete_customers: false,
    create_journals: false,
    edit_all_journals: false,
    edit_own_journals: false,
    view_all_journals: false,
    view_own_journals: false,
    // ── new keys ──
    crud_deposit: false,
    view_deposit: false,
    crud_health_declaration: false,
    view_health_declaration: false,
    crud_advanced_reminder: false,
    view_advanced_reminder: false,
    view_pos: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const EmployeeSettingsOptionBeta = () => {
    const user = useSelector((state) => state.user.data);
    const settingsSelector = useSelector((state) => state.settings.data);
    const dispatch = useDispatch();
    const isInspectionEnabled = settingsSelector?.profile?.inspection_module;

    const empOptions = settingsSelector?.employees?.map((emp) => ({
        value: emp?.id,
        label: `${emp?.name} ${emp?.role === 'DOCTOR' ? `(${emp?.role})` : ''}`,
    }));

    // ── State ──────────────────────────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [enableSave, setEnableSave] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serviceGroups, setServiceGroups] = useState([]);
    const [assignSelectedEmployee, setAssignSelectedEmployee] = useState(empOptions[0]?.value);

    const [initialValues, setInitialValues] = useState({
        id: null,
        name: '',
        phone: '',
        accessCode: '',
        journalAccess: false,
        image: '',
        role: '',
        employeeId: null,
        allPermission: false,
        permission: { ...INITIAL_PERMISSION },
        selectedEmployee: { id: null, name: '', phone: '', accessCode: '', journalAccess: false, image: '', role: '' },
        auto_sms_employee_before_hours:
            settingsSelector?.OnlineBooking?.inspection_module?.auto_sms_employee_before_hours || 'NO_SMS',
    });

    // ── React Hook Form (service assignment — unchanged) ───────────────────
    const { control, watch, setValue } = useForm({ defaultValues: { services: [] } });
    const { append, remove, update } = useFieldArray({ control, name: 'services' });
    const [initialServices, setInitialServices] = useState([]);
    const servicesSelected = watch('services');

    const normalize = (arr = []) =>
        arr
            .map((s) => ({ serviceId: s?.serviceId, employeePrice: Number(s?.employeePrice) }))
            .sort((a, b) => a.serviceId - b.serviceId);
    const serviceDirty = !_.isEqual(normalize(initialServices), normalize(servicesSelected));

    // ── Formik ─────────────────────────────────────────────────────────────
    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        onSubmit: async (values) => {
            if (enableSave) {
                await updatePermissionAPI(values);
                await updateInspectionModuleAPI(values);
            }
            if (serviceDirty) {
                await handleServiceAssign();
            }
        },
    });

    // ── API: get employees ─────────────────────────────────────────────────
    const getEmployees = async () => {
        try {
            const response = await apiFetcher.get('/api/v1/store/employee/get');
            const { success, data } = response.data;
            if (success && data) {
                let dataValue = data.map((dataObj) => {
                    let newObj = { ...JSON.parse(JSON.stringify(dataObj)) };
                    const permission = { ...newObj.settings };
                    delete newObj.settings;
                    return {
                        ...newObj,
                        label: `${newObj?.name} ${newObj?.role === 'DOCTOR' ? `(${newObj?.role})` : ''}`,
                        value: newObj?.id,
                        permission,
                        selectedEmployee: false,
                    };
                });
                dataValue = dataValue.filter((d) => d?.id !== user?.id);
                setEmployees(dataValue);

                if (data.length > 0) {
                    let foundEmployee = dataValue[0];
                    if (formik.values?.id) {
                        foundEmployee = dataValue.find((e) => e.id == formik.values.id) || dataValue[0];
                    }

                    const mergedPermission = { ...INITIAL_PERMISSION, ...foundEmployee.permission };
                    const allPermission = Object.values(mergedPermission).every(Boolean);

                    const empData = {
                        ...foundEmployee,
                        permission: mergedPermission,
                        selectedEmployee: {
                            id: null,
                            name: '',
                            phone: '',
                            accessCode: '',
                            journalAccess: false,
                            image: '',
                            role: '',
                        },
                        allPermission,
                        auto_sms_employee_before_hours:
                            settingsSelector?.OnlineBooking?.inspection_module?.auto_sms_employee_before_hours ||
                            'NO_SMS',
                    };
                    formik.setValues(empData);
                    setInitialValues(empData);
                }
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error('err', err);
        }
    };

    // ── API: update permissions ────────────────────────────────────────────
    const updatePermissionAPI = async (value) => {
        try {
            const { id, permission } = value;
            // payload is still flat — API unchanged
            const payload = { ...permission };
            const response = await apiFetcher.patch(`/api/v1/store/employee/setting/${id}`, payload);
            if (response.data?.success) {
                toast.success(t('Setting.PermissionsUpdated'));
                setInitialValues(formik.values);
                getEmployees();
            }
            setEnableSave(false);
            formik.setSubmitting(false);
        } catch (err) {
            toast.error(t('Setting.FailedToUpdatePermission'));
            console.error('err', err);
            formik.setSubmitting(false);
        }
    };

    // ── API: update inspection module ──────────────────────────────────────
    const updateInspectionModuleAPI = async (values) => {
        try {
            const settingsPayload = {
                ...settingsSelector?.OnlineBooking,
                inspection_module: {
                    ...settingsSelector?.OnlineBooking?.inspection_module,
                    auto_sms_employee_before_hours:
                        values?.auto_sms_employee_before_hours === 'NO_SMS'
                            ? 0
                            : values?.auto_sms_employee_before_hours,
                },
            };
            await apiFetcher.patch('/api/v1/store/outlet/setting', {
                settings: [
                    {
                        settingCategory: 'outlet',
                        settingName: 'OnlineBooking',
                        value: JSON.stringify(settingsPayload),
                        type: 'JSON',
                    },
                ],
            });
            setEnableSave(false);
            dispatch(settingsSlice({ ...settingsSelector, OnlineBooking: settingsPayload }));
        } catch (err) {
            toast.error(t('Setting.FailedToUpdatePermission'));
            console.error('err', err);
        } finally {
            formik.setSubmitting(false);
        }
    };

    // ── API: create/update employee ────────────────────────────────────────
    const createUpdateEmployee = async (values) => {
        setEditEmployee(false);
        try {
            let payload = { ...values };
            delete payload.id;
            delete payload.image;
            const formdata = new FormData();
            formdata.append('req_body', JSON.stringify(payload));
            if (values?.image != null && typeof values?.image === 'object') {
                formdata.append('image', values?.image);
            }
            if (values.id) {
                await apiFetcher.patch(`/api/v1/store/employee/${values?.id}`, formdata, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await CreateEmployeeApi({ formdata });
            }
            formik.setSubmitting(false);
            getEmployees();
            setEditEmployee(null);
            toast.success(values?.id ? t('Setting.EmployeeUpdated') : t('Setting.EmployeeCreated'));
        } catch (err) {
            toast.error(values?.id ? t('Setting.FailedToUpdateEmployee') : t('Setting.FailedToCreateEmployee'));
            console.error('err', err);
            setEditEmployee(null);
            formik.setSubmitting(false);
        }
    };

    // ── API: delete employee ───────────────────────────────────────────────
    const deleteEmployee = async (values) => {
        setShowDeleteModal(false);
        try {
            await DeleteEmployeeApi({ id: values?.id });
            getEmployees();
            toast.success(t('Setting.EmployeeDeleted'));
            setEditEmployee(null);
        } catch (err) {
            toast.error(t('Setting.FailedToDeleteEmployee'));
            setEditEmployee(null);
        }
    };

    // ── Employee select change ─────────────────────────────────────────────
    const handleChangeSelectedEmployee = (event) => {
        const foundEmployee = employees.find((e) => e.id == event.target.value);
        if (!foundEmployee) return;

        const mergedPermission = { ...INITIAL_PERMISSION, ...foundEmployee.permission };
        const allPermission = Object.values(mergedPermission).every(Boolean);

        const next = {
            ...foundEmployee,
            permission: mergedPermission,
            selectedEmployee: {
                id: null,
                name: '',
                phone: '',
                accessCode: '',
                journalAccess: false,
                image: '',
                role: '',
            },
            allPermission,
            auto_sms_employee_before_hours:
                settingsSelector?.OnlineBooking?.inspection_module?.auto_sms_employee_before_hours || 'NO_SMS',
        };
        formik.setValues(next);
        setInitialValues(next);
    };

    // ── Effects ────────────────────────────────────────────────────────────
    useEffect(() => {
        setLoading(true);
        getEmployees();
        fetchServices();
    }, []);

    useEffect(() => {
        if (!assignSelectedEmployee || !serviceGroups?.length) return;
        const allServices = serviceGroups.flatMap((g) => g?.services || []);
        const preAssigned = allServices
            .filter((s) => s?.employees?.some((e) => e?.id === assignSelectedEmployee))
            .map((s) => {
                const emp = s.employees.find((e) => e?.id === assignSelectedEmployee);
                return { serviceId: s?.id, employeePrice: Number(emp?.price ?? s?.price) };
            });
        setValue('services', preAssigned);
        setInitialServices(_.cloneDeep(preAssigned));
    }, [assignSelectedEmployee, serviceGroups]);

    useEffect(() => {
        const initialValuesData = {
            ...initialValues?.permission,
            auto_sms_employee_before_hours: initialValues?.auto_sms_employee_before_hours,
        };
        const formikValuesData = {
            ...formik.values?.permission,
            auto_sms_employee_before_hours: formik.values?.auto_sms_employee_before_hours,
        };
        setEnableSave(!_.isEqual(initialValuesData, formikValuesData));
    }, [formik.values]);

    // ── Permission toggle handlers ─────────────────────────────────────────

    /** Toggle every key in a flat list */
    const handleToggleDomain = (keys, value) => {
        const next = { ...formik.values.permission };
        keys.forEach((k) => {
            next[k] = value;
        });
        formik.setFieldValue('permission', next);
        recalcAllPermission(next);
    };

    /** Same as domain toggle but scoped to sub-domain */
    const handleToggleSubDomain = (keys, value) => {
        handleToggleDomain(keys, value);
    };

    /** Toggle a single permission key */
    const handleTogglePermission = (id, value) => {
        const next = { ...formik.values.permission, [id]: value };
        formik.setFieldValue('permission', next);
        recalcAllPermission(next);
    };

    /** Global "All permissions" toggle */
    const setAllPermission = (value) => {
        const next = {};
        Object.keys(formik.values.permission).forEach((k) => {
            next[k] = value;
        });
        formik.setFieldValue('permission', next);
        formik.setFieldValue('allPermission', value);
    };

    const recalcAllPermission = (permission) => {
        const allOn = Object.values(permission).every(Boolean);
        formik.setFieldValue('allPermission', allOn);
    };

    // ── Services ───────────────────────────────────────────────────────────
    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await GetServiceGroup();
            setServiceGroups(response?.data?.data || []);
        } catch (error) {
            console.error('Error : ', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleService = (service, checked) => {
        const index = servicesSelected?.findIndex((s) => s?.serviceId === service?.id);
        if (checked) {
            const emp = service?.employees?.find((e) => e?.id === assignSelectedEmployee);
            append({ serviceId: service?.id, employeePrice: Number(emp?.price ?? service.price) });
        } else {
            remove(index);
        }
    };

    const handleServiceAssign = async () => {
        try {
            const response = await api.putApiServicesEmployeeAssignEmployeeId(assignSelectedEmployee, {
                services: servicesSelected,
            });
            if (response || response?.success === true) {
                setEnableSave(false);
                setInitialServices(_.cloneDeep(servicesSelected));
                toast.success(t('Setting.ServiceAssignSucc'));
                await fetchServices();
            }
        } catch (error) {
            console.error('Error : ', error);
            toast.error(t('Common.ToastWrong'));
        } finally {
            setLoading(false);
        }
    };

    // ── Guard ──────────────────────────────────────────────────────────────
    if (!user?.settings.view_all_employees && user.role !== 'ADMIN') {
        return <Notauthorized />;
    }

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <form onSubmit={formik.handleSubmit}>
            {/* Sticky save bar */}
            {(enableSave || serviceDirty) && (
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
                        alignItems: 'flex-end',
                        width: '100%',
                    }}
                >
                    <FButton
                        onClick={formik.handleSubmit}
                        width="auto"
                        ml="auto"
                        height={40}
                        variant="save"
                        title={
                            formik.isSubmitting ? (
                                <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                    <CircularProgress size={20} color="inherit" />
                                    {t('POS.Processing')}
                                </Stack>
                            ) : (
                                t('Setting.SaveChanges')
                            )
                        }
                        disabled={formik.isSubmitting}
                        sx={{ bgcolor: formik.isSubmitting ? '#d2d2d2' : undefined }}
                    />
                </AppBar>
            )}

            <Stack p={{ xs: 2, md: 2 }}>
                <Stack spacing={6} sx={{ bgcolor: '#fff', borderRadius: '25px', minHeight: '86vh' }}>
                    {/* ── Section: Employees list ── */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Common.Employees')} />
                            <SecondaryHeading text={t('Setting.Description11')} />
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 6 }}>
                            {loading ? (
                                <Stack width="60%" spacing={1}>
                                    {[...Array(7)].map((_, i) => (
                                        <Skeleton key={i} variant="rounded" width="100%" height={48} />
                                    ))}
                                </Stack>
                            ) : (
                                employees.map((employee, index) => (
                                    <Stack
                                        key={index}
                                        flex={1}
                                        flexDirection="row"
                                        px={2}
                                        py={1}
                                        sx={{
                                            width: '100%',
                                            margin: '5px 0',
                                            borderRadius: '15px',
                                            border: '1px solid #D9D9D9',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Stack
                                            flex={1}
                                            flexDirection="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Typography style={{ width: '100%', size: '20px', color: '#A0A0A0' }}>
                                                {employee?.name} {employee?.role === 'DOCTOR' && `(${employee?.role})`}
                                            </Typography>
                                            {user.role === 'ADMIN' && (
                                                <Stack
                                                    flex={1}
                                                    flexDirection="row"
                                                    justifyContent="flex-end"
                                                    alignItems="center"
                                                >
                                                    <IconButton
                                                        onClick={() => {
                                                            setEditEmployee(employee);
                                                            setShowModal(true);
                                                        }}
                                                        sx={{
                                                            background: '#fff',
                                                            border: 'none',
                                                            height: 28,
                                                            width: 28,
                                                            borderRadius: '50%',
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <img src={PencnlIconImg} alt="Edit" height={22} width={22} />
                                                    </IconButton>
                                                    {user?.id !== employee?.id && employee?.role !== 'ADMIN' && (
                                                        <IconButton
                                                            onClick={() => {
                                                                setEditEmployee(employee);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            sx={{
                                                                background: '#fff',
                                                                border: 'none',
                                                                marginLeft: 1,
                                                                borderRadius: '50%',
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <img src={DeleteIconImg} alt="Delete" width={18} />
                                                        </IconButton>
                                                    )}
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Stack>
                                ))
                            )}

                            {(user?.settings.create_employee || user.role === 'ADMIN') && (
                                <Stack
                                    flex={1}
                                    onClick={() => {
                                        setEditEmployee(null);
                                        setShowModal(true);
                                    }}
                                    flexDirection="row"
                                    py={1}
                                    px={2}
                                    sx={{
                                        width: '100%',
                                        borderRadius: '15px',
                                        border: '1px solid #D9D9D9',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        maxHeight: 40,
                                    }}
                                >
                                    <Typography sx={{ size: '20px', color: '#A0A0A0', mr: 'auto' }}>
                                        {t('Setting.NewEmployee')}
                                    </Typography>
                                </Stack>
                            )}
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ ...dividerSx }} />

                    {/* ── Section: Permissions (domain accordion tree) ── */}
                    {user?.role === 'ADMIN' && (
                        <Grid2 container spacing={3} sx={{ py: 2, px: { xs: 2, md: 5 } }}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.Permissions')} />
                                <SecondaryHeading text={t('Setting.Description12')} />
                            </Grid2>

                            <Grid2 container spacing={2} size={{ xs: 12, md: 8 }}>
                                {/* Employee selector */}
                                <Grid2 size={12}>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                        {t('Common.SelectEmployee')}
                                    </Typography>
                                    <FSelect
                                        value={formik?.values?.id || 0}
                                        onChange={handleChangeSelectedEmployee}
                                        options={employees}
                                        sx={{
                                            width: { xs: '100%', md: '30%' },
                                            mt: 1,
                                            '& .MuiTypography-root': {
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            },
                                        }}
                                    />
                                </Grid2>

                                {/* Global all-permissions toggle */}
                                <Grid2 size={12}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            px: 2,
                                            py: 1.5,
                                            border: '1px solid #D9D9D9',
                                            borderRadius: '15px',
                                            bgcolor: '#FAFAFA',
                                            mb: 1,
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                            {t('Setting.AllPermissions')}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontWeight: 400, color: '#1F1F1F', fontSize: 13 }}>
                                                {t('Setting.GrantAllPermissions')}
                                            </Typography>
                                            <FSwitch
                                                id="allPermission"
                                                checked={formik.values.allPermission}
                                                onChange={(e, value) => setAllPermission(value)}
                                            />
                                        </Box>
                                    </Box>
                                </Grid2>

                                {/* Domain accordions */}
                                {PERMISSION_DOMAINS.map((domain, index) => (
                                    <Grid2 size={{ xs: 12, md: 6 }} key={`${domain.id}-${index}`}>
                                        <DomainAccordion
                                            key={`${domain.id}-${index}`}
                                            domain={domain}
                                            permission={formik.values.permission}
                                            onToggleDomain={handleToggleDomain}
                                            onToggleSubDomain={handleToggleSubDomain}
                                            onTogglePermission={handleTogglePermission}
                                        />
                                    </Grid2>
                                ))}
                            </Grid2>
                        </Grid2>
                    )}

                    {/* ── Section: Inspection module ── */}
                    {isInspectionEnabled && (
                        <React.Fragment>
                            <Divider sx={{ ...dividerSx }} />
                            <Grid2 container sx={{ p: { xs: 2, md: 5 } }}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.AutoSmsEmployeeBeforeHours')} />
                                    <SecondaryHeading text={t('Setting.AutoSmsEmployeeBeforeHoursDescription')} />
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 8 }} sx={{ px: 2 }}>
                                    <FPrimaryHeading text={t('Setting.AutoSmsEmployeeBeforeHours')} fontSize={16} />
                                    <FSelect
                                        id="auto_sms_employee_before_hours"
                                        value={formik.values?.auto_sms_employee_before_hours || 'NO_SMS'}
                                        onChange={(e) =>
                                            formik.setFieldValue('auto_sms_employee_before_hours', e.target.value)
                                        }
                                        options={[
                                            { value: 'NO_SMS', label: t('Setting.NoSms') },
                                            { value: 360, label: `6 ${t('Statistics.Hours')}` },
                                            { value: 720, label: `12 ${t('Statistics.Hours')}` },
                                            { value: 1440, label: `24 ${t('Statistics.Hours')}` },
                                            { value: 2880, label: `48 ${t('Statistics.Hours')}` },
                                        ]}
                                        sx={{ width: { xs: '100%', md: '30%' }, mt: 1 }}
                                        showPlaceHolder={false}
                                    />
                                </Grid2>
                            </Grid2>
                        </React.Fragment>
                    )}

                    {/* ── Section: Service assignment (unchanged) ── */}
                    <React.Fragment>
                        <Divider sx={{ ...dividerSx }} />
                        <Grid2 container sx={{ p: { xs: 1, md: 5 } }}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.ServiceAssign')} />
                                <SecondaryHeading text={t('Setting.ServiceAssignDescription')} />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 8 }} sx={{ px: { xs: 0, sm: 2 } }}>
                                <Stack mt={{ xs: 2, sm: 0 }}>
                                    <FPrimaryHeading text={t('Common.SelectEmployee')} fontSize={16} />
                                    <FSelect
                                        id="serviceAssign.employee_id"
                                        value={assignSelectedEmployee}
                                        onChange={(e) => {
                                            const found = empOptions?.find((emp) => emp?.value === e?.target?.value);
                                            setAssignSelectedEmployee(found?.value);
                                        }}
                                        options={empOptions}
                                        sx={{ width: { xs: '100%', md: '30%' }, mt: 1 }}
                                    />
                                </Stack>

                                {assignSelectedEmployee && (
                                    <Stack marginTop={2}>
                                        {serviceGroups?.length === 0 && (
                                            <>
                                                {[...Array(5)].map((_, i) => (
                                                    <Skeleton key={i} animation="wave" height={60} />
                                                ))}
                                            </>
                                        )}
                                        {serviceGroups.map((group, index) => {
                                            const isUngrouped = group?.group === 'Ungrouped services';
                                            const hasServices = group?.services && group.services.length > 0;
                                            if (!isUngrouped && !hasServices) return null;
                                            return (
                                                <Stack key={group?.id} mb={2}>
                                                    <Stack
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: { xs: 'column', sm: 'row' },
                                                            alignItems: 'center',
                                                            gap: 2,
                                                            mb: { xs: index === 0 ? 2 : 0, sm: 1 },
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{
                                                                fontWeight: 700,
                                                                mb: 1,
                                                                width: { xs: '100%', sm: '33.33%' },
                                                            }}
                                                        >
                                                            {isUngrouped
                                                                ? t('Setting.UngroupedServices')
                                                                : group?.group}
                                                        </Typography>
                                                        {index === 0 && hasServices && (
                                                            <React.Fragment>
                                                                <Typography
                                                                    variant="subtitle1"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        mb: 1,
                                                                        width: { xs: '100%', sm: '50%' },
                                                                        display: { xs: 'none', sm: 'flex' },
                                                                        ml: 1,
                                                                    }}
                                                                >
                                                                    {t('Setting.ServicePrice')}
                                                                </Typography>
                                                                <Typography
                                                                    variant="subtitle1"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        mb: 1,
                                                                        display: { xs: 'none', sm: 'flex' },
                                                                        width: { xs: '100%', sm: '15%' },
                                                                        alignItems: 'flex-end',
                                                                        justifyContent: 'flex-end',
                                                                        gap: 6,
                                                                        px: 4,
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                >
                                                                    <span>{t('Setting.EmployeePrice')}</span>
                                                                    <Tooltip title={t('Setting.AssignTooltip')} arrow>
                                                                        {t('Setting.Assign')}
                                                                    </Tooltip>
                                                                </Typography>
                                                            </React.Fragment>
                                                        )}
                                                    </Stack>

                                                    {hasServices &&
                                                        group.services.map((service) => {
                                                            const idx = servicesSelected.findIndex(
                                                                (s) => s?.serviceId === service?.id,
                                                            );
                                                            const selected = idx !== -1;
                                                            return (
                                                                <Stack
                                                                    key={service?.id}
                                                                    sx={{
                                                                        border: '1px solid #d9d9d9',
                                                                        borderRadius: '12px',
                                                                        flexDirection: { xs: 'column', sm: 'row' },
                                                                        gap: { xs: 0, sm: 2 },
                                                                        mb: { xs: 2, sm: 1 },
                                                                        px: 2,
                                                                        alignItems: 'center',
                                                                    }}
                                                                >
                                                                    <Stack
                                                                        direction="row"
                                                                        sx={{
                                                                            width: '100%',
                                                                            justifyContent: {
                                                                                xs: 'space-between',
                                                                                sm: 'flex-between',
                                                                            },
                                                                            mt: { xs: 1, sm: 0 },
                                                                            gap: { sm: 2 },
                                                                            alignItems: 'flex-start',
                                                                        }}
                                                                    >
                                                                        <Stack
                                                                            sx={{
                                                                                width: { xs: '70%', sm: '50%' },
                                                                                color: '#1a1a1a',
                                                                                fontSize: 16,
                                                                                fontWeight: 500,
                                                                                overflow: 'hidden',
                                                                                display: '-webkit-box',
                                                                                WebkitBoxOrient: 'vertical',
                                                                                WebkitLineClamp: 2,
                                                                                textOverflow: 'ellipsis',
                                                                                wordBreak: 'break-all',
                                                                            }}
                                                                        >
                                                                            {service?.name}
                                                                        </Stack>
                                                                        <Stack
                                                                            sx={{
                                                                                width: { xs: '25%', sm: '15%' },
                                                                                textAlign: 'right',
                                                                                flexShrink: 0,
                                                                                marginRight: { xs: 0, sm: 5 },
                                                                                color: '#666666',
                                                                                fontSize: 14,
                                                                                fontWeight: 500,
                                                                            }}
                                                                        >
                                                                            {formatCurrency(service?.price)}
                                                                        </Stack>
                                                                    </Stack>

                                                                    <FPrimaryHeading
                                                                        text={t('Setting.EmployeePrice')}
                                                                        sx={{
                                                                            fontSize: 14,
                                                                            display: { xs: 'block', sm: 'none' },
                                                                            fontWeight: 600,
                                                                            textAlign: 'left',
                                                                            width: '100%',
                                                                            mt: 2,
                                                                        }}
                                                                    />

                                                                    <Stack
                                                                        direction="row"
                                                                        alignItems="center"
                                                                        gap={2}
                                                                        sx={{
                                                                            width: '100%',
                                                                            justifyContent: {
                                                                                xs: 'space-between',
                                                                                sm: 'flex-end',
                                                                            },
                                                                        }}
                                                                    >
                                                                        <FTextInput
                                                                            value={
                                                                                selected
                                                                                    ? Number(
                                                                                          servicesSelected[idx]
                                                                                              ?.employeePrice,
                                                                                      ) || 0
                                                                                    : service?.price
                                                                            }
                                                                            onChange={(e) => {
                                                                                const raw = e.target.value.replace(
                                                                                    /[^\d.]/g,
                                                                                    '',
                                                                                );
                                                                                const value =
                                                                                    raw === '' ? 0 : Number(raw);
                                                                                if (idx === -1) return;
                                                                                update(idx, {
                                                                                    ...servicesSelected[idx],
                                                                                    employeePrice: value,
                                                                                });
                                                                            }}
                                                                            disabled={!selected}
                                                                            width={{ xs: '100px', sm: 150 }}
                                                                            sx={{
                                                                                marginTop: { xs: 0, sm: '6px' },
                                                                                marginBottom: '6px',
                                                                            }}
                                                                            slotProps={{
                                                                                input: {
                                                                                    endAdornment: (
                                                                                        <InputAdornment position="end">
                                                                                            <Typography variant="body2">
                                                                                                {t('POS.Currency')}
                                                                                            </Typography>
                                                                                        </InputAdornment>
                                                                                    ),
                                                                                },
                                                                            }}
                                                                        />
                                                                        <FSwitch
                                                                            checked={selected}
                                                                            onChange={(e, checked) =>
                                                                                handleToggleService(service, checked)
                                                                            }
                                                                        />
                                                                    </Stack>
                                                                </Stack>
                                                            );
                                                        })}
                                                </Stack>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Grid2>
                        </Grid2>
                    </React.Fragment>

                    {/* ── Modals ── */}
                    {showModal && (
                        <EmployeeModel
                            open={showModal}
                            data={editEmployee}
                            handleRemove={() => {
                                setShowModal(false);
                                setShowDeleteModal(true);
                            }}
                            setData={(data) => createUpdateEmployee(data)}
                            onClose={() => setShowModal(!showModal)}
                        />
                    )}
                    {showDeleteModal && (
                        <CustomDeleteModal
                            open={showDeleteModal}
                            handleClose={() => setShowDeleteModal(false)}
                            description={
                                <>
                                    {t('Setting.AreYouSureYouWantToDelete')}
                                    <span
                                        style={{ marginLeft: 5, color: '#1F1F1F', fontWeight: 'bold', marginRight: 5 }}
                                    >
                                        {editEmployee?.name}
                                    </span>
                                </>
                            }
                            onClickDismiss={() => setShowDeleteModal(false)}
                            onClickConfirm={() => deleteEmployee(editEmployee)}
                        />
                    )}
                </Stack>
            </Stack>
        </form>
    );
};

export default EmployeeSettingsOptionBeta;
