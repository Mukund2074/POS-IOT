import { Button, createTheme, ThemeProvider, Typography } from '@mui/material';
import React from 'react';
type CustomButtonVariant = 'delete' | 'save' | 'f_outline';

declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        delete: true;
        save: true;
        f_outline: true;
    }
}

const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: '10px 20px',
                    textTransform: 'none',
                    opacity: '0px',
                    borderRadius: '25px',
                    '&.Mui-disabled': {
                        backgroundColor: '#d7d7d7',
                        color: 'white',
                        '& .MuiTypography-root': {
                            color: 'white',
                        },
                    },
                },
            },
            variants: [
                {
                    props: { variant: 'delete' as CustomButtonVariant },
                    style: {
                        backgroundColor: '#C74141',
                        fontWeight: 700,
                        color: 'white',
                    },
                },
                {
                    props: { variant: 'save' as CustomButtonVariant },
                    style: {
                        backgroundColor: '#44B904',
                        fontWeight: 700,
                        color: 'white',
                    },
                },
                {
                    props: { variant: 'f_outline' as CustomButtonVariant },
                    style: {
                        border: '1px solid #a79c92',
                        fontWeight: 700,

                        color: '#BBB0A4',
                    },
                },
            ],
        },
    },
});

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

interface ButtonProps {
    variant?: 'delete' | 'save' | 'f_outline';
    title?: string | React.ReactNode;
    sx?: object;
    height?: number | string | object;
    titlesx?: object;
    width?: number | string | object;
    style?: object;
    onClick?: (event: any) => void;
    titleColor?: string;
    loading?: boolean;
    disabled?: boolean;
    className?: null | string;
    btnVar?: null | string;
    type?: 'button' | 'submit' | 'reset';
    titleSize?: string | number;
    titleWeight?: string | number;
    icon?: React.ReactNode | string;
    border?: number | string;
}

const POSButton = ({
    title,
    sx,
    variant,
    height,
    titlesx,
    width,
    style,
    onClick,
    titleColor,
    loading,
    disabled,
    className,
    btnVar,
    type,
    titleSize,
    titleWeight,
    icon,
    border,
    ...props
}: ButtonProps) => {
    return (
        <ThemeProvider theme={theme}>
            <Button
                disableRipple
                variant={variant as 'delete' | 'save' | 'f_outline'}
                type={type}
                fullWidth={false}
                style={{
                    ...style,
                    border: border,
                }}
                // style={style}
                // height={height || "52px"}
                className={className ?? ''}
                // width={width || "257px"}
                onClick={onClick}
                disabled={disabled}
                loading={loading}
                sx={{
                    ...sx,
                    // ...style,
                    // border: border,
                    height: height || 40,
                    width: width || '257px',
                    minWidth: 'max-content',
                }}
                {...props}
            >
              {React.isValidElement(title) ? title : <Typography
                    // noWrap
                    variant={btnVar ? variantMapping[btnVar] : 'body1'}
                    // noWrap
                    sx={{
                        fontWeight: titleWeight || 700,
                        paddingLeft: 2,
                        paddingRight: 2,
                        color: titleColor,
                        fontSize: titleSize || '14px',
                        ...titlesx,
                    }}
                >
                    {typeof icon === 'string' ? (
                        <span style={{ marginRight: '10px' }}>
                            <img src={icon} alt="icon" />
                        </span>
                    ) : (
                        <React.Fragment>{icon}</React.Fragment>
                    )}
                    {title || 'Custom Button'}
                </Typography>}
            </Button>
        </ThemeProvider>
    );
};

export default POSButton;
