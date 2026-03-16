import { AppBar, Divider, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import IndividualOpeningHours from './individualOpeningHours';
import GenralOpeningHoursComponent from './genralOpeningHours';
import HolidaysAndClosedDaysComponent from './holidaysAndClosedDays';
import apiFetcher from '../../../utils/interCeptor';
import CommonButton from '../commonButton';
import { HttpStatusCode } from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { cloneDeep } from 'lodash';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { settings } from '../../../context/settingsSlice';
import { dividerSx } from '../../../scenes/Settings/Index';
import { GetEmpOpeningHourApi, GetPublicHolidaysApi } from '../../../utils/Api/Employee';

const OpeningHours = () => {
    let currentYear = moment().format('YYYY');
    const [data, setData] = useState({});
    const [initalData, setInitalData] = useState({});
    const [holidays, setHolidays] = useState([]);
    const [publicholidays, setPublicHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [enableSave, setEnableSave] = useState(false);
    const [fieldsChanged, setFieldsChanged] = useState({
        holidays: false,
        schedule: false,
        employeesOpeningHour: false,
        isIndividualOpeningHour: false,
        employeeIds: [],
    });
    const dispatch = useDispatch();

    const fetchApiData = async () => {
        try {
            const response = await GetEmpOpeningHourApi();
            const response1 = await GetPublicHolidaysApi({ currentYear });
            let resp = response?.data?.data;
            let newResp = {
                ...resp,
                employees_opening_hour: resp?.employees_opening_hour?.sort((a, b) => a?.id - b?.id),
            };
            let resp2 = cloneDeep(newResp);
            setInitalData(resp2);
            setData(response?.data?.data);
            setHolidays(response?.data?.data?.outlet_holidays);
            setPublicHolidays(response1?.data?.data);

            dispatch(
                settings({
                    schedule: response?.data?.data?.schedule,
                    outlet_holidays: response?.data?.data?.outlet_holidays,
                }),
            );

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchApiData();
    }, []);

    const handleDeleteHoliday = (index) => {
        setHolidays((prevHolidays) => prevHolidays.filter((_, i) => i !== index));
    };

    const handleOpenStatus = (id) => {
        let newOpenStatus = [];
        data.schedule.map((item) => {
            if (item.id === id) {
                newOpenStatus.push({
                    ...item,
                    is_closed: !item.is_closed,
                });
            } else {
                newOpenStatus.push(item);
            }
        });

        setData({ ...data, schedule: newOpenStatus });
    };

    const handleByAppointment = (id) => {
        let updatedByAppointment = [];
        data.schedule.map((item) => {
            // if (item.id === id && item.is_closed) {
            //     item.open_by_appointment = !item.open_by_appointment;
            // } else if (item.id === id && item.open_by_appointment) {
            //     item.open_by_appointment = !item.open_by_appointment;
            // }

            if (item.id === id) {
                updatedByAppointment.push({
                    ...item,
                    open_by_appointment: !item.open_by_appointment,
                });
            } else {
                updatedByAppointment.push(item);
            }
        });
        setData({ ...data, schedule: updatedByAppointment });
    };

    const handleSave = async ({
        changes,
        sectionsChanged = {
            schedule: false,
            employeesOpeningHour: false,
            isIndividualOpeningHour: false,
            holidays: false,
            employeeIds: [],
        },
    }) => {
        try {
            let validDetailsOfEmp = changes?.employees_opening_hour
                ?.filter((item) => item.detail.length > 0)
                .map((item) => item.detail);

            validDetailsOfEmp = validDetailsOfEmp.flat();

            let update = {
                schedule: changes.schedule,
                holiday: holidays.map((obj) => {
                    let newObj = { ...obj };
                    if (typeof obj.id == 'string') {
                        delete newObj.id;
                    }

                    return newObj;
                    // {...obj, id: typeof obj.id == 'string'? null : obj.id}}),
                }),
                employee_opening_hour: validDetailsOfEmp.map((obj) => {
                    let newObj = { ...obj };
                    if (typeof obj.id == 'string') {
                        delete newObj.id;
                    }

                    return newObj;
                    // {...obj, id: typeof obj.id == 'string'? null : obj.id}}),
                }),
                is_individual_opening_hour: changes?.is_individual_opening_hour,
                changes: {
                    holidays: sectionsChanged?.holidays || false,
                    schedule: sectionsChanged?.schedule || false,
                    employeesOpeningHour: sectionsChanged?.employeesOpeningHour || false,
                    isIndividualOpeningHour: sectionsChanged?.isIndividualOpeningHour || false,
                    employeeIds: sectionsChanged?.employeeIds || [],
                },
            };

            const response = await apiFetcher.patch(`api/v1/store/opening_hour`, update);

            if (response.status === HttpStatusCode.Ok) {
                toast.success(t('Setting.OpeningHoursUpdatedSuccessfully'));
                fetchApiData();
            }
        } catch (error) {
            toast.error(t('Setting.FailedToUpdateOpeningHours'));

            console.error('Error saving opening hours:', error);
        } finally {
            setFieldsChanged({
                holidays: false,
                schedule: false,
                employeesOpeningHour: false,
                isIndividualOpeningHour: false,
                employeeIds: [],
            });
        }
    };

    useEffect(() => {
        if (Object.keys(data).length > 0) {
            let schData = [...data?.schedule];

            let sortedScheduleData = schData.sort((a, b) => a.id - b.id);
            let sortedInitScheduleData = initalData?.schedule.sort((a, b) => a.id - b.id);

            let sorrtedEmployees_opening_hour = data?.employees_opening_hour.sort((a, b) => a.id - b.id);
            let sorrtedInitEmployees_opening_hour = initalData?.employees_opening_hour.sort((a, b) => a.id - b.id);

            const employeesOpeningHourChanged = !_.isEqual(
                sorrtedEmployees_opening_hour,
                sorrtedInitEmployees_opening_hour,
            );
            setFieldsChanged((prevFieldsChanged) => ({
                ...prevFieldsChanged,
                employeesOpeningHour: employeesOpeningHourChanged,
            }));

            const isIndividualOpeningHourChanged = !_.isEqual(
                initalData?.is_individual_opening_hour,
                data?.is_individual_opening_hour,
            );
            setFieldsChanged((prevFieldsChanged) => ({
                ...prevFieldsChanged,
                isIndividualOpeningHour: isIndividualOpeningHourChanged,
            }));

            const scheduleChanged = !_.isEqual(sortedScheduleData, sortedInitScheduleData);
            setFieldsChanged((prevFieldsChanged) => ({
                ...prevFieldsChanged,
                schedule: scheduleChanged,
            }));

            setEnableSave(scheduleChanged || employeesOpeningHourChanged || isIndividualOpeningHourChanged);
        }
    }, [data]);

    useEffect(() => {
        // if (Object.keys(holidays).length > 0) {
        if (holidays && initalData?.outlet_holidays) {
            const holidaysChanged = !_.isEqual(holidays, initalData?.outlet_holidays);
            setEnableSave(holidaysChanged);
            setFieldsChanged((prevFieldsChanged) => ({ ...prevFieldsChanged, holidays: holidaysChanged }));
        }
        // }
    }, [holidays]);

    return (
        <React.Fragment>
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
                        onClick={() => {
                            handleSave({ changes: data, sectionsChanged: fieldsChanged });
                        }}
                        width="auto"
                        ml={'auto'}
                        height={40}
                        title={t('Setting.SaveChanges')}
                        // loading={formik.isSubmitting}
                        // disabled={formik.isSubmitting}
                    />
                </AppBar>
            )}
            <Stack p={{ xs: 2, md: 2 }}>
                <Stack sx={{ bgcolor: '#fff', borderRadius: '25px', minHeight: '86vh' }}>
                    <GenralOpeningHoursComponent
                        loading={loading}
                        data={data}
                        setData={setData}
                        handleOpenStatus={handleOpenStatus}
                        handleByAppointment={handleByAppointment}
                    />

                    <Divider sx={{ ...dividerSx }} />

                    <HolidaysAndClosedDaysComponent
                        loading={loading}
                        holidays={holidays}
                        publicholidays={publicholidays}
                        setHolidays={setHolidays}
                        handleDeleteHoliday={handleDeleteHoliday}
                    />

                    <Divider sx={{ ...dividerSx }} />

                    <IndividualOpeningHours data={data} setData={setData} handleSave={handleSave} />
                </Stack>
            </Stack>
        </React.Fragment>
    );
};

export default OpeningHours;
