import React from 'react'
import { Stack, Typography } from '@mui/material'
import FSelect from '../../../../commonComponents/F_Select'
import FTextInput from '../../../../commonComponents/F_TextInput'

export default function DynamicSelect({ formik, field, name = 'select', otherName }) {


  return (
    <Stack m={0} sx={{ width: 'auto', display: 'inline-block' }}>
      <Typography fontWeight={700} variant='body1'>{field?.name}</Typography>
      <FSelect
        sx={{ pr: 2, ml: { xs: 0, md: 2 }, mt: 1 }}
        disabled={formik?.values?.disabled}
        onChange={(e) => formik.setFieldValue(name, e.target.value)}
        defaultValue={field?.value}
        options={field?.options?.map((option) => ({ value: option, label: option }))}
        value={formik?.values?.[name]}
        name={name}
      />
      <br />
      {(field?.include_other && formik?.values?.[name] === 'other') &&
        <FTextInput
          sx={{ pr: 2, ml: { xs: 0, md: 2 }, mt: 1, width: 'auto' }}
          disabled={formik?.values?.disabled}
          onBlur={formik.handleBlur}
          value={formik?.values?.[otherName]}
          placeholder={field?.name}
          onChange={(e) => { formik.setFieldValue(otherName, e.target.value) }}
          name={otherName}
        />
      }

      {formik?.touched?.[name] && formik?.errors?.[name] && <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>}
      {formik?.touched?.[otherName] && formik?.errors?.[otherName] && <Typography style={{ color: 'red' }}>{formik?.errors?.[otherName]}</Typography>}
    </Stack>
  )
}
