import React from 'react';
import { styled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';

interface POSSwitchProps {
    label?: React.ReactNode;
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    sx?: object;
    id?: string;
    name?: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    disabled?: boolean;
}

const IOSSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 43,
    height: 22,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#65C466',
                opacity: 1,
                border: 0,
            },
        },
        '&.Mui-disabled': {
            opacity: 0.7,
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#c2cccc',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        width: 18,
        height: 18,
        boxSizing: 'border-box',
        backgroundColor: '#fff',
    },
    '& .MuiSwitch-track': {
        borderRadius: 15,
        backgroundColor: '#E9E9EA',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

const POSSwitch: React.FC<POSSwitchProps> = ({
    label,
    checked,
    onChange,
    sx,
    id,
    name,
    inputProps,
    disabled,
    ...props
}) => {
    return (
        <FormControlLabel
            control={
                <IOSSwitch
                    sx={{ m: 1 }}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    inputProps={inputProps}
                />
            }
            label={label}
            id={id}
            name={name}
            sx={sx}
            {...props}
        />
    );
};

export default POSSwitch;
