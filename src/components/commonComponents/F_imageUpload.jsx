import { Button, Typography } from "@mui/material";
import React from "react";
import upload from "../../assets/Group.png";
import FButton from "./F_Button";
import { max } from "date-fns";
import { t } from "i18next";

const FimageUpload = ({ formik, setter, id, field , handleFileRemove }) => {
  const read = (file) => {
    if (file) {
      var reader = new FileReader();
      reader.onloadend = function () {
        setter([reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="image-upload-container"
      style={{ marginTop: 0, mb: 0, marginLeft: "20px" }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            formik.setFieldValue(`${id}`, file);
            setter(file);
          }
        }}
        id={id} // Use dynamic id correctly
        className="d-none"
      />
      <label htmlFor={id} className="image-upload-label">
        <div
          className="image-upload-icon"
          style={{ padding: 0, marginBottom: 0, height: 80, width: "100%" }}
        >
          {formik.values[id] ? (
            <img
              src={
                typeof formik.values[id] === "string"
                  ? `${process.env.REACT_APP_IMG_URL}${formik.values[id]}`
                  : URL.createObjectURL(formik.values[id])
              }
              alt="Upload"
              style={{
                height: 80,
                maxHeight: 80,
                maxWidth:80,
                objectFit: "contain",
              }}
            />
          ) : (
            <img src={field || upload} alt="Upload" style={{ width: 38 }} />
          )}
        </div>

        <Typography variant="caption" sx={{ color: "#6F6F6F" }}>
          {formik.values[id]
            ? formik.values[id]?.name
            : t("Setting.UploadEmployeeImage")}
        </Typography>
      </label>

      <FButton
        variant="save"
        btnVar={"p"}
        className="upload-button"
        disableTouchRipple
        disableElevation
        sx={{
          borderRadius: "12px",
          opacity: "0px",
          height: 30,
          maxWidth: 100,
          textTransform: "capitalize",

          color: "#BBB0A4",
          backgroundColor: " rgba(111, 111, 111, 0.20)",
          ml: 2,
        }}
        title={t("Common.Upload")}
        onClick={() => document.getElementById(id).click()}
      />

      <FButton
        variant="save"
        btnVar={"p"}
        className="upload-button"
        disableTouchRipple
        disableElevation
        sx={{
          borderRadius: "12px",
          opacity: "0px",
          height: 30,
          maxWidth: 100,
          textTransform: "capitalize",

          color: "#BBB0A4",
          backgroundColor: " rgba(111, 111, 111, 0.20)",
          ml: 2,
        }}
        title={t("Common.Remove")}
        onClick={handleFileRemove}
      />
    </div>
  );
};

export default FimageUpload;
