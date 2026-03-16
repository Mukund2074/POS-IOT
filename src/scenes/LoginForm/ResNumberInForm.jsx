import { Box, Button, IconButton, InputAdornment, Stack, Typography } from "@mui/material";
import CustomTextField from "../../components/settings/commonTextinput";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useState } from "react";
import call from "../../assets/call.jpg";
import { t } from "i18next";

const ResNumberInForm = ({ handleResetPass, OTPSending, phone, setPhoneNumber, backButton, handleResBack }) => {
  const [isPending, setIspending] = useState(false);
  const validationSchema = Yup.object({

    phone: Yup.string()
      .required("Please enter mobile number")
      .min(8, "Must be exactly 8 digits")
      .max(8)
      .typeError("Please enter valid mobile number"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      phone: `${phone}`,
    },

    validationSchema: validationSchema,
    onSubmit: async (values) => {

      // Handle form submission here

      const success = await OTPSending({ setter: setIspending, phoneNumber: values.phone });
      if (success) {
        setIspending(false);

        setPhoneNumber(values.phone);
        formik.setFieldValue("phone", "");
        handleResetPass();
      }
      setIspending(false);

    },
  });



  const formatPhoneNumber = (number) => {
    if (number !== "") {
      return number.replace(/(\d{2})(?=\d)/g, "$1 ");
    } else {
      return "";
    }
  };

  const handlePhoneNumberChange = async (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");

    // if (!/^\d*$/.test(value) || value.length > 8) {
    //   setError("Only numbers are allowed, with a maximum of 8 digits.");
    //   return;
    // }
    formik.setFieldValue("phone", value);
  };
  return (
    <Box
      component={"form"}
      noValidate
      sx={{
        width: "100%", // Makes it responsive
        maxWidth: "600px", // Limits max width for larger screens
        minWidth: "320px", // Ensures it doesn't shrink too much
        // height: "41.5%",

        backgroundColor: "white",
        borderRadius: "25px",
        display: "flex",
        flexDirection: "column",
        padding: "10px 30px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Adds subtle shadow
        alignItems: "center", // Centers content
      }}
    >
      <Stack
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          position: "relative",
          mt: 2
        }}
      >
        <IconButton
          aria-label="close"
          disableRipple
          sx={{
            position: "absolute",
            left: 8,

            color: "#6f6f6f",
          }}
          onClick={handleResBack}
        >
          <img src={backButton} alt="Back" />
        </IconButton>

        <Typography
          sx={{
            fontSize: "25px",
            fontWeight: "400",
            color: "#6F6F6F",
            textAlign: "center",
          }}
        >
          {t("Common.LogForPass")}
        </Typography>
      </Stack>

      <Stack sx={{ width: "100%", height: "100%", mt: "20px" }}>

        {/* Phone Number Input */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            px: { xs: 1, md: 7 }
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "5px",

            }}
          >
            <Stack
              component="img"
              src={call}
              alt="call"
              sx={{ height: "17px" }}
            />
            <Typography fontSize="17px" fontWeight="400" color="#6F6F6F">
              {t("Common.LoginMNummEnt")}
            </Typography>
          </Box>

          <CustomTextField
            id="phone"
            sx={{
              width: { xs: '100%', md: 'auto' }
            }}
            value={formatPhoneNumber(formik?.values?.phone)}
            inputProps={{ maxLength: 11 }}
            onChange={handlePhoneNumberChange}
            placeholder={"00 00 00 00"}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ color: "#1f1f1f", marginRight: 1 }}>
                      +45
                    </Typography>
                  </InputAdornment>
                ),
              },
            }}
            onBlur={() => formik.setFieldTouched("phone", true)}
          />
          {formik.touched.phone && formik.errors.phone && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="red">
                {formik.errors.phone}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Login Button */}
        <Button
          loading={isPending}
          type="submit"
          disabled={isPending}
          sx={{
            width: "100%",
            maxWidth: { xs: '100%', md: "210px" },
            borderRadius: "25px",
            height: "40px",
            my: 3,
            mx: "auto",
            // my: "auto",
            fontSize: "17px",
            fontWeight: "400",
            color: "white",
            backgroundColor: "#BBB0A4",
            textTransform: "capitalize",
            "&:hover": { backgroundColor: "#9C968B" },

          }}
          onClick={formik.handleSubmit}
        >
          {/* {isPending ? <CircularProgress size={24} color="inherit" /> : "Næste"}  */}
          {t("Common.LogNext")}
        </Button>
      </Stack>

      {/* Forgot Password */}
    </Box>
  )
}

export default ResNumberInForm