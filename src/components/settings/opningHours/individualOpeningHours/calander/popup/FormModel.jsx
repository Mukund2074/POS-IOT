import { Close } from '@mui/icons-material';
import { Box, Grid2, IconButton, Modal, Paper, Stack, Typography } from '@mui/material';
import CommonButton from '../../../../commonButton';
import React, { useEffect, useState } from 'react';
import PrimaryHeading from '../../../../commonPrimaryHeading';
import CustomSelect from '../../../../commonCustomSelect';
import CustomDatePicker from '../../../../commonDatePicker';
import CustomTimePicker from '../../../../commonTimePicker';
import moment from 'moment';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { t } from 'i18next';
import FSwitch from '../../../../../commonComponents/f-switch';
import { useSelector } from 'react-redux';
import FSelect from '../../../../../commonComponents/F_Select';
import SaveModal from '../../../../../customer/customerDetail/Advanced-journal/popup/SaveModal';

export default function FormModel({ open, onClose, formProps, handleSave, StateData }) {
    const user = useSelector((state) => state.user.data);
    const settings = useSelector((state) => state.settings.data);
    const [confirmModal, setConfirmModal] = useState(false);
    const [updateType, setUpdateType] = useState(null);
    const [removeModal, setRemoveModal] = useState(false);

    const employee =
        settings &&
        settings?.employees &&
        settings?.employees?.map((item) => ({ ...item, value: item.id, label: item.name }));

    const SequenceManager = formProps?.SequenceManager;

    useEffect(() => {
        if (open) {
            const { event, employee, detailId } = formProps;
            // setEmpID(employee?.id)
            if (formProps.event) {
                formik.setValues({
                    id: event?.id ?? null,
                    detailId: detailId,
                    employee_id: detailId ? event?.employee_id : [event?.employee_id],
                    start_date: event?.start_date ? moment(event?.start_date) : null,
                    start_time: event?.start_time ? moment(event?.start_time, 'HH:mm:ss') : null,
                    end_date: event?.end_date ? moment(event?.end_date) : null,
                    end_time: event?.end_time ? moment(event?.end_time, 'HH:mm:ss') : null,
                    repeat: event?.repeat === null ? 'DO_NOT_REPEAT' : event?.repeat,
                    add_break: event?.add_break || false,
                    start_break_time: event?.start_break_time ? moment(event?.start_break_time, 'HH:mm:ss') : null,
                    end_break_time: event?.end_break_time ? moment(event?.end_break_time, 'HH:mm:ss') : null,
                    quit: event?.end_date === null ? 'NEVER_QUIT' : 'TIME',
                    off_days: event?.off_days,
                    additional_days: event?.additional_days,
                });
            } else {
                formik.setValues({
                    id: null,
                    detailId: detailId,
                    employee_id: detailId ? employee?.id : [employee?.id],
                    start_date: formProps?.weekday,
                    start_time: null,
                    end_date: null,
                    end_time: null,
                    repeat: 'DO_NOT_REPEAT',
                    add_break: false,
                    start_break_time: null,
                    end_break_time: null,
                    quit: 'NEVER_QUIT',
                    off_days: [],
                    additional_days: {},
                });
            }
        }
    }, [open]);

    // const validationSchema = Yup.object({
    //     // start_date , start_time, end_date , end_time , repeat , add_break , start_break_time , end_break_time ,
    //     employee_id: Yup.lazy((value) => {
    //         // If formprops.detailId exists, validate as a string
    //         if (formProps.detailId) {
    //             return Yup.string()
    //                 .required(t("Setting.PleaseSelectAnEmployee"))
    //                 .typeError(t("Setting.PleaseSelectAValidEmployee"));
    //         }
    //         // Otherwise, validate as an array
    //         return Yup.array()
    //             .required(t("Setting.PleaseSelectAnEmployee"))
    //             .typeError(t("Setting.PleaseSelectAValidEmployee"));
    //     }),

    //     start_date: Yup.date()
    //         .required(t("Setting.PleaseSelectAStartDate"))
    //         .typeError(t("Setting.PleaseSelectAValidStartDate")),

    //     start_time: Yup.string()
    //         .required(t("Setting.PleaseSelectAStartTime"))
    //         .typeError(t("Setting.PleaseSelectAValidStartTime")),

    //     end_time: Yup.string()
    //         .typeError(t("Setting.PleaseSelectAValidEndTime")),

    //     // end_date: Yup.date()
    //     // .required("Please select a end date")
    //     //     .typeError("Please select a valid end date"),

    //     repeat: Yup.string()
    //         .nullable()
    //         .typeError(t("Setting.PleaseSelectAValidRepeat")),

    //     add_break: Yup.boolean()
    //         .typeError(t("Setting.PleaseSelectAValidAddBreak")),

    //     start_break_time: Yup.string()
    //         .when("add_break", {
    //             is: true,
    //             then: Yup.string().required(t("Setting.PleaseSelectAStartOfBreak")).nullable(),
    //         })
    //         .typeError(t("Setting.PleaseSelectAValidStartOfBreak"))
    //         .nullable(),

    //     end_break_time: Yup.string()
    //         .when("add_break", {
    //             is: true,
    //             then: Yup.string().required(t("Setting.PleaseSelectAnEndOfBreak")).nullable(),
    //         })
    //         .typeError(t("Setting.PleaseSelectAValidEndOfBreak"))
    //         .nullable(),

    //     quit: Yup.string()
    //         .when("repeat", {
    //             is: (repeat) => repeat !== "DO_NOT_REPEAT",
    //             then: Yup.string().required(t("Setting.PleaseSelectaQuitOption")),
    //             otherwise: Yup.string(),
    //         })
    //         .typeError(t("Setting.PleaseSelectAValidQuitOption")),

    //     end_date: Yup.string()
    //         .when("quit", {
    //             is: 'TIME',
    //             then: Yup.string().required(t("Setting.PleaseSelectEndDate")).typeError(t("Setting.PleaseSelectAValidEndDate")).nullable(),
    //         })
    //         .typeError(t("Setting.PleaseSelectAValidEndDate"))
    //         .nullable(),

    // })

    const validationSchema = Yup.object({
        employee_id: Yup.lazy((value) => {
            if (formProps.detailId) {
                return Yup.string()
                    .required(t('Setting.PleaseSelectAnEmployee'))
                    .typeError(t('Setting.PleaseSelectAValidEmployee'));
            }
            return Yup.array()
                .required(t('Setting.PleaseSelectAnEmployee'))
                .typeError(t('Setting.PleaseSelectAValidEmployee'));
        }),

        start_date: Yup.date()
            .required(t('Setting.PleaseSelectAStartDate'))
            .typeError(t('Setting.PleaseSelectAValidStartDate'))
            .test('isBeforeEndDate', t('Setting.YupStDateBfr'), function (value) {
                const { end_date } = this.parent;
                return !value || !end_date || moment(value).isSameOrBefore(moment(end_date));
            }),

        start_time: Yup.string()
            .required(t('Setting.PleaseSelectAStartTime'))
            .typeError(t('Setting.PleaseSelectAValidStartTime')),

        end_time: Yup.string()
            .typeError(t('Setting.PleaseSelectAValidEndTime'))
            .test('isAfterStartTime', t('Setting.YupEnTimeAftr'), function (value) {
                const { start_time } = this.parent;
                return !value || !start_time || moment(value).isAfter(moment(start_time));
            }),

        repeat: Yup.string().nullable().typeError(t('Setting.PleaseSelectAValidRepeat')),

        add_break: Yup.boolean().typeError(t('Setting.PleaseSelectAValidAddBreak')),

        start_break_time: Yup.string()
            .when('add_break', {
                is: true,
                then: Yup.string()
                    .required(t('Setting.PleaseSelectAStartOfBreak'))
                    .nullable()
                    .test('isBetweenStartAndEndTime', t('Setting.YupStBrTTimeBtwn'), function (value) {
                        const { start_time, end_time } = this.parent;
                        return (
                            !value ||
                            !start_time ||
                            !end_time ||
                            moment(value).isBetween(moment(start_time), moment(end_time))
                        );
                    }),
                otherwise: Yup.string().nullable(),
            })
            .typeError(t('Setting.PleaseSelectAValidStartOfBreak'))
            .nullable(),

        end_break_time: Yup.string()
            .when('add_break', {
                is: true,
                then: Yup.string()
                    .required(t('Setting.PleaseSelectAnEndOfBreak'))
                    .nullable()
                    .test('isBetweenStartAndEndTime', t('Setting.YupEnBrTTimeBtwn'), function (value) {
                        const { start_time, end_time } = this.parent;
                        return (
                            !value ||
                            !start_time ||
                            !end_time ||
                            moment(value).isBetween(moment(start_time), moment(end_time))
                        );
                    }),
                otherwise: Yup.string().nullable(),
            })
            .typeError(t('Setting.PleaseSelectAValidEndOfBreak'))
            .nullable(),

        quit: Yup.string()
            .when('repeat', {
                is: (repeat) => repeat !== 'DO_NOT_REPEAT',
                then: Yup.string().required(t('Setting.PleaseSelectaQuitOption')),
                otherwise: Yup.string(),
            })
            .typeError(t('Setting.PleaseSelectAValidQuitOption')),

        end_date: Yup.string()
            .when('quit', {
                is: 'TIME',
                then: Yup.string()
                    .required(t('Setting.PleaseSelectEndDate'))
                    .typeError(t('Setting.PleaseSelectAValidEndDate'))
                    .nullable()
                    .test('isAfterStartDate', t('Setting.YupEnDateAftr'), function (value) {
                        const { start_date } = this.parent;
                        return !value || !start_date || moment(value).isSameOrAfter(moment(start_date));
                    }),
            })
            .typeError(t('Setting.PleaseSelectAValidEndDate'))
            .nullable(),
    });

    const formik = useFormik({
        initialValues: {
            id: null,
            detailId: null,
            employee_id: [],
            start_date: null,
            start_time: null,
            end_date: null,
            end_time: null,
            repeat: 'DO_NOT_REPEAT',
            add_break: false,
            start_break_time: null,
            end_break_time: null,
            quit: 'NEVER_QUIT',
            off_days: [],
            additional_days: {},
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

    const handleSubmit = (values) => {
        // const { employee, event, detailId } = formProps

        // make final values for every employe id which is selected

        let finalValues = formProps?.detailId !== null ? null : [];

        if (formProps?.detailId === null) {
            formik.values?.employee_id?.forEach((item) => {
                finalValues.push({
                    ...values,
                    id: values?.id ?? `ev-${moment().valueOf()}`,
                    employee_id: item,
                    repeat: values?.repeat === 'DO_NOT_REPEAT' ? null : values?.repeat,
                    start_date: values?.start_date ? moment(values?.start_date).format('YYYY-MM-DD') : null,
                    end_date:
                        values?.end_date && (values?.repeat !== 'DO_NOT_REPEAT' || values?.repeat !== null)
                            ? moment(values?.end_date).format('YYYY-MM-DD')
                            : null,
                    start_time: values?.start_time ? moment(values?.start_time).format('HH:mm:ss') : null,
                    start_break_time:
                        values?.add_break && values?.start_break_time
                            ? moment(values?.start_break_time).format('HH:mm:ss')
                            : null,
                    end_break_time:
                        values?.add_break && values?.end_break_time
                            ? moment(values?.end_break_time).format('HH:mm:ss')
                            : null,
                    end_time: values?.end_time ? moment(values?.end_time).format('HH:mm:ss') : null,
                    add_break: values?.add_break,
                });
            });
        } else {
            finalValues = [
                {
                    ...values,
                    id: values?.id ?? `ev-${moment().valueOf()}`,
                    employee_id: values?.employee_id,
                    repeat: values?.repeat === 'DO_NOT_REPEAT' ? null : values?.repeat,
                    start_date: values?.start_date ? moment(values?.start_date).format('YYYY-MM-DD') : null,
                    end_date:
                        values?.end_date && (values?.repeat !== 'DO_NOT_REPEAT' || values?.repeat !== null)
                            ? moment(values?.end_date).format('YYYY-MM-DD')
                            : null,
                    start_time: values?.start_time ? moment(values?.start_time).format('HH:mm:ss') : null,
                    start_break_time:
                        values?.add_break && values?.start_break_time
                            ? moment(values?.start_break_time).format('HH:mm:ss')
                            : null,
                    end_break_time:
                        values?.add_break && values?.end_break_time
                            ? moment(values?.end_break_time).format('HH:mm:ss')
                            : null,
                    end_time: values?.end_time ? moment(values?.end_time).format('HH:mm:ss') : null,
                    add_break: values?.add_break,
                },
            ];
        }

        // setData({
        //     ...data,
        //     employees_opening_hour: updatedEmployees,
        //     is_individual_opening_hour: showCalander

        // })

        const update = SequenceManager.updateDetail(finalValues, updateType);

        let finalVals = {
            ...StateData,
            employees_opening_hour: update,
        };
        handleSave({
            changes: finalVals,
            sectionsChanged: {
                schedule: false,
                isIndividualOpeningHour: false,
                holidays: false,
                employeesOpeningHour: true,
                employeeIds: Array.isArray(formik.values?.employee_id)
                    ? formik.values?.employee_id
                    : [formik.values?.employee_id],
            },
        });
        onClose();
    };

    const checkPermission = () => {
        if (user?.role !== 'ADMIN' && !user?.settings?.change_all_opening_hours) {
            if (user?.settings?.change_own_opening_hours && user?.id === formProps?.employee?.id) {
                return true;
            }
            return false;
        }
        return true;
    };

    const handleSelectEmployee = (e) => {
        const selectedValues = e.target.value;
        let allID = employee?.map((data) => data.value) || [];

        if (formProps?.detailId !== null) {
            formik.setFieldValue('employee_id', selectedValues ?? '');
            return;
        }

        if (
            (selectedValues === 0 || selectedValues.includes(0)) &&
            allID.length === formik?.values?.employee_id?.length
        ) {
            formik.setFieldValue('employee_id', []);
        } else if (selectedValues === 0 || selectedValues.includes(0)) {
            formik.setFieldValue('employee_id', allID);
        } else if (selectedValues.length === 0) {
            formik.setFieldValue('employee_id', []);
        } else {
            formik.setFieldValue('employee_id', selectedValues ?? []);
        }
    };

    const FormField = ({ label, component, error }) => (
        <React.Fragment>
            <Grid2 size={{ xs: 12, md: 4 }}>
                <Typography
                    variant="body1"
                    sx={{ fontSize: 18, fontWeight: 700, color: '#1F1F1F', textAlign: { xs: 'left', md: 'right' } }}
                >
                    {label}
                </Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 8 }}>
                {component}
                {error && (
                    <Typography variant="caption" color="red">
                        {error}
                    </Typography>
                )}
            </Grid2>
        </React.Fragment>
    );

    // new Addon Class useage
    const handleRemoveSequence = () => {
        const result = SequenceManager?.removeDetail();

        let finalVals = {
            ...StateData,
            employees_opening_hour: StateData?.employees_opening_hour?.map((item) => {
                if (item.id === formProps?.employee?.id) {
                    return result;
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
                employeeIds: Array.isArray(formik.values?.employee_id)
                    ? formik.values?.employee_id
                    : [formik.values?.employee_id],
            },
        });
        onClose();
    };

    const handleAddHoliday = () => {
        const result = SequenceManager?.addHoliday();

        let finalVals = {
            ...StateData,
            employees_opening_hour: StateData?.employees_opening_hour?.map((item) => {
                if (item.id === formProps?.employee?.id) {
                    return result;
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
                employeeIds: Array.isArray(formik.values?.employee_id)
                    ? formik.values?.employee_id
                    : [formik.values?.employee_id],
            },
        });
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            disableAutoFocus
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 21 }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    width: 'auto',
                    maxWidth: { xs: '90%', md: '60%' },
                    maxHeight: '80%',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    padding: 4,
                    px: 1,
                    bgcolor: '#fff',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Close sx={{ color: '#a2a2a2' }} />
                </IconButton>

                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PrimaryHeading text={t('Setting.AddAnIndividualOpeningHour')} />
                </Box>

                <Grid2 container spacing={2} columnSpacing={4} marginTop={5} sx={{ p: 2 }}>
                    {/* Employee */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                        }}
                    >
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <Typography
                                variant="body1"
                                sx={{ fontWeight: 700, color: '#1F1F1F', textAlign: { xs: 'left', md: 'right' } }}
                            >
                                {t('Setting.Employee')}
                            </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <FSelect
                                backgroundColor="#fff"
                                isMultiSelect={formProps?.detailId ? false : true}
                                value={formProps?.detailId ? formik?.values?.employee_id : formik?.values?.employee_id}
                                TextToDisplayWithCount={`${t('Common.Employees')}`}
                                sx={{ width: '100%', height: 40 }}
                                onChange={handleSelectEmployee}
                                placeholderText={t('Common.SelectEmployee')}
                                selectAllRenderCheckBoxText={t('Common.AllEmployees')}
                                options={employee}
                                padding={formProps?.detailId ? 1 : 0}
                            />
                            {formik.touched.employee_id && formik.errors.employee_id && (
                                <Typography variant="caption" color="red">
                                    {formik.errors.employee_id}
                                </Typography>
                            )}
                        </Grid2>
                    </Grid2>

                    {/* Add break */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                        }}
                    >
                        {(user?.role === 'ADMIN' ||
                            user?.settings.change_own_opening_hours ||
                            user?.settings.change_all_opening_hours) && (
                            <FormField
                                label={t('Setting.AddBreak')}
                                component={
                                    <FSwitch
                                        disabled={!checkPermission()}
                                        sx={{
                                            '& .MuiSwitch-switchBase': {
                                                '&.Mui-checked': { color: '#fff' },
                                                '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#44B904' },
                                            },
                                            '& .MuiSwitch-track': { backgroundColor: '#D9D9D9' },
                                        }}
                                        checked={formik?.values?.add_break}
                                        onChange={(e) => formik.setFieldValue('add_break', !formik.values.add_break)}
                                    />
                                }
                            />
                        )}
                    </Grid2>

                    {/* Start date */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: { xs: 'flex-start', md: 'flex-end' },
                            gap: 1,
                        }}
                    >
                        <FormField
                            label={
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Setting.StartDate')}
                                </Typography>
                            }
                            component={
                                // <span style={{ width: '50%', overflow: 'hidden', border: '2px solid #d2d2d2', borderRadius: 8, padding: '2px' }} >
                                <CustomDatePicker
                                    disabled={!checkPermission()}
                                    borderThickness="0px"
                                    value={formik.values.start_date}
                                    format="DD/MM-YYYY"
                                    sx={{ width: '100%' }}
                                    onChange={(e) => formik.setFieldValue('start_date', e)}
                                />
                                // </span>
                            }
                            error={formik.touched.start_date && formik.errors.start_date}
                        />
                    </Grid2>

                    {/* Start break time */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                        }}
                    >
                        {formik.values.add_break && (
                            <FormField
                                // label="Start Break Time"
                                label={
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t('Setting.StartOfBreak')}
                                    </Typography>
                                }
                                component={
                                    <CustomTimePicker
                                        disabled={!checkPermission()}
                                        borderThickness="0px"
                                        value={formik.values.start_break_time}
                                        format="HH:mm"
                                        onChange={(e) => formik.setFieldValue('start_break_time', e)}
                                        sx={{ width: '65%' }}
                                    />
                                }
                                error={formik.touched.start_break_time && formik.errors.start_break_time}
                            />
                        )}
                    </Grid2>

                    {/* Start time */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                        }}
                    >
                        <FormField
                            // label="Start Time"
                            label={
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Setting.StartOfDay')}
                                </Typography>
                            }
                            component={
                                // <span style={{ width: '35%', overflow: 'hidden', border: '2px solid #d2d2d2', borderRadius: 8, padding: '2px' }} >
                                <CustomTimePicker
                                    disabled={!checkPermission()}
                                    borderThickness="0px"
                                    value={formik.values.start_time}
                                    format="HH:mm"
                                    onChange={(e) => formik.setFieldValue('start_time', e)}
                                    sx={{ width: '65%' }}
                                />
                                // </span>
                            }
                            error={formik.touched.start_time && formik.errors.start_time}
                        />
                    </Grid2>

                    {/* End break time */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                        }}
                    >
                        {formik.values.add_break && (
                            <FormField
                                // label="End Break Time"
                                label={
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t('Setting.EndOfBreak')}
                                    </Typography>
                                }
                                component={
                                    // <span style={{ width: '35%', overflow: 'hidden', border: '2px solid #d2d2d2', borderRadius: 8, padding: '2px' }} >
                                    <CustomTimePicker
                                        disabled={!checkPermission()}
                                        borderThickness="0px"
                                        value={formik.values.end_break_time}
                                        format="HH:mm"
                                        onChange={(e) => formik.setFieldValue('end_break_time', e)}
                                        sx={{ width: '65%' }}
                                    />
                                    // </span>
                                }
                                error={formik.touched.end_break_time && formik.errors.end_break_time}
                            />
                        )}
                    </Grid2>

                    {/* End time */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                        }}
                    >
                        <FormField
                            // label="End Time"
                            label={
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Setting.EndOfDay')}
                                </Typography>
                            }
                            component={
                                // <span style={{ width: '35%', overflow: 'hidden', border: '2px solid #d2d2d2', borderRadius: 8, padding: '2px' }} >
                                <CustomTimePicker
                                    disabled={!checkPermission()}
                                    borderThickness="0px"
                                    value={formik.values.end_time}
                                    format="HH:mm"
                                    onChange={(e) => formik.setFieldValue('end_time', e)}
                                    sx={{ width: '65%' }}
                                />
                                // </span>
                            }
                            error={formik.touched.end_time && formik.errors.end_time}
                        />
                    </Grid2>

                    {/* End date */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                        }}
                    >
                        {formik.values.repeat !== 'DO_NOT_REPEAT' && (
                            <FormField
                                // label="Quit"
                                label={
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t('Setting.Repeat')}
                                    </Typography>
                                }
                                component={
                                    <CustomSelect
                                        disabled={!checkPermission()}
                                        mt={0}
                                        value={formik.values.quit}
                                        name="quit"
                                        onChange={(e) => {
                                            formik.setFieldValue('quit', e.target.value);
                                        }}
                                        options={[
                                            { value: 'NEVER_QUIT', label: t('Setting.NeverQuit') },
                                            { value: 'TIME', label: t('Setting.StopOntDate') },
                                        ]}
                                        sx={{ width: '85%' }}
                                    />
                                }
                            />
                        )}
                    </Grid2>

                    {/* Repeat */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                        }}
                    >
                        <FormField
                            label={
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                    {t('Setting.Repeat')}
                                </Typography>
                            }
                            component={
                                // <span>
                                <CustomSelect
                                    disabled={!checkPermission()}
                                    mt={0}
                                    value={formik.values.repeat}
                                    name="repeat"
                                    onChange={(e) => {
                                        formik.setFieldValue('repeat', e.target.value);
                                        if (e.target.value === 'DO_NOT_REPEAT') {
                                            formik.setFieldValue('quit', 'NEVER_QUIT');
                                        }
                                    }}
                                    options={[
                                        { value: 'DO_NOT_REPEAT', label: t('Setting.NeverRepeat') },
                                        { value: 'WEEK', label: t('Setting.Weekly') },
                                        { value: 'EVEN', label: t('Setting.Even Weeks') },
                                        { value: 'ODD', label: t('Setting.Odd Weeks') },
                                        { value: 'MONTH', label: t('Setting.Monthly') },
                                    ]}
                                    sx={{ width: '100%', Height: 40 }}
                                />
                                // </span>
                            }
                            error={formik.touched.repeat && formik.errors.repeat}
                        />
                    </Grid2>

                    {/* Quit */}
                    <Grid2
                        size={{ xs: 12, md: 6 }}
                        sx={{
                            p: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: { md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                        }}
                    >
                        {/* {formik.values.repeat !== 'DO_NOT_REPEAT' && (
                                    <FormField
                                        // label="Quit"
                                        label={<Typography variant='body1' sx={{fontWeight:700,  color:'#1f1f1f'}}>Quit</Typography>}
                                        component={
                                            <span>
                                                <CustomSelect
                                                    mt={0}
                                                    value={formik.values.quit}
                                                    name="quit"
                                                    onChange={(e) => formik.setFieldValue('quit', e.target.value)}
                                                    options={[
                                                        { value: 'NEVER_QUIT', label: 'Never quit' },
                                                        { value: 'TIME', label: 'Stop on a specific time' },
                                                    ]}
                                                />
                                            </span>
                                        }
                                    />
                                )} */}

                        {formik.values.quit === 'TIME' && (
                            <FormField
                                // label="End Date"
                                label={
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                        {t('Setting.EndDate')}
                                    </Typography>
                                }
                                component={
                                    // <span style={{ width: '50%', overflow: 'hidden', border: '2px solid #d2d2d2', borderRadius: 8, padding: '2px' }} >
                                    <CustomDatePicker
                                        borderThickness="0px"
                                        value={formik.values.end_date}
                                        format="DD/MM-YYYY"
                                        sx={{ width: '82%' }}
                                        onChange={(e) => formik.setFieldValue('end_date', e)}
                                    />
                                    // </span>
                                }
                                error={formik.touched.end_date && formik.errors.end_date}
                            />
                        )}
                    </Grid2>
                </Grid2>

                {checkPermission() && (
                    <React.Fragment>
                        <Stack
                            sx={{
                                backgroundColor: '#FFFFFF',
                                width: '100%',
                                display: 'flex',
                                gap: 2,
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'center',
                                alignItems: { md: 'center' },
                                mt: 4,
                            }}
                        >
                            {formik.values.id && (
                                <React.Fragment>
                                    <CommonButton
                                        title={t('Setting.RmSer')}
                                        onClick={() => setRemoveModal(true)}
                                        backgroundColor="#D30000"
                                        height={40}
                                        style={{ width: { xs: '100%', md: 'auto' } }}
                                    />
                                </React.Fragment>
                            )}
                            <CommonButton
                                title={formProps?.event ? t('Setting.UpdateOpeningHour') : t('Setting.AddOpeningHour')}
                                onClick={() => {
                                    const isStartTimeChanged =
                                        moment(formProps?.event?.start_time).format('HH:mm') !==
                                        moment(formik.values.start_time).format('HH:mm');
                                    const isEndTimeChanged =
                                        moment(formProps?.event?.end_time).format('HH:mm') !==
                                        moment(formik.values.end_time).format('HH:mm');
                                    const isStartBreakTimeChanged =
                                        formProps?.event?.start_break_time &&
                                        moment(formProps?.event?.start_break_time).format('HH:mm') !==
                                            formik.values.start_break_time;
                                    const isEndBreakTimeChanged =
                                        formProps?.event?.end_break_time &&
                                        moment(formProps?.event?.end_break_time).format('HH:mm') !==
                                            formik.values.end_break_time;

                                    const areSpecificFieldsChanged =
                                        isStartTimeChanged ||
                                        isEndTimeChanged ||
                                        isStartBreakTimeChanged ||
                                        isEndBreakTimeChanged;

                                    if (!formProps.detailId || !areSpecificFieldsChanged) {
                                        formik.handleSubmit();
                                    } else {
                                        setConfirmModal(true);
                                    }
                                }}
                                style={{ width: { xs: '100%', md: 'auto' } }}
                                backgroundColor="#44B904"
                                height={40}
                            />
                        </Stack>
                    </React.Fragment>
                )}

                {confirmModal && (
                    <SaveModal
                        open={confirmModal}
                        handleClose={() => setConfirmModal(false)}
                        title={t('Setting.UpdateOpeningHour')}
                        onClickDismiss={() => {
                            setUpdateType('occurrence');
                            formik.handleSubmit();
                            setConfirmModal(false);
                        }}
                        onClickConfirm={() => {
                            setUpdateType('series');
                            formik.handleSubmit();
                            setConfirmModal(false);
                        }}
                        description={t('Setting.MakeAChoice2')}
                        dismissColor={'#fff'}
                        dismissText={t('Setting.ThEve')}
                        dismissBg={'#E19957'}
                        ConfirmText={t('Setting.ThSer')}
                        ConfirmBg={'#44B904'}
                    />
                )}

                {removeModal && (
                    <SaveModal
                        open={removeModal}
                        handleClose={() => setRemoveModal(false)}
                        title={t('Setting.REmEve')}
                        onClickDismiss={() => {
                            handleAddHoliday();
                            setRemoveModal(false);
                        }}
                        onClickConfirm={() => {
                            handleRemoveSequence();
                            setRemoveModal(false);
                        }}
                        description={t('Setting.RmEveDesc')}
                        dismissColor={'#fff'}
                        dismissText={t('Setting.ThEve')}
                        dismissBg={'#E19957'}
                        ConfirmText={t('Setting.ThSer')}
                        ConfirmBg={'#D30000'}
                    />
                )}
            </Paper>
        </Modal>
    );
}
