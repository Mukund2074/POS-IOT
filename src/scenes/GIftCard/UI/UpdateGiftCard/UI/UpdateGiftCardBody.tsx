import { InputAdornment, Stack, Typography } from '@mui/material';
import CommonLayout from '../../shared/CommonLayout';
import POSAutocomplete from '@/components/POS/Common/POSAutocomplete';
import { t } from 'i18next';
import POSInput from '@/components/POS/Common/POSInput';
import { GetApiCustomers200CustomersItem } from '@/shared/api/models';
import POSDatePicker from '@/components/POS/Common/POSDatePicker';
import moment from 'moment';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import UpdateGiftCardTable from './UpdateGiftCardTable';
import { FormikProps } from 'formik';
import { UpdateGiftCardFormValues } from '../Types/UpdateGiftCard.types';
import { formatPrice } from '@/scenes/POS/Core/pos.utils';

const UpdateGiftCardBody = ({
    customers,
    formik,
}: {
    customers: GetApiCustomers200CustomersItem[];
    formik: FormikProps<UpdateGiftCardFormValues>;
}) => {
    return (
        <Stack
            sx={{
                backgroundColor: '#fff',
                borderRadius: 3,
            }}
        >
            <CommonLayout
                HeadingText={t('GiftCard.Customer')}
                descriptionText={t('GiftCard.CustomerDesc')}
                children={
                    <POSAutocomplete
                        options={customers ?? []}
                        sx={{ borderRadius: 2 }}
                        getOptionLabel={(option) => option?.name ?? ''}
                        getOptionKey={(option) => option?.id ?? ''}
                        placeholder={t('Common.Customers')}
                        width={'100%'}
                        onChange={(_, newValue) => {
                            formik.setFieldValue('customer', {
                                id: newValue?.id ?? '',
                                name: newValue?.name ?? '',
                            });
                        }}
                        value={formik.values.customer}
                    />
                }
                error={typeof formik.errors.customer === 'string' ? formik.errors.customer : undefined}
            />
            <CommonLayout
                HeadingText={t('GiftCard.GiftCardAmount')}
                descriptionText={t('GiftCard.GiftCardAmountDesc')}
                children={
                    <POSInput
                        id="giftCardAmount"
                        name="giftCardAmount"
                        placeholder={t('POS.EnterAmount')}
                        value={formik.values.giftCardAmount ?? ''}
                        onChange={(e) => {
                            formik.setFieldValue('giftCardAmount', formatPrice(e.target.value));
                        }}
                        width={'100%'}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Typography>{t('POS.Currency')}</Typography>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        error={!!(formik.touched.giftCardAmount && formik.errors.giftCardAmount)}
                    />
                }
                error={formik.errors.giftCardAmount}
            />

            <CommonLayout
                HeadingText={t('GiftCard.RemainingAmounts')}
                descriptionText={t('GiftCard.RemainingAmountsDesc')}
                children={
                    <POSInput
                        id="remainingAmount"
                        name="remainingAmount"
                        placeholder={t('POS.EnterAmount')}
                        value={formik.values.remainingAmount}
                        onChange={(e) => {
                            formik.setFieldValue('remainingAmount', formatPrice(e.target.value));
                        }}
                        width={'100%'}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Typography>{t('POS.Currency')}</Typography>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                }
                error={formik.errors.remainingAmount}
            />

            <CommonLayout
                HeadingText={t('GiftCard.ExpiryDate')}
                descriptionText={t('GiftCard.ExpiryDateDesc')}
                children={
                    <POSDatePicker
                        value={formik.values.expiryDate ? moment(formik.values.expiryDate) : moment()}
                        onChange={(date) => {
                            formik.setFieldValue('expiryDate', date);
                        }}
                        format="DD/MM-YYYY"
                        disablePast
                        sx={{ borderRadius: 2, width: '100%' }}
                    />
                }
                error={formik.errors.expiryDate}
            />

            <CommonLayout
                HeadingText={t('GiftCard.Code')}
                descriptionText={t('GiftCard.CodeDesc')}
                children={
                    <POSInput
                        id="giftCardCode"
                        placeholder="56148ECA9"
                        value={formik.values.giftCardCode}
                        onChange={formik.handleChange}
                        width={'100%'}
                        disabled
                    />
                }
                error={formik.errors.giftCardCode}
            />

            <CommonLayout
                HeadingText={t('GiftCard.RecipientName')}
                descriptionText={t('GiftCard.RecipientNameDesc')}
                children={
                    <POSInput
                        id="recipientName"
                        placeholder={t('Setting.PleaseEnterName')}
                        value={formik.values.recipientName}
                        onChange={formik.handleChange}
                        width={'100%'}
                    />
                }
                error={formik.errors.recipientName}
            />

            <CommonLayout
                HeadingText={t('GiftCard.Notes')}
                descriptionText={t('GiftCard.NotesDesc')}
                children={
                    <POSTextArea
                        id="notes"
                        placeholder={t('Calendar.WriteDesc')}
                        value={formik.values.notes}
                        onChange={formik.handleChange}
                        width={'100%'}
                    />
                }
                error={formik.errors.notes}
            />

            <CommonLayout
                HeadingText={t('POS.History')}
                descriptionText={t('GiftCard.HistoryDesc')}
                children={<UpdateGiftCardTable data={formik.values.history ?? []} />}
            />
        </Stack>
    );
};

export default UpdateGiftCardBody;
