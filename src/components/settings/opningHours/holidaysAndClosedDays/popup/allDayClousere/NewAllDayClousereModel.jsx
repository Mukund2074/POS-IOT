import { Error } from "@mui/icons-material";
import { Box, DialogTitle, IconButton, Modal, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import CommonButton from "../../../../commonButton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useFormik, Form, Formik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../../../../commonTextinput";
import CloseIcon from '@mui/icons-material/Close';

import { t } from "i18next";

export default function NewAllDayClosureModel({
  open,
  holidays,
  setHolidays,
  onClose,
  newallDayClosureProps,
}) {

  const validationSchema = Yup.object({
    start_date: Yup.date()
      .required(t("Setting.PleaseSelectAStartDate"))
      .typeError(t("Setting.PleaseSelectAValidStartDate")),

    end_date: Yup.date()
      .required(t("Setting.PleaseSelectAnEndDate"))
      .typeError(t("Setting.PleaseSelectAValidEndDate")),

    description: Yup.string()
      .required(t("Setting.PleaseEnterADescription"))
      .min(1, t("Setting.DescriptionCannotBeEmpty")),
  });

  const formik = useFormik({
    initialValues: {
      start_date: null,
      end_date: null,
      description: '',
    },
    validationSchema,
    onSubmit: (values) => {
      finalSubmit(values);
    },
  });

  useEffect(() => {
    if (newallDayClosureProps?.id === "add") {
    } else {
      let objOFHoliday = null
      if (newallDayClosureProps?.id) {

        objOFHoliday = holidays.find((item) => item.id === newallDayClosureProps?.id);
      } else {
        objOFHoliday = holidays[newallDayClosureProps?.index]
      }


      if (objOFHoliday) {
        formik.setValues({
          start_date: moment(objOFHoliday.start_date),
          end_date: moment(objOFHoliday.end_date),
          description: objOFHoliday.description,
        });
      }
    }
  }, [newallDayClosureProps, holidays]);

  const finalSubmit = (values) => {


    let formatedData = {
      year: parseInt(values.start_date.format("YYYY")),
      start_date: values.start_date.format("YYYY-MM-DD"),
      end_date: values.end_date.format("YYYY-MM-DD"),
      description: values.description,
      isHoliday: true,
      type: 'custom',
      id: `cu-${moment().valueOf()}`
    };

    let filterdHolidays = holidays.filter((item) => item.id !== newallDayClosureProps?.id);
    let updatedHolidays = [...filterdHolidays, formatedData];
    setHolidays(updatedHolidays);
    onClose();
  };

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
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#6f6f6f',
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
    );
  }

  let lenguage = localStorage.getItem("language");

  return (

    <Modal
      open={open}
      onClose={onClose}
      disableAutoFocus
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper
        sx={{
          width: { xs: '90%', md: "50%" }, maxHeight: "80%", display: 'flex', overflow: 'hidden', flexDirection: 'column', position: "relative", borderRadius: 8, py: 4, px: 2,
        }}>


        <Typography sx={{ color: '#1F1F1F', textAlign: { xs: "left", md: "center" }, fontWeight: 700, }}>
          {t("Setting.NewAllDayClosureWithoutAdd")}
        </Typography>

        <Typography variant="body1" sx={{ fontWeight: 400, color: "#A0A0A0", mb: 4 }} >
          <Error sx={{ color: "#F7C098", fontSize: 18, mr: 1, mb: 0.2 }} />
          {t("Setting.DescriptionCustomHoliday")}
        </Typography>
        <Formik
          initialValues={formik.initialValues}
          validationSchema={validationSchema}
          onSubmit={formik.handleSubmit}
        >
          <Form>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Start date */}
              <Stack display={"flex"} flex={1} flexDirection={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }} >
                <Typography variant="body1" sx={{ color: '#1F1F1F', fontWeight: 700, flex: 0.2 }}> {t("Setting.StartDate")}</Typography>
                <Stack sx={{ flex: 0.8 }}>
                  <LocalizationProvider dateAdapter={AdapterMoment} localeText={{calendarWeekNumberHeaderText : t('Common.Week')}} adapterLocale={lenguage === 'da' ? 'da' : 'en-gb'}>
                    <DatePicker
                      sx={{
                        "&.Mui-focused": { outline: "none", boxShadow: "none" },
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "& .MuiPaper-root": { backgroundColor: "#FFFFFF" },
                        "& .MuiOutlinedInput-input": { padding: 1 },
                        border: "1px solid #d9d9d9",
                        borderRadius: 3,
                        width: { xs: '100%', lg: 150 }
                      }}
                      value={formik.values.start_date}
                      format="DD/MM-YYYY"
                      onChange={(newValue) => formik.setFieldValue("start_date", newValue)}
                      renderInput={(params) => <TextField {...params} />}
                      displayWeekNumber={true}
                    />
                  </LocalizationProvider>
                  {formik.touched.start_date && formik.errors.start_date && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {/* <Error sx={{ color: "red" }} /> */}
                      <Typography variant="caption" color="red">{formik.errors.start_date}</Typography>
                    </Box>
                  )}
                </Stack>
              </Stack>

              {/* End date */}
              <Stack display={"flex"} flex={1} flexDirection={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }}>
                {/* <SecondaryHeading text={"End date"} /> */}
                <Typography variant="body1" sx={{ color: '#1F1F1F', fontWeight: 700, flex: 0.2 }}> {t("Setting.EndDate")}</Typography>

                <Stack flex={0.8}>

                  <LocalizationProvider dateAdapter={AdapterMoment} localeText={{calendarWeekNumberHeaderText : t('Common.Week')}} adapterLocale={lenguage === 'da' ? 'da' : 'en-gb'}>
                    <DatePicker
                      sx={{
                        "&.Mui-focused": { outline: "none", boxShadow: "none" },
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "& .MuiPaper-root": { backgroundColor: "#FFFFFF" },
                        "& .MuiOutlinedInput-input": { padding: 1 },
                        border: "1px solid #d9d9d9",
                        borderRadius: 3,
                        width: { xs: '100%', lg: 150 }
                      }}
                      value={formik.values.end_date}
                      format="DD/MM-YYYY"
                      onChange={(newValue) => formik.setFieldValue("end_date", newValue)}
                      renderInput={(params) => <TextField {...params} />}
                      displayWeekNumber={true}
                    />
                  </LocalizationProvider>
                  {formik.touched.end_date && formik.errors.end_date && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {/* <Error sx={{ color: "red" }} /> */}
                      <Typography variant="caption" color="red">{formik.errors.end_date}</Typography>
                    </Box>
                  )}
                </Stack>
              </Stack>

              {/* Description */}
              <Stack flex={1} display={"flex"} flexDirection={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }}>
                {/* <SecondaryHeading text={"Description"} /> */}
                <Typography variant="body1" sx={{ color: '#1F1F1F', fontWeight: 700, flex: 0.2 }}>{t("Setting.Description")}</Typography>
                <Stack sx={{ flex: 0.8 }}>
                  <CustomTextField
                    id="outlined-multiline-static"
                    value={formik.values.description}
                    mt={0}
                    onChange={(e) => formik.setFieldValue("description", e.target.value)}
                    placeholder={t("Setting.WhyIsTheClinicClosedOnThisDayHoliday")}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {/* <Error sx={{ color: "red" }} /> */}
                      <Typography variant="caption" color="red"  >{formik.errors.description}</Typography>

                    </Box>
                  )}
                </Stack>
              </Stack>

              {/* Buttons */}
              {/* <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
                <CommonButton
                  variant="outlined"
                  title={"Cancel"}
                  backgroundColor={"#D9D9D9"}
                  onClick={onClose}
                />
                <CommonButton variant="contained" title={"Save"} onClick={formik.handleSubmit} />
              </Box> */}
            </Box>
          </Form>
        </Formik>

        <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'center', mb: 2, gap: 2, mt: 4 }} >

          <CommonButton
            type="submit"
            // width={120}
            height={40}
            title={t("Setting.Cancel")}
            backgroundColor={'#D9D9D9'}
            style={{
              minWidth: { xs: '100%', lg: 150 }
            }}
            onClick={onClose}
          // loading={formik.isSubmitting}
          // disabled={formik.isSubmitting}
          />
          <CommonButton
            type="submit"

            height={40}
            title={t("Setting.AddAllDayClosure")}
            // loading={formik.isSubmitting}
            // disabled={formik.isSubmitting}
            backgroundColor={'#44B904'}
            style={{
              minWidth: { xs: '100%', lg: 150 }
            }}

            onClick={formik.handleSubmit}

          />

        </Stack>
      </Paper>

    </Modal>
  );
}
