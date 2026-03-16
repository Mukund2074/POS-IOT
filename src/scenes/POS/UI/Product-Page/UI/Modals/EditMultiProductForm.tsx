import { Close } from '@mui/icons-material';
import { Grid2, IconButton, Modal, Paper, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    GetApiProductCategories200Item,
    GetApiProductsListing200ProductsItemProductsItem,
    PutApiUpdateProductsBodyDataItem,
} from '@/shared/api/models';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSButton from '@/components/POS/Common/POSButton';
import { ProductFormSchema } from '../../Types/product.types';
import Permission from '@/utils/POS/Permission';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    handleClick: (body: PutApiUpdateProductsBodyDataItem[]) => void;
    selectedProducts: GetApiProductsListing200ProductsItemProductsItem[] | null;
    categories: GetApiProductCategories200Item[];
}

export default function POSProductMultiEdit({ open, onClose, handleClick, selectedProducts, categories }: ModalProps) {
    const { isAllowed } = Permission();
    const { control, setValue, watch } = useForm<{
        products: ProductFormSchema[];
    }>({
        defaultValues: {
            products: selectedProducts || [],
        },
    });

    const { fields } = useFieldArray({
        control,
        name: 'products',
    });

    const values = watch('products');

    const onSubmit = () => {
        const body = values.map((product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            categoryId: product.categoryId === '0' ? null : (product.categoryId ?? null),
            price: product.price ?? null,
            costPrice: product.costPrice ?? null,
        }));

        handleClick(body);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            keepMounted
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    width: '70%',
                    maxHeight: '90%',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    borderRadius: 4,
                    py: 3,
                    px: 3,
                }}
            >
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
                    <Close />
                </IconButton>

                <POSHeading text={t('POS.UpProds')} />

                <Grid2 container spacing={2} mt={3}>
                    <Grid2 size={{ xs: 12, md: 2.4 }}>
                        <Typography>{t('POS.ProdName')}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 2.4 }}>
                        <Typography>{t('POS.Sku')}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 2.4 }}>
                        <Typography>{t('POS.PurPrice')}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 2.4 }}>
                        <Typography>{t('Common.Price')}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 2.4 }}>
                        <Typography>{t('POS.Category')}</Typography>
                    </Grid2>

                    {fields.map((field, index) => (
                        <Stack
                            sx={{
                                width: '100%',
                                flexDirection: 'row',
                                gap: 2,
                                alignItems: 'center',
                                border: '1px solid #d9d9d9',
                                borderRadius: 2,
                                p: 2,
                            }}
                            key={field.id}
                        >
                            <Grid2 size={{ xs: 12, md: 2.4 }}>
                                <POSInput
                                    name={`products[${index}].name`}
                                    value={values[index]?.name || ''}
                                    onChange={(e) => setValue(`products.${index}.name`, e.target.value)}
                                    placeholder={t('POS.ProdName')}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 2.4 }}>
                                <POSInput
                                    name={`products[${index}].sku`}
                                    value={values[index]?.sku || ''}
                                    onChange={(e) => setValue(`products.${index}.sku`, e.target.value)}
                                    placeholder={t('POS.Sku')}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 2.4 }}>
                                <POSInput
                                    name={`products[${index}].costPrice`}
                                    value={values[index]?.costPrice || ''}
                                    onChange={(e) => {
                                        const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                                        const parts = numericValue.split('.');
                                        let formattedValue =
                                            parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
                                        if (parts.length === 2 && parts[1].length > 2) {
                                            formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
                                        }
                                        setValue(`products.${index}.costPrice`, formattedValue);
                                    }}
                                    placeholder={t('POS.PurPrice')}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 2.4 }}>
                                <POSInput
                                    name={`products[${index}].price`}
                                    value={values[index]?.price || ''}
                                    onChange={(e) => {
                                        const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                                        const parts = numericValue.split('.');
                                        let formattedValue =
                                            parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
                                        if (parts.length === 2 && parts[1].length > 2) {
                                            formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
                                        }
                                        setValue(`products.${index}.price`, formattedValue);
                                    }}
                                    placeholder={t('Common.Price')}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 2.4 }}>
                                <POSSelect
                                    value={values[index]?.categoryId || ''}
                                    sx={{ width: '100%' }}
                                    onChange={(e) =>
                                        e?.target?.value &&
                                        setValue(`products.${index}.categoryId`, e.target.value.toString())
                                    }
                                    placeholderText={t('POS.Category')}
                                    options={
                                        categories && categories.length > 0
                                            ? categories.map((category) => ({
                                                  value: category.id,
                                                  label: category.name,
                                              }))
                                            : []
                                    }
                                />
                            </Grid2>
                        </Stack>
                    ))}
                </Grid2>

                <Stack direction="row" justifyContent="flex-end" mt={3}>
                    <POSButton
                        width={{ xs: '100%', md: 'auto' }}
                        title={t('Customer.SaveCh')}
                        variant={'save'}
                        onClick={onSubmit}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
