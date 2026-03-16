import { Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import FButton from '../../../commonComponents/F_Button';
import ArchieveModal from './ArchieveMOdal.jsx';
import ArchiveJournalModal from './ArchiveJournalModal';
import ArchieveFooter from './ArchieveFooter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import apiFetcher from '../../../../utils/interCeptor';
import { toast } from 'react-toastify';
import { useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom';
import { t } from 'i18next';
import CustomDeleteModal from '../../../deleteAlertModal.jsx';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { route } from '../../../../context/routeSlice.js';
import SaveModal from '../Advanced-journal/popup/SaveModal.jsx';

const JournalGroups = ({}) => {
    const [selectedArchieve, setSelectedArchieve] = useState([]);
    const [ArchiveModalOpen, setArchiveModalOpen] = useState(false);
    const [ArchiveJournalModalOpen, setArchiveJournalModalOpen] = useState(false);
    const [Archieve, setArchieve] = useState([]);
    const [name, setName] = useState('');
    const [Logs, setLogs] = useState([]);
    const [updatedDate, setUpdatedDate] = useState('');
    const { id } = useParams();
    const [isLoading, setLoading] = useState(false);
    const [logsProvoke, setLogsProvoke] = useState(0);
    const [dataa, setData] = useState([]);
    const [prove, setProvoke] = useState(0);
    const [isDirty, setIsDirty] = useState([]);
    const [showeditModal, setShowEditModal] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const routee = useSelector((state) => state.route.route);
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.data);
    const settings = useSelector((state) => state?.settings.data);

    useEffect(() => {
        if (!settings?.profile?.allow_journal) {
            navigate('/customers');
        }
    }, []);

    async function UpdateViewLogs(jid) {
        try {
            const res = await apiFetcher(
                `/api/v1/store/journal/log_open_event?journal_id=${jid}&employee_id=${user?.id}`,
            );
        } catch (error) {
            console.error('error', error);
        }
    }

    useBlocker(
        (tx) => {
            if (isDirty.length > 0 && !showeditModal) {
                // Block only if modal is closed
                setShowEditModal(true);
                return true; // Block navigation
            }
            return false; // Allow navigation
        },
        isDirty, // Block only when isDirty has values
    );

    const handleBeforeUnload = (event) => {
        if (isDirty.length > 0) {
            window.onbeforeunload = function () {
                return;
            };
            event.preventDefault();
            event.returnValue = ''; // Required for Chrome
        }
    };

    useEffect(() => {
        if (isDirty?.length > 0) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        } else {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    const changeSequence = (group_id, direction) => {
        const currentIndex = dataa.findIndex((group) => group.group_id === group_id);

        if (currentIndex === -1) {
            toast.error('Group not found in the data.');
            return;
        }

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Validate the target index
        if (targetIndex < 0 || targetIndex >= dataa.length) {
            toast.error('Invalid target index. Cannot move beyond array bounds.');
            return; // Return unchanged data if target index is out of bounds
        }

        const obj = [
            { id: dataa[currentIndex].group_id, sequence: targetIndex },
            { id: dataa[targetIndex].group_id, sequence: currentIndex },
        ];

        swap(obj);

        // setData((prevData) => {
        //   // Find the index of the group to move
        //   const currentIndex = prevData.findIndex((group) => group.group_id === group_id);

        //   // Validate the current index
        //   if (currentIndex === -1) {
        //     console.error("Group not found in the data.");
        //     return prevData; // Return unchanged data if group is not found
        //   }

        //   // Calculate the target index based on the direction
        //   const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

        //   // Validate the target index
        //   if (targetIndex < 0 || targetIndex >= prevData.length) {
        //     console.error("Invalid target index. Cannot move beyond array bounds.");
        //     return prevData; // Return unchanged data if target index is out of bounds
        //   }

        //   // Create a new array with updated sequence values
        //   const newData = prevData.map((group) => {
        //     if (group.group_id === prevData[currentIndex].group_id) {
        //       return { ...group, group_sequence: targetIndex };
        //     }
        //     if (group.group_id === prevData[targetIndex].group_id) {
        //       return { ...group, group_sequence: currentIndex };
        //     }
        //     return group; // Leave other groups unchanged
        //   });

        //   // Sort the array based on the updated sequence values
        //   const sortedData = [...newData].sort((a, b) => a.group_sequence - b.group_sequence);

        //   // Prepare the payload for the API request
        //   const obj = [
        //     { id: prevData[currentIndex].group_id, sequence: targetIndex },
        //     { id: prevData[targetIndex].group_id, sequence: currentIndex },
        //   ];

        //   // Send the API request with the updated sequence values
        //   swap(obj);

        //   // Return the sorted data to update the state
        //   return sortedData;
        // });
    };

    const swap = async (obj) => {
        try {
            await apiFetcher
                .post(`/api/v1/store/journal/group/customer_sequence?outlet_customer_id=${id}`, obj)
                .then((res) => {
                    if (res.data.success) {
                        toast.success(res.data.msg);
                        setProvoke(prove + 1);
                    }
                });
        } catch (error) {
            console.error('error', error);
        }
    };

    useEffect(() => {
        async function getdata() {
            setLoading(true);
            try {
                const res = await apiFetcher.get(`api/v1/store/journal/web?outlet_customer_id=${id}`);

                setArchieve(res.data.data.archives);
                setData(res.data.data.groups);
                const logvalidation = res.data.data.groups?.map(
                    (group) => group.journals.length > 0 && group.journals[0].id,
                );
                const confValid = logvalidation?.length > 0 && logvalidation.find((i) => i !== null && i !== false);

                if (confValid) {
                    UpdateViewLogs(confValid);
                }
            } catch (error) {
                console.error('error', error);
            } finally {
                setLoading(false);
            }
        }

        getdata();
    }, [prove]);

    useEffect(() => {
        async function getdata() {
            try {
                const res = await apiFetcher.get(`/api/v1/store/journal/logs/${id}`);
                setLogs(res.data.data);
            } catch (error) {
                console.error('error', error);
            }
        }

        getdata();
    }, [logsProvoke]);

    return (
        <Stack id="journal_groups" p={1} m={0}>
            {isLoading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '80vh', // Full height
                    }}
                >
                    <CircularProgress size={'2.5rem'} sx={{ color: '#6f6f6f' }} />
                </Box>
            ) : (
                <Stack sx={{ m: 0, p: 0, width: '100%', height: '100%' }}>
                    <FPrimaryHeading fontColor="#545454" fontSize="22px" text={t('Customer.Archives')} />

                    <Accordion
                        // defaultExpanded
                        disableGutters
                        sx={{
                            boxShadow: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            mt: 2,
                            bgcolor: '#fff',
                            borderRadius: '15px',

                            px: { xs: 1, md: 3 },
                            scrollbarWidth: 'none',
                            overflowX: 'hidden',
                            width: '100%',
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel3-content"
                            id="panel3-header"
                        >
                            <Typography variant="body2" sx={{ fontWeight: 400, color: '#545454', fontSize: 18 }}>
                                {t('Customer.Archives')}
                            </Typography>
                        </AccordionSummary>

                        {Archieve.length > 0 ? (
                            <AccordionDetails
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 1.5,
                                    mt: 0.5,
                                    overflowX: 'scroll',
                                    overflowY: 'hidden',
                                    scrollbarWidth: 'none',
                                }}
                            >
                                {Archieve.length > 0 ? (
                                    Archieve.map((item) => {
                                        return (
                                            <Box
                                                component={'button'}
                                                onClick={() => {
                                                    setName(item.name);
                                                    setArchiveModalOpen(true);
                                                    setSelectedArchieve(item.id);
                                                    setUpdatedDate(item.updated_at);
                                                }}
                                                key={item.id}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 0,
                                                    border: '1.5px solid #D9D9D9',
                                                    borderRadius: 3.5,
                                                    p: 1,
                                                    pl: 1.5,

                                                    height: '40%',
                                                    minWidth: 155,
                                                    maxWidth: 160,
                                                    backgroundColor: selectedArchieve === item.id ? '#D9D9D9' : 'white',
                                                }}
                                            >
                                                <Typography
                                                    textAlign="start"
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 400,
                                                        color: '#554455',
                                                        fontSize: 16,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: '150px', // Adjust as needed
                                                    }}
                                                >
                                                    {item.name}
                                                </Typography>

                                                <Typography
                                                    textAlign={'start'}
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 400,
                                                        color: '#554455',
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    {item.created_at.split('T')[0]}
                                                </Typography>
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Typography
                                        sx={{
                                            textAlign: 'center',
                                            fontSize: '20px',
                                            fontWeight: '600',
                                            color: 'rgba(0, 0, 0, 0.6)',
                                            mb: 2,
                                        }}
                                    >
                                        {t('Customer.NoLogs')}
                                    </Typography>
                                )}{' '}
                            </AccordionDetails>
                        ) : (
                            <Typography
                                sx={{
                                    textAlign: 'center',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    mb: 3,
                                }}
                            >
                                {t('Customer.NoArchives')}
                            </Typography>
                        )}
                    </Accordion>

                    <Stack
                        sx={{
                            p: 0,
                            m: 0,
                            mt: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            // height: "100%",
                        }}
                    >
                        <Stack
                            sx={{
                                p: 0,
                                m: 0,
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                                // height: "100%",
                            }}
                        >
                            <FPrimaryHeading fontColor="#545454" fontSize="22px" text={t('Common.JournalGroups')} />

                            {/* <Stack sx={{ display: "flex", flexDirection: "row", gap: 2 }}> */}
                            {/* <FButton
                    width="100%"
                    height={40}
                    variant={'save'}
                    title={`+ ${t("Add new group")}`}
                   
                    sx={{ borderRadius: 50, py: 1 , backgroundColor:"#D9D9D9"}}
                /> */}
                            <FButton
                                onClick={() => setArchiveJournalModalOpen(true)}
                                variant={'save'}
                                title={t('Customer.ArchJr')}
                                sx={{ borderRadius: 50, py: 1, height: 40 }}
                            />
                            {/* </Stack> */}
                        </Stack>

                        <ArchieveFooter
                            dataa={dataa}
                            prove={prove}
                            setProvoke={setProvoke}
                            Logs={Logs}
                            setIsDirty={setIsDirty}
                            setLogsProvoke={setLogsProvoke}
                            changeSequence={changeSequence}
                            setData={setData}
                        />
                    </Stack>
                    <ArchieveModal
                        ArchiveModalOpen={ArchiveModalOpen}
                        setArchiveModalOpen={setArchiveModalOpen}
                        selectedArchieve={selectedArchieve}
                        Archieve={Archieve}
                        name={name}
                        updatedDate={updatedDate}
                    />
                    <ArchiveJournalModal
                        selectedArchieve={selectedArchieve}
                        Archieve={Archieve}
                        dataa={dataa}
                        ArchiveJournalModalOpen={ArchiveJournalModalOpen}
                        setArchiveJournalModalOpen={setArchiveJournalModalOpen}
                        setProvoke={setProvoke}
                        prove={prove}
                    />
                </Stack>
            )}

            {isDirty.length > 0 && routee !== 'journalgroups' && (
                <SaveModal
                    dismissColor={'#fff'}
                    dismissBg={'#D9D9D9'}
                    ConfirmColor={'#fff'}
                    ConfirmBg={'#44B904'}
                    ConfirmText={t('Common.Continue')}
                    open={showeditModal}
                    handleClose={() => {
                        setShowEditModal(false);
                        dispatch(route('customers'));
                    }}
                    onClickDismiss={() => {
                        setShowEditModal(false);
                        dispatch(route('customers'));
                    }}
                    onClickConfirm={() => {
                        setIsDirty([]);
                        setShowEditModal(false);
                        navigate(routee);
                    }}
                    title={t('Customer.SaveChangesTitle')}
                    description={t('Customer.SaveChangesDescription')}
                />
            )}
        </Stack>
    );
};

export default JournalGroups;
