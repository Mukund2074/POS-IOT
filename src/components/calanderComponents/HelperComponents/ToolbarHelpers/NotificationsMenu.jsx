import { Menu, MenuItem, Typography, Divider, Box, Stack } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import NotificationItem from './NotificationItem';
import moment from 'moment';
import FSwitch from '../../../commonComponents/f-switch';
import { Circle } from '@mui/icons-material';
import { formatAmount } from '../../../../utils/format-amout';
import BlurPrice from '@/components/commonComponents/BlurPrice';

export default function NotificationsMenu({
    anchorEl,
    open,
    handleClose,
    notificationsToShow,
    handleClickNotification,
    readAllNotifications,
    handleUnreadNotification,
    showUnreadOnly,
}) {
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
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
                    {t('Calendar.Notifications')}
                </Typography>

                <FSwitch
                    checked={showUnreadOnly}
                    onChange={(e) => {
                        handleUnreadNotification(e.target.checked);
                        // setShowUnreadOnly(e.target.checked)
                    }}
                    labelPlacement="start"
                    label={'Show only Unread'}
                />
            </MenuItem>

            <Typography
                onClick={readAllNotifications}
                variant="subtitle1"
                sx={{ cursor: 'pointer', textAlign: 'right', px: 2, textDecoration: 'underline' }}
            >
                {t('Calendar.MarkRead')}
            </Typography>

            <Divider />

            {notificationsToShow.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflowY: 'auto', scrollbarWidth: 'none' }}>
                    {/* 
                {showUnreadOnly && unreadNotifications.length > 0 && (
                  <Typography variant="subtitle1" sx={{ padding: '8px 16px', fontWeight: 'bold' }} >
                    {t("Calendar.Unread")}
                  </Typography>
                )} */}

                    {notificationsToShow.map((notification) => (
                        <MenuItem
                            onClick={() => handleClickNotification({ item: notification })}
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
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontWeight: 'bold' }}>
                                        {notification.notification}
                                    </Typography>
                                    <span>
                                        {moment.parseZone(notification.denmark_created_at).format('DD/MM-YY t. HH:mm')}{' '}
                                    </span>
                                </Stack>

                                <NotificationItem item={notification?.customer_name} label={t('Insights.Customer')} />
                                <NotificationItem
                                    item={notification?.customer_phone_number}
                                    label={t('Common.Phone')}
                                />
                                <NotificationItem item={notification?.employee_name} label={t('Common.CapsEmployee')} />
                                <NotificationItem
                                    item={notification.services.length > 0 ? notification.services.join(', ') : ''}
                                    label={t('Common.Service')}
                                />
                                <NotificationItem
                                    item={`${moment(notification.booking_datetime_start).format('DD/MM-YY')} ${moment(
                                        notification.booking_datetime_start
                                    ).format('HH:mm')} - ${moment(notification.booking_datetime_end).format('HH:mm')}`}
                                    label={t('Common.Time')}
                                />
                                <NotificationItem
                                    item={
                                        <BlurPrice>
                                            {formatAmount(notification.price, false)}
                                        </BlurPrice>
                                    }
                                    label={t('Common.Price')}
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
