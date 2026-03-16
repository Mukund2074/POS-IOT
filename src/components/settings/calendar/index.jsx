import React, { useEffect, useMemo, useState } from 'react';
import { Tooltip, Stack, Divider, Typography, AppBar, Grid2, IconButton, CircularProgress } from '@mui/material';
import PrimaryHeading from '../commonPrimaryHeading';
import SecondaryHeading from '../commonSecondaryHeading';
import CustomSelect from '../commonCustomSelect';
import TooltipIcon from '../../../assets/IconTooltip.png';
import { useFormik } from 'formik';
import CommonButton from '../commonButton';
import _ from 'lodash';
import { toast } from 'react-toastify';
import apiFetcher from '../../../utils/interCeptor';
import FSwitch from '../../commonComponents/f-switch';
import { useSelector } from 'react-redux';
import { settings } from '../../../context/settingsSlice';
import { useDispatch } from 'react-redux';

import { t } from 'i18next';
import { dividerSx } from '../../../scenes/Settings/Index';
import { MultipleContainers } from '../../MultipleContainers/MultipleContainers';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import FButton from '../../commonComponents/F_Button';
import ExportBookings from './popup/ExportBookings';
import FPrimaryHeading from '../../commonComponents/F_PrimaryHeading';

// const initialValues = {
//     "setCalendarOpeningHour": 120,
//     "setCalendarClosingHour": 120,
//     "grayOutClosedHours": false,
//     "showOnlyAvailableEmployee": false,
//     "calendarInterval": 15
// }

const CalendarSettingsOption = () => {
    const [employees, setEmployees] = useState([]);
    const [settingEmployees, setSettingEmployees] = useState([]);
    const [manualSorted, setManualSorted] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.data);
    const setting = useSelector((state) => state?.settings?.data);
    const [showExportModal, setShowExportModal] = useState(false);

    const options = [
        { value: 120, label: t('Setting.2HoursStandard') },
        { value: 240, label: t('Setting.4Hours') },
        { value: 360, label: t('Setting.6Hours') },
    ];

    const optionsAfter = [
        { value: 120, label: t('Setting.2HoursStandard') },
        { value: 240, label: t('Setting.4Hours') },
        { value: 360, label: t('Setting.6Hours') },
    ];

    const calendarIntervals = [
        { value: 5, label: t('Setting.5Min') },
        { value: 10, label: t('Setting.10Min') },
        { value: 15, label: t('Setting.15Min') },
        { value: 30, label: t('Setting.30Min') },
        { value: 60, label: t('Setting.60Min') },
    ];

    const [enableSave, setEnableSave] = useState(false);
    const [initialValues, setInitialValues] = useState({
        setCalendarOpeningHour: 120,
        setCalendarClosingHour: 120,
        grayOutClosedHours: false,
        showOnlyAvailableEmployee: false,
        calendarInterval: 15,
        allow_overlap: false,
        hide_cancel_bookings: false,
    });

    // const { calendar } = useSelector((state) => state.settings?.data);

    const tooltipContent = <div style={{ padding: '5px' }}>content here</div>;

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        onSubmit: (values) => {
            const payload = { ...values, employees: employees };
            calendarAPI(payload);
        },
    });

    const calendarAPI = async (value) => {
        try {
            const payload = {
                settings: [
                    {
                        settingCategory: 'outlet',
                        settingName: 'calendar',
                        value: JSON.stringify(value),
                        type: 'JSON',
                    },
                ],
            };
            const response = await apiFetcher.patch('/api/v1/store/outlet/setting', payload);
            const { success, data } = response.data;
            if (success) {
                toast.success(t('Setting.CalendarSettingsUpdated'));

                setSettingEmployees(employees);

                dispatch(settings({ calendar: value }));
            }

            setEnableSave(false);

            formik.setSubmitting(false);
        } catch (err) {
            toast.error(t('Setting.FailedToUpdateCalendarSettings'));
            formik.setSubmitting(false);
        }
    };

    useMemo(() => {
        setInitialValues(setting?.calendar);
        formik.setValues(setting?.calendar);
    }, [setting?.calendar]);

    useEffect(() => {
        if (!manualSorted) {
            const employeesChanged = !_.isEqual(settingEmployees, employees);
            const formValuesChanged = !_.isEqual(initialValues, formik.values);

            setEnableSave(employeesChanged || formValuesChanged);
        } else {
            setEnableSave(false);
        }
    }, [employees, settingEmployees, formik.values, manualSorted]);

    const formatEmployees = () => {
        let empObj = {};

        // Check if employees exist and sort them by name
        if (setting?.employees && setting?.employees.length > 0) {
            const sortedEmployees = [...setting.employees].sort((a, b) => a.name.localeCompare(b.name));

            sortedEmployees.forEach((emp, index) => {
                empObj[emp.id] = {
                    title: emp.name,
                    groupId: emp.id,
                    sequence: index + 1,
                    noSubGroup: true,
                    services: [],
                };
            });
        }

        setEmployees(empObj);
        setSettingEmployees(empObj);
    };

    useEffect(() => {
        const calEmps = setting?.calendar?.employees;

        if (calEmps && !areEmployeeIdsEqual(setting?.employees, calEmps)) {
            setManualSorted(true);
            let empObjNewUpdated = {};
            let count = Object.keys(calEmps).length + 1;

            if (setting?.employees && setting?.employees.length > 0) {
                const sortedEmployees = [...setting.employees].sort((a, b) => a.name.localeCompare(b.name));

                sortedEmployees.forEach((emp) => {
                    empObjNewUpdated[emp.id] = {
                        title: emp.name,
                        groupId: emp.id,
                        sequence: calEmps[emp.id]?.sequence || count++,
                        noSubGroup: true,
                        services: [],
                    };
                });
            }

            setEmployees(empObjNewUpdated);
            setSettingEmployees(empObjNewUpdated);
            return;
        }

        // Helper function to compare IDs
        function areEmployeeIdsEqual(obj1, obj2) {
            const ids1 = Object.keys(obj1 || {}).sort();
            const ids2 = Object.keys(obj2 || {}).sort();
            if (ids1.length !== ids2.length) return false;
            return ids1.every((id, index) => id === ids2[index]);
        }

        if (setting?.calendar?.employees) {
            const sortedEntries = Object.entries(setting.calendar.employees).sort(
                ([, a], [, b]) => a.sequence - b.sequence,
            );

            const sortedEmployees = {};
            sortedEntries.forEach(([key, value]) => {
                sortedEmployees[key] = value;
            });

            setEmployees(sortedEmployees);
            setSettingEmployees(sortedEmployees);
        } else {
            formatEmployees();
        }
    }, []);

    const showToast = (message, type) => {
        if (type === 'success') {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

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
                        // justifyContent: "flex-end",
                        alignItems: 'flex-end',
                        width: '100%',
                    }}
                >
                    <CommonButton
                        onClick={formik.handleSubmit}
                        width="auto"
                        ml={'auto'}
                        height={40}
                        title={t('Setting.SaveChanges')}
                        // loading={formik.isSubmitting}
                        disabled={formik.isSubmitting}
                    />
                </AppBar>
            )}

            <Stack p={{ xs: 2, md: 2 }}>
                <Stack sx={{ bgcolor: '#fff', borderRadius: '25px', minHeight: '86vh' }}>
                    {/* Calendar Appearance */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Setting.CalendarAppearance')} />
                            <SecondaryHeading text={t('Setting.Description9')} />
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <Stack
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                    {t('Setting.HowManyHoursBeforeCalendarStart')}
                                </Typography>
                                <Tooltip arrow title={tooltipContent} sx={{ ml: 10 }}>
                                    <img
                                        src={TooltipIcon}
                                        alt="IconOne"
                                        style={{ marginLeft: 4, width: 14, height: 14 }}
                                    />
                                </Tooltip>
                            </Stack>
                            <CustomSelect
                                id={'setCalendarOpeningHour'}
                                name={'setCalendarOpeningHour'}
                                value={formik.values.setCalendarOpeningHour}
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    setManualSorted(false);
                                }}
                                options={options}
                                sx={{ width: { xs: '100%', md: 180 }, mt: 1 }}
                            />

                            <Stack
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 20,
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                    {t('Setting.HowManyHoursAfterCalendarStop')}
                                </Typography>
                                <Tooltip arrow title={tooltipContent} sx={{ ml: 10 }}>
                                    <img
                                        src={TooltipIcon}
                                        alt="IconOne"
                                        style={{ marginLeft: 4, width: 14, height: 14 }}
                                    />
                                </Tooltip>
                            </Stack>
                            <CustomSelect
                                id={'setCalendarClosingHour'}
                                name={'setCalendarClosingHour'}
                                value={formik.values.setCalendarClosingHour}
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    setManualSorted(false);
                                }}
                                options={optionsAfter}
                                sx={{ width: { xs: '100%', md: 180 }, mt: 1 }}
                            />

                            <Stack
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 20,
                                }}
                            />

                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                {t('Setting.GreyOutClosedHours')}
                            </Typography>
                            <FSwitch
                                id={'grayOutClosedHours'}
                                name={'grayOutClosedHours'}
                                checked={formik.values.grayOutClosedHours}
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    setManualSorted(false);
                                }}
                            />

                            {/* <Stack style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20 }} />

                            <Typography variant='body1' sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                {t("Setting.ShowOnlyEmployeesWhoAreAtWork")}
                            </Typography>
                            <FSwitch
                                id={'showOnlyAvailableEmployee'}
                                name={'showOnlyAvailableEmployee'}
                                checked={formik.values.showOnlyAvailableEmployee}
                                onChange={formik.handleChange}
                            /> */}
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ ...dividerSx }} />

                    {/* Calendar Interval */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Setting.CalendarInterval')} />
                            <SecondaryHeading text={t('Setting.Description10')} />
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <Stack
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                    {t('Setting.CalendarInterval')}
                                </Typography>
                                <Tooltip arrow title={tooltipContent} sx={{ ml: 10 }}>
                                    <img
                                        src={TooltipIcon}
                                        alt="IconOne"
                                        style={{ marginLeft: 4, width: 14, height: 14 }}
                                    />
                                </Tooltip>
                            </Stack>
                            <CustomSelect
                                disabled={
                                    user?.role !== 'ADMIN' &&
                                    !user?.settings.change_own_calender_interval &&
                                    !user?.settings.change_all_calender_interval
                                }
                                id={'calendarInterval'}
                                name={'calendarInterval'}
                                value={formik.values.calendarInterval}
                                //  onChange={(event)=>onChangeValue('calendarInterval', event)}
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    setManualSorted(false);
                                }}
                                options={calendarIntervals}
                                sx={{ width: { xs: '100%', md: 180 }, mt: 1 }}
                            />
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ ...dividerSx }} />

                    {/* Allow Double Booking */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Setting.AllowDoubleBk')} />
                            <SecondaryHeading text={t('Setting.AllowDoubleBkDesc')} />
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                {t('Setting.DblBk')}
                            </Typography>
                            <FSwitch
                                id={'allow_overlap'}
                                name={'allow_overlap'}
                                checked={formik.values.allow_overlap}
                                onChange={(e) => {
                                    formik.setFieldValue('allow_overlap', !formik.values.allow_overlap);
                                    setManualSorted(false);
                                }}
                            />
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ ...dividerSx }} />

                    {/* Show Cancel Bookings */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Setting.ShowCancelBookings')} />
                            <SecondaryHeading text={t('Setting.ShowCancelBookings')} />
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                {t('Setting.ShowCancelBookings')}
                            </Typography>
                            <FSwitch
                                id={'hide_cancel_bookings'}
                                name={'hide_cancel_bookings'}
                                checked={!formik?.values?.hide_cancel_bookings}
                                onChange={(e) => {
                                    formik.setFieldValue('hide_cancel_bookings', !formik?.values?.hide_cancel_bookings);
                                    setManualSorted(false);
                                }}
                            />
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ ...dividerSx }} />

                    {/* Export Bookings */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Setting.ExportBookings')} />
                            <SecondaryHeading text={t('Setting.ExportBookingsDesc')} />
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <FButton
                                variant={'save'}
                                title={t('Setting.ExportBookings')}
                                onClick={() => {
                                    setShowExportModal(true);
                                }}
                            />
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ ...dividerSx }} />

                    {/* Employee Selection Order */}
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        {(user?.role === 'ADMIN' || user?.settings.view_all_employees) && (
                            <React.Fragment>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.EmployeeSelectionOrder')} />
                                    <SecondaryHeading text={t('Setting.DescEmpCal')} />
                                </Grid2>

                                <Grid2
                                    size={{ xs: 12, md: 8 }}
                                    sx={{
                                        overflow: 'hidden',
                                        overflowX: 'scroll',
                                        scrollbarWidth: 'none',
                                    }}
                                >
                                    <Stack sx={{ minWidth: { xs: 750, md: 'auto' } }}>
                                        {Object.keys(employees).length > 0 && (
                                            <MultipleContainers
                                                modelType={'Emp'}
                                                itemCount={Object.keys(employees).length}
                                                items={employees}
                                                setItems={setEmployees}
                                                strategy={rectSortingStrategy}
                                                vertical
                                                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                                                onDragToAnotherContainer={(containerId, itemId) => {}}
                                                onDragComplete={(isContainer, containerId, updatedcontainers) => {
                                                    let dataToUpdate = [];
                                                    if (isContainer) {
                                                        let emp = _.cloneDeep(employees);
                                                        updatedcontainers.map((containerId, index) => {
                                                            if (containerId != 0) {
                                                                dataToUpdate.push({
                                                                    id: containerId,
                                                                    sequence: index,
                                                                });
                                                            }
                                                            emp[containerId].sequence = index + 1;
                                                        });

                                                        setEmployees(emp);
                                                        // setSettingEmployees(emp);
                                                        setManualSorted(false);
                                                    }
                                                }}
                                                onclickContainer={(e) => {}}
                                                onRemove={(e) => {}}
                                            />
                                        )}
                                    </Stack>
                                </Grid2>
                            </React.Fragment>
                        )}
                    </Grid2>

                    {/* Google Calendar Sync */}

                    {/* {setting?.profile?.inspection_module && (
                        <React.Fragment>
                            <Divider sx={{ ...dividerSx }} />

                            <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <PrimaryHeading text={t('Setting.GoogleCalendarSync')} />
                                    <SecondaryHeading text={t('Setting.GoogleCalendarSyncDesc')} />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 8 }}>
                                    <FPrimaryHeading text={t('Setting.GoogleCalenderConnectionStatus')} fontSize={16} />
                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', md: 'row' },
                                            alignItems: { xs: 'flex-start', md: 'center' },
                                            gap: 2,
                                            px: 2,
                                            py: { xs: 1, md: 1.5 },
                                            mt: 1,
                                            borderRadius: 3,
                                            bgcolor:
                                                formik.values.googleCalendarSyncConnectionStatus === null
                                                    ? '#F5F5F5'
                                                    : formik.values.googleCalendarSyncConnectionStatus === true
                                                      ? '#E6F4EA'
                                                      : '#F5F5F5',
                                        }}
                                    >
                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 2,
                                                width: '100%',
                                            }}
                                        >
                                            {isCheckingStatus ? (
                                                <CircularProgress size={12} sx={{ color: '#666' }} />
                                            ) : (
                                                <Circle
                                                    sx={{
                                                        fontSize: 12,
                                                        color:
                                                            formik.values.googleCalendarSyncConnectionStatus === true
                                                                ? 'green'
                                                                : formik.values.googleCalendarSyncConnectionStatus ===
                                                                    false
                                                                  ? 'red'
                                                                  : '#999',
                                                    }}
                                                />
                                            )}
                                            <span>
                                                {isCheckingStatus ||
                                                formik.values.googleCalendarSyncConnectionStatus === null
                                                    ? t('Setting.Checking')
                                                    : formik.values.googleCalendarSyncConnectionStatus === true
                                                      ? t('Setting.Connected')
                                                      : t('Setting.Disconnected')}
                                            </span>
                                            <IconButton
                                                sx={{ ml: 'auto' }}
                                                disableFocusRipple
                                                disableRipple
                                                disableTouchRipple
                                                onClick={() => {
                                                    googleCalendarSyncConnectionStatus();
                                                }}
                                                disabled={isCheckingStatus}
                                            >
                                                <Replay sx={{ fontSize: 24 }} />
                                            </IconButton>
                                        </Stack>
                                        {!isCheckingStatus &&
                                            formik.values.googleCalendarSyncConnectionStatus !== null && (
                                                <>
                                                    {formik.values.googleCalendarSyncConnectionStatus === true ? (
                                                        <FButton
                                                            variant={'save'}
                                                            title={t('Setting.Disconnect')}
                                                            sx={{
                                                                backgroundColor: '#C74141',
                                                                minWidth: { xs: '100%', md: 'fit-content' },
                                                            }}
                                                            onClick={() => {
                                                                setDisconnectModalOpen(true);
                                                            }}
                                                        />
                                                    ) : (
                                                        <FButton
                                                            variant={'save'}
                                                            title={t('Setting.Connect')}
                                                            onClick={() => {
                                                                handleGoogleCalendarSync();
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            )}
                                    </Stack>
                                </Grid2>
                            </Grid2>
                        </React.Fragment>
                    )} */}
                </Stack>
            </Stack>

            {showExportModal && (
                <ExportBookings
                    open={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    showToast={showToast}
                />
            )}
        </form>
    );
};

export default CalendarSettingsOption;
