import { forwardRef, useMemo, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Accordion from '@radix-ui/react-accordion';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RiArrowDownSLine, RiDoorOpenLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import packageJson from '../../package.json';
import { Divider } from '@mui/material';

// @ts-ignore
import { route } from '../context/routeSlice';
import '../scenes/global/sidebar.css';

import { useQueryClient } from '@tanstack/react-query';

// @ts-ignore
import logo from '@/assets/fiind-orange-logo.png';
import SidebarIcon from '@/assets/Marketing/SidebarIcon.svg';
import CustomersIcon from '@/assets/Marketing/CustomersIcon.svg';
import POSIcon from '@/assets/Marketing/POSIcon.svg';
import PunchCardIcon from '@/assets/Marketing/PunchCardIcon.svg';
import GiftCardIcon from '@/assets/Marketing/GiftCardIcon.svg';
import SettingsIcon from '@/assets/Marketing/SettingsIcon.svg';
import ServicesIcon from '@/assets/Marketing/Services.svg';
// import DoctorBagIcon from '@/assets/Marketing/DoctorBagIcon.svg';

import BahlouLogoFull from '@/assets/Bahlou_logo.png';
import { cnMerge } from '@/utils/cnMerge';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
// @ts-ignore
import { authEmployeeApi } from '@/utils/Api/Authantication';
// @ts-ignore
import { performCompleteLogout } from '@/utils/queryCacheUtils';
// @ts-ignore
import { user as setUser } from '../context/permissionSlice';
// @ts-ignore
import { useData } from '../context/DataContext';

// @ts-ignore
import { PERMISSION_MAP } from '@/utils/permissionMap.ts';

interface SubMenuItem {
    key: string;
    path: string;
    icon?: string;
    title?: string;
    sequence: number;
}

interface SideBarTypes {
    id: number;
    key: string;
    path: string;
    icon: string;
    title: string;
    subMenu?: SubMenuItem[];
    sequence: number;
}

const Sidebar = forwardRef<HTMLDivElement, any>((props, ref) => {
    const { storeSettings, isCollapse, setCollapse, isMobile, onClose }: any = props;
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const justifyClass = isMobile ? 'justify-start' : isCollapse ? 'justify-center' : 'justify-between';
    const [triggerSwitchUser, setTriggerSwitchUser] = useState(false);
    const [selectedPopUpEmployee, setSelectedPopUpEmployee] = useState<any>(null);
    const [popupOtpModel, setPopupOTPModal] = useState(false);
    const [passcode, setPasscode] = useState(['', '', '', '', '', '']);
    const user = useSelector((state: any) => state.user.data);
    const setting = useSelector((state: any) => state.settings.data);
    const { locations, refreshSettings } = useData();
    const queryClient = useQueryClient();

    /** Use both permission and settings so we only hide items user actually lacks (not when key is under .settings) */
    const permission = user?.permission ?? user?.settings ?? {};

    const sidebarItems: SideBarTypes[] = [
        {
            id: 3,
            key: 'customers',
            path: '/customers',
            icon: CustomersIcon,
            title: 'Customers',
            sequence: 3,
        },
        {
            id: 4,
            key: 'employees',
            path: '/employees',
            icon: SettingsIcon,
            title: 'Employees',
            sequence: 4,
        },
    ];

    const addonsItems = [
        { id: 9, key: 'pos', path: '/pos', icon: POSIcon, title: 'POS', sequence: 9 },
        { id: 10, key: 'gift-card', path: '/gift-card', icon: GiftCardIcon, title: 'Gift card', sequence: 10 },
        { id: 11, key: 'punch-card', path: '/punch-card', icon: PunchCardIcon, title: 'Punch card', sequence: 11 },
    ];

    const settingsItem: SideBarTypes = {
        id: 12,
        key: 'settings',
        path: '/settings',
        icon: SettingsIcon,
        title: 'Settings',
        // subMenu: [{ key: 'settings', path: '/settings', title: 'Settings 1' }],
        sequence: 12,
    };

    // Server-side OTP/auth flow (keeps parity with other parts of the app).
    const handleFinalLogin = async ({ combinedPasscode, selectedLocationToken }: any) => {
        try {
            await performCompleteLogout(queryClient, navigate, false);
            const res = await authEmployeeApi({
                token: selectedLocationToken,
                employee_id: selectedPopUpEmployee?.id?.toString(),
                access_code: combinedPasscode,
            });
            if (res) {
                const { access_token } = res.data.data;
                localStorage.setItem('auth_token', access_token);
                localStorage.setItem('employee_id', selectedPopUpEmployee?.id);
                localStorage.setItem('employee_role', selectedPopUpEmployee?.role);
                localStorage.setItem(
                    'employees',
                    JSON.stringify(setting?.employees.filter((emp: any) => emp.id !== user?.id)),
                );

                // for update in the global store setting
                try {
                    dispatch(
                        setUser({
                            ...selectedPopUpEmployee,
                            settings: selectedPopUpEmployee?.settings,
                        }),
                    );
                } catch (error) {
                    console.error('Error : ', error);
                }
                setPopupOTPModal(false);
                toast.success(t('Setting.CurrentUserSwitchSuccess'));
                setTimeout(() => {
                    resetStates();
                    window.location.reload();
                }, 800);
            }
        } catch (error) {
            toast.error(t('Calendar.ToastErrPasscode'));
            setPasscode(['', '', '', '', '', '']);
        }
    };

    const resetStates = (e?: any, reason?: any) => {
        if (reason === 'backdropClick') {
            return;
        }
        setTriggerSwitchUser(false);
        setSelectedPopUpEmployee(null);
        setPopupOTPModal(false);
        setPasscode(['', '', '', '', '', '']);
    };

    const handlePasscodeChange = (e: any, index: number) => {
        const newPasscode = [...passcode];
        newPasscode[index] = e.target.value.slice(-1);
        setPasscode(newPasscode);

        if (e.target.value && index < passcode.length - 1) {
            document.getElementById(`passcode-${index + 1}`)?.focus();
        }
    };

    const handleFinalSavePopuUs = async () => {
        const combinedPasscode = passcode.join('');

        if (combinedPasscode.length !== 6) {
            toast.error(t('Calendar.ToastErrPasscode'));
            setPasscode(['', '', '', '', '', '']);
            return;
        }

        if (!selectedPopUpEmployee) {
            toast.error(t('Calendar.ToastErrEmpSelect'));
            return;
        }

        await handleFinalLogin({
            combinedPasscode,
            selectedLocationToken: locations?.find((location: any) => location?.profile?.id === setting?.profile?.id)
                ?.access_token,
        });
    };

    const filteredSidebarItems = useMemo(() => {
        const isAdmin = user?.role === 'ADMIN';
        const items: SideBarTypes[] = isAdmin
            ? [...sidebarItems].sort((a, b) => a.sequence - b.sequence)
            : sidebarItems
                  .filter(
                      (item) =>
                          item.key === 'calendar' ||
                          item.key === 'customers' ||
                          item.key === 'employees' ||
                          permission[PERMISSION_MAP[item.key as keyof typeof PERMISSION_MAP]],
                  )
                  .sort((a, b) => a.sequence - b.sequence);

        // POS/GiftCard/PunchCard: show for admins or users with view_pos permission, independent of storeSettings addons.
        if (isAdmin || permission[PERMISSION_MAP['pos']]) {
            ['pos', 'gift-card', 'punch-card'].forEach((key) => {
                const existing = items.some((i) => i.key === key);
                if (!existing) {
                    const addonItem = addonsItems.find((i) => i.key === key);
                    if (addonItem) items.push(addonItem);
                }
            });
        } else if (storeSettings?.outlet_addons?.length > 0) {
            const hasPOS = storeSettings.outlet_addons.some((addon: any) => addon.addon_id === 4);

            if (hasPOS && (isAdmin || permission[PERMISSION_MAP['pos']])) {
                storeSettings.outlet_addons.forEach((addon: any) => {
                    switch (addon.addon_id) {
                        case 4:
                            items.push(addonsItems.find((i) => i.key === 'pos')!);
                            break;
                        case 5:
                            items.push(addonsItems.find((i) => i.key === 'gift-card')!);
                            break;
                        case 6:
                            items.push(addonsItems.find((i) => i.key === 'punch-card')!);
                            break;
                    }
                });
            }

            const showMarketing =
                storeSettings?.outlet_addons?.some((addon: any) => addon.addon_id === 12) &&
                (isAdmin || permission[PERMISSION_MAP['marketing']]);
            if (showMarketing) {
                items.push(addonsItems.find((i) => i.key === 'marketing')!);
            }
        }

        // ✅ SORT BY ID
        return items.filter(Boolean).sort((a, b) => a.sequence - b.sequence);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeSettings, permission, user?.role]);

    return (
        <div
            ref={ref}
            className={`h-full relative pt-4 overflow-y-scroll scrollbar-hidden ${!isMobile && 'no-scrollbar'} scrollbar-none bg-background-subtle shadow z-[15] fixed ${isCollapse && isMobile && 'w-[170px]'} ${!isMobile && isCollapse ? 'w-[60px]' : 'w-[170px]'}`}
        >
            <div className="flex flex-col h-full">
                <div>
                    {/* Header */}
                    <div
                        className={`flex absolute items-center top-4 right-0  ${isCollapse ? 'justify-center items-center left-0' : 'justify-between  -left-3'} px-4 mb-4`}
                    >
                        <img
                            src={isCollapse && !isMobile ? logo : BahlouLogoFull}
                            alt="logo_icon"
                            className={cnMerge(isCollapse && !isMobile ? 'h-6 hidden' : 'h-8')}
                        />
                        <img
                            src={SidebarIcon}
                            alt="sidebar_icon"
                            className={`cursor-pointer h-5 w-5 transition-transform ease-in-out duration-500 ${isMobile || isMobile === undefined ? 'hidden' : 'block'} `}
                            onClick={() => !isMobile && setCollapse(!isCollapse)}
                        />
                    </div>

                    <NavigationMenu.Root className="h-full mt-12">
                        <Accordion.Root type="multiple" className="px-2 space-y-2">
                            {filteredSidebarItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.path);

                                // 🔹 Simple item (no sub-menu)
                                if (!item?.subMenu) {
                                    return (
                                        <Link
                                            key={item?.key}
                                            to={item?.path}
                                            onClick={() => {
                                                dispatch(route(item?.key));

                                                if (isMobile) {
                                                    onClose?.();
                                                    setCollapse(false);
                                                }
                                            }}
                                            className={`flex items-center gap-3 px-3 py-2 no-underline text-text-secondary ${
                                                isActive ? 'icon-active' : ''
                                            } ${isMobile ? 'justify-start' : isCollapse && 'justify-center'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={item?.icon} alt="menu_icons" className="h-6 w-6" />
                                                <span
                                                    className={`text-sm font-medium text-text-secondary mb-0 ${isMobile ? (isCollapse ? 'block' : 'hidden') : isCollapse ? 'hidden' : 'block'}`}
                                                >
                                                    {item.title}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                }

                                // 🔹 Accordion item (which have sub menu)
                                return (
                                    <Accordion.Item key={item.key} value={item.key}>
                                        <Accordion.Header className="mb-0">
                                            <Accordion.Trigger
                                                onClick={(e) => {
                                                    if (!isMobile && isCollapse) {
                                                        e.preventDefault();
                                                        navigate(item.path);
                                                    }
                                                }}
                                                className={`flex items-center gap-3 w-full ${justifyClass} px-3 py-2 border-none bg-transparent cursor-pointer ${
                                                    isActive ? 'text-primary-500' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img src={item.icon} className="h-7" alt="menu_icon" />

                                                    <span
                                                        className={`text-lg font-medium text-text-secondary mb-0 ${isMobile ? (isCollapse ? 'block' : 'hidden') : isCollapse ? 'hidden' : 'block'}`}
                                                    >
                                                        {item.title}
                                                    </span>
                                                </div>

                                                <RiArrowDownSLine className={`text-2xl ${isCollapse && 'hidden'}`} />
                                            </Accordion.Trigger>
                                        </Accordion.Header>

                                        <Accordion.Content
                                            className={`space-y-1 pl-[60px] ${!isMobile && isCollapse ? 'hidden' : 'block'}`}
                                        >
                                            {item?.subMenu?.map((child) => (
                                                <Link
                                                    key={child.key}
                                                    to={child.path}
                                                    className={`block py-1 text-sm text-left no-underline ${
                                                        location.pathname === child.path
                                                            ? 'icon-active'
                                                            : 'text-text-secondary'
                                                    }`}
                                                >
                                                    {child.title}
                                                </Link>
                                            ))}
                                        </Accordion.Content>
                                    </Accordion.Item>
                                );
                            })}
                        </Accordion.Root>
                    </NavigationMenu.Root>
                </div>

                <div
                    className={cnMerge(
                        'mt-auto text-center text-xs text-text-secondary',
                        isCollapse ? 'Flex flex-col items-center' : '',
                    )}
                >
                    {/* Settings */}
                    {(user?.role === 'ADMIN' || permission[PERMISSION_MAP['settings']]) && (
                        <>
                            {!settingsItem?.subMenu ? (
                                ''
                            ) : (
                                // 🔹 Settings accordion
                                <Accordion.Item value={settingsItem.key}>
                                    <Accordion.Header className="mb-0">
                                        <Accordion.Trigger
                                            onClick={(e) => {
                                                if (!isMobile && isCollapse) {
                                                    e.preventDefault();
                                                    navigate(settingsItem.path);
                                                }
                                            }}
                                            className={`flex items-center gap-3 w-full px-3 py-2 bg-transparent border-none ${
                                                location.pathname.startsWith('/settings') ? 'icon-active' : ''
                                            } ${isMobile ? 'justify-start' : isCollapse && 'justify-center'}`}
                                        >
                                            <div className="flex cursor-pointer items-center gap-3">
                                                <img src={settingsItem?.icon} className="h-6 w-6" alt="setting_icon" />
                                                <span
                                                    className={`text-sm font-medium text-text-secondary ${
                                                        isMobile
                                                            ? isCollapse
                                                                ? 'block'
                                                                : 'hidden'
                                                            : isCollapse
                                                              ? 'hidden'
                                                              : 'block'
                                                    }`}
                                                >
                                                    {settingsItem.title}
                                                </span>
                                            </div>

                                            <RiArrowDownSLine
                                                className={`text-2xl ${isCollapse && 'hidden'} text-text-secondary`}
                                            />
                                        </Accordion.Trigger>
                                    </Accordion.Header>

                                    <Accordion.Content
                                        className={`space-y-1 pl-[60px] ${!isMobile && isCollapse ? 'hidden' : 'block'}`}
                                    >
                                        {settingsItem.subMenu.map((child) => (
                                            <Link
                                                key={child.key}
                                                to={child.path}
                                                className={`block py-1 text-sm  ${
                                                    location.pathname === child.path
                                                        ? 'icon-active'
                                                        : 'text-text-secondary'
                                                }`}
                                            >
                                                {child.title}
                                            </Link>
                                        ))}
                                    </Accordion.Content>
                                </Accordion.Item>
                            )}
                        </>
                    )}
                    <Divider />
                    <button
                        type="button"
                        onClick={() => performCompleteLogout(queryClient, navigate)}
                        className={cnMerge(
                            'flex items-center gap-3 w-full px-3 py-2 text-text-secondary no-underline border-none bg-transparent cursor-pointer text-left',
                            isMobile ? 'justify-start' : isCollapse ? 'justify-center' : 'ml-2',
                        )}
                    >
                        <RiDoorOpenLine className="h-6 w-6 flex-shrink-0" aria-hidden />
                        <span
                            className={cnMerge(
                                'text-sm font-medium text-text-secondary',
                                isMobile ? (isCollapse ? 'block' : 'hidden') : isCollapse ? 'hidden' : 'block',
                            )}
                        >
                            {t('Setting.Logout')}
                        </span>
                    </button>
                    <Divider />
                    <p>Version {packageJson?.version}</p>
                </div>
            </div>
        </div>
    );
});

export default Sidebar;
