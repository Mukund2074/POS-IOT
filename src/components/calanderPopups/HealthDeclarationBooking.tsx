import { Check, Close, Email, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    CircularProgress,
    IconButton,
    Modal,
    Paper,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material';
import moment from 'moment';
import React, { useState, useEffect, useMemo } from 'react';
import POSHeading from '../POS/Common/POSHeading';
import { t } from 'i18next';
import POSButton from '../POS/Common/POSButton';
import { api } from '@/utils/Api/POS';
import { isAnswerValueInMarkCriticalWhen } from '@/utils/healthDeclarationCritical';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

type HealthDeclarationAnswerValue = string | number | boolean | string[] | null | undefined;

interface HealthDeclarationAnswerOption {
    label: string;
    value: string;
}

interface HealthDeclarationAnswerItem {
    id: string;
    type: string;
    label: string;
    order?: number;
    answer?: HealthDeclarationAnswerValue;
    isCritical?: boolean;
    markCriticalWhen?: (boolean | string)[];
    isRequired?: boolean;
    description?: string;
    validation?: Record<string, unknown>;
    visibility?: Record<string, unknown>;
    options?: HealthDeclarationAnswerOption[];
}

interface HealthDeclarationQuestionItem {
    id: string;
    type: string;
    label: string;
    order?: number;
    isCritical?: boolean;
    markCriticalWhen?: (boolean | string)[];
    isRequired?: boolean;
    description?: string;
    validation?: Record<string, unknown>;
    visibility?: Record<string, unknown>;
    options?: HealthDeclarationAnswerOption[];
}

interface HealthDeclarationBookingModalProps {
    open: boolean;
    onClose: () => void;
    origialBookings: any;
    refreshBookings: () => void;
}

export default function HealthDeclarationBookingModal({
    open,
    onClose,
    origialBookings,
    refreshBookings,
}: HealthDeclarationBookingModalProps) {
    const user = useSelector((state: any) => state.user?.data);
    const [loadingId, setLoadingId] = useState<number | string | null>(null);
    const isMobile = useMediaQuery('(max-width: 600px)');
    // Get all bookings with health declarations
    const bookingsWithHealthDeclarations = useMemo(
        () => (origialBookings || []).filter((booking: any) => booking?.health_declaration),
        [origialBookings],
    );

    // Initialize expanded accordion with first health declaration ID
    const getInitialExpandedAccordion = () => {
        if (bookingsWithHealthDeclarations.length > 0) {
            return bookingsWithHealthDeclarations[0]?.health_declaration?.id || '0';
        }
        return false;
    };

    const [expandedAccordion, setExpandedAccordion] = useState<string | false>(getInitialExpandedAccordion);

    // Reset expanded accordion when bookings change (e.g., modal opens with new data)
    useEffect(() => {
        if (bookingsWithHealthDeclarations.length > 0) {
            const firstHealthDeclarationId = bookingsWithHealthDeclarations[0]?.health_declaration?.id || '0';
            setExpandedAccordion(firstHealthDeclarationId);
        }
    }, [bookingsWithHealthDeclarations]);

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedAccordion(isExpanded ? panel : false);
    };

    const resendBy = user?.id || localStorage.getItem('employee_id');

    const formatAnswer = (item: HealthDeclarationAnswerItem): string => {
        const value = item.answer;
        if (value === null || value === undefined || value === '') return t('Common.N/A');
        if (typeof value === 'boolean') return value ? t('Customer.ButtonTitleYes') : t('Customer.ButtonTitleNo');
        if (Array.isArray(value)) return value.join(', ');
        if (item.type === 'date') {
            const m = moment(value);
            return m.isValid() ? m.format('DD/MM/YYYY') : String(value);
        }
        return String(value);
    };

    const getRows = (healthDeclaration: any) => {
        const showAnswers = Object.values(healthDeclaration?.response_content?.answers || []).length > 0;
        const answersRaw = healthDeclaration?.response_content?.answers;
        const questionsRaw = healthDeclaration?.response_content?.questions;
        const answers: HealthDeclarationAnswerItem[] = Array.isArray(answersRaw) ? answersRaw : [];
        const questions: HealthDeclarationQuestionItem[] = Array.isArray(questionsRaw) ? questionsRaw : [];
        const questionsById = Object.fromEntries(questions.filter((q) => q?.id).map((q) => [q.id, q])) as Record<
            string,
            HealthDeclarationQuestionItem
        >;
        const rowsWithMarkCriticalWhen =
            showAnswers && answers.length > 0
                ? answers.map((item) => ({
                      ...item,
                      markCriticalWhen: item.markCriticalWhen ?? questionsById[item.id]?.markCriticalWhen,
                  }))
                : questions;
        return { rows: rowsWithMarkCriticalWhen, showAnswers };
    };

    const isRowCritical = (row: HealthDeclarationAnswerItem | HealthDeclarationQuestionItem): boolean => {
        const value = 'answer' in row ? row.answer : undefined;
        return isAnswerValueInMarkCriticalWhen(value, row.markCriticalWhen);
    };

    const shouldShowMarkAsReviewed = (healthDeclaration: any) => {
        return (
            healthDeclaration?.status === 'SUBMITTED' &&
            !healthDeclaration?.reviewed_by &&
            !healthDeclaration?.reviewedAt
        );
    };

    const handleResendEmail = async (bookingId: number) => {
        if (!bookingId) {
            toast.error(t('Calendar.ToastErrIdMissing'));
            return;
        }
        try {
            setLoadingId(bookingId);
            await api.postApiHealthDeclarationBookingBookingIdSendEmail(
                bookingId,
                resendBy && !Number.isNaN(resendBy) ? { resendBy: resendBy } : undefined,
            );
            toast.success(t('Calendar.HealthDeclarationReminderEmailSent'));
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message || error?.message || t('Calendar.HealthDeclarationReminderEmailFailed');
            toast.error(errorMessage);
        } finally {
            setLoadingId(null);
            onClose();
            refreshBookings();
        }
    };

    const handleMarkAsReviewed = async (healthDeclarationId: string) => {
        if (!healthDeclarationId) {
            toast.error(t('Calendar.ToastErrIdMissing'));
            return;
        }

        const employeeIdRaw = user?.id || localStorage.getItem('employee_id');
        const employeeId = typeof employeeIdRaw === 'string' ? Number(employeeIdRaw) : employeeIdRaw;
        if (!employeeId || Number.isNaN(employeeId)) {
            toast.error(t('Calendar.ToastErrIdMissing'));
            return;
        }

        const reviewedAt = moment().toISOString();

        try {
            setLoadingId(healthDeclarationId);
            // Mark all unreviewed health declarations as reviewed
            await api.putApiHealthDeclarationId(healthDeclarationId, {
                reviewedBy: employeeId,
                reviewedAt,
            });
            toast.success(t('Calendar.MarkAsReviewed'));
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message || error?.message || t('Calendar.HealthDeclarationReminderEmailFailed');
            toast.error(errorMessage);
        } finally {
            setLoadingId(null);
            onClose();
            refreshBookings();
        }
    };

    return (
        <Modal
            disableAutoFocus
            open={open}
            onClose={onClose}
            keepMounted
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    width: { xs: '95%', md: '80%', lg: '60%' },
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: { xs: 2, md: 8 },
                    py: { xs: 1, md: 2 },
                    px: { xs: 1, md: 4 },
                    height: { xs: '90%', md: '80%' },
                }}
            >
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
                    <Close />
                </IconButton>

                <POSHeading text={t('Setting.HealthDeclarationTitle')} />

                <Box
                    sx={{
                        height: '80%',
                        overflowY: 'auto',
                        mt: 2,
                    }}
                >
                    {bookingsWithHealthDeclarations.length === 0 ? (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {t('Calendar.NoHealthDeclarationFound')}
                        </Alert>
                    ) : (
                        bookingsWithHealthDeclarations.map((booking: any, index: number) => {
                            const healthDeclaration = booking?.health_declaration;
                            const status = (healthDeclaration?.status || '').toUpperCase();
                            const { rows, showAnswers } = getRows(healthDeclaration);
                            const serviceName =
                                booking?.booking_details?.service_name ||
                                booking?.title ||
                                healthDeclaration?.serviceId ||
                                t('Common.N/A');
                            const bookingTime = booking?.booking_datetime_start
                                ? moment(booking.booking_datetime_start).format('DD/MM-YYYY HH:mm')
                                : t('Common.N/A');

                            const panelId = healthDeclaration?.id || `panel-${index}`;
                            const isExpanded = expandedAccordion === panelId;
                            const isReviewed = Boolean(
                                healthDeclaration?.reviewed_by && healthDeclaration?.reviewed_at && showAnswers,
                            );

                            return (
                                <Accordion
                                    key={panelId}
                                    expanded={isExpanded}
                                    onChange={handleAccordionChange(panelId)}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                            }}
                                        >
                                            <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {serviceName}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="caption">{bookingTime}</Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color={
                                                            status === 'SUBMITTED'
                                                                ? 'success.main'
                                                                : status === 'SENT' ||
                                                                    status === 'REMINDER_SENT' ||
                                                                    status === 'REMINDER_SENT_CONFLICT'
                                                                  ? 'info.main'
                                                                  : 'warning.main'
                                                        }
                                                        sx={{
                                                            fontWeight: 500,
                                                            border: '1px solid',
                                                            borderColor:
                                                                status === 'SUBMITTED'
                                                                    ? 'success.main'
                                                                    : status === 'SENT' ||
                                                                        status === 'REMINDER_SENT' ||
                                                                        status === 'REMINDER_SENT_CONFLICT'
                                                                      ? 'info.main'
                                                                      : 'warning.main',
                                                            borderRadius: '20px',
                                                            px: 1,
                                                            py: 0,
                                                        }}
                                                    >
                                                        {isReviewed ? t('Calendar.Reviewed') : status}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    justifyContent: 'flex-end',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {!showAnswers && (
                                                    <React.Fragment>
                                                        {isMobile ? (
                                                            <IconButton
                                                                disableFocusRipple
                                                                disableRipple
                                                                disableTouchRipple
                                                                sx={{
                                                                    border: '1px solid #DDE0F4',
                                                                    borderRadius: '50%',
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    handleResendEmail(booking?.id);
                                                                }}
                                                                disabled={Boolean(loadingId)}
                                                            >
                                                                {loadingId === booking?.id ? (
                                                                    <CircularProgress
                                                                        size={20}
                                                                        sx={{ color: 'inherit' }}
                                                                    />
                                                                ) : (
                                                                    <Email sx={{ fontSize: '20px' }} />
                                                                )}
                                                            </IconButton>
                                                        ) : (
                                                            <POSButton
                                                                sx={{ maxWidth: 'fit-content', px: 0, py: 0 }}
                                                                height="35px"
                                                                title={
                                                                    loadingId === booking?.id ? (
                                                                        <Stack
                                                                            sx={{
                                                                                px: 4,
                                                                            }}
                                                                        >
                                                                            <CircularProgress
                                                                                size={20}
                                                                                sx={{ color: 'inherit' }}
                                                                            />
                                                                        </Stack>
                                                                    ) : (
                                                                        t('Calendar.SendReminderEmail')
                                                                    )
                                                                }
                                                                variant="f_outline"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    handleResendEmail(booking?.id);
                                                                }}
                                                                disabled={Boolean(loadingId)}
                                                            />
                                                        )}
                                                    </React.Fragment>
                                                )}

                                                {/* Mark as reviewed button */}
                                                {shouldShowMarkAsReviewed(healthDeclaration) && (
                                                    <React.Fragment>
                                                        {isMobile ? (
                                                            <IconButton
                                                                disableFocusRipple
                                                                disableRipple
                                                                disableTouchRipple
                                                                sx={{
                                                                    border: '1px solid #DDE0F4',
                                                                    borderRadius: '50%',
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    handleMarkAsReviewed(healthDeclaration?.id);
                                                                }}
                                                                disabled={Boolean(loadingId)}
                                                            >
                                                                {loadingId === healthDeclaration?.id ? (
                                                                    <CircularProgress
                                                                        size={20}
                                                                        sx={{ color: 'inherit' }}
                                                                    />
                                                                ) : (
                                                                    <Check sx={{ fontSize: '20px' }} />
                                                                )}
                                                            </IconButton>
                                                        ) : (
                                                            <POSButton
                                                                sx={{ maxWidth: 'fit-content', px: 0, py: 0 }}
                                                                height="35px"
                                                                title={
                                                                    loadingId === healthDeclaration?.id ? (
                                                                        <Stack sx={{ px: 4 }}>
                                                                            <CircularProgress
                                                                                size={20}
                                                                                sx={{ color: 'inherit' }}
                                                                            />
                                                                        </Stack>
                                                                    ) : (
                                                                        t('Calendar.MarkAsReviewed')
                                                                    )
                                                                }
                                                                variant="save"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    handleMarkAsReviewed(healthDeclaration?.id);
                                                                }}
                                                                disabled={Boolean(loadingId)}
                                                            />
                                                        )}
                                                    </React.Fragment>
                                                )}
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {!showAnswers && (
                                            <Alert severity="info" sx={{ mb: 2 }}>
                                                {t('Calendar.NotSubmittedHealthDeclaration')}
                                            </Alert>
                                        )}

                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1.5,
                                                mb: 2,
                                            }}
                                        >
                                            {rows.map((question, idx) => (
                                                <Box
                                                    key={idx}
                                                    border={1}
                                                    borderColor="divider"
                                                    borderRadius={1}
                                                    p={1.5}
                                                >
                                                    <Typography variant="body2" color="text.primary" fontWeight={500}>
                                                        {isRowCritical(question) && '⚠️'} {idx + 1}. {question.label}
                                                    </Typography>
                                                    {'description' in question && question.description ? (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{ mt: 0.5, display: 'block' }}
                                                        >
                                                            {question.description}
                                                        </Typography>
                                                    ) : null}
                                                    {showAnswers && 'answer' in question ? (
                                                        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                                            {t('Calendar.Answer')}:{' '}
                                                            {formatAnswer(question as HealthDeclarationAnswerItem)}
                                                        </Typography>
                                                    ) : null}
                                                </Box>
                                            ))}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })
                    )}
                </Box>
            </Paper>
        </Modal>
    );
}
