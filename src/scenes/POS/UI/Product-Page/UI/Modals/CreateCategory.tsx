import { IconButton, Modal, Paper, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import React, { useEffect } from 'react';
import { t } from 'i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PostApiProductCategories201 } from '@/shared/api/models';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSButton from '@/components/POS/Common/POSButton';
import POSTextArea from '@/components/POS/Common/POSTextArea';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    handleClick: (id: string | null, body: PostApiProductCategories201) => void;
    category: PostApiProductCategories201 | null;
}

export default function CreateCategory({ open, onClose, handleClick, category }: ModalProps) {
    const validationSchema = Yup.object().shape({
        name: Yup.string().required(t('Customer.ADVJournalFieldNameError')),
    });
    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
        },
        validationSchema,
        onSubmit: (values) => {
            const body = {
                name: values.name || '',
                description: values.description || '',
            } as PostApiProductCategories201;
            handleClick(category?.id ? category.id : null, body);
            formik.resetForm();
        },
    });

    useEffect(() => {
        if (category) {
            formik.setValues({ name: category.name, description: category.description || '' });
        }
    }, [category]);

    return (
        <Modal
            open={open}
            onClose={() => {
                formik?.setValues(formik?.initialValues);
                onClose();
            }}
            keepMounted
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    maxWidth: 600,
                    maxHeight: '80%',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 8,
                    py: 4,
                    px: 4,
                    minWidth: '40%',
                    minHeight: '20%',
                }}
            >
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
                    <Close />
                </IconButton>
                <POSHeading text={category?.id ? t('POS.UpdateCat') : t('POS.CreateCat')} />

                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f0f0f', mt: 4 }}>
                    {category?.id ? t('POS.UpdateCat') : t('POS.CreateCat')}
                </Typography>
                <POSInput
                    value={formik.values.name}
                    onChange={(event) => formik.setFieldValue('name', event.target.value)}
                    placeholder={t('POS.CreateCat')}
                />
                {formik.touched.name && formik.errors.name && (
                    <Typography style={{ color: 'red' }}>{formik.errors.name}</Typography>
                )}

                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f0f0f', mt: 4 }}>
                    {t('Setting.Description')}
                </Typography>
                <POSTextArea
                    value={formik.values.description}
                    onChange={(event) => formik.setFieldValue('description', event.target.value)}
                    placeholder={t('Setting.Description')}
                />

                <POSButton
                    title={category?.id ? `${t('Customer.SaveCh')}` : `+ ${t('POS.CreateCat')}`}
                    variant={'save'}
                    width={{ xs: '100%', md: 'auto' }}
                    sx={{ mx: 'auto', mt: 4 }}
                    onClick={formik.handleSubmit}
                />
            </Paper>
        </Modal>
    );
}
