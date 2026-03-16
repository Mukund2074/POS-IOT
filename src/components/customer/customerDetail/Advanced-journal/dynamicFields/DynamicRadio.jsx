import { FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import React from 'react';

export default function DynamicRadio({ formik, name, field }) {
  return (
    <FormControl component="fieldset">
      <Typography fontWeight={700} variant='body1'>{field?.name}</Typography>
      <RadioGroup
        sx={{ mt: 1, ml: { xs: 0, md: 2 } }}
        name={name}
        defaultChecked={field?.value ? true : true}
        value={formik.values?.[name]}
        onChange={(e) => formik.setFieldValue(name, e.target.value)}
      >
        {field?.options?.map((option, index) => (
          <FormControlLabel
            disabled={formik?.values?.disabled}
            key={index}
            checked={option === formik.values?.[name]}
            value={option}
            control={<Radio
              sx={{ '&.Mui-checked': { color: '#44B904' }, "&.Mui:hover": { backgroundColor: "transparent" } }}
            />}
            label={option}
          />
        ))}
      </RadioGroup>
      {formik?.touched?.[name] && formik?.errors?.[name] && <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>}
    </FormControl>
  );
}
