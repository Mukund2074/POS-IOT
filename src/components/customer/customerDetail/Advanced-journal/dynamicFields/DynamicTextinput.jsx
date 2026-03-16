import { Stack, Typography } from '@mui/material'
import React from 'react'
import FTextInput from '../../../../commonComponents/F_TextInput'
import { formatPhoneNumber } from '../../../../calanderComponents/booking/utils/functions'

export default function DynamicTextinput({ formik, field, name = 'journal_text' }) {

    const handleFieldChange = (e) => {
        if (field?.validation === 'phone') {
            const value = e.target.value.replace(/\D/g, '');
            formik.setFieldValue(name, value);
        } else {
            formik.setFieldValue(name, e.target.value);
        }
    }

    return (
        <Stack m={0}>
            <Typography fontWeight={700} variant='body1'>{field?.name}</Typography>
            <FTextInput
                inputProps={{ maxLength: field?.validation === 'phone' ? 11 : null }}
                sx={{ mt: 1, ml: { xs: 0, md: 2 }, width: (field?.type === 'small_text' || field?.type === 'autoFill_name' || field?.type === 'autoFill_email' || field?.type === 'autoFill_phone' || field?.type === 'autoFill_city' || field?.type === 'autoFill_zip' || field?.type === 'autoFill_phone_alt') ? { xs: '100%', md: '20%' } : '100%' }}
                disabled={formik?.values?.disabled}
                onBlur={formik.handleBlur}
                value={field?.validation === 'phone' ? formatPhoneNumber(formik?.values?.[name]) : formik?.values?.[name]}
                placeholder={field?.name}
                onChange={handleFieldChange}
                name={name}
            />
            {formik?.touched?.[name] && formik?.errors?.[name] && <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>}
        </Stack>
    )
}
