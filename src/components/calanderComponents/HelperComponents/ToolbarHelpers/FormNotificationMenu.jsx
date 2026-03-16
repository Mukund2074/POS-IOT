import { CheckRounded, Circle, Close } from '@mui/icons-material';
import { Menu, MenuItem, Typography, Divider, Box, Stack } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import NotificationItem from './NotificationItem';
import moment from 'moment';

export default function FormNotificationMenu({
    anchorEl2,
    open2,
    handleClose,
    formNotifications,
    handleFormNotificationClick,
}) {
    return (
        <Menu
            anchorEl={anchorEl2}
            open={open2}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
                sx: { maxWidth: 450, minWidth: { xs: 200, md: 400 }, borderRadius: 5 },
            }}
        >
            <MenuItem
                disableRipple
                disableTouchRipple
                sx={{
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {t('Calendar.Customerforms')}
                </Typography>
            </MenuItem>

            <Divider />

            {formNotifications.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflowY: 'auto', scrollbarWidth: 'none' }}>
                    {formNotifications &&
                        formNotifications?.map((notification) => (
                            <MenuItem
                                onClick={() => handleFormNotificationClick({ item: notification })}
                                key={notification.id}
                                sx={{
                                    minWidth: { xs: 200, md: 400 },
                                    maxWidth: 450,
                                    backgroundColor: notification.is_read ? '#f5f5f5' : '#e8e8e8',
                                    borderRadius: 1,
                                    mb: 1,
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 2,
                                }}
                            >
                                <Circle sx={{ fontSize: 15, color: notification.is_read ? 'transparent' : 'green' }} />
                                <Stack sx={{ flexGrow: 1 }}>
                                    <Stack gap={1} flexDirection={'row'} justifyContent={'space-between'}>
                                        <NotificationItem item={notification?.customer_name} label={t('Common.Name')} />
                                        <span>
                                            {moment
                                                .parseZone(notification.denmark_created_at)
                                                .format('DD/MM-YY t. HH:mm')}{' '}
                                        </span>
                                    </Stack>

                                    <NotificationItem item={notification?.customer_email} label={t('Common.Email')} />
                                    {notification.customer_phone && (
                                        <NotificationItem
                                            item={notification?.customer_phone}
                                            label={t('Common.Phone')}
                                        />
                                    )}
                                    <NotificationItem
                                        item={
                                            notification?.is_submitted ? (
                                                <CheckRounded
                                                    sx={{ color: 'green', fontSize: 18, fontWeight: 'bold' }}
                                                />
                                            ) : (
                                                <Close sx={{ color: 'red', fontSize: 18, fontWeight: 'bold' }} />
                                            )
                                        }
                                        label={t('Calendar.Submitted')}
                                    />
                                </Stack>
                            </MenuItem>
                        ))}
                </Box>
            ) : (
                <Typography variant="body2" sx={{ padding: '16px' }}>
                    {t('Calendar.NoNoti')}.
                </Typography>
            )}
        </Menu>
    );
}
