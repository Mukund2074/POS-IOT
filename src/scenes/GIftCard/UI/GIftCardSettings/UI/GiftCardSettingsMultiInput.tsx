import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import { InputAdornment, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { GiftCardSettingsFormValues, PredifinedAmount } from '../Types/GiftCardSettings.types';
import { FormikProps } from 'formik';
import { formatPrice } from '@/scenes/POS/Core/pos.utils';

const GiftCardSettingsMultiInput = ({ formik }: { formik: FormikProps<GiftCardSettingsFormValues> }) => {
    return (
        <Stack
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                gap: 2,
                height: '100%',
            }}
        >
            {formik.values?.predefinedAmounts?.map((item: PredifinedAmount, index: number) => {
                const predefinedError = formik.errors?.predefinedAmounts?.[index];
                const predefinedTouched = formik.touched?.predefinedAmounts?.[index]?.value;
                const valueError =
                    predefinedError &&
                    typeof predefinedError === 'object' &&
                    'value' in predefinedError &&
                    typeof predefinedError.value === 'string'
                        ? predefinedError.value
                        : undefined;

                return (
                    <Stack
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: { md: 'space-between' },
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'start',
                                width: { xs: '100%', md: '60%' },
                                height: '100%',
                            }}
                            py={1}
                        >
                            <POSInput
                                id={`predefinedAmounts.${index}.value`}
                                placeholder={t('POS.EnterAmount')}
                                value={item.value ? formatPrice(item.value.toString()) : ''}
                                name={`predefinedAmounts.${index}.value`}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (!inputValue || inputValue.trim() === '') {
                                        formik.setFieldValue(`predefinedAmounts.${index}.value`, 0);
                                        return;
                                    }
                                    const formattedValue = formatPrice(inputValue);
                                    // Extract numeric value by removing formatting
                                    const cleanValue = formattedValue.replace(/[^\d.,]/g, '').replace(',', '.');
                                    const numericValue = cleanValue ? parseFloat(cleanValue) : 0;
                                    formik.setFieldValue(
                                        `predefinedAmounts.${index}.value`,
                                        isNaN(numericValue) ? 0 : numericValue,
                                    );
                                }}
                                onBlur={() => {
                                    formik.setFieldTouched(`predefinedAmounts.${index}.value`, true);
                                    // Trigger validation
                                    formik.validateField(`predefinedAmounts.${index}.value`);
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
                            {predefinedTouched && valueError && (
                                <Typography sx={{ color: 'red', mt: 1, mb: -2 }} variant="body2">
                                    {valueError}
                                </Typography>
                            )}
                        </Stack>

                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: { xs: '100%', md: '30%' },
                            }}
                        >
                            <POSSwitch
                                id={`predefinedAmounts.${index}.onlineAvailable`}
                                name={`predefinedAmounts.${index}.onlineAvailable`}
                                checked={item.onlineAvailable}
                                onChange={formik.handleChange}
                            />

                            <POSHeading text={t('GiftCard.OnlineDescription')} fontSize={14} sx={{ fontWeight: 500 }} />
                        </Stack>
                    </Stack>
                );
            })}
        </Stack>
    );
};

export default GiftCardSettingsMultiInput;
