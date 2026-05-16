import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
// import Sidebar from './scenes/global/Sidebar';
import { CircularProgress, CssBaseline, Drawer, Stack, ThemeProvider, Typography, useMediaQuery } from '@mui/material';
import { ColorModeContext, useMode } from './theme';
import { useDispatch } from 'react-redux';
import { user } from './context/permissionSlice';
import { settings } from './context/settingsSlice';
import moment from 'moment';
import { HttpStatusCode } from 'axios';
import { t } from 'i18next';
import { GetProfileInfoApi } from './utils/Api/Settings';
import { useSocket } from './context/SocketContext';
import { useData } from './context/DataContext';
import RadixToastProvider from './components/radix/RadixToastProvider';
import { CustomerProvider } from './context/customer/CustomerContext';
import Sidebar from './components/Sidebar';
import SidebarIcon from '@/assets/Marketing/SidebarIcon.svg';
import { LayoutContext } from './context/LayoutContext';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';

function App() {
    const [theme, colorMode] = useMode();
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [redirctLoading, setRedirctLoading] = useState(false);
    const auth2 = localStorage.getItem('auth_token');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showMenuIcon, setShowMenuIcon] = useState(false);
    const { storeSettings, refreshSettings } = useData();

    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const sidebarRef = useRef(null);
    const { socketIsOn: socket } = useSocket();
    const [isCollapse, setCollapse] = useState(false);
    const setting = useSelector((state) => state?.settings?.data);
    const isWebView = setting?.from_app;

    useEffect(() => {
        setCollapse(true);
    }, [isMobile]);

    async function getdata() {
        try {
            setRedirctLoading(true);
            const params = new URLSearchParams(window.location.search);
            const auth_token = params.get('aid');
            const employee_role = params.get('er');
            const employee_id = params.get('eid');
            const isAppFromURL = params.get('from_app') === 'true';
            const isDoctor = employee_role === 'DOCTOR';

            // Check if current path is a public booking route
            const isPublicBookingRoute = location.pathname.startsWith('/booking/');

            if (auth_token) {
                localStorage.setItem('auth_token', auth_token);
                localStorage.setItem('employee_role', employee_role);
                localStorage.setItem('employee_id', employee_id);
                localStorage.setItem('image_url', process.env.REACT_APP_IMG_URL);
                // Defer API call to next tick so the request interceptor reads the token from localStorage
                await new Promise((resolve) => setTimeout(resolve, 0));
                const response = await GetProfileInfoApi();
                if (response.status === HttpStatusCode.Ok) {
                    const employess = response?.data?.data?.employees;
                    const posSettings = response?.data?.data?.settings?.find(
                        (setting) =>
                            setting.settingCategory === 'pos_settings' &&
                            setting.settingName === 'pos_general_settings',
                    );
                    const parsedPosSettings = posSettings ? JSON.parse(posSettings?.value) : null;
                    const employeePOSPermissions = parsedPosSettings?.employeePermissions?.[employee_id] || null;
                    localStorage.setItem('employees', JSON.stringify(employess));
                    const selectedEmp = employess && employess.find((emp) => emp.id == employee_id);
                    dispatch(user({ ...selectedEmp, pos_settings: employeePOSPermissions }));
                    dispatch(settings({ from_dashboard: true, from_app: isAppFromURL, isDoctor }));
                    refreshSettings();

                    if (isAppFromURL) {
                        navigate('pos/cashdrawer');
                    }

                    if (isDoctor) {
                        navigate('/customers', { replace: true });
                    }
                }
                // navigate("/calendar")
            } else if (!auth_token && !auth2 && !isPublicBookingRoute) {
                navigate('/');
            }
        } catch (error) {
            // Don't redirect to login if on public booking route
            if (!location.pathname.startsWith('/booking/')) {
                navigate('/');
            }
        } finally {
            setRedirctLoading(false);
        }
    }

    useEffect(() => {
        getdata();
        const metaTag = document.querySelector('meta[name=viewport]');
        if (!metaTag) return;

        const isIOSRequestingDesktopSite = /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

        if (isIOSRequestingDesktopSite) {
            // ✅ Only if iOS is pretending to be desktop
            metaTag.setAttribute('content', 'user-scalable=no');
        } else {
            metaTag.setAttribute(
                'content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
            );
        }
    }, []);

    moment.locale('da');
    moment.updateLocale('da', { week: { dow: 1 } });

    useEffect(() => {
        if (!socket) return;

        socket.on('outlet_setting_updated', refreshSettings);
        socket.on('outlet_setting_updated_web_admin', refreshSettings);

        return () => {
            socket.off('outlet_setting_updated', refreshSettings);
            socket.off('outlet_setting_updated_web_admin', refreshSettings);
        };
    }, [socket]);

    useEffect(() => {
        if (location?.pathname.startsWith('/settings') || location?.pathname === '/calendar') {
            // Add a small delay to ensure Redux store is hydrated
            setTimeout(() => {
                refreshSettings();
            }, 100);
        }
    }, [location?.pathname]);

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [isMobile]);

    useEffect(() => {
        let timer;

        if (isMobile && !isSidebarOpen) {
            timer = setTimeout(() => {
                setShowMenuIcon(true);
            }, 300); // delay in ms
        } else {
            setShowMenuIcon(false);
        }

        return () => clearTimeout(timer);
    }, [isMobile, isSidebarOpen]);

    if (redirctLoading)
        return (
            <Stack
                sx={{
                    position: 'absolute',
                    zIndex: 110,
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                }}
            >
                <CircularProgress size="2.5rem" sx={{ color: '#6f6f6f' }} />
                <Typography variant="body1" sx={{ color: '#6f6f6f', mt: 2 }}>
                    {t('Common.Redirecting')}...
                </Typography>
            </Stack>
        );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <RadixToastProvider>
                <ToastContainer />
                <ThemeProvider theme={theme}>
                    <CustomerProvider>
                        <CssBaseline />

                        {showMenuIcon && !isWebView && (
                            <img
                                src={SidebarIcon}
                                alt="sidebar_icn"
                                className={`${location?.pathname === '/' ? 'hidden' : 'fixed'} p-2 mt-1 cursor-pointer !bg-transparent border-[1px] border-solid border-border-default rounded-full`}
                                onClick={() => {
                                    setCollapse(true);
                                    setIsSidebarOpen(true);
                                }}
                                style={{ zIndex: 999 }}
                            />
                        )}

                        <div className="app bg-white">
                            <div className="app-layout">
                                {/* DESKTOP SIDEBAR */}
                                {!isMobile &&
                                    location.pathname !== '/' &&
                                    !location.pathname.startsWith('/booking/') &&
                                    !isWebView && (
                                        <div className="sidebar-wrapper" style={{ width: isCollapse ? 60 : 170 }}>
                                            <Sidebar
                                                ref={sidebarRef}
                                                storeSettings={storeSettings}
                                                isCollapse={isCollapse}
                                                setCollapse={setCollapse}
                                                isMobile={isMobile}
                                            />
                                        </div>
                                    )}

                                {/* CONTENT */}
                                <LayoutContext.Provider value={{ isCollapse, isMobile }}>
                                    <div className="content-wrapper">
                                        <Outlet />
                                    </div>
                                </LayoutContext.Provider>
                            </div>

                            {/* MOBILE DRAWER (UNCHANGED) */}
                            {isMobile && !isWebView && (
                                <Drawer
                                    open={isSidebarOpen}
                                    onClose={() => {
                                        setIsSidebarOpen(false);
                                        setCollapse(false);
                                    }}
                                >
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <Sidebar
                                            storeSettings={storeSettings}
                                            isCollapse={isCollapse}
                                            setCollapse={setCollapse}
                                            isMobile={isMobile}
                                            onClose={() => setIsSidebarOpen(false)}
                                        />
                                    </div>
                                </Drawer>
                            )}
                        </div>
                    </CustomerProvider>
                </ThemeProvider>
            </RadixToastProvider>
        </ColorModeContext.Provider>
    );
}

export default App;
