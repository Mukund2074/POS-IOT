import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getLocationsApi } from '../utils/Api/Authantication';
import { GetProfileInfoApi } from '../utils/Api/Settings';
import { settings } from './settingsSlice';
import { useDispatch } from 'react-redux';
import { user } from './permissionSlice';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
    const [locations, setLocations] = useState([]);
    const [storeSettings, setStoreSettings] = useState(null);
    const dispatch = useDispatch();

    const getLocations = useCallback(async () => {
        try {
            const resp = await getLocationsApi();
            setLocations(resp?.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    }, []);

    const updateOutletSettings = useCallback(async () => {
        try {
            const res = await GetProfileInfoApi();
            const {
                schedules,
                holidays,
                employees,
                is_individual_opening_hour,
                employees_opening_hour,
                mac_addresses,
            } = res.data.data;

            const onlineBookingSetting = res.data.data?.settings?.find(
                (setting) => setting.settingCategory === 'outlet' && setting.settingName === 'OnlineBooking',
            );
            const parsedOnlineBookingSetting = onlineBookingSetting ? JSON.parse(onlineBookingSetting?.value) : null;

            let profileData = { ...res.data.data };
            // delete profileData?.settings;
            delete profileData?.schedules;
            delete profileData?.holidays;
            delete profileData?.employees;
            delete profileData?.employees_opening_hour;
            delete profileData?.is_individual_opening_hour;

            const posSetting = profileData?.settings?.find(
                (setting) =>
                    setting.settingCategory === 'pos_settings' && setting.settingName === 'pos_general_settings',
            );

            const setting = {
                OnlineBooking: parsedOnlineBookingSetting,
                schedule: schedules,
                outlet_holidays: holidays,
                profile: profileData,
                is_individual_opening_hour,
                employees_opening_hour: employees_opening_hour,
                employees,
                macAddress: mac_addresses,
            };

            if (posSetting && Object.keys(posSetting)?.length > 0) {
                setting.posSetting = { ...posSetting, value: JSON.parse(posSetting?.value) };
            }

            // Dispatch settings to Redux store
            dispatch(settings(setting));

            // Force a small delay to ensure Redux state is updated
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Update localStorage with the latest settings for immediate access
            const currentSettings = JSON.parse(localStorage.getItem('persist:settings') || '{}');
            const existingData = JSON.parse(currentSettings.data || '{}');
            const updatedSettings = {
                ...currentSettings,
                data: JSON.stringify({ ...existingData, ...setting }),
            };
            localStorage.setItem('persist:settings', JSON.stringify(updatedSettings));

            const employee = localStorage.getItem('employee_id');
            employees.find((emp) => {
                if (emp.id === Number(employee)) {
                    const posSettings = res?.data?.data?.settings?.find(
                        (setting) =>
                            setting.settingCategory === 'pos_settings' &&
                            setting.settingName === 'pos_general_settings',
                    );
                    const parsedPosSettings = posSettings ? JSON.parse(posSettings?.value) : null;
                    const employeePOSPermissions = parsedPosSettings?.employeePermissions?.[emp?.id] || null;
                    dispatch(user({ ...emp, pos_settings: employeePOSPermissions }));
                    return true;
                }
                return false;
            });

            setStoreSettings(res.data.data);
        } catch (error) {
            console.error('error', error);
        }
    }, [dispatch]);

    const refreshSettings = useCallback(async () => {
        try {
            // Ensure we have auth token before making API calls
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                console.warn('No auth token found, skipping refreshSettings');
                return;
            }

            await updateOutletSettings();
            await getLocations();
        } catch (error) {
            console.error('Error in refreshSettings:', error);
        }
    }, [updateOutletSettings, getLocations]);

    useEffect(() => {
        updateOutletSettings();
        getLocations();
    }, [updateOutletSettings, getLocations]);

    return (
        <DataContext.Provider value={{ locations, storeSettings, refreshSettings }}>{children}</DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
