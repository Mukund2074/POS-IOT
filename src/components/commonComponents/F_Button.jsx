import { Button, createTheme, ThemeProvider, Typography } from "@mui/material";

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 20px",
          textTransform: "none",
          opacity: "0px",
          borderRadius: "25px",
        },
      },
      variants: [
        {
          props: { variant: "delete" },
          style: {
            backgroundColor: "#C74141",
            fontWeight: 700,
            color: "white",
          },
        },
        {
          props: { variant: "save" },
          style: {
            backgroundColor: "#44B904",
            fontWeight: 700,
            color: "white",
          },
        },
        {
          props: { variant: "f_outline" },
          style: {
            border: "1px solid #a79c92",
            fontWeight: 700,

            color: "#BBB0A4",
            backgroundColor: "#fff",
          },
        },
      ],
    },
  },
});

const FButton = ({
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
}) => {
  return (
    <ThemeProvider theme={theme}>
      <Button
        disableRipple
        variant={variant}
        type={type}
        fullWidth={"160px"}
        style={{
          ...style,
          border: border,
        }}
        // style={style}
        height={height || "52px"}
        className={className}
        width={width || "257px"}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        sx={sx}
        {...props}
      >
        <Typography
          // noWrap
          variant={btnVar ? btnVar : "body1"}
          // noWrap
          sx={{
            fontWeight: titleWeight || 700,
            paddingLeft: 2,
            paddingRight: 2,
            color: titleColor,
            fontSize: titleSize || "14px",
            ...titlesx
          }}
        >
          {icon && <span style={{ marginRight: "10px" }}><img src={icon} alt="icon" /></span>}
          {title || "Custom Button"}
        </Typography>
      </Button>
    </ThemeProvider>
  );
};

export default FButton;
