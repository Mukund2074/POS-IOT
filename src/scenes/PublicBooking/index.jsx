import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Container, Paper, Stack, Typography, Backdrop } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import BookingDetailsModal from '../../components/calanderComponents/bookingDetails';

const PublicBooking = () => {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingData, setBookingData] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`${process.env.REACT_APP_URL2}/api/booking`, {
                    params: { token },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.data.success) {
                    const mainBooking = response.data.data.booking;
                    const groupBookings = response.data.data.group_bookings || [];
                    const customStatuses = response.data.data.customStatuses || [];

                    if (!mainBooking) {
                        setError('No booking found');
                        return;
                    }

                    // Use API response directly
                    const bookingDataWithGrouping = {
                        booking: mainBooking,
                        isGroupedPublicView: groupBookings.length > 0,
                        group_bookings: groupBookings,
                        customStatuses: customStatuses,
                    };

                    setBookingData(bookingDataWithGrouping);
                } else {
                    setError('Failed to load booking details');
                }
            } catch (err) {
                console.error('Error fetching booking:', err);
                setError(err.response?.data?.message || 'Invalid or expired token. Booking not found.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchBookingDetails();
        }
    }, [token]);

    // Handle status change
    const handleStatusChange = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            // Determine if it's a custom status (numeric) or standard status
            const isCustomStatus = !['BOOKED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NOSHOW'].includes(newStatus);

            const response = await axios.patch(
                `${process.env.REACT_APP_URL}/api/v2/web/booking/statusUpdate?token=${token}`,
                {
                    status: isCustomStatus ? null : newStatus,
                    customStatusId: isCustomStatus ? parseInt(newStatus) : null,
                    google_calendar_sync: true,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            // Show toast based on calendar sync status
            if (response.data.success) {
                // If there's a calendar sync error, show info toast with both messages
                if (response.data.calendarSyncError) {
                    toast.info(`Status updated successfully. ${response.data.calendarSyncError}`, {
                        autoClose: 6000,
                    });
                } else {
                    // No sync error, show success toast
                    toast.success(response.data.message || 'Status updated successfully');
                }
            }
        } catch (err) {
            console.error('Error updating status:', err);
            // Show error toast
            toast.error(err.response?.data?.message || 'Failed to update status. Please try again.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Stack alignItems="center" justifyContent="center" minHeight="60vh">
                    <CircularProgress size="3rem" sx={{ color: '#A79C92' }} />
                    <Typography variant="body1" sx={{ mt: 2, color: '#6f6f6f' }}>
                        Loading booking details...
                    </Typography>
                </Stack>
            </Container>
        );
    }

    if (error || !bookingData) {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h5" color="error" align="center">
                        {error || 'Invalid or expired token. Booking not found.'}
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <>
            <BookingDetailsModal
                open={true}
                closeForm={() => {}}
                bookingId={null}
                handleReschedule={() => {}}
                setShowForm={() => {}}
                setRescheduleData={() => {}}
                events={[]}
                isPublicView={true}
                publicBookingData={bookingData}
                onPublicStatusChange={handleStatusChange}
            />

            {/* Loading Overlay */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.modal + 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }}
                open={updatingStatus}
            >
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} sx={{ color: '#A79C92' }} />
                    <Typography variant="h6" sx={{ color: '#fff' }}>
                        Updating status...
                    </Typography>
                </Stack>
            </Backdrop>
        </>
    );
};

export default PublicBooking;
