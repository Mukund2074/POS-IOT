import React from "react";
import { TextField, InputAdornment, Button } from "@mui/material";
import { FileCopy } from "@mui/icons-material";

const CustomTextField = ({
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
  // borderRadius = "10px",
  borderRadius = {},
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
  ...props
}) => {
  const {
    topLeft = "15px",
    topRight = "15px",
    bottomLeft = "15px",
    bottomRight = "15px"
  } = borderRadius;

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
        "& input": {
          color: fontColor,
          fontSize: inputFontSize,
        },
        "& input::placeholder": {
          color: "#747474",
          fontSize: placeholderFontSize,
          opacity: 1,
        },
        width: width || { xs: "100%", md: "100%" },
        height: height,
        backgroundColor: bgColor ? bgColor : "white",
        // borderRadius: borderRadius,
        borderRadius: `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`,
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
    />
  );
};

export default CustomTextField;
