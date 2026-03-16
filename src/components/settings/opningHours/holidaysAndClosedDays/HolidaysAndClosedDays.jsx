import { Box, Button, Stack, Typography } from '@mui/material'
import React from 'react'
import DeleteIcon from '../../../../assets/DeleteIcon.png';
import moment from 'moment';
import { getWeekDayByLang } from '../../../../utils/commonFetcher';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
export default function HolidaysAndClosedDays({ data, onClick, onDelete }) {

      const user = useSelector((state) => state.user.data);

      const isDisable = ({ id = 0, allowToAllOnly = false }) => {


        if (user?.role == "ADMIN" ){
          return false
        }else{
          if (user?.settings?.change_all_opening_hours) {
            return false
          }else{
            if(allowToAllOnly){
              return true 
            }
            if (user?.settings?.change_own_opening_hours && user?.id === id) {
              return false
            }
            return true
          } 
        }
    
      }
    
    moment.locale('en');
    return (
        <Stack spacing={1} sx={{ width: '100%' }}>
            {data?.map((item, index) => {

                return (
                    <Box key={index} sx={{ backgroundColor: "#ffffff", display: "flex", flexDirection: 'row', alignItems: "center", width: "100%", border: '1px solid #D9D9D9', borderRadius: 2 }}>
                        <Button onClick={() => onClick({ outlet_id: item?.outlet_id, id: item?.id, index })} display={'flex'} fullWidth sx={{ p: 1,textTransform:'capitalize',     "&:hover": { backgroundColor: "transparent"} }}  disableRipple>
                            <Typography style={{ width: 'full', color: '#A0A0A0' }}>
                                {moment(item?.start_date).format('ddd, DD/MM-YYYY')} - {moment(item?.end_date).format('ddd, DD/MM-YYYY')}
                            </Typography>
                            <Typography style={{ width: 'full', color: '#A0A0A0', marginLeft: 'auto' }}>
                                {item?.description} 
                            </Typography>
                        </Button>
                        <Button sx={{ ml: "auto",  textTransform:'capitalize',minWidth:40,   "&:hover": { backgroundColor: "transparent"} }} onClick={() => onDelete(index)} disableRipple>
                         <img src={DeleteIcon} height={18} />
                        </Button>

                    </Box>
                )
            })}

{!isDisable({ id: user?.id, allowToAllOnly: true }) && (
            <Button disableRipple onClick={() => onClick({ outlet_id: 'add', id: "add" })} sx={{ p: 1, backgroundColor: "#ffffff", display: "flex", flexDirection: 'row', justifyContent: "start", alignItems: "center", width: "100%", border: '1px solid #D9D9D9', borderRadius: 2 ,  textTransform:'capitalize',     "&:hover": { backgroundColor: "transparent"}}}>
                <Typography style={{ width: 'full',  color: '#A0A0A0' }}>
                    {t("Setting.NewAllDayClosure")}
                </Typography>
            </Button>)}
        </Stack>
    )
}
