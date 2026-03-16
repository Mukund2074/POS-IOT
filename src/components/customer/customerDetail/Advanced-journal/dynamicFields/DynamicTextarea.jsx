import React from 'react'
import FTextArea from '../../../../commonComponents/F_TextArea'
import { Stack, Typography } from '@mui/material'

export default function DynamicTextarea({ formik, field, name = 'textarea' }) {

  return (
    <Stack m={0}>
      <Typography fontWeight={700} variant='body1'>{field?.name}</Typography>
      <FTextArea
        sx={{ mt: 1, ml: { xs: 0, md: 2 } }}
        disabled={formik?.values?.disabled}
        onBlur={formik.handleBlur}
        name={name}
        value={formik?.values?.[name]}
        placeholder={field?.name}
        onChange={(e) => formik.setFieldValue(name, e.target.value)}
        showCopyButton={false}
        fontColor='#545454'
        rows={6}
      />
      {formik?.touched?.[name] && formik?.errors?.[name] && <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>}
    </Stack>
  )
}
