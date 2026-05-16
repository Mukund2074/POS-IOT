import { Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import POSButton from '@/components/POS/Common/POSButton';
import SupplierList from './UI/List/SupplierList';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';

export default function POSSupplier() {
    const navigate = useNavigate();
    const { isAllowed } = Permission();

    return (
        <Stack>
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: { md: 'space-between' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    pb: 2,
                    width: '100%',
                }}
            >
                <POSHeading sx={{ my: 2 }} text={t('POS.Suppliers')} />
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        width: '100%',
                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    }}
                >
                   
                    {isAllowed('Supplier', 'create') && (
                        <POSButton
                            title={`+ ${t('POS.AddSupplier')}`}
                            variant={'save'}
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={() => {
                                navigate('/pos/suppliers/create');
                            }}
                        />
                    )}
                </Stack>
            </Stack>

            {isAllowed('Supplier', 'read') ? <SupplierList /> : <PermissionDenied />}

        
        </Stack>
    );
}
