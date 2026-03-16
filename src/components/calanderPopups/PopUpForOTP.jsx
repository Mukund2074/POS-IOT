import { Avatar, Box, IconButton, Modal, Paper, Stack, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import tickImg from "../../assets/Vector (1).png";
import FButton from '../commonComponents/F_Button';
import { Close } from '@mui/icons-material';
import FTextInput from '../commonComponents/F_TextInput';
import PrimaryHeading from '../settings/commonPrimaryHeading';
import { t } from 'i18next';

export default function PopUpForOTP({ open, onClose, selectedPopUpEmployee = null, passcode, handlePasscodeChange, handleFinalSavePopuUs }) {


    const handleBackspace = (e, index) => {
        if (e.key === "Backspace" && !passcode[index] && index > 0) {
            document.getElementById(`passcode-${index - 1}`).focus();
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            disableAutoFocus
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper sx={{
                width: { XS: "90%", md: "auto" }, maxHeight: "80%", display: 'flex', flexDirection: 'column', position: "relative", borderRadius: 8, padding: { xs: 1, md: 4 },
            }}>
                <IconButton sx={{ position: "absolute", right: 8, top: 8, zIndex: 11 }} onClick={onClose} >
                    <Close />
                </IconButton>
                {/* Title at the top */}
                {/* <Typography variant="h2"
                    sx={{
                        textAlign: "center",
                        color: "#6f6f6f",
                        position: "sticky", top: "0", pt: 4, pb: 2, zIndex: 1, backgroundColor: "white", borderRadius: 13
                    }}>
                    Insert Passcode
                </Typography> */}

                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PrimaryHeading text={t("Calendar.InsertPasscode")} />
                </Box>

                {/* Scrollable content */}

                <Stack p={{ xs: 2, md: 4 }} >

                    {selectedPopUpEmployee !== null && selectedPopUpEmployee && (

                        <Typography variant="h6" sx={{ textAlign: "center", color: '#545454' }}>

                            {t("Calendar.EnterPasscode")}{" "}
                            {selectedPopUpEmployee.name}
                        </Typography>

                    )}
                    <Stack
                        direction="row"
                        justifyContent="center"
                        spacing={2}
                        sx={{
                            width: "100%",
                            p: { md: 2 },
                        }}
                    >
                        {passcode.map((digit, index) => (
                            <TextField
                                key={index}
                                id={`passcode-${index}`}
                                type="text"
                                inputProps={{ maxLength: 1, style: { textAlign: "center" } }}
                                value={digit}
                                onChange={(e) => handlePasscodeChange(e, index)}
                                onKeyDown={(e) => handleBackspace(e, index)}
                                sx={{
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    width: { xs: "40px", md: "55px" },
                                    fontSize: { xs: "18px", md: "22px" },
                                    border: "1px solid #A79C92",
                                    borderRadius: "13px",
                                    boxShadow: "0px 4px 4px 0px #00000040",
                                }}
                            />
                        ))}
                    </Stack>


                </Stack>

                <Stack sx={{ position: 'sticky', bottom: 0, mx: 'auto', width: { xs: '100%', md: '30%' }, backgroundColor: 'white', px: 5 }}>
                    <FButton
                        disabled={passcode.length < 6}
                        onClick={() => handleFinalSavePopuUs()}
                        title={t("Common.Next")}
                        variant={'save'}
                        sx={{
                            width: "100%",
                            color: "white",
                            borderRadius: 10,
                            backgroundColor: "#a2907c"
                        }}
                    />
                </Stack>

            </Paper>
        </Modal>
    )
}
