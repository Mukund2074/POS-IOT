import { IconButton, Modal, Paper, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import FTextInput from '../commonComponents/F_TextInput';
import { Close } from '@mui/icons-material';
import { t } from 'i18next';
import FPrimaryHeading from '../commonComponents/F_PrimaryHeading';
import DeleteIconImg from '../../assets/DeleteIcon.png';
import FButton from '../commonComponents/F_Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomDeleteModal from '../deleteAlertModal';
import { toast } from 'react-toastify';
import apiFetcher from '../../utils/interCeptor';
import { HttpStatusCode } from 'axios';

export default function AddRoomModal({ open, onClose, rooms, fetchRoomData }) {


    const [selectedRoom, setSelectedRoom] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const validationSchema = Yup.object().shape({
        roomName: Yup.string().required(t("Services.YupErrRoomName")).typeError(t("Services.YupErrRoomName")),
    });

    const formik = useFormik({
        initialValues: {
            roomName: selectedRoom ? selectedRoom.name : '',
        },
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            if (selectedRoom) {
                handleEditRoom(values);
            } else {
                handleAddRoom(values);
            }
        },
    });

    const handleAddRoom = async (values) => {
        try {
            const response = await apiFetcher.post(`api/v1/store/service_room`, { name: values.roomName });
            if (response.status === HttpStatusCode.Created || response.status === HttpStatusCode.Ok) {
                toast.success(t("Services.ToastAddRoom"));
                fetchRoomData();
                formik.resetForm();

            } else {
                toast.error(t("Services.ToastErrAddRoom"));
            }
        } catch (error) {
            toast.error(t("Services.ToastErrAddRoom"));
        } finally {
            setSelectedRoom(null);
        }
    };

    const handleEditRoom = async (values) => {
        try {
            const response = await apiFetcher.patch(`api/v1/store/service_room/${selectedRoom.id}`, { name: values.roomName });
            if (response.status === HttpStatusCode.Ok) {
                toast.success(t("Services.ToastUpdRoom"));
                fetchRoomData();
                formik.resetForm();
            } else {
                toast.error(t("Services.ToastErrUpdRoom"));
            }
        } catch (error) {
            toast.error(t("Services.ToastErrUpdRoom"));
        } finally {
            setSelectedRoom(null);
        }
    };

    const handleEditRoomSelect = (room) => {
        setSelectedRoom(room);
        formik.setFieldValue('roomName', room.name);
    };

    const handleDeleteRoom = async (id) => {
        try {
            setLoading(true);
            const response = await apiFetcher.delete(`api/v1/store/service_room/${id}`);
            if (response.status === HttpStatusCode.Ok) {
                toast.success(t("Services.ToastDelRoom"));
                fetchRoomData();
                formik.resetForm();
                // setDeleteModal(false);
            } else {
                toast.error(t("Services.ToastErrDelRoom"));
            }
        } catch (error) {
            toast.error(t("Services.ToastErrDelRoom"));
        } finally {
            setDeleteModal(false);
            setSelectedRoom(null);
            setLoading(false);
        }
    };


    return (
        <Modal
            disableAutoFocus
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9 }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    maxWidth: { xs: '90%', md: 'auto' },
                    minWidth: '50%',
                    width: { xs: '90%', md: 'auto' },
                    p: 4,
                    bgcolor: '#fff',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >

                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Close sx={{ color: '#a2a2a2' }} />
                </IconButton>

                <FPrimaryHeading text={t("Services.AddRoom")} />

                <FTextInput
                    name="roomName"
                    placeholder={t("Services.EnterRoomName")}
                    value={formik.values.roomName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    sx={{ mt: 4 }}
                />
                {formik?.touched?.roomName && formik?.errors?.roomName && (
                    <Typography style={{ color: 'red' }}>{formik?.errors?.roomName}</Typography>
                )}

                <Stack display={"flex"} flexDirection={"column"} gap={1} sx={{ mt: 4, maxHeight: '40dvh', overflowY: 'auto' }}>
                    {rooms && rooms.length > 0 && rooms.map((room) => (
                        <Stack
                            key={room.id}
                            flex={1}
                            flexDirection={'row'}
                            justifyContent={'flex-start'}
                            py={1}
                            px={4}
                            sx={{
                                borderRadius: '15px',
                                border: '1.5px solid #D9D9D9',
                            }}
                            my={0.5}
                        >
                            <Stack flex={1} flexDirection={'row'} sx={{ cursor: 'pointer', }} justifyContent={'flex-start'} alignItems={'center'}>
                                <Typography
                                    variant='body1'
                                    onClick={() => handleEditRoomSelect(room)}
                                    style={{
                                        fontWeight: 400,
                                        color: '#A0A0A0',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        width: '100%',
                                    }}
                                >
                                    {room.name}
                                </Typography>

                                <IconButton
                                    onClick={() => { setDeleteModal(true); setSelectedRoom(room); }}
                                    sx={{
                                        background: "#ffff",
                                        border: "none",
                                        marginLeft: 'auto',
                                        borderRadius: "50%",
                                        padding: 0,
                                    }}
                                >
                                    <img src={DeleteIconImg} alt="Delete" width={18} />
                                </IconButton>
                            </Stack>
                        </Stack>
                    ))}
                </Stack>


                <Stack flex={1} flexDirection={'row'} gap={2} justifyContent={'center'} mt={4} alignItems={'center'}>
                    <FButton variant={'save'} onClick={formik.handleSubmit} title={selectedRoom ? t("Services.UpdateRoom") : t("Services.AddRoom")} />
                    {/* {selectedRoom && (
                        <FButton variant={'delete'} onClick={() => handleDeleteRoom(selectedRoom.id)} title={t("Services.DeleteRoom")} />
                    )} */}
                </Stack>

                {deleteModal &&
                    <CustomDeleteModal
                        open={deleteModal}
                        title={t('Services.DeleteRoom')}
                        handleClose={() => setDeleteModal(false)}
                        description={
                            <>
                                {t("Services.DeleteRoomDesc")}

                            </>
                        }
                        onClickDismiss={() => setDeleteModal(false)}
                        onClickConfirm={() => handleDeleteRoom(selectedRoom.id)}
                        loading={loading || formik.isSubmitting}
                    />
                }
            </Paper>
        </Modal>
    );
}

