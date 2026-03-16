import React from 'react';
import CustomCheckbox from '../../../../commonComponents/F_Checkbox';
import { Stack, Typography } from '@mui/material';

export default function DynamicCheckBox({ formik, field, name = 'checked' }) {
    const handleClick = (option) => {
        const isChecked = !formik.values?.[name]?.includes(option);
        if (isChecked) {
            formik.setFieldValue(name, [...formik.values[name], option]);
        } else {
            formik.setFieldValue(name, formik.values[name].filter((val) => val !== option));
        }
    };

    return (
        <Stack direction={"column"} gap={2}>
            <Typography fontWeight={700} variant='body1'>{field?.name}</Typography>
            {field && field?.options?.map((option) => (
                <Stack
                    ml={{ xs: 0, md: 2 }}
                    direction={"row"}
                    gap={1}
                    alignItems={"center"}
                    onClick={() => handleClick(option)}  
                    style={{ cursor: 'pointer' }} 
                >
                    <CustomCheckbox
                        disabled={formik?.values?.disabled}
                        checked={formik.values?.[name]?.includes(option) ? true : false}
                        onChange={(e) => e.stopPropagation()}  
                    />
                    <Typography variant='body1'>{option}</Typography>
                </Stack>
            ))}
            {formik?.touched?.[name] && formik?.errors?.[name] && (
                <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>
            )}
        </Stack>
    );
}
