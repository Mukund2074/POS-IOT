import POSButton from '@/components/POS/Common/POSButton';
import { CircularProgress, Stack } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import moment from 'moment';
import { useCustomer } from '@/hooks/index';
import {
    GetApiCustomers200CustomersItem,
    GetApiGiftCardsId200HistoryItem,
    PatchApiGiftCardsIdBody,
} from '@/shared/api/models';
import { useGiftCardById } from '@/hooks/api/giftCard/useGiftCardById';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatchGiftCard } from '@/hooks/api/giftCard/usePatchGiftCard';
import { toast } from 'react-toastify';
import { usePatchGiftCardStatus } from '@/hooks/api/giftCard/usePatchGiftCardStatus';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import UpdateGiftCardBody from './UI/UpdateGiftCardBody';
import UpdateGiftCardHeader from './UI/UpdateGiftCardHeader';
import * as Yup from 'yup';
import { UpdateGiftCardFormValues } from './Types/UpdateGiftCard.types';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';
import { api } from '@/utils/Api/POS';

const validationSchema = Yup.object().shape({
    customer: Yup.object()
        .shape({
            id: Yup.number().nullable(),
            name: Yup.string(),
        })
        .nullable(),

    giftCardAmount: Yup.number()
        .required(t('GiftCard.GiftCardAmountError'))
        .positive(t('GiftCard.GiftCardAmountNegativeError')),

    remainingAmount: Yup.number()
        .required(t('GiftCard.RemainingAmountNegativeError'))
        .min(0, t('GiftCard.RemainingAmountExceedError'))
        .max(Yup.ref('giftCardAmount'), t('GiftCard.RemainingAmountExceedError')),

    expiryDate: Yup.date().required(t('Calendar.YupErrDateReq')).typeError(t('Customer.BirthdayInvalidFormat')),

    giftCardCode: Yup.string(),

    recipientName: Yup.string(),

    notes: Yup.string().nullable(), // optional

    history: Yup.array()
        .of(
            Yup.object().shape({
                salesId: Yup.string().nullable(),
                invoiceNumber: Yup.string().nullable(),
                amountUsed: Yup.number(),
                dateTime: Yup.string(),
            }),
        )
        .nullable(),
});

const UpdateGiftCardPageLayout = () => {
    const [customers, setCustomers] = useState<GetApiCustomers200CustomersItem[]>([]);
    const [isDelete, setIsDelete] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [status, setStatus] = useState('');
    const params = useParams();
    const navigate = useNavigate();
    const { isAllowed } = Permission();

    useEffect(() => {
        if (!isAllowed('GiftCard', 'update')) {
            toast.error(t('POS.PermissionDenied'));
            const interval = setInterval(() => {
                navigate('/gift-card');
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [params]);

    const [initialState, setInitialState] = useState<UpdateGiftCardFormValues>({
        customer: {
            id: 0,
            name: '',
        },
        giftCardAmount: 0,
        remainingAmount: 0,
        expiryDate: '',
        giftCardCode: '',
        recipientName: '',
        notes: '',
        history: [
            {
                salesId: '',
                invoiceNumber: '',
                amountUsed: 0,
                dateTime: '',
                id: '',
            },
        ],
    });

    const [isChanges, setIsChanges] = useState(false);

    const { mutate: updateGiftCard } = usePatchGiftCard();
    const { mutate: updateGiftCardStatus } = usePatchGiftCardStatus();

    const handleUpdate = (values: PatchApiGiftCardsIdBody, id: string) => {
        const variables = { data: values, id };

        updateGiftCard(variables, {
            onSuccess: (data) => {
                toast.success(t('GiftCard.SuccessUpdateGiftCard'));
            },
            onError: (error) => {
                console.error('Update failed:', error);
                toast.error(t('GiftCard.ToastErrUpdateGiftCard'));
            },
        });
    };

    const formik = useFormik({
        initialValues: initialState,
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            const modifiedValues = {
                customerId: values.customer.id === 0 ? null : values.customer.id,
                originalValue: values.giftCardAmount,
                expiryDate: values.expiryDate ? moment(values.expiryDate).toISOString() : '',
                recipientName: values.recipientName,
                note: values.notes,
                residueValue: values.remainingAmount,
            };

            setInitialState((prev) => ({ ...prev, ...values }));
            handleUpdate(modifiedValues, params?.id ?? '');

            if (values.remainingAmount === 0) {
                handleUsed({ isUsed: true });
            }
        },
    });

    const { data: customersData, refetch } = useCustomer({
        params: {
            search: '',
            page: 1,
            limit: 10000,
        },
    });

    const { data: giftCardData, refetch: giftCardRefetch, isLoading } = useGiftCardById({ id: params?.id ?? '' });

    useEffect(() => {
        if (customersData?.customers) {
            setCustomers(customersData.customers);
        }
    }, [customersData]);

    useEffect(() => {
        if (giftCardData) {
            setInitialState({
                customer: {
                    id: giftCardData.customer?.id ?? 0,
                    name: giftCardData.customer?.name ?? '',
                },
                giftCardAmount: giftCardData.originalValue ?? 0,
                remainingAmount: giftCardData.residueValue || 0,
                expiryDate: moment(giftCardData.expiryDate).format('YYYY-MM-DD'),
                giftCardCode: giftCardData.giftCardCode ?? '',
                recipientName: giftCardData.recipientName ?? '',
                notes: giftCardData.note ?? '',
                history: giftCardData.history
                    ? giftCardData.history.map((item: GetApiGiftCardsId200HistoryItem) => ({
                          salesId: item.salesId ?? '',
                          invoiceNumber: item.invoiceNumber ?? '',
                          amountUsed: item.amountUsed ?? 0,
                          dateTime: item.dateTime ?? '',
                          id: item.salesId ?? '',
                      }))
                    : [],
            });

            setStatus(giftCardData.status ?? '');
        }
    }, [giftCardData]);

    useEffect(() => {
        refetch();
        giftCardRefetch();
    }, []);

    const handleDelete = async ({ id }: { id: string }) => {
        try {
            setIsDeleteLoading(true);
            await api.deleteApiGiftCardsId(id);
            toast.success(t('GiftCard.SuccessDeleteGiftCard'));
            navigate('/gift-card');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(t('GiftCard.ToastErrDeleteGiftCard'));
        } finally {
            setIsDeleteLoading(false);
        }
    };

    const handleUsed = ({ showToast = false, isUsed }: { showToast?: boolean; isUsed?: boolean }) => {
        const newStatus = isUsed ? 'USED' : 'UNUSED';
        updateGiftCardStatus(
            { status: newStatus, id: params?.id ?? '' },
            {
                onSuccess: () => {
                    setStatus(newStatus);
                    showToast && toast.success(t('GiftCard.ToastUpdateSettings'));
                },
                onError: (error) => {
                    console.error('Update failed:', error);
                    toast.error(t('GiftCard.ToastErrStatusGiftCard'));
                },
            },
        );
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const hasChanges = JSON.stringify(formik.values) !== JSON.stringify(initialState);
            setIsChanges(hasChanges && formik.isValid);
        }, 400);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [formik.values, formik.isValid, initialState]);

    if (isLoading) {
        return (
            <CircularProgress
                size={40}
                sx={{
                    color: '#6f6f6f',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />
        );
    }

    if (!isAllowed('GiftCard', 'update')) {
        return <PermissionDenied />;
    }

    return (
        <>
            <UpdateGiftCardHeader status={status} isChanges={isChanges} formik={formik} handleUsed={handleUsed} />

            <UpdateGiftCardBody customers={customers} formik={formik} />

            {isAllowed('GiftCard', 'delete') && (
                <Stack sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', mt: 2 }}>
                    <POSButton
                        title={t('GiftCard.delete')}
                        variant={'delete'}
                        width={{ xs: '100%', md: '15%' }}
                        onClick={() => setIsDelete(true)}
                    />
                </Stack>
            )}

            {isDelete && (
                <POSDeleteModal
                    title={t('GiftCard.DeleteGiftCardTitle')}
                    description={t('GiftCard.DeleteGiftCardDesc')}
                    onClickDismiss={() => setIsDelete(false)}
                    onClickConfirm={async () => {
                        params?.id && (await handleDelete({ id: params?.id }));
                        setIsDelete(false);
                    }}
                    open={isDelete}
                    handleClose={() => setIsDelete(false)}
                    disabled={isDeleteLoading}
                />
            )}
        </>
    );
};

export default UpdateGiftCardPageLayout;
