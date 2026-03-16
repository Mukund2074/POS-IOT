import { FormikProps } from 'formik';
import { EmployeeListingSchema } from '../../../Sales-Page/Types/sales.types';
import { Grid2, Stack, Tooltip, Divider } from '@mui/material';
import POSSelect from '@/components/POS/Common/POSSelect';
import { converterHash, defaultPosPermissions, Permission, permissionDescription } from '../../Core/pos-settings.data';
import { t } from 'i18next';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import { InfoOutlined } from '@mui/icons-material';

export const PermissionList = ({
    formik,
    selectedEmployeeId,
    onEmployeeChange,
    onPermissionChange,
    filteredEmployees = [],
}: {
    formik: FormikProps<any>;
    selectedEmployeeId: number;
    onEmployeeChange: (employeeId: number) => void;
    onPermissionChange: (module: string, permission: string, checked: boolean) => void;
    filteredEmployees?: EmployeeListingSchema[];
}) => {
    const currentPermissions = formik?.values?.employeePermissions?.[selectedEmployeeId] || defaultPosPermissions;

    // Check if all permissions are enabled
    const areAllPermissionsEnabled = () => {
        return Object.keys(defaultPosPermissions).every((module) =>
            Object.keys(defaultPosPermissions[module as keyof typeof defaultPosPermissions]).every((permission) => {
                const currentValue =
                    currentPermissions[module as keyof typeof currentPermissions]?.[permission as Permission];
                return currentValue !== undefined
                    ? currentValue
                    : defaultPosPermissions[module as keyof typeof defaultPosPermissions][permission as Permission];
            }),
        );
    };

    // Toggle all permissions
    const handleToggleAllPermissions = (checked: boolean) => {
        Object.keys(defaultPosPermissions).forEach((module) => {
            Object.keys(defaultPosPermissions[module as keyof typeof defaultPosPermissions]).forEach((permission) => {
                // Use formik.setFieldValue to update each permission individually
                formik.setFieldValue(`employeePermissions.${selectedEmployeeId}.${module}.${permission}`, checked);
            });
        });
    };

    return (
        <Grid2 container>
            <Grid2 size={12} sx={{ mb: 2 }}>
                <POSSelect
                    value={selectedEmployeeId}
                    options={filteredEmployees.map((employee: any) => ({
                        label: employee?.role === 'ADMIN' ? `${employee.name} (Admin)` : employee.name,
                        value: employee.id,
                    }))}
                    sx={{ width: 'fit-content', minWidth: '30%' }}
                    onChange={(e) => onEmployeeChange(Number(e.target.value))}
                />
            </Grid2>

            {/* Master Toggle for All Permissions */}
            <Grid2 size={12} sx={{ mb: 2 }}>
                <POSSwitch
                    checked={areAllPermissionsEnabled()}
                    label={
                        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                            <POSHeading text={t('POS.ToggleAllPermissions')} sx={{ fontSize: 16 }} />
                            <Tooltip title={t('POS.ToggleAllPermissionsTooltip')}>
                                <InfoOutlined sx={{ fontSize: 16 }} />
                            </Tooltip>
                        </Stack>
                    }
                    onChange={(_, checked) => handleToggleAllPermissions(checked)}
                />
            </Grid2>

            <Grid2 size={12}>
                <Divider sx={{ mb: 2 }} />
            </Grid2>
            {(Object.keys(defaultPosPermissions) as Array<keyof typeof defaultPosPermissions>).map((module) => (
                <Grid2
                    size={{ xs: 12, md: 6 }}
                    key={module}
                    sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                    <POSHeading text={t(`POS.${module}`)} sx={{ fontSize: 16, fontWeight: 700 }} />
                    {Object.keys(defaultPosPermissions[module]).map((permission) => (
                        <POSSwitch
                            key={permission}
                            checked={
                                currentPermissions[module] &&
                                typeof currentPermissions[module][permission as Permission] !== 'undefined'
                                    ? currentPermissions[module][permission as Permission]
                                    : defaultPosPermissions[module][permission as Permission]
                            }
                            label={
                                <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                                    {converterHash[`${module}.${permission}` as keyof typeof converterHash] ||
                                        t(`POS.${module}.${permission}`)}
                                    {permissionDescription[`${module}.${permission}`] && (
                                        <Tooltip title={permissionDescription[`${module}.${permission}`]}>
                                            <InfoOutlined sx={{ fontSize: 16, color: 'gray' }} />
                                        </Tooltip>
                                    )}
                                </Stack>
                            }
                            onChange={(_, checked) => onPermissionChange(module, permission, checked)}
                        />
                    ))}
                </Grid2>
            ))}
        </Grid2>
    );
};
