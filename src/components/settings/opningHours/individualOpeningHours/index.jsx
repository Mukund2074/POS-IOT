import { Grid2, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import PrimaryHeading from '../../commonPrimaryHeading';
import SecondaryHeading from '../../commonSecondaryHeading';
import CalendarComponent from './calander';
import Shifter from './calander/Shifter';
import { getCurrentWeekInfo } from '../utils/Functions';
import moment from 'moment';
import FormModel from './calander/popup/FormModel';
import FSwitch from '../../../commonComponents/f-switch';
import { useSelector } from 'react-redux';

import { t } from 'i18next';
import CustomDeleteModal from '../../../deleteAlertModal';
import { SequenceManager } from '../utils/NewLogic';

export default function IndividualOpeningHours({ data, setData, handleSave }) {
    const user = useSelector((state) => state.user.data);

    // dont change it otherwise it will not compare clots and day names
    moment.locale('en');
    moment.updateLocale('en', { week: { dow: 1 } });

    const { is_individual_opening_hour } = data;

    const [controller, setController] = useState({
        date: moment(),
        format: 'all',
    });

    const localeValue = localStorage.getItem('language');

    const [showCalander, setShowCalander] = useState(false);
    const [openFormModel, setOpenFormModel] = useState(false);
    const [formProps, setFormProps] = useState({});
    const [selectedLanguage, setSelectedLanguage] = useState('da');
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    useEffect(() => {
        if (localeValue) {
            setSelectedLanguage(localeValue);
        }
    }, [localeValue]);

    useEffect(() => {
        const currentWeekInfo = getCurrentWeekInfo(controller.date);

        setController((prev) => ({
            ...prev,
            weekNumber: currentWeekInfo?.weekNumber,
            weekDates: currentWeekInfo?.weekDates,
            weekArray: currentWeekInfo?.weekArray,
        }));
    }, [controller.date]);

    useEffect(() => {
        setShowCalander(is_individual_opening_hour);
    }, [is_individual_opening_hour]);

    const isDisable = ({ id = 0, allowToAllOnly = false }) => {
        if (user?.role == 'ADMIN') {
            return false;
        } else {
            if (user?.settings?.change_all_opening_hours) {
                return false;
            } else {
                if (allowToAllOnly) {
                    return true;
                }
                if (user?.settings?.change_own_opening_hours && user?.id === id) {
                    return false;
                }
                return true;
            }
        }
    };

    const handleOffDayRemove = () => {
        let newEmployee = formProps?.SequenceManager?.removeHoliday();

        let finalVals = {
            ...data,
            employees_opening_hour: data?.employees_opening_hour?.map((item) => {
                if (item.id === formProps?.employee?.id) {
                    return newEmployee;
                } else {
                    return item;
                }
            }),
        };

        handleSave({
            changes: finalVals,
            sectionsChanged: {
                schedule: false,
                isIndividualOpeningHour: false,
                holidays: false,
                employeesOpeningHour: true,
                employeeIds: [formProps?.employee?.id],
            },
        });
    };

    const changeIndividualOpeningHour = (e) => {
        setShowCalander(e.target.checked);

        setData({
            ...data,
            is_individual_opening_hour: e.target.checked,
        });
    };

    return (
        <Grid2 container spacing={3} sx={{ p: { xs: 2, lg: 5 } }}>
            <Grid2 size={{ xs: 12, lg: 4 }}>
                <PrimaryHeading text={t('Setting.IndividualOpeningHours')} />
                <SecondaryHeading text={t('Setting.DescriptionOfIndividualOpeningHours')} />
            </Grid2>

            <Grid2 size={{ xs: 12, lg: 8 }}>
                {(user?.role === 'ADMIN' ||
                    user?.settings.change_own_opening_hours ||
                    user?.settings.change_all_opening_hours) && (
                    <>
                        <Stack
                            display={'flex'}
                            width={'100%'}
                            flexDirection={'column'}
                            justifyContent={'start'}
                            alignItems={'start'}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                {t('Setting.IndividualOpeningHours')}
                            </Typography>

                            <FSwitch
                                sx={{ mx: 0 }}
                                disabled={user?.role !== 'ADMIN' && isDisable({ id: user?.id, allowToAllOnly: true })}
                                checked={showCalander}
                                onChange={(e) => changeIndividualOpeningHour(e)}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        </Stack>
                    </>
                )}
                {showCalander && (
                    <React.Fragment>
                        <Shifter controller={controller} setController={setController} />
                        <Stack position={'relative'}>
                            <CalendarComponent
                                data={data}
                                controller={controller}
                                selectedLanguage={selectedLanguage}
                                setFormProps={setFormProps}
                                setOpenFormModel={(item) => {
                                    const { openModel, formProps, openDeleteModal } = item;
                                    const sequence = new SequenceManager({
                                        ...formProps,
                                        employees_opening_hour: data?.employees_opening_hour,
                                    });

                                    setFormProps({ ...formProps, SequenceManager: sequence });
                                    setOpenFormModel(openModel);
                                    setOpenDeleteModal(openDeleteModal);
                                }}
                            />
                        </Stack>

                        {/* <Stack mt= {10} display={"flex"} width={"100%"} flexDirection={"column"} justifyContent={"start"} alignItems={"start"} mr={'auto'}>
                            <HolidaysList data={data.employees_opening_hour} setData={setData} />
                        </Stack> */}
                    </React.Fragment>
                )}
            </Grid2>

            {openFormModel && (
                <FormModel
                    formProps={formProps}
                    StateData={data}
                    handleSave={handleSave}
                    open={openFormModel}
                    onClose={() => setOpenFormModel(false)}
                />
            )}

            {openDeleteModal && (
                <CustomDeleteModal
                    open={openDeleteModal}
                    handleClose={() => {
                        setOpenDeleteModal(false);
                    }}
                    title={t('Setting.DelHoliday')}
                    description={t('Setting.DelHolidayDesc')}
                    onClickDismiss={() => {
                        setOpenDeleteModal(false);
                    }}
                    onClickConfirm={() => {
                        handleOffDayRemove();
                        setOpenDeleteModal(false);
                    }}
                />
            )}
        </Grid2>
    );
}
