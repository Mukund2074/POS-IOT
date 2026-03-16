import { forwardRef, useMemo } from 'react';
import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Box, Stack } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import 'react-pro-sidebar/dist/css/styles.css';

import calener from '../../assets/calendar.png';
import settingsIcon from '../../assets/Settings.svg';
import employeeImg from '../../assets/Employees.png';
import Specialoffer from '../../assets/Specialoffer.svg';
import insights from '../../assets/Insights.svg';
import PreviousBooking from '../../assets/PreviousBooking.svg';
import Settingssettings from '../../assets/Settingssettings.svg';
import POS from '../../assets/POS.svg';
import logo from '../../assets/fiind-white-logo.png';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import BarChartIcon from '@mui/icons-material/BarChart';
import { StyleOutlined } from '@mui/icons-material';
import MarketingIcon from '../../assets/Marketing/MarketingLogo.svg';

import './sidebar.css';
import { useDispatch } from 'react-redux';
import { route } from '../../context/routeSlice';

const Sidebar = forwardRef(({ onClose, storeSettings }, ref) => {
    // ---- Sidebar Config ----
    const sidebarItems = [
        { key: 'calendar', path: '/calendar', icon: calener },
        { key: 'history', path: '/history', icon: PreviousBooking },
        { key: 'customers', path: '/customers', icon: employeeImg },
        { key: 'services', path: '/services', icon: settingsIcon },
        { key: 'specialoffers', path: '/specialoffers', icon: Specialoffer },
        { key: 'insights', path: '/insights', icon: insights },

        {
            key: 'statistics',
            path: '/statistics',
            icon: (
                <BarChartIcon
                    sx={{ backgroundColor: 'transparent', color: '#847A71', borderRadius: 1, padding: 0.5 }}
                    fontSize="large"
                />
            ),
        },
        {
            key: 'marketing',
            path: '/marketing',
            icon: <img src={MarketingIcon} alt="Marketing" style={{ width: 30, height: 30 }} />,
        },
    ];

    const addonsItems = [
        { key: 'pos', path: '/pos', icon: POS },
        {
            key: 'gift-card',
            path: '/gift-card',
            icon: (
                <CardGiftcardIcon
                    sx={{ backgroundColor: 'transparent', color: '#847A71', borderRadius: 1, padding: 0.5 }}
                    fontSize="large"
                />
            ),
        },
        {
            key: 'punch-card',
            path: '/punch-card',
            icon: (
                <StyleOutlined
                    sx={{ backgroundColor: 'transparent', color: '#847A71', borderRadius: 1, padding: 0.5 }}
                    fontSize="large"
                />
            ),
        },
    ];

    // settings as separate (always bottom)
    const settingsItem = {
        key: 'settings',
        path: '/settings',
        icon: Settingssettings,
    };

    const location = useLocation();
    const dispatch = useDispatch();

    const Item = ({ item }) => {
        const isActive = location.pathname.startsWith(item.path);

        return (
            <MenuItem
                onClick={() => {
                    dispatch(route(item.key));
                    onClose?.();
                }}
                icon={
                    <div
                        style={{
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: isActive ? '#D9D9D9' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'aliceblue',
                        }}
                    >
                        {typeof item.icon === 'string' ? (
                            <img src={item.icon} alt={item.key} style={{ width: 30, height: 30 }} />
                        ) : (
                            item.icon
                        )}
                    </div>
                }
                style={{
                    marginTop: '-5px',
                    paddingLeft: '20px',
                }}
            >
                <Link to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ display: 'none' }}>{item.key}</span>
                </Link>
            </MenuItem>
        );
    };

    const filteredSidebarItems = useMemo(() => {
        const items = [...sidebarItems]; // Create a copy to avoid mutation

        if (storeSettings?.outlet_addons?.length > 0) {
            // Check if POS is enabled first
            const hasPOS = storeSettings.outlet_addons.some((addon) => addon.addon_name === 'POS');

            if (hasPOS) {
                // Only add addon items if POS is enabled
                storeSettings.outlet_addons.forEach((addon) => {
                    switch (addon.addon_name) {
                        case 'POS':
                            items.push(addonsItems.find((item) => item.key === 'pos'));
                            break;
                        case 'GiftCard':
                            items.push(addonsItems.find((item) => item.key === 'gift-card'));
                            break;
                        case 'PunchCard':
                            items.push(addonsItems.find((item) => item.key === 'punch-card'));
                            break;
                        default:
                            break;
                    }
                });
            }
        }

        return items.filter(Boolean); // Remove any undefined items
    }, [storeSettings]);

    return (
        <Box ref={ref} className="sidebar" sx={{ maxWidth: 80, position: 'relative', top: 0, zIndex: 1000 }}>
            <ProSidebar collapsed collapsedWidth="100%" style={{ paddingTop: 0, paddingBottom: 0, zIndex: 0 }}>
                <Menu iconShape="square" style={{ paddingTop: 0, paddingBottom: 0, overflowX: 'hidden' }}>
                    <Stack
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100dvh',
                        }}
                    >
                        <Stack
                            flex={1}
                            flexDirection="column"
                            justifyContent="flex-start"
                            alignItems="center"
                            sx={{ marginTop: 4 }}
                        >
                            {/* Logo at the top */}
                            <MenuItem
                                className="mt-2 mb-5"
                                icon={<img src={logo} alt="Logo" className="logo-img" height={45} width={45} />}
                            />
                            {/* Dynamic Items */}
                            <Box p={0}>
                                {filteredSidebarItems.map((item) => (
                                    <Item key={item.key} item={item} />
                                ))}
                            </Box>
                        </Stack>

                        {/* Settings always at bottom */}
                        <Stack>
                            <Item item={settingsItem} />
                        </Stack>
                    </Stack>
                </Menu>
            </ProSidebar>
        </Box>
    );
});

export default Sidebar;
