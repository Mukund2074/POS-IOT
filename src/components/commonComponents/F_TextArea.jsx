import React from "react";
import { TextField, InputAdornment, Button } from "@mui/material";
import { FileCopy } from "@mui/icons-material";

const FTextArea = ({
    minRows,
    maxRows,
    value,
    onChange,
    width,
    id,
    showCopyButton,
    bgColor,
    height,
    readOnly,
    mt = 1.5,
    ml,
    borderRadius = "10px",
    handleCopy,
    name,
    error,
    helperText,
    fontColor = "black",
    placeholder,
    disabled = false,
    borderColor = "#D9D9D9",
    placeholderFontSize = "1rem",
    inputFontSize = "1rem",
    size = "small",
    borderThickness = "1px",
    sx,
    rows = minRows && maxRows ? undefined : 4,
    maxLength, // Max length for text input
    // inputMode = "text", // Input mode for better mobile experience
    ...props
}) => {
    return (
        <TextField
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            variant="outlined"
            disabled={disabled}
            readOnly={readOnly}
            error={error}
            helperText={helperText}
            size={size}
            multiline
            rows={rows}
            minRows={minRows}
            maxRows={maxRows}
            {...props}
            sx={{
                border: `${borderThickness} solid ${borderColor}`,
                "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: `${borderThickness} solid ${borderColor}`,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: `${borderThickness} solid ${borderColor}`,
                },
                "& textarea": {
                    color: fontColor,
                    fontSize: inputFontSize,
                    resize: "none",  // Prevent resizing the textarea
                    scrollbarWidth: "none",  // Hide the scrollbar in Firefox
                },
                "& input::placeholder": {
                    color: "#747474",
                    fontSize: placeholderFontSize,
                    opacity: 1,
                },
                width: width || { xs: "100%", md: "100%" },
                height: height || "auto",
                backgroundColor: bgColor ? bgColor : "white",
                borderRadius: borderRadius,
                mt: mt,
                ml: ml,
                ...sx,
            }}
            InputProps={{
                endAdornment: showCopyButton && (
                    <InputAdornment position="end">
                        <Button
                            onClick={handleCopy}
                            sx={{
                                padding: 0,
                                minWidth: "auto",
                            }}
                        >
                            <FileCopy sx={{ color: "#8E8E8E", height: "17px" }} />
                        </Button>
                    </InputAdornment>
                ),
            }}
            inputProps={{
                maxLength: maxLength, // Max character limit
                // inputMode: inputMode, // Additional input props like inputMode
            }}
        />
    );
};

export default FTextArea;
