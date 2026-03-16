import React, { useEffect, useState } from 'react';
import { AppBar, MenuItem, Select, Stack, Typography, Grid2 } from '@mui/material';
import OnlineBookingSettingsOption from '../../components/settings/onlineBooking';
import GeneralSettingsOption from '../../components/settings/general';
import EmployeeSettingsOption from '../../components/settings/employee';
import CalendarSettingsOption from '../../components/settings/calendar';
import JournalGroupSettingsOption from '../../components/settings/journalGroup';
import AdvanceJournalGroupSettingsOption from '../../components/settings/advanceJournal';
import OpeningHours from '../../components/settings/opningHours';
import { useNavigate } from 'react-router-dom';
import CustomDeleteModal from '../../components/deleteAlertModal';
import apiFetcher from '../../utils/interCeptor';
import { useDispatch } from 'react-redux';
import { settings } from '../../context/settingsSlice';
import { t } from 'i18next';
import usimg from '../../assets/us.png';
import denImg from '../../assets/den.png';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { performCompleteLogout } from '../../utils/queryCacheUtils';

const commonStyle = {
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#BBB0A4',
};

export const dividerSx = {
    my: 2,
    border: '2.5px solid #F3F3F3',
    backgroundColor: '#F3F3F3',
    width: '100%',
};

const SettingsOption = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedOption, setSelectedOption] = useState('General');
    const [logoutModal, setLogoutModal] = useState(false);
    const [language, setLanguage] = useState('da');

    const getSettings = useSelector((state) => state.settings.data);

    const handleClick = (option) => {
        setSelectedOption(option);
    };

    const dispatch = useDispatch();

    // const fetchSettings = async () => {

    //   try {
    //     const res = await apiFetcher.get("/api/v1/store/outlet/setting");

    //     let settingsObj = {
    //       OnlineBooking: null,
    //       calendar: {
    //         setCalendarOpeningHour: 240,
    //         setCalendarClosingHour: 240,
    //         grayOutClosedHours: false,
    //         showOnlyAvailableEmployee: false,
    //         calendarInterval: 5,
    //       },
    //     };

    //     res.data.data.settings.map((settingObj) => {
    //       if (settingObj.settingName == "OnlineBooking") {
    //         settingsObj["OnlineBooking"] = settingObj?.value
    //           ? JSON.parse(settingObj?.value)
    //           : null;
    //       }
    //       if (settingObj.settingName == "calendar") {
    //         settingsObj["calendar"] = settingObj?.value
    //           ? JSON.parse(settingObj?.value)
    //           : null;
    //       }
    //     });

    //     dispatch(settings(settingsObj));

    //     getEmployees();
    //   } catch (error) {
    //     console.error("error", error);
    //   }
    // };

    const getEmployees = async () => {
        try {
            const response = await apiFetcher.get('/api/v1/store/employee/get');

            const { success, data } = response.data;
            if (success) {
                const dataValue = data.map((dataObj) => {
                    let newData = JSON.stringify(dataObj);
                    let newObj = { ...JSON.parse(newData) };
                    const permission = { ...newObj.settings };
                    delete newObj.settings;

                    return {
                        ...newObj,
                        label: newObj.name,
                        value: newObj.id,
                        permission,
                        selectedEmployee: false,
                    };
                });

                // setEmployees(dataValue);
                dispatch(settings({ employees: dataValue }));
            }
        } catch (err) {
            console.error('err', err);
        }
    };

    useEffect(() => {
        const lang = localStorage.getItem('language');
        if (lang) {
            setLanguage(lang);
        } else {
            setLanguage('da');
        }
        // fetchSettings();
    }, []);

    const handleLogout = async () => {
        await performCompleteLogout(queryClient, navigate);
    };

    function handleLanguageChange(value) {
        localStorage.setItem('language', value);
        window.location.reload();
    }

    return (
        <React.Fragment>
            <AppBar
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 50px 0px rgba(0, 0, 0, 0.05)',
                    zIndex: 1,
                    pl: { xs: 0, md: 14 }
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
                                ...(selectedOption === 'General'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('General')}
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
                                ...(selectedOption === 'Online booking'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('Online booking')}
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
                                ...(selectedOption === 'Calendar'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('Calendar')}
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
                                ...(selectedOption === 'Employees'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('Employees')}
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
                                ...(selectedOption === 'Opening hours'
                                    ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                    : {}),
                            }}
                            onClick={() => handleClick('Opening hours')}
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
                                    ...(selectedOption === 'Journal groups'
                                        ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                        : {}),
                                }}
                                onClick={() => handleClick('Journal groups')}
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
                                    ...(selectedOption === 'Advanced journals'
                                        ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 }
                                        : {}),
                                }}
                                onClick={() => handleClick('Advanced journals')}
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
                            }}
                            onClick={() => setLogoutModal(true)}
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

            <Stack sx={{ pt: { xs: 6, md: 4 } }}>
                {selectedOption === 'General' && <GeneralSettingsOption />}

                {selectedOption === 'Online booking' && <OnlineBookingSettingsOption />}

                {selectedOption === 'Calendar' && <CalendarSettingsOption />}

                {selectedOption === 'Employees' && <EmployeeSettingsOption />}

                {selectedOption === 'Opening hours' && <OpeningHours />}

                {selectedOption === 'Journal groups' && <JournalGroupSettingsOption />}

                {selectedOption === 'Advanced journals' && <AdvanceJournalGroupSettingsOption />}

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
            </Stack>
        </React.Fragment>
    );
};

export default SettingsOption;
