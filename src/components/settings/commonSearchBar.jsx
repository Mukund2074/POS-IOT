import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '../../assets/searchIcon20.png';
import { t } from 'i18next';

const CustomSearchBar = ({ value, onChange, width, height, placeholder, onSearch, bgColor }) => {

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(value);
        }
    };

    return (
        <TextField
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `${t("Common.Search")}...`}
            variant="outlined"
            size="small"
            sx={{
                border: `1px solid #A79C92`,
                '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: `1px solid #A79C92`
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: `1px solid #A79C92`
                },
                '& input': {
                    color: 'black',
                    fontSize: '1rem',
                },
                '& input::placeholder': {
                    color: '#747474',
                    fontSize: '1rem',
                    opacity: 1,
                },
                width: width || { xs: '80%', md: '100%' },
                height: height,
                backgroundColor: bgColor || 'white',
                borderRadius: '10px',
                mt: 1.5,
            }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <img
                            src={SearchIcon}
                            alt="search icon"
                            style={{ width: '20px', height: '20px' }}
                        />
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default CustomSearchBar;
