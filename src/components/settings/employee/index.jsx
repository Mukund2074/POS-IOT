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
    CircularProgress,
    Tooltip,
    Avatar,
} from '@mui/material';

import PencnlIconImg from '../../../assets/edit-2.png';
import DeleteIconImg from '../../../assets/DeleteIcon.png';

import apiFetcher from '../../../utils/interCeptor';
import { useFormik } from 'formik';
import CustomDeleteModal from '../../deleteAlertModal';
import { toast } from 'react-toastify';
import _ from 'lodash';

import EmployeeModel from './EmployeeModel';
import { useSelector } from 'react-redux';
import Unauthorized from '../../../scenes/Unauthorized/Unauthorized';

import { CreateEmployeeApi, DeleteEmployeeApi } from '../../../utils/Api/Employee';
import { getEmployeePermissionMapper, getEmployeePermissionsDefault } from './employee-permission-mapper';
import { Masonry } from '@mui/lab';
import { Link } from 'react-router-dom';
import { InfoOutlined } from '@mui/icons-material';
import RadixSwitch from '../../radix/RadixSwitch';
import RadixSelect from '../../radix/RadixSelect';
import RadixButton from '../../radix/RadixButton';

const EmployeeSettingsOption = () => {
    const user = useSelector((state) => state.user.data);
    const settingsSelector = useSelector((state) => state.settings.data);

    const employeePermissionMapper = getEmployeePermissionMapper();
    const defaultPermissions = getEmployeePermissionsDefault({ value: false });

    const [showModal, setShowModal] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [enableSave, setEnableSave] = useState(false);
    const [loading, setLoading] = useState(false);
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

                    const permission = { ...defaultPermissions, ...(foundEmployee?.permission || {}) };

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
            const payload = { ...defaultPermissions, ...(permission || {}) };
            const response = await apiFetcher.patch(`/api/v1/store/employee/setting/${id}`, payload);
            const { success } = response.data;
            if (success) {
                toast.success('Permissions updated');

                setInitialValues(formik.values);
                getEmployees();
            }

            setEnableSave(false);

            formik.setSubmitting(false);
        } catch (err) {
            toast.error('Failed to update permission');
            console.error('err', err);
            formik.setSubmitting(false);
        }
    };

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
                let url = `/api/v1/store/employee/${values?.id}`;
                await apiFetcher.patch(url, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await CreateEmployeeApi({ formdata });
            }

            formik.setSubmitting(false);
            getEmployees();
            setEditEmployee(null);
            toast.success(values?.id ? 'Employee updated' : 'Employee created');
        } catch (err) {
            toast.error(values?.id ? 'Failed to update employee' : 'Failed to create employee');
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
            toast.success('Employee deleted');
            setEditEmployee(null);
        } catch (err) {
            toast.error('Failed to delete employee');
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
    };

    useEffect(() => {
        setLoading(true);
        getEmployees();
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
            }
        },
    });

    const setAllPermission = (value) => {
        formik.setFieldValue('allPermission', value);

        const newPermissions = getEmployeePermissionsDefault({ value });
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

    if (!user?.settings?.view_all_employees && user.role !== 'ADMIN') {
        return <Unauthorized />;
    }
    return (
        <form onSubmit={formik.handleSubmit}>
            {enableSave && (
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
                    <Box sx={{ ml: 'auto' }}>
                        <RadixButton
                            type="button"
                            variant="primary"
                            onClick={formik.handleSubmit}
                            disabled={formik.isSubmitting}
                            style={{ minHeight: 40 }}
                        >
                            {formik.isSubmitting ? (
                                <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                    <CircularProgress size={20} sx={{ color: 'inherit' }} />
                                    Processing
                                </Stack>
                            ) : (
                                'Save Changes'
                            )}
                        </RadixButton>
                    </Box>
                </AppBar>
            )}
            <Stack p={{ xs: 2, md: 2 }}>
                <Stack spacing={6} sx={{ bgcolor: '#fff', borderRadius: '25px', minHeight: '86vh' }}>
                    {/* Employees */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <h5 className="text-lg font-bold">Employees</h5>
                            <p className="text-sm text-gray-500">Here you can add and edit employees.</p>
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
                                <Grid2 container spacing={3}>
                                    {employees.map((employee, index) => (
                                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                            <Stack
                                                sx={{
                                                    borderRadius: '16px',
                                                    border: '1px solid #EFEFEF',
                                                    p: 2,
                                                    bgcolor: '#FAFAFA',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    position: 'relative',
                                                }}
                                            >
                                                {user.role === 'ADMIN' && (
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        sx={{ position: 'absolute', top: 8, right: 8 }}
                                                    >
                                                        <IconButton
                                                            onClick={() => {
                                                                setEditEmployee(employee);
                                                                setShowModal(true);
                                                            }}
                                                            sx={{
                                                                width: 28,
                                                                height: 28,
                                                                bgcolor: '#fff',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                            }}
                                                        >
                                                            <img
                                                                src={PencnlIconImg}
                                                                alt="Edit"
                                                                width={14}
                                                                height={14}
                                                            />
                                                        </IconButton>
                                                        {user?.id !== employee?.id && employee?.role !== 'ADMIN' && (
                                                            <IconButton
                                                                onClick={() => {
                                                                    setEditEmployee(employee);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                sx={{
                                                                    width: 28,
                                                                    height: 28,
                                                                    bgcolor: '#fff',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                }}
                                                            >
                                                                <img
                                                                    src={DeleteIconImg}
                                                                    alt="Delete"
                                                                    width={14}
                                                                    height={14}
                                                                />
                                                            </IconButton>
                                                        )}
                                                    </Stack>
                                                )}

                                                <Avatar
                                                    src={
                                                        employee?.image &&
                                                        `${process.env.REACT_APP_IMG_URL}${employee.image}`
                                                    }
                                                    alt={employee?.name}
                                                    sx={{ width: 64, height: 64, mb: 1.5 }}
                                                />
                                                <Typography
                                                    noWrap
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#1F1F1F',
                                                        textAlign: 'center',
                                                        maxWidth: '100%',
                                                    }}
                                                >
                                                    {employee?.name}
                                                </Typography>
                                                <Typography
                                                    sx={{ fontSize: '12px', color: '#888', mb: 1, textAlign: 'center' }}
                                                >
                                                    {employee?.role === 'DOCTOR'
                                                        ? `${employee?.role}`
                                                        : employee?.role || 'Employee'}
                                                </Typography>
                                            </Stack>
                                        </Grid2>
                                    ))}
                                    {(user?.settings?.create_employee || user.role === 'ADMIN') && (
                                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Stack
                                                onClick={() => {
                                                    setEditEmployee(null);
                                                    setShowModal(true);
                                                }}
                                                sx={{
                                                    borderRadius: '16px',
                                                    border: '1px dashed #D9D9D9',
                                                    p: 2,
                                                    minHeight: 140,
                                                    height: '100%',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    bgcolor: '#fff',
                                                    transition: 'all 0.2s ease-in-out',
                                                    '&:hover': {
                                                        bgcolor: '#FAFAFA',
                                                        borderColor: '#A0A0A0',
                                                    },
                                                }}
                                            >
                                                <Typography sx={{ color: '#A0A0A0', fontWeight: 500 }}>
                                                    + New employee
                                                </Typography>
                                            </Stack>
                                        </Grid2>
                                    )}
                                </Grid2>
                            )}
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ borderColor: '#EFEFEF', my: 2 }} />

                    {/* Permissions */}
                    {user?.role === 'ADMIN' && (
                        <Grid2 container spacing={3} sx={{ py: 2, px: { xs: 2, md: 5 } }}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <h5 className="text-lg font-bold">Permissions</h5>
                                <p className="text-sm text-gray-500">
                                    Here you can choose permissions for your employees.
                                </p>
                            </Grid2>

                            <Grid2 container spacing={3} size={{ xs: 12, md: 8 }}>
                                {/* Employee Select */}
                                <Grid2 size={12}>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                        Select Employee
                                    </Typography>
                                    <Box sx={{ width: { xs: '100%', md: '30%' }, mt: 1 }}>
                                        <RadixSelect
                                            value={
                                                formik?.values?.id != null && formik.values.id !== ''
                                                    ? String(formik.values.id)
                                                    : undefined
                                            }
                                            onValueChange={(v) =>
                                                handleChangeSelectedEmployee({ target: { value: v } })
                                            }
                                            options={employees.map((e) => ({
                                                label: e.label,
                                                value: String(e.value),
                                            }))}
                                            placeholder="Select Employee"
                                        />
                                    </Box>
                                </Grid2>

                                {/* All Permissions toggle */}
                                <Grid2 size={12}>
                                    <Box sx={{ p: 2, border: '1px solid #EFEFEF', borderRadius: '12px' }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 700, color: '#1F1F1F', mb: 1.5 }}
                                        >
                                            All Permissions
                                        </Typography>
                                        <RadixSwitch
                                            id="allPermission"
                                            checked={formik.values.allPermission}
                                            onChange={(value) => setAllPermission(value)}
                                            label="Grant all permissions"
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
                                                        <RadixSwitch
                                                            id={permission.id}
                                                            checked={formik.values.permission[permission.id]}
                                                            onChange={(checked) => onChangeValue(permission, checked)}
                                                            label={permission.label}
                                                        />

                                                        {permission.extraNote && (
                                                            <Tooltip title={permission.extraNote}>
                                                                <InfoOutlined sx={{ fontSize: 16, color: 'gray' }} />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                ))}
                                                {key === 'POS' && formik.values.permission['view_pos'] === true && (
                                                    <Link to="/pos/settings">Detailed Permissions</Link>
                                                )}
                                            </Box>
                                        ))}
                                    </Masonry>
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    )}

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
                                    Are you sure you want to delete
                                    <span
                                        style={{
                                            marginLeft: 5,
                                            color: '#1F1F1F',
                                            fontWeight: 'bold',
                                            marginRight: 5,
                                        }}
                                    >
                                        {editEmployee?.name}?
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
