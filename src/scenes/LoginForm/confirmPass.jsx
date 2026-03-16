import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import lock from "../../assets/lock.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { t } from "i18next";
import { resetPasswordApi } from "../../utils/Api/Authantication";
import { HttpStatusCode } from "axios";

const ConfirmPass = ({ backButton, handleResBack, handleResetPass, token }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIspending] = useState(false)

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object({
    password: Yup.string().required("Password is required"),
    confirm_password: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirm_password: "", // Fixed the key name
    },
    validationSchema, // Fixed incorrect assignment
    onSubmit: async (values) => {
      try {
        setIspending(true)
        const response = await resetPasswordApi({ token, password: values.password });
        if (response.status === HttpStatusCode.Ok) {
          toast.success("Password updated  successfully");
          handleResetPass();
        }
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setIspending(false)
      }
    },
  });

  return (
    <Box
      noValidate
      component={"form"}
      sx={{
        width: "90%", // Makes it responsive
        maxWidth: "500px", // Limits max width for larger screens
        minWidth: "320px", // Ensures it doesn't shrink too much
        // height: "65%",
        backgroundColor: "white",
        borderRadius: "25px",
        display: "flex",
        flexDirection: "column",
        padding: "20px 30px",
        paddingBottom: "0px",
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
        }}
      >
        <IconButton
          aria-label="close"
          disableRipple
          sx={{
            position: "absolute",
            left: { xs: -8, md: 5 },

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
          {t("Common.ResPassConfT")}
        </Typography>
      </Stack>


      <Stack sx={{ width: "100%", px: { xs: 1, md: 9 }, mt: "20px" }}>
        <Typography variant="body2" color="#4B4B4B" textAlign="center">
          {t("Common.resConfD1")}
          <br />
          {t("Common.resConfD2")}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginTop: 5,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "5px",
          }}
        >
          <Stack
            component="img"
            src={lock}
            alt="call"
            sx={{ height: "17px" }}
          />
          <Typography fontSize="17px" fontWeight="400" color="#6F6F6F">
            {t("Common.NewPassP")}
          </Typography>
        </Box>


        <TextField
          id="password"
          type={showPassword ? "text" : "password"}
          variant="standard"
          placeholder={t("Common.NewPassP")}
          borderColor="#D9D9D9"
          placeholderFontSize="1rem"
          inputFontSize="1rem"
          size="small"
          borderThickness="1px"
          //   value={password.replace(/\s/g, "")}
          value={formik.values.password.replace(/\s/g, "")}
          onChange={(e) => {
            const { value } = e.target;
            formik.setFieldValue("password", value);
          }}
          InputProps={{
            disableUnderline: true,
            style: {
              width: "100%",
              backgroundColor: "transparent",
              paddingLeft: 20,
              fontSize: "16px",
            },
            endAdornment: (
              <InputAdornment position="end" sx={{ marginRight: "10px" }}>
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            width: "100%",
            "& input": { outline: "none" },
            border: "1px solid #D9D9D9",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        />
        {formik.touched.password && formik.errors.password && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" color="red">
              {formik.errors.password}
            </Typography>
          </Box>
        )}

      </Box>

      {/* Confirm Password Input */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginTop: "20px",
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "5px",
          }}
        >
          <Stack
            component="img"
            src={lock}
            alt="lock"
            sx={{ height: "17px" }}
          />
          <Typography fontSize="16px" fontWeight="400" color="#6F6F6F">
            {t("Common.ConfPassp")}
          </Typography>
        </Box>

        <TextField
          id="confirm_password"
          type={showConfirmPassword ? "text" : "password"}
          variant="standard"
          placeholder={t("Common.ConfPassp")}
          borderColor="#D9D9D9"
          placeholderFontSize="1rem"
          inputFontSize="1rem"
          size="small"
          borderThickness="1px"
          value={formik.values.confirm_password.replace(/\s/g, "")}
          onChange={(e) =>
            formik.setFieldValue(
              "confirm_password",
              e.target.value.replace(/\s/g, "")
            )
          }
          InputProps={{
            disableUnderline: true,
            style: {
              width: "100%",
              backgroundColor: "transparent",
              paddingLeft: 20,
              fontSize: "16px",
            },
            endAdornment: (
              <InputAdornment position="end" sx={{ marginRight: "10px" }}>
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            width: "100%",
            "& input": { outline: "none" },
            border: "1px solid #D9D9D9",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        />
        {formik.touched.confirm_password && formik.errors.confirm_password && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" color="red">
              {formik.errors.confirm_password}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Login Button */}
      <Button
        loading={isPending}
        type="submit"
        onClick={formik.handleSubmit}
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: "210px" },
          borderRadius: "25px",
          height: "40px",
          my: 3,
          fontSize: "17px",
          fontWeight: "400",
          color: "white",
          backgroundColor: "#BBB0A4",
          textTransform: "capitalize",
          "&:hover": { backgroundColor: "#9C968B" },
        }}
      >
        {t("Common.ResOTpSubBTN")}
      </Button>
    </Box>
  );
};

export default ConfirmPass;
