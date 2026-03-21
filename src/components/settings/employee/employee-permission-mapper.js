export const getEmployeePermissionMapper = () => {
    return {
        settingOptions: {
            label: 'Change Permissions',
            permissions: [
                { label: 'Change Permissions', id: 'change_permissions' },
                { label: 'Create Employees', id: 'create_employee' },
                { label: 'Create Customers', id: 'create_customers' },
                { label: 'Edit Customers', id: 'edit_customers' },
                { label: 'Delete Customers', id: 'delete_customers' },
                { label: 'View Customers', id: 'view_customers' },
                { label: 'ViewPOS', id: 'view_pos', extraNote: 'POSExtraNote' },
            ],
        },
    };
};

export const getEmployeePermissionsDefault = ({ value = false }) => {
    const mapper = getEmployeePermissionMapper();

    return Object.values(mapper).reduce((acc, { permissions = [] }) => {
        permissions.forEach((permission) => {
            const { id } = permission;
            acc[id] = value;
        });
        return acc;
    }, {});
};
