import React, { useState, useRef, useEffect } from 'react';
import { Select, MenuItem, Stack, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CustomCheckbox from './F_Checkbox';
import * as Sentry from '@sentry/react';

const TimeSlotSelect = ({
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
    storeId = null, // For Sentry logging
    ...props
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const itemRefs = useRef({});
    const shouldLog = storeId === 523 || storeId === 526;

    // Scroll to selected value after menu opens with improved safety
    useEffect(() => {
        if (menuOpen && autoScrollToValue && !value) {
            const timeoutId = setTimeout(() => {
                try {
                    const targetRef = itemRefs.current[autoScrollToValue];
                    if (targetRef && typeof targetRef.scrollIntoView === 'function') {
                        // Check if element is still in DOM
                        if (targetRef.isConnected) {
                            targetRef.scrollIntoView({ block: 'center', behavior: 'smooth' });
                        }
                    }
                } catch (error) {
                    console.warn('Auto-scroll failed:', error);
                }
            }, 150); // Slightly longer delay for better stability

            return () => clearTimeout(timeoutId);
        }
    }, [menuOpen, autoScrollToValue, value]);

    // Cleanup refs when options change to prevent stale references
    useEffect(() => {
        const currentOptionValues = options?.map((opt) => opt.value) || [];
        const refKeys = Object.keys(itemRefs.current);

        // Remove refs for options that no longer exist
        refKeys.forEach((key) => {
            if (!currentOptionValues.includes(key)) {
                delete itemRefs.current[key];
            }
        });
    }, [options]);

    // Log options when they change (for debugging)
    useEffect(() => {
        if (shouldLog && options?.length > 0) {
            Sentry.logger.info(`[${storeId}] TimeSlotSelect options updated`, {
                optionsCount: options.length,
                firstOption: options[0],
                optionsStructure: options.map((opt) => ({
                    hasValue: !!opt.value,
                    hasLabel: !!opt.label,
                    hasKey: !!opt.key,
                    hasStyling: !!opt.styling,
                    labelType: typeof opt.label,
                })),
            });
        }
    }, [options, shouldLog, storeId]);

    return (
        <Select
            disabled={disabled}
            defaultValue={defaultValue}
            id={id ?? null}
            name={id ?? null}
            value={value}
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
                if ((Array.isArray(selected) && selected.length === 0) || (!selected && showPlaceHolder)) {
                    return <Typography variant="body2">{placeholderText}</Typography>;
                }

                if (isMultiSelect) {
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

            {options?.map((option, index) => {
                // Validate option structure first
                if (!option || typeof option !== 'object') {
                    if (shouldLog) {
                        Sentry.logger.warn(`[${storeId}] TimeSlotSelect: Invalid option at index ${index}`, {
                            option,
                            optionType: typeof option,
                        });
                    }
                    console.warn(`TimeSlotSelect: Invalid option at index ${index}:`, option);
                    return null;
                }

                if (!option.value && !option.label) {
                    if (shouldLog) {
                        Sentry.logger.warn(`[${storeId}] TimeSlotSelect: Option missing value and label`, {
                            option,
                            index,
                        });
                    }
                    console.warn(`TimeSlotSelect: Option at index ${index} missing value and label:`, option);
                    return null;
                }

                try {
                    // Use stable key if provided, otherwise fallback to index
                    const stableKey = option.key || `timeslot-${option.value || index}-${index}`;

                    // Log rendering for debugging (only for first few time slot options)
                    if (shouldLog && option.value && option.value.includes(' - ') && index < 3) {
                        Sentry.logger.info(`[${storeId}] TimeSlotSelect rendering option ${index}`, {
                            value: option.value,
                            label: option.label,
                            key: stableKey,
                            hasStyling: !!option.styling,
                            stylingColor: option.styling?.color,
                            disabled: option.disabled,
                        });
                    }

                    return (
                        <MenuItem
                            key={stableKey}
                            value={option.value || option.label || `fallback-${index}`}
                            disabled={option.disabled || false}
                            ref={(el) => {
                                try {
                                    if (el && option.value) {
                                        itemRefs.current[option.value] = el;
                                    } else if (!el && option.value) {
                                        // Clean up ref when component unmounts
                                        delete itemRefs.current[option.value];
                                    }
                                } catch (refError) {
                                    if (shouldLog) {
                                        Sentry.logger.error(`[${storeId}] TimeSlotSelect ref error`, {
                                            error: refError.message,
                                            optionValue: option.value,
                                        });
                                    }
                                    console.error('Error managing ref for option:', option.value, refError);
                                }
                            }}
                            sx={{
                                p: padding,
                                color: option.disabled ? '#B0B0B0' : fontColor,
                                fontSize: '15px',
                                fontWeight: 400,
                                '&:hover': {
                                    backgroundColor: option.disabled ? 'transparent' : '#f5f5f5',
                                },
                            }}
                        >
                            <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'flex-start'}>
                                {isMultiSelect && !disabled && (
                                    <CustomCheckbox checked={value?.includes(option?.value)} />
                                )}
                                <Typography
                                    color={colorMap[option?.value] || option?.styling?.color || fontColor}
                                    variant={option?.styling?.variant || 'body1'}
                                    fontWeight={option?.styling?.fontWeight || 400}
                                    sx={{
                                        textDecoration: option?.styling?.textDecoration || 'none',
                                    }}
                                >
                                    {option.label || option.value || `Time Slot ${index}`}
                                </Typography>
                            </Stack>
                        </MenuItem>
                    );
                } catch (renderError) {
                    if (shouldLog) {
                        Sentry.logger.error(`[${storeId}] TimeSlotSelect: Critical error rendering option ${index}`, {
                            error: renderError.message,
                            errorStack: renderError.stack,
                            option: option,
                            optionType: typeof option,
                            optionKeys: option ? Object.keys(option) : 'null',
                        });
                    }
                    console.error(`TimeSlotSelect: Critical error rendering option ${index}:`, {
                        error: renderError.message,
                        errorStack: renderError.stack,
                        option: option,
                        optionType: typeof option,
                        optionKeys: option ? Object.keys(option) : 'null',
                    });

                    // Only show error fallback for critical errors, not validation issues
                    if (
                        renderError.message.includes('Cannot read property') ||
                        renderError.message.includes('is not a function') ||
                        renderError.message.includes('Cannot access')
                    ) {
                        return (
                            <MenuItem
                                key={`error-${index}`}
                                value={`error-${index}`}
                                disabled={true}
                                sx={{
                                    p: padding,
                                    color: '#B0B0B0',
                                    fontSize: '15px',
                                    fontWeight: 400,
                                }}
                            >
                                <Typography color="#B0B0B0" variant="body2">
                                    Error loading time slot
                                </Typography>
                            </MenuItem>
                        );
                    }

                    // For other errors, try to render with safe defaults
                    return (
                        <MenuItem
                            key={`safe-${index}`}
                            value={option.value || `safe-${index}`}
                            disabled={true}
                            sx={{
                                p: padding,
                                color: '#B0B0B0',
                                fontSize: '15px',
                                fontWeight: 400,
                            }}
                        >
                            <Typography color="#B0B0B0" variant="body2">
                                {option.label || option.value || `Time Slot ${index}`}
                            </Typography>
                        </MenuItem>
                    );
                }
            })}
        </Select>
    );
};

export default TimeSlotSelect;
