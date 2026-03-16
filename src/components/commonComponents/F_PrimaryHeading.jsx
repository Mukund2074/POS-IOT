import React from 'react';
import { Typography } from '@mui/material';

const FPrimaryHeading = ({ text, fontColor = "#1F1F1F", fontSize = "22px", sx  , variant = 'h6'}) => {
    return (
        <Typography variant={variant} sx={{ fontSize: fontSize, fontWeight: 700, color: fontColor, ...sx }}>
            {text}
        </Typography>
    );
};

export default FPrimaryHeading;