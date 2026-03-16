import { CardGiftcard, Close, KeyboardArrowDown } from '@mui/icons-material';
import { IconButton, Modal, Paper, Typography, Stack } from '@mui/material';
import { t } from 'i18next';
import { GetApiProductsListing200ServicesItem } from '@/shared/api/models';
import POSInput from '@/components/POS/Common/POSInput';
import POSButton from '@/components/POS/Common/POSButton';
import POSCheckbox from '@/components/POS/Common/POSCheckbox';
import POSAutocomplete, { POSAutocompleteOption } from '@/components/POS/Common/POSAutocomplete';
import { useCart } from '@/context/POS/CartContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGiftCardByCode } from '@/hooks/api/giftCard/useGiftCardByCode';
import { useState, useMemo, useCallback, useEffect } from 'react';
import POSHeading from '@/components/POS/Common/POSHeading';
import { FormValues } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';

const validationSchema = Yup.object({
    amount: Yup.number().min(1, t('POS.AmountRequired')).required(t('POS.AmountRequired')),
    customCode: Yup.string().when('createOwnCode', {
        is: true,
        then: (schema) => schema.required(t('POS.CodeRequired')),
    }),
    recipientName: Yup.string().when('addRecipientName', {
        is: true,
        then: (schema) => schema.required(t('POS.RecipientNameRequired')),
    }),
});

export default function CreateGiftCardModal({
    open,
    onClose,
    services,
}: {
    open: boolean;
    onClose: () => void;
    services: GetApiProductsListing200ServicesItem[];
}) {
    const { cart, addItem } = useCart();
    const [codeToValidate, setCodeToValidate] = useState<string>('');
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const [pendingSubmission, setPendingSubmission] = useState<FormValues | null>(null);

    // Memoize allServices to prevent recreation on every render
    const allServices: POSAutocompleteOption[] = useMemo(() => {
        const serviceOptions = services.flatMap((group) =>
            group.services.map((service) => ({
                ...service,
                group: group.name,
                groupId: group.id,
                price: Number(service.price),
            })),
        );

        // add all options to allServices to top of the list
        serviceOptions.unshift({
            id: -1,
            name: t('POS.AllServicesAndProducts'),
            group: '',
            groupId: -1,
            price: 0,
        } as any);

        return serviceOptions;
    }, [services]);

    // Memoize initialValues to prevent recreation on every render
    const initialValues: FormValues = useMemo(
        () => ({
            amount: 0,
            selectedService: allServices[0],
            createOwnCode: false,
            customCode: '',
            addRecipientName: false,
            recipientName: '',
            codeError: '',
        }),
        [allServices],
    );

    // Use the custom hook for gift card validation
    const { data: giftCardValidation, isLoading: isValidationLoading } = useGiftCardByCode({
        code: codeToValidate,
        enabled: isValidating && !!codeToValidate,
        isReverseCheck: true,
    });

    // Helper function to proceed with form submission
    const proceedWithSubmission = useCallback(
        (values: FormValues) => {
            const serviceIds = values.selectedService?.id === -1 ? [] : [values.selectedService?.id];

            addItem({
                employeeId: cart?.sellBy,
                itemName: t('POS.GiftCard'),
                itemType: 'GIFT_CARD',
                saleType: 'SALE',
                quantity: 1,
                amount: values.amount,
                discountAmount: 0,
                discountPercentage: 0,
                taxAmount: 0,
                price: values.amount,
                note: '',
                description: '',
                itemImageUrl: null,
                unitId: null,
                unitName: null,
                unitAbbreviation: null,
                categoryId: null,
                categoryName: '',
                discountType: 'VARIABLE_PERCENTAGE',
                taxes: [],
                tax: [],
                giftCard: {
                    recipientName: values.recipientName,
                    giftCardCode: values.customCode || '',
                    amount: values.amount,
                    applicableServiceIds: serviceIds,
                },
                discounts: [],
            });
            onClose();
        },
        [addItem, cart?.sellBy, onClose],
    );

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values: FormValues) => {
            // Reset previous errors
            formik.setFieldError('codeError', '');

            // If user has custom code, verify it first
            if (values.createOwnCode && values.customCode) {
                setPendingSubmission(values);
                setCodeToValidate(values.customCode);
                setIsValidating(true);
                return;
            }

            // No custom code, proceed directly
            proceedWithSubmission(values);
        },
        enableReinitialize: true,
    });

    // Handle validation response
    useEffect(() => {
        if (isValidating && !isValidationLoading && giftCardValidation && pendingSubmission) {
            setIsValidating(false);

            // Check if code is available
            if (!giftCardValidation.valid) {
                formik.setFieldError('codeError', t('POS.CodeAlreadyExists'));
                setPendingSubmission(null);
                return;
            }

            // Code is valid, proceed with submission
            proceedWithSubmission(pendingSubmission);
            setPendingSubmission(null);
        }
    }, [isValidating, isValidationLoading, giftCardValidation, pendingSubmission, proceedWithSubmission, formik]);

    const handleClose = () => {
        // Reset all validation states
        setIsValidating(false);
        setCodeToValidate('');
        setPendingSubmission(null);
        formik.setValues(initialValues);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            disableAutoFocus
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: 500,
                    minHeight: '50%',
                    borderRadius: 3,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    p: 3,
                    gap: 2,
                }}
            >
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'text.secondary',
                    }}
                    onClick={handleClose}
                >
                    <Close />
                </IconButton>

                <Stack direction="column" alignItems="center" spacing={2}>
                    <CardGiftcard sx={{ fontSize: { xs: 64, md: 128 }, color: '#847A71' }} />
                    <POSHeading text={t('POS.CreateGiftCard')} sx={{ fontSize: 20, fontWeight: 600 }} />
                </Stack>

                <POSAutocomplete
                    popupIcon={<KeyboardArrowDown />}
                    value={formik.values.selectedService}
                    borderRadius={3}
                    width={'100%'}
                    options={allServices}
                    getOptionLabel={(option) => option.name || ''}
                    getOptionKey={(option) => option.id}
                    onChange={(event, newValue) => {
                        formik.setFieldValue('selectedService', newValue || null);
                        if (newValue && newValue.id !== -1) {
                            formik.setFieldValue('amount', newValue.price || 0);
                        }
                    }}
                    groupBy={(option) => option.group || ''}
                    placeholder={t('POS.SelectService')}
                    disablePortal={false}
                    renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: POSAutocompleteOption) => (
                        <li {...props} key={option.id} style={{ padding: '8px 12px', lineHeight: '1.2' }}>
                            <Typography variant="body2" color="#545454">
                                {option.name}
                            </Typography>
                        </li>
                    )}
                    renderGroup={(params: { key: string; group: string; children: React.ReactNode }) => (
                        <li key={params.key}>
                            <Typography
                                sx={{
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    color: '#1F1F1F',
                                    p: 1,
                                }}
                            >
                                {params.group}
                            </Typography>
                            <ul style={{ padding: 0, margin: 0 }}>{params.children}</ul>
                        </li>
                    )}
                    clearIcon={false}
                />

                <POSInput
                    value={formik.values.amount.toString()}
                    onChange={(e) => formik.setFieldValue('amount', Number(e.target.value))}
                    placeholder={t('POS.WriteGiftCardAmount')}
                    InputProps={{
                        type: 'number',
                    }}
                    error={formik.touched.amount && !!formik.errors.amount}
                    helperText={formik.touched.amount && formik.errors.amount ? formik.errors.amount : undefined}
                />

                <Stack>
                    <POSCheckbox
                        label={t('POS.CreateOwnCode')}
                        checked={formik.values.createOwnCode}
                        onClick={() => formik.setFieldValue('createOwnCode', !formik.values.createOwnCode)}
                    />
                    {formik.values.createOwnCode && (
                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 1,
                                width: '100%',
                                alignItems: 'center',
                            }}
                        >
                            <POSInput
                                value={formik.values.customCode}
                                onChange={(e) => formik.setFieldValue('customCode', e.target.value)}
                                placeholder={t('POS.WriteOwnCode')}
                                error={formik.touched.customCode && !!formik.errors.customCode}
                                helperText={
                                    formik.touched.customCode && formik.errors.customCode
                                        ? formik.errors.customCode
                                        : undefined
                                }
                            />
                        </Stack>
                    )}
                    {formik.errors.codeError && <Typography color="error">{formik.errors.codeError}</Typography>}
                </Stack>

                <Stack>
                    <POSCheckbox
                        label={t('POS.AddRecipientName')}
                        checked={formik.values.addRecipientName}
                        onClick={() => formik.setFieldValue('addRecipientName', !formik.values.addRecipientName)}
                    />
                    {formik.values.addRecipientName && (
                        <POSInput
                            value={formik.values.recipientName}
                            onChange={(e) => formik.setFieldValue('recipientName', e.target.value)}
                            placeholder={t('POS.EnterRecipientName')}
                            mt={1}
                            error={formik.touched.recipientName && !!formik.errors.recipientName}
                            helperText={
                                formik.touched.recipientName && formik.errors.recipientName
                                    ? formik.errors.recipientName
                                    : undefined
                            }
                        />
                    )}
                </Stack>

                <POSButton
                    disabled={formik.isSubmitting || isValidating}
                    onClick={() => {
                        formik.handleSubmit();
                    }}
                    type="submit"
                    title={isValidating ? t('POS.Processing') : t('POS.SellGiftCard')}
                    variant="save"
                    width="100%"
                    sx={{ mt: 'auto' }}
                />
            </Paper>
        </Modal>
    );
}
