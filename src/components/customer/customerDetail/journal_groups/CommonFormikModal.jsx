import { Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import apiFetcher from '../../../../utils/interCeptor';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import arrow from '../../../../assets/downarchivearrow.png';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/da';
import FormikFooter from './FormikFooter';
import { FooterModalsContainer } from './FooterModalsContainer';
import FormikForm from './FormikForm';
import { t } from 'i18next';
import { HttpStatusCode } from 'axios';

const CommonFormikModal = ({ item, template, changeSequence, setData, dataa, setLogsProvoke, setIsDirty }) => {
    const user = useSelector((state) => state.user.data);

    const [useTemplate, setUSeTemplate] = useState([]);
    const [ispending, setIspending] = useState(false);
    const [isDelete, setISDelete] = useState(false);
    const [ids, SetID] = useState(null);
    const [journals, setJournals] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(null);
    const [JournalDeleteId, setJournalDeleteId] = useState(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [selectedTemplatename, setSelectedTemplateName] = useState('');
    const [initialValues, setInitialValues] = useState({
        type: '',
        writer: '',
        title: '',
        template_id: null,
        journal_entry: '<p><br></p>',
        images: [],
        group_id: null,
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [open, setOpen] = useState(false);
    const { id } = useParams();
    const [storeImages, setStoreImages] = useState([]);
    const [journalImages, setJournalImages] = useState([]);
    const outlet_customer_id = id;

    useEffect(() => {
        setJournals(item.journals);
    }, [dataa]);

    useEffect(() => {
        const val = journals?.find((item) => item.post === false);
        if (val) {
            formik.setValues({
                type: '',
                writer: val?.employee_name ? val?.employee_name : '',
                title: val?.title ? val?.title : '',
                template_id: val?.template_id ? val?.template_id : null,
                journal_entry: val?.journal_entry ? val?.journal_entry : '',
                images: val?.attachments ? val?.attachments : [],
                group_id: val?.group_id ? val?.group_id : null,
            });

            setJournalImages(val?.attachments);
            SetID(val.id);
        } else {
            if (useTemplate?.length > 0) {
                formik.setFieldValue('template_id', useTemplate[0]?.id);
                formik.setFieldValue('journal_entry', useTemplate[0]?.detail);
                setSelectedTemplateName(useTemplate[0]?.name);
            }
            SetID(null);
        }
    }, [journals, dataa, useTemplate]);

    const ValidationSchema = Yup.object({
        title: Yup.string().trim(),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: ValidationSchema,
        onSubmit: (v) => {
            setIspending(true);
            if (v.type === 'post') {
                handlePost();
            } else {
                handleSave();
            }

            // v.type === 'post' ? handlePost() : handleSave();
        },
    });

    function handleChange() {
        const validation =
            _.isEqual(formik.values, initialValues) &&
            _.isEqual(String(formik.values.images), String(initialValues.images));

        if (validation) setIsDirty((prev) => prev?.filter((ite) => ite !== item.group_id));
        else {
            setIsDirty((prev) => {
                return prev?.find((ite) => ite === item.group_id) ? prev : [...prev, item.group_id];
            });
        }
    }

    const handlePost = async () => {
        if (!formik.isValid) return;
        setShowSaveModal(false);
        setIsDirty((prev) => prev?.filter((ite) => ite !== item.group_id));

        // const formdata = new FormData();
        const employee_id = user?.id;
        const cond = journals.find((j) => j.id === ids);
        const search = cond ? true : false;

        moment.locale('da');
        const journal_datetime = moment().format('YYYY-MM-DD HH:mm:ss');
        const payload = {
            template_id: formik.values.template_id ? formik.values.template_id : null,
            title: formik.values.title,
            journal_entry: formik.values.journal_entry,
            employee_id,
            outlet_customer_id,
            post: true,
            group_id: formik.values.group_id == 0 ? null : formik.values.group_id,
            journal_attachments: journalImages?.map((item) => item?.id),
            journal_datetime,
        };

        if (ids) {
            try {
                const response = await apiFetcher.patch(`api/v1/store/journal/${ids}/with-attachments`, payload);
                if (response.data.success) {
                    formik.handleReset();
                    toast.success(t('Customer.JournalResponsePostSuccess'));

                    setLogsProvoke((prev) => prev + 1);
                    setSelectedTemplateName('');

                    if (search) {
                        // if journal already exists then it will  update the dataa

                        setData((prevGroups) => {
                            return prevGroups?.map((group) => {
                                if (group.group_id === item.group_id) {
                                    return {
                                        ...group,
                                        journals: group.journals?.map((journal) =>
                                            journal.id === Number(response.data.data?.logs[0]?.journal_id)
                                                ? {
                                                      ...journal,
                                                      ...payload,
                                                      // ...JSON.parse(jsonData.req_body), // Updating with new data
                                                      attachments: [...response.data.data.attachments],
                                                      created_at: response.data.data.created_at,
                                                  }
                                                : journal,
                                        ),
                                    };
                                }
                                return group;
                            });
                        });
                    } else {
                        // if it is a new journal
                        setJournals((prevJournals) => {
                            return prevJournals?.map((journal) =>
                                journal.id === Number(response.data.data?.logs[0]?.journal_id)
                                    ? {
                                          ...journal,
                                          ...payload,
                                          post: true,
                                          // ...JSON.parse(jsonData.req_body), // Updating with new data
                                          attachments: [...response.data.data.attachments],
                                          created_at: response.data.data.created_at,
                                          employee_name: response.data.data.employee_name,
                                      }
                                    : journal,
                            );
                        });
                    }

                    setJournalImages([]);
                    setInitialValues({
                        type: '',
                        writer: '',
                        title: '',
                        template_id: null,
                        journal_entry: '<p><br></p>',
                        images: [],
                        group_id: null,
                    });
                    formik.handleReset();
                    formik.setValues({
                        type: '',
                        writer: '',
                        title: '',
                        template_id: null,
                        journal_entry: '<p><br></p>',
                        images: [],
                        group_id: null,
                    });
                    setIspending(false);
                }
            } catch (error) {
                toast.error(error);
                setIspending(false);
            }
        } else {
            try {
                const response = await apiFetcher.post(`api/v1/store/journal/with-attachments`, payload);

                if (response.data.success) {
                    setLogsProvoke((prev) => prev + 1);

                    setData((prevGroups) => {
                        return prevGroups?.map((group) => {
                            if (group.group_id === item.group_id) {
                                return {
                                    ...group,
                                    journals: [
                                        {
                                            created_at: response.data.data.created_at,
                                            // ...JSON.parse(jsonData.req_body),
                                            ...payload,
                                            post: true,
                                            id: Number(response.data.data.logs[0].journal_id),
                                            attachments: [...response.data.data.attachments],
                                            employee_name: response.data.data.employee_name,
                                        },
                                        ...group.journals,
                                    ],
                                };
                            }

                            return group;
                        });
                    });

                    setInitialValues({
                        type: '',
                        writer: '',
                        title: '',
                        template_id: null,
                        journal_entry: '<p><br></p>',
                        images: [],
                        group_id: null,
                    });
                    formik.handleReset();
                    formik.setValues({
                        type: '',
                        writer: '',
                        title: '',
                        template_id: null,
                        journal_entry: '<p><br></p>',
                        images: [],
                        group_id: null,
                    });
                    setJournalImages([]);
                    setSelectedTemplateName('');
                    setIspending(false);
                    toast.success(t('Customer.JournalResponsePostSuccess'));
                }
            } catch (error) {
                toast.error(error);
                console.error('error', error);
                setIspending(false);
            }
        }

        const timeout = setTimeout(() => {
            setJournalImages([]);
            formik?.resetForm();
            formik?.setValues(initialValues);
            formik?.handleReset();
        }, 50);
        return () => clearTimeout(timeout);
    };

    useEffect(() => {
        handleChange();
    }, [dataa, formik.values]);
    async function handleSave() {
        if (!formik.isValid) return;

        setShowSaveModal(false);

        setIsDirty((prev) => prev?.filter((ite) => ite !== item.group_id));
        // const formdata = new FormData();
        const employee_id = user?.id;
        const outlet_customer_id = id;
        moment.locale('da');
        const journal_datetime = moment().format('YYYY-MM-DD HH:mm:ss');
        const payload = {
            // remove_attachments: deleteidx,
            template_id: formik.values.template_id ? formik.values.template_id : null,
            title: formik.values.title,
            journal_entry: formik.values.journal_entry,
            employee_id,
            outlet_customer_id,
            journal_attachments: journalImages?.map((item) => item.id),
            post: false,
            group_id: formik.values.group_id === 0 || !formik.values.group_id ? null : formik.values.group_id,
            journal_datetime,
        };

        // formdata.append('req_body', JSON.stringify(requestBody));

        const cond = journals.find((j) => j.id === ids);
        const search = cond ? true : false;

        // if (JSON.stringify(formik.values.images) !== JSON.stringify(img)) {
        //     const newImages = formik.values.images.filter(
        //         (image) => !img.some((existingImage) => _.isEqual(existingImage, image))
        //     );

        //     // newImages.forEach((image) => {
        //     //     if (image instanceof File) {
        //     //         formdata.append('attachments', image);
        //     //     }
        //     // });
        // }

        if (ids) {
            try {
                const response = await apiFetcher.patch(`api/v1/store/journal/${ids}/with-attachments`, payload);

                if (response.data.success) {
                    // setStoreImages(response.data.data.attachments)
                    // const jsonData = Object.fromEntries(formdata);
                    setLogsProvoke((prev) => prev + 1);

                    if (search) {
                        setData((prevGroups) => {
                            return prevGroups?.map((group) => {
                                // Check if the current group matches the target group_id
                                if (group.group_id === item.group_id) {
                                    return {
                                        ...group,
                                        journals: group.journals?.map((journal) =>
                                            journal.id === Number(response.data.data.logs[0]?.journal_id)
                                                ? {
                                                      ...journal,
                                                      ...payload,
                                                      // ...JSON.parse(jsonData.req_body), // Updating with new data
                                                      attachments: [...response.data.data.attachments],
                                                      created_at: response.data.data.created_at,
                                                  }
                                                : journal,
                                        ),
                                    };
                                }
                                return group;
                            });
                        });
                    } else {
                        setData((prevGroups) => {
                            return prevGroups?.map((group) => {
                                if (group.group_id === item.group_id) {
                                    return {
                                        ...group,
                                        journals: [
                                            {
                                                // ...JSON.parse(jsonData.req_body),
                                                ...payload,
                                                id: ids,
                                                attachments: [...response.data.data.attachments],
                                                created_at: response.data.data.created_at,
                                            },
                                            ...group.journals,
                                        ],
                                    };
                                }

                                return group;
                            });
                        });
                    }

                    // setimages([...response.data.data.attachments]);

                    setIspending(false);
                    toast.success(t('Customer.JournalResponseSaveSuccess'));
                }
            } catch (error) {
                toast.error(error);
                console.error('error', error);

                setIspending(false);
            }
        } else {
            try {
                const response = await apiFetcher.post(`api/v1/store/journal/with-attachments`, payload);

                if (response.data.success) {
                    setLogsProvoke((prev) => prev + 1);

                    const updatedGroup = dataa?.map((group) => {
                        if (group?.group_id === item?.group_id) {
                            return {
                                ...group,
                                journals: [
                                    {
                                        ...payload,
                                        id: response.data.data.logs[0].journal_id,
                                        attachments: [...response.data.data.attachments],
                                        created_at: response.data.data.created_at,
                                    },
                                    ...group.journals,
                                ],
                            };
                        }
                        return group;
                    });
                    setData(updatedGroup);
                    // setimages([...formik.values.images]);

                    setIspending(false);

                    toast.success(t('Customer.JournalResponseSaveSuccess'));
                }
            } catch (error) {
                toast.error(error);
                console.error('error', error);
                setIspending(false);
            }
        }
    }

    useEffect(() => {
        if (template && item.group_id) {
            template?.map((itemm) => {
                const hasGroup26 = itemm.templates?.some((templatee) => {
                    const f = templatee.groups.includes(item?.group_id);
                    if (f) {
                        setUSeTemplate((prev) => {
                            if (!prev?.some((item) => item?.id === templatee?.id)) {
                                return [...prev, templatee];
                            }
                            return prev;
                        });
                    }
                });
                return hasGroup26;
            });
        }
    }, [template, item.group_id]);

    // let journal_attachments = [];
    const uploadJournalImages = async (event) => {
        const items = event.target.files; // FileList object
        const filesArray = Array.from(items); // Convert FileList to an array

        if (filesArray?.length > 4) {
            toast.error('You can only upload up to 4 files.');
            return;
        }

        const req_body = JSON.stringify({ employee_id: localStorage.getItem('employee_id') });

        if (items?.length > 0) {
            const fileArray = items;
            let uploadCount = 0;
            const toastId = toast.loading(`${t('Common.Uploading')} 0/${fileArray?.length}...`);

            const uploadNext = async (index) => {
                if (index >= fileArray?.length) {
                    const allSucceeded = uploadCount === fileArray?.length;

                    toast.update(toastId, {
                        render: allSucceeded
                            ? `${t('Common.Uploading')} ${uploadCount}/${fileArray?.length} (100%)`
                            : `${t('Common.Uploading')} ${uploadCount}/${fileArray?.length} (${t(
                                  'Customer.ADVUploadFailed',
                              )})`,
                        isLoading: false,
                        type: allSucceeded ? 'success' : 'error',
                        autoClose: 2000,
                    });

                    return;
                }

                const file = fileArray[index];
                const payload = new FormData();
                payload.append('req_body', req_body);
                payload.append('attachment', file);

                toast.update(toastId, {
                    render: `${t('Common.Uploading')} ${index + 1}/${fileArray?.length} (0%)`,
                    isLoading: true,
                });

                try {
                    const response = await apiFetcher.post(`api/v1/store/journal/attachment`, payload, {
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            toast.update(toastId, {
                                render: `${t('Common.Uploading')} ${index + 1}/${
                                    fileArray?.length
                                } (${percentCompleted}%)`,
                                isLoading: true,
                            });
                        },
                    });

                    if (response.status === HttpStatusCode.Created || response.status === HttpStatusCode.Ok) {
                        setJournalImages((prev) => [...prev, response.data.data]);
                        uploadCount++;
                        toast.update(toastId, {
                            render: `${t('Common.Uploading')} ${index + 1}/${fileArray?.length} (100%)`,
                            isLoading: false,
                            type: 'success',
                            autoClose: 1500,
                        });
                    } else {
                        throw new Error('Unexpected response status');
                    }
                } catch (error) {
                    toast.update(toastId, {
                        render: `${t('Common.Uploading')} ${index + 1}/${fileArray?.length} (Error)`,
                        isLoading: false,
                        type: 'error',
                        autoClose: 2000,
                    });
                    console.error('Error uploading file:', error);
                }

                await uploadNext(index + 1);
            };

            uploadNext(0);
        }

        // return journal_attachments
    };

    const handleRemoveImage = async ({ id }) => {
        try {
            const response = await apiFetcher.delete(`api/v1/store/journal/attachment/${id}`);
            if (response.status === HttpStatusCode.Ok) {
                const newJournalImages = journalImages.filter((item) => item.id !== id);
                setJournalImages(newJournalImages);
            }
        } catch (error) {
            toast.error(t('Customer.ADVRemoveSignErrorToast'));
            console.error(error);
        }
    };

    return (
        <>
            <Stack mb={5} key={item?.group_id}>
                <FormikForm
                    formik={formik}
                    item={item}
                    changeSequence={changeSequence}
                    arrow={arrow}
                    user={user}
                    useTemplate={useTemplate}
                    setSelectedTemplateName={setSelectedTemplateName}
                    setOpen={setOpen}
                    selectedTemplatename={selectedTemplatename}
                    ispending={ispending}
                    template={template}
                    uploadJournalImages={uploadJournalImages}
                    handleRemoveImage={handleRemoveImage}
                    journalImages={journalImages}
                />

                <FormikFooter
                    journals={journals}
                    setShowDeleteModal={setShowDeleteModal}
                    setJournalDeleteId={setJournalDeleteId}
                    setStoreImages={setStoreImages}
                    setIsOpen={setIsOpen}
                    setPhotoIndex={setPhotoIndex}
                    isDelete={isDelete}
                    setUSeTemplate={setUSeTemplate}
                    item={item}
                    setOpen={setOpen}
                    formik={formik}
                    open={open}
                />
            </Stack>

            <FooterModalsContainer
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                photoIndex={photoIndex}
                storeImages={storeImages}
                showSaveModal={showSaveModal}
                setShowSaveModal={setShowSaveModal}
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                JournalDeleteId={JournalDeleteId}
                setISDelete={setISDelete}
                formik={formik}
                item={item}
                journals={journals}
                setData={setData}
            />
        </>
    );
};

export default CommonFormikModal;
