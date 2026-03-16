import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import FButton from "../../../commonComponents/F_Button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import apiFetcher from "../../../../utils/interCeptor";
import FTextInput from "../../../commonComponents/F_TextInput";
import { toast } from "react-toastify";
import { t } from "i18next";

const modules = {
  toolbar: [
    // [{ font: ["Arial", "sans-serif"] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const formats = [
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "blockquote",
  "code-block",
  "list",
  "script",
  "indent",
  "direction",
  "align",
  "link",
  "image",
  "video",
];

export default function AddJournalGroupTemplate({
  open,
  onClose,
  val,
  groupID,
  setUSeTemplate,
}) {
  const [buttonLoader, setButtonLoader] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(() => {
        return t("Customer.JrYupTmpNmErr");
      })
      .matches(/^(?!\s*$).+/, t("Calendar.NameFieldError")),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      detail: val ? val : "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setButtonLoader(true);
      const payLoad = {
        name: values.name,
        advance: false,
        detail: values.detail,
        group_ids: (groupID === 0 || !groupID) ? [] : [groupID],
      };
      try {
        const response = await apiFetcher.post(
          `api/v1/store/journal/template`,
          payLoad
        );
        if (response.data.success) {
          toast.success(t("Customer.ToastSuccessJrGrpTmp"));

          setButtonLoader(false);
          setUSeTemplate((pre) => [
            ...pre,
            {
              name: response.data.data.name,
              id: response.data.data.id,
              detail:response.data.data.detail,
            },
          ]);

          onClose();
          return;
        } else {
          toast.error(t("Customer.ToastErrJrGrpTmp"));
          setButtonLoader(false);
        }
      } catch (error) {
        toast.error(t("Customer.ToastErrJrGrpTmp"));
        setButtonLoader(false);
      }
    },
  });

  function BootstrapDialogTitle(props) {
    const { children, onClose, ...other } = props;

    return (
      <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            disableRipple
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#6f6f6f",
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => onClose()}
      disableAutoFocus
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper
        sx={{
          maxHeight: "95%",
          overflowY: "scroll",
          scrollbarWidth: 'none',
          width: { xs: '90%', md: "60%" },
          borderRadius: "10px",
          p: 4,
        }}
      >



        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={() => onClose()}
          sx={{
            textAlign: "center",
            color: "#1F1F1F",
            fontWeight: 700,
            pt: 2,
            mb: 0,
          }}
        >
          {t("Customer.CreateJrGrpTmp")}
        </BootstrapDialogTitle>


        <Box
          noValidate
          component="form"
          sx={{
            p: 0,
            mt: 0,
            display: "flex",
            flexDirection: "column",
            m: "auto",
            width: "100%",
          }}
        >
          <Box
            noValidate
            component="form"
            sx={{
              p: 2,
              pl: 4,
              pr: 4,
              display: "flex",
              flexDirection: "column",
              m: "auto",
              width: "100%",
            }}
          >
            <Stack flex={1} flexDirection={"column"}>
              <FTextInput
                backgroundColor="#fff"
                height={50}
                sx={{
                  mt: 2,
                  mb: 0,
                  width: "100%",
                  "& .MuiInputBase-root": {
                    paddingTop: 0,
                    paddingBottom: 0,
                  },
                  "& input": {
                    paddingTop: "12px",
                  },
                }}
                borderBottomColor={"transparent"}
                borderBottomLeftRadius={0}
                borderBottomRightRadius={0}
                placeholder={t("Customer.TmpName")}
                value={formik.values.name}
                onChange={(e) => formik.setFieldValue("name", e.target.value)}
              />

              <ReactQuill
                value={formik.values.detail}
                onChange={(content) => formik.setFieldValue("detail", content)}
                onBlur={() => formik.setFieldTouched("detail", true)}
                modules={modules}
                formats={formats}
                className="custom-quill2"
              />

              {formik.touched.name && formik.errors.name && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}
                >
                  <Typography variant="caption" color="red">
                    {formik.errors.name}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        <Stack sx={{ justifyContent: "center", mb: 2, gap: 2, mt: 4 }}>
          <FButton
            type="submit"
            width={150}
            height={40}
            title={"Create template"}
            variant={"save"}
            style={{
              minWidth: 160,
            }}
            loading={buttonLoader}
            disabled={buttonLoader}
            onClick={formik.handleSubmit}
          />
        </Stack>
      </Paper>


    </Modal>
  );
}
