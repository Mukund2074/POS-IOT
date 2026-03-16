import { Divider, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { GetApiProductsListing200ProductsItemProductsItem } from '@/shared/api/models';
import POSButton from '@/components/POS/Common/POSButton';
import Permission from '@/utils/POS/Permission';

export default function EditProductItems({
    selectedProduct,
    onRemoveProducts,
    onEditProducts,
    onResetProducts,
}: {
    selectedProduct: GetApiProductsListing200ProductsItemProductsItem[];
    onRemoveProducts: () => void;
    onEditProducts: () => void;
    onResetProducts: () => void;
}) {
    const { isAllowed } = Permission();
    const isAllowedToEdit = isAllowed('Product', 'update');
    const isAllowedToDelete = isAllowed('Product', 'delete');

    return (
        <Stack
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: { xs: '20%', md: '12%' },
                width: '100%',
            }}
        >
            <Stack
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', md: 'row' },
                    p: { xs: 2, md: 3 },
                    border: '1px solid #d2d2d2',
                    borderRadius: 4,
                    bgcolor: '#fff',
                    height: '100%',
                    width: { xs: '100%', md: '60%' },
                }}
            >
                <Stack
                    sx={{
                        display: 'flex',
                        alignItems: { xs: 'center', md: 'flex-start' },
                        justifyContent: { xs: 'center', md: 'flex-start' },
                        flexDirection: 'column',
                        width: { xs: '100%', md: 'auto' },
                        gap: 0.5,
                    }}
                >
                    <Typography>
                        {selectedProduct.length} {t('POS.ProdsSelect')}
                    </Typography>

                    <Typography onClick={onResetProducts} sx={{ color: 'red', cursor: 'pointer' }}>
                        {t('POS.ResetSelection')}
                    </Typography>
                </Stack>

                <Divider
                    sx={{ borderWidth: 1, borderColor: '#000', display: { xs: 'block', md: 'none' }, width: '100%' }}
                />

                <Stack
                    sx={{
                        display: 'flex',
                        alignItems: { xs: 'center', md: 'flex-end' },
                        justifyContent: { xs: 'center', md: 'flex-end' },
                        flexDirection: { xs: 'column', md: 'row' },
                        width: { xs: '100%', md: 'auto' },
                        gap: 0.5,
                        mt: { xs: 1, md: 0 },
                        py: { xs: 1, md: 2 },
                    }}
                >
                    {isAllowedToEdit && (
                        <POSButton
                            title={t('POS.UpProds')}
                            variant="save"
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={onEditProducts}
                        />
                    )}
                    {isAllowedToDelete && (
                        <POSButton
                            onClick={onRemoveProducts}
                            title={t('POS.RemProds')}
                            variant="delete"
                            width={{ xs: '100%', md: 'auto' }}
                        />
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
}
