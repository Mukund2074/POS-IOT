import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Typography, Grid2, Select, MenuItem, Stack } from '@mui/material';
import { t } from 'i18next';
import usimg from '../../assets/us.png';
import denImg from '../../assets/den.png';
import { useSelector } from 'react-redux';
import CustomDeleteModal from '../../components/deleteAlertModal';
import { performCompleteLogout } from '../../utils/queryCacheUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useLayout } from '../../context/LayoutContext.js';

const commonStyle = {
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#BBB0A4',
};
export default function SettingsLayout() {
    const { isCollapse, isMobile } = useLayout();
    const pages = useMemo(
        () => [
            {
                id: '',
                label: t('Setting.General'),
                path: '/settings',
            },
            {
                id: 'online-booking',
                label: t('Setting.OnlineBooking'),
                path: '/settings/online-booking',
            },
            {
                id: 'calendar',
                label: t('Setting.Calendar'),
                path: '/settings/calendar',
            },
            {
                id: 'employees',
                label: t('Setting.Employees'),
                path: '/settings/employees',
            },
            {
                id: 'opening-hours',
                label: t('Setting.OpeningHours'),
                path: '/settings/opening-hours',
            },
            {
                id: 'journal-groups',
                label: t('Common.JournalGroups'),
                path: '/settings/journal-groups',
            },
            {
                id: 'advanced-journals',
                label: t('Setting.AdvancedJournals'),
                path: '/settings/advanced-journals',
            },
            {
                id: 'integration',
                label: t('POS.Integration'),
                path: '/settings/integration',
            },
            {
                id: 'logout',
                label: t('Setting.Logout'),
                path: '/settings/logout',
            },
        ],
        [],
    );

    const [selectedOption, setSelectedOption] = useState('');
    const [logoutModal, setLogoutModal] = useState(false);
    const [language, setLanguage] = useState('da');

    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleClick = (option) => {
        if (option === 'logout') {
            setLogoutModal(true);
        } else {
            setSelectedOption(option);
            navigate(pages.find((page) => page.id === option)?.path);
        }
    };

    const handleLogout = async () => {
        await performCompleteLogout(queryClient, navigate);
    };

    const getSettings = useSelector((state) => state.settings.data);

    const handleLanguageChange = (value) => {
        setLanguage(value);
        localStorage.setItem('language', value);
        window.location.reload();
    };

    useEffect(() => {
        const matched = pages
            .filter((page) => page.path && location.pathname.startsWith(page.path))
            .sort((a, b) => b.path.length - a.path.length)[0];

        if (matched) setSelectedOption(matched.id);
        else setSelectedOption('');
    }, [location.pathname, pages]);

    useEffect(() => {
        const lang = localStorage.getItem('language');
        if (lang) {
            setLanguage(lang);
        } else {
            setLanguage('da');
        }
    }, []);

    return (
        <React.Fragment>
            <AppBar
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: !isMobile && (isCollapse ? 0 : 120),
                    width: isCollapse ? '100%' : '95%',
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 50px 0px rgba(0, 0, 0, 0.05)',
                    zIndex: 1,
                    pl: { xs: 0, md: 14 },
                }}
            >
                <Grid2 container spacing={2}>
                    <Grid2
                        size={{ xs: 9, md: 10.5 }}
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: { xs: 1, md: 5.5 },
                            maxWidth: '100%',
                            scrollbarWidth: 'none',
                            overflowX: 'scroll',
                            overflowY: 'hidden',
                            px: 4,
                        }}
                    >
                        <Typography
                            noWrap
                            variant="body1"
                            sx={{
                                ...commonStyle,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                ...(selectedOption === ''
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('')}
                        >
                            {t('Setting.General')}
                        </Typography>

                        <Typography
                            noWrap
                            variant="body1"
                            sx={{
                                ...commonStyle,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                ...(selectedOption === 'online-booking'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('online-booking')}
                        >
                            {t('Setting.OnlineBooking')}
                        </Typography>

                        <Typography
                            noWrap
                            variant="body1"
                            sx={{
                                ...commonStyle,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                ...(selectedOption === 'calendar'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('calendar')}
                        >
                            {t('Setting.Calendar')}
                        </Typography>

                        <Typography
                            noWrap
                            variant="body1"
                            sx={{
                                ...commonStyle,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                ...(selectedOption === 'employees'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('employees')}
                        >
                            {t('Setting.Employees')}
                        </Typography>

                        <Typography
                            noWrap
                            variant="body1"
                            sx={{
                                ...commonStyle,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                ...(selectedOption === 'opening-hours'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('opening-hours')}
                        >
                            {t('Setting.OpeningHours')}
                        </Typography>

                        {getSettings?.profile?.allow_journal && (
                            <Typography
                                noWrap
                                variant="body1"
                                sx={{
                                    ...commonStyle,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    ...(selectedOption === 'journal-groups'
                                        ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                        : {}),
                                }}
                                onClick={() => handleClick('journal-groups')}
                            >
                                {t('Common.JournalGroups')}
                            </Typography>
                        )}

                        {getSettings?.profile?.allow_advance_journal && (
                            <Typography
                                noWrap
                                variant="body1"
                                sx={{
                                    ...commonStyle,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    ...(selectedOption === 'advanced-journals'
                                        ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                        : {}),
                                }}
                                onClick={() => handleClick('advanced-journals')}
                            >
                                {t('Setting.AdvancedJournals')}
                            </Typography>
                        )}

                        <Typography
                            noWrap
                            variant="body1"
                            sx={{
                                ...commonStyle,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                ...(selectedOption === 'integration'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('integration')}
                        >
                            {t('POS.Integration')}
                        </Typography>

                        <Typography
                            noWrap
                            variant="body1"
                            sx={{
                                ...commonStyle,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                            onClick={() => handleClick('logout')}
                        >
                            {t('Setting.Logout')}
                        </Typography>
                    </Grid2>

                    <Grid2 size={{ xs: 3, md: 1.5 }}>
                        <Select
                            value={language ? language : 'da'}
                            onChange={(e) => {
                                handleLanguageChange(e.target.value);
                            }}
                            sx={{
                                boxShadow: 'none',
                                '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                },
                                width: '100%',
                                height: 40,
                            }}
                        >
                            <MenuItem value="en">
                                <img src={usimg} alt="English" style={{ width: 20, marginRight: 8 }} />
                                English
                            </MenuItem>
                            <MenuItem value="da">
                                <img src={denImg} alt="Danish" style={{ width: 20, marginRight: 8 }} />
                                Dansk
                            </MenuItem>
                        </Select>
                    </Grid2>
                </Grid2>
            </AppBar>

            {logoutModal && (
                <CustomDeleteModal
                    open={logoutModal}
                    title={'Logout'}
                    handleClose={() => setLogoutModal(false)}
                    description={t('Setting.AreYouSureYouWantToLogout')}
                    onClickDismiss={() => setLogoutModal(false)}
                    onClickConfirm={() => handleLogout()}
                />
            )}
            <Stack sx={{ pt: { xs: 6, md: 4 } }}>
                <Outlet />
            </Stack>
        </React.Fragment>
    );
}
