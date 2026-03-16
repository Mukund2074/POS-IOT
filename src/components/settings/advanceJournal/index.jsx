import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Skeleton, Grid2, Divider, IconButton } from '@mui/material';
import PrimaryHeading from '../commonPrimaryHeading';
import SecondaryHeading from '../commonSecondaryHeading';
import apiFetcher from '../../../utils/interCeptor';
import { toast } from 'react-toastify';
import { MultipleContainers } from '../../MultipleContainers/MultipleContainers';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useSelector } from 'react-redux';
import CreateJournalGroupTemplate from '../journalGroup/createJournalGroupTemplate';
import CustomDeleteModal from '../../deleteAlertModal';
import { t } from 'i18next';
import TemplateModal from './TemplateModal';
import DeleteIcon from '../../../assets/Delete.svg';
import { HttpStatusCode } from 'axios';
import { dividerSx } from '../../../scenes/Settings/Index';

const AdvanceJournalGroupSettingsOption = () => {
    const user = useSelector((state) => state.user.data);

    const [showModal, setShowModal] = useState({
        template: false,
        attachment: false,
        deleteTemplate: false,
        deleteAttachment: false,
    });
    const [reOrderAdvancedJournalTemplate, setReOrderAdvancedJournalTemplate] = useState({});
    const [editors, setEditors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState({});
    // const [showJournalGroupsDeleteModal, setShowJournalGroupsDeleteModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedAttachment, setSelectedAttachment] = useState();

    const [dataState, setDataState] = useState({
        apiData: null,
        modifiedData: null,
    });

    useEffect(() => {
        setLoading(true);
        fetchJournalAdvancedTemplate();
        getFormats();
    }, []);

    const fetchJournalAdvancedTemplate = async () => {
        try {
            const response = await apiFetcher.get(`api/v1/store/journal/template/list?advance=true`);
            if (response) {
                const data = response?.data?.data;

                let journalGroupObj = {};
                data.map((dataObj) => {
                    journalGroupObj[dataObj?.id] = {
                        ...dataObj,
                        title: dataObj.name,
                        groupId: dataObj?.id,
                        sequence: dataObj?.advance_sequence,
                        templates: [],
                        services: [],
                        noSubGroup: true,
                        forJournal: true,
                    };
                });

                setReOrderAdvancedJournalTemplate(journalGroupObj);
            }
        } catch (error) {
            toast.error(t('Setting.FailedToFetchAdvancedJournalList'));
        } finally {
            setLoading(false);
        }
    };

    const getFormats = async () => {
        try {
            const response = await apiFetcher.get(`api/v1/store/advance_journal/formats`);
            if (response.status === HttpStatusCode.Ok) {
                const data = response?.data?.data;
                setDataState({ modifiedData: data, apiData: data });
                const mapping = {};

                data.forEach((dataItem) => {
                    const { format: TempFormat, ...rest } = dataItem;
                    mapping[dataItem.id] = { ...rest, only_editors: [] };
                    dataItem.format.tabsOptions.forEach((tabOption) => {
                        tabOption.details.forEach((detail) => {
                            detail.fields.forEach((field) => {
                                if (field.type === 'editor') {
                                    mapping[dataItem.id].only_editors.push({
                                        ...field,
                                        attached_templates: field.attached_templates || [],
                                        tabID: tabOption.tab_id,
                                        tabName: tabOption.label,
                                    });
                                }
                            });
                        });
                    });
                });

                setEditors(mapping);
            }
        } catch (error) {
            console.error('Error fetching formats:', error);
        }
    };

    useEffect(() => {
        let updatedObject = {};

        if (editors && Object.keys(editors).length > 0 && Object.keys(reOrderAdvancedJournalTemplate).length > 0) {
            Object.entries(editors).forEach(([key, value]) => {
                value.only_editors.forEach((editor) => {
                    if (editor.attached_templates && editor.attached_templates.length > 0) {
                        editor.attached_templates.forEach((templateId) => {
                            if (!updatedObject[templateId]) {
                                updatedObject[templateId] = [];
                            }
                            updatedObject[templateId].push(editor);
                        });
                    }
                });
            });

            let newData = Object.entries(reOrderAdvancedJournalTemplate).map(([key, value]) => {
                // If the key doesn't exist in updatedObject, set newTemp to an empty array
                return {
                    ...value,
                    newTemp: updatedObject[key] || [], // Ensure empty array if not found
                };
            });

            setDetails(newData);
        }
    }, [editors, reOrderAdvancedJournalTemplate]);

    const removeAdvancedJournalTemplate = (id) => {
        const matchedObject = reOrderAdvancedJournalTemplate[id];

        if (matchedObject) {
            setSelectedTemplate(matchedObject);
            setShowModal((prev) => ({ ...prev, deleteTemplate: true }));
        }
    };

    const removeJournalTemplate = async (id) => {
        const newEditor = Object.entries(editors).map(([key, value], i) => {
            const updatedOnlyEditors = value.only_editors.map((oe) => {
                return {
                    ...oe,
                    attached_templates: oe.attached_templates.filter(
                        (at) => at !== reOrderAdvancedJournalTemplate[id].id,
                    ),
                };
            });

            return {
                [key]: {
                    ...value,
                    only_editors: updatedOnlyEditors,
                },
            };
        });

        const newEditors = Object.assign({}, ...newEditor);

        const newDetails = details.map((item) => {
            if (item.id === reOrderAdvancedJournalTemplate[id].id) {
                return {
                    ...item,
                    newTemp: [],
                };
            }
            return item;
        });

        setEditors(newEditors);
        setDetails(newDetails);

        try {
            const response = await apiFetcher.delete(`api/v1/store/journal/template/${id}`);
            if (response.data.success) {
                toast.success(t('Setting.AdvancedJournalTemplateDeleted'));
                handleCloseModal();
                setSelectedTemplate(null);
                fetchJournalAdvancedTemplate();
                return;
            } else {
                toast.error(t('Setting.FailedToDeleteAdvancedJournalTemplate'));
                handleCloseModal();
                setSelectedTemplate(null);
            }
        } catch (error) {
            toast.error(t('Setting.FailedToDeleteAdvancedJournalTemplate'));
            handleCloseModal();
            setSelectedTemplate(null);
        }
    };

    const handleCloseModal = () => {
        setShowModal({ template: false, attachment: false, deleteTemplate: false, deleteAttachment: false });
        setSelectedTemplate(null);
        setSelectedAttachment(null);
    };

    async function updateJournalGroupSequence(payload) {
        try {
            const response = await apiFetcher.post('/api/v1/store/journal/template/sequence', payload);
            const { success } = response.data;
            if (success) {
                toast.success(t('Setting.AdvancedJournalTemplateOrderUpdated'));
                fetchJournalAdvancedTemplate();
            }
        } catch (err) {
            toast.error(t('Setting.FailedToUpdateAdvancedJournalTemplateOrder'));
        }
    }

    const handleChange = (newValue, id) => {
        setEditors(newValue);

        let updatedObject = {};

        Object.entries(newValue).forEach(([key, value]) => {
            value.only_editors.forEach((editor) => {
                if (editor.attached_templates && editor.attached_templates.length > 0) {
                    editor.attached_templates.forEach((templateId) => {
                        if (!updatedObject[templateId]) {
                            updatedObject[templateId] = [];
                        }
                        updatedObject[templateId].push(editor);
                    });
                }
            });
        });

        let newData = Object.entries(reOrderAdvancedJournalTemplate).map(([key, value]) => {
            return {
                ...value,
                newTemp: updatedObject[key],
            };
        });
        setDetails(newData);

        const eds = Object.entries(editors)
            .map(([key, value]) => {
                if (value.only_editors && value.only_editors.length > 0) {
                    return value.only_editors.map((editor) => {
                        return { ...editor, setup_id: value.id };
                    });
                }
                return []; // Return an empty array if no editors are found
            })
            .flat(); // Flatten to create a single array of editors

        if (dataState && dataState.apiData && dataState.apiData.length > 0) {
            let newData = dataState.apiData.map((item) => {
                // Ensure we're not mutating the existing item object

                // if we do map and return the it will replace the actual state too so its done with spread operator
                return {
                    ...item,
                    format: {
                        ...item.format,
                        tabsOptions: Array.isArray(item.format.tabsOptions)
                            ? item.format.tabsOptions.map((tab) => {
                                  return {
                                      ...tab,
                                      details: Array.isArray(tab.details)
                                          ? tab.details.map((detail) => {
                                                return {
                                                    ...detail,
                                                    fields: Array.isArray(detail.fields)
                                                        ? detail.fields.map((field) => {
                                                              // Check if an editor field matches (based on setup_id, tabID, and field_id)
                                                              const matchingEditor = eds.find(
                                                                  (ed) =>
                                                                      ed.setup_id === item.id &&
                                                                      ed.tabID === tab.tab_id &&
                                                                      ed.field_id === field.field_id,
                                                              );

                                                              // If there's a match, replace the field with the matched editor field
                                                              if (matchingEditor) {
                                                                  return {
                                                                      ...field,
                                                                      attached_templates:
                                                                          matchingEditor.attached_templates || [], // Replace the entire field with the matching editor
                                                                  };
                                                              }

                                                              return field; // If no match, return the field as is
                                                          })
                                                        : detail.fields, // If fields isn't an array, return it as is
                                                };
                                            })
                                          : tab.details, // If details isn't an array, return it as is
                                  };
                              })
                            : item.format.tabsOptions, // If tabsOptions isn't an array, return it as is
                    },
                };
            });

            setDataState((prev) => ({ ...prev, modifiedData: newData }));
            handleSaveChanges({ payload: newData });
        }
    };

    const handleDetach = (prop) => {
        const newEditor = Object.entries(editors).map(([key, value], i) => {
            const updatedOnlyEditors = value.only_editors.map((oe) => {
                if (oe.field_id === prop.item.field_id) {
                    return {
                        ...prop.item,
                        attached_templates: prop.item.attached_templates.filter((at) => at !== prop.value.id),
                    }; // Return the updated value if there's a match
                } else {
                    return oe; // Otherwise, keep the original value
                }
            });

            return {
                [key]: {
                    ...value,
                    only_editors: updatedOnlyEditors,
                },
            };
        });

        const newEditors = Object.assign({}, ...newEditor);
        setEditors(newEditors);
        setDetails((prev) =>
            prev.map((item) => {
                if (item.id === prop.value.id) {
                    return {
                        ...prop.value,
                        newTemp: prop.value?.newTemp.filter((temp) => temp.field_id !== prop.item.field_id),
                    };
                } else {
                    return item;
                }
            }),
        );

        const eds = Object.entries(newEditor)
            .map(([key, value]) => {
                if (value.only_editors && value.only_editors.length > 0) {
                    return value.only_editors.map((editor) => {
                        return { ...editor, setup_id: value.id };
                    });
                }
                return []; // Return an empty array if no editors are found
            })
            .flat(); // Flatten to create a single array of editors

        if (dataState && dataState.apiData && dataState.apiData.length > 0) {
            let newData = dataState.apiData.map((item) => {
                // Ensure we're not mutating the existing item object

                // if we do map and return the it will replace the actual state too so its done with spread operator
                return {
                    ...item,
                    format: {
                        ...item.format,
                        tabsOptions: Array.isArray(item.format.tabsOptions)
                            ? item.format.tabsOptions.map((tab) => {
                                  return {
                                      ...tab,
                                      details: Array.isArray(tab.details)
                                          ? tab.details.map((detail) => {
                                                return {
                                                    ...detail,
                                                    fields: Array.isArray(detail.fields)
                                                        ? detail.fields.map((field) => {
                                                              // Check if an editor field matches (based on setup_id, tabID, and field_id)
                                                              const matchingEditor = eds.find(
                                                                  (ed) =>
                                                                      ed.setup_id === item.id &&
                                                                      ed.tabID === tab.tab_id &&
                                                                      ed.field_id === field.field_id,
                                                              );

                                                              // If there's a match, replace the field with the matched editor field
                                                              if (matchingEditor) {
                                                                  return {
                                                                      ...field,
                                                                      attached_templates:
                                                                          matchingEditor.attached_templates || [], // Replace the entire field with the matching editor
                                                                  };
                                                              }

                                                              return field; // If no match, return the field as is
                                                          })
                                                        : detail.fields, // If fields isn't an array, return it as is
                                                };
                                            })
                                          : tab.details, // If details isn't an array, return it as is
                                  };
                              })
                            : item.format.tabsOptions, // If tabsOptions isn't an array, return it as is
                    },
                };
            });

            setDataState((prev) => ({ ...prev, modifiedData: newData }));
            handleSaveChanges({ payload: newData });
        }
        handleCloseModal();
    };

    const handleSaveChanges = async ({ payload }) => {
        try {
            const response = await apiFetcher.patch(`api/v1/store/advance_journal/formats`, payload);
            if (response.status === HttpStatusCode.Ok) {
                toast.success(t('Setting.AdvancedJournalTemplateUpdated'));
                fetchJournalAdvancedTemplate();
            }
        } catch (error) {
            console.error('Error fetching formats:', error);
            toast.error(t('Setting.FailedToUpdateAdvancedJournalTemplate'));
        }
    };

    return (
        <Stack sx={{ px: { xs: 2, md: 2 }, py: 4 }}>
            <Stack
                spacing={6}
                sx={{
                    mt: 2,
                    bgcolor: '#fff',
                    borderRadius: '25px',
                    minHeight: 'auto',
                    scrollbarWidth: 'none',
                    overflowX: 'hidden',
                }}
            >
                <Stack
                    sx={{
                        display: 'flex',
                        bgcolor: '#FFFFFF',
                        borderRadius: '25px',
                        flexDirection: 'column',
                        width: '100%',
                        p: { xs: 2, md: 5 },
                    }}
                >
                    {(user?.role === 'ADMIN' || user?.settings.view_all_employees) && (
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <PrimaryHeading text={t('Setting.AdvancedJournals')} />
                                <SecondaryHeading text={t('Setting.Description14')} />
                            </Grid2>

                            <Grid2
                                size={{ xs: 12, md: 8 }}
                                sx={{ width: '100%', overflow: 'hidden', scrollbarWidth: 'none' }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F', ml: 5 }}>
                                    {t('Customer.TmpName')}
                                </Typography>

                                {loading ? (
                                    <Stack sx={{ width: 'auto', marginLeft: 2.5, marginRight: 1, mt: 2, mb: 1 }}>
                                        {[...Array(4)].map((_, index) => (
                                            <Skeleton variant="rounded" width="100%" height={40} sx={{ mt: 1 }} />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Stack sx={{ width: '100%', overflowX: 'scroll', scrollbarWidth: 'none' }}>
                                        {Object.keys(reOrderAdvancedJournalTemplate).length > 0 && (
                                            <MultipleContainers
                                                modelType={'Journal-Groups'}
                                                itemCount={Object.keys(reOrderAdvancedJournalTemplate).length}
                                                items={reOrderAdvancedJournalTemplate}
                                                setItems={setReOrderAdvancedJournalTemplate}
                                                strategy={rectSortingStrategy}
                                                vertical
                                                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                                                onDragToAnotherContainer={(containerId, itemId) => {}}
                                                onDragComplete={(isContainer, containerId, updatedcontainers) => {
                                                    let dataToUpdate = [];
                                                    if (isContainer) {
                                                        let newjournalGroups = { ...reOrderAdvancedJournalTemplate };
                                                        updatedcontainers.map((containerId, index) => {
                                                            if (containerId != 0) {
                                                                dataToUpdate.push({
                                                                    id: containerId,
                                                                    sequence: index,
                                                                });
                                                            }
                                                            newjournalGroups[containerId].sequence = index;
                                                        });

                                                        setReOrderAdvancedJournalTemplate(newjournalGroups);
                                                        updateJournalGroupSequence(dataToUpdate);
                                                    }
                                                }}
                                                onclickContainer={(e) => {
                                                    setShowModal({ template: true, attachment: false });
                                                    setSelectedTemplate(e);
                                                }}
                                                onRemove={(e) => removeAdvancedJournalTemplate(e)}
                                            />
                                        )}
                                    </Stack>
                                )}

                                <Stack
                                    onClick={() => {
                                        setSelectedTemplate(null);
                                        setShowModal((prev) => ({ ...prev, template: true }));
                                    }}
                                    px={2}
                                    py={1}
                                    my={1}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '15px',
                                        border: '1px solid #D9D9D9',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        maxHeight: 40,
                                        marginLeft: 2.5,
                                        marginRight: 1,
                                    }}
                                >
                                    <Typography sx={{ width: 400, size: '20px', color: '#A0A0A0', mt: 0.2, mb: 0.2 }}>
                                        {t('Setting.NewJournalTemplate')}
                                    </Typography>
                                </Stack>
                            </Grid2>
                        </Grid2>
                    )}
                </Stack>

                <Divider sx={{ ...dividerSx }} />

                <Grid2 container spacing={3} sx={{ p: { xs: 2, lg: 5 } }}>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <PrimaryHeading text={t('Setting.AttachTemplate')} />

                        <SecondaryHeading text={t('Setting.DescAttachTemplate')} />
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 8 }} sx={{ width: '100%', overflow: 'hidden', scrollbarWidth: 'none' }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F', ml: { md: 5 } }}>
                            {t('Setting.AttachedTemp')}
                        </Typography>

                        <Stack sx={{ width: '100%', overflowX: 'scroll', scrollbarWidth: 'none' }}>
                            {Object.values(details)
                                .filter((val) => val.newTemp && val.newTemp.length > 0) // Only keep entries with templates
                                .map((value, index) => (
                                    <Stack sx={{ px: { md: 2 }, py: 1 }} key={index}>
                                        <Typography
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                backgroundColor: '#d7d7d7',
                                                borderRadius: '15px',
                                                border: '1px solid #D9D9D9',
                                                alignItems: 'center',
                                                maxHeight: 40,
                                                marginLeft: 2.5,
                                                marginRight: 1,
                                                p: 2,
                                            }}
                                        >
                                            {value.name}
                                        </Typography>
                                        <Stack sx={{ flex: 1, width: '100%', gap: 1, pl: { xs: 1, md: 5 }, pt: 2 }}>
                                            {value.newTemp.map((item, index) => (
                                                <Stack
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        backgroundColor: '#fff',
                                                        borderRadius: '15px',
                                                        border: '1px solid #D9D9D9',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        maxHeight: 40,
                                                        marginLeft: 2.5,
                                                        marginRight: 1,
                                                        p: 2,
                                                    }}
                                                >
                                                    <Typography
                                                        noWrap
                                                        onClick={() => {
                                                            setSelectedAttachment({ value, item });
                                                            setShowModal((prev) => ({ ...prev, attachment: true }));
                                                        }}
                                                        sx={{ width: '100%' }}
                                                    >
                                                        {item.name}
                                                    </Typography>

                                                    <IconButton
                                                        onClick={() => {
                                                            setSelectedAttachment({ value, item });
                                                            setShowModal((prev) => ({
                                                                ...prev,
                                                                deleteAttachment: true,
                                                            }));
                                                        }}
                                                        sx={{ ml: 'auto' }}
                                                    >
                                                        <img src={DeleteIcon} alt="DeleteIcon" />
                                                    </IconButton>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Stack>
                                ))}

                            <Stack
                                onClick={() => {
                                    setShowModal({ template: false, attachment: true });
                                }}
                                px={2}
                                py={1}
                                my={1}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '15px',
                                    border: '1px solid #D9D9D9',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    maxHeight: 40,
                                    marginLeft: 2.5,
                                    marginRight: 1,
                                }}
                            >
                                <Typography sx={{ width: 400, size: '20px', color: '#A0A0A0', mt: 0.2, mb: 0.2 }}>
                                    + {t('Setting.AttachTemplate')}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Grid2>
                </Grid2>
            </Stack>

            {showModal?.template && (
                <CreateJournalGroupTemplate
                    open={showModal?.template}
                    data={null}
                    handleRemove={() => {
                        handleCloseModal();
                    }}
                    journalGroupData={reOrderAdvancedJournalTemplate}
                    selectedTemplate={selectedTemplate}
                    onClose={() => {
                        fetchJournalAdvancedTemplate();
                        handleCloseModal();
                    }}
                    advancedJournal
                />
            )}

            {showModal?.attachment && (
                <TemplateModal
                    open={showModal?.attachment}
                    onClose={() => handleCloseModal()}
                    data={{ reOrderAdvancedJournalTemplate, editors, selectedAttachment }}
                    handleChange={handleChange}
                />
            )}

            {showModal.deleteTemplate && (
                <CustomDeleteModal
                    open={showModal.deleteTemplate}
                    handleClose={handleCloseModal}
                    description={
                        <>
                            {t('Setting.AreYouSureYouWantToDelete')}
                            <span style={{ marginLeft: 5, color: '#1F1F1F', fontWeight: 'bold', marginRight: 5 }}>
                                {selectedTemplate?.name}
                            </span>
                        </>
                    }
                    onClickDismiss={handleCloseModal}
                    onClickConfirm={() => {
                        removeJournalTemplate(selectedTemplate.id);
                    }}
                />
            )}

            {showModal.deleteAttachment && (
                <CustomDeleteModal
                    title={t('Setting.DetachSetup')}
                    open={showModal.deleteAttachment}
                    handleClose={handleCloseModal}
                    description={<>{t('Setting.DetachSetupDesc')}</>}
                    onClickDismiss={handleCloseModal}
                    onClickConfirm={() => {
                        handleDetach(selectedAttachment);
                    }}
                />
            )}
        </Stack>
    );
};

export default AdvanceJournalGroupSettingsOption;
