import { Close } from '@mui/icons-material'
import { IconButton, Modal, Paper, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PrimaryHeading from '../../../../settings/commonPrimaryHeading'
import { useFormik, Form, Formik } from "formik";
import * as Yup from "yup";
import FTextInput from '../../../../commonComponents/F_TextInput';
import FSelect from '../../../../commonComponents/F_Select';
import FButton from '../../../../commonComponents/F_Button';
import { useSelector } from 'react-redux';
import apiFetcher from '../../../../../utils/interCeptor';
import { HttpStatusCode } from 'axios';
import { toast } from 'react-toastify';
import { t } from 'i18next';

export default function AddNewJournalForm({ open, onClose, customer, getAdvancedTemplates, setup }) {

    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.user.data);

    const validationSchema = Yup.object().shape({
        // name: Yup.string().required(t("Customer.ADVJournalFieldNameError")),
        template: Yup.number().required(t("Customer.ADVJournalFieldTemplateError")).typeError(t("Customer.ADVJournalFieldTemplateError")),
        // allow_image: Yup.boolean(),
    });


    const formik = useFormik({
        initialValues: {
            name: "",
            template: null,
            // allow_image: false
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            setLoading(true);
            let newObj = {
                outlet_customer_id: customer.id,
                employee_id: user.id,
                title: values.name,
                template_id: values.template,
                template_name: setup.find(temp => temp.id === values.template).setup_name
            }
            if (newObj) {
                handleSubmit(newObj);
            }
            // onClose()
        },
    });
    
    useEffect(() => {
        if (setup.length > 0) {
            formik.setFieldValue("template", setup[0]?.id);
        }
    }, [setup])

    const handleSubmit = async (payload) => {
        if (payload) {
            try {
                const response = await apiFetcher.post(`api/v1/store/advance_journal`, payload);
                if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
                    toast.success(t("Customer.ADVJourToastSuccess"));
                    const timeout = setTimeout(() => {
                        getAdvancedTemplates(customer?.id);
                        onClose();
                    }, 500);
                    return () => clearTimeout(timeout);
                }
            } catch (error) {
                toast.error(t("Customer.ADVJourToastError"));
                onClose();
            } finally {
                setLoading(false);
            }
        }
    }
    return (
        <Modal
            open={open}
            onClose={onClose}
            disableAutoFocus
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: { xs: '95%', sm: '80%', md: '50%', lg: '40%' },
                    minWidth: '30%',
                    padding: { xs: 2, sm: 3, md: 4 },
                    px: 4,
                    bgcolor: '#fff',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Close sx={{ color: '#a2a2a2' }} />
                </IconButton>

                <Stack sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PrimaryHeading text={t("Customer.AddNewJournal")} />
                </Stack>

                <Formik
                    initialValues={formik.initialValues}
                    validationSchema={validationSchema}
                    onSubmit={formik.handleSubmit}
                >
                    <Form style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

                        <Stack>
                            <Typography variant="body1" >
                                {t("Common.Title")}
                            </Typography>
                            <FTextInput
                                name="name"
                                placeholder={t("Customer.TitleForJournal")}
                                mt={0}
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <Typography variant="body2" sx={{ color: "red" }}>
                                    {formik.errors.name}
                                </Typography>
                            )}
                        </Stack>


                        <Stack>
                            <Typography variant="body1" >
                                {t("Setting.Setup")}
                            </Typography>

                            <React.Fragment>
                                <FSelect
                                    sx={{ width: { xs: '100%', md: '50%' } }}
                                    name="template"
                                    placeholderText={t("Setting.ChooseSetup")}
                                    value={formik.values.template}
                                    options={setup && setup.map((template) => ({ value: template.id, label: template.setup_name }))}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.template && formik.errors.template && (
                                    <Typography variant="body2" sx={{ color: "red" }}>
                                        {formik.errors.template}
                                    </Typography>
                                )}
                            </React.Fragment>
                        </Stack>

                        {/* <FSwitch label={'Allow upload of photo'} checked={formik.values.allow_image} onChange={formik.handleChange} name="allow_image" />
                        {formik.touched.allow_image && formik.errors.allow_image && (
                            <Typography variant="body2" sx={{ color: "red" }}>
                                {formik.errors.allow_image}
                            </Typography>
                        )} */}

                        <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
                            <FButton disabled={formik.isSubmitting || loading} onClick={formik.handleSubmit}
                                title={
                                    <Typography noWrap fontWeight={700}>
                                        {t("Customer.AddJrnl")}
                                    </Typography>
                                }
                                sx={{ width: { xs: '100%', sm: '40%' }, bgcolor: '#44B904' }} variant={'save'} type="submit" />
                        </Stack>
                    </Form>
                </Formik>
            </Paper>
        </Modal>
    )
}
