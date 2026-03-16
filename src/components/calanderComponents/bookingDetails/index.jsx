import { Close, Sync, AttachFile } from '@mui/icons-material';
import {
    Box,
    CircularProgress,
    DialogContent,
    Divider,
    Grid2,
    IconButton,
    Modal,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Permission from '@/utils/POS/Permission';
import { useSalesDetails } from '../../../hooks/api/pos/sales/useSalesDetails';
import { BookingDetailsApi } from './utils/api';
import apiFetcher from '../../../utils/interCeptor';
import { toast } from 'react-toastify';
import { BookingDetailHandler } from './utils/handler';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/POS/CartContext';
import { t } from 'i18next';
import FPrimaryHeading from '../../commonComponents/F_PrimaryHeading';
import moment from 'moment';
import CalenderIcon from '../../../assets/calendar.png';
import ClockIcon from '../../../assets/newClockDesign.svg';
import NoteIcon from '../../../assets/note.svg';
import DeleteIcon from '../../../assets/Delete.svg';
import SentSmsIcon from '../../../assets/Vector(200).svg';
import SentEmailIcon from '../../../assets/Vector(100).svg';
import ImportantNoteIcon from '../../../assets/ImportantNoteIcon.svg';
import JournalIcon from '../../../assets/Journalicon.svg';
import { formatPhoneNumber } from '../booking/utils/functions';
import { formatAmount } from '../../../utils/format-amout';
import BlurPrice from '../../commonComponents/BlurPrice';
import Pencilicon from '../../../assets/EditIconBrown.svg';
import PaymentPending from '../../../assets/Payment-pending.svg';
import PaymentSuccess from '../../../assets/Payment-success.svg';
import RescheduleIcon from '../../../assets/RescheduleIcon.svg';
import CancellationBookingIcon from '../../../assets/CancelIcon.svg';
import CancelletionofferIcon from '../../../assets/CancellationOfferIcon.svg';
import FButton from '../../commonComponents/F_Button';
import CustomDeleteModal from '../../deleteAlertModal';
import NoShowPopups from '../../calanderPopups/NoShowPopups';
import FSelect from '../../commonComponents/F_Select';
import CopyIcon from '../../../assets/vector(300).png';
import { usePOS } from '../../../context/POS/POSContext';
import apiFetcher2 from '../../../utils/Api/POS/Interceptor2';
import { formatCurrency } from '../../../scenes/POS/Core/pos.utils';
import { distanceFormat } from '../../../utils/distanceFormat';
import { CalendarHandler } from '../../../scenes/Calendar/CalendarUtils/CalendarHandlers';
import CancellationOfferModal from '../../calanderPopups/CancellationOfferModal';
import CancelOfferIcon from '../../../assets/cancelOffer.svg';

export default function BookingDetailsModal({
    open,
    closeForm,
    bookingId,
    handleReschedule,
    setShowForm,
    setRescheduleData,
    events,
    isPublicView = false,
    publicBookingData = null,
    onPublicStatusChange = null,
    setHealthDeclarationBooking,
    refreshBookings,
}) {
    const [status, setStatus] = useState('');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusarr, setstatusarr] = useState([]);
    const [noShowModel, setNoShowModel] = useState(false);
    const [outstandingCheckModel, setOutstandingCheckModel] = useState(false);
    const [showSyncButton, setShowSyncButton] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showCancelationModal, setShowCancelationModal] = useState(false);
    const [showDeleteInspectionModal, setShowDeleteInspectionModal] = useState(false);
    const { isAllowed } = Permission();
    const { addItem, setCart, addRefundItem } = useCart();
    const navigate = useNavigate();
    const [salesDetailsId, setSalesDetailsId] = useState(bookingDetails?.booking?.sales_id);
    const { data: salesDetails = [], refetch } = useSalesDetails(salesDetailsId);
    const settings = useSelector((state) => state.settings.data);
    const noShowSettings = settings?.OnlineBooking?.noShow;
    const BillingAmount =
        noShowSettings?.chargeType === 'PERCENTAGE'
            ? (bookingDetails?.booking?.booking_details?.price * noShowSettings?.charge) / 100
            : noShowSettings?.charge;

    const isInspectionEnabled = settings?.profile?.inspection_module;
    const cancelationSettings = settings?.OnlineBooking?.inspection_module?.cancelation_settings;
    const event = events.find((event) => event?.id === bookingId);
    const { tax: taxList } = usePOS();
    const [cancellationOfferModal, setCancellationOfferModal] = useState(false);
    const bookingDateTime = moment(bookingDetails?.booking?.booking_datetime_start);
    const now = moment();
    const shouldOpenCancellationModal = now.isBefore(bookingDateTime);
    const [showDeleteCancellationOffer, setShowDeleteCancellationOffer] = useState(false);

    useEffect(() => {
        if (status !== 'OFFERED') {
            const filterOfferValue = statusarr?.filter((stat) => stat.value !== 'OFFERED');
            setstatusarr(filterOfferValue);
        }
    }, [status]);

    const boookingDetailsApi = new BookingDetailsApi({
        api: null,
        apiFetcher: apiFetcher,
        bookingId,
        toast: toast,
        closeForm: closeForm,
        salesDetails,
        navigate,
        bookingDetails,
        noShowSettings,
        settings,
        refetchSalesDetails: (id) => setSalesDetailsId(id),
        taxList: taxList,
    });

    const boookingDetailsApiNode = new BookingDetailsApi({
        api: null,
        apiFetcher: apiFetcher2,
        toast: toast,
    });

    const bookingDetailsHandler = new BookingDetailHandler({
        apiFetcher: apiFetcher,
        bookingId: bookingId,
        toast: toast,
        settings: settings,
        salesDetails,
        bookingDetails,
        BillingAmount,
    });

    const outstandingLineItems = salesDetails?.items?.filter((item) => item?.itemType === 'OUTSTANDING');
    const outstandingPayment = salesDetails?.transactions?.filter(
        (transaction) => transaction?.paymentType === 'OUTSTANDING',
    );
    const totalOutstandingPayment = outstandingPayment?.reduce((acc, item) => acc + (item?.amount || 0), 0);
    const paidOutstandingAmount = outstandingLineItems?.reduce((acc, item) => acc + (item?.amount || 0), 0);
    const remainingAmount = Number(totalOutstandingPayment) - Number(paidOutstandingAmount);
    const salesCreatedDate = salesDetails?.createdAt ? moment(salesDetails?.createdAt) : null;

    const currentBookingStatus = bookingDetails?.booking?.status;

    useEffect(() => {
        setLoading(true);
        if (isPublicView && publicBookingData) {
            // Use provided public booking data
            setBookingDetails({ ...publicBookingData });
            setStatus(
                publicBookingData?.custom_status_id ? publicBookingData?.custom_status_id : publicBookingData?.status,
            );

            // Fetch statuses for public view (will get from API)
            bookingDetailsHandler?.FetchStatus({
                setstatusarr,
                publicCustomStatuses: publicBookingData?.customStatuses || [],
            });

            setLoading(false);
        } else if (bookingId && bookingId) {
            boookingDetailsApi?.getDetails({ setBookingDetails, setStatus, setLoading, settings });
            bookingDetailsHandler?.FetchStatus({ setstatusarr });
            refetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingId, isPublicView, publicBookingData]);

    useEffect(() => {
        const checkGoogleCalendarStatus = async () => {
            if (bookingDetails?.booking?.group_booking_uuid) {
                const response = await boookingDetailsApiNode?.syncBookingStatusToGoogleCalendar({
                    payload: { groupBookingUuid: bookingDetails.booking.group_booking_uuid },
                });
                if (response.status !== 200) {
                    setShowSyncButton(true);
                }
            } else if (event?.group_booking_uuid) {
                const response = await boookingDetailsApiNode?.syncBookingStatusToGoogleCalendar({
                    payload: { groupBookingUuid: event.group_booking_uuid },
                });
                if (response.status !== 200) {
                    setShowSyncButton(true);
                }
            }
        };
        if (isPublicView || !settings?.profile?.inspection_module) return;
        checkGoogleCalendarStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingDetails?.booking?.group_booking_uuid, event?.group_booking_uuid]);

    useEffect(() => {
        if (salesDetailsId) {
            refetch();
        }
    }, [salesDetailsId, refetch]);

    const isEmailPermission =
        settings?.profile?.enable_email && settings?.OnlineBooking?.communication?.bookingConfirmation.email;
    const isSmsPermission =
        settings?.profile?.enable_sms && settings?.OnlineBooking?.communication?.bookingConfirmation.sms;
    const isPosEnabled = settings?.profile?.outlet_addons?.some((addon) => addon.addon_name === 'POS');

    const inspectionUser =
        isInspectionEnabled &&
        bookingDetails?.booking?.inspection_data &&
        bookingDetails?.booking?.inspection_data?.userInformation;
    const CustomBox = ({
        borderColor,
        bgColor,
        text,
        IconComponent,
        height = '32px',
        width = '30px',
        textMerginTop = 0.5,
        sx,
        onClick,
    }) => {
        return (
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    height: { xs: '110px', md: '100px' },
                    border: `1.5px solid ${borderColor || '#ccc'}`,
                    backgroundColor: bgColor || 'transparent',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    borderRadius: { xs: 4, md: 3 },
                    cursor: 'pointer',
                    ...sx,
                }}
                onClick={onClick}
            >
                <Stack alignItems="center">
                    <img src={IconComponent} style={{ height: height, width: width }} alt="Icon" />
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#1f1f1f',
                            fontWeight: 700,
                            mt: textMerginTop,
                            textAlign: 'center',
                            fontSize: { xs: '14px', md: '12px' },
                        }}
                    >
                        {text}
                    </Typography>
                </Stack>
            </Box>
        );
    };

    const handleConfirmPayment = ({ isOutstandingPayment = false, amount = 0 }) => {
        setOutstandingCheckModel(false);

        if (isAllowed('Sales', 'create')) {
            boookingDetailsApi.handlePayment({
                setCart,
                addItem,
                addRefundItem,
                isOutstandingPayment: isOutstandingPayment,
                remainingAmount: Number(amount) ?? 0,
            });
        }
    };

    const syncBooking = async (groupUuid) => {
        if (!settings?.profile?.inspection_module) {
            return;
        }
        try {
            setIsSyncing(true);
            const response = await boookingDetailsApiNode?.syncBookingToGoogleCalendar({
                payload: { groupBookingUuid: groupUuid },
            });
            if (response) {
                setShowSyncButton(false);
            }
        } catch (error) {
            console.error('Error syncing booking to Google Calendar:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const shouldShowCancelationModal = () => {
        // Basic validation
        if (
            !isInspectionEnabled || // Inspection feature must be enabled
            !cancelationSettings?.cancel_before || // Must have cancel_before minutes
            !event?.start || // Must have start time
            bookingDetails?.booking?.sales_id // if sales created then don't show cancelation modal
        ) {
            return false;
        }

        const startTime = moment(event.start);
        const cancelBeforeMinutes = cancelationSettings.cancel_before;

        // When cancellation becomes allowed
        const cancelAllowedFrom = startTime.clone().subtract(cancelBeforeMinutes, 'minutes');

        const now = moment();

        // Inside window → now is between allowed time & start time
        const isInsideCancellationWindow = now.isBetween(cancelAllowedFrom, startTime);

        return isInsideCancellationWindow;
    };

    function calculateCancellationCharge(event, cancellationSettings) {
        const baseCharge = cancellationSettings?.cancelation_charges || 0;
        if (!event?.isGrouped) {
            // single booking
            return baseCharge;
        }
        // grouped booking → sum all service durations
        const group = event?.serviceIds || [];
        return baseCharge * group.length || 0;
    }

    const origialBookings = events.find((event) => event?.id === bookingId)?.origialBookings;

    return (
        <Modal
            keepMounted
            disableAutoFocus
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: isPublicView ? '#fff' : 'rgba(0, 0, 0, 0.5)',
            }}
            onClose={closeForm}
            open={open}
            hideBackdrop={isPublicView}
        >
            <Paper
                sx={{
                    position: 'relative',
                    px: { xs: 1.5, md: 5 },
                    py: { xs: 2, md: 3 },
                    minWidth: { xs: '95%', md: '60%' },
                    borderRadius: isPublicView ? 0 : { xs: 5, md: 7 },
                    overflow: 'hidden',
                    maxWidth: { xs: '95%', md: isPublicView ? '100%' : '80%' },
                    maxHeight: isPublicView ? '100%' : '90%',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                    boxShadow: isPublicView ? 'none' : undefined,
                    backgroundColor: '#fff',
                    width: isPublicView ? '100%' : undefined,
                    height: isPublicView ? '100%' : undefined,
                }}
            >
                {!isPublicView && (
                    <Stack
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        {origialBookings?.some((booking) => booking?.health_declaration) && (
                            <IconButton
                                disableRipple
                                disableFocusRipple
                                disableTouchRipple
                                sx={{
                                    color: '#6f6f6f',
                                    fontSize: 14,
                                    bgcolor: '#D9D9D980',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '35px',
                                    height: '35px',
                                    border: '1px solid #D2D2D2',
                                }}
                                onClick={() => {
                                    setHealthDeclarationBooking({
                                        show: true,
                                        origialBookings: event?.origialBookings,
                                    });
                                }}
                            >
                                {CalendarHandler.getHealthDeclarationStatusIcon(event?.origialBookings, true)}
                            </IconButton>
                        )}
                        <IconButton disableRipple aria-label="close" sx={{ color: '#6f6f6f' }} onClick={closeForm}>
                            <Close />
                        </IconButton>
                    </Stack>
                )}

                {loading ? (
                    <DialogContent
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minWidth: '30dvw',
                            minHeight: '50dvh',
                            px: 0,
                            py: 3,
                            mt: 0,
                            mb: 0,
                        }}
                    >
                        <CircularProgress size="2.5rem" sx={{ color: '#6f6f6f' }} />
                    </DialogContent>
                ) : (
                    <React.Fragment>
                        <Grid2 marginTop={1} paddingBottom={1} container spacing={2}>
                            <Grid2 item size={{ xs: 12, md: 5.75 }}>
                                <Stack sx={{ display: 'flex', width: '100%' }}>
                                    <FPrimaryHeading
                                        text={t('Calendar.BookingDetails')}
                                        sx={{ fontSize: '20px', ml: 4 }}
                                    />

                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            width: '100%',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mt: 3,
                                            px: 1,
                                        }}
                                    >
                                        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <img
                                                src={CalenderIcon}
                                                alt="calender"
                                                style={{ height: '30px', width: '30px' }}
                                            />

                                            <Typography variant="h6" sx={{ pl: 2 }}>
                                                {moment(bookingDetails?.booking?.booking_datetime_start).format(
                                                    'DD/MM-YYYY',
                                                )}
                                            </Typography>
                                        </Stack>

                                        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <img
                                                src={ClockIcon}
                                                alt="clock"
                                                style={{ height: '27px', width: '27px' }}
                                            />

                                            <Typography variant="h6" sx={{ pl: 2 }}>
                                                {event?.isGrouped
                                                    ? `${moment(event?.start).format('HH:mm')} - ${moment(event?.end).format('HH:mm')}`
                                                    : `${
                                                          moment(
                                                              bookingDetails?.booking?.booking_datetime_start,
                                                          ).format('HH:mm') +
                                                          ' - ' +
                                                          moment(bookingDetails?.booking?.booking_datetime_end).format(
                                                              'HH:mm',
                                                          )
                                                      }`}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>

                                <Stack
                                    sx={{
                                        display: 'flex',
                                        width: '100%',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        mt: 3,
                                    }}
                                >
                                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                        {t('Insights.Customer')}
                                    </Typography>

                                    <Box sx={{ flexGrow: 1 }} />

                                    {!isPublicView && (
                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'flex-end',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {bookingDetails?.booking?.outlet_customer?.marketplace_pointer && (
                                                <Tooltip
                                                    placement="top"
                                                    title={bookingDetails?.booking?.outlet_customer?.marketplace_pointer
                                                        ?.split('\n')
                                                        .map((line, i) => (
                                                            <React.Fragment key={i}>
                                                                {line}
                                                                {i <
                                                                    bookingDetails?.booking?.outlet_customer?.marketplace_pointer?.split(
                                                                        '\n',
                                                                    ).length -
                                                                        1 && <br />}
                                                            </React.Fragment>
                                                        ))}
                                                >
                                                    <Stack
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <img
                                                            src={ImportantNoteIcon}
                                                            style={{ height: '30px', width: '30px', marginLeft: 10 }}
                                                            alt="important note"
                                                        />
                                                        <Typography
                                                            variant="body1"
                                                            ml={1}
                                                            mr={2}
                                                            sx={{ fontStyle: 'italic' }}
                                                        >
                                                            {t('Calendar.impNote')}!
                                                        </Typography>
                                                    </Stack>
                                                </Tooltip>
                                            )}

                                            {settings?.profile?.allow_journal &&
                                                bookingDetails?.booking?.outlet_customer?.id && (
                                                    <Link
                                                        style={{
                                                            textDecoration: 'none',
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                        }}
                                                        to={`/customers/${bookingDetails?.booking?.outlet_customer?.id}/journalgroups`}
                                                    >
                                                        <img
                                                            src={JournalIcon}
                                                            style={{ height: '20px', width: '20px', marginLeft: 10 }}
                                                            alt="journal"
                                                        />
                                                        <Typography variant="body1" ml={1} sx={{ fontStyle: 'italic' }}>
                                                            {t('Customer.Journal')}
                                                        </Typography>
                                                    </Link>
                                                )}
                                        </Stack>
                                    )}
                                </Stack>

                                <Stack border={'1.5px solid #D9D9D9'} borderRadius={3} mt={1} height="auto">
                                    <Stack sx={bookingDetailsHandler?.commonStackStyle}>
                                        <Typography
                                            variant="body1"
                                            sx={{ color: '#1F1F1F', width: '25%', fontWeight: 700 }}
                                        >
                                            {t('Common.Name')}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                ...bookingDetailsHandler?.detailsTextStyle,
                                                color:
                                                    bookingDetails?.booking?.outlet_customer?.id &&
                                                    !isPublicView &&
                                                    ' #1C5DE9',
                                                textAlign: 'right',
                                            }}
                                        >
                                            {bookingDetails?.booking?.outlet_customer === null ? (
                                                bookingDetails?.booking?.booking_details?.customer_name
                                            ) : bookingDetails?.booking?.outlet_customer?.id ? (
                                                isPublicView ? (
                                                    bookingDetails?.booking?.outlet_customer?.name
                                                ) : (
                                                    <Link
                                                        to={`/customers/${bookingDetails.booking.outlet_customer.id}/customerinformation`}
                                                        style={{ textDecoration: 'none' }}
                                                    >
                                                        {bookingDetails?.booking.outlet_customer?.name}
                                                    </Link>
                                                )
                                            ) : (
                                                bookingDetails?.booking?.booking_details?.walk_in &&
                                                t('Calendar.DropInCust')
                                            )}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={bookingDetailsHandler?.commonDevider} />

                                    <Stack sx={bookingDetailsHandler?.commonStackStyle}>
                                        <Typography
                                            variant="body1"
                                            sx={{ color: '#1F1F1F', width: '25%', fontWeight: 700 }}
                                        >
                                            {t('Calendar.PhoneNo')}
                                        </Typography>
                                        <Typography variant="body1" sx={bookingDetailsHandler?.detailsTextStyle}>
                                            {bookingDetails?.booking?.outlet_customer === null
                                                ? formatPhoneNumber(
                                                      bookingDetails?.booking?.booking_details?.customer_phone_number,
                                                  )
                                                : formatPhoneNumber(
                                                      bookingDetails?.booking?.outlet_customer?.phone_number,
                                                  )}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={bookingDetailsHandler?.commonDevider} />

                                    <Stack sx={bookingDetailsHandler?.commonStackStyle}>
                                        <Typography
                                            variant="body1"
                                            sx={{ color: '#1F1F1F', width: '25%', fontWeight: 700 }}
                                        >
                                            {t('Common.Email')}
                                        </Typography>
                                        <Typography noWrap variant="body1" sx={bookingDetailsHandler?.detailsTextStyle}>
                                            {bookingDetails?.booking?.outlet_customer?.email}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={bookingDetailsHandler?.commonDevider} />

                                    <Stack sx={bookingDetailsHandler?.commonStackStyle}>
                                        <Typography
                                            variant="body1"
                                            sx={{ color: '#1F1F1F', width: '25%', fontWeight: 700 }}
                                        >
                                            {t('Setting.CPR')}
                                        </Typography>
                                        <Typography variant="body1" sx={bookingDetailsHandler?.detailsTextStyle}>
                                            {bookingDetails?.booking?.outlet_customer?.cpr}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={bookingDetailsHandler?.commonDevider} />

                                    <Stack sx={bookingDetailsHandler?.commonStackStyle}>
                                        <Typography
                                            variant="body1"
                                            sx={{ color: '#1F1F1F', width: '25%', fontWeight: 700 }}
                                        >
                                            {t('Common.Address')}
                                        </Typography>
                                        <Typography noWrap variant="body1" sx={bookingDetailsHandler?.detailsTextStyle}>
                                            {isInspectionEnabled && bookingDetails?.booking?.inspection_data
                                                ? `${inspectionUser?.address} ${inspectionUser?.zip_code || inspectionUser?.zipCode} ${inspectionUser?.city || inspectionUser?.city}`
                                                : bookingDetails?.booking?.outlet_customer?.address
                                                  ? `${
                                                        bookingDetails?.booking?.outlet_customer?.address || ''
                                                    } ${bookingDetails?.booking?.outlet_customer?.zip_code || ''} ${bookingDetails?.booking?.outlet_customer?.city || ''}`
                                                  : ''}
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <React.Fragment>
                                    <Typography variant="body1" sx={{ color: '#1F1F1F', mt: 3, fontWeight: 700 }}>
                                        {t('Insights.Booking')}
                                    </Typography>

                                    <Stack border={'1.5px solid #D9D9D9'} borderRadius={3} mt={1} height="auto">
                                        <Stack sx={bookingDetailsHandler?.commonStackStyle}>
                                            <Typography
                                                variant="body1"
                                                sx={{ color: '#1F1F1F', width: '25%', fontWeight: 700 }}
                                            >
                                                {t('Setting.Employee')}
                                            </Typography>
                                            <Typography variant="body1" sx={bookingDetailsHandler?.detailsTextStyle}>
                                                {bookingDetails?.booking?.booking_details?.employee_name}
                                            </Typography>
                                        </Stack>
                                        <Divider sx={bookingDetailsHandler?.commonDevider} />

                                        <Stack sx={bookingDetailsHandler?.commonStackStyle}>
                                            <Typography
                                                variant="body1"
                                                sx={{ color: '#1F1F1F', width: '25%', fontWeight: 700 }}
                                            >
                                                {t('Calendar.BkdBY')}
                                            </Typography>
                                            <Typography variant="body1" sx={bookingDetailsHandler?.detailsTextStyle}>
                                                {bookingDetails?.booking?.source === 'WEBMARKETPLACE' ||
                                                bookingDetails?.booking?.source === 'DIRECTWEBSTORE'
                                                    ? bookingDetails?.booking?.additional_details?.created_by ||
                                                      t('Insights.Customer')
                                                    : bookingDetails?.booking?.booking_details?.created_by_emp_name}
                                            </Typography>
                                        </Stack>
                                        <Divider sx={bookingDetailsHandler?.commonDevider} />

                                        <Stack sx={bookingDetailsHandler?.commonStackStyle}>
                                            <Typography
                                                variant="body1"
                                                sx={{ color: '#1F1F1F', width: '25%', fontWeight: 700 }}
                                            >
                                                {t('Common.Created')}
                                            </Typography>
                                            <Typography variant="body1" sx={bookingDetailsHandler?.detailsTextStyle}>
                                                {moment
                                                    .parseZone(bookingDetails?.booking?.created_at)
                                                    .format('DD/MM-YY (HH:mm)')}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </React.Fragment>

                                {!isPublicView && (
                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            width: '100%',
                                            flexDirection: { xs: 'column', md: 'row' },
                                            alignItems: { xs: 'flex-start', md: 'center' },
                                            justifyContent: { xs: 'flex-start', md: 'space-between' },
                                            my: 3,
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#1F1F1F',
                                                fontWeight: 700,
                                                mb: { xs: 1, md: 0 },
                                                width: { xs: '100%', md: 'auto' },
                                            }}
                                        >
                                            {t('Calendar.Confirmation')}
                                        </Typography>

                                        <Stack
                                            direction={{ xs: 'column', md: 'row' }}
                                            spacing={2}
                                            sx={{
                                                ml: { xs: 0, md: 1 },
                                                width: '100%',
                                                flexGrow: 1,
                                            }}
                                        >
                                            <Tooltip
                                                title={
                                                    bookingDetails?.booking?.last_sms_time
                                                        ? moment(bookingDetails?.booking?.last_sms_time).format(
                                                              'YYYY-MM-DD HH:mm:ss',
                                                          )
                                                        : ''
                                                }
                                            >
                                                <Box
                                                    onClick={() => {
                                                        if (isSmsPermission) {
                                                            boookingDetailsApi?.handleSend({ type: 'SMS' });
                                                        }
                                                    }}
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    height={{ xs: '45px', md: '35px' }}
                                                    bgcolor={
                                                        bookingDetails?.booking?.last_sms_time ? '#B4F0BA' : '#E5E5E5'
                                                    }
                                                    border={1}
                                                    borderColor={
                                                        bookingDetails?.booking?.last_sms_time ? '#367B3D' : '#A7A7A7'
                                                    }
                                                    p={1}
                                                    borderRadius={2}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                        // minWidth: { xs: '100%', md: '20px' }
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            bookingDetails?.booking?.last_sms_time
                                                                ? SentEmailIcon
                                                                : SentSmsIcon
                                                        }
                                                        style={{ height: '20px', width: '20px' }}
                                                        alt="SentSmsIcon"
                                                    />
                                                    <Typography
                                                        variant="body1"
                                                        ml={1.5}
                                                        sx={{
                                                            fontStyle: 'italic',
                                                            fontSize: { xs: '16px', md: '14px' },
                                                        }}
                                                    >
                                                        {t('Calendar.SMS')}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>

                                            <Tooltip
                                                title={
                                                    bookingDetails?.booking?.last_email_time
                                                        ? moment(bookingDetails?.booking?.last_email_time).format(
                                                              'YYYY-MM-DD HH:mm:ss',
                                                          )
                                                        : ''
                                                }
                                            >
                                                <Box
                                                    onClick={() => {
                                                        bookingDetails?.booking?.outlet_customer?.email &&
                                                            isEmailPermission &&
                                                            boookingDetailsApi?.handleSend({ type: 'EMAIL' });
                                                    }}
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    height={{ xs: '45px', md: '35px' }}
                                                    bgcolor={
                                                        bookingDetails?.booking?.last_email_time ? '#B4F0BA' : '#E5E5E5'
                                                    }
                                                    border={1}
                                                    borderColor={
                                                        bookingDetails?.booking?.last_email_time ? '#367B3D' : '#A7A7A7'
                                                    }
                                                    p={1}
                                                    borderRadius={2}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                        // minWidth: { xs: '100%', md: '20px' }
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            bookingDetails?.booking?.last_email_time
                                                                ? SentEmailIcon
                                                                : SentSmsIcon
                                                        }
                                                        style={{ height: '20px', width: '20px' }}
                                                        alt="SentEmailIcon"
                                                    />
                                                    <Typography
                                                        variant="body1"
                                                        ml={1.5}
                                                        sx={{
                                                            fontStyle: 'italic',
                                                            fontSize: { xs: '16px', md: '14px' },
                                                        }}
                                                    >
                                                        {t('Common.Email')}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                )}
                            </Grid2>

                            <Grid2
                                item
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                size={{ xs: 12, md: 0.5 }}
                            >
                                <Divider
                                    orientation="vertical"
                                    sx={{
                                        display: { xs: 'none', md: 'block' },
                                        color: '#D9D9D9',
                                        borderWidth: '0.5',
                                    }}
                                />
                            </Grid2>

                            <Grid2
                                item
                                size={{ xs: 12, md: 5.75 }}
                                sx={{ display: 'flex', flexDirection: 'column', py: 3 }}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{ mt: 2 }}
                                >
                                    <Typography variant="body1">{t('Common.Status')}</Typography>
                                    {showSyncButton && !isPublicView && (
                                        <Tooltip title={t('POS.SyncBookingToGoogleCalendar')}>
                                            <IconButton
                                                size="small"
                                                disabled={isSyncing}
                                                sx={{
                                                    backgroundColor: '#F1D5BD',
                                                    border: '1px solid #847A71',
                                                    borderRadius: 1,
                                                    '&:hover': {
                                                        backgroundColor: '#E5C8A8',
                                                    },
                                                    '&.Mui-disabled': {
                                                        backgroundColor: '#E5E5E5',
                                                        borderColor: '#A7A7A7',
                                                    },
                                                }}
                                                onClick={async () => {
                                                    await syncBooking(bookingDetails?.booking?.group_booking_uuid);
                                                }}
                                            >
                                                {isSyncing ? (
                                                    <CircularProgress size={16} sx={{ color: '#847A71' }} />
                                                ) : (
                                                    <Sync fontSize="small" />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Stack>

                                <FSelect
                                    sx={{ width: '100%', mt: 1 }}
                                    fontWeight={700}
                                    fontSize={'17px'}
                                    placeholderText="Select Status"
                                    options={statusarr?.map((val) => {
                                        return { value: val.value, label: val.label };
                                    })}
                                    value={status === 'AUTOCOMPLETED' ? 'COMPLETED' : status}
                                    onChange={async (e) => {
                                        // setStatus(e.target.value);

                                        // Handle public view status change
                                        if (isPublicView && onPublicStatusChange) {
                                            await onPublicStatusChange(e.target.value);
                                            return;
                                        }

                                        // Handle bulk operations for grouped bookings
                                        if (event?.isGrouped && event?.bookingIds?.length > 0) {
                                            const bookingIds = event.bookingIds;

                                            if (e.target.value === 'NOSHOW' && noShowSettings?.enable) {
                                                if (isPosEnabled) {
                                                    setNoShowModel(true);
                                                    return;
                                                }
                                            }

                                            // Use bulk operations for grouped bookings
                                            switch (e.target.value) {
                                                case 'CANCELLED':
                                                    if (shouldShowCancelationModal()) {
                                                        setShowCancelationModal(true);
                                                        return;
                                                    } else {
                                                        setShowCancelConfirmation(true);
                                                    }
                                                    break;
                                                case 'BOOKED':
                                                    await boookingDetailsApi?.bulkPendingBookings({
                                                        payload: {
                                                            ids: bookingIds,
                                                            group_uuid: event?.group_booking_uuid,
                                                        },
                                                        setShowBulkConfirmation: null,
                                                    });
                                                    break;
                                                case 'COMPLETED':
                                                    await boookingDetailsApi?.bulkCompleteBookings({
                                                        payload: {
                                                            ids: bookingIds,
                                                            group_uuid: event?.group_booking_uuid,
                                                        },
                                                        setShowBulkConfirmation: null,
                                                    });
                                                    break;
                                                case 'NOSHOW':
                                                    await boookingDetailsApi?.bulkNoShowBookings({
                                                        payload: {
                                                            ids: bookingIds,
                                                            group_uuid: event?.group_booking_uuid,
                                                        },
                                                        setShowBulkConfirmation: null,
                                                    });
                                                    break;
                                                default:
                                                    // Handle custom status or other statuses
                                                    await boookingDetailsApi?.updateBookingStatus({
                                                        status: e.target.value,
                                                    });
                                            }
                                        } else {
                                            // Handle single booking status change
                                            if (e.target.value === 'NOSHOW' && noShowSettings?.enable && isPosEnabled) {
                                                setNoShowModel(true);
                                                return;
                                            }

                                            if (e.target.value === 'CANCELLED' && shouldShowCancelationModal()) {
                                                setShowCancelationModal(true);
                                                return;
                                            } else if (e.target.value === 'CANCELLED') {
                                                setShowCancelConfirmation(true);
                                                return;
                                            } else {
                                                await boookingDetailsApi?.updateBookingStatus({
                                                    status: e.target.value,
                                                });
                                            }
                                        }
                                    }}
                                    colorMap={statusarr?.reduce((acc, val) => {
                                        acc[val.value] = val.tetxColor;
                                        return acc;
                                    }, {})}
                                />

                                <Typography variant="body1" sx={{ mt: 2, fontWeight: 700 }}>
                                    {t('Calendar.Treatment')}
                                </Typography>

                                <Stack border={'1.5px solid #D9D9D9'} borderRadius={3} mt={1} height="auto">
                                    <Stack
                                        sx={{
                                            ...bookingDetailsHandler?.commonStackStyle,
                                            px: 3,
                                            py: 1,
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ color: '#1F1F1F', fontWeight: 700 }}>
                                            {t('Common.Service')}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#1F1F1F', fontWeight: 700 }}>
                                            {' '}
                                            {t('Common.Price')}{' '}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={bookingDetailsHandler?.commonDevider} />
                                    {event?.isGrouped ||
                                    bookingDetails?.booking?.isGroupedPublicView ||
                                    isPublicView ? (
                                        <React.Fragment>
                                            {[bookingDetails?.booking, ...bookingDetails?.group_bookings]
                                                ?.filter((service) => {
                                                    if (event?.serviceIds && event?.serviceIds?.length > 0) {
                                                        return event?.serviceIds?.includes(service?.service_id);
                                                    }
                                                    return true;
                                                })
                                                ?.map((item) => {
                                                    return (
                                                        <React.Fragment key={item?.id}>
                                                            <Stack
                                                                sx={{
                                                                    ...bookingDetailsHandler?.commonStackStyle,
                                                                    width: '100%',
                                                                    alignItems: 'flex-start',
                                                                    px: 3,
                                                                    py: 1,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{ width: '60%', fontWeight: 700, mr: 2 }}
                                                                >
                                                                    {item?.booking_details?.service_name}
                                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ width: '40%', textAlign: 'right' }}
                                                >
                                                    <BlurPrice>
                                                        {formatAmount(item?.total_amount, false)}
                                                    </BlurPrice>
                                                </Typography>
                                                            </Stack>
                                                            <Divider sx={bookingDetailsHandler?.commonDevider} />
                                                        </React.Fragment>
                                                    );
                                                })}
                                        </React.Fragment>
                                    ) : (
                                        <Stack
                                            sx={{
                                                ...bookingDetailsHandler?.commonStackStyle,
                                                width: '100%',
                                                alignItems: 'flex-start',
                                                px: 3,
                                                py: 1,
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ width: '60%', fontWeight: 700, mr: 2 }}>
                                                {bookingDetails?.booking?.booking_details?.service_name}
                                            </Typography>
                                            <Typography variant="body1" sx={{ width: '40%', textAlign: 'right' }}>
                                                <BlurPrice>
                                                    {formatAmount(
                                                        bookingDetails?.booking?.booking_details?.price,
                                                        false,
                                                    )}
                                                </BlurPrice>
                                            </Typography>
                                        </Stack>
                                    )}

                                    {bookingDetails?.booking?.booking_details?.note && (
                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'flex-start',
                                                alignItems: 'flex-start',
                                                px: 1.5,
                                                mt: 1,
                                                mb: 3,
                                            }}
                                        >
                                            <img
                                                src={NoteIcon}
                                                alt="booking note"
                                                style={{ height: '16px', width: '16px', marginTop: 3 }}
                                            />

                                            <Typography
                                                variant="body1"
                                                sx={{ color: '#000000', ml: 1, fontStyle: 'italic' }}
                                            >{`${t('Common.Note')}: ${bookingDetails?.booking?.booking_details?.note}`}</Typography>
                                        </Stack>
                                    )}

                                    {/* Display Inspections Data (Travel Fees & Bridge Fees) */}
                                    {bookingDetails?.booking?.inspection_data?.chargesData && (
                                        <React.Fragment>
                                            {bookingDetails?.booking?.inspection_data?.chargesData?.travelFees !==
                                                undefined && (
                                                <React.Fragment>
                                                    <Divider sx={bookingDetailsHandler?.commonDevider} />
                                                    <Stack
                                                        sx={{
                                                            ...bookingDetailsHandler?.commonStackStyle,
                                                            px: 3,
                                                            py: 1,
                                                        }}
                                                    >
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                            {t('Calendar.TravelFees')}
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                            <BlurPrice>
                                                                {formatAmount(
                                                                    bookingDetails?.booking?.inspection_data?.chargesData
                                                                        ?.travelFees,
                                                                    false,
                                                                )}
                                                            </BlurPrice>
                                                        </Typography>
                                                    </Stack>
                                                </React.Fragment>
                                            )}
                                            {bookingDetails?.booking?.inspection_data?.chargesData?.bridgeFees !==
                                                undefined && (
                                                <React.Fragment>
                                                    <Divider sx={bookingDetailsHandler?.commonDevider} />
                                                    <Stack
                                                        sx={{
                                                            ...bookingDetailsHandler?.commonStackStyle,
                                                            px: 3,
                                                            py: 1,
                                                        }}
                                                    >
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                            {t('Calendar.BridgeFees')}
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                            <BlurPrice>
                                                                {formatAmount(
                                                                    bookingDetails?.booking?.inspection_data?.chargesData
                                                                        ?.bridgeFees,
                                                                    false,
                                                                )}
                                                            </BlurPrice>
                                                        </Typography>
                                                    </Stack>
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    )}

                                    <Divider sx={bookingDetailsHandler?.commonDevider} />
                                    {event?.isGrouped || isPublicView ? (
                                        <React.Fragment>
                                            {/* calculate total amount */}
                                            <Stack
                                                sx={{
                                                    ...bookingDetailsHandler?.commonStackStyle,
                                                    px: 3,
                                                    py: 1,
                                                }}
                                            >
                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    {t('Common.Total')}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    <BlurPrice>
                                                        {formatAmount(
                                                            [bookingDetails?.booking, ...bookingDetails?.group_bookings]
                                                                ?.filter((item) => {
                                                                    if (
                                                                        event?.serviceIds &&
                                                                        event?.serviceIds?.length > 0
                                                                    ) {
                                                                        return event?.serviceIds?.includes(
                                                                            item?.service_id,
                                                                        );
                                                                    }
                                                                    return true;
                                                                })
                                                                ?.reduce(
                                                                    (acc, item) =>
                                                                        acc + Number(item?.total_amount || 0),
                                                                    0,
                                                                ) +
                                                                (bookingDetails?.booking?.inspection_data
                                                                    ? Number(
                                                                          bookingDetails?.booking?.inspection_data
                                                                              ?.chargesData?.travelFees || 0,
                                                                      ) +
                                                                      Number(
                                                                          bookingDetails?.booking?.inspection_data
                                                                              ?.chargesData?.bridgeFees || 0,
                                                                      )
                                                                    : 0),
                                                            false,
                                                        )}
                                                    </BlurPrice>
                                                </Typography>
                                            </Stack>
                                        </React.Fragment>
                                    ) : (
                                        <Stack
                                            sx={{
                                                ...bookingDetailsHandler?.commonStackStyle,
                                                px: 3,
                                                py: 1,
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                {t('Common.Total')}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                <BlurPrice>
                                                    {formatAmount(
                                                        Number(bookingDetails?.booking?.total_amount || 0) +
                                                            (bookingDetails?.booking?.inspection_data
                                                                ? Number(
                                                                      bookingDetails?.booking?.inspection_data
                                                                          ?.chargesData?.travelFees || 0,
                                                                  ) +
                                                                  Number(
                                                                      bookingDetails?.booking?.inspection_data
                                                                          ?.chargesData?.bridgeFees || 0,
                                                                  )
                                                                : 0),
                                                        false,
                                                    )}
                                                </BlurPrice>
                                            </Typography>
                                        </Stack>
                                    )}
                                </Stack>

                                {/* Display Distance below Treatment box */}
                                {bookingDetails?.booking?.inspection_data?.distance !== undefined && (
                                    <Stack border={'1.5px solid #D9D9D9'} borderRadius={3} mt={1} height="auto">
                                        <Stack
                                            sx={{
                                                ...bookingDetailsHandler?.commonStackStyle,
                                                px: 3,
                                                py: 1,
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                {t('Setting.Distance') || 'Distance'}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                {distanceFormat(
                                                    bookingDetails?.booking?.inspection_data?.distance || 0,
                                                )}{' '}
                                                {t('Setting.Km')}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                )}

                                {/* Display Uploaded Files from Inspection Data */}
                                {bookingDetails?.booking?.inspection_data?.uploaded_files_at_checkout &&
                                    bookingDetails?.booking?.inspection_data?.uploaded_files_at_checkout?.length > 0 &&
                                    !isPublicView && (
                                        <>
                                            <Typography variant="body1" sx={{ mt: 3, fontWeight: 700 }}>
                                                {t('Calendar.UploadedFiles') || 'Uploaded Files'}
                                            </Typography>

                                            <Stack
                                                border={'1.5px solid #D9D9D9'}
                                                borderRadius={3}
                                                mt={1}
                                                mb={2}
                                                height="auto"
                                            >
                                                {bookingDetails?.booking?.inspection_data?.uploaded_files_at_checkout?.map(
                                                    (file, index) => {
                                                        const fileUrl = file?.fileUrl?.startsWith('http')
                                                            ? file?.fileUrl
                                                            : `${process.env.REACT_APP_IMG_URL}${file?.fileUrl}`;
                                                        const fileName =
                                                            file?.fileUrl?.split('/')?.pop() || `File ${index + 1}`;

                                                        return (
                                                            <React.Fragment key={file?.fileId || index}>
                                                                <Stack
                                                                    sx={{
                                                                        ...bookingDetailsHandler?.commonStackStyle,
                                                                        px: 3,
                                                                        py: 1.5,
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            backgroundColor: '#F5F5F5',
                                                                        },
                                                                    }}
                                                                    onClick={() => window.open(fileUrl, '_blank')}
                                                                >
                                                                    <Stack
                                                                        direction="row"
                                                                        alignItems="center"
                                                                        spacing={1}
                                                                    >
                                                                        <AttachFile
                                                                            sx={{
                                                                                color: '#847A71',
                                                                                fontSize: '20px',
                                                                            }}
                                                                        />
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                color: '#1C5DE9',
                                                                                textDecoration: 'underline',
                                                                                fontWeight: 500,
                                                                            }}
                                                                        >
                                                                            {file?.fileName || fileName}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Stack>
                                                                {index <
                                                                    bookingDetails?.booking?.inspection_data
                                                                        ?.uploaded_files_at_checkout?.length -
                                                                        1 && (
                                                                    <Divider
                                                                        sx={bookingDetailsHandler?.commonDevider}
                                                                    />
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    },
                                                )}
                                            </Stack>
                                        </>
                                    )}

                                {!isPublicView && (
                                    <Stack sx={{ mt: 2 }}>
                                        <Typography variant="body1" sx={{ mt: 'auto', fontWeight: 700 }}>
                                            {t('Calendar.Actions')}
                                        </Typography>

                                        <Grid2 container sx={{ mt: 2 }} spacing={{ xs: 2, md: 2 }}>
                                            <Grid2 item size={{ xs: 4 }}>
                                                <CustomBox
                                                    borderColor="#847A71"
                                                    bgColor="#F1D5BD"
                                                    // text={t('Calendar.Reschedule')}
                                                    text={t('Calendar.EditBk')}
                                                    IconComponent={Pencilicon}
                                                    height="35px"
                                                    width="35px"
                                                    // onClick={() => {
                                                    //     closeForm();
                                                    //     setShowForm((prev) => ({ ...prev, newReschedule: true }));
                                                    //     setRescheduleData(bookingDetails);
                                                    // }}
                                                    onClick={() => {
                                                        handleReschedule(bookingDetails);
                                                    }}
                                                />
                                            </Grid2>

                                            <Grid2 item size={{ xs: 4 }}>
                                                {status === 'CANCELLED' ? (
                                                    <CustomBox
                                                        borderColor="#005BD9"
                                                        bgColor="#BEBBFF"
                                                        text={t('Calendar.CanceOff')}
                                                        IconComponent={CancelletionofferIcon}
                                                        height="35px"
                                                        width="35px"
                                                        onClick={() => {
                                                            if (shouldOpenCancellationModal) {
                                                                setCancellationOfferModal(true);
                                                            } else {
                                                                toast.error(t('Calendar.CancellationOfferErrorMsg'));
                                                            }
                                                        }}
                                                    />
                                                ) : status === 'OFFERED' ? (
                                                    <CustomBox
                                                        borderColor="#E80006"
                                                        bgColor="#FFCECF"
                                                        text={t('Calendar.DeleteCancellationOffer')}
                                                        IconComponent={CancelOfferIcon}
                                                        height="35px"
                                                        width="35px"
                                                        onClick={() => setShowDeleteCancellationOffer(true)}
                                                    />
                                                ) : (
                                                    <CustomBox
                                                        borderColor="#E80006"
                                                        bgColor="#FFCECF"
                                                        text={t('Calendar.CancelBk')}
                                                        IconComponent={CancellationBookingIcon}
                                                        height="35px"
                                                        width="35px"
                                                        onClick={
                                                            () => {
                                                                if (shouldShowCancelationModal()) {
                                                                    setShowCancelationModal(true);
                                                                    return;
                                                                } else {
                                                                    setShowCancelConfirmation(true);
                                                                }
                                                            }

                                                            // boookingDetailsApi?.confirmCancelBooking({
                                                            //     setShowCancelConfirmation,
                                                            // })
                                                        }
                                                    />
                                                )}
                                            </Grid2>

                                            <Grid2 item size={{ xs: 4 }}>
                                                <CustomBox
                                                    borderColor={
                                                        salesDetailsId && remainingAmount === 0 ? 'green' : '#aaaaaa'
                                                    }
                                                    bgColor={
                                                        salesDetailsId && remainingAmount === 0
                                                            ? 'lightgreen'
                                                            : '#E5E5E5'
                                                    }
                                                    text={t('Calendar.Payment')}
                                                    height="45px"
                                                    width="45px"
                                                    textMerginTop={0}
                                                    sx={{
                                                        cursor: isAllowed('Sales', 'create')
                                                            ? 'pointer'
                                                            : 'not-allowed',
                                                    }}
                                                    IconComponent={
                                                        salesDetailsId && remainingAmount === 0
                                                            ? PaymentSuccess
                                                            : PaymentPending
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            salesDetailsId &&
                                                            remainingAmount !== 0 &&
                                                            currentBookingStatus === 'NOSHOW'
                                                        ) {
                                                            setOutstandingCheckModel(true);
                                                        } else {
                                                            handleConfirmPayment({
                                                                isOutstandingPayment: false,
                                                                amount: 0,
                                                            });
                                                        }
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>
                                    </Stack>
                                )}
                            </Grid2>
                        </Grid2>

                        {!isPublicView && <Divider sx={{ borderWidth: '0.5', borderColor: '#696969' }} />}

                        {!isPublicView && (
                            <Stack
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: 'center',
                                    gap: { xs: 1, md: 2 },
                                    mt: 2,
                                }}
                            >
                                <FButton
                                    height={{ xs: 50, md: 40 }}
                                    title={t('Common.Back')}
                                    variant={'save'}
                                    onClick={() => closeForm()}
                                    sx={{
                                        backgroundColor: '#D9D9D9',
                                        minWidth: { xs: '100%', md: '150px' },
                                        width: { xs: '100%', md: 'auto' },
                                        borderRadius: { xs: 3, md: 2 },
                                        fontSize: { xs: '16px', md: '14px' },
                                    }}
                                />
                                <FButton
                                    height={{ xs: 50, md: 40 }}
                                    title={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontStyle: 'italic',
                                                fontSize: { xs: '16px', md: '14px' },
                                                color: '#000000',
                                            }}
                                        >
                                            {/* {t('Calendar.EditBk')} */}
                                            {t('Calendar.MoveBooking')}
                                        </Typography>
                                    }
                                    variant={'save'}
                                    startIcon={
                                        <img
                                            src={RescheduleIcon}
                                            alt="icon"
                                            style={{ width: '22px', height: '22px', color: '#fff' }}
                                        />
                                    }
                                    // onClick={() => handleReschedule(bookingDetails)}
                                    onClick={() => {
                                        closeForm();
                                        setShowForm((prev) => ({ ...prev, newReschedule: true }));
                                        setRescheduleData((prev) => ({
                                            ...prev,
                                            ...bookingDetails,
                                            booking: {
                                                ...bookingDetails?.booking,
                                                origialBookings:
                                                    events.find((event) => event.id === bookingDetails?.booking?.id)
                                                        ?.origialBookings || [],
                                                isGrouped: events.find(
                                                    (event) => event.id === bookingDetails?.booking?.id,
                                                )?.isGrouped,
                                            },
                                        }));
                                    }}
                                    sx={{
                                        borderRadius: { xs: 3, md: 2 },
                                        backgroundColor: '#F1D5BD',
                                        minWidth: { xs: '100%', md: '150px' },
                                        width: { xs: '100%', md: 'auto' },
                                        ml: { xs: 0, md: 'auto' },
                                        border: '1px solid #847A71',
                                    }}
                                />

                                <FButton
                                    height={{ xs: 50, md: 40 }}
                                    title={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontStyle: 'italic',
                                                fontSize: { xs: '16px', md: '14px' },
                                                color: '#000000',
                                            }}
                                        >
                                            {/* {t('Calendar.EditBk')} */}
                                            {t('Calendar.CopyBooking')}
                                        </Typography>
                                    }
                                    variant={'save'}
                                    startIcon={
                                        <img
                                            src={CopyIcon}
                                            alt="icon"
                                            style={{ width: '22px', height: '22px', color: '#fff' }}
                                        />
                                    }
                                    // onClick={() => handleReschedule(bookingDetails)}
                                    onClick={() => {
                                        closeForm();
                                        setShowForm((prev) => ({ ...prev, newReschedule: true, isCopyBooking: true }));
                                        setRescheduleData((prev) => ({
                                            ...prev,
                                            ...bookingDetails,
                                            booking: {
                                                ...bookingDetails?.booking,
                                                origialBookings:
                                                    events.find((event) => event.id === bookingDetails?.booking?.id)
                                                        ?.origialBookings || [],
                                                isGrouped: events.find(
                                                    (event) => event.id === bookingDetails?.booking?.id,
                                                )?.isGrouped,
                                            },
                                        }));
                                    }}
                                    sx={{
                                        borderRadius: { xs: 3, md: 2 },
                                        backgroundColor: '#E8F5E8',
                                        minWidth: { xs: '100%', md: '150px' },
                                        width: { xs: '100%', md: 'auto' },
                                        border: '1px solid #847A71',
                                    }}
                                />

                                <FButton
                                    height={{ xs: 50, md: 40 }}
                                    variant="contained"
                                    title={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontStyle: 'italic',
                                                color: '#000000',
                                                fontSize: { xs: '16px', md: '14px' },
                                            }}
                                        >
                                            {t('Calendar.DeleteBooking')}
                                        </Typography>
                                    }
                                    startIcon={
                                        <img src={DeleteIcon} alt="icon" style={{ width: '22px', height: '22px' }} />
                                    }
                                    sx={{
                                        boxShadow: 'none',
                                        '&:hover': {
                                            boxShadow: 'none',
                                        },
                                        textTransform: 'none',
                                        borderRadius: { xs: 3, md: 2 },
                                        backgroundColor: '#FFCECF',
                                        border: '1px solid #D30000',
                                        minWidth: { xs: '100%', md: '150px' },
                                        width: { xs: '100%', md: 'auto' },
                                    }}
                                    onClick={() => {
                                        if (bookingDetails?.booking?.sales_id && isInspectionEnabled) {
                                            setShowDeleteInspectionModal(true);
                                            return;
                                        } else {
                                            setShowDeleteConfirmation(true);
                                            return;
                                        }
                                    }}
                                />
                            </Stack>
                        )}

                        {showDeleteConfirmation && (
                            <CustomDeleteModal
                                open={showDeleteConfirmation}
                                handleClose={() => setShowDeleteConfirmation(false)}
                                description={t('Calendar.DeleteDescription')}
                                title={t('Calendar.DeleteBooking')}
                                onClickDismiss={() => setShowDeleteConfirmation(false)}
                                onClickConfirm={async () => {
                                    if (event?.isGrouped && event?.bookingIds?.length > 0) {
                                        await boookingDetailsApi?.confirmDeleteGroupBooking({
                                            setShowDeleteConfirmation,
                                            payload: {
                                                ids: event?.bookingIds,
                                                group_uuid: event?.group_booking_uuid,
                                            },
                                        });
                                    } else {
                                        await boookingDetailsApi?.confirmDeleteBooking({
                                            setShowDeleteConfirmation,
                                        });
                                    }
                                }}
                            />
                        )}

                        {showDeleteCancellationOffer && (
                            <CustomDeleteModal
                                open={showDeleteCancellationOffer}
                                handleClose={() => setShowDeleteCancellationOffer(false)}
                                description={t('Calendar.DeleteCancellationBookingDescription')}
                                title={t('Calendar.DeleteCancellationBooking')}
                                onClickDismiss={() => setShowDeleteCancellationOffer(false)}
                                onClickConfirm={() => boookingDetailsApi?.handleDeleteCancelBooking(refreshBookings)}
                            />
                        )}

                        {cancellationOfferModal && shouldOpenCancellationModal && (
                            <CancellationOfferModal
                                cancellationOfferModal={cancellationOfferModal}
                                setCancellationOfferModal={setCancellationOfferModal}
                                bookingDetails={bookingDetails}
                                refreshBooking={() => refreshBookings()}
                                setShowForm={() => setShowForm()}
                            />
                        )}

                        {showCancelConfirmation && (
                            <CustomDeleteModal
                                open={showCancelConfirmation}
                                handleClose={() => setShowCancelConfirmation(false)}
                                description={t('Calendar.CancelDescription')}
                                title={t('Calendar.CancelBooking')}
                                onClickDismiss={() => setShowCancelConfirmation(false)}
                                onClickConfirm={async () => {
                                    if (event?.isGrouped && event?.bookingIds?.length > 0) {
                                        await boookingDetailsApi?.bulkCancelBookings({
                                            payload: {
                                                ids: event.bookingIds,
                                                group_uuid: event?.group_booking_uuid,
                                                admin_charge_cancellation: false,
                                            },
                                            setShowBulkConfirmation: setShowCancelConfirmation,
                                        });
                                    } else {
                                        await boookingDetailsApi?.confirmCancelBooking({
                                            setShowCancelConfirmation,
                                            admin_charge_cancellation: false,
                                        });
                                    }
                                }}
                            />
                        )}

                        {noShowModel && (
                            <NoShowPopups
                                open={noShowModel}
                                closeForm={() => setNoShowModel(false)}
                                data={bookingDetails}
                                BillingAmount={BillingAmount}
                                noShowSettings={noShowSettings}
                                updateBillingAmount={(amount) => {
                                    bookingDetailsHandler?.updateBillingAmount(amount);
                                }}
                                onFormSubmit={async (payload) => {
                                    if (isPosEnabled) {
                                        const toastId = toast.loading(t('Calendar.ToastLoadingNoShow'));
                                        try {
                                            const fullCart = await bookingDetailsHandler?.getFullCart({
                                                customPrice: payload?.noShowAmount,
                                            });
                                            await boookingDetailsApi?.handleSellAsOutstanding({
                                                payload: { data: fullCart },
                                            });
                                            await boookingDetailsApi?.noShowDetailsUpdate({ payload });
                                            await boookingDetailsApi?.updateBookingStatus({
                                                status: 'NOSHOW',
                                                showToast: false,
                                            });
                                            toast.update(toastId, {
                                                render: t('Calendar.ToastSuccessNoShow'),
                                                type: 'success',
                                                isLoading: false,
                                                autoClose: 2000,
                                            });
                                            closeForm();
                                        } catch (error) {
                                            toast.update(toastId, {
                                                render: t('Calendar.ToastErrorNoShow'),
                                                type: 'error',
                                                isLoading: false,
                                                autoClose: 2000,
                                            });
                                        }
                                    }
                                }}
                            />
                        )}

                        {outstandingCheckModel && (
                            <CustomDeleteModal
                                open={outstandingCheckModel}
                                handleClose={() => setOutstandingCheckModel(false)}
                                title={t('Calendar.CheckOutstandingNoShowFee')}
                                description={
                                    <Box sx={{ my: 1 }}>
                                        <Typography>{t('Calendar.OutstandingNoShowFeeText')}</Typography>
                                        <Typography>
                                            {t('Calendar.OutstandingNoShowFeeDetails1')}&nbsp;
                                            {salesCreatedDate?.format('DD/MM-YYYY HH:mm')}
                                            &nbsp;{t('Calendar.OutstandingNoShowFeeDetails2')}
                                        </Typography>
                                    </Box>
                                }
                                dismissTitle={t('Setting.Cancel')}
                                dismissBg={'#D30000'}
                                dismissColor={'#fff'}
                                confirmTitle={t('Calendar.ContinueAnyway')}
                                ConfirmBg={'#44B904'}
                                onClickConfirm={() =>
                                    handleConfirmPayment({ isOutstandingPayment: true, amount: remainingAmount })
                                }
                                onClickDismiss={() => setOutstandingCheckModel(false)}
                            />
                        )}

                        {showCancelationModal && (
                            <CustomDeleteModal
                                open={showCancelationModal}
                                handleClose={() => setShowCancelationModal(false)}
                                title={t('Calendar.CancelBookingInspection')}
                                description={
                                    <Box sx={{ my: 1 }}>
                                        <Typography>
                                            {t('Calendar.CancelBookingInspectionDescription1')}{' '}
                                            {/* IF group bookings then serives * cancelationSettings?.cancelation_charges */}
                                            {formatCurrency(calculateCancellationCharge(event, cancelationSettings))}
                                        </Typography>
                                        <Typography>{t('Calendar.CancelBookingInspectionDescription2')}</Typography>
                                    </Box>
                                }
                                onClickDismiss={async () => {
                                    if (event?.isGrouped && event?.bookingIds?.length > 0) {
                                        await boookingDetailsApi?.bulkCancelBookings({
                                            payload: {
                                                ids: event.bookingIds,
                                                group_uuid: event?.group_booking_uuid,
                                                admin_charge_cancellation: false,
                                            },
                                            setShowBulkConfirmation: setShowCancelationModal,
                                        });
                                    } else {
                                        await boookingDetailsApi?.confirmCancelBooking({
                                            setShowCancelConfirmation: setShowCancelationModal,
                                            admin_charge_cancellation: false,
                                        });
                                    }
                                    setShowCancelationModal(false);
                                }}
                                onClickConfirm={async () => {
                                    if (event?.isGrouped && event?.bookingIds?.length > 0) {
                                        await boookingDetailsApi?.bulkCancelBookings({
                                            payload: {
                                                ids: event.bookingIds,
                                                group_uuid: event?.group_booking_uuid,
                                                admin_charge_cancellation: true,
                                            },
                                            setShowBulkConfirmation: setShowCancelationModal,
                                        });
                                    } else {
                                        await boookingDetailsApi?.confirmCancelBooking({
                                            setShowCancelConfirmation: setShowCancelationModal,
                                            admin_charge_cancellation: true,
                                        });
                                    }
                                    setShowCancelationModal(false);
                                }}
                                dismissTitle={t('Calendar.NoWithoutCharge')}
                                dismissBg={'#D9d9d9'}
                                dismissColor={'#fff'}
                                confirmTitle={t('Calendar.YesAndCharge')}
                                ConfirmBg={'#44B904'}
                            />
                        )}

                        {showDeleteInspectionModal && (
                            <CustomDeleteModal
                                open={showDeleteInspectionModal}
                                handleClose={() => setShowDeleteInspectionModal(false)}
                                title={t('Calendar.DeleteBookingInspection')}
                                description={
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                                        {t('Calendar.DeleteBookingInspectionDescription')}
                                    </Typography>
                                }
                                onClickConfirm={async () => {
                                    if (event?.isGrouped && event?.bookingIds?.length > 0) {
                                        await boookingDetailsApi?.confirmDeleteGroupBooking({
                                            setShowDeleteConfirmation: setShowDeleteInspectionModal,
                                            payload: {
                                                ids: event?.bookingIds,
                                                group_uuid: event?.group_booking_uuid,
                                            },
                                        });
                                    } else {
                                        await boookingDetailsApi?.confirmDeleteBooking({
                                            setShowDeleteConfirmation: setShowDeleteInspectionModal,
                                        });
                                    }
                                }}
                                onClickDismiss={() => {
                                    setShowDeleteInspectionModal(false);
                                }}
                                dismissTitle={t('Setting.Cancel')}
                                dismissBg={'#D9d9d9'}
                                dismissColor={'#fff'}
                                confirmTitle={t('Common.Continue')}
                                ConfirmBg={'#44B904'}
                            />
                        )}
                    </React.Fragment>
                )}
            </Paper>
        </Modal>
    );
}
