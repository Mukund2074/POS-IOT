import React, { useEffect, useState } from 'react';
import { Skeleton, Stack, Grid2 } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';

import PrimaryHeading from '../../components/settings/commonPrimaryHeading';
import SecondaryHeading from '../../components/settings/commonSecondaryHeading';
import CommonButton from '../../components/settings/commonButton';
import ServiceGroupFrontIcon from '../../assets/addServiceGroup.png';

import AddSpecialOfferModal from '../../components/specialOffer/addSpecialofferModal';
import AddCampaignOfferModal from '../../components/specialOffer/addCampaignOfferModal';
import CustomDeleteModal from '../../components/deleteAlertModal';

import { rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { MultipleContainers } from '../../components/MultipleContainers/MultipleContainers';
import { useSelector } from 'react-redux';
import Notauthorized from '../../components/commonComponents/F_Notauthorized';
import { t } from 'i18next';
import { useLayout } from '../../context/LayoutContext.js';

const Specialoffers = () => {
    const user = useSelector((state) => state.user.data);
    const { isMobile } = useLayout();

    const authTokenUser = localStorage.getItem('auth_token');

    const [isLoading, setIsloading] = useState(false);
    const [createSpecialOfferMoadl, setCreateSpecialOfferModal] = useState(false);
    const [createCampaignOfferMoadl, setCreateCampaignOfferMoadl] = useState(false);
    const [specialOfferList, setSpecialOfferList] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // const [selectedService, setSelectedService] = useState(null);
    // const [showServiceDeleteModal, setShowServiceDeleteModal] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState(null);
    const [selectedSpecialOffer, setSelectedSpecialOffer] = useState(null);
    const [selectedCampaignOffer, setSelectedCampaignOffer] = useState(null);

    useEffect(() => {
        setIsloading(true);
        fetchSpecialOfferApi();
    }, []);

    // if (!user.settings.view_special_offers && user.role !== "ADMIN") {
    //     return <Notauthorized />
    // }
    if (user.role !== 'ADMIN' && !user.settings?.view_special_offers) {
        return <Notauthorized />;
    }

    const transformServiceList = (data) => {
        const groupedSpecialoffer = data
            .filter((group) => group.id !== 0)
            .map((group) => ({
                title: group.name,
                groupId: group.id,
                services: group.special_offers.length > 0 ? group.special_offers : [],
                start_datetime: group.special_offers.length ? group.special_offers[0].start_datetime : null,
                end_datetime: group.special_offers.length ? group.special_offers[0].end_datetime : null,
                sequence: group.sequence,
                marketplace_hidden: group.marketplace_hidden,
            }));
        const ungroupedSpecialoffer = data
            .filter((group) => group.id === 0)
            .flatMap((group) => group.special_offers)
            .map((specialOffer) => ({
                ...specialOffer,
                groupId: 0,
            }));

        const specialOffersListObj = {
            0: {
                title: t('SpOffers.SpOffNoCmp'),
                groupId: 0,
                services: ungroupedSpecialoffer,
                sequence: 0,
            },
        };

        groupedSpecialoffer.map((groupObj) => {
            specialOffersListObj[groupObj?.groupId] = groupObj;
        });

        return specialOffersListObj;

        // return [
        //     {
        //         title: 'Special offers without a campaign',
        //         groupId: 0,
        //         sequence: 0,
        //         // data: ungroupedSpecialoffer,
        //         services: ungroupedSpecialoffer
        //     },
        //     ...groupedSpecialoffer,
        // ];
    };

    async function fetchSpecialOfferApi() {
        // setIsloading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_URL}/api/v1/store/campaign`, {
                headers: {
                    Authorization: `Bearer ${authTokenUser}`,
                },
            });

            if (response) {
                setSpecialOfferList(transformServiceList(response.data.data));
                setIsloading(false);
            } else {
                setSpecialOfferList([]);
                setIsloading(false);
            }
        } catch (error) {
            console.error('Error fetching service data:', error);
            setSpecialOfferList([]);
            setIsloading(false);
        } finally {
            setIsloading(false);
        }
    }

    const deleteServiceAPI = async (id, isGroup = false) => {
        try {
            let serviceURL = `${process.env.REACT_APP_URL}/api/v1/store/special_offer/${id}`;
            if (isGroup) {
                serviceURL = `${process.env.REACT_APP_URL}/api/v1/store/campaign/${id}`;
            }

            const response = await axios.delete(serviceURL, {
                headers: {
                    Authorization: `Bearer ${authTokenUser}`,
                },
            });

            if (response.status == 200) {
                if (isGroup) {
                    toast.success(t('SpOffers.ToastSCmpDel'));
                } else {
                    toast.success(t('SpOffers.ToastSOffDel'));
                }
                fetchSpecialOfferApi();
            } else {
                if (isGroup) {
                    toast.error(t('SpOffers.ToastErrSCmpDel'));
                } else {
                    toast.error(t('SpOffers.ToastErrSOffDel'));
                }
            }
        } catch (error) {
            toast.error(t('Services.ToastErrDeleteService'));
            console.error('ERROR ', error);
        }
    };

    const sequenceUpdateAPI = async (data, isGroup = false) => {
        try {
            let serviceURL = `${process.env.REACT_APP_URL}/api/v1/store/special_offer/sequence`;
            if (isGroup) {
                serviceURL = `${process.env.REACT_APP_URL}/api/v1/store/campaign/sequence`;
            }

            const response = await axios.post(serviceURL, data, {
                headers: {
                    Authorization: `Bearer ${authTokenUser}`,
                },
            });

            if (response.status == 200) {
                toast.success(t('Services.ToastUpSuccess'));
                // fetchSpecialOfferApi();
            } else {
                toast.error(t('Services.ToastUpErr'));
            }
        } catch (error) {
            toast.error(t('Services.ToastUpErr'));
            console.error('ERROR ', error);
        }
    };

    const handleSpecialOfferRowClick = (dataItem) => {
        setSelectedSpecialOffer(dataItem);
        setCreateSpecialOfferModal(true);
    };

    const handleCampaignRowClick = (campaign) => {
        if (campaign.groupId === 0) {
            return;
        }
        setSelectedCampaignOffer(campaign);
        setCreateCampaignOfferMoadl(true);
    };

    const handleClose = (command) => {
        setCreateSpecialOfferModal(false);
        setSelectedSpecialOffer(null);
        if (command) {
            setIsloading(true);
            fetchSpecialOfferApi();
        }
    };

    const handleCloseCampaignOffer = (command) => {
        setCreateCampaignOfferMoadl(false);
        setSelectedCampaignOffer(null);
        if (command) {
            setIsloading(true);
            fetchSpecialOfferApi();
        }
        // fetchSpecialOfferApi();
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    // const handleCloseServiceDeleteModal = () => {
    //     setShowServiceDeleteModal(false);
    // };

    function handleRemove(containerID) {
        setItemsToDelete({
            containerId: containerID,
            type: 'container',
            itemId: null,
            container: specialOfferList[containerID],
            item: null,
        });
        setShowDeleteModal(true);
    }

    function handleRemoveItem(itemId, containerID) {
        setItemsToDelete({
            containerId: containerID,
            type: 'item',
            itemId: itemId,
            container: specialOfferList[containerID],
            item: specialOfferList[containerID].services.find((serviceObj) => serviceObj?.id == itemId)?.service,
        });
        setShowDeleteModal(true);
    }

    const handleDelete = async () => {
        if (itemsToDelete) {
            let newSpecialOfferList = { ...specialOfferList };
            const containerId = itemsToDelete?.containerId;
            if (itemsToDelete?.type == 'container') {
                delete newSpecialOfferList[containerId];
                setSpecialOfferList(newSpecialOfferList);
                deleteServiceAPI(containerId, true);
            } else {
                const itemId = itemsToDelete?.itemId;
                let updatedItems = newSpecialOfferList[containerId].services.filter(
                    (serviceObj) => serviceObj?.id !== itemId,
                );
                let newContainer = { ...newSpecialOfferList[containerId], services: updatedItems };
                setSpecialOfferList({ ...newSpecialOfferList, [containerId]: newContainer });
                deleteServiceAPI(itemId, false);
            }
            setShowDeleteModal(!showDeleteModal);
        }
    };

    return (
        <Stack>
            <Grid2 sx={{ bgcolor: '#fff', p: { xs: 2, md: 3 }, borderRadius: 10 }} container spacing={3}>
                {(user?.role === 'ADMIN' || user?.settings?.crud_special_offers) && (
                    <Grid2
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'flex-end',
                            gap: 3,
                            mt: isMobile && 5,
                        }}
                        size={{ xs: 12, md: 12 }}
                    >
                        <CommonButton
                            height="40px"
                            style={{ width: 'auto', minWidth: 180 }}
                            backgroundColor={'#D9D9D9'}
                            onClick={() => {
                                setCreateCampaignOfferMoadl(true);
                            }}
                            title={
                                <>
                                    <img
                                        src={ServiceGroupFrontIcon}
                                        alt="icon"
                                        style={{
                                            // width: 20,
                                            height: 12,
                                            marginRight: 15,
                                        }}
                                    />
                                    {t('SpOffers.AddCmp')}
                                </>
                            }
                        />

                        <CommonButton
                            // width="257px"
                            height="40px"
                            style={{ width: 'auto', minWidth: 180 }}
                            onClick={() => {
                                setCreateSpecialOfferModal(true);
                            }}
                            title={`+ ${t('SpOffers.AddSingleOff')} `}
                        />
                    </Grid2>
                )}

                <Grid2 size={{ xs: 12, md: 3 }}>
                    <PrimaryHeading fontSize="22px" text={t('SpOffers.SpOffers')} />

                    <SecondaryHeading fontSize="20px" text={t('SpOffers.SpOffersDes')} />
                </Grid2>

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
                            {Object.keys(specialOfferList).length > 0 && (
                                <MultipleContainers
                                    itemCount={Object.keys(specialOfferList).length}
                                    items={specialOfferList}
                                    setItems={setSpecialOfferList}
                                    strategy={rectSortingStrategy}
                                    vertical
                                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                                    onRemove={handleRemove}
                                    onRemoveItem={handleRemoveItem}
                                    onDragToAnotherContainer={(containerId, itemId) => {}}
                                    onDragComplete={(isContainer, containerId, updatedcontainers) => {
                                        let dataToUpdate = [];
                                        if (isContainer) {
                                            let newServiceList = { ...specialOfferList };
                                            updatedcontainers.map((containerId, index) => {
                                                if (containerId != 0) {
                                                    dataToUpdate.push({ id: containerId, sequence: index });
                                                }
                                                newServiceList[containerId].sequence = index;
                                            });

                                            setSpecialOfferList(newServiceList);
                                        } else {
                                            specialOfferList[containerId].services.map((serviceObj) => {
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
                                        setSelectedSpecialOffer(e);
                                        setCreateSpecialOfferModal(true);
                                    }}
                                    onclickContainer={(e) => {
                                        if (e?.groupId !== null && e?.groupId !== 0) {
                                            setSelectedCampaignOffer(e);
                                            setCreateCampaignOfferMoadl(true);
                                        }
                                    }}
                                />
                            )}
                        </Stack>
                    )}
                </Grid2>
            </Grid2>

            {createSpecialOfferMoadl && (
                <AddSpecialOfferModal
                    user={user}
                    open={createSpecialOfferMoadl}
                    handleClose={handleClose}
                    selectedSpecialOffer={selectedSpecialOffer}
                    type={selectedSpecialOffer ? 'edit' : 'create'}
                />
            )}

            {createCampaignOfferMoadl && (
                <AddCampaignOfferModal
                    user={user}
                    open={createCampaignOfferMoadl}
                    handleClose={handleCloseCampaignOffer}
                    selectedCampaignOffer={selectedCampaignOffer}
                    type={selectedCampaignOffer ? 'edit' : 'create'}
                />
            )}

            {showDeleteModal && (
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

export default Specialoffers;
