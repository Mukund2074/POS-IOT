import React from 'react';
import { TextField, InputAdornment, Button } from '@mui/material';
import { FileCopy } from '@mui/icons-material';

interface POSInputProps {
    value: string | number | null;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    width?: number | string;
    id?: string;
    showCopyButton?: boolean;
    bgColor?: string;
    height?: number | string;
    readOnly?: boolean;
    mt?: number;
    ml?: number;
    borderRadius?: string | number;
    handleCopy?: () => void;
    name?: string;
    error?: boolean;
    helperText?: string;
    fontColor?: string;
    placeholder?: string;
    disabled?: boolean;
    borderColor?: string;
    placeholderFontSize?: string;
    inputFontSize?: string | number;
    inputFontWeight?: number;
    size?: 'small' | 'medium' | 'large';
    borderThickness?: string;
    textAlign?: 'left' | 'center' | 'right';
    sx?: object;
    borderBottomLeftRadius?: string;
    borderBottomRightRadius?: string;
    borderBottomColor?: string;
    slotProps?: object;
    InputProps?: object;
    className?: string;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    type?: string;
    onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
    autoComplete?: string;
}

const POSInput = ({
    className = '',
    value,
    onChange,
    onBlur,
    width,
    id,
    showCopyButton,
    bgColor,
    height,
    readOnly,
    mt,
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
    slotProps,
    InputProps,
    onKeyDown,
    onKeyUp,
    type,
    onClick,
    autoComplete,
    ...props
}: POSInputProps) => {
    return (
        <TextField
            className={className}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            variant="outlined"
            disabled={disabled}
            // readOnly={readOnly}
            error={error}
            helperText={helperText}
            size={typeof size === 'string' ? (size === 'small' || size === 'medium' ? size : 'small') : size}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            type={type}
            onClick={onClick}
            autoComplete={autoComplete}
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
                    fontWeight: inputFontWeight,
                    textAlign: textAlign,
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
            slotProps={slotProps}
            InputProps={{
                ...InputProps,
                readOnly: readOnly,
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

export default POSInput;
