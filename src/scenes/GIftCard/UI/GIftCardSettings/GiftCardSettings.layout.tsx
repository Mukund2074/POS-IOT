import { CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import GiftCardSettingsHeader from './UI/GiftCardSettingsHeader';
import * as Yup from 'yup';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import GiftCardSettingBody from './UI/GiftCardSettingBody';
import {
    GetApiGiftCardsSettings200GiftCardAttachmentAnyOfAnyOf,
    GetApiTax200Item,
    PutApiGiftCardsSettingsBody,
    PutApiGiftCardsSettingsBodyGiftCardAttachment,
} from '@/shared/api/models';
import { GiftCardSettingsFormValues, TaxId } from './Types/GiftCardSettings.types';
import Permission from '@/utils/POS/Permission';
import { useNavigate } from 'react-router-dom';
import { usePOS } from '@/context/POS/POSContext';
import { api } from '@/utils/Api/POS';

const validationSchema = Yup.object().shape({
    taxIds: Yup.array()
        .of(
            Yup.object().shape({
                label: Yup.string(),
                id: Yup.string(),
                taxRate: Yup.number(),
                isActive: Yup.boolean(),
            }),
        )
        .min(1, t('Add at least one tax')),
    expiryMonths: Yup.number(),
    sendDesignBySale: Yup.boolean(),
    cardColor: Yup.string(),
    personalMessage: Yup.string(),
    predefinedAmounts: Yup.array()
        .of(
            Yup.object().shape({
                value: Yup.number()
                    .required(t('POS.YuprequiredAmount'))
                    .min(0.01, t('POS.YuprequiredAmount'))
                    .typeError(t('POS.YuprequiredAmount')),
                onlineAvailable: Yup.boolean(),
            }),
        )
        .min(1, t('GiftCard.AtLeastOnePredefinedAmount')),
    onlineSaleDescription: Yup.string(),
    showServiceOnDesign: Yup.boolean(),
});

const GiftCardSettingsLayout = () => {
    const [showSaveButton, setShowSaveButton] = useState(false);
    const navigate = useNavigate();
    const { isAllowed } = Permission();
    const [initialValues, setInitialValues] = useState<GiftCardSettingsFormValues>({
        taxIds: [
            {
                label: '',
                id: '',
                taxRate: 0,
                isActive: false,
            },
        ],
        expiryMonths: -1,
        sendDesignBySale: false,
        cardColor: '#FFC28A',
        personalMessage: '',
        predefinedAmounts: [
            {
                value: 0,
                onlineAvailable: false,
            },
        ],
        onlineSaleDescription: '',
        showServiceOnDesign: false,
        GiftCardAttachment: null,
    });

    useEffect(() => {
        if (!isAllowed('GiftCardSettings', 'update')) {
            toast.error(t('POS.PermissionDenied'));
            const interval = setInterval(() => {
                navigate('/gift-card');
            }, 1000);

            return () => clearInterval(interval);
        }
    }, []);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const modifiedValues = {
                ...values,
                taxIds: values.taxIds.filter((tax: TaxId) => tax.isActive).map((tax: TaxId) => tax.id),
                GiftCardAttachment: values.GiftCardAttachment as
                    | PutApiGiftCardsSettingsBodyGiftCardAttachment
                    | undefined,
            };
            await updateGiftCards(modifiedValues as PutApiGiftCardsSettingsBody);
        },
    });

    const updateGiftCards = async (payload: PutApiGiftCardsSettingsBody) => {
        try {
            await api.putApiGiftCardsSettings(payload);
            toast.success(t('GiftCard.ToastUpdateSettings'));
            setShowSaveButton(false);
            setInitialValues({
                taxIds:
                    taxList.data?.map((tax: GetApiTax200Item) => ({
                        label: tax.taxName,
                        id: tax.id,
                        taxRate: tax.taxRate,
                        isActive: payload.taxIds?.includes(tax.id) || false,
                    })) || [],
                expiryMonths: payload.expiryMonths ?? -1,
                sendDesignBySale: payload.sendDesignBySale ?? false,
                cardColor: payload.cardColor ?? '#FFC28A',
                personalMessage: payload.personalMessage ?? '',
                predefinedAmounts: payload.predefinedAmounts ?? [],
                onlineSaleDescription: payload.onlineSaleDescription ?? '',
                showServiceOnDesign: payload.showServiceOnDesign ?? false,
                GiftCardAttachment:
                    payload.GiftCardAttachment as GetApiGiftCardsSettings200GiftCardAttachmentAnyOfAnyOf | null,
            });
            giftCardSettings?.refetch();
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(t('GiftCard.ToastErrUpdateGiftCard'));
        }
    };

    const { tax: taxList, giftCardSettings } = usePOS();

    useEffect(() => {
        if (!taxList?.data || !giftCardSettings?.data) {
            taxList.refetch();
            giftCardSettings.refetch();
        }
    }, []);

    useEffect(() => {
        if (giftCardSettings.data) {
            setInitialValues({
                taxIds:
                    taxList.data?.map((tax: GetApiTax200Item) => ({
                        label: tax.taxName,
                        id: tax.id,
                        taxRate: tax.taxRate,
                        isActive: giftCardSettings.data?.taxIds?.includes(tax.id) || false,
                    })) || [],
                expiryMonths: giftCardSettings.data.expiryMonths,
                sendDesignBySale: giftCardSettings.data.sendDesignBySale,
                cardColor: giftCardSettings.data.cardColor,
                personalMessage: giftCardSettings.data.personalMessage || '',
                predefinedAmounts: giftCardSettings.data.predefinedAmounts || [],
                onlineSaleDescription: giftCardSettings.data.onlineSaleDescription || '',
                showServiceOnDesign: giftCardSettings.data.showServiceOnDesign,
                GiftCardAttachment: giftCardSettings.data
                    ?.GiftCardAttachment as GetApiGiftCardsSettings200GiftCardAttachmentAnyOfAnyOf | null,
            });
        }
    }, [giftCardSettings.data, taxList.data]);

    useEffect(() => {
        giftCardSettings.refetch();
    }, [giftCardSettings.refetch]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (JSON.stringify(initialValues) !== JSON.stringify(formik.values)) {
                setShowSaveButton(true);
            } else {
                setShowSaveButton(false);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [initialValues, formik.values]);

    if (giftCardSettings.isLoading)
        return (
            <CircularProgress
                size={40}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#6f6f6f',
                }}
            />
        );
    return (
        <form onSubmit={formik.handleSubmit}>
            <GiftCardSettingsHeader formik={formik} showSaveButton={showSaveButton} />
            <GiftCardSettingBody formik={formik} />
        </form>
    );
};

export default GiftCardSettingsLayout;
