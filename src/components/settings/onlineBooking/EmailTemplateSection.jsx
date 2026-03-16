import { Stack } from '@mui/material';
import { Typography, IconButton } from '@mui/material';
import ArrowDown from '../../../assets/arrow-down.svg';
import { Visibility } from '@mui/icons-material';
import { t } from 'i18next';
import FTextInput from '../../commonComponents/F_TextInput';
import FTextArea from '../../commonComponents/F_TextArea';
import FButton from '../../commonComponents/F_Button';
import FPrimaryHeading from '../../commonComponents/F_PrimaryHeading';
import { getIn } from 'formik';
import React from 'react';

export const EmailTemplateSection = ({
    title,
    toggleKey,
    formik,
    formikPath,
    boolState,
    setBoolState,
    setProps,
    setShowPreview,
    fromDashboard,
    previewTitle,
}) => {
    const show = boolState?.[toggleKey]?.ShowEmail;

    const subjectPath = `${formikPath}.email_subject`;
    const bodyPath = `${formikPath}.email_body`;

    const subject = getIn(formik.values, subjectPath) || '';
    const body = getIn(formik.values, bodyPath) || '';
    const subjectError = getIn(formik.errors, subjectPath);
    const bodyError = getIn(formik.errors, bodyPath);
    const subjectTouched = getIn(formik.touched, subjectPath);
    const bodyTouched = getIn(formik.touched, bodyPath);

    return (
        <Stack sx={{ width: { xs: '100%', sm: '35%' }, gap: 2, m: 0, p: 0 }}>
            <FPrimaryHeading variant="body1" fontSize="auto" text={title} />

            <Typography
                onClick={() =>
                    setBoolState({
                        ...boolState,
                        [toggleKey]: { ShowEmail: !show },
                    })
                }
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                noWrap
            >
                {t('Setting.EmailConMsg')}
                <IconButton disableRipple sx={{ transform: show ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <img src={ArrowDown} alt="" />
                </IconButton>
            </Typography>

            {show && (
                <React.Fragment>
                    {fromDashboard && (
                        <Stack>
                            <FTextInput
                                value={subject}
                                placeholder={t('Setting.Subject')}
                                onChange={(e) => formik.setFieldValue(subjectPath, e.target.value)}
                                onBlur={() => formik.setFieldTouched(subjectPath, true)}
                                sx={{ mt: 0 }}
                            />

                            {subjectTouched && subjectError && (
                                <Typography color="red" sx={{ m: 0 }}>
                                    {subjectError}
                                </Typography>
                            )}

                            <FTextArea
                                value={body}
                                placeholder={t('Setting.EmailBody')}
                                rows={8}
                                onChange={(e) => formik.setFieldValue(bodyPath, e.target.value)}
                                onBlur={() => formik.setFieldTouched(bodyPath, true)}
                            />
                            {bodyTouched && bodyError && (
                                <Typography color="red" sx={{ m: 0 }}>
                                    {bodyError}
                                </Typography>
                            )}
                        </Stack>
                    )}

                    <FButton
                        startIcon={<Visibility />}
                        variant="save"
                        sx={{ mt: 1, maxWidth: 'fit-content' }}
                        title={t('Setting.Preview')}
                        disabled={!body}
                        onClick={() => {
                            setProps({ content: body, title: previewTitle });
                            setShowPreview(true);
                        }}
                    />
                </React.Fragment>
            )}
        </Stack>
    );
};
