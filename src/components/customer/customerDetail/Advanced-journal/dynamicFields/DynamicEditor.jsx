import React, { useState, useRef, useEffect } from 'react';
import { Stack, Typography, IconButton } from '@mui/material';
import { Add } from '@mui/icons-material';
import FSelect from '../../../../commonComponents/F_Select';
import ReactQuill from 'react-quill';
import '../../../../../cssQuill.css';

const modules = {
    toolbar: [
        // [{ 'font': ['Arial', 'sans-serif'] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'],
    ],
};

const formats = [
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'blockquote',
    'code-block',
    'list',
    'script',
    'indent',
    'direction',
    'align',
    'link',
    'image',
    'video',
];

export default function DynamicEditor({ formik, field, name = 'editor', templates }) {
    const [selectedTemplte, setSelectedTemplate] = useState({
        id: field?.attached_templates?.[0] || null,
        detail: field?.value || null,
    });
    const quillRef = useRef(null);

    useEffect(() => {
        if (field?.autofill_template_on_load && field?.attached_templates && field?.attached_templates.length) {
            setSelectedTemplate({ id: field?.attached_templates?.[0], detail: field?.value });
        } else {
            setSelectedTemplate({ id: null, detail: null });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTemplateChange = (id) => {
        let temp = templates.find((temp) => temp.id === id);
        setSelectedTemplate(temp);
    };

    const handleInsertTemplate = () => {
        if (!selectedTemplte?.detail) return;

        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const selection = quill.getSelection(true);
        const insertIndex = selection?.index ?? quill.getLength() - 1;

        quill.setSelection(insertIndex);
        // Insert template content with 3 <br/> tags at the end
        const contentWithBreaks = selectedTemplte.detail + '<br/>';
        quill.clipboard.dangerouslyPasteHTML(insertIndex, contentWithBreaks);

        formik.setFieldValue(name, quill.root.innerHTML);
    };

    const templatesOptions =
        templates &&
        templates
            .filter((temp) => field?.attached_templates && field?.attached_templates?.includes(temp.id)) // Check if the template id is in attached_templates
            .map((temp) => ({
                value: temp.id,
                label: temp.name,
            }));

    return (
        <Stack m={0}>
            <Typography fontWeight={700} variant="body1">
                {field?.name}
            </Typography>
            <Stack ml={{ xs: 0, md: 2 }} border={'1px solid #D9D9D9'} mt={1} borderRadius={2}>
                {/* <FTextInput sx={{ border : 'none', borderRadius : '0', width: "100%" , boxShadow : 'none' }} disabled={formik?.values?.disabled} onBlur={formik.handleBlur} value={formik?.values?.[TitleName]} placeholder={t("Customer.NameOfJournal")} onChange={(e) => formik.setFieldValue(TitleName, e.target.value)} name={TitleName} />
        {formik?.touched?.[TitleName] && formik?.errors?.[TitleName] && <Typography style={{ color: 'red' }}>{formik?.errors?.[TitleName]}</Typography>} */}
                <Stack display={'flex'} flexDirection={'row'} gap={2} alignItems={'center'} p={2}>
                    <FSelect
                        disabled={formik?.values?.disabled}
                        value={selectedTemplte?.id}
                        onChange={(e) => {
                            handleTemplateChange(e.target.value);
                        }}
                        options={templatesOptions}
                    />
                    <IconButton
                        onClick={handleInsertTemplate}
                        disabled={formik?.values?.disabled || !selectedTemplte}
                        sx={{
                            border: '1px solid #D9D9D9',
                            borderRadius: '8px',
                            width: 40,
                            height: 40,
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                            },
                        }}
                    >
                        <Add />
                    </IconButton>
                </Stack>
                <ReactQuill
                    ref={quillRef}
                    readOnly={formik?.values?.disabled}
                    disabled={formik?.values?.disabled}
                    style={{ borderRadius: 'none' }}
                    value={formik?.values?.[name]}
                    onChange={(content) => {
                        formik.setFieldValue(name, content);
                    }}
                    modules={modules}
                    formats={formats}
                    className="custom-quill"
                />
            </Stack>
            {formik?.touched?.[name] && formik?.errors?.[name] && (
                <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>
            )}
        </Stack>
    );
}
