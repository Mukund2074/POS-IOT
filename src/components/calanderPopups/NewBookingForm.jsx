import React, { useEffect, useState } from 'react';
import { Stack, AppBar, Box, Typography, useMediaQuery, useTheme, Modal, Paper } from '@mui/material';

import CreateBookingTab from '../../components/calanderComponents/booking/createBookingTab';
import PauseCalendarTab from '../../components/calanderComponents/booking/pauseCalendarTab';
import { t } from 'i18next';
import FileUploadModal from '../../components/calanderComponents/booking/fileUploadModal';
import SubscriptionModal from '../../components/calanderComponents/booking/subscriptionModal';

const commonStyle = {
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#BBB0A4',
};

export default function NewBookingForm({
    initialData,
    open,
    closeForm,
    rescheduleProps,
    validatePause,
    pauseProps,
    setEvents,
    tempId,
    refreshBookings,
    settingSelector,
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedTab, setSelectedTab] = useState(pauseProps ? 1 : 0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    useEffect(() => {
        console.log('[NEW BOOKING FORM] pauseProps', pauseProps);
        if (pauseProps) {
            setSelectedTab(1);
        } else {
            setSelectedTab(0);
        }
    }, [pauseProps]);

    return (
        <Modal
            // keepMounted
            // fullWidth
            // maxWidth={isMobile ? "sm" : "md"}
            disableAutoFocus
            open={open}
            onClose={closeForm}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', zIndex: 20 }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    width: { xs: '95%', md: '75%' },
                    borderRadius: { xs: 5, md: 7 },
                    overflow: 'hidden',
                    // maxWidth: { xs: '95%', md: '80%' },
                    maxHeight: '90%',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    msOverflowStyle: 'none',
                }}
            >
                <Stack sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
                    <AppBar position="sticky" sx={{ backgroundColor: '#FFFFFF', boxShadow: 'none' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: isMobile ? 2 : 10,
                                gap: isMobile ? 4 : 10,
                                maxWidth: '100%',
                                scrollbarWidth: 'none',
                                overflowX: 'scroll',
                            }}
                        >
                            {!pauseProps && (
                                <Typography
                                    noWrap
                                    variant="body1"
                                    sx={{
                                        ...commonStyle,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        fontSize: isMobile ? '0.9rem' : undefined,
                                        ...(selectedTab === 0
                                            ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                            : {}),
                                    }}
                                    onClick={() => setSelectedTab(0)}
                                >
                                    {rescheduleProps ? t('Calendar.EditBk') : t('Calendar.CreBook')}
                                </Typography>
                            )}

                            {!pauseProps && (
                                <Typography
                                    noWrap
                                    variant="body1"
                                    sx={{
                                        ...commonStyle,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        fontSize: isMobile ? '0.9rem' : undefined,
                                        ...(selectedTab === 2
                                            ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                            : {}),
                                    }}
                                    onClick={() => setSelectedTab(2)}
                                >
                                    {t('Calendar.UploadFiles')}
                                </Typography>
                            )}

                            {settingSelector?.profile?.inspection_module && !pauseProps && (
                                <Typography
                                    noWrap
                                    variant="body1"
                                    sx={{
                                        ...commonStyle,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        fontSize: isMobile ? '0.9rem' : undefined,
                                        ...(selectedTab === 3
                                            ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                            : {}),
                                    }}
                                    onClick={() => setSelectedTab(3)}
                                >
                                    {t('Calendar.Subscription')}
                                </Typography>
                            )}

                            {!rescheduleProps && (
                                <Typography
                                    noWrap
                                    variant="body1"
                                    sx={{
                                        ...commonStyle,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        fontSize: isMobile ? '0.9rem' : undefined,
                                        ...(selectedTab === 1
                                            ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                            : {}),
                                    }}
                                    onClick={() => setSelectedTab(1)}
                                >
                                    {t('Calendar.CrePause')}
                                </Typography>
                            )}
                        </Box>
                    </AppBar>
                </Stack>

                <Box sx={{ px: isMobile ? 1 : 0 }}>
                    {selectedTab === 0 && (
                        <CreateBookingTab
                            refreshBookings={refreshBookings}
                            initialData={initialData}
                            rescheduleProps={rescheduleProps}
                            closeForm={closeForm}
                            setEvents={setEvents}
                            tempId={tempId}
                            selectedFiles={selectedFiles}
                            setSelectedCustomer={setSelectedCustomerId}
                        />
                    )}

                    {selectedTab === 1 && (
                        <PauseCalendarTab
                            pauseProps={pauseProps}
                            validatePause={validatePause}
                            initialData={initialData}
                            closeForm={closeForm}
                            setEvents={setEvents}
                        />
                    )}

                    {selectedTab === 2 && (
                        <FileUploadModal
                            uploadedFiles={(e) => {
                                setSelectedFiles(e);
                            }}
                            rescheduleProps={rescheduleProps}
                        />
                    )}

                    {settingSelector?.profile?.inspection_module && selectedTab === 3 && (
                        <SubscriptionModal
                            outletCustomerId={selectedCustomerId?.id || rescheduleProps?.selectedCustomer?.id}
                        />
                    )}
                </Box>
            </Paper>
        </Modal>
    );
}
