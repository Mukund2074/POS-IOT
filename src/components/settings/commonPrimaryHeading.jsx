import React from 'react';
import { Typography } from '@mui/material';

const PrimaryHeading = ({ text, fontColor="#1F1F1F", fontSize}) => {
    return (
        <Typography variant='h6' sx={{ fontSize: fontSize, fontWeight: 700, color: fontColor }}>
            {text}
        </Typography>
    );
};

export default PrimaryHeading;