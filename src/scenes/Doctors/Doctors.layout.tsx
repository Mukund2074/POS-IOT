import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { RadixTabs } from '@/components/radix';
import '../../tailwind.css';

export default function DoctorsLayout() {
    const navigate = useNavigate();

    return (
        <section className="h-screen flex flex-col bg-background-paper">
            <div className="sticky top-0 z-50 bg-background-paper shadow-md">
                <RadixTabs
                    items={[{ value: 'doctors', label: t('Doctors.TabDoctors') }]}
                    className="w-full overflow-x-auto scrollbar-hidden"
                    listClassName="w-full gap-4 px-8"
                    triggerClassName="text-base font-semibold whitespace-nowrap"
                    value="doctors"
                    onValueChange={() => navigate('/doctors')}
                />
            </div>

            <section className="flex-1 overflow-y-auto mx-auto scrollbar-hidden w-full max-w-[1400px] p-3 md:p-6">
                <Outlet />
            </section>
        </section>
    );
}
