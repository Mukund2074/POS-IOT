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
} from '@mui/material';

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
import { getEmployeePermissionMapper, getEmployeePermissionsDefault } from './employee-permission-mapper';
import { Masonry } from '@mui/lab';
import { Link } from 'react-router-dom';
import { InfoOutlined } from '@mui/icons-material';

const EmployeeSettingsOption = () => {
    const user = useSelector((state) => state.user.data);
    const settingsSelector = useSelector((state) => state.settings.data);
    const dispatch = useDispatch();
    const isInspectionEnabled = settingsSelector?.profile?.inspection_module;
    const empOptions = settingsSelector?.employees?.map((emp) => {
        return { value: emp?.id, label: `${emp?.name} ${emp?.role === 'DOCTOR' ? `(${emp?.role})` : ''}` };
    });

    const employeePermissionMapper = getEmployeePermissionMapper({ t });
    const defaultPermissions = getEmployeePermissionsDefault({ t, value: false });

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
        permission: defaultPermissions || {},
        selectedEmployee: {
            id: null,
            name: 'test',
            phone: '123123',
            accessCode: '23432',
            journalAccess: false,
            image: '',
            role: '',
        },
        // inspection_module Settings For Employee
        auto_sms_employee_before_hours:
            settingsSelector?.OnlineBooking?.inspection_module?.auto_sms_employee_before_hours || 'NO_SMS',
    });

    const { control, watch, setValue } = useForm({
        defaultValues: {
            services: [],
        },
    });

    const { append, remove, update } = useFieldArray({
        control,
        name: 'services',
    });
    const [initialServices, setInitialServices] = useState([]);
    const servicesSelected = watch('services');
    const normalize = (arr = []) =>
        arr
            .map((service) => ({
                serviceId: service?.serviceId,
                employeePrice: Number(service?.employeePrice),
            }))
            .sort((a, b) => a.serviceId - b.serviceId);
    const serviceDirty = !_.isEqual(normalize(initialServices), normalize(servicesSelected));

    const getEmployees = async () => {
        try {
            const response = await apiFetcher.get('/api/v1/store/employee/get');

            const { success, data } = response.data;
            if (success && data) {
                let dataValue = data.map((dataObj) => {
                    let newData = JSON.stringify(dataObj);
                    let newObj = { ...JSON.parse(newData) };
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

                dataValue = dataValue.filter((dataObj) => dataObj?.id !== user?.id);

                setEmployees(dataValue);
                if (data.length > 0) {
                    let foundEmployee = dataValue[0];

                    if (formik.values?.id) {
                        foundEmployee = data.find((empObj) => empObj.id == formik.values.id);
                    }

                    let allPermission = true;
                    Object.values(foundEmployee?.permission).map((settingsValue) => {
                        if (!settingsValue) {
                            allPermission = false;
                        }
                    });

                    // Root cause fix:
                    // The API may return a *partial* `settings` object (missing keys).
                    // If we keep permissions partial, toggling/saving one "view_*" key can
                    // make sibling keys appear/reset to false because they become `undefined`.
                    // Always hydrate to the full known permission shape.
                    const permission = { ...defaultPermissions, ...(foundEmployee?.permission || {}) };
                    // delete foundEmployee.settings;

                    const empData = {
                        ...foundEmployee,
                        permission,
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

    const updatePermissionAPI = async (value) => {
        try {
            const { id, permission } = value;
            // Always send the full known permission set (avoid wiping missing keys server-side).
            const payload = { ...defaultPermissions, ...(permission || {}) };
            const response = await apiFetcher.patch(`/api/v1/store/employee/setting/${id}`, payload);
            const { success } = response.data;
            if (success) {
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

            const stringifiedSettingsPayload = JSON.stringify(settingsPayload);

            await apiFetcher.patch('/api/v1/store/outlet/setting', {
                settings: [
                    {
                        settingCategory: 'outlet',
                        settingName: 'OnlineBooking',
                        value: stringifiedSettingsPayload,
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

    const createUpdateEmployee = async (values) => {
        setEditEmployee(false);
        try {
            let payload = { ...values };
            delete payload.id;
            delete payload.image;
            // delete payload.remove_image

            const formdata = new FormData();

            formdata.append('req_body', JSON.stringify(payload));

            if (values?.image != null && typeof values?.image === 'object') {
                formdata.append('image', values?.image);
            }

            if (values.id) {
                let url = `/api/v1/store/employee/${values?.id}`;
                await apiFetcher.patch(url, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // let url = "/api/v1/store/employee/";
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

    const deleteEmployee = async (values) => {
        setShowDeleteModal(false);
        try {
            // let url = `/api/v1/store/employee/${values?.id}`;
            await DeleteEmployeeApi({ id: values?.id });
            getEmployees();
            toast.success(t('Setting.EmployeeDeleted'));
            setEditEmployee(null);
        } catch (err) {
            toast.error(t('Setting.FailedToDeleteEmployee'));
            setEditEmployee(null);
        }
    };

    const handleChangeSelectedEmployee = (event) => {
        const foundEmployee = employees.find((empObj) => empObj.id == event.target.value);

        if (foundEmployee) {
            const hydratedPermission = { ...defaultPermissions, ...(foundEmployee?.permission || {}) };
            let allPermission = Object.entries(hydratedPermission).length > 0 ? true : false;
            for (const value of Object.values(hydratedPermission)) {
                if (!value) {
                    allPermission = false;
                }
            }

            formik.setValues({
                ...foundEmployee,
                permission: hydratedPermission,
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
            });

            setInitialValues({
                ...foundEmployee,
                permission: hydratedPermission,
                auto_sms_employee_before_hours:
                    settingsSelector?.OnlineBooking?.inspection_module?.auto_sms_employee_before_hours || 'NO_SMS',
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
            });
        }
        // formik.setFieldValue()
        // setSelectedEmployee(event.target.value);
    };

    // const handleClose = () => {
    //   setShowModal(false);
    //   resetForm();
    // };

    // const resetForm = () => {
    //   setEditEmployee(null);
    //   // setEmployeeId(null);
    //   // setName("");
    //   // setPhone("");
    //   // setAccessCode("");
    //   // setJournalAccess(false);
    //   // setRole("EMPLOYEE");
    //   // setImage(null);
    // };

    // const handleSave = async () => {
    //   handleClose();
    // };

    useEffect(() => {
        setLoading(true);
        getEmployees();
        fetchServices();
    }, []);

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,

        onSubmit: async (values) => {
            //   alert(JSON.stringify(values, null, 2));
            if (enableSave) {
                await updatePermissionAPI(values);
                await updateInspectionModuleAPI(values);
            }
            if (serviceDirty) {
                await handleServiceAssign();
            }
        },
    });

    const setAllPermission = (value) => {
        formik.setFieldValue('allPermission', value);

        const newPermissions = getEmployeePermissionsDefault({ t, value });
        formik.setFieldValue('permission', { ...newPermissions });
    };

    const onChangeValue = (option, checked) => {
        // Domain rule: for Customers/Services/Special offers, "view_*" is the master permission.
        // If view is turned OFF, turn OFF all permissions in the same domain.
        const VIEW_DEPENDENCIES = {
            view_customers: ['create_customers', 'edit_customers', 'delete_customers'],
            view_service_list: ['crud_services'],
            view_special_offers: ['crud_special_offers'],
        };

        let newPermission = { ...formik.values.permission, [option.id]: checked };

        const dependents = VIEW_DEPENDENCIES[option.id];
        if (dependents && checked === false) {
            dependents.forEach((depKey) => {
                newPermission[depKey] = false;
            });
        }

        // If a dependent permission is turned ON, ensure its domain "view_*" is also ON.
        const DEPENDENT_TO_VIEW = Object.entries(VIEW_DEPENDENCIES).reduce((acc, [viewKey, deps]) => {
            deps.forEach((depKey) => {
                acc[depKey] = viewKey;
            });
            return acc;
        }, {});

        const requiredView = DEPENDENT_TO_VIEW[option.id];
        if (requiredView && checked === true) {
            newPermission[requiredView] = true;
        }

        formik.setFieldValue('permission', newPermission);
        // if (!checked) {
        //   formik.setFieldValue("allPermission", checked);
        // }else{

        if (Object.values(newPermission).includes(false)) {
            formik.setFieldValue('allPermission', false);
        } else {
            formik.setFieldValue('allPermission', true);
        }
        // }
    };

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

    useEffect(() => {
        if (!assignSelectedEmployee || !serviceGroups?.length) return;

        const allServices = serviceGroups.flatMap((group) => group?.services || []);

        const preAssignedServices = allServices
            .filter((service) => service?.employees?.some((emp) => emp?.id === assignSelectedEmployee))
            .map((service) => {
                const emp = service?.employees.find((employee) => employee?.id === assignSelectedEmployee);

                return {
                    serviceId: service?.id,
                    employeePrice: Number(emp?.price ?? service?.price),
                };
            });

        setValue('services', preAssignedServices);

        setInitialServices(_.cloneDeep(preAssignedServices));
    }, [assignSelectedEmployee, serviceGroups]);

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
        const index = servicesSelected?.findIndex((ser) => ser?.serviceId === service?.id);

        if (checked) {
            const emp = service?.employees?.find((employee) => employee?.id === assignSelectedEmployee);

            append({
                serviceId: service?.id,
                employeePrice: Number(emp?.price ?? service.price),
            });
        }

        if (!checked) {
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

    if (!user?.settings.view_all_employees && user.role !== 'ADMIN') {
        return <Notauthorized />;
    }
    return (
        <form onSubmit={formik.handleSubmit}>
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
                        // justifyContent: "flex-end",
                        alignItems: 'flex-end',
                        width: '100%',
                    }}
                >
                    <FButton
                        onClick={formik.handleSubmit}
                        width="auto"
                        ml={'auto'}
                        height={40}
                        variant={'save'}
                        title={
                            formik.isSubmitting ? (
                                <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                    <CircularProgress size={20} color="inharit" />
                                    {t('POS.Processing')}
                                </Stack>
                            ) : (
                                t('Setting.SaveChanges')
                            )
                        }
                        disabled={formik.isSubmitting}
                        sx={{ bgcolor: formik.isSubmitting && '#d2d2d2' }}
                    />
                </AppBar>
            )}
            <Stack p={{ xs: 2, md: 2 }}>
                <Stack spacing={6} sx={{ bgcolor: '#fff', borderRadius: '25px', minHeight: '86vh' }}>
                    {/* Employees */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Common.Employees')} />
                            <SecondaryHeading text={t('Setting.Description11')} />
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 8 }}>
                            {loading ? (
                                <Stack width="60%" spacing={1}>
                                    {[...Array(7)].map((_, index) => (
                                        <Grid2
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '100%',
                                                gap: 4,
                                            }}
                                        >
                                            <Skeleton variant="rounded" width="100%" height={48} />
                                        </Grid2>
                                    ))}
                                </Stack>
                            ) : (
                                employees.map((employee, index) => (
                                    <Stack
                                        key={index}
                                        flex={1}
                                        flexDirection={'row'}
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
                                            sx={{ px: 0 }}
                                        >
                                            <Typography
                                                style={{
                                                    width: '100%',
                                                    size: '20px',
                                                    color: '#A0A0A0',
                                                }}
                                            >
                                                {employee?.name} {employee?.role === 'DOCTOR' && `(${employee?.role})`}
                                            </Typography>

                                            {user.role === 'ADMIN' && (
                                                <Stack
                                                    flex={1}
                                                    flexDirection={'row'}
                                                    justifyContent={'flex-end'}
                                                    alignItems={'center'}
                                                >
                                                    <IconButton
                                                        onClick={() => {
                                                            // formik.setFieldValue('selectedEmployee', employee)
                                                            setEditEmployee(employee);
                                                            setShowModal(true);
                                                        }}
                                                        sx={{
                                                            background: '#ffff',
                                                            border: 'none',
                                                            height: 28,
                                                            width: 28,
                                                            borderRadius: '50%',
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <img src={PencnlIconImg} alt="Edit" height={22} width={22} />
                                                    </IconButton>

                                                    {user?.id !== employee?.id && employee?.role != 'ADMIN' && (
                                                        <IconButton
                                                            onClick={() => {
                                                                setEditEmployee(employee);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            sx={{
                                                                background: '#ffff',
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
                                    flexDirection={'row'}
                                    // px={2}
                                    py={1}
                                    sx={{
                                        width: '100%',
                                        // margin: "5px 0",
                                        px: 2,
                                        borderRadius: '15px',
                                        border: '1px solid #D9D9D9',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        maxHeight: 40,
                                    }}
                                >
                                    {/* <Stack
                    flex={1}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  > */}
                                    <Typography
                                        sx={{
                                            // width: 400,
                                            size: '20px',
                                            color: '#A0A0A0',
                                            mr: 'auto',
                                        }}
                                    >
                                        {t('Setting.NewEmployee')}
                                    </Typography>
                                </Stack>
                                // </Stack>
                            )}
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ ...dividerSx }} />

                    {/* Permissions */}
                    {user?.role === 'ADMIN' && (
                        <Grid2 container spacing={3} sx={{ py: 2, px: { xs: 2, md: 5 } }}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.Permissions')} />
                                <SecondaryHeading text={t('Setting.Description12')} />
                            </Grid2>

                            <Grid2 container spacing={3} size={{ xs: 12, md: 8 }}>
                                {/* Employee Select */}
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

                                {/* All Permissions toggle */}
                                <Grid2 size={12}>
                                    <Box sx={{ p: 2, border: '1px solid #EFEFEF', borderRadius: '12px' }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 700, color: '#1F1F1F', mb: 1.5 }}
                                        >
                                            {t('Setting.AllPermissions')}
                                        </Typography>
                                        <FSwitch
                                            id="allPermission"
                                            checked={formik.values.allPermission}
                                            onChange={(_, value) => setAllPermission(value)}
                                            label={t('Setting.GrantAllPermissions')}
                                        />
                                    </Box>
                                </Grid2>

                                {/* ✅ Masonry layout — no more index % 2 splitting */}
                                <Grid2 size={12}>
                                    <Masonry columns={{ xs: 1, md: 2 }} spacing={2}>
                                        {Object.entries(employeePermissionMapper).map(([key, value]) => (
                                            <Box
                                                key={key}
                                                sx={{ p: 2, border: '1px solid #EFEFEF', borderRadius: '12px' }}
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: '#1F1F1F',
                                                        mb: 1.5,
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {value.label}
                                                </Typography>
                                                {value.permissions?.map((permission) => (
                                                    <Box
                                                        key={permission.id}
                                                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                                                    >
                                                        <FSwitch
                                                            id={permission.id}
                                                            checked={formik.values.permission[permission.id]}
                                                            onChange={(_, checked) =>
                                                                onChangeValue(permission, checked)
                                                            }
                                                            label={t(permission.label)}
                                                        />

                                                        {permission.extraNote && (
                                                            <Tooltip title={permission.extraNote}>
                                                                <InfoOutlined sx={{ fontSize: 16, color: 'gray' }} />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                ))}
                                                {key === 'POS' && formik.values.permission['view_pos'] === true && (
                                                    <Link to="/pos/settings">{t('Setting.DetailedPermissions')}</Link>
                                                )}
                                            </Box>
                                        ))}
                                    </Masonry>
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    )}

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
                                        id={'auto_sms_employee_before_hours'}
                                        value={formik.values?.auto_sms_employee_before_hours || 'NO_SMS'}
                                        onChange={(e) =>
                                            formik.setFieldValue('auto_sms_employee_before_hours', e.target.value)
                                        }
                                        options={[
                                            {
                                                value: 'NO_SMS',
                                                label: t('Setting.NoSms'),
                                            },
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

                    {/* Service assignment */}

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
                                        id={'serviceAssign.employee_id'}
                                        value={assignSelectedEmployee}
                                        onChange={(e) => {
                                            const findEmp = empOptions?.find((emp) => emp?.value === e?.target?.value);
                                            setAssignSelectedEmployee(findEmp?.value);
                                        }}
                                        options={empOptions}
                                        sx={{ width: { xs: '100%', md: '30%' }, mt: 1 }}
                                    />
                                </Stack>

                                {assignSelectedEmployee && (
                                    <Stack marginTop={2}>
                                        {serviceGroups?.length === 0 && (
                                            <>
                                                <Skeleton animation="wave" height={60} />
                                                <Skeleton animation="wave" height={60} />
                                                <Skeleton animation="wave" height={60} />
                                                <Skeleton animation="wave" height={60} />
                                                <Skeleton animation="wave" height={60} />
                                            </>
                                        )}
                                        {serviceGroups.map((group, index) => {
                                            const isUngrouped = group?.group === 'Ungrouped services';
                                            const hasServices = group?.services && group.services.length > 0;

                                            if (!isUngrouped && !hasServices) {
                                                return null;
                                            }

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
                                                            const index = servicesSelected.findIndex(
                                                                (ser) => ser?.serviceId === service?.id,
                                                            );

                                                            const selected = index !== -1;

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
                                                                    {/* Top row */}
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
                                                                                WebkitLineClamp: 2, // 👈 2 lines
                                                                                textOverflow: 'ellipsis',
                                                                                wordBreak: 'break-all', // 👈 important for long words
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
                                                                                          servicesSelected[index]
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

                                                                                if (index === -1) return;

                                                                                update(index, {
                                                                                    ...servicesSelected[index],
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
                            handleClose={handleCloseDeleteModal}
                            description={
                                <>
                                    {t('Setting.AreYouSureYouWantToDelete')}
                                    <span
                                        style={{
                                            marginLeft: 5,
                                            color: '#1F1F1F',
                                            fontWeight: 'bold',
                                            marginRight: 5,
                                        }}
                                    >
                                        {editEmployee?.name}
                                    </span>
                                    {/* {itemsToDelete?.type == 'container' ? 'service group': 'service'} */}
                                </>
                            }
                            onClickDismiss={handleCloseDeleteModal}
                            onClickConfirm={() => deleteEmployee(editEmployee)}
                        />
                    )}
                </Stack>
            </Stack>
        </form>
    );
};

export default EmployeeSettingsOption;
