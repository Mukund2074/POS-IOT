import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";

import React, { useState } from "react";
import moment from "moment";
import { useFormik } from "formik";
import * as Yup from "yup";

import CustomTextField from "../commonTextinput";
import CloseIcon from "@mui/icons-material/Close";
import FButton from "../../commonComponents/F_Button";

import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import apiFetcher from "../../../utils/interCeptor";

import { t } from "i18next";

export default function CreateJournalGroup({
    open,
    onClose,
    data,
    selectedJournalGroup,
    setData,
    handleRemove,
}) {
    moment.locale("en");
    // const user = useSelector((state) => state.user.data);
    const [buttonLoader, setButtonLoader] = useState(false);

    const validationSchema = Yup.object({
        name: Yup.string()
            .required(t('Setting.PleaseEnterJournalGroupName'))
            .matches(/^(?!\s*$).+/, t('Setting.EnterValidName'))
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: selectedJournalGroup ? selectedJournalGroup.name : "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const payLoad = {
                name: values.name
            };

            setButtonLoader(true);

            if (selectedJournalGroup) {
                try {
                    const response = await apiFetcher.patch(`api/v1/store/journal/group/${selectedJournalGroup?.id}`, payLoad);
                    if (response.data.success) {
                        onClose();
                        toast.success(t('Setting.JournalGroupUpdated'));
                        setButtonLoader(false);
                        return;
                    } else {
                        toast.error(t('Setting.FailedToUpateJournalGroup'));
                        setButtonLoader(false);
                    }
                } catch (error) {
                    toast.error(t('Setting.FailedToUpdateJournalGroup'));
                    setButtonLoader(false);
                }
            } else {
                try {
                    const response = await apiFetcher.post(`api/v1/store/journal/group`, payLoad);
                    if (response.data.success) {
                        onClose();
                        toast.success(t('Setting.JournalGroupCreated'));
                        setButtonLoader(false);
                        return;
                    } else {
                        toast.error(t('Setting.FailedToCreateJournalGroup'));
                        setButtonLoader(false);
                    }
                } catch (error) {
                    toast.error(t('Setting.FailedToCreateJournalGroup'));
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
    };

    return (
        <Dialog
            PaperProps={{ sx: { borderRadius: "25px" } }}
            keepMounted
            disableAutoFocus
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onclose}
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
                {selectedJournalGroup ? t('Setting.UpdateJournalGroup') : t('Setting.CreateAJournalGroup')}
            </BootstrapDialogTitle>

            <DialogContent sx={{ px: 2 }}>
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
                            py: 2,
                            px: { xs: 0, md: 4 },
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                        }}
                    >
                        <Stack flex={1} flexDirection={"column"}>
                            <Stack
                                flex={1}
                                flexDirection={"row"}
                                justifyContent={"flex-start"}
                                alignItems={"center"}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{ color: "#6F6F6F", width: "100%" }}
                                >
                                    {" "}
                                    {t('Setting.Name')}
                                </Typography>
                            </Stack>

                            <CustomTextField
                                id="name"
                                name="name"
                                value={formik.values.name}
                                mt={1}
                                onChange={formik.handleChange}
                                placeholder={t('Setting.JournalGroupName')}
                                onBlur={() => formik.setFieldTouched("name", true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="caption" color="red">
                                        {formik.errors.name}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>

                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ width: '100%', justifyContent: { md: "center" }, mb: 2, gap: 2, mt: { md: 4 } }}>
                <FButton
                    type="submit"
                    height={40}
                    title={selectedJournalGroup ? t('Services.UpdateGrp') : t('Setting.SaveGroup')}
                    variant={"save"}
                    loading={buttonLoader}
                    disabled={buttonLoader}
                    sx={{ width: { xs: '100%', md: 160 }, }}
                    onClick={formik.handleSubmit}
                />
            </DialogActions>

        </Dialog>
    );
}
