import { useSelector } from 'react-redux';
import { Paper, Typography } from '@mui/material';
import POSButton from '@/components/POS/Common/POSButton';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';

export default function Permission() {
    const setting = useSelector((state: any) => state?.settings?.data?.posSetting?.value);
    const user = useSelector((state: any) => state?.user?.data);
    const employeeId = Number(localStorage.getItem('employee_id'));
    const isAllowed = (module: string, request: string) => {
        const permission = setting?.employeePermissions?.[employeeId]?.[module]?.[request];
        if (user?.role === 'ADMIN') {
            return true;
        }
        // return temp true for pdn patch
        // return true;
        return permission || false;
    };

    return {
        isAllowed,
    };
}

export const PermissionDenied = () => {
    const navigate = useNavigate();
    return (
        <Paper
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80dvh',
                backgroundColor: '#fff',
                borderRadius: 6,
                p: 2,
            }}
            elevation={3}
        >
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'red' }}>{t('POS.PermissionDenied')}</Typography>
            <POSButton
                title={t('POS.GoToHome')}
                sx={{ mt: 2 }}
                variant="f_outline"
                onClick={() => {
                    navigate('/');
                }}
            />
        </Paper>
    );
};
