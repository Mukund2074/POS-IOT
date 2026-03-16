import React from 'react';
import POSGeneralSettings from './Ui/List/POSGeneralSettings';
import { useSelector } from 'react-redux';
import { PermissionDenied } from '@/utils/POS/Permission';

export default function PosSettings() {
    const user = useSelector((state: any) => state?.user?.data);
    if (user?.role !== 'ADMIN') {
        return <PermissionDenied />;
    }
    return (
        <React.Fragment>
            <POSGeneralSettings />
        </React.Fragment>
    );
}
