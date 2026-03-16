import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TriggerGroup } from '@/redux/slices/Marketing/campaigns';
import { ConditionComponentRef } from '../ConditionRenderer';
import ContentBox, { ContentBoxValues } from '@/components/Marketing/ContentBox';
import { t } from 'i18next';

interface ContentBoxFormProps {
    value?: any;
    onChange: (value: any) => void;
    triggerGroups: TriggerGroup[];
    triggerType?: 'EMAIL' | 'SMS'; // 'Email' or 'SMS' from trigger setting
    conditionRef?: React.MutableRefObject<ConditionComponentRef | null>;
}

// Validation schema will be created dynamically based on triggerType
const createValidationSchema = (triggerType: 'EMAIL' | 'SMS') =>
    Yup.object().shape({
        sender:
            triggerType === 'SMS' ? Yup.string().nullable() : Yup.string().required(t('Marketing.SenderNameRequired')),
        subject:
            triggerType === 'EMAIL' ? Yup.string().required(t('Marketing.SubjectRequired')) : Yup.string().nullable(),
        content: Yup.string()
            .required(t('Marketing.ContentRequired'))
            .test('content-required', 'Content is required', (value) => {
                const raw = (value ?? '').trim();
                if (!raw) return false;
                if (raw === '<p><br></p>') return false;
                // Quill often stores HTML; ensure there's real text content
                const text = raw
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .trim();
                return text.length > 0;
            }),
    });

const ContentBoxForm = ({
    value,
    onChange,
    triggerGroups,
    triggerType = 'EMAIL',
    conditionRef,
}: ContentBoxFormProps) => {
    const settings = useSelector((state: any) => state.settings.data);
    const defaultSenderName = settings?.profile?.name ?? '';

    const [initialValues, setInitialValues] = useState<ContentBoxValues>({
        sender: value?.sender ?? defaultSenderName,
        subject: value?.subject ?? '',
        content: value?.content ?? '',
    });

    useEffect(() => {
        setInitialValues({
            sender: value?.sender ?? defaultSenderName,
            subject: value?.subject ?? '',
            content: value?.content ?? '',
        });
    }, [value, defaultSenderName]);

    const formik = useFormik({
        initialValues,
        validationSchema: createValidationSchema(triggerType as 'EMAIL' | 'SMS'),
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: () => {
            // Validation handled automatically
        },
    });

    // Expose validate and getValues methods via ref
    useImperativeHandle(
        conditionRef,
        () => ({
            validate: async () => {
                const errors = await formik.validateForm();
                if (Object.keys(errors).length > 0) {
                    // Mark all fields as touched to show errors
                    formik.setTouched({
                        sender: true,
                        subject: true,
                        content: true,
                    });
                    return false;
                }
                return true;
            },
            getValues: () => {
                return {
                    ...formik.values,
                } as Record<string, unknown>;
            },
        }),
        [formik],
    );

    // Sync with external value changes
    useEffect(() => {
        if (value) {
            const currentValues = formik.values;
            // Only use default sender name if value.sender is undefined/null, not if it's an empty string
            const valuesWithDefault = {
                ...value,
                sender: value.sender ?? defaultSenderName,
            };
            // Only update if values actually differ
            if (JSON.stringify(valuesWithDefault) !== JSON.stringify(currentValues)) {
                formik.setValues(valuesWithDefault);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, defaultSenderName]);

    // Handle field changes and sync with formik and parent onChange
    const handleFieldChange = (field: keyof ContentBoxValues, newValue: string) => {
        const updatedValues = { ...formik.values, [field]: newValue };
        formik.setFieldValue(field, newValue);
        onChange(updatedValues);
    };

    return (
        <ContentBox
            values={formik.values}
            onSenderChange={(value) => handleFieldChange('sender', value)}
            onSubjectChange={(value) => handleFieldChange('subject', value)}
            onContentChange={(value) => handleFieldChange('content', value)}
            triggerType={triggerType as 'EMAIL' | 'SMS'}
            triggerGroups={triggerGroups}
            errors={{
                sender: formik.errors.sender ? String(formik.errors.sender) : undefined,
                subject: formik.errors.subject ? String(formik.errors.subject) : undefined,
                content: formik.errors.content ? String(formik.errors.content) : undefined,
            }}
            touched={{
                sender: formik.touched.sender,
                subject: formik.touched.subject,
                content: formik.touched.content,
            }}
            senderMode="editable"
        />
    );
};

ContentBoxForm.displayName = 'ContentBoxForm';
export default ContentBoxForm;
