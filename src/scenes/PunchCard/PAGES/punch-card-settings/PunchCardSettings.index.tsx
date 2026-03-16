import React from 'react';
import PunchCardSettings from './Create-edit/PunchCardSettings';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';

export default function PunchCardSettingsLayout() {
    const { isAllowed } = Permission();
    if (!isAllowed('PunchCardSettings', 'update')) {
        return <PermissionDenied />;
    }
    return (
        <React.Fragment>
            <PunchCardSettings />
        </React.Fragment>
    );
}
