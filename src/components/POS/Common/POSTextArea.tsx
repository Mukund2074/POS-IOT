import React from "react";
import {
    TextField,
    InputAdornment,
    Button,
    TextFieldProps,
} from "@mui/material";
import { FileCopy } from "@mui/icons-material";

interface POSTextAreaProps extends Omit<TextFieldProps, "onChange"> {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    width?: string | object;
    id?: string;
    showCopyButton?: boolean;
    bgColor?: string;
    height?: string | number;
    readOnly?: boolean;
    mt?: number | string;
    ml?: number | string;
    borderRadius?: string;
    handleCopy?: () => void;
    name?: string;
    error?: boolean;
    helperText?: React.ReactNode;
    fontColor?: string;
    placeholder?: string;
    disabled?: boolean;
    borderColor?: string;
    placeholderFontSize?: string;
    inputFontSize?: string;
    size?: "small" | "medium";
    borderThickness?: string;
    rows?: number;
    maxLength?: number;
    sx?: object;
}

const POSTextArea: React.FC<POSTextAreaProps> = ({
    value,
    onChange,
    width,
    id,
    showCopyButton,
    bgColor,
    height,
    readOnly,
    mt,
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
    rows = 4,
    maxLength,
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
            error={error}
            helperText={helperText}
            size={size}
            multiline
            rows={rows}
            InputProps={{
                readOnly,
                endAdornment: showCopyButton && handleCopy && (
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
                maxLength: maxLength,
            }}
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
                    resize: "none",
                    scrollbarWidth: "none",
                },
                "& input::placeholder": {
                    color: "#747474",
                    fontSize: placeholderFontSize,
                    opacity: 1,
                },
                width: width || { xs: "100%", md: "100%" },
                height: height || "auto",
                backgroundColor: bgColor || "white",
                borderRadius: borderRadius,
                mt: typeof mt === "number" ? mt : mt || 0,
                ml: typeof ml === "number" ? ml : ml || 0,
                ...sx,
            }}
            {...props}
        />
    );
};

export default POSTextArea;
