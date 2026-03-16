import React, { useRef, useMemo } from 'react';
import { RadixInput, RadixButton, RadixTextarea } from '@/components/radix';
import { commonTemplateKeywords } from '@/data/Marketing/MarketingCondition';
import { t } from 'i18next';
import CustomRichTextEditor, { type CustomRichTextEditorHandle } from '@/components/Marketing/CustomRichTextEditor';
import { cnMerge } from '@/utils/cnMerge';

export interface ContentBoxValues {
    sender: string;
    subject: string;
    content: string;
}

export interface ContentBoxProps {
    // Values
    values: ContentBoxValues;
    // Change handlers
    onSenderChange?: (value: string) => void;
    onSubjectChange?: (value: string) => void;
    onContentChange: (value: string) => void;
    // Configuration
    triggerType?: 'EMAIL' | 'SMS';
    isReadOnly?: boolean;
    isDisabled?: boolean;
    // Sender Name & Reply To display mode
    senderMode?: 'editable' | 'static';
    // Validation errors (optional, for formik integration)
    errors?: {
        sender?: string;
        subject?: string;
        content?: string;
    };
    touched?: {
        sender?: boolean;
        subject?: boolean;
        content?: boolean;
    };
    // Variable generation
    conditionIds?: number[]; // Direct condition IDs
    triggerGroups?: Array<{ conditions: Array<{ conditionId?: number }> }>; // For trigger groups
    selectedGroups?: string[]; // For campaign selectedGroups
    // Styling
    className?: string;
    showVariables?: boolean; // Whether to show variable tags
    showToolbar?: boolean; // Whether to show toolbar
}

const ContentBox: React.FC<ContentBoxProps> = ({
    values,
    onSenderChange,
    onSubjectChange,
    onContentChange,
    triggerType = 'EMAIL',
    isReadOnly = false,
    isDisabled = false,
    senderMode = 'editable',
    errors,
    touched,
    conditionIds,
    triggerGroups,
    selectedGroups,
    className = '',
    showVariables = true,
    showToolbar = true,
}: ContentBoxProps) => {
    const contentEditorRef = useRef<CustomRichTextEditorHandle>(null);
    const smsTextareaRef = useRef<HTMLTextAreaElement>(null);
    const isSMSCampaign = triggerType === 'SMS';
    const disabled = isReadOnly || isDisabled;

    // Calculate SMS count based on character length
    // 1-130 chars = 1 SMS, 131-260 = 2 SMS, 261-390 = 3 SMS, etc.
    const calculateSMSCount = (text: string): number => {
        if (!text || text.trim().length === 0) return 0;
        // Strip HTML tags to get actual text length for SMS
        const textContent = text.replace(/<[^>]*>/g, '').trim();
        const charCount = textContent.length;
        if (charCount === 0) return 0;
        // Each SMS can hold 130 characters
        return Math.ceil(charCount / 130);
    };

    const smsCount = useMemo(() => {
        if (!isSMSCampaign) return 0;
        return calculateSMSCount(values.content);
    }, [isSMSCampaign, values.content]);

    const smsCharacterCount = useMemo(() => {
        if (!isSMSCampaign) return 0;
        // Strip HTML tags to get actual text length
        return values.content.replace(/<[^>]*>/g, '').trim().length;
    }, [isSMSCampaign, values.content]);

    const insertVariable = (variable: string) => {
        if (disabled) return;

        if (isSMSCampaign && smsTextareaRef.current) {
            const el = smsTextareaRef.current;
            const start = el.selectionStart ?? values.content.length;
            const end = el.selectionEnd ?? values.content.length;
            const nextValue = values.content.slice(0, start) + variable + values.content.slice(end);

            onContentChange(nextValue);

            // Restore cursor after insert (after rerender)
            const nextCursor = start + variable.length;
            requestAnimationFrame(() => {
                try {
                    el.focus();
                    el.setSelectionRange(nextCursor, nextCursor);
                } catch {
                    // ignore selection errors (e.g., when element is unmounted)
                }
            });
            return;
        }

        if (contentEditorRef.current) {
            contentEditorRef.current.insertTextAtCursor(variable);
        } else {
            onContentChange(values.content + variable);
        }
    };

    const handleSenderChange = (value: string) => {
        if (!disabled && onSenderChange) {
            const capped = isSMSCampaign && value.length > 11 ? value.slice(0, 11) : value;
            onSenderChange(capped);
        }
    };

    const handleSubjectChange = (value: string) => {
        if (!disabled && onSubjectChange) {
            onSubjectChange(value);
        }
    };

    const handleContentChange = (value: string) => {
        if (!disabled) {
            onContentChange(value);
        }
    };

    return (
        <div
            className={cnMerge(
                'flex flex-col gap-',
                isReadOnly && 'p-2 border-[1px] border-solid border-border-default rounded-md',
                className,
            )}
        >
            {/* Sender Name */}
            <div className="flex items-center">
                <span
                    className={cnMerge(
                        'text-sm text-text-primary whitespace-nowrap',
                        touched?.sender && errors?.sender ? 'mb-6' : '',
                    )}
                >
                    {t('Marketing.EmailCampaignsSenderName')} :
                </span>

                <div className="w-full flex items-center gap-1">
                    {senderMode === 'editable' && !isReadOnly ? (
                        <div className="w-full flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-1">
                                <RadixInput
                                    value={values.sender}
                                    onChange={(e) => handleSenderChange(e.target.value)}
                                    onBlur={() => {}}
                                    placeholder="Beauty"
                                    className="w-full h-10 border-none px-0"
                                    disabled={disabled}
                                    maxLength={isSMSCampaign ? 11 : undefined}
                                />
                                {isSMSCampaign && (
                                    <span className="text-xs text-text-secondary whitespace-nowrap">
                                        {values.sender.length}/11 characters
                                    </span>
                                )}
                            </div>
                            {touched?.sender && errors?.sender && (
                                <p className="m-0 text-xs text-error-500">{errors.sender}</p>
                            )}
                        </div>
                    ) : isReadOnly ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-background-subtle text-text-primary border border-border-default">
                            {values?.sender ?? 'N/A'}
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-text-secondary"
                            >
                                <path
                                    d="M9 3L3 9M3 3L9 9"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-background-subtle text-text-primary border border-border-default">
                            {values?.sender ?? 'N/A'}
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-text-secondary"
                            >
                                <path
                                    d="M9 3L3 9M3 3L9 9"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    )}
                </div>
            </div>
            {isReadOnly && <div className="h-px w-full bg-border-default my-2" />}
            {isReadOnly && !isSMSCampaign && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-primary whitespace-nowrap">{t('Common.Subject')} :</span>
                    <p className="text-base text-text-primary my-2">{values?.subject ?? 'N/A'}</p>
                </div>
            )}

            {!isReadOnly && !isSMSCampaign && <div className="h-[1px] bg-border-default m-0 p-0" />}

            {/* Subject (Email only) */}
            {!isSMSCampaign && !isReadOnly && (
                <div className="flex items-center w-full">
                    <span className="text-sm text-text-primary whitespace-nowrap">{t('Common.Subject')} :</span>
                    <div className="flex flex-col gap-1 w-full">
                        <RadixInput
                            value={values.subject}
                            onChange={(e) => handleSubjectChange(e.target.value)}
                            onBlur={() => {}}
                            placeholder="15% off facials"
                            className="w-full h-10 border-none px-0 "
                            disabled={disabled}
                        />
                        {touched?.subject && errors?.subject && (
                            <p className="m-0 text-xs text-error-500">{errors.subject}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={cnMerge(!isReadOnly && 'flex-1 flex flex-col min-h-0')}>
                {isSMSCampaign ? (
                    <RadixTextarea
                        ref={smsTextareaRef}
                        value={values.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder={t('Marketing.EnterSMSContent')}
                        readOnly={isReadOnly}
                        disabled={disabled}
                        className={cnMerge(
                            'w-full min-h-[160px] resize-y px-3 py-2 text-sm text-text-primary bg-transparent outline-none',
                            'placeholder:text-text-tertiary',
                            'rounded-md',
                            'disabled:cursor-not-allowed disabled:opacity-60',
                        )}
                    />
                ) : (
                    <CustomRichTextEditor
                        ref={contentEditorRef}
                        value={values.content}
                        onChange={handleContentChange}
                        placeholder={t('Marketing.EnterEmailContent')}
                        readOnly={isReadOnly}
                        disabled={disabled}
                        showToolbar={showToolbar}
                    />
                )}
                {touched?.content && errors?.content && (
                    <p className="m-0 text-xs ml-2 text-error-500 mt-1">{errors.content}</p>
                )}
                {/* SMS Character Counter */}
                {isSMSCampaign && (
                    <div className="px-3 py-2 border-t border-[#eaeaea] flex items-center justify-end gap-2">
                        <span className="text-xs text-text-secondary">
                            {smsCharacterCount} {smsCharacterCount === 1 ? 'character' : 'characters'}
                        </span>
                        {smsCount > 0 && (
                            <span className="text-xs font-medium text-text-primary">
                                {smsCount} {smsCount === 1 ? 'SMS' : 'SMS'}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Variable Tags */}
            {showVariables && !disabled && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {commonTemplateKeywords.map((variable) => (
                        <RadixButton
                            key={variable}
                            onClick={() => insertVariable(`{${variable}} `)}
                            variant="outline"
                            size="xs"
                            className="!bg-[#fff4e9]  !border-none min-w-fit !py-0 !px-0 !h-auto m-0"
                        >
                            {`{${variable}}`}
                        </RadixButton>
                    ))}
                </div>
            )}
        </div>
    );
};

ContentBox.displayName = 'ContentBox';
export default ContentBox;
