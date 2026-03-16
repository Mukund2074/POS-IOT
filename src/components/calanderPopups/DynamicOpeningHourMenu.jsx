import { CircularProgress, Menu, Stack, Typography, Popover } from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import CustomTimePicker from '../settings/commonTimePicker';
import { t } from 'i18next';
import FSwitch from '../commonComponents/f-switch';
import FButton from '../commonComponents/F_Button';
import { useFormik } from 'formik';
import { CalendarHandler } from '../../scenes/Calendar/CalendarUtils/CalendarHandlers';
import * as Yup from 'yup';

export default function DynamicOpeningHourMenu({
    loader,
    anchorEl,
    open,
    onClose,
    setAnchorEl,
    selectedDate,
    setOpeningHourEmp,
    openingHourEmp,
    settingResource = {},
    setLoader = () => {},
    componentType = 'menu', // 'menu' or 'popover'
}) {
    const [initialValues, setInitialValues] = useState({
        start_time: null,
        end_time: null,
        allow_booking: false,
        start_break_time: null,
        end_break_time: null,
    });

    // Use appropriate date based on view
    const currentDate = moment(selectedDate).format('YYYY-MM-DD');

    // Use appropriate employee data based on view
    const employeeName = openingHourEmp?.existing?.name;

    const validationSchema = Yup.object().shape({
        allow_booking: Yup.bool(),
        start_time: Yup.string()
            .nullable()
            .when('allow_booking', {
                is: true,
                then: (schema) => schema.required(t('SpOffers.YupErrStartTimeRequired')),
            }),
        end_time: Yup.string()
            .nullable()
            .when('allow_booking', {
                is: true,
                then: (schema) => schema.required(t('SpOffers.YupErrEndingTimeRequired')),
            }),
    });

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            CalendarHandler.handleOpeningHourChange({
                start_time: values.start_time,
                end_time: values.end_time,
                start_break_time: values.start_break_time,
                end_break_time: values.end_break_time,
                onLeave: !values.allow_booking,
                setOpeningHourEmp,
                openingHourEmp,
                anchorEl: componentType === 'popover' ? { id: openingHourEmp?.existing?.id } : anchorEl,
                settingResource: settingResource,
                setLoader,
                currentDate,
            });

            setAnchorEl && setAnchorEl(null);
            onClose();
        },
    });

    useEffect(() => {
        setInitialValues({
            start_time: openingHourEmp?.event?.start_time
                ? moment(`${currentDate} ${openingHourEmp?.event?.start_time}`, 'YYYY-MM-DD HH:mm:ss')
                : null,
            end_time: openingHourEmp?.event?.end_time
                ? moment(`${currentDate} ${openingHourEmp?.event?.end_time}`, 'YYYY-MM-DD HH:mm:ss')
                : null,
            allow_booking:
                !openingHourEmp?.event?.off_days?.includes(moment(selectedDate).format('YYYY-MM-DD')) &&
                openingHourEmp?.event?.start_time &&
                openingHourEmp?.event?.end_time
                    ? true
                    : false,
        });
    }, [openingHourEmp, selectedDate]);

    useEffect(() => {
        const { start_time, end_time } = formik.values;
        const start_break_time = openingHourEmp?.event?.start_break_time
            ? moment(`${currentDate} ${openingHourEmp?.event?.start_break_time}`, 'YYYY-MM-DD HH:mm:ss')
            : null;
        const end_break_time = openingHourEmp?.event?.end_break_time
            ? moment(`${currentDate} ${openingHourEmp?.event?.end_break_time}`, 'YYYY-MM-DD HH:mm:ss')
            : null;
        if (start_time && end_time && start_break_time && end_break_time) {
            // Check if break falls between start and end time
            if (
                start_break_time.isBetween(start_time, end_time, null, '[]') &&
                end_break_time.isBetween(start_time, end_time, null, '[]')
            ) {
                formik.setFieldValue('start_break_time', start_break_time.format('HH:mm:ss'));
                formik.setFieldValue('end_break_time', end_break_time.format('HH:mm:ss'));
            }
        }
    }, [formik.values.start_time, formik.values.end_time]);

    const showButton = () => {
        if (formik?.dirty && formik?.values?.allow_booking) {
            if (formik?.values?.start_time && formik?.values?.end_time) {
                return true;
            }
        } else if (formik?.dirty && !formik?.values?.allow_booking) {
            return true;
        }
        return false;
    };

    const renderContent = () => (
        <React.Fragment>
            {loader ? (
                <Stack sx={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    <CircularProgress size="2.5rem" color="inherit" />
                </Stack>
            ) : (
                <Stack
                    sx={{
                        width: '100%',
                        display: anchorEl ? 'flex' : 'none',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        p: 2,
                    }}
                >
                    {/* Employee Name */}
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                        {employeeName}
                    </Typography>

                    {/* Date */}
                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
                        {moment(selectedDate).format('dddd - DD/MM/YYYY')}
                    </Typography>

                    {/* Time Pickers */}
                    <Stack
                        display={'flex'}
                        flexDirection="row"
                        alignItems="center"
                        justifyContent={'center'}
                        sx={{ mt: 1 }}
                    >
                        <Stack sx={{ width: '30%' }}>
                            <CustomTimePicker
                                value={formik.values?.start_time}
                                disabled={!formik?.values?.allow_booking}
                                name="start_time"
                                id="start_time"
                                onBlur={formik.handleBlur}
                                onChange={(time) => {
                                    const realTime = moment(
                                        `${currentDate} ${time.format('HH:mm:ss')}`,
                                        'YYYY-MM-DD HH:mm:ss',
                                    );
                                    formik.setValues({ ...formik.values, start_time: realTime });
                                }}
                                borderRadius={{
                                    topLeft: '13px',
                                    topRight: '0px',
                                    bottomLeft: '0px',
                                    bottomRight: '13px',
                                }}
                                sx={{ width: '100%' }}
                            />
                        </Stack>

                        <Stack
                            sx={{
                                width: '10%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderTop: '1px solid #d1d1d1',
                                borderBottom: '1px solid #d1d1d1',
                                height: 40,
                            }}
                        >
                            <Typography
                                style={{ width: 'full', size: '20px', color: '#1F1F1F', padding: '6px 0px 8px 0px' }}
                            >
                                {t('Common.To')}
                            </Typography>
                        </Stack>

                        <Stack sx={{ width: '30%' }}>
                            <CustomTimePicker
                                value={formik.values?.end_time}
                                disabled={!formik?.values?.allow_booking}
                                name="end_time"
                                id="end_time"
                                onBlur={formik.handleBlur}
                                onChange={(time) => {
                                    const realTime = moment(
                                        `${currentDate} ${time.format('HH:mm:ss')}`,
                                        'YYYY-MM-DD HH:mm:ss',
                                    );
                                    formik.setValues({ ...formik.values, end_time: realTime });
                                }}
                                borderRadius={{
                                    topLeft: '0px',
                                    topRight: '13px',
                                    bottomLeft: '13px',
                                    bottomRight: '0px',
                                }}
                                sx={{ width: '100%' }}
                            />
                        </Stack>
                    </Stack>

                    {/* Error Messages */}
                    {formik.errors?.end_time && formik?.touched?.end_time && (
                        <Typography sx={{ color: 'red', fontSize: '0.75rem' }}>{formik.errors?.end_time}</Typography>
                    )}
                    {formik.errors?.start_time && formik?.touched?.start_time && (
                        <Typography sx={{ color: 'red', fontSize: '0.75rem' }}>{formik.errors?.start_time}</Typography>
                    )}

                    {/* Allow Booking Switch */}
                    <FSwitch
                        checked={formik.values?.allow_booking}
                        onChange={(e) => {
                            if (formik?.values?.allow_booking) {
                                formik.setValues({
                                    ...formik.values,
                                    start_time: null,
                                    end_time: null,
                                    allow_booking: false,
                                });
                            } else {
                                formik.setValues({
                                    ...formik.values,
                                    start_time: null,
                                    end_time: null,
                                    allow_booking: true,
                                });
                            }
                        }}
                        label={t('Calendar.AllowBk')}
                        sx={{ mt: 1 }}
                    />

                    {/* <FSwitch  */}

                    {/* Save Button */}
                    {showButton() && (
                        <FButton
                            variant={'save'}
                            title={t('Customer.SaveCh')}
                            sx={{ mt: 1 }}
                            onClick={() => {
                                formik?.handleSubmit();
                            }}
                        />
                    )}
                </Stack>
            )}
        </React.Fragment>
    );

    // Render as Popover for week view or Menu for day view
    if (componentType === 'popover') {
        return (
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => {
                    formik.resetForm();
                    onClose();
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: {
                        minWidth: 300,
                        maxWidth: 400,
                        borderRadius: 3,
                        backgroundColor: 'white',
                    },
                }}
                BackdropProps={{
                    invisible: false,
                }}
            >
                {renderContent()}
            </Popover>
        );
    }

    // Render as Menu for day view (default)
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => {
                formik.resetForm();
                onClose();
            }}
            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
            PaperProps={{
                sx: {
                    minWidth: 300,
                    borderRadius: 2,
                    maxWidth: 400,
                },
            }}
        >
            {renderContent()}
        </Menu>
    );
}
