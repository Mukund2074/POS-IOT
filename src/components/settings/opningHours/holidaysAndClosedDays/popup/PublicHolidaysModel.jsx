import { Close } from '@mui/icons-material'
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, IconButton, Modal, Paper, Stack, Switch, Typography } from '@mui/material'
import React, { useState } from 'react'
import PrimaryHeading from '../../../commonPrimaryHeading'
import moment from 'moment'
import CommonButton from '../../../commonButton'
import CloseIcon from '@mui/icons-material/Close';
import FSwitch from '../../../../commonComponents/f-switch'
import { useSelector } from 'react-redux'
import { t } from "i18next";

export default function PublicHolidaysModel({ open, onClose, setHolidays, publicholidays, holidays }) {

    let newPublicHolidays = publicholidays.map((holidayObj) => { return ({ ...holidayObj, type: 'holiday' }) })
    const user = useSelector((state) => state.user.data);


    const [selectedHoliday, setSelectedHoliday] = useState(holidays)

    const checker = (id) => {


        let check = false;
        selectedHoliday.map((item) => {
            if (item.id === id) {
                check = true;
            }
        });
        return check;

    }

    const isDisable = ({ id = 0, allowToAllOnly = false }) => {


        if (user?.role == "ADMIN") {
            return false
        } else {
            if (user?.settings?.change_all_opening_hours) {
                return false
            } else {
                if (allowToAllOnly) {
                    return true
                }
                if (user?.settings?.change_own_opening_hours && user?.id === id) {
                    return false
                }
                return true
            }
        }

    }

    const handleChangeHolidays = (id) => {

        if (checker(id)) {
            let filterdHolidays = selectedHoliday.filter((item) => item.id !== id);


            setSelectedHoliday(filterdHolidays);
        } else {
            let filterdHolidays = selectedHoliday.filter((item) => item.id !== id);
            let newHolidays = [...filterdHolidays, newPublicHolidays.find((item) => item.id === id)];

            setSelectedHoliday(newHolidays);
        }

    }

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

                <IconButton sx={{ position: "absolute", right: 8, top: 8, zIndex: 11 }} onClick={onClose} >
                    <Close />
                </IconButton>

                <Typography sx={{ color: '#1F1F1F', textAlign: { xs: "left", md: "center" }, fontWeight: 700, }}>
                    {t("Setting.PublicHolidays")}
                </Typography>

                <Grid2 marginTop={4} maxHeight={"400px"} sx={{ overflowY: "scroll", scrollbarWidth: "none", overflowX: "hidden" }} paddingBottom={5} container spacing={2} >
                    {newPublicHolidays?.map((holiday, index) => {
                        return (
                            <Grid2 size={{ xs: 12, md: 6 }} sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", }} key={index}>
                                <Typography style={{ width: '100%', size: '20px', color: '#1f1f1f', fontWeight: 600 }}>
                                    {holiday?.description}
                                </Typography>
                                {/* <Box sx={{ width: "100%", display: "flex", flexDirection: 'column', alignItems: "center", justifyContent: "center", pl:0, pr:0 }}> */}
                                <FSwitch
                                    checked={checker(holiday?.id)}
                                    disabled={isDisable({ id: user?.id, allowToAllOnly: true })}
                                    onChange={() => handleChangeHolidays(holiday?.id)}
                                    sx={{
                                        '& .MuiSwitch-switchBase': {
                                            '&.Mui-checked': { color: '#fff' },
                                            '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#44B904' },
                                        },
                                        '& .MuiSwitch-track': { backgroundColor: '#D9D9D9' },
                                        mr: 2
                                    }}
                                />
                                {/* </Box> */}
                                <Typography style={{ width: '100%', size: '20px', color: '#A0A0A0' }}>
                                    {/* date , Month */}
                                    {moment(holiday?.start_date, 'YYYY-MM-DD').format("DD. MMMM YY")}
                                </Typography>
                            </Grid2>
                        )
                    })}

                </Grid2>

                <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center', mb: 2, gap: 2 }} >

                    <CommonButton
                        type="submit"
                        // width={120}
                        height={40}
                        title={'Cancel'}
                        backgroundColor={'#D9D9D9'}
                        style={{
                            minWidth: { xs: '100%', md: 150 }
                        }}
                        onClick={onClose}
                    // loading={formik.isSubmitting}
                    // disabled={formik.isSubmitting}
                    />


                    {
                        !isDisable({ id: user?.id, allowToAllOnly: true }) &&

                        <>

                            <CommonButton
                                type="submit"

                                height={40}
                                title={t("Setting.AddHoliday")}
                                // loading={formik.isSubmitting}
                                // disabled={formik.isSubmitting}
                                backgroundColor={'#44B904'}
                                style={{
                                    minWidth: { xs: '100%', md: 150 }
                                }}
                                onClick={() => {
                                    setHolidays(selectedHoliday);
                                    onClose()

                                }}

                            />
                        </>
                    }




                </Stack>
            </Paper>

        </Modal >
    )
}
