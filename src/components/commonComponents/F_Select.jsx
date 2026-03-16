import React, { useState, useRef, useEffect } from 'react';
import { Select, MenuItem, Stack, Typography, FormControl, Box } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CustomCheckbox from './F_Checkbox';

const FSelect = ({
    componentKey,
    id,
    value,
    defaultValue,
    onChange,
    options,
    disabled,
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
    autoScrollToValue = false,
    allowSelectAll = true,
    fontColor = '#545454',
    useNativeSelect = false, // New prop to control native select
    ...props
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const itemRefs = useRef({});

    // Detect if it's actually a mobile device (works even in desktop site mode)
    useEffect(() => {
        const checkMobileDevice = () => {
            // Check for touch capabilities and screen characteristics
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const hasOrientation = 'orientation' in window;
            const hasViewport = 'visualViewport' in window;

            // Check for mobile-specific features that persist even in desktop mode
            const isMobileLike = hasTouch && (hasOrientation || hasViewport);

            // Check for mobile-specific CSS media queries
            const isMobileMedia =
                window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches;

            // Also check user agent as fallback
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

            // Consider it mobile if it has mobile-like capabilities, media query, OR mobile user agent
            setIsMobileDevice(isMobileLike || isMobileMedia || isMobileUA);
        };

        checkMobileDevice();
    }, []);

    // Scroll to selected value after menu opens
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

    // Native select for mobile devices only
    const renderNativeSelect = () => {
        if (!isMobileDevice) return null;

        // Handle multi-select for native select
        const handleNativeChange = (e) => {
            if (isMultiSelect) {
                const selectedValues = Array.from(e.target.selectedOptions)
                    .map((option) => option.value)
                    .filter((value) => value !== null && value !== undefined && value !== '');

                // Handle "Select All" option (value="0")
                if (selectedValues.includes('0')) {
                    if (selectedValues.length === 1 && selectedValues[0] === '0') {
                        // Only "Select All" is selected, select all options
                        const allValues =
                            options && Array.isArray(options)
                                ? options.map((opt) => opt.value).filter((val) => val !== null && val !== undefined)
                                : [];
                        const syntheticEvent = {
                            target: {
                                value: allValues,
                                name: id,
                            },
                        };
                        onChange(syntheticEvent);
                        return;
                    } else {
                        // "Select All" + other options selected, remove "Select All" and keep others
                        const filteredValues = selectedValues.filter((val) => val !== '0');
                        const syntheticEvent = {
                            target: {
                                value: filteredValues,
                                name: id,
                            },
                        };
                        onChange(syntheticEvent);
                        return;
                    }
                }

                // Create a synthetic event that matches Material-UI's expected format
                const syntheticEvent = {
                    target: {
                        value: selectedValues.length > 0 ? selectedValues : [],
                        name: id,
                    },
                };
                onChange(syntheticEvent);
            } else {
                onChange(e);
            }
        };

        return (
            <Box
                sx={{
                    // Apply sx styles (margins, paddings, etc.)
                    ...sx,
                    // Prevent screen swiping and zoom
                    touchAction: 'manipulation',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <FormControl fullWidth>
                    <select
                        id={id}
                        key={componentKey}
                        name={id}
                        value={isMultiSelect ? (Array.isArray(value) ? value[0] || '' : '') : value || ''}
                        onChange={handleNativeChange}
                        disabled={disabled}
                        multiple={isMultiSelect}
                        size={
                            isMultiSelect
                                ? Math.min(options?.length + (showPlaceHolder ? 1 : 0) + (allowSelectAll ? 1 : 0), 8)
                                : 1
                        }
                        style={{
                            width: '100%',
                            height: isMultiSelect ? 'auto' : '40px',
                            minHeight: isMultiSelect ? '120px' : '40px',
                            fontSize: '16px',
                            padding: '8px 12px',
                            border: `${borderThickness} solid ${borderColor}`,
                            borderRadius: borderRadius,
                            backgroundColor: backgroundColor,
                            color: fontColor,
                            outline: 'none',
                            appearance: 'none',
                            backgroundImage: isMultiSelect
                                ? 'none'
                                : `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            backgroundSize: '16px',
                            paddingRight: isMultiSelect ? '12px' : '40px',
                            // Prevent zoom and swiping on mobile
                            touchAction: 'manipulation',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                            // Ensure proper mobile behavior
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                        }}
                    >
                        {showPlaceHolder && (
                            <option value="" disabled>
                                {placeholderText}
                            </option>
                        )}
                        {isMultiSelect && allowSelectAll && (
                            <option
                                value="0"
                                selected={isMultiSelect && Array.isArray(value) && value.length === options?.length}
                            >
                                {selectAllRenderCheckBoxText}
                            </option>
                        )}
                        {options?.map((option, index) => (
                            <option
                                key={index}
                                value={option.value}
                                disabled={option.disabled}
                                selected={isMultiSelect && Array.isArray(value) ? value.includes(option.value) : false}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </FormControl>
            </Box>
        );
    };

    // Return native select for mobile devices only if useNativeSelect prop is true
    if (isMobileDevice && useNativeSelect) {
        return renderNativeSelect();
    }

    return (
        <Select
            disabled={disabled}
            defaultValue={defaultValue}
            id={id ?? null}
            name={id ?? null}
            key={componentKey}
            value={isMultiSelect ? (Array.isArray(value) ? value : [value]) : value}
            multiple={isMultiSelect}
            IconComponent={IconComponent ?? KeyboardArrowDownIcon}
            onChange={onChange}
            onOpen={() => setMenuOpen(true)}
            onClose={() => setMenuOpen(false)}
            MenuProps={{
                autoFocus: autoScrollToValue,
                PaperProps: {
                    sx: {
                        backgroundColor: '#fff',
                        color: fontColor,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        ...props?.menuSx,
                    },
                },
            }}
            displayEmpty
            renderValue={(selected) => {
                // Handle multi-select case
                if (isMultiSelect) {
                    if (!Array.isArray(selected) || selected.length === 0) {
                        return <Typography variant="body2">{placeholderText}</Typography>;
                    }

                    if (showAllValues) {
                        return selected
                            ?.map((selectedValue) => {
                                const option = options?.find((option) => option?.value === selectedValue);
                                return option ? option.label : '';
                            })
                            .join(', ');
                    } else {
                        if (options?.length === selected?.length) {
                            return selectAllRenderText;
                        } else if (selected?.length === 1) {
                            return options.find((option) => option?.value === selected[0])?.label;
                        }
                        return `${selected?.length} ${TextToDisplayWithCount}`;
                    }
                }

                // Handle single select case
                if (!selected && showPlaceHolder) {
                    return <Typography variant="body2">{placeholderText}</Typography>;
                }

                const selectedOption = options?.find((option) => option.value === selected);
                const selectedLabel = selectedOption ? selectedOption.label : '';
                const selectedColor = colorMap[selected];

                return <Typography style={{ color: selectedColor, fontSize: '17px' }}>{selectedLabel}</Typography>;
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
                        color: fontColor,
                        fontSize: '15px',
                        fontWeight: 400,
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                        },
                    }}
                >
                    <CustomCheckbox checked={value?.length === options?.length} /> {selectAllRenderCheckBoxText}
                </MenuItem>
            )}

            {options?.map((option, index) => (
                <MenuItem
                    key={index}
                    value={option.value}
                    disabled={option.disabled}
                    ref={(el) => (itemRefs.current[option.value] = el)}
                    sx={{
                        p: padding,
                        color: option.disabled ? '#B0B0B0' : option?.styling?.color || fontColor,
                        fontSize: '15px',
                        fontWeight: option?.styling?.fontWeight || 400,
                        '&:hover': {
                            backgroundColor: option.disabled ? 'transparent' : '#f5f5f5',
                        },
                        textDecoration: option?.styling?.textDecoration || 'none',
                    }}
                >
                    <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'flex-start'}>
                        {isMultiSelect && !disabled && <CustomCheckbox checked={value?.includes(option?.value)} />}
                        <Typography
                            color={option?.styling?.color || colorMap[option?.value] || fontColor}
                            variant={option?.styling?.variant || 'body1'}
                            fontWeight={option?.styling?.fontWeight || 400}
                            textDecoration={option?.styling?.textDecoration || 'none'}
                        >
                            {option.label}
                        </Typography>
                    </Stack>
                </MenuItem>
            ))}
        </Select>
    );
};

export default FSelect;
