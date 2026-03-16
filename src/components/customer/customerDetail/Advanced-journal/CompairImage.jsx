import { Divider, IconButton, Modal, Paper, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import FSelect from '../../../commonComponents/F_Select';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import CustomCheckbox from '../../../commonComponents/F_Checkbox';
import { Close, TrendingFlat } from '@mui/icons-material';
import FButton from '../../../commonComponents/F_Button';
import moment from 'moment';
import { t } from 'i18next';

export default function CompairImage({ oepn, onClose, propsForCompair, imagesForProps }) {

    const [selectedImages, setSelectedImages] = useState([imagesForProps[0]]);
    const [size, setSize] = useState(400);



    return (
        <Modal disableAutoFocus open={oepn} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}  >
            <Paper
                sx={{
                    position: 'relative',
                    width: 'auto',
                    maxWidth: { xs: '90%', md: '80%' },
                    minWidth: { xs: '90%', md: '80%' },
                    bgcolor: '#fff',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    overflowY: 'scroll',
                    maxHeight: '90dvh'
                }}
            >
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Close sx={{ color: '#a2a2a2' }} />
                </IconButton>


                <Stack width={"100%"} height={"100%"} px={4} py={4} gap={3} sx={{ backgroundColor: "#FFFFFF" }}>


                    <FPrimaryHeading text={t("Customer.IMCompair")} />

                    <FSelect
                        sx={{ width: { xs: '100%', md: "20%" } }}
                        options={[
                            { value: 200, label: `${t("Customer.Size")} - 200px` },
                            { value: 400, label: `${t("Customer.Size")} - 400px` },
                            { value: 600, label: `${t("Customer.Size")} - 600px` },
                            { value: 800, label: `${t("Customer.Size")} - 800px` },
                            { value: 1000, label: `${t("Customer.Size")} - 1000px` },
                        ]}
                        value={size}
                        onChange={(e) => {
                            setSize(e.target.value);
                        }}
                    />

                    <Stack display={"flex"} flexDirection={"row"} minHeight={400} sx={{ overflow: 'hidden', overflowX: 'scroll', scrollbarWidth: 'none' }} gap={2} p={4}  >
                        {selectedImages?.map((img, index) => {
                            return (
                                <Stack key={index} direction={"column"} >
                                    <img src={`${process.env.REACT_APP_IMG_URL}${img?.attachment}`} alt="" style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }} />
                                    <Typography variant='body2' >
                                        {moment(propsForCompair?.date, 'YYYY-MM-DDTHH:mm:ss').format("DD/MM-YY HH:mm")}
                                    </Typography>
                                    <Stack direction={"row"} alignItems={"center"} gap={1}>
                                        <Typography variant='body2' display={'flex'} flexDirection={'row'} gap={0.5} >
                                            {t("Common.CapsEmployee")}:
                                            <strong>
                                                {propsForCompair?.employee_name}
                                            </strong>
                                        </Typography>
                                    </Stack>
                                </Stack>
                            )
                        })}
                    </Stack>

                    <Divider sx={{ height: '2px', bgcolor: '#d2d2d2' }} />

                    <Stack display={"flex"} flexDirection={"row"} gap={2} sx={{ overflow: 'hidden', overflowX: 'scroll', scrollbarWidth: 'none' }} >
                        {imagesForProps?.map((img, index) => {
                            return (
                                <Stack justifyContent={"center"} key={index} maxWidth={150} gap={2} border={'1px solid #d9d9d9'} borderRadius={4} direction={"column"} overflow={'hidden'} >
                                    <CustomCheckbox borderRadius={50} sx={{}} checked={selectedImages?.includes(img)} onChange={(e) => setSelectedImages(e.target.checked ? [...selectedImages, img] : selectedImages.filter((item) => item !== img))} />
                                    <img src={`${process.env.REACT_APP_IMG_URL}${img?.attachment}`} alt="" height={200} style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} />
                                    <Stack direction={"column"} alignItems={"start"} gap={1} p={1}>
                                        <Typography variant='caption' >
                                            {moment(propsForCompair?.date, 'YYYY-MM-DDTHH:mm:ss').format("DD/MM-YY HH:mm")}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                maxWidth: '130px', // Set the max width as needed
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }} variant='caption' noWrap  >
                                            {t("Common.Employee")}:

                                            <strong> {propsForCompair?.employee_name}</strong>
                                        </Typography>
                                    </Stack>
                                </Stack>
                            )
                        })}
                    </Stack>


                    {/* <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 3, width: "100%" }} variant="contained" color="primary">
    Back
</Button> */}
                    <FButton variant={'save'} title={t("Common.Back")} startIcon={<TrendingFlat sx={{ rotate: '180deg', width: '20px' }} />} sx={{ backgroundColor: '#44B904', width: { xs: '100%', md: "10%" } }} onClick={onClose} />
                </Stack>
            </Paper>
        </Modal >
    )
}
