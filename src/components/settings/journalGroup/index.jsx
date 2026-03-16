import React, { useEffect, useState } from 'react';
import { Typography, Stack, Divider, Skeleton, Grid2 } from '@mui/material';
import PrimaryHeading from '../commonPrimaryHeading';
import SecondaryHeading from '../commonSecondaryHeading';
import apiFetcher from '../../../utils/interCeptor';
import { toast } from 'react-toastify';
import { MultipleContainers } from '../../MultipleContainers/MultipleContainers';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useSelector } from 'react-redux';
import CreateJournalGroup from './createJournalGroup';
import CreateJournalGroupTemplate from './createJournalGroupTemplate';
import CustomDeleteModal from '../../deleteAlertModal';
import { t } from 'i18next';
import { HttpStatusCode } from 'axios';
import { dividerSx } from '../../../scenes/Settings/Index';

const JournalGroupSettingsOption = () => {
    const user = useSelector((state) => state.user.data);
    const [showCreateJournalGroupModal, setShowCreateJournalGroupModal] = useState(false);
    const [showCreateJournalGroupTemplateModal, setShowCreateJournalGroupTemplateModal] = useState(false);
    const [reOrderJournalGroup, setReorderJournalGroup] = useState({});
    const [reOrderJournalGroupTemplate, setReOrderJournalGroupTemplate] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedJournalGroup, setSelectedJournalGroup] = useState(null);
    const [showJournalGroupsDeleteModal, setShowJournalGroupsDeleteModal] = useState(false);
    const [containerOrItem, setContainerOrItem] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [conatinerIdOfJournalGroup, setConatinerIdOfJournalGroup] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetchJournalGroups();
    }, []);

    const transformJournalGroupTemplateList = (data) => {
        const journalGroupTemplate = {};
        const globalTemplateIdCounter = {};

        for (const group of data) {
            const services = group.templates.map((service) => ({
                ...service,
                template: true,
            }));
            const uniqueTemplates = [];

            for (const service of services) {
                if (globalTemplateIdCounter[service.id] === undefined) {
                    globalTemplateIdCounter[service.id] = 1;
                } else {
                    globalTemplateIdCounter[service.id]++;
                }
                const newId =
                    globalTemplateIdCounter[service.id] === 1
                        ? service.id
                        : `${service.id}-${globalTemplateIdCounter[service.id]}`;
                uniqueTemplates.push({ ...service, id: newId });
            }

            journalGroupTemplate[group.id || 0] = {
                title: group.name === 'Unassigned Templates' ? t('Common.UngroupedJournals') : group.name,
                groupId: group.id || 0,
                showDeleteIcon: false,
                services: uniqueTemplates,
                sequence: group.sequence,
            };
        }
        setReOrderJournalGroupTemplate(journalGroupTemplate);
    };

    const fetchJournalGroups = async () => {
        try {
            const response = await apiFetcher.get(`api/v1/store/journal/group/list`);
            if (response.status === HttpStatusCode.Ok) {
                const data = response?.data?.data;
                const filteredData = data.filter((item) => typeof item.id === 'number' && !isNaN(item.id));

                transformJournalGroupTemplateList(data);

                let journalGroupObj = {};
                filteredData.map((dataObj) => {
                    journalGroupObj[dataObj?.id] = {
                        ...dataObj,
                        id: dataObj?.id,
                        title: dataObj.name,
                        groupId: dataObj?.id,
                        templates: [],
                        services: [],
                        noSubGroup: true,
                        forJournal: true,
                    };
                });

                setReorderJournalGroup(journalGroupObj);
            }
        } catch (error) {
            toast.error(t('Setting.FailedToFetchJournalGroupList'));
        } finally {
            setLoading(false);
        }
    };

    const removeJournalGroup = (id) => {
        const matchedObject = reOrderJournalGroup[id];
        if (matchedObject) {
            setSelectedJournalGroup(matchedObject);
            setShowJournalGroupsDeleteModal(true);
        }
    };

    const removeJournalGroupItem = async (id) => {
        try {
            const response = await apiFetcher.delete(`api/v1/store/journal/group/${id}`);
            if (response.data.success) {
                toast.success(t('Setting.JournalGroupDeleted'));
                handleCloseJournalGroupDeleteModal();
                setSelectedJournalGroup(null);
                fetchJournalGroups();
                return;
            } else {
                toast.error(t('Setting.FailedToDeletejournalGroup'));
                handleCloseJournalGroupDeleteModal();
                setSelectedJournalGroup(null);
            }
        } catch (error) {
            toast.error(t('Setting.FailedToDeletejournalGroup'));
            handleCloseJournalGroupDeleteModal();
            setSelectedJournalGroup(null);
        }
    };

    const handleCloseJournalGroupDeleteModal = () => {
        setConatinerIdOfJournalGroup(null);
        setShowJournalGroupsDeleteModal(!showJournalGroupsDeleteModal);
    };

    async function updateJournalGroupSequence(payload) {
        try {
            const response = await apiFetcher.post('/api/v1/store/journal/group/sequence', payload);
            const { success } = response.data;
            if (success) {
                fetchJournalGroups();
                toast.success(t('Setting.JournalGroupsOrderUpdated'));
            }
        } catch (err) {
            toast.error(t('Setting.FailedToUpdateJournalGroupsOrder'));
        }
    }

    function handleRemoveItem(itemId, containerID) {
        setConatinerIdOfJournalGroup(containerID);
        setContainerOrItem('item');
        const container = Object.values(reOrderJournalGroupTemplate).find(
            (container) => container.groupId === containerID,
        );

        if (container) {
            const item = container.services.find((service) => service.id === itemId);
            setSelectedJournalGroup(item);
            setShowJournalGroupsDeleteModal(true);
        }
    }

    const removeJournalGroupTemplate = async (id) => {
        try {
            let templateId = id;
            let actualTemplateId;

            if (typeof templateId === 'string' && templateId.includes('-')) {
                actualTemplateId = templateId.split('-')[0];
            } else {
                actualTemplateId = templateId;
            }

            const response = await apiFetcher.delete(
                `api/v1/store/journal/template/group/${actualTemplateId}?group_id=${conatinerIdOfJournalGroup}`,
            );
            if (response.data.success) {
                toast.success(t('Setting.JournalGroupTemplateDeleted'));
                handleCloseJournalGroupDeleteModal();
                setSelectedJournalGroup(null);
                fetchJournalGroups();
                return;
            } else {
                toast.error(t('Setting.FailedToDeleteJournalGroupTemplate'));
                handleCloseJournalGroupDeleteModal();
                setSelectedJournalGroup(null);
            }
        } catch (error) {
            toast.error(t('Setting.FailedToDeleteJournalGroupTemplate'));
            handleCloseJournalGroupDeleteModal();
            setSelectedJournalGroup(null);
        }
    };

    const sequenceUpdateAPI = async (data, isGroup = false) => {
        const updatedData = data.map((item) => {
            if (typeof item.id === 'string' && item.id.includes('-')) {
                item.id = parseInt(item.id.split('-')[0], 10);
            }
            return item;
        });

        try {
            const response = await apiFetcher.post('/api/v1/store/journal/template/sequence', updatedData);
            const { success } = response.data;
            if (success) {
                fetchJournalGroups();
                toast.success(t('Setting.JournalGroupsTemplateOrderUpdated'));
            }
        } catch (err) {
            toast.error(t('Setting.FailedToUpdateJournalGroupsTemplateOrder'));
        }
    };

    return (
        <Stack sx={{ p: { xs: 2, md: 2 } }}>
            <Stack sx={{ bgcolor: '#fff', borderRadius: '25px', minHeight: '86vh' }}>
                {(user?.role === 'ADMIN' || user?.settings.view_all_employees) && (
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Common.JournalGroups')} />
                            <SecondaryHeading text={t('Setting.HereYouCanCreateAndEditJournalGroups')} />
                        </Grid2>

                        <Grid2
                            size={{ xs: 12, md: 8 }}
                            sx={{ width: '100%', overflow: 'hidden', scrollbarWidth: 'none' }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F', ml: 5 }}>
                                {t('Setting.NameOfGroup')}
                            </Typography>

                            {loading ? (
                                <Stack
                                    sx={{
                                        width: 'auto',
                                        marginLeft: 2.5,
                                        marginRight: 1,
                                        mt: 2,
                                        mb: 1,
                                    }}
                                >
                                    {[...Array(4)].map((_, index) => (
                                        <Skeleton variant="rounded" width="100%" height={40} sx={{ mt: 1 }} />
                                    ))}
                                </Stack>
                            ) : (
                                <Stack
                                    sx={{
                                        width: '100%',
                                        overflowX: 'scroll',
                                        scrollbarWidth: 'none',
                                    }}
                                >
                                    {Object.keys(reOrderJournalGroup).length > 0 && (
                                        <MultipleContainers
                                            modelType={'Journal-Groups'}
                                            itemCount={Object.keys(reOrderJournalGroup).length}
                                            items={reOrderJournalGroup}
                                            setItems={setReorderJournalGroup}
                                            strategy={rectSortingStrategy}
                                            vertical
                                            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                                            onDragToAnotherContainer={(containerId, itemId) => {}}
                                            onDragComplete={(isContainer, containerId, updatedcontainers) => {
                                                let dataToUpdate = [];
                                                if (isContainer) {
                                                    let newjournalGroups = { ...reOrderJournalGroup };
                                                    updatedcontainers.map((containerId, index) => {
                                                        if (containerId != 0) {
                                                            dataToUpdate.push({
                                                                id: containerId,
                                                                sequence: index,
                                                            });
                                                        }
                                                        newjournalGroups[containerId].sequence = index;
                                                    });

                                                    setReorderJournalGroup(newjournalGroups);
                                                    updateJournalGroupSequence(dataToUpdate);
                                                }
                                            }}
                                            onclickContainer={(e) => {
                                                setShowCreateJournalGroupModal(!showCreateJournalGroupModal);
                                                setSelectedJournalGroup(e);
                                            }}
                                            onRemove={(e) => {
                                                setContainerOrItem('container');
                                                removeJournalGroup(e);
                                            }}
                                        />
                                    )}
                                </Stack>
                            )}

                            <Stack
                                onClick={() => {
                                    setSelectedJournalGroup(null);
                                    setShowCreateJournalGroupModal(true);
                                }}
                                sx={{
                                    width: '98%',
                                    mt: 1,
                                    p: 1,
                                    backgroundColor: '#ffffff',
                                    borderRadius: '15px',
                                    border: '1px solid #D9D9D9',
                                    cursor: 'pointer',
                                    maxHeight: 40,
                                    ml: 'auto',
                                }}
                            >
                                <Typography sx={{ width: 400, size: '20px', color: '#A0A0A0' }}>
                                    {t('Setting.AddNewJournalGroup')}
                                </Typography>
                            </Stack>
                        </Grid2>
                    </Grid2>
                )}

                <Divider sx={{ ...dividerSx }} />

                {(user?.role === 'ADMIN' || user?.settings.view_all_employees) && (
                    <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <PrimaryHeading text={t('Setting.JournalGroupTemplates')} />
                            <SecondaryHeading text={t('Setting.Description13')} />
                        </Grid2>

                        <Grid2
                            size={{ xs: 12, md: 8 }}
                            sx={{ width: '100%', overflow: 'hidden', scrollbarWidth: 'none' }}
                        >
                            {loading ? (
                                <Stack
                                    sx={{
                                        width: 'auto',
                                        marginLeft: 2.5,
                                        marginRight: 1,
                                        mt: 2,
                                        mb: 1,
                                    }}
                                >
                                    <Skeleton variant="rounded" width="100%" height={40} />
                                    {[...Array(7)].map((_, index) => (
                                        <Skeleton
                                            variant="rounded"
                                            width="94%"
                                            height={40}
                                            sx={{ mt: 1, alignSelf: 'flex-end' }}
                                        />
                                    ))}
                                </Stack>
                            ) : (
                                <Stack
                                    sx={{
                                        width: '100%',
                                        overflowX: 'scroll',
                                        scrollbarWidth: 'none',
                                    }}
                                >
                                    <MultipleContainers
                                        itemCount={Object.keys(reOrderJournalGroupTemplate).length}
                                        items={reOrderJournalGroupTemplate}
                                        setItems={setReOrderJournalGroupTemplate}
                                        strategy={rectSortingStrategy}
                                        vertical
                                        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                                        onRemoveItem={handleRemoveItem}
                                        onDragToAnotherContainer={(containerId, itemId) => {}}
                                        onDragComplete={(isContainer, containerId, updatedcontainers) => {
                                            let dataToUpdate = [];
                                            if (isContainer) {
                                                let newServiceList = { ...reOrderJournalGroupTemplate };
                                                updatedcontainers.map((containerId, index) => {
                                                    if (containerId != 0) {
                                                        dataToUpdate.push({
                                                            id: containerId,
                                                            sequence: index,
                                                        });
                                                    }
                                                    newServiceList[containerId].sequence = index;
                                                });
                                                setReOrderJournalGroupTemplate(newServiceList);
                                            } else {
                                                reOrderJournalGroupTemplate[containerId].services.map((serviceObj) => {
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
                                            setSelectedTemplate(e);
                                            setShowCreateJournalGroupTemplateModal(true);
                                        }}
                                        onclickContainer={(e) => {}}
                                    />
                                </Stack>
                            )}

                            <Stack
                                onClick={() => {
                                    setSelectedTemplate(null);
                                    setShowCreateJournalGroupTemplateModal(true);
                                }}
                                sx={{
                                    width: '98%',
                                    mt: 1,
                                    p: 1,
                                    backgroundColor: '#ffffff',
                                    borderRadius: '15px',
                                    border: '1px solid #D9D9D9',
                                    cursor: 'pointer',
                                    maxHeight: 40,
                                    ml: 'auto',
                                }}
                            >
                                <Typography sx={{ width: 400, size: '20px', color: '#A0A0A0' }}>
                                    {t('Setting.AddNewJournalTemplate')}
                                </Typography>
                            </Stack>
                        </Grid2>
                    </Grid2>
                )}

                {showCreateJournalGroupModal && (
                    <CreateJournalGroup
                        open={showCreateJournalGroupModal}
                        data={null}
                        handleRemove={() => {
                            setShowCreateJournalGroupModal(false);
                        }}
                        selectedJournalGroup={selectedJournalGroup}
                        onClose={() => {
                            fetchJournalGroups();
                            setShowCreateJournalGroupModal(!showCreateJournalGroupModal);
                        }}
                    />
                )}

                {showCreateJournalGroupTemplateModal && (
                    <CreateJournalGroupTemplate
                        open={showCreateJournalGroupTemplateModal}
                        data={null}
                        handleRemove={() => {
                            setShowCreateJournalGroupTemplateModal(false);
                        }}
                        journalGroupData={reOrderJournalGroup}
                        selectedTemplate={selectedTemplate}
                        setData={(data) => {}}
                        onClose={() => {
                            fetchJournalGroups();
                            setShowCreateJournalGroupTemplateModal(!showCreateJournalGroupTemplateModal);
                        }}
                    />
                )}

                {showJournalGroupsDeleteModal && (
                    <CustomDeleteModal
                        open={showJournalGroupsDeleteModal}
                        handleClose={handleCloseJournalGroupDeleteModal}
                        description={
                            <>
                                {t('Setting.AreYouSureYouWantToDelete')}
                                <span
                                    style={{
                                        marginLeft: 5,
                                        color: '#1F1F1F',
                                        fontWeight: 'bold',
                                        marginRight: 5,
                                    }}
                                >
                                    {selectedJournalGroup?.name}
                                </span>
                            </>
                        }
                        onClickDismiss={handleCloseJournalGroupDeleteModal}
                        onClickConfirm={() => {
                            if (containerOrItem == 'container') {
                                removeJournalGroupItem(selectedJournalGroup.id);
                            } else {
                                removeJournalGroupTemplate(selectedJournalGroup.id);
                            }
                        }}
                    />
                )}
            </Stack>
        </Stack>
    );
};

export default JournalGroupSettingsOption;
