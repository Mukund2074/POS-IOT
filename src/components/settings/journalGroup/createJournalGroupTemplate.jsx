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
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import FButton from "../../commonComponents/F_Button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FSelect from "../../commonComponents/F_Select";
import apiFetcher from "../../../utils/interCeptor";
import { toast } from "react-toastify";
import FTextInput from "../../commonComponents/F_TextInput";
import { t } from "i18next";
import { Close } from "@mui/icons-material";

export const modules = {
  toolbar: [
    // [{ 'font': ['Arial', 'sans-serif'] }],
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

export const formats = [
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

export default function CreateJournalGroupTemplate({
  open,
  onClose,
  data,
  setData,
  handleRemove,
  selectedTemplate,
  journalGroupData,
  advancedJournal,
}) {
  // const user = useSelector((state) => state.user.data);
  // moment.locale("en");

  const [options, setOptions] = useState([]);
  const [buttonLoader, setButtonLoader] = useState(false);

  useEffect(() => {
    if (journalGroupData) {
      const options = [
        { label: t("Common.UngroupedJournals"), value: "mobile" },
        ...Object.values(journalGroupData).map((group) => ({
          value: group.id,
          label: group.name,
        })),
      ];
      setOptions(options);
    }
  }, [journalGroupData]);

  useEffect(() => {
    if (selectedTemplate && options && !advancedJournal) {
      const matchedGroups = selectedTemplate.groups.filter((groupId) =>
        options.some((option) => option.value === groupId)
      );
      formik.setFieldValue("selectedGroups", matchedGroups);
    }
  }, [selectedTemplate, options]);

  const validationSchema = Yup.object({
    // name: Yup.string()
    //     .required("Please enter journal group template name")
    //     .matches(/^(?!\s*$).+/, "Enter valid name"),
    name: Yup.string()
      .required(() => {
        return advancedJournal
          ? t("Setting.PleaseEnterJournalTemplateName")
          : t("Setting.PleaseEnterJournalGroupTemplateName");
      })
      .matches(/^(?!\s*$).+/, t("Setting.EnterValidName")),

    selectedGroups: advancedJournal
      ? Yup.array()
      : Yup.array()
          .min(1, t("Setting.AtLeastOneGroupMustBeSelected"))
          .required(t("Setting.GroupsAreRequired")),
  });

  const handleMultiSelectChange = (e) => {
    const selectedValues = e.target.value;

    let allID = options?.map((data) => data.value);

    if (
      (selectedValues === 0 || selectedValues.includes(0)) &&
      allID.length === formik.values.selectedGroups.length
    ) {
      formik.setFieldValue("selectedGroups", []);
    } else if (selectedValues === 0 || selectedValues.includes(0)) {
      formik.setFieldValue("selectedGroups", allID);
    } else if (selectedValues.length === 0) {
      formik.setFieldValue("selectedGroups", []);
    } else {
      formik.setFieldValue("selectedGroups", selectedValues);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: selectedTemplate ? selectedTemplate.name : "",
      detail: selectedTemplate ? selectedTemplate.detail : "",
      selectedGroups: [],
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // setData(values);
      // onClose();

      setButtonLoader(true);

      const payLoad = {
        name: values.name,
        advance: advancedJournal ? true : false,
        detail: values.detail,
        group_ids: advancedJournal
          ? []
          : values.selectedGroups.filter((id) => !isNaN(id)),
        mobile_group: values?.selectedGroups?.includes("mobile"),
      };

      if (selectedTemplate) {
        try {
          let templateId = selectedTemplate.id;
          let actualTemplateId;

          if (typeof templateId === "string" && templateId.includes("-")) {
            actualTemplateId = templateId.split("-")[0];
          } else {
            actualTemplateId = templateId;
          }

          const response = await apiFetcher.patch(
            `api/v1/store/journal/template/${actualTemplateId}`,
            payLoad
          );
          if (response.data.success) {
            onClose();
            toast.success(
              advancedJournal
                ? t("Setting.AdvancedJournalTemplateUpdated")
                : t("Setting.JournalGroupTemplateUpdated")
            );
            setButtonLoader(false);
            return;
          } else {
            toast.error(
              advancedJournal
                ? t("Setting.FailedToUpateAdvancedJournalTemplate")
                : t("Setting.FailedToUpateJournalGroupTemplate")
            );
            setButtonLoader(false);
          }
        } catch (error) {
          toast.error(
            advancedJournal
              ? t("Setting.FailedToUpateAdvancedJournalTemplate")
              : t("Setting.FailedToUpateJournalGroupTemplate")
          );
          setButtonLoader(false);
        }
      } else {
        try {
          const response = await apiFetcher.post(
            `api/v1/store/journal/template`,
            payLoad
          );
          if (response.data.success) {
            onClose();
            toast.success(
              advancedJournal
                ? t("Setting.AdvancedJournalTemplateCreated")
                : t("Setting.JournalGroupTemplateCreated")
            );
            setButtonLoader(false);
            onClose();
            return;
          } else {
            toast.error(
              advancedJournal
                ? t("Setting.FailedToCreateAdvancedJournalTemplate")
                : t("Setting.FailedToCreateJournalGroupTemplate")
            );
            setButtonLoader(false);
          }
        } catch (error) {
          toast.error(
            advancedJournal
              ? t("Setting.FailedToCreateAdvancedJournalTemplate")
              : t("Setting.FailedToCreateJournalGroupTemplate")
          );
          setButtonLoader(false);
        }
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
      onClose={onClose}
      disableAutoFocus
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper
        sx={{
          width: { xs: "90%", md: "80%" },
          maxHeight: "80%",
          display: "flex",
          overflow: "hidden",
          flexDirection: "column",
          position: "relative",
          borderRadius: 8,
          py: 4,
          px: 2,
        }}
      >
        <IconButton
          sx={{ position: "absolute", right: 8, top: 8, zIndex: 11 }}
          onClick={onClose}
        >
          <Close />
        </IconButton>

        <Typography
          sx={{
            color: "#1F1F1F",
            textAlign: { xs: "left", md: "center" },
            fontWeight: 700,
          }}
        >
          {/* { selectedTemplate ? "Update journal group template" : "Create a journal group template"} */}
          {advancedJournal && selectedTemplate
            ? t("Setting.UpdateAdvancedJournalTemplate")
            : advancedJournal
            ? t("Setting.CreateAnAdvancedJournalTemplate")
            : selectedTemplate
            ? t("Setting.UpdateJournalGroupTemplate")
            : t("Setting.CreateAJournalGroupTemplate")}
        </Typography>

        <Box
          noValidate
          component="form"
          sx={{
            py: 2,
            px: { md: 4 },
            display: "flex",
            flexDirection: "column",
            m: "auto",
            width: "100%",
            overflow: "auto",
          }}
        >
          <Stack flex={1} flexDirection={"column"}>
            {!advancedJournal && (
              <FSelect
                name="selectedGroups"
                value={formik.values.selectedGroups}
                TextToDisplayWithCount={t("Setting.GroupsSelected")}
                onChange={handleMultiSelectChange}
                isMultiSelect={true}
                options={options}
                showAllValues={false}
                showPlaceHolder={false}
                placeholderText={t("Common.SelectGroup")}
                selectAllRenderText={t("Setting.AllGroups")}
                selectAllRenderCheckBoxText={t("Setting.AllGroups")}
                sx={{ width: { xs: "100%", md: "30%" } }}
              />
            )}
            {formik.errors.selectedGroups && formik.touched.selectedGroups && (
              <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                <Typography variant="caption" color="red">
                  {formik.errors.selectedGroups}
                </Typography>
              </Box>
            )}

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

              // overflow="auto"
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

        <Stack
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
            gap: 2,
            mt: { xs: 1, sm: 2, md: 2 },
            width: "100%",
          }}
        >
          <FButton
            type="submit"
            height={40}
            title={
              selectedTemplate
                ? t("Setting.UpdateTemplate")
                : t("Setting.SaveTemplate")
            }
            variant={"save"}
            sx={{ width: { xs: "100%", md: 200 } }}
            loading={buttonLoader}
            disabled={buttonLoader}
            onClick={formik.handleSubmit}
          />
        </Stack>
      </Paper>
    </Modal>
  );
}
