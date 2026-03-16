import React from 'react';
import { Select, MenuItem, Stack, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CustomCheckbox from '../../../commonComponents/F_Checkbox';

const FPersonalSelect = ({
  id,
  value,
  defaultValue,
  onChange,
  options,
  disabled,
  sx,
  size = 'small',
  fontWeight = 400,
  borderColor = '#D9D9D9',
  borderRadius = '13px',
  borderThickness = '1px',
  backgroundColor = 'transparent',
  isMultiSelect = false, // Add this new prop
  padding = 'auto',
  showAllValues = false,
  TextToDisplayWithCount = '',
  placeholderText = 'Select an option',
  selectAllRenderText = 'All employees',
  selectAllRenderCheckBoxText = 'All employee',
  IconComponent = null,
  showPlaceHolder = true,
  ...props
}) => {


  return (
    <Select
      disabled={disabled}
      defaultValue={defaultValue}
      id={id ?? null}
      name={id ?? null}
      value={value}
      IconComponent={IconComponent ?? KeyboardArrowDownIcon}
      onChange={onChange}
      multiple={isMultiSelect}
      MenuProps={{
        autoFocus: false,
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
      renderValue={(selected) => {
        // Show placeholder text when value is undefined or empty
        if (selected?.length === 0 || !selected && showPlaceHolder) {
          return <Typography variant="body1" sx={{fontSize: '15px',}}>{placeholderText}</Typography>;
        }

        if (isMultiSelect) {
          if (showAllValues) {
            return selected?.map((selectedValue) => {
              const option = options?.find((option) => option?.value === selectedValue);
              return option ? option.label : '';
            }).join(', ');
          } else {
            if (options?.length == selected?.length) {
              return selectAllRenderText;
            } else if (selected?.length === 1) {
              return options.find((option) => option?.value === selected[0])?.label;
            }
            return `${selected?.length} ${TextToDisplayWithCount}`;
          }
        }

        const selectedOption = options?.find((option) => option.value === selected);
        return selectedOption ? selectedOption.label : '';
      }}
      {...props}
      sx={{
        height: 40,
      
        backgroundColor: backgroundColor,
        borderRadius: borderRadius,
        border: `${borderThickness} solid ${borderColor}`,
        '& .MuiMenuItem-root': {
          fontWeight: fontWeight, // Adjust font weight of the option labels here
        },
        '& .MuiTypography-root': {
          fontWeight: fontWeight, // Adjust the font weight for typography text if needed
        },
        '& .MuiSelect-select': {
          color: '#545454',
          fontSize: '15px',
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
          color: '#000',
        },
        ...sx,
      }}
    >
      {/* Display placeholder option when no value is selected */}
      {!value && showPlaceHolder && <MenuItem disabled value=""><Typography variant='body2'>{placeholderText || 'Select an option'}</Typography ></MenuItem>}

      {isMultiSelect && (
        <MenuItem
          sx={{
            p: padding,
            color: '#545454',
            fontSize: '15px',
            fontWeight: 400,
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }} value={0}>
          <CustomCheckbox checked={value?.length === options?.length} /> {selectAllRenderCheckBoxText}
        </MenuItem>
      )}
      {options?.map((option, index) => (
        <MenuItem
          key={index}
          value={option.value}
          disabled={option.disabled}
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
          <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'flex-start'}>
            {isMultiSelect && !disabled && (
              <CustomCheckbox checked={value?.includes(option?.value)} />
            )}
            <Typography variant='body1'>
              {option.label}

            </Typography>
          </Stack>
        </MenuItem>
      ))}
    </Select>

  );
}

export default FPersonalSelect;