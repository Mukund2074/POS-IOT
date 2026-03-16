import React from 'react';
import { TextField, InputAdornment, Button } from '@mui/material';
import { FileCopy } from '@mui/icons-material';

const FTextInput = ({
    value,
    onChange,
    onBlur,
    width,
    id,
    showCopyButton,
    bgColor,
    height,
    readOnly,
    mt = 1.5,
    ml,
    borderRadius = '10px',
    handleCopy,
    name,
    error,
    helperText,
    fontColor = 'black',
    placeholder,
    disabled = false,
    borderColor = '#D9D9D9',
    placeholderFontSize = '1rem',
    inputFontSize = '1rem',
    inputFontWeight = 400,
    size = 'small',
    borderThickness = '1px',
    textAlign,
    sx,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    borderBottomColor = '#D9D9D9',
    autoComplete,
    ...props
}) => {
    return (
        <TextField
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            autoComplete={autoComplete}
            variant="outlined"
            disabled={disabled}
            readOnly={readOnly}
            error={error}
            helperText={helperText}
            size={size}
            {...props}
            sx={{
                border: `${borderThickness} solid ${borderColor}`,
                '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                    zIndex: 0,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${borderThickness} solid ${borderColor}`,
                    zIndex: 0,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${borderThickness} solid ${borderColor}`,
                    zIndex: 0,
                },
                '& input::placeholder': {
                    color: '#747474',
                    fontSize: '1rem',
                    opacity: 1,
                    zIndex: 0,
                },
                '& input': {
                    color: fontColor,
                    fontSize: inputFontSize,
                    textAlign: textAlign,
                    fontWeight: inputFontWeight,
                    zIndex: 0,
                },
                // "& input::placeholder": {
                //     color: "#747474",
                //     fontSize: placeholderFontSize,
                //     opacity: 1,
                // },
                width: width || { xs: '100%', md: '100%' },
                height: height,
                backgroundColor: bgColor ? bgColor : 'white',
                borderRadius: borderRadius,
                borderBottomLeftRadius: borderBottomLeftRadius,
                borderBottomRightRadius: borderBottomRightRadius,
                borderBottom: `2px solid ${borderBottomColor}`,
                mt: mt,
                ml: ml,
                zIndex: 0,
                ...sx,
            }}
            InputProps={{
                endAdornment: showCopyButton && (
                    <InputAdornment position="end">
                        <Button
                            onClick={handleCopy}
                            sx={{
                                padding: 0,
                                minWidth: 'auto',
                            }}
                        >
                            <FileCopy sx={{ color: '#8E8E8E', height: '17px' }} />
                        </Button>
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default FTextInput;
