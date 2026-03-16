import React from 'react';
import { Button, Typography } from '@mui/material';
import { styled } from '@mui/system';

const CustomButton = styled(Button)(({ width, height, backgroundColor, borderColor, borderWidth, sx }) => ({
    width: width || '257px',
    height: height || '52px',
    borderRadius: '25px',
    opacity: '0px',
    backgroundColor: backgroundColor || '#44B904',
    borderColor: borderColor || 'transparent',
    borderWidth: borderWidth || '1px',
    borderStyle: 'solid',
    textTransform: 'none',
    ...sx,
}));

const CommonButton = ({ width, height, backgroundColor, title, titleColor = '#FFFFFF', onClick, icon, disabled, style, borderColor, borderWidth, loading, type }) => {
    return (
        <CustomButton
            disableRipple
            loading={loading}
            type={type}
            width={width}
            height={height}
            backgroundColor={backgroundColor}
            onClick={onClick}
            disabled={disabled}
            sx={style}
            borderColor={borderColor}
            borderWidth={borderWidth}
        >
            {icon && (
                <span>
                    {icon}
                </span>
            )}

            <Typography variant='body1' sx={{ color: titleColor, fontWeight: 700, paddingLeft: 2, paddingRight: 2 }}>
                {title || 'Custom Button'}
            </Typography>
        </CustomButton>
    );
};

export default CommonButton;
