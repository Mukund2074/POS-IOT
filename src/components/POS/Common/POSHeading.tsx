import React from 'react';
import { Typography } from '@mui/material';

interface POSHeadingProps {
    text: string | number;
    fontColor?: string;
    fontSize?: string | number;
    sx?: object;
    variant?: string;
    onClick?: () => void;
}

const variantMapping: { [key: string]: 'inherit' | 'body1' | 'body2' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' } = {
    body1: 'body1',
    body2: 'body2',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
};

const POSHeading = ({
    text,
    fontColor = '#1F1F1F',
    fontSize = '22px',
    sx,
    variant = 'h6',
    onClick,
}: POSHeadingProps) => {
    return (
        <Typography
            variant={variantMapping[variant]}
            sx={{
                fontSize: fontSize,
                fontWeight: 700,
                color: fontColor,
                ...sx,
                cursor: onClick ? 'pointer' : 'default',
            }}
            onClick={onClick}
        >
            {text}
        </Typography>
    );
};

export default POSHeading;
