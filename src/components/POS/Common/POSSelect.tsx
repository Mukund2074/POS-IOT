import React, { useState, useRef, useEffect } from 'react';
import {
    Select,
    MenuItem,
    Stack,
    Typography,
    SelectChangeEvent,
    FormControl,
    FormHelperText,
    SxProps,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import POSCheckbox from './POSCheckbox';

export interface POSSelectOption {
    label: string | React.ReactNode;
    value: string | number;
    disabled?: boolean;
}

interface POSSelectProps {
    id?: string;
    value?: string | number | null | (string | number)[];
    defaultValue?: string | number | (string | number)[];
    onChange: (event: SelectChangeEvent<string | number | (string | number)[] | null>) => void;
    onBlur?: () => void;
    options: POSSelectOption[];
    disabled?: boolean;
    sx?: object;
    size?: 'small' | 'medium';
    fontWeight?: number;
    fontSize?: string | number;
    borderColor?: string;
    borderRadius?: string | number;
    borderThickness?: string | number;
    backgroundColor?: string;
    isMultiSelect?: boolean;
    padding?: string | number;
    showAllValues?: boolean;
    TextToDisplayWithCount?: string;
    placeholderText?: string;
    selectAllRenderText?: string;
    selectAllRenderCheckBoxText?: string;
    IconComponent?: React.ElementType;
    showPlaceHolder?: boolean;
    colorMap?: Record<string | number, string>;
    autoScrollToValue?: string | number | null;
    allowSelectAll?: boolean;
    isGrouped?: boolean;
    error?: boolean;
    helperText?: string;
    fontColor?: string;
    wrapperSx?: SxProps;
}

const POSSelect: React.FC<POSSelectProps> = ({
    id,
    value,
    defaultValue,
    onChange,
    onBlur,
    options,
    disabled = false,
    sx,
    size = 'small',
    fontWeight = 400,
    fontSize = '15px',
    borderColor = '#D9D9D9',
    borderRadius = '13px',
    borderThickness = '1px',
    backgroundColor = 'transparent',
    isMultiSelect = false,
    padding = 'auto',
    showAllValues = false,
    TextToDisplayWithCount = '',
    placeholderText = 'Select an option',
    selectAllRenderText = 'All employees',
    selectAllRenderCheckBoxText = 'All employee',
    IconComponent = null,
    showPlaceHolder = true,
    colorMap = {},
    autoScrollToValue = null,
    allowSelectAll = true,
    isGrouped = false,
    error = false,
    helperText = '',
    fontColor = '#545454',
    wrapperSx = {},
    ...props
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const itemRefs = useRef<Record<string | number, HTMLLIElement | null>>({});

    useEffect(() => {
        if (menuOpen && autoScrollToValue && !value) {
            setTimeout(() => {
                const targetRef = itemRefs.current[autoScrollToValue];
                if (targetRef?.scrollIntoView) {
                    targetRef.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }, 100);
        }
    }, [menuOpen, autoScrollToValue, value]);

    const renderMultiValue = (selected: (string | number)[]) => {
        if (showAllValues) {
            return selected.map((val) => options.find((opt) => opt.value === val)?.label || '').join(', ');
        }

        if (options.length === selected.length) {
            return selectAllRenderText;
        }

        if (selected.length === 1) {
            return options.find((opt) => opt.value === selected[0])?.label;
        }

        return `${selected.length} ${TextToDisplayWithCount}`;
    };

    return (
        <FormControl error={error} sx={{ width: '100%', ...wrapperSx }}>
            <Select
                disabled={disabled}
                defaultValue={defaultValue}
                id={id ?? undefined}
                name={id ?? undefined}
                value={value}
                multiple={isMultiSelect}
                IconComponent={IconComponent ?? KeyboardArrowDownIcon}
                onChange={(e) => onChange(e)}
                onOpen={() => setMenuOpen(true)}
                onClose={() => setMenuOpen(false)}
                MenuProps={{
                    autoFocus: !!autoScrollToValue,
                    PaperProps: {
                        sx: {
                            backgroundColor: '#fff',
                            color: '#A0A0A0',
                            maxHeight: '300px',
                            overflowY: 'auto',
                        },
                    },
                }}
                displayEmpty
                renderValue={(selected: typeof value) => {
                    if ((Array.isArray(selected) && selected.length === 0) || (!selected && showPlaceHolder)) {
                        return <Typography variant="body2">{placeholderText}</Typography>;
                    }

                    if (Array.isArray(selected)) {
                        return renderMultiValue(selected);
                    }

                    const selectedOption = options.find((opt) => opt.value === selected);
                    const selectedColor = selected != null ? colorMap[selected] : undefined;

                    return (
                        <Typography style={{ color: selectedColor, fontSize: '17px' }}>
                            {selectedOption?.label || ''}
                        </Typography>
                    );
                }}
                {...props}
                sx={{
                    height: 40,
                    fontSize: '0.85rem',
                    backgroundColor: backgroundColor,
                    borderRadius: borderRadius,
                    border: `${borderThickness} solid ${borderColor}`,
                    '& .MuiMenuItem-root': {
                        fontWeight: fontWeight,
                    },
                    '& .MuiTypography-root': {
                        fontWeight: fontWeight,
                    },
                    '& .MuiSelect-select': {
                        color: fontColor,
                        fontSize: fontSize,
                        fontWeight: fontWeight,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: borderColor,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: borderColor,
                    },
                    '& .MuiSelect-icon': {
                        color: disabled ? '#d0d0d0' : '#000',
                    },
                    ...sx,
                }}
            >
                {!value && showPlaceHolder && (
                    <MenuItem disabled value="">
                        <Typography variant="body1">{placeholderText || 'Select an option'}</Typography>
                    </MenuItem>
                )}

                {isMultiSelect && allowSelectAll && (
                    <MenuItem
                        value={0}
                        sx={{
                            p: padding,
                            color: '#545454',
                            fontSize: '15px',
                            fontWeight: 400,
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                            },
                        }}
                    >
                        <POSCheckbox
                            onClick={() => {}}
                            checked={Array.isArray(value) && value.length === options.length}
                        />
                        {selectAllRenderCheckBoxText}
                    </MenuItem>
                )}

                {!isGrouped &&
                    options.map((option, index) => (
                        <MenuItem
                            key={index}
                            value={option.value}
                            disabled={option.disabled}
                            ref={(el) => {
                                itemRefs.current[option.value] = el;
                            }}
                            sx={{
                                p: padding,
                                color: option.disabled ? '#B0B0B0' : '#545454',
                                fontSize: '15px',
                                fontWeight: 400,
                                '&:hover': {
                                    backgroundColor: option.disabled ? 'transparent' : '#f5f5f5',
                                },
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="flex-start">
                                {isMultiSelect && !disabled && (
                                    <POSCheckbox
                                        onClick={() => {}}
                                        checked={Array.isArray(value) && value.includes(option.value)}
                                    />
                                )}
                                <Typography color={colorMap[option.value]} variant="body1">
                                    {option.label}
                                </Typography>
                            </Stack>
                        </MenuItem>
                    ))}

                {isGrouped &&
                    options.map((option, index) => (
                        <MenuItem key={index} value={option.value} disabled={option.disabled}>
                            <Typography variant="body1">{option.label}</Typography>
                        </MenuItem>
                    ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
};

export default POSSelect;
