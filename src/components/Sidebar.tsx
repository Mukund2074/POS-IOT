import { forwardRef } from 'react';
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

import BahlouLogoFull from '@/assets/Bahlou_logo.png';
import { cnMerge } from '@/utils/cnMerge';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
// @ts-ignore
import { performCompleteLogout } from '@/utils/queryCacheUtils';
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
    const { isCollapse, setCollapse, isMobile, onClose }: any = props;
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.user.data);
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
            icon: CustomersIcon,
            title: 'Employees',
            sequence: 4,
        },
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
        sequence: 12,
    };

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
                            {sidebarItems.map((item: SideBarTypes) => {
                                const isActive = location.pathname.startsWith(item.path);

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
                        <Link
                            to={settingsItem.path}
                            className={`flex items-center gap-3 px-3 py-2 no-underline text-text-secondary ${
                                location.pathname === settingsItem.path ? 'icon-active' : ''
                            } ${isMobile ? 'justify-start' : isCollapse && 'justify-center'}`}
                        >
                            <img src={settingsItem.icon} alt="menu_icons" className="h-6 w-6" />
                            <span
                                className={`text-sm font-medium text-text-secondary mb-0 ${isMobile ? (isCollapse ? 'block' : 'hidden') : isCollapse ? 'hidden' : 'block'}`}
                            >
                                {settingsItem.title}
                            </span>
                        </Link>
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
