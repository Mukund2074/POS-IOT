import moment from 'moment';
import { eventCheckerCalendar } from '../../../components/settings/opningHours/utils/Functions';
import { UpdateOpeningHourApi } from '../../../utils/Api/Employee';
import { isAnswerValueInMarkCriticalWhen } from '../../../utils/healthDeclarationCritical';
import { HttpStatusCode } from 'axios';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { calendarApi } from './CalendarApis';
import { HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';
export class CalendarHandlers {
    async handleOpeningHourTrack(data, anchorEl, selectedDate, setOpeningHourEmp) {
        if (!data || !anchorEl) return;

        const empForOpeningHours = data?.employees_opening_hour?.find((em) => em.id == anchorEl?.id);
        const event = eventCheckerCalendar(empForOpeningHours, moment(selectedDate));

        setOpeningHourEmp({
            data: data,
            existing: empForOpeningHours,
            updated: empForOpeningHours,
            isChanged: false,
            event,
        });
    }

    async handleClickResource({ e, setAnchorEl }) {
        setAnchorEl(e.currentTarget);
    }

    async handleOpeningHourChange({
        start_time,
        end_time,
        start_break_time,
        end_break_time,
        onLeave,
        setOpeningHourEmp,
        openingHourEmp,
        anchorEl,
        settingResource,
        setLoader = () => {},
        currentDate,
    }) {
        const eventId = openingHourEmp?.event?.id;

        let updatedDetails = openingHourEmp?.updated?.detail?.map((item) => {
            if (item?.id !== eventId) return item;

            const updatedAdditionalDays = { ...item?.additional_days };

            let updatedOffDays = item?.off_days.filter((day) => day !== currentDate);
            if (onLeave) {
                updatedOffDays = [...new Set([...updatedOffDays, currentDate])];
                delete updatedAdditionalDays[currentDate];
            } else if (
                start_time?.format('HH:mm:ss') !== item?.additional_days[currentDate]?.start_time ||
                end_time?.format('HH:mm:ss') !== item?.additional_days[currentDate]?.end_time
            ) {
                updatedAdditionalDays[currentDate] = {
                    start_time: start_time.format('HH:mm:ss'),
                    end_time: end_time.format('HH:mm:ss'),
                    start_break_time: start_break_time,
                    end_break_time: end_break_time,
                };
                updatedOffDays = updatedOffDays.filter((day) => day !== currentDate);
            }
            return {
                ...item,
                additional_days: updatedAdditionalDays,
                off_days: updatedOffDays,
            };
        });

        if (!eventId) {
            const updatedAdditionalDays = {};
            updatedAdditionalDays[currentDate] = {
                start_time: start_time.format('HH:mm:ss'),
                end_time: end_time.format('HH:mm:ss'),
                start_break_time: null,
                end_break_time: null,
            };

            updatedDetails = [
                ...(openingHourEmp?.updated?.detail || []),
                {
                    employee_id: openingHourEmp?.updated?.id,
                    repeat: null,
                    start_date: start_time.format('YYYY-MM-DD'),
                    add_break: false,
                    end_time: end_time.format('HH:mm:ss'),
                    start_break_time: null,
                    start_time: start_time.format('HH:mm:ss'),
                    additional_days: updatedAdditionalDays,
                },
            ];
        }

        const isChanged = JSON.stringify(updatedDetails) !== JSON.stringify(openingHourEmp?.existing?.detail);

        if (isChanged) {
            const newData = {
                ...openingHourEmp?.data,
                employees_opening_hour: openingHourEmp?.data?.employees_opening_hour?.map((em) => {
                    if (em?.id != anchorEl?.id) return em;
                    return {
                        ...em,
                        detail: updatedDetails,
                    };
                }),
            };

            const validDetailsOfEmp = newData?.employees_opening_hour
                ?.filter((item) => item.detail.length > 0)
                .flatMap((item) => item.detail);

            const update = {
                schedule: openingHourEmp?.data?.schedule,
                holiday: openingHourEmp?.data?.outlet_holidays,
                employee_opening_hour: validDetailsOfEmp,
                is_individual_opening_hour: openingHourEmp?.data?.is_individual_opening_hour,
            };

            try {
                const response = await UpdateOpeningHourApi({ payload: update });
                if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
                    setOpeningHourEmp((prev) => ({
                        ...prev,
                        isChanged: false,
                        updatedData: {},
                        event: {},
                        updated: {},
                    }));

                    toast.success(t('Setting.OpeningHoursUpdatedSuccessfully'));

                    await calendarApi?.getCalendarOpeningHour({ setOpeningHourEmp, setLoader });
                    await calendarApi?.fetchSettingsNew({
                        setEmployees: settingResource?.setEmployees,
                        dispatch: settingResource?.dispatch,
                        settings: settingResource?.settings,
                        setLoading: settingResource?.setLoading,
                    });
                    return;
                }
                // You can also handle success feedback here
            } catch (error) {
                console.error('Failed to update opening hour:', error);
                toast.error(error);
                // Optionally notify user
            }

            setOpeningHourEmp((prev) => ({
                ...prev,
                isChanged,
                updatedData: newData,
                event: { ...(updatedDetails?.find((item) => item?.id === eventId) || {}) },
                updated: {
                    ...prev.updated,
                    detail: [...updatedDetails],
                },
            }));
        }

        return;
    }

    hasCriticalAnswers(originalBookings) {
        return originalBookings
            .map((booking) => {
                const responseContent = booking?.health_declaration?.response_content;
                const answers = responseContent?.answers;
                const questions = responseContent?.questions;
                if (!Array.isArray(answers)) return [];
                const questionsById = Array.isArray(questions)
                    ? Object.fromEntries(questions.filter((q) => q?.id).map((q) => [q.id, q]))
                    : {};
                return answers.map((item) => ({
                    ...item,
                    markCriticalWhen: item.markCriticalWhen ?? questionsById[item.id]?.markCriticalWhen,
                }));
            })
            .flat()
            .some((item) => isAnswerValueInMarkCriticalWhen(item.answer, item.markCriticalWhen));
    }

    getHealthDeclarationStatusIcon(originalBookings, darkIcon = false) {
        const healthDeclarations = originalBookings.map((booking) => booking?.health_declaration).filter(Boolean);
        if (!healthDeclarations.length) return '⏳';

        const completed = ['COMPLETED', 'SUBMITTED', 'REVIEWED'];
        const sent = ['SENT', 'REMINDER_SENT', 'RESENT', 'REMINDER_SENT_CONFLICT'];
        const allCompleted = healthDeclarations.every((healthDeclaration) =>
            completed.includes(healthDeclaration?.status),
        );
        const hasSent = healthDeclarations.every((healthDeclaration) => sent.includes(healthDeclaration?.status));

        if (allCompleted && this.hasCriticalAnswers(originalBookings)) return '⚠️';
        if (allCompleted) return <HiOutlineClipboardDocumentCheck color={darkIcon ? '#000' : '#fff'} size={20} />;
        if (hasSent) return '✉️';

        return '⏳';
    }
}

export const CalendarHandler = new CalendarHandlers();
