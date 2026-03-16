import { Box, Button, Grid2, Skeleton, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import PrimaryHeading from "../../commonPrimaryHeading";
import SecondaryHeading from "../../commonSecondaryHeading";
import CommonButton from "../../commonButton";
import HolidaysAndClosedDays from "./HolidaysAndClosedDays";
import PublicHolidaysModel from "./popup/PublicHolidaysModel";
import NewAllDayClousereModel from "./popup/allDayClousere/NewAllDayClousereModel";
import { List } from "@mui/icons-material";
import { t } from "i18next";


export default function HolidaysAndClosedDaysComponent({
  loading,
  holidays, setHolidays,
  publicholidays,
  handleDeleteHoliday,

}) {

  const [newallDayClosureDialog, setNewallDayClosureDialog] = useState(false);
  const [publicHolidaysDialog, setPublicHolidaysDialog] = useState(false);
  const [propsForNewallDayClosure, setPropsForNewallDayClosure] = useState({});



  const handleNewallDayClosureDialog = ({ outlet_id, id, index }) => {

    const foundHoliday = holidays[index]

    if (id === 'add') {
      setNewallDayClosureDialog(!newallDayClosureDialog);
      setPropsForNewallDayClosure("add");
    }
    else {

      if (foundHoliday.type == 'holiday') {
        setPublicHolidaysDialog(!publicHolidaysDialog);
      }
      else {
        setPropsForNewallDayClosure({ id: id, outlet_id: outlet_id, index });
        setNewallDayClosureDialog(!newallDayClosureDialog);

      }
    }

  };


  const handlePublicHolidaysDialog = () => {
    setPublicHolidaysDialog(!publicHolidaysDialog);
  };


  return (
    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>

      <Grid2 size={{ xs: 12, md: 4 }} >
        <PrimaryHeading text={t("Setting.HolidaysAndClosedDays")} />
        <SecondaryHeading text={t("Setting.DescriptionOfHolidaysAndClosedDays")} />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 8 }} sx={{ display: "flex", flexDirection: "column", width: "100%" }}>

        <CommonButton
          icon={<List sx={{ color: "#fff", fontSize: "26px", fontWeight: "700", }} />}
          type="submit"
          width={{ xs: "100%", md: "auto" }}
          height={40}
          title={t("Setting.PublicHolidays")}
          onClick={handlePublicHolidaysDialog}
          style={{ ml: { md: 'auto' } }}
        />

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            mt: 2
          }}
        >
          <Box
            sx={{
              width: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >

            <Typography variant='body1' sx={{ fontWeight: 700, color: '#1F1F1F' }}>
              {t("Setting.ClosedDays")}
            </Typography>
          </Box>
          <Box
            sx={{
              width: "auto",
              marginLeft: "auto",
              marginRight: 5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >

            <Typography variant='body1' sx={{ fontWeight: 700, color: '#1F1F1F' }}>
              {t("Setting.Description")}
            </Typography>
          </Box>
        </Box>
        {loading ?
          <Stack spacing={1} sx={{ width: '100%' }}>
            {[...Array(4)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: 'row',
                  alignItems: "center",
                  width: "100%",
                  border: '1px solid #D9D9D9',
                  borderRadius: 2
                }}
              >
                <Button
                  fullWidth
                  sx={{
                    p: 1,
                    justifyContent: 'space-between',
                    '&:hover': { backgroundColor: 'transparent' }
                  }}
                >
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="40%" />
                </Button>
                <Button sx={{ minWidth: 'auto', p: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                </Button>
              </Box>
            ))}
            <Button
              sx={{
                p: 1,
                backgroundColor: "#ffffff",
                display: "flex",
                flexDirection: 'row',
                justifyContent: "start",
                alignItems: "center",
                width: "100%",
                border: '2px solid #D9D9D9',
                borderRadius: 2
              }}
            >
              <Skeleton variant="text" width="50%" />
            </Button>
          </Stack>


          :
          <HolidaysAndClosedDays
            data={holidays}
            onClick={handleNewallDayClosureDialog}
            onDelete={handleDeleteHoliday}
          />}

        {newallDayClosureDialog && (
          <NewAllDayClousereModel
            open={newallDayClosureDialog}
            newallDayClosureProps={propsForNewallDayClosure}
            holidays={holidays}
            setHolidays={setHolidays}
            onClose={() => setNewallDayClosureDialog(false)}
          />
        )}

        {publicHolidaysDialog && (
          <PublicHolidaysModel
            open={publicHolidaysDialog}
            publicholidays={publicholidays}
            holidays={holidays}
            setHolidays={setHolidays}
            onClose={handlePublicHolidaysDialog}
          />
        )}
      </Grid2>

    </Grid2>
  );
}
