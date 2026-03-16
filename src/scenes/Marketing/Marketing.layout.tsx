import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../../tailwind.css';
import { RadixTabs } from '@/components/radix';
import { t } from 'i18next';
import { cnMerge } from '@/utils/cnMerge';

export default function MarketingLayout() {
    const navigation = [
        { id: 'marketing_overview', label: t('Marketing.Overview'), href: '/marketing' },
        { id: 'email_campaigns', label: t('Marketing.EmailCampaignsTitle'), href: '/marketing/email-campaigns' },
        { id: 'sms_campaigns', label: t('Marketing.SMSSCampaignsTitle'), href: '/marketing/sms-campaigns' },
    ];

    const triggerFlowItem = {
        id: 'trigger_flows',
        label: `${t('Marketing.TriggerFlowsTitle')} (${t('Marketing.Automation')})`,
        href: '/marketing/trigger-flows',
    };

    if (process.env.REACT_APP_SHOW_TRIGGER_FLOWS === 'true') {
        navigation.push(triggerFlowItem);
    }

    const location = useLocation();
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState('');

    useEffect(() => {
        if (location.pathname === '/marketing') {
            setSelectedItem('marketing_overview');
        } else if (location.pathname.startsWith('/marketing/email-campaigns')) {
            setSelectedItem('email_campaigns');
        } else if (location.pathname.startsWith('/marketing/sms-campaigns')) {
            setSelectedItem('sms_campaigns');
        } else if (location.pathname.startsWith('/marketing/trigger-flows')) {
            setSelectedItem('trigger_flows');
        }
    }, [location.pathname]);

    return (
        <section className="marketing-scope h-screen flex flex-col bg-background-paper">
            {/* Sticky tabs header */}
            <div className="sticky top-0 z-50 bg-background-paper shadow-md">
                <RadixTabs
                    items={navigation.map((item) => ({ value: item.id, label: item.label }))}
                    className="w-full overflow-x-auto scrollbar-hidden"
                    listClassName="w-full gap-4 px-8"
                    triggerClassName="text-base font-semibold whitespace-nowrap"
                    value={selectedItem}
                    onValueChange={(value) => {
                        setSelectedItem(value);
                        navigate(navigation.find((item) => item.id === value)!.href);
                    }}
                />
            </div>

            {/* Scrollable content */}
            <section
                className={cnMerge(
                    'flex-1 overflow-y-auto  mx-auto scrollbar-hidden w-full',
                    location.pathname.startsWith('/marketing/trigger-flows/') &&
                        location.pathname !== '/marketing/trigger-flows' &&
                        location.pathname !== '/marketing/trigger-flows/select-trigger-flow'
                        ? ''
                        : 'max-w-[1400px] p-4 md:p-6',
                )}
            >
                <Outlet />
            </section>
        </section>
    );
}
