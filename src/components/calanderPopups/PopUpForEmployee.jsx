import { Avatar, Box, IconButton, Modal, Paper, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import tickImg from "../../assets/Vector (1).png";
import FButton from '../commonComponents/F_Button';
import { Close } from '@mui/icons-material';
import PrimaryHeading from '../settings/commonPrimaryHeading';
import { t } from 'i18next';

export default function PopupForEmployee({ open, onClose, employeeData = [], selectedPopUpEmployee, handleSelectPopUpEmployee, handleTransferToOTP }) {


  return (
    <Modal
      open={open}
      onClose={onClose}
      disableAutoFocus
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper
        sx={{
          width: { xs: '90%', md: "50%" }, maxHeight: "80%", display: 'flex', flexDirection: 'column', position: "relative", borderRadius: 8, py: 4, px: 2,
        }
        }>
        <IconButton sx={{ position: "absolute", right: 8, top: 8, zIndex: 11 }} onClick={onClose} >
          <Close />
        </IconButton>
        {/* Title at the top */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <PrimaryHeading text={t("Calendar.ChooseEmp")} />
        </Box>

        {/* Scrollable content */}
        <Stack sx={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', py: { xs: 2, md: 6 }, px: { xs: 2, md: 8 }, gap: 2 }}>

          {employeeData?.profile?.employees?.map((employee, index) => (
            <Stack
              key={index}
              direction="row"
              gap={2}
              alignItems="center"
              p={1.5}
              sx={{
                cursor: "pointer",
                border: "3px solid #bbb0a4",
                borderRadius: 3,
              }}
              onClick={() => handleSelectPopUpEmployee(employee)}
            >
              <Avatar src={`${employeeData?.image_base_url}${employee?.image}`} sx={{ width: 30, height: 30 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#545454' }}>
                {employee?.name}
              </Typography>
              {selectedPopUpEmployee?.id === employee?.id && (
                <img
                  src={tickImg}
                  alt="Selected"
                  style={{
                    marginLeft: "auto",
                    width: "20px",
                    height: "20px",
                  }}
                />
              )}
            </Stack>
          ))}
        </Stack>

        {/* Button at the bottom */}
        <Stack sx={{ position: 'sticky', bottom: 0, mx: 'auto', width: { xs: '100%', md: '30%' }, backgroundColor: 'white', padding: 2 }}>
          <FButton
            onClick={handleTransferToOTP}
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
