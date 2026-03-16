import { Box, Stack, Typography, CircularProgress, Modal, Paper, IconButton, Divider } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { t } from 'i18next';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import CloseIcon from '@mui/icons-material/Close';
import POSButton from '@/components/POS/Common/POSButton';
import POSInput from '@/components/POS/Common/POSInput';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import POSCheckbox from '@/components/POS/Common/POSCheckbox';
import POSHeading from '@/components/POS/Common/POSHeading';
import {
    useHealthDeclarationTemplate,
    useCreateHealthDeclarationTemplate,
    useUpdateHealthDeclarationTemplate,
} from '@/hooks/api/healthDeclaration';
import { PostApiHealthDeclarationTemplatesBody } from '@/shared/api/models';
import { isAnswerValueInMarkCriticalWhen } from '@/utils/healthDeclarationCritical';
import DeleteIcon from '@/assets/Delete.svg';
import EditIcon from '@/assets/editProduct.svg';
import { toast } from 'react-toastify';

interface Question {
    id: string;
    label: string;
    type: 'yes_no' | 'multiple_choice' | 'text' | 'cpr' | 'date';
    isRequired: boolean;
    isCritical: boolean;
    options?: string[];
    /** yes_no: boolean[] (true/false); multiple_choice: string[] (option values); not used for date/cpr/text */
    markCriticalWhen?: (boolean | string)[];
}

interface FormData {
    name: string;
    description: string;
    content: {
        questions: Question[];
    };
}

interface AddFieldModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (field: Question) => void;
    initialField?: Question | null;
}

const translateKeysMap = {
    yes_no: t('Services.FieldTypeyes_no'),
    multiple_choice: t('Services.FieldTypemultiple_choice'),
    text: t('Services.FieldTypetext'),
    cpr: t('Services.FieldTypecpr'),
    date: t('Common.Date'),
};

interface FieldFormData {
    label: string;
    type: 'yes_no' | 'multiple_choice' | 'text' | 'cpr' | 'date';
    isRequired: boolean;
    isCritical: boolean;
    options: { value: string; markCritical?: boolean }[];
    markCriticalWhenYes?: boolean;
    markCriticalWhenNo?: boolean;
}

const AddFieldModal: React.FC<AddFieldModalProps> = ({ open, onClose, onSubmit, initialField }) => {
    const {
        control,
        handleSubmit: handleFormSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<FieldFormData>({
        defaultValues: {
            label: '',
            type: 'text',
            isRequired: false,
            isCritical: false,
            options: [{ value: '', markCritical: false }],
            markCriticalWhenYes: false,
            markCriticalWhenNo: false,
        },
    });

    const {
        fields: optionFields,
        append: appendOption,
        remove: removeOption,
    } = useFieldArray({
        control,
        name: 'options',
    });

    const fieldType = watch('type');
    const isCritical = watch('isCritical');
    const [optionInput, setOptionInput] = useState('');

    useEffect(() => {
        if (initialField) {
            const opts = initialField.options || [''];
            const markCriticalWhen = initialField.markCriticalWhen || [];
            reset({
                label: initialField.label,
                type: initialField.type,
                isRequired: initialField.isRequired,
                isCritical: initialField.isCritical,
                options:
                    initialField.type === 'multiple_choice'
                        ? opts.map((opt) => ({
                              value: opt,
                              markCritical: Array.isArray(markCriticalWhen) && markCriticalWhen.includes(opt),
                          }))
                        : opts.map((opt) => ({ value: opt })),
                markCriticalWhenYes:
                    initialField.type === 'yes_no' &&
                    Array.isArray(markCriticalWhen) &&
                    markCriticalWhen.includes(true),
                markCriticalWhenNo:
                    initialField.type === 'yes_no' &&
                    Array.isArray(markCriticalWhen) &&
                    markCriticalWhen.includes(false),
            });
        } else {
            reset({
                label: '',
                type: 'text',
                isRequired: false,
                isCritical: false,
                options: [{ value: '', markCritical: false }],
                markCriticalWhenYes: false,
                markCriticalWhenNo: false,
            });
        }
        setOptionInput('');
    }, [initialField, open, reset]);

    useEffect(() => {
        if (fieldType !== 'multiple_choice' && optionFields.length > 0) {
            reset((prev) => ({
                ...prev,
                options: [{ value: '', markCritical: false }],
            }));
        }
    }, [fieldType, optionFields.length, reset]);

    const handleClose = () => {
        reset({
            label: '',
            type: 'text',
            isRequired: false,
            isCritical: false,
            options: [{ value: '', markCritical: false }],
            markCriticalWhenYes: false,
            markCriticalWhenNo: false,
        });
        setOptionInput('');
        onClose();
    };

    const handleAddOption = () => {
        if (optionInput.trim()) {
            appendOption({ value: optionInput.trim(), markCritical: false });
            setOptionInput('');
        }
    };

    const onSubmitForm = (data: FieldFormData) => {
        const field: Question = {
            id: initialField?.id || uuidv4(),
            label: data.label.trim(),
            type: data.type,
            isRequired: data.isRequired,
            isCritical: data.isCritical,
            ...(data.type === 'multiple_choice' && {
                options: data.options.map((opt) => opt.value).filter((opt) => opt.trim()),
            }),
        };

        if (data.isCritical && data.type === 'yes_no') {
            field.markCriticalWhen = [
                ...(data.markCriticalWhenYes ? [true] : []),
                ...(data.markCriticalWhenNo ? [false] : []),
            ];
        } else if (data.isCritical && data.type === 'multiple_choice') {
            field.markCriticalWhen = data.options
                .filter((opt) => opt.value.trim() && opt.markCritical)
                .map((opt) => opt.value.trim());
        }
        // date, cpr, text: no markCriticalWhen

        onSubmit(field);
        handleClose();
    };

    const fieldTypeOptions = [
        { value: 'yes_no', label: translateKeysMap['yes_no'] },
        { value: 'multiple_choice', label: translateKeysMap['multiple_choice'] },
        { value: 'text', label: translateKeysMap['text'] },
        { value: 'cpr', label: translateKeysMap['cpr'] },
        { value: 'date', label: translateKeysMap['date'] },
    ];

    return (
        <Modal
            open={open}
            onClose={(e, reason) => {
                if (reason !== 'backdropClick') {
                    handleClose();
                }
            }}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    maxWidth: '90%',
                    width: { xs: '95%', md: '500px' },
                    maxHeight: '90%',
                    overflow: 'auto',
                    borderRadius: 3,
                    p: 3,
                }}
            >
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 10,
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <POSHeading text={initialField ? t('Services.EditField') : t('Services.AddNewField')} sx={{ mb: 2 }} />

                <form onSubmit={handleFormSubmit(onSubmitForm)}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                {t('Services.Label')} <span style={{ color: 'red' }}>*</span>
                            </Typography>
                            <Controller
                                name="label"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <POSInput {...field} placeholder={t('Services.EnterFieldLabel')} width="100%" />
                                )}
                            />
                            {errors.label && (
                                <Typography style={{ color: 'red', fontSize: '12px' }}>
                                    {`${t('Services.Label')} ${t('Services.IsRequired')}`}
                                </Typography>
                            )}
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                {t('Services.FieldType')} <span style={{ color: 'red' }}>*</span>
                            </Typography>
                            <Controller
                                name="type"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <POSSelect
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={fieldTypeOptions}
                                        wrapperSx={{ width: '100%' }}
                                    />
                                )}
                            />
                            {errors.type && (
                                <Typography style={{ color: 'red', fontSize: '12px' }}>
                                    {`${t('Services.FieldType')} ${t('Services.IsRequired')}`}
                                </Typography>
                            )}
                        </Box>

                        {fieldType === 'multiple_choice' && (
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                    {t('Services.Options')}
                                </Typography>
                                <Stack spacing={1}>
                                    {optionFields.map((field, index) => (
                                        <Stack key={field.id} direction="row" spacing={1} alignItems="center">
                                            {isCritical && (
                                                <Controller
                                                    name={`options.${index}.markCritical`}
                                                    control={control}
                                                    render={({ field: mcField }) => (
                                                        <POSCheckbox
                                                            checked={!!mcField.value}
                                                            onClick={() => mcField.onChange(!mcField.value)}
                                                            label={t('Services.MarkCriticalWhenSelected')}
                                                            sx={{ flexShrink: 0 }}
                                                        />
                                                    )}
                                                />
                                            )}
                                            <Controller
                                                name={`options.${index}.value`}
                                                control={control}
                                                render={({ field: optionField }) => (
                                                    <POSInput
                                                        {...optionField}
                                                        placeholder={t('Services.OptionPlaceholder')}
                                                        width="100%"
                                                    />
                                                )}
                                            />
                                            {optionFields.length > 1 && (
                                                <IconButton
                                                    onClick={() => removeOption(index)}
                                                    sx={{ minWidth: 'auto', width: 40, height: 40 }}
                                                >
                                                    <img
                                                        src={DeleteIcon}
                                                        alt="Delete"
                                                        style={{ width: 20, height: 20 }}
                                                    />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    ))}
                                    <POSInput
                                        value={optionInput}
                                        onChange={(e) => setOptionInput(e.target.value)}
                                        placeholder={t('Services.AddOption')}
                                        width="100%"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddOption();
                                            }
                                        }}
                                    />
                                    <POSButton
                                        variant="save"
                                        title={`+ ${t('Services.AddOption')}`}
                                        onClick={handleAddOption}
                                        sx={{ width: '100%' }}
                                        type="button"
                                    />
                                </Stack>
                            </Box>
                        )}

                        <Box>
                            <Controller
                                name="isRequired"
                                control={control}
                                render={({ field }) => (
                                    <POSSwitch
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        label={t('Services.IsRequired')}
                                    />
                                )}
                            />
                        </Box>

                        {(fieldType === 'yes_no' || fieldType === 'multiple_choice') && (
                            <Box>
                                <Controller
                                    name="isCritical"
                                    control={control}
                                    render={({ field }) => (
                                        <POSSwitch
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            label={t('Services.IsCritical')}
                                        />
                                    )}
                                />
                            </Box>
                        )}

                        {isCritical && fieldType === 'yes_no' && (
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                    {t('Services.MarkAsCriticalWhenAnswer')}
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                    <Controller
                                        name="markCriticalWhenYes"
                                        control={control}
                                        render={({ field }) => (
                                            <POSCheckbox
                                                checked={!!field.value}
                                                onClick={() => field.onChange(!field.value)}
                                                label={t('Statistics.Yes')}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="markCriticalWhenNo"
                                        control={control}
                                        render={({ field }) => (
                                            <POSCheckbox
                                                checked={!!field.value}
                                                onClick={() => field.onChange(!field.value)}
                                                label={t('Statistics.No')}
                                            />
                                        )}
                                    />
                                </Stack>
                            </Box>
                        )}

                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                            <POSButton
                                variant="f_outline"
                                title={t('Setting.Cancel')}
                                onClick={handleClose}
                                type="button"
                            />
                            <POSButton
                                variant="save"
                                title={initialField ? t('GiftCard.update') : t('Common.Add')}
                                type="submit"
                            />
                        </Stack>
                    </Stack>
                </form>
            </Paper>
        </Modal>
    );
};

export default function HealthDeclarationForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isCreate = !id || id === 'create';
    const [showAddFieldModal, setShowAddFieldModal] = useState(false);
    const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
    const initialDataRef = useRef<string>('');

    const { data: templateData, isLoading } = useHealthDeclarationTemplate(id, !isCreate);
    const createMutation = useCreateHealthDeclarationTemplate();
    const updateMutation = useUpdateHealthDeclarationTemplate();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        defaultValues: {
            name: '',
            description: '',
            content: {
                questions: [],
            },
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'content.questions',
    });

    const formValues = watch();

    // Track form changes
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (templateData?.data) {
            const template = templateData.data;
            const formData: FormData = {
                name: template.name || '',
                description: typeof template.description === 'string' ? template.description : '',
                content: {
                    questions: (template.content as any)?.questions || [],
                },
            };
            reset(formData);
            initialDataRef.current = JSON.stringify(formData);
        } else if (isCreate) {
            const defaultData: FormData = {
                name: '',
                description: '',
                content: {
                    questions: [],
                },
            };
            reset(defaultData);
            initialDataRef.current = JSON.stringify(defaultData);
        }
    }, [templateData, isCreate, reset]);

    useEffect(() => {
        const currentData = JSON.stringify(formValues);
        setHasChanges(initialDataRef.current !== currentData);
    }, [formValues]);

    const handleAddField = (field: Question) => {
        if (editingFieldIndex !== null) {
            update(editingFieldIndex, field);
            setEditingFieldIndex(null);
        } else {
            append(field);
        }
        setShowAddFieldModal(false);
    };

    const handleEditField = (index: number) => {
        setEditingFieldIndex(index);
        setShowAddFieldModal(true);
    };

    const handleDeleteField = (index: number) => {
        remove(index);
    };

    const onSubmit = async (data: FormData) => {
        if (data.content.questions.length === 0) {
            return;
        }

        const payload: PostApiHealthDeclarationTemplatesBody = {
            name: data.name,
            description: data.description || null,
            content: {
                questions: data.content.questions,
            },
        };

        try {
            if (isCreate) {
                await createMutation.mutateAsync(payload);
            } else {
                await updateMutation.mutateAsync({ id: id!, data: payload });
            }
            navigate('/services/health-declaration-template');
        } catch (error) {
            console.error('Submit failed:', error);
        }
    };

    if (isLoading) {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '50vh' }}>
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <Stack p={{ xs: 2, md: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <POSHeading text={isCreate ? t('Services.CreateTemplate') : t('Services.EditTemplate')} />
                <Stack direction="row" spacing={2}>
                    {/* added fields > 0 then show save button */}
                    {hasChanges && (
                        <POSButton
                            variant="save"
                            title={
                                createMutation.isPending || updateMutation.isPending ? (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CircularProgress size={20} color="inherit" />
                                        {t('POS.Processing')}
                                    </Stack>
                                ) : (
                                    t('Customer.SaveCh')
                                )
                            }
                            onClick={() => {
                                if (fields.length > 0) {
                                    handleSubmit(onSubmit)();
                                } else {
                                    toast.error(t('Services.AtleastOneFieldRequired'));
                                }
                            }}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        />
                    )}
                    <POSButton
                        variant="save"
                        title={`+ ${t('Services.AddNewField')}`}
                        onClick={() => {
                            setEditingFieldIndex(null);
                            setShowAddFieldModal(true);
                        }}
                    />
                </Stack>
            </Stack>

            <Box
                sx={{
                    display: 'flex',
                    bgcolor: '#FFFFFF',
                    borderRadius: '25px',
                    flexDirection: 'column',
                    width: '100%',
                    padding: { xs: 2, md: 5 },
                }}
            >
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            {t('Customer.TmpName')} <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <POSInput
                                    {...field}
                                    placeholder={t('Services.EnterTemplateName')}
                                    sx={{ width: { xs: '100%', md: '50%' } }}
                                />
                            )}
                        />
                        {errors.name && (
                            <Typography style={{ color: 'red', fontSize: '12px' }}>
                                {errors.name?.message || t('Services.NameRequired')}
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            {t('Setting.Description')}
                        </Typography>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <POSTextArea
                                    {...field}
                                    placeholder={t('Services.EnterTemplateDescription')}
                                    sx={{ width: { xs: '100%', md: '50%' } }}
                                    rows={4}
                                />
                            )}
                        />
                    </Box>

                    <Divider />

                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <POSHeading text={t('Services.Fields')} />
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                {fields.length} {t('Services.Fields')}
                            </Typography>
                        </Stack>

                        {fields.length === 0 ? (
                            <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', py: 4 }}>
                                {t('Services.NoFieldsAdded')}
                            </Typography>
                        ) : (
                            <Stack spacing={1}>
                                {fields.map((field, index) => (
                                    <Box
                                        key={field.id}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            border: '1px solid #E0E0E0',
                                            bgcolor: '#F5F5F5',
                                        }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                    {field.label}
                                                </Typography>
                                                <Stack direction="row" spacing={2}>
                                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                                        {translateKeysMap[field.type]}
                                                    </Typography>
                                                    {field.isRequired && (
                                                        <Typography variant="body2" sx={{ color: '#D30000' }}>
                                                            {t('Services.Required')}
                                                        </Typography>
                                                    )}
                                                    {field.isCritical && (
                                                        <Typography variant="body2" sx={{ color: '#FF9800' }}>
                                                            {t('Services.Critical')}
                                                        </Typography>
                                                    )}
                                                    {field.type === 'multiple_choice' && field.options && (
                                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                                            {field.options.length} {t('Services.Options')}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </Box>
                                            <Stack direction="row" spacing={1}>
                                                <IconButton
                                                    onClick={() => handleEditField(index)}
                                                    sx={{ minWidth: 'auto', width: 40, height: 40 }}
                                                >
                                                    <img src={EditIcon} alt="Edit" style={{ width: 20, height: 20 }} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteField(index)}
                                                    sx={{ minWidth: 'auto', width: 40, height: 40 }}
                                                >
                                                    <img
                                                        src={DeleteIcon}
                                                        alt="Delete"
                                                        style={{ width: 20, height: 20 }}
                                                    />
                                                </IconButton>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Box>

            <AddFieldModal
                open={showAddFieldModal}
                onClose={() => {
                    setShowAddFieldModal(false);
                    setEditingFieldIndex(null);
                }}
                onSubmit={handleAddField}
                initialField={editingFieldIndex !== null ? fields[editingFieldIndex] : null}
            />
        </Stack>
    );
}
