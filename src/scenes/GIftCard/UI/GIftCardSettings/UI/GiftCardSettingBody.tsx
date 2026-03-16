import React, { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import CommonLayout from '../../shared/CommonLayout';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import POSSelect from '@/components/POS/Common/POSSelect';
import { t } from 'i18next';
import POSInput from '@/components/POS/Common/POSInput';
import GiftCardSettingsMultiInput from './GiftCardSettingsMultiInput';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import { FormikProps } from 'formik';
import { GiftCardSettingsFormValues, TaxId } from '../Types/GiftCardSettings.types';
import POSUpload from '@/components/POS/Common/POSUpload';
import { giftCardSettingApi } from '../CORE/gift-card-setting-api';
import { toast } from 'react-toastify';
import ImageViewer from '../../shared/ImageViewer';
import POSButton from '@/components/POS/Common/POSButton';
import DeleteIcon from '@/assets/Delete.svg';

const expiryOptions = Array.from({ length: 60 }, (_, i) => ({
    label: `${i + 1} months`,
    value: i + 1,
}));

const RenderColorMenuItem = (props: { label: string; value: string }) => {
    return (
        <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Stack bgcolor={props.value} height={18} width={18} my={'auto'} borderRadius={1} />
            <Typography>{props.label}</Typography>
        </Stack>
    );
};

const colorWithLabel = [
    {
        label: RenderColorMenuItem({ label: 'Red', value: '#FF0000' }),
        value: '#FF0000',
    },
    {
        label: RenderColorMenuItem({ label: 'Orange', value: '#FF7F00' }),
        value: '#FF7F00',
    },
    {
        label: RenderColorMenuItem({ label: 'Yellow', value: '#FFFF00' }),
        value: '#FFFF00',
    },
    {
        label: RenderColorMenuItem({ label: 'Green', value: '#00FF00' }),
        value: '#00FF00',
    },
    {
        label: RenderColorMenuItem({ label: 'Cyan', value: '#00FFFF' }),
        value: '#00FFFF',
    },
    {
        label: RenderColorMenuItem({ label: 'Blue', value: '#0000FF' }),
        value: '#0000FF',
    },
    {
        label: RenderColorMenuItem({
            label: 'Default',
            value: '#FFC28A',
        }),
        value: '#FFC28A',
    },
];

const GiftCardSettingBody = ({ formik }: { formik: FormikProps<GiftCardSettingsFormValues> }) => {
    const [viewFullImage, setViewFullImage] = useState(false);
    const handleFileUpload = async (file: any) => {
        const toastId = toast.loading(t('POS.Processing')); // show "uploading" toast

        try {
            const response = await giftCardSettingApi.UploadImage(file);

            // Update toast to success
            toast.update(toastId, {
                render: t('Customer.AttachSuccess'),
                type: 'success',
                isLoading: false,
                autoClose: 2000,
                closeOnClick: true,
                draggable: true,
            });

            formik.setFieldValue('GiftCardAttachment', response?.data?.data);
        } catch (error) {
            // Update toast to error
            toast.update(toastId, {
                render: t('Customer.AttachError'),
                type: 'error',
                isLoading: false,
                autoClose: 3000,
                closeOnClick: true,
                draggable: true,
            });
        }
    };

    const handleDeleteImage = async (id: number) => {
        const toastId = toast.loading(t('POS.Processing'));
        try {
            await giftCardSettingApi.DeleteImage(id);

            toast.update(toastId, {
                render: t('Setting.ImageRemoved'),
                type: 'success',
                isLoading: false,
                autoClose: 2000,
                closeOnClick: true,
                draggable: true,
            });
        } catch (error) {
            toast.update(toastId, {
                render: t('Setting.FailedToRemoveImage'),
                type: 'error',
                isLoading: false,
                autoClose: 3000,
                closeOnClick: true,
                draggable: true,
            });
        }
    };

    const renderUploadField = () => {
        if (formik.values.GiftCardAttachment && Object.keys(formik.values.GiftCardAttachment).length > 0) {
            return (
                <Stack sx={{ gap: 1, display: 'flex', mt: 2, position: 'relative' }}>
                    <img
                        src={`${process.env.REACT_APP_IMG_URL}${formik.values.GiftCardAttachment?.url}`}
                        alt="logo"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            cursor: 'pointer',
                            zIndex: 0,
                        }}
                        onClick={() => setViewFullImage(true)}
                    />

                    <POSButton
                        title={
                            <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <img src={DeleteIcon} alt="Delete" />
                                {t('Common.Delete')}
                            </Stack>
                        }
                        width={{ xs: '100%', md: 'fit-content' }}
                        variant="save"
                        onClick={async () => {
                            if (formik?.values?.GiftCardAttachment?.id) {
                                await handleDeleteImage(formik.values.GiftCardAttachment.id);
                                formik.setFieldValue('GiftCardAttachment', {});
                            }
                        }}
                    />
                </Stack>
            );
        } else {
            return (
                <POSUpload
                    handleFileUpload={(e) => {
                        if (e.target instanceof HTMLInputElement) {
                            const file = e.target.files?.[0];
                            if (file) {
                                handleFileUpload(file);
                            } else {
                                toast.error('No file selected');
                            }
                        }
                    }}
                />
            );
        }
    };

    return (
        <React.Fragment>
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 4,
                }}
            >
                {formik?.values?.taxIds?.map((tax: TaxId) => {
                    return (
                        <CommonLayout
                            key={`taxids_${tax.id}`}
                            text={`Include ${tax.label} (${tax.taxRate}%)`}
                            HeadingText={tax.label}
                            descriptionText={
                                t('GiftCard.GiftCardSetting1Desc') +
                                ' ' +
                                tax?.label?.toUpperCase() +
                                ' ' +
                                t('GiftCard.GiftCardSetting2Desc')
                            }
                            children={
                                <POSSwitch
                                    id={`taxids_${tax.id}.isActive`}
                                    checked={
                                        formik.values.taxIds.find((t: TaxId) => t.id === tax.id)?.isActive ?? false
                                    }
                                    onChange={(event, checked) => {
                                        const newTaxIds = formik.values.taxIds.map((t: TaxId) =>
                                            t.id === tax.id ? { ...t, isActive: checked } : t,
                                        );
                                        formik.setFieldValue('taxIds', newTaxIds);
                                    }}
                                    sx={{ pl: 0.55 }}
                                />
                            }
                        />
                    );
                })}

                <CommonLayout
                    text={t('GiftCard.GiftCardSettingExpiryHead')}
                    HeadingText={t('Calendar.Expiry')}
                    descriptionText={t('GiftCard.GiftCardSettingExpiryDesc')}
                    children={
                        <POSSelect
                            id="expiryMonths"
                            value={formik.values.expiryMonths === -1 ? '' : formik.values.expiryMonths}
                            placeholderText={t('GiftCard.SelectOption')}
                            options={expiryOptions}
                            onChange={(event) => formik.setFieldValue('expiryMonths', event.target.value)}
                            sx={{ mt: 0.5 }}
                        />
                    }
                    error={formik.touched.expiryMonths && formik.errors.expiryMonths}
                />
                <CommonLayout
                    key={'designGiftCardSwitch'}
                    HeadingText={t('GiftCard.GiftCardSettingSendDesign')}
                    descriptionText={t('GiftCard.GiftCardSettingDesignDesc')}
                    text={t('GiftCard.Activate')}
                    children={
                        <POSSwitch
                            id="sendDesignBySale"
                            checked={formik.values.sendDesignBySale}
                            onChange={(event, checked) => formik.setFieldValue('sendDesignBySale', checked)}
                            sx={{ pl: 0.55 }}
                        />
                    }
                    error={formik.touched.sendDesignBySale && formik.errors.sendDesignBySale}
                />

                <CommonLayout
                    HeadingText={t('GiftCard.GiftCardSettingColorOfCard')}
                    descriptionText={t('GiftCard.GiftCardSettingColorOfCardDesc')}
                    children={
                        <POSSelect
                            id="cardColor"
                            value={formik.values.cardColor}
                            placeholderText={t('GiftCard.SelectOption')}
                            options={colorWithLabel}
                            onChange={(event) => formik.setFieldValue('cardColor', event.target.value)}
                        />
                    }
                    error={formik.touched.cardColor && formik.errors.cardColor}
                />

                <CommonLayout
                    HeadingText={t('GiftCard.GiftCardSettingPersonalMsg')}
                    descriptionText={t('GiftCard.GiftCardSettingPersonalMsgDesc')}
                    children={
                        <POSInput
                            id="personalMessage"
                            placeholder={t('GiftCard.YourMessage')}
                            value={formik.values.personalMessage}
                            onChange={(event) => formik.setFieldValue('personalMessage', event.target.value)}
                            width={'100%'}
                        />
                    }
                    error={formik.touched.personalMessage && formik.errors.personalMessage}
                />

                <CommonLayout
                    HeadingText={t('GiftCard.GiftCardPredefinedValues')}
                    descriptionText={t('GiftCard.GiftCardPredefinedValuesDesc')}
                    children={<GiftCardSettingsMultiInput formik={formik} />}
                />
                <CommonLayout
                    HeadingText={t('GiftCard.GiftCardSettingOnline')}
                    descriptionText={t('GiftCard.GiftCardSettingOnlineDesc')}
                    text={t('GiftCard.OnlineDescription')}
                    children={
                        <POSTextArea
                            id="onlineSaleDescription"
                            placeholder={t('GiftCard.textDescription')}
                            height={100}
                            value={formik.values.onlineSaleDescription ?? ''}
                            onChange={(event) => formik.setFieldValue('onlineSaleDescription', event.target.value)}
                            width={'100%'}
                            mt={0.5}
                        />
                    }
                    error={formik.touched.onlineSaleDescription && formik.errors.onlineSaleDescription}
                />

                <CommonLayout
                    HeadingText={t('GiftCard.GiftCardSettingPrint')}
                    descriptionText={t('GiftCard.GiftCardSettingPrintDesc')}
                    text={t('GiftCard.Activate')}
                    children={
                        <POSSwitch
                            id="showServiceOnDesign"
                            checked={formik.values.showServiceOnDesign}
                            onChange={(event, checked) => formik.setFieldValue('showServiceOnDesign', checked)}
                        />
                    }
                    error={formik.touched.showServiceOnDesign && formik.errors.showServiceOnDesign}
                />

                <CommonLayout
                    HeadingText={t('GiftCard.UploadImageOrLogo')}
                    descriptionText={t('GiftCard.UploadImageDesc')}
                    text={t('GiftCard.UploadImage')}
                    children={renderUploadField()}
                    error={formik.touched.showServiceOnDesign && formik.errors.showServiceOnDesign}
                />
            </Stack>
            {viewFullImage && formik?.values?.GiftCardAttachment?.url && (
                <ImageViewer
                    isOpen={viewFullImage}
                    setIsOpen={() => setViewFullImage(false)}
                    imageUrl={`${process.env.REACT_APP_IMG_URL}${formik?.values?.GiftCardAttachment?.url}`}
                />
            )}
        </React.Fragment>
    );
};

export default GiftCardSettingBody;
