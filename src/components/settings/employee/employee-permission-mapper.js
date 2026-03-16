export const getEmployeePermissionMapper = ({ t = () => {} }) => {
    return {
        settingOptions: {
            label: t('Setting.ChangePermissions'),
            permissions: [
                { label: t('Setting.ChangePermissions'), id: 'change_permissions' },
                { label: t('Setting.CreateEmployees'), id: 'create_employee' },
                { label: t('Setting.ChangeDepartment'), id: 'change_department' },
                { label: t('Setting.CreateDepartment'), id: 'create_department' },
            ],
        },
        calendar: {
            label: t('Setting.Calendar'),
            permissions: [
                { label: t('Setting.ViewAllEmployees'), id: 'view_all_employees' },
                { label: t('Setting.DeleteAllBookings'), id: 'delete_all_bookings' },
                { label: t('Setting.DeleteOwnBookings'), id: 'delete_own_bookings' },
                { label: t('Setting.RescheduleAllBookings'), id: 'reschedule_all_bookings' },
                { label: t('Setting.RescheduleOwnBookings'), id: 'reschedule_own_bookings' },
                { label: t('Setting.Create/edit/deleteCancellationOffer'), id: 'crud_cancellation_offer' },
                { label: t('Setting.ReadOwnNoti'), id: 'read_own_notification' },
                { label: t('Setting.ReadAllNoti'), id: 'read_all_notification' },
            ],
        },

        service: {
            label: t('Common.Service'),
            permissions: [
                { label: t('Setting.Create/edit/deleteServices'), id: 'crud_services' },
                { label: t('Setting.ViewServiceList'), id: 'view_service_list' },
            ],
        },
        openingHours: {
            label: t('Setting.CalendarInterval'),
            permissions: [
                { label: t('Setting.ChangeCalendarIntervalForAll'), id: 'change_all_calender_interval' },
                { label: t('Setting.ChangeCalendarIntervalForOwn'), id: 'change_own_calender_interval' },
                { label: t('Setting.ChangeOpeningHoursForAll'), id: 'change_all_opening_hours' },
                { label: t('Setting.ChangeOpeningHoursForOwn'), id: 'change_own_opening_hours' },
            ],
        },
        specialOffers: {
            label: t('SpOffers.SpOffers'),
            permissions: [
                { label: t('Setting.Create/edit/deleteSpecialOffers'), id: 'crud_special_offers' },
                { label: t('Setting.ViewSpecialOffers'), id: 'view_special_offers' },
            ],
        },

        customer: {
            label: t('Insights.Customer'),
            permissions: [
                { label: t('Setting.CreateCustomers'), id: 'create_customers' },
                { label: t('Setting.EditCustomers'), id: 'edit_customers' },
                { label: t('Setting.DeleteCustomers'), id: 'delete_customers' },
                { label: t('Setting.ViewCustomers'), id: 'view_customers' },
            ],
        },

        journal: {
            label: t('Setting.CreateJournals'),
            permissions: [
                { label: t('Setting.CreateJournals'), id: 'create_journals' },
                { label: t('Setting.EditAllJournals'), id: 'edit_all_journals' },
                { label: t('Setting.EditOwnJournals'), id: 'edit_own_journals' },
                { label: t('Setting.ViewAllJournals'), id: 'view_all_journals' },
                { label: t('Setting.ViewOnlyOwnJournals'), id: 'view_own_journals' },
            ],
        },
        POS: {
            label: t('Setting.ViewPOS'),
            permissions: [{ label: t('Setting.ViewPOS'), id: 'view_pos', extraNote: t('Setting.POSExtraNote') }],
        },

        insights: {
            label: t('Setting.Insights'),
            permissions: [{ label: t('Setting.ViewAllInsights'), id: 'view_insights' }],
        },

        history: {
            label: t('POS.History'),
            permissions: [{ label: t('Setting.ViewHistory'), id: 'view_history' }],
        },

        statistics: {
            label: t('Statistics.Title'),
            permissions: [{ label: t('Setting.ViewStatistics'), id: 'view_statistics' }],
        },

        marketing: {
            label: t('Setting.Marketing'),
            permissions: [{ label: t('Setting.ViewMarketing'), id: 'view_marketing' }],
        },

        // doctors: {
        //     label: t('Setting.Doctors'),
        //     permissions: [{ label: t('Setting.ViewDoctors'), id: 'view_doctors' }],
        // },

        settings: {
            label: t('GiftCard.Settings'),
            permissions: [{ label: t('Setting.ViewSettings'), id: 'view_settings' }],
        },
        pricing: {
            label: t('Setting.Pricing'),
            permissions: [{ label: t('Setting.BlurPricePermission'), id: 'blur_price' }],
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
