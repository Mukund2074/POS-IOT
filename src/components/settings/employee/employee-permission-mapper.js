export const getEmployeePermissionMapper = ({ t = () => {} }) => {
    return {
        settingOptions: {
            label: t('Setting.ChangePermissions'),
            permissions: [
                { label: t('Setting.ChangePermissions'), id: 'change_permissions' },
                { label: t('Setting.CreateEmployees'), id: 'create_employee' },
                { label: t('Setting.CreateCustomers'), id: 'create_customers' },
                { label: t('Setting.EditCustomers'), id: 'edit_customers' },
                { label: t('Setting.DeleteCustomers'), id: 'delete_customers' },
                { label: t('Setting.ViewCustomers'), id: 'view_customers' },
                { label: t('Setting.ViewPOS'), id: 'view_pos', extraNote: t('Setting.POSExtraNote') },
            ],
        },
    };
};

export const getEmployeePermissionsDefault = ({ t = () => {}, value = false }) => {
    const mapper = getEmployeePermissionMapper({ t });

    return Object.values(mapper).reduce((acc, { permissions = [] }) => {
        permissions.forEach((permission) => {
            const { id } = permission;
            acc[id] = value;
        });
        return acc;
    }, {});
};
