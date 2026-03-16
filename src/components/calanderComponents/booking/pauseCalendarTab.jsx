import React, { useEffect, useState } from 'react';
import { Stack, Grid2, Typography } from '@mui/material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import CustomDatePicker from '../../settings/commonDatePicker';
import CustomTextField from '../../settings/commonTextinput';
import CommonButton from '../../settings/commonButton';
import { t } from 'i18next';
import CustomTimePicker from '../../settings/commonTimePicker';
import { useSelector } from 'react-redux';
import FSelect from '../../commonComponents/F_Select';
import { apiMangerBooking } from './utils/api';
import { toast } from 'react-toastify';
import moment from 'moment';
import FButton from '../../commonComponents/F_Button';
import CustomDeleteModal from '../../deleteAlertModal';

export default function PauseCalendarTab({ closeForm, validatePause, pauseProps, initialData, setEvents }) {
    const settings = useSelector((state) => state.settings.data);

    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Set moment locale based on the selected language
    moment.locale('en');

    useEffect(() => {
        if (pauseProps) {
            formik.setFieldValue('employee_ids', [pauseProps?.employeeId]);
            formik.setFieldValue('date', moment(pauseProps?.start));
            formik.setFieldValue('time_start', moment(pauseProps?.start));
            formik.setFieldValue('time_end', moment(pauseProps?.end));
            formik.setFieldValue('reason', pauseProps?.reason);
            formik.setFieldValue('headline', pauseProps?.headline);
            formik.setFieldValue('description', pauseProps?.description);
        }
    }, [pauseProps]);

    useEffect(() => {
        if (!pauseProps && initialData) {
            formik.setFieldValue(
                'employee_ids',
                typeof initialData?.employeeId === 'number' ? [initialData?.employeeId] : initialData?.employeeId,
            );
            formik.setFieldValue('date', moment(initialData?.date));
            formik.setFieldValue('time_start', moment(initialData?.start_time));
            formik.setFieldValue('time_end', moment(initialData?.end_time));
        }
    }, [initialData]);

    let reasons = [
        { id: 'Private', name: t('Calendar.private') },
        { id: 'Sick leave', name: t('Calendar.sickLeave') },
        { id: 'Lunch break', name: t('Calendar.lunchBreak') },
        { id: 'Vacation', name: t('Calendar.vacation') },
        { id: 'Time off', name: t('Calendar.timeOff') },
        { id: 'Course training', name: t('Calendar.courseTraining') },
        { id: 'School', name: t('Calendar.school') },
        { id: 'Child sick leave', name: t('Calendar.childSickLeave') },
        { id: 'Parental leave', name: t('Calendar.parentalLeave') },
        { id: 'Option', name: t('Calendar.option') },
    ];

    const initialValues = {
        employee_ids: [],
        date: null,
        time_start: null,
        time_end: null,
        reason: '',
        headline: '',
        description: '',
    };

    const validationSchema = Yup.object().shape({
        employee_ids: Yup.array().required(t('Calendar.YupErrEmployee')).min(1, t('Calendar.YupErrEmployee')),
        date: Yup.mixed().required(t('Calendar.YupErrDate')).typeError(t('Calendar.YupErrDate')),
        time_start: Yup.mixed()
            .required(t('Calendar.YupErrTimeStart'))
            .typeError(t('Calendar.YupErrTimeStart'))
            .test('isValidTime', t('Calendar.YupErrTimeStart'), function (value) {
                return value && moment.isMoment(value) && value.isValid();
            }),
        time_end: Yup.mixed()
            .required(t('Calendar.YupErrTimeEnd'))
            .typeError(t('Calendar.YupErrTimeEnd'))
            .test('isValidTime', t('Calendar.YupErrTimeEnd'), function (value) {
                return value && moment.isMoment(value) && value.isValid();
            })
            .test('isAfterStartTime', t('Setting.YupEnTimeAftr'), function (value) {
                const { time_start } = this.parent;
                if (!value || !time_start) return true;

                // Ensure both values are valid moment objects
                if (!moment.isMoment(time_start) || !moment.isMoment(value)) return true;
                if (!time_start.isValid() || !value.isValid()) return true;

                // Compare only the time part (hours and minutes), ignore date
                const startTime = time_start.format('HH:mm');
                const endTime = value.format('HH:mm');

                return endTime > startTime;
            }),

        reason: Yup.string().required(t('Calendar.YupErrReason')).typeError(t('Calendar.YupErrReason')),
        headline: Yup.string()
            // .required(t('Calendar.YupErrHeadline'))
            .typeError(t('Calendar.YupErrHeadline')),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            const payload = {
                employee_ids: values.employee_ids,
                datetime_start: values.date.format('YYYY-MM-DD') + ' ' + values.time_start.format('HH:mm:ss'),
                datetime_end: values.date.format('YYYY-MM-DD') + ' ' + values.time_end.format('HH:mm:ss'),
                reason: values.reason,
                headline: values.headline,
                description: values.description,
                google_calendar_sync: true,
            };
            let isValid = validatePause({ ...payload, pauseProps: pauseProps?.id });
            if (!isValid) {
                setError(t('Calendar.ErrorPause'));
                return;
            } else if (isValid) {
                setError('');
                apiMangerBooking.handleSubmitPause(payload, closeForm, toast, t, pauseProps, setEvents);
            }
        },
    });

    const handleSelectEmployee = (e) => {
        const selectedValues = e.target.value;
        let allID = settings?.employees?.map((employee) => employee.id);

        if (
            (selectedValues === 0 || selectedValues.includes(0)) &&
            allID.length === formik.values.employee_ids.length
        ) {
            formik.setFieldValue('employee_ids', []);
        } else if (selectedValues === 0 || selectedValues.includes(0)) {
            formik.setFieldValue('employee_ids', allID);
        } else if (selectedValues.length === 0) {
            formik.setFieldValue('employee_ids', []);
        } else {
            formik.setFieldValue('employee_ids', selectedValues);
        }
    };

    return (
        <>
            <Typography variant="h5" sx={{ color: '#1f1f1f', fontWeight: 700, px: { xs: 2, sm: 6 } }}>
                {t('Calendar.PauseCal')}
            </Typography>

            <Grid2 marginTop={1} paddingBottom={5} container spacing={10} sx={{ px: { xs: 2, sm: 6 } }}>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body1">{t('Calendar.Reason')}</Typography>

                    <FSelect
                        name="reason"
                        placeholderText={t('Calendar.Reason')}
                        onChange={(e) => formik.setFieldValue('reason', e.target.value)}
                        value={formik.values.reason}
                        options={reasons?.map((option) => ({ value: option.id, label: option.name }))}
                        sx={{ mt: 0, width: '100%' }}
                        borderColor="#D9D9D9"
                        borderRadius={3}
                        menuSx={{
                            height: '250px',
                        }}
                    />
                    {formik.errors.reason && formik.touched.reason && (
                        <Typography variant="body2" sx={{ color: 'red', marginTop: '5px' }}>
                            {formik.errors.reason}
                        </Typography>
                    )}

                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {t('Calendar.Headline')}
                    </Typography>

                    <CustomTextField
                        value={formik.values?.headline}
                        onChange={formik.handleChange}
                        placeholder={t('Calendar.WriteHead')}
                        id={'headline'}
                        name={'headline'}
                        mt={1}
                        borderRadius={'15px'}
                    />
                    {formik.errors.headline && formik.touched.headline && (
                        <Typography variant="body2" sx={{ color: 'red', marginTop: '5px' }}>
                            {formik.errors.headline}
                        </Typography>
                    )}

                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {t('Setting.Description')}
                    </Typography>

                    <CustomTextField
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        placeholder={t('Calendar.WriteDesc')}
                        id={'description'}
                        name={'description'}
                        mt={1}
                        borderRadius={'15px'}
                    />
                    {formik.errors.description && formik.touched.description && (
                        <Typography variant="body2" sx={{ color: 'red', marginTop: '5px' }}>
                            {formik.errors.description}
                        </Typography>
                    )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body1">{t('Setting.Employee')}</Typography>

                    <FSelect
                        disabled={pauseProps}
                        selectAllRenderText={t('Common.AllEmployees')}
                        backgroundColor="#fff"
                        isMultiSelect={true}
                        value={formik.values?.employee_ids || []}
                        TextToDisplayWithCount={`${t('Common.Employees')}`}
                        sx={{ width: '100%' }}
                        onChange={handleSelectEmployee}
                        placeholderText={t('Setting.SelectEmployees')}
                        selectAllRenderCheckBoxText={t('Common.AllEmployees')}
                        options={
                            settings?.employees &&
                            settings?.employees.map((employee) => ({ value: employee.id, label: employee.name }))
                        }
                        borderRadius={3}
                        padding={0}
                    />
                    {formik.errors.employee_ids && formik.touched.employee_ids && (
                        <Typography variant="body2" sx={{ color: 'red', marginTop: '5px' }}>
                            {formik.errors.employee_ids}
                        </Typography>
                    )}

                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {t('Common.Date')}
                    </Typography>

                    <CustomDatePicker
                        value={formik.values.date}
                        onChange={(e) => formik.setFieldValue('date', e)}
                        sx={{ width: '100%', mt: 1 }}
                        onBlur={formik.handleBlur}
                        size="small"
                        borderColor="#D9D9D9"
                        format="DD/MM-YYYY"
                        padding={1}
                        borderThickness="2px"
                        inputColor="#A0A0A0"
                        iconVisibility={false}
                    />
                    {formik.errors.date && formik.touched.date && (
                        <Typography variant="body2" sx={{ color: 'red', marginTop: '5px' }}>
                            {formik.errors.date}
                        </Typography>
                    )}

                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {t('Common.Time')}
                    </Typography>

                    <Stack display={'flex'} flexDirection="row" alignItems="center" sx={{ mt: 1 }}>
                        <Stack sx={{ width: '30%' }}>
                            <CustomTimePicker
                                value={formik.values.time_start}
                                onChange={(time) => {
                                    formik.setFieldValue('time_start', time);
                                    formik.setFieldTouched('time_start', true);
                                    // Trigger validation immediately
                                    setTimeout(() => {
                                        formik.validateField('time_start');
                                        if (formik.values.time_end) {
                                            formik.setFieldTouched('time_end', true);
                                            formik.validateField('time_end');
                                        }
                                    }, 0);
                                }}
                                onAccept={(time) => {
                                    // Ensure validation is triggered when user accepts the time
                                    formik.setFieldValue('time_start', time);
                                    formik.setFieldTouched('time_start', true);
                                    // Trigger validation for both fields
                                    setTimeout(() => {
                                        formik.validateField('time_start');
                                        if (formik.values.time_end) {
                                            formik.setFieldTouched('time_end', true);
                                            formik.validateField('time_end');
                                        }
                                    }, 0);
                                }}
                                onBlur={() => {
                                    // Trigger validation when user leaves the field
                                    formik.setFieldTouched('time_start', true);
                                    setTimeout(() => {
                                        formik.validateField('time_start');
                                        if (formik.values.time_end) {
                                            formik.validateField('time_end');
                                        }
                                    }, 0);
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
                                value={formik.values.time_end}
                                onChange={(time) => {
                                    formik.setFieldValue('time_end', time);
                                    formik.setFieldTouched('time_end', true);
                                    // Trigger validation immediately
                                    setTimeout(() => {
                                        formik.validateField('time_end');
                                        formik.validateField('time_start');
                                    }, 0);
                                }}
                                onAccept={(time) => {
                                    // Ensure validation is triggered when user accepts the time
                                    formik.setFieldValue('time_end', time);
                                    formik.setFieldTouched('time_end', true);
                                    // Trigger validation for both fields
                                    setTimeout(() => {
                                        formik.validateField('time_end');
                                        formik.validateField('time_start');
                                    }, 0);
                                }}
                                onBlur={() => {
                                    // Trigger validation when user leaves the field
                                    formik.setFieldTouched('time_end', true);
                                    setTimeout(() => {
                                        formik.validateField('time_end');
                                        formik.validateField('time_start');
                                    }, 0);
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
                    {((formik.errors.time_start && formik.touched.time_start) ||
                        (formik.errors.time_end && formik.touched.time_end)) && (
                        <Typography variant="body2" sx={{ color: 'red', marginTop: '5px' }}>
                            {formik.errors.time_start}
                            <br /> {formik.errors.time_end}
                        </Typography>
                    )}

                    {error && (
                        <Stack display="flex" flexDirection="row" alignItems="center">
                            <Stack width={'10%'}>
                                <svg
                                    width="29"
                                    height="29"
                                    viewBox="0 0 29 29"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M12.6788 5.2951C13.6469 3.65985 16.0133 3.65985 16.9814 5.2951L23.8688 16.9292C24.8554 18.5958 23.6542 20.7028 21.7175 20.7028H7.94265C6.00599 20.7028 4.80478 18.5958 5.79136 16.9292L12.6788 5.2951Z"
                                        fill="#FFE735"
                                        stroke="black"
                                    />
                                    <path
                                        d="M13.9283 14.8314L13.7183 8.22344H15.7483L15.5383 14.8314H13.9283ZM14.7403 18.0934C14.395 18.0934 14.1103 17.9908 13.8863 17.7854C13.6716 17.5708 13.5643 17.3094 13.5643 17.0014C13.5643 16.6934 13.6716 16.4368 13.8863 16.2314C14.1103 16.0168 14.395 15.9094 14.7403 15.9094C15.0856 15.9094 15.3656 16.0168 15.5803 16.2314C15.795 16.4368 15.9023 16.6934 15.9023 17.0014C15.9023 17.3094 15.795 17.5708 15.5803 17.7854C15.3656 17.9908 15.0856 18.0934 14.7403 18.0934Z"
                                        fill="#1F1F1F"
                                    />
                                </svg>
                            </Stack>

                            <Typography width={'90%'} variant="body2" sx={{ mt: 6 }}>
                                {error}
                            </Typography>
                        </Stack>
                    )}
                </Grid2>
            </Grid2>

            <Stack
                sx={{
                    marginTop: 'auto',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: { xs: 'center', md: 'center' },
                    gap: { xs: 2, md: 5 },
                    px: { xs: 2, md: 3 },
                    pb: 5,
                    width: '100%',
                }}
            >
                <CommonButton
                    height={40}
                    title={t('Setting.Cancel')}
                    backgroundColor={'#D9D9D9'}
                    style={{
                        minWidth: { xs: '100%', md: '20%' },
                        width: { xs: '100%', md: 'auto' },
                    }}
                    onClick={() => closeForm()}
                />

                <CommonButton
                    type="submit"
                    height={40}
                    title={pauseProps ? t('Calendar.UpPause') : t('Calendar.PauseCal')}
                    backgroundColor={'#44B904'}
                    style={{
                        minWidth: { xs: '100%', md: '20%' },
                        width: { xs: '100%', md: 'auto' },
                    }}
                    onClick={formik.handleSubmit}
                />

                {pauseProps && (
                    <FButton
                        variant={'delete'}
                        title={t('Calendar.RemPause')}
                        style={{ minWidth: 150 }}
                        onClick={() => setConfirmDelete(true)}
                    />
                )}
            </Stack>

            {confirmDelete && (
                <CustomDeleteModal
                    title={t('Calendar.RemPause')}
                    open={confirmDelete}
                    handleClose={() => setConfirmDelete(false)}
                    description={t('Calendar.RemPauseDesc')}
                    onClickDismiss={() => setConfirmDelete(false)}
                    onClickConfirm={() => {
                        apiMangerBooking.removePause(pauseProps, toast, t, setEvents);
                        closeForm();
                        setConfirmDelete(false);
                    }}
                />
            )}
        </>
    );
}
