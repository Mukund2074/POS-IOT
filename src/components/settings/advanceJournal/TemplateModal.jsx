import { Close } from '@mui/icons-material';
import { Grid2, IconButton, Modal, Paper, Stack, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import FPrimaryHeading from '../../commonComponents/F_PrimaryHeading';
import { t } from 'i18next';
import FSelect from '../../commonComponents/F_Select';
import FSwitch from '../../commonComponents/f-switch';
import FButton from '../../commonComponents/F_Button';

export default function TemplateModal({ open, onClose, data, handleChange }) {

    // Handle template change and initialize selected services
    const [selectedTemplate, setSelectedTemplate] = useState({
        id: data?.selectedAttachment?.value?.id,
        editors: data.editors
    });

    const handleTemplateChange = (value) => {
        const selectedTemplate = data?.reOrderAdvancedJournalTemplate[value];
        if (selectedTemplate) {
            setSelectedTemplate((prev) => ({ ...prev, values: [], id: value }));
            // Initialize the selected services for the template
        }
    };

    // maintain the switch toggle and set state for atteched templates
    const handleSwitchToggle = (field, isChecked, key1) => {
        let newEditors;
        if (isChecked) {

            newEditors = {
                ...selectedTemplate.editors,
                [key1]: {
                    ...selectedTemplate.editors[key1],
                    only_editors: selectedTemplate.editors[key1].only_editors.map((editor) => {

                        if (editor.field_id === field.field_id) {
                            if (!editor.attached_templates.includes(selectedTemplate.id)) {
                                editor.attached_templates.push(selectedTemplate.id);
                            }
                        }
                        return { ...editor };
                    })
                }
            };
        } else {
            newEditors = {
                ...selectedTemplate.editors,
                [key1]: {
                    ...selectedTemplate.editors[key1],
                    only_editors: selectedTemplate.editors[key1].only_editors.map((editor) => {

                        if (editor.field_id === field.field_id) {
                            editor.attached_templates = editor.attached_templates.filter(templateId => templateId !== selectedTemplate.id);
                        }
                        return { ...editor };
                    })
                }
            };
        }

        setSelectedTemplate((prev) => ({ ...prev, editors: newEditors }));

    };


    return (
        <Modal disableAutoFocus open={open} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} >

            <Paper sx={{ minHeight: "30%", width: { xs: "90%", md: "50%" }, maxHeight: "80%", display: 'flex', flexDirection: 'column', gap: 2, position: "relative", borderRadius: 8, p: 4, }}>

                <IconButton sx={{ position: "absolute", right: 8, top: 8, zIndex: 11 }} onClick={onClose}>
                    <Close />
                </IconButton>

                <FPrimaryHeading text={t("Setting.AttachTemplate")} />

                <Stack sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: "80%", overflowY: "scroll", scrollbarWidth: "none", overflowX: "hidden" }}>
                    <Typography sx={{ mt: 2 }} fontWeight={700} variant='h6'>{t("Setting.ChooseTemplate")}</Typography>
                    <FSelect
                        value={selectedTemplate.id} // Keep it controlled
                        options={Object.values(data?.reOrderAdvancedJournalTemplate).map((item) => ({
                            value: item.id,
                            label: item.name
                        }))}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        sx={{ width: { xs: "100%", md: "40%" } }}
                    />

                    {selectedTemplate.id ? (
                        Object.entries(selectedTemplate.editors).map(([key1, item], index) => {
                            // Check if only_editors has any entries
                            if (!item.only_editors || Object.entries(item.only_editors).length === 0) {
                                return null; // Skip this iteration if there are no editors
                            }

                            return (
                                <Grid2 key={index} container sx={{ my: 2, px: 2 }} spacing={2}>
                                    <Grid2 size={12}>
                                        <FPrimaryHeading sx={{ whiteSpace: "nowrap" }} text={item.setup_name || "General Setups"} />
                                    </Grid2>
                                    {Object.entries(item.only_editors).map(([key, value]) => (
                                        <Grid2 size={{ xs: 12, md: 6, }} key={key}>
                                            <FSwitch
                                                checked={value.attached_templates.includes(selectedTemplate.id)}
                                                label={<Typography>{value.name} ({value.tabName})</Typography>}
                                                onChange={(e) => handleSwitchToggle(value, e.target.checked, key1)} // Toggle service on/off
                                            />
                                        </Grid2>
                                    ))}
                                </Grid2>
                            );
                        })


                    ) : (
                        <Typography sx={{ mx: 'auto', py: 6 }} variant='body1'>{t("Setting.PleaseSelectTemplate")}</Typography>
                    )}

                    <FButton
                        variant={'save'}
                        title={
                            data?.selectedAttachment?.value?.id ?
                                <Typography fontWeight={700} noWrap>{t("Customer.SaveChangeConf")}</Typography> ://   t("Customer.SaveCh") :
                                t("Common.Save")}
                        onClick={() => {
                            handleChange(selectedTemplate.editors, selectedTemplate.id);
                            onClose();
                        }}

                        sx={{ mt: 4, width: { xs: "100%", md: "20%" }, mx: "auto" }}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
