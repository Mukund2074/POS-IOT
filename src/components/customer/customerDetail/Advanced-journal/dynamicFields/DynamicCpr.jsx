import { Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import FTextInput from '../../../../commonComponents/F_TextInput';

export default function DynamicCpr({ formik, field, name = 'cpr' }) {
    // const [cpr, setCprNumber] = useState('');
    // const [isCprValid, setIsCprValid] = useState(false);
    // const [validationMessage, setValidationMessage] = useState('');
    // const [isFieldTouched, setIsFieldTouched] = useState(false);

    // console.log('name', name)
    // console.log('field', field)

    const handleCprChange = (e) => {
        let input = e.target.value?.replace(/\D/g, '');
        if (input.length > 10) {
            input = input.slice(0, 10);
        }

        const formattedCpr = input.length > 6 ? `${input.slice(0, 6)}-${input.slice(6)}` : input;
        // setCprNumber(formattedCpr);
        formik.setFieldValue(name, formattedCpr);
        if (formattedCpr.length === 11) {
            console.log('formattedCpr', formattedCpr);
            // setIsCprValid(true);
            // setValidationMessage('');
        } else {
            // setIsCprValid(false);
            // setValidationMessage('CPR must be in the format: 000000-XXXX');
        }
    };

    const handleBlurCpr = () => {
        // setIsFieldTouched(true);
    };

    useEffect(() => {
        // setCprNumber(formik?.initialValues?.[name]);
    }, [formik?.initialValues?.[name]]);

    return (
        <Stack m={0}>
            <Typography fontWeight={700} variant="body1">
                {field?.name}
            </Typography>
            <FTextInput
                disabled={formik?.values?.disabled}
                value={formik?.values?.[name]}
                onChange={(e) => {
                    handleCprChange(e);
                }}
                onBlur={() => {
                    formik.setFieldTouched(name, true);
                }}
                placeholder="000000-XXXX"
                inputProps={{ maxLength: 11 }}
                sx={{
                    width: { xs: '100%', md: '20%' },
                    '& input::placeholder': { color: '#747474', fontSize: '1rem', opacity: 1 },
                    fontSize: '1rem',
                    ml: { xs: 0, md: 2 },
                }}
            />
            {/* {(isFieldTouched || (formik?.touched?.[name] && formik?.errors?.[name])) && !isCprValid && (
                <Typography sx={{ color: 'red' }}>{validationMessage || formik?.errors?.[name]}</Typography>
            )} */}
            {formik?.touched?.[name] && formik?.errors?.[name] && (
                <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>
            )}
        </Stack>
    );
}
