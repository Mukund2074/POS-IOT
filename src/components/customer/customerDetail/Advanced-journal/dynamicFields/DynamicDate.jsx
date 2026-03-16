import React from 'react'
import { Stack, Typography } from '@mui/material'
import FDatePicker from '../../../../commonComponents/F_DatePicker'
import moment from 'moment'

export default function DynamicDate({ formik, field, name = 'date', btnType }) {
  // 
  return (
    <Stack m={0} >
      <Typography fontWeight={700} variant='body1'>{field?.name}</Typography>
      <FDatePicker disabled={formik?.values?.disabled} format='DD/MM-YYYY' value={moment(formik?.values?.[name], 'YYYY-MM-DDTHH:mm:ss')} onChange={(date) => formik?.setFieldValue(name, date?.format('YYYY-MM-DDTHH:mm:ss'))} sx={{ width: { xs: '100%', md: '20%' }, mt: 1, ml: {xs : 0 , md : 2} }} />
      {(formik?.touched?.[name] && formik?.errors?.[name]) && <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>}
    </Stack>
  )
}
