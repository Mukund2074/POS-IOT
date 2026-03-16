import React, { useState, useEffect } from 'react';
import { Box, Stack, Skeleton, Grid2, CircularProgress } from '@mui/material';
import axios, { HttpStatusCode } from 'axios';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PrimaryHeading from '../../components/settings/commonPrimaryHeading';
import SecondaryHeading from '../../components/settings/commonSecondaryHeading';
import CommonButton from '../../components/settings/commonButton';
import ServiceModal from '../../components/service/addServiceModal';
import ServiceGroupModal from '../../components/service/addServiceGroupMoadal';
import { toast } from 'react-toastify';
import { MultipleContainers } from '../../components/MultipleContainers/MultipleContainers';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import CustomDeleteModal from '../../components/deleteAlertModal';
import menu from '../../assets/menu.svg';
import { useSelector } from 'react-redux';
import Notauthorized from '../../components/commonComponents/F_Notauthorized';
import { t } from 'i18next';
import AddRoomModal from '../../components/service/addRoomModal';
import apiFetcher from '../../utils/interCeptor';
import room from '../../assets/door.png';
import { DeleteService, ExportServicesApi, GetServiceGroup } from '../../utils/Api/Service';
import { Print } from '@mui/icons-material';
import moment from 'moment';
import { useLayout } from '../../context/LayoutContext.js';

const Services = () => {
    const user = useSelector((state) => state.user.data);
    const authTokenUser = localStorage.getItem('auth_token');
    const language = localStorage.getItem('language');

    const { isMobile } = useLayout();

    const [type, setType] = useState('create');
    const [isLoading, setLoading] = useState(false);
    const [serviceList, setServiceList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedServiceGroup, setSelectedServiceGroup] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState(null);
    const [openRoomModal, setOpenRoomModal] = useState(false);
    const [rooms, setRooms] = useState([]);

    const [serviceData, setServiceData] = useState([]);
    const [isServiceLoading, setIsServiceLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const fetchRoomData = async () => {
        try {
            const response = await apiFetcher(`api/v1/store/service_room`);
            if (response.status === HttpStatusCode.Ok) {
                setRooms(response.data.data);
            } else {
                toast.error(t('Services.ToastErrFetchRoom'));
            }
        } catch (error) {
            toast.error(t('Services.ToastErrFetchRoom'));
        }
    };

    useEffect(() => {
        fetchRoomData();
        setLoading(true);
        fetchServiceApi();
    }, []);

    const transformServiceList = (data) => {
        const groupedServices = data
            .filter((group) => group.id !== 0 && group.id !== null)
            .map((group) => ({
                title: group.group,
                groupId: group.id,
                services: group.services.length > 0 ? group.services : [],
                sequence: group.sequence,
                marketplace_hidden: group.marketplace_hidden,
            }));

        const ungroupedServices = data
            .filter((group) => group.id == 0 || group.id == null)
            .flatMap((group) => group.services)
            .map((service) => ({
                ...service,
                groupId: 0,
            }));

        const serviceListObj = {
            0: {
                title: t('Services.ServiceWithoutGRP'),
                groupId: 0,
                services: ungroupedServices,
                sequence: 0,
            },
        };

        groupedServices.map((groupObj) => {
            serviceListObj[groupObj?.groupId] = groupObj;
        });

        return serviceListObj;
    };

    const serviceMerger = async (data) => {
        let allServices = [];

        data &&
            data.flatMap((item) => ({
                service: item?.services?.map((serv) => {
                    if (serv?.is_addon && !serv?.can_book_alone) {
                        return;
                    } else {
                        allServices.push({ value: serv?.id, label: serv?.name });
                    }
                }),
            }));
        setServiceData(allServices);
    };
    async function fetchServiceApi() {
        try {
            const response = await GetServiceGroup();

            if (response) {
                // if(response.data?.data[0]?.services.sequence == null)
                // {
                //       response.data?.data[0]?.services.sort((a,b)=>  (a.id - b.id))
                //

                setServiceList(transformServiceList(response.data.data));
                serviceMerger(response?.data?.data);
                setLoading(false);
            } else {
                setServiceList({});
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching service data:', error);
            setServiceList({});
            setLoading(false);
        } finally {
            setLoading(false);
            setIsServiceLoading(false);
        }
    }

    const deleteServiceAPI = async (id, isGroup = false) => {
        try {
            let serviceURL = `${process.env.REACT_APP_URL}/api/v1/store/service/${id}`;
            if (isGroup) {
                serviceURL = `${process.env.REACT_APP_URL}/api/v1/store/service_group/${id}`;
            }

            const response = await DeleteService({ isGroup, id });

            // axios.delete(serviceURL, {
            //     headers: {
            //         Authorization: `Bearer ${authTokenUser}`
            //     }
            // });

            if (response.status == 200) {
                if (isGroup) {
                    toast.success(t('Services.ToastSuccessDeleteServiceGroup'));
                } else {
                    toast.success(t('Services.ToastSuccessDeleteService'));
                }
                fetchServiceApi();
            } else {
                if (isGroup) {
                    toast.error(t('Services.ToastErrDeleteSGroup'));
                } else {
                    toast.error(t('Service.ToastErrDeleteService'));
                }
            }
        } catch (error) {
            toast.error(t('Service.ToastErrDeleteService'));
            console.error('ERROR ', error);
        }
    };

    const sequenceUpdateAPI = async (data, isGroup = false) => {
        try {
            let serviceURL = `${process.env.REACT_APP_URL}/api/v1/store/service/sequence`;
            if (isGroup) {
                serviceURL = `${process.env.REACT_APP_URL}/api/v1/store/service_group/sequence`;
            }

            const response = await axios.post(serviceURL, data, {
                headers: {
                    Authorization: `Bearer ${authTokenUser}`,
                },
            });

            if (response.status == 200) {
                toast.success(t('Services.ToastUpSuccess'));
                // fetchServiceApi();
            } else {
                toast.error(t('Services.ToastUpErr'));
            }
        } catch (error) {
            toast.error(t('Services.ToastUpErr'));
            console.error('ERROR ', error);
        }
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const handleClose = (command) => {
        setShowModal(false);
        if (command == 123) {
            setLoading(true);
            setSelectedItem(null);
            fetchServiceApi();
            setServiceList([]);
        }
    };

    const handleCloseAddGroupModal = (command) => {
        setShowAddGroupModal(false);

        if (command === 'Callapi') {
            fetchServiceApi();
            setLoading(true);
        }
    };

    function handleRemove(containerID) {
        setItemsToDelete({
            containerId: containerID,
            type: 'container',
            itemId: null,
            container: serviceList[containerID],
            item: null,
        });
        setShowDeleteModal(true);
    }

    function handleRemoveItem(itemId, containerID) {
        setItemsToDelete({
            containerId: containerID,
            type: 'item',
            itemId: itemId,
            container: serviceList[containerID],
            item: serviceList[containerID].services.find((serviceObj) => serviceObj?.id == itemId),
        });
        setShowDeleteModal(true);
    }

    const handleDelete = async () => {
        if (itemsToDelete) {
            let newServiceList = { ...serviceList };
            const containerId = itemsToDelete?.containerId;
            if (itemsToDelete?.type == 'container') {
                delete newServiceList[containerId];
                setServiceList(newServiceList);
                deleteServiceAPI(containerId, true);
            } else {
                const itemId = itemsToDelete?.itemId;
                let updatedItems = newServiceList[containerId].services.filter(
                    (serviceObj) => serviceObj?.id !== itemId,
                );
                let newContainer = { ...newServiceList[containerId], services: updatedItems };
                setServiceList({ ...newServiceList, [containerId]: newContainer });
                deleteServiceAPI(itemId, false);
            }
            setShowDeleteModal(!showDeleteModal);
        }
    };

    if (!user?.settings.view_service_list && user?.role !== 'ADMIN') {
        return <Notauthorized />;
    }

    const handleExport = async () => {
        try {
            setExporting(true);
            const response = await ExportServicesApi();
            if (response) {
                // download the file
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `services_${moment().format('YYYY_MM_DD_HH_mm_ss')}.csv`); // or any other extension
                document.body.appendChild(link);
                link.click();
            }
        } catch (error) {
            toast.error(t('Services.ToastExportErr'));
        } finally {
            setExporting(false);
        }
    };

    return (
        <Stack sx={{ mt: isMobile && 2.5 }}>
            <Box
                sx={{
                    display: 'flex',
                    bgcolor: '#FFFFFF',
                    borderRadius: '25px',
                    flexDirection: 'column',
                    width: '100%',
                    padding: { xs: 2, md: 5 },
                }}
            >
                {(user?.settings.crud_services || user?.role === 'ADMIN') && (
                    <>
                        <Stack flex={1} gap={2} flexDirection={{ xs: 'column', md: 'row' }} justifyContent={'flex-end'}>
                            <CommonButton
                                height="40px"
                                style={{ width: { xs: '100%', md: 'fit-content' } }}
                                backgroundColor={'#D9D9D9'}
                                onClick={() => {
                                    handleExport();
                                }}
                                title={
                                    exporting ? (
                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <CircularProgress size={20} color="inherit" /> {t('Setting.Exporting')}
                                        </Stack>
                                    ) : (
                                        t('Services.ExportServices')
                                    )
                                }
                                icon={!exporting && <Print sx={{ ml: 2, color: '#fff', width: 20, height: 20, marginTop : 1 }} />}
                            />

                            <CommonButton
                                height="40px"
                                style={{ width: { xs: '100%', md: 170 } }}
                                backgroundColor={'#D9D9D9'}
                                onClick={() => {
                                    setOpenRoomModal(true);
                                }}
                                title={t('Services.AddRoom')}
                                icon={<img src={room} style={{ width: 20, height: 20, marginTop : 8 }} />}
                            />

                            <CommonButton
                                height="40px"
                                style={{ width: { xs: '100%', md: 170 } }}
                                backgroundColor={'#D9D9D9'}
                                onClick={() => {
                                    setType('create');
                                    setSelectedServiceGroup(null);
                                    setShowAddGroupModal(true);
                                }}
                                title={t('Services.AddGroup')}
                                icon={<img src={menu} style={{marginTop : 8}} />}
                            />

                            <CommonButton
                                height="40px"
                                style={{ width: { xs: '100%', md: language === 'en' ? 170 : 200 } }}
                                onClick={() => {
                                    setType('create');
                                    setSelectedItem(null);
                                    setShowModal(true);
                                }}
                                title={`+ ${t('Services.AddService')}`}
                            />
                        </Stack>
                    </>
                )}

                <Grid2 spacing={2} container>
                    <Grid2 sx={{ mt: { xs: 2, md: 0 } }} size={{ xs: 12, md: 3 }}>
                        <PrimaryHeading text={t('Services.CRUDServices')} />
                        <SecondaryHeading text={t('Services.ServiceSubHeading')} />
                    </Grid2>
                    {/* <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} > */}

                    <Grid2
                        sx={{ mt: { xs: 2, md: 0 }, scrollbarWidth: 'none', overflowX: 'scroll' }}
                        size={{ xs: 12, md: 9 }}
                    >
                        {isLoading ? (
                            <Stack
                                width="98%"
                                spacing={2}
                                flex={1}
                                flexDirection={'column'}
                                alignItems={'flex-end'}
                                sx={{ mt: 2 }}
                            >
                                <Skeleton variant="rounded" width="100%" height={40} />
                                {/* <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} alignItems={'flex-end'}> */}
                                {[...Array(7)].map((_, index) => (
                                    // <Box key={index} sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>

                                    <Skeleton variant="rounded" width="94%" height={40} />

                                    // </Box>
                                ))}
                                {/* </Stack> */}
                            </Stack>
                        ) : (
                            <Stack
                                sx={{
                                    width: '100%',
                                    minWidth: 700,
                                    display: 'flex',
                                }}
                            >
                                {Object.keys(serviceList).length > 0 && (
                                    <MultipleContainers
                                        itemCount={Object.keys(serviceList).length}
                                        items={serviceList}
                                        setItems={setServiceList}
                                        strategy={rectSortingStrategy}
                                        vertical
                                        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                                        onRemove={handleRemove}
                                        onRemoveItem={handleRemoveItem}
                                        onDragToAnotherContainer={(containerId, itemId) => {}}
                                        onDragComplete={(isContainer, containerId, updatedcontainers) => {
                                            let dataToUpdate = [];
                                            if (isContainer) {
                                                let newServiceList = { ...serviceList };
                                                updatedcontainers.map((containerId, index) => {
                                                    if (containerId != 0) {
                                                        dataToUpdate.push({ id: containerId, sequence: index });
                                                    }
                                                    newServiceList[containerId].sequence = index;
                                                });
                                            } else {
                                                // dataToUpdate.push({ id:activeId, group_id: containerId == '0' ? null : containerId, sequence: 0 })

                                                serviceList[containerId].services.map((serviceObj) => {
                                                    dataToUpdate.push({
                                                        id: serviceObj.id,
                                                        group_id: containerId == '0' ? null : containerId,
                                                        sequence: serviceObj?.sequence,
                                                    });
                                                });
                                            }

                                            sequenceUpdateAPI(dataToUpdate, isContainer);
                                        }}
                                        onclickItem={(e) => {
                                            setType('edit');
                                            setSelectedItem(e);
                                            setShowModal(true);
                                        }}
                                        onclickContainer={(e) => {
                                            setType('edit');

                                            if (e?.groupId !== null && e?.groupId !== 0) {
                                                setSelectedServiceGroup(e);
                                                setShowAddGroupModal(true);
                                            }
                                        }}
                                    />
                                )}
                            </Stack>
                        )}
                    </Grid2>

                    {/* </Stack> */}
                </Grid2>
            </Box>

            {(user?.settings.view_service_list || user?.role === 'ADMIN') && openRoomModal && (
                <AddRoomModal
                    fetchRoomData={() => fetchRoomData()}
                    rooms={rooms}
                    open={openRoomModal}
                    onClose={() => setOpenRoomModal(false)}
                />
            )}

            {(user?.settings.view_service_list || user?.role === 'ADMIN') && showModal && (
                <ServiceModal
                    rooms={rooms}
                    type={type}
                    open={showModal}
                    serviceData={serviceData}
                    handleClose={handleClose}
                    selectedItem={selectedItem}
                    isServiceLoading={isServiceLoading}
                    setIsServiceLoading={setIsServiceLoading}
                />
            )}

            {(user?.settings.view_service_list || user?.role === 'ADMIN') && showAddGroupModal && (
                <ServiceGroupModal
                    open={showAddGroupModal}
                    handleClose={handleCloseAddGroupModal}
                    serviceList={serviceList}
                    selectedServiceGroup={selectedServiceGroup}
                    type={type}
                />
            )}

            {(user?.settings.view_service_list || user?.role === 'ADMIN') && showDeleteModal && (
                <CustomDeleteModal
                    open={showDeleteModal}
                    handleClose={handleCloseDeleteModal}
                    description={
                        <>
                            {t('Services.ConfirmMSg')}
                            <span style={{ marginLeft: 5, color: '#1F1F1F', fontWeight: 'bold', marginRight: 5 }}>
                                {itemsToDelete?.type == 'container'
                                    ? itemsToDelete?.container.title
                                    : itemsToDelete?.item.name}
                            </span>
                            {/* {itemsToDelete?.type == 'container' ? 'service group': 'service'} */}
                        </>
                    }
                    onClickDismiss={handleCloseDeleteModal}
                    onClickConfirm={() => handleDelete()}
                />
            )}
        </Stack>
    );
};

export default Services;
