import React, { useState, useEffect } from 'react';
import { HttpStatusCode } from 'axios';
import { Stack } from '@mui/material';
import backButton from '../../assets/less.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';

import { useDispatch } from 'react-redux';
import { user } from '../../context/permissionSlice';
import logo from '../../assets/logo.png';
import { useQueryClient } from '@tanstack/react-query';
import { clearCacheBeforeLogin } from '../../utils/queryCacheUtils';
import VerificationCode from './Otpfprm';
import ConfirmPass from './confirmPass';
import FinalresetpassbookingModel from './FinalresetpassbookingModel';
import ResNumberInForm from './ResNumberInForm';
import { settings } from '../../context/settingsSlice';
import { authEmployeeApi, authLogin, requestOTPApi } from '../../utils/Api/Authantication';
import LoginForm from '../../components/Login/LoginForm';
import Departments from '../../components/Login/Departments';
import SelectEmployee from '../../components/Login/SelectEmployee';
import EmployeePasscode from '../../components/Login/EmployeePasscode';
import { useData } from '../../context/DataContext';

const LoginFlow = () => {
    const [step, setStep] = useState(1);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [passcode, setPasscode] = useState(['', '', '', '', '', '']);
    const dispatch = useDispatch();
    const [Index, setIndex] = useState(0);
    const [resetPassToken, setResPassToken] = useState('');
    const [locations, setLocations] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [imageUrl, setImageUrl] = useState([]);
    const auth_token = localStorage.getItem('auth_token');

    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [countryISOCode, setCountryISOCode] = useState('IN');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const { refreshSettings } = useData();
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isAppFromURL = params.get('from_app');
        if (auth_token && !isAppFromURL) {
            navigate('/calendar', { replace: true }); // Prevents adding duplicate history entries
            // Ensure Redux store is hydrated before calling refreshSettings
            setTimeout(() => {
                refreshSettings();
            }, 1500);
        } else {
            localStorage.setItem('language', 'en');
        }
    }, [auth_token, navigate, refreshSettings]);

    const OTPSending = async ({ setter, phoneNumber }) => {
        try {
            setter(true);
            const response = await requestOTPApi({
                payload: { phone_number: phoneNumber, country_code: countryCode },
            });
            if (response.status === HttpStatusCode.Ok) {
                toast.success('OTP sent successfully');
                return true;
            }
            return false;
        } catch (error) {
            toast.error(error.response?.data.detail || 'Something went wrong');
            return false;
        }
    };

    async function aftersuccessfulReset() {
        setResStep(0);
        setPhone('');
        setCountryCode('+91');
        setCountryISOCode('IN');
        setStep(1);
        // Clear all cached data after successful password reset
        await clearCacheBeforeLogin(queryClient);
    }

    const handleLogin = async () => {
        try {
            const payload = {
                country_code: countryCode,
                phone_number: phone.replace(/\s/g, ''),
                password: password,
            };
            Sentry.logger.info('Payload for login', payload);
            const { data } = await authLogin({ payload });

            const locationData = data.map((location) => ({
                name: location.profile.name,
                email: location.profile.email,
                image: location.profile.profile_image
                    ? `${location.image_base_url}${location.profile.profile_image}`
                    : '/default-profile.jpg',
                image_base_url: location.image_base_url,
                employees: location.profile.employees.map((employee) => ({
                    ...employee,
                    image: employee.image ? `${process.env.REACT_APP_IMG_URL}${employee.image}` : null,
                })),
                schedules: location.profile.schedules.map((schedule) => ({
                    ...schedule,
                })),
                is_active: location.is_active,
            }));

            setLocations(locationData);
            setLoginData(data);
        } catch (error) {
            Sentry.logger.info('Error from handleLogin', error);
            console.log('error When trying to login', error);
            toast.error('Login failed. Please try again.');
        }
    };

    useEffect(() => {
        if (locations.length === 1) {
            handleSelectLocation(0);
        } else if (locations.length > 1) {
            setStep(2);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locations]);

    const handleSelectLocation = (index) => {
        if (!locations[index].is_active) {
            toast.error('This store is inactive');
            return;
        }

        if (locations.length === 1) {
            index = 0;
            setStep(3);
        }
        setSelectedLocation(index);
        setEmployees(locations[index].employees);
        setImageUrl(locations[index].image_base_url);
        setIndex(index);
    };

    const handleSelectEmployee = async (index) => {
        setSelectedEmployee(index);
    };

    const handleNext = async () => {
        const employee = employees[selectedEmployee];

        const combinedPasscode = passcode.join('');

        if (step === 2 && selectedLocation !== null) {
            setStep(3);
        } else if (step === 3 && selectedEmployee !== null) {
            const isBypass = loginData[selectedLocation]?.by_pass_access_code;
            if (isBypass) {
                await handleFinalLogin({
                    employee: employees[selectedEmployee],
                    combinedPasscode: undefined,
                    selectedLocationToken: loginData[Index].access_token,
                });
                return;
            }
            setStep(4);
        } else if (step === 4 && combinedPasscode.length === 6) {
            // Getting selected employee data
            setIsLoading(true);

            if (!employee) {
                toast.error('Please select an employee.'); // Alert if no employee is selected
                return;
            }

            const selectedLocationToken = loginData[Index].access_token;

            await handleFinalLogin({
                employee,
                combinedPasscode,
                selectedLocationToken,
            });
        }
    };

    const handleFinalLogin = async ({ employee, combinedPasscode, selectedLocationToken }) => {
        try {
            const res = await authEmployeeApi({
                token: selectedLocationToken,
                employee_id: employee.id,
                access_code: combinedPasscode,
            });

            if (res.status === HttpStatusCode.Ok || res.status === HttpStatusCode.Created) {
                // toast.success('Access Granted!'); // Success notification

                localStorage.setItem('auth_token', res?.data?.data?.access_token);

                const posSettings = res?.data?.data?.settings?.find(
                    (setting) =>
                        setting.settingCategory === 'pos_settings' && setting.settingName === 'pos_general_settings',
                );
                const parsedPosSettings = posSettings ? JSON.parse(posSettings?.value) : null;
                const employeePOSPermissions = parsedPosSettings?.employeePermissions?.[employee?.id] || null;
                let userWithPermissions = { ...employee, pos_settings: employeePOSPermissions };
                // delete userWithPermissions.employee_setting

                dispatch(user(userWithPermissions));
                dispatch(settings({ from_dashboard: false }));

                localStorage.setItem('employee_role', employee.role); // Store selected employee ID
                localStorage.setItem('employee_id', employee.id); // Store selected employee ID
                localStorage.setItem('employees', JSON.stringify(employees)); // Store the full employees list
                localStorage.setItem('image_url', imageUrl);

                // Clear any existing cache before navigating to new store
                await clearCacheBeforeLogin(queryClient);

                navigate('/calendar', { replace: true }); // Redirect to calendar page

                // Ensure Redux store is hydrated before calling refreshSettings
                setTimeout(() => {
                    refreshSettings();
                }, 1500);
            }
        } catch (error) {
            console.log('error', error);
            toast.error('Invalid passcode.'); // Error notification if access code is incorrect
        } finally {
            setIsLoading(false);
        }
    };

    const [resStep, setResStep] = useState(0);
    const handleResetPass = () => {
        if (resStep === 0) {
            setStep(0);
            setResStep(1);
        }

        if (resStep === 1) {
            setResStep(2);
        }

        if (resStep === 2) {
            setResStep(3);
        }

        if (resStep === 3) {
            setResStep(4);
        }
    };

    const handleResBack = () => {
        setResStep((prev) => prev - 1);

        if (resStep <= 1 && resStep !== 0) {
            setStep(1);
        }
    };

    const handlePasscodeChange = (e, index) => {
        const newPasscode = [...passcode];
        newPasscode[index] = e.target.value.slice(-1);
        setPasscode(newPasscode);

        if (e.target.value && index < passcode.length - 1) {
            document.getElementById(`passcode-${index + 1}`).focus();
        }
    };

    const handleBackspace = (e, index) => {
        if (e.key === 'Backspace' && !passcode[index] && index > 0) {
            document.getElementById(`passcode-${index - 1}`).focus();
        }
    };

    return (
        <Stack
            sx={{
                height: '100vh',
                width: '100%',
                overflow: 'hidden',
                p: { xs: 2, md: 10 },
                backgroundColor: '#f5f5f5',
            }}
        >
            <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                {step === 1 && (
                    <LoginForm
                        handleLogin={handleLogin}
                        phone={phone}
                        countryCode={countryCode}
                        countryISOCode={countryISOCode}
                        password={password}
                        setPassword={setPassword}
                        handlePhoneChange={(value) => {
                            setPhone(value?.phone ?? '');
                            setPhoneNumber(value?.phone ?? '');
                            setCountryCode(value?.country_code ?? '+91');
                            setCountryISOCode(value?.countryISOCode ?? 'IN');
                        }}
                        handleResetPass={handleResetPass}
                    />
                )}
                {step === 2 && (
                    <Departments
                        locations={locations}
                        selectedLocation={selectedLocation}
                        handleSelectLocation={handleSelectLocation}
                        handleNext={handleNext}
                    />
                )}
                {step === 3 && (
                    <SelectEmployee
                        employees={employees}
                        selectedEmployee={selectedEmployee}
                        handleSelectEmployee={handleSelectEmployee}
                        handleNext={handleNext}
                    />
                )}
                {step === 4 && (
                    <EmployeePasscode
                        isLoading={isLoading}
                        selectedEmployee={selectedEmployee}
                        employees={employees}
                        passcode={passcode}
                        handlePasscodeChange={handlePasscodeChange}
                        handleBackspace={handleBackspace}
                        handleNext={handleNext}
                    />
                )}

                {resStep === 1 && step === 0 && (
                    <ResNumberInForm
                        OTPSending={OTPSending}
                        phone={phone}
                        countryCode={countryCode}
                        countryISOCode={countryISOCode}
                        onPhoneChange={(value) => {
                            setCountryCode(value?.country_code ?? '+91');
                            setCountryISOCode(value?.countryISOCode ?? 'IN');
                        }}
                        handleResetPass={handleResetPass}
                        setPhoneNumber={setPhoneNumber}
                        backButton={backButton}
                        handleResBack={handleResBack}
                    />
                )}
                {resStep === 2 && step === 0 && (
                    <VerificationCode
                        OTPSending={OTPSending}
                        phoneNumber={phoneNumber}
                        country_code={countryCode}
                        handleResBack={handleResBack}
                        handleResetPass={handleResetPass}
                        setResPassToken={setResPassToken}
                    />
                )}

                {resStep === 3 && step === 0 && (
                    <ConfirmPass
                        backButton={backButton}
                        handleResBack={handleResBack}
                        handleResetPass={handleResetPass}
                        token={resetPassToken}
                    />
                )}

                {resStep === 4 && step === 0 && (
                    <FinalresetpassbookingModel
                        handleResBack={handleResBack}
                        backButton={backButton}
                        onSubmit={aftersuccessfulReset}
                    />
                )}
            </Stack>
        </Stack>
    );
};

export default LoginFlow;
