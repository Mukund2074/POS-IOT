import React from 'react';
import { Typography } from '@mui/material';

const SecondaryHeading = ({ text, fontColor, fontSize = '20px', sx }) => {
    return (
        <Typography variant='body1' sx={{ fontWeight: 400, color: fontColor || '#666',...sx}}>
            {text}
        </Typography>
    );
};

export default SecondaryHeading;