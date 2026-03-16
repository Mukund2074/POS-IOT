import React from 'react';
import { useSelector } from 'react-redux';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSSelect from '@/components/POS/Common/POSSelect';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import { EmployeeListingSchema } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';
import { ExtendedSaleItem } from '@/types/CartContext.type';

interface Props {
    item: ExtendedSaleItem;
    index: number;
    onFieldChange?: (index: number, field: string, value: any) => void;
    disabled?: boolean;
}

export default function ServedBySelect({ item, index, onFieldChange, disabled }: Props) {
    const employees = useSelector((state: any) => state.settings?.data?.employees || []);
    const loggedInEmployeeId = Number(localStorage.getItem('employee_id'));

    // Use item.employeeId if set, otherwise default to logged-in employee
    const selectedEmployeeId = item.employeeId || loggedInEmployeeId;

    return (
        <Stack width="100%">
            <POSHeading text={t('POS.ServedBy')} sx={{ fontSize: 14, fontWeight: 600 }} />
            <POSSelect
                disabled={disabled}
                backgroundColor="#fff"
                value={selectedEmployeeId || ''}
                options={employees.map((emp: EmployeeListingSchema) => ({
                    label: emp.name,
                    value: emp.id,
                }))}
                onChange={(e) => onFieldChange?.(index, 'employeeId', e.target.value)}
            />
        </Stack>
    );
}
