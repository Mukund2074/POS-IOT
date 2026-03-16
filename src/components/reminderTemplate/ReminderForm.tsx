import { t } from 'i18next';
import CustomRichTextEditor from '../Marketing/CustomRichTextEditor';
import {
    RadixAccordion,
    RadixAccordionGroup,
    RadixButton,
    RadixCheckbox,
    RadixDialog,
    RadixInput,
    RadixMultiSelect,
    RadixSelect,
    RadixSwitch,
    RadixTextarea,
} from '../radix';
import { useRef } from 'react';
import type { CustomRichTextEditorHandle } from '../Marketing/CustomRichTextEditor';
// @ts-ignore
import { DefaultEmail } from '../../scenes/Services/AdvanceReminder/AdvanceReminderDefaultEmail.js';

interface DurationOptionsDataType {
    label: string;
    value: string;
}

interface ReminderFormDataType {
    formik: any;
    durationOptions: DurationOptionsDataType[];
    services: any;
    setCreateTemplate: (value: boolean) => void;
    postLoading: boolean;
    AdvanceReminderKeywords: any;
    isPreview: boolean;
    setIsPreview: (value: boolean) => void;
}

type SelectedMsgTypeOptions = 'SMS' | 'EMAIL' | 'EMAIL_AND_SMS';

const ReminderForm = ({
    formik,
    durationOptions,
    services,
    AdvanceReminderKeywords,
    isPreview,
    setIsPreview,
}: ReminderFormDataType) => {
    const editorRef = useRef<CustomRichTextEditorHandle | null>(null);

    const updateServices = (newSet: Set<string>) => {
        formik.setFieldValue('services', Array.from(newSet));
    };

    const toggleService = (id: string, checked: boolean) => {
        const updated = new Set(formik?.values?.services);
        checked ? updated.add(id) : updated.delete(id);
        updateServices(updated as any);
    };

    const toggleGroup = (ids: string[], checked: boolean) => {
        const updated = new Set(formik?.values?.services);
        ids.forEach((id) => {
            checked ? updated.add(id) : updated.delete(id);
        });
        updateServices(updated as any);
    };

    const generatePreviewHtml = () => {
        const defaultTemplate = DefaultEmail?.custom_email?.email_body || '';
        const subject = formik?.values?.emailSubject || '';
        const content = formik?.values?.emailContent || '';

        // If the content already seems to be a full HTML document, return it as is
        if (content.includes('<!DOCTYPE') || content.includes('<html')) {
            return content;
        }

        // Otherwise, wrap it in the branded template with the subject as a heading
        const mergedHtml = defaultTemplate.replace(
            '{{custom_content}}',
            `
            <tr>
                <td align="left" valign="top" style="padding: 0 20px 20px 20px; color: #333333;">
                    <h1 style="margin-top: 0; font-size: 24px;">${subject}</h1>
                </td>
            </tr>
            ${content || ''}
            `,
        );

        return mergedHtml;
    };
    return (
        <>
            {/* LEFT SIDE */}
            <div className="w-full md:w-1/2 space-y-4 md:overflow-y-auto md:pr-2">
                <div>
                    <h4 className="mt-0 mb-1 font-normal">{t('Services.TemplateName')}</h4>
                    <RadixInput
                        name="reminderTemplateName"
                        placeholder={t('Services.EnterTemplateName')}
                        value={formik?.values?.reminderTemplateName}
                        onChange={formik?.handleChange}
                        onBlur={formik?.handleBlur}
                    />
                    {formik?.touched?.reminderTemplateName && formik?.errors?.reminderTemplateName && (
                        <p className="text-red-500 text-sm mt-1">{formik?.errors?.reminderTemplateName}</p>
                    )}
                </div>

                <div>
                    <h4 className="mb-1 font-normal">{t('Services.MsgType')}</h4>
                    <RadixMultiSelect
                        options={[
                            { label: t('Calendar.SMS'), value: 'SMS' },
                            { label: t('Common.Email'), value: 'EMAIL' },
                        ]}
                        selectedValues={
                            formik?.values?.reminderTemplateType === 'EMAIL_AND_SMS'
                                ? new Set(['SMS', 'EMAIL'])
                                : new Set([formik?.values?.reminderTemplateType])
                        }
                        textToDisplayWithCount={t('Services.SMSEmail')}
                        hideCount={true}
                        onSelectionChange={(selectedValues: Set<string>) => {
                            const values = Array.from(selectedValues);

                            let newType: SelectedMsgTypeOptions = 'SMS';

                            if (values.length === 2) {
                                newType = 'EMAIL_AND_SMS';
                            } else if (values.includes('SMS')) {
                                newType = 'SMS';
                                formik.setFieldValue('emailSubject', '');
                                formik.setFieldValue('emailContent', '');
                            } else if (values.includes('EMAIL')) {
                                newType = 'EMAIL';
                                formik.setFieldValue('smsContent', '');
                            }

                            formik.setFieldValue('reminderTemplateType', newType);
                        }}
                    />
                </div>

                <div className="flex items-center gap-8">
                    <div>
                        <h4 className="mb-1 font-normal">{t('Services.SelectDuration')}</h4>
                        <RadixSelect
                            options={durationOptions}
                            value={
                                typeof formik?.values?.reminderMinutes === 'number'
                                    ? `${formik.values.reminderMinutes}min`
                                    : formik?.values?.reminderMinutes
                            }
                            placeholder={t('Services.SelectDuration')}
                            onValueChange={(val) =>
                                formik?.setFieldValue('reminderMinutes', parseInt(val.replace('min', ''), 10))
                            }
                        />
                    </div>

                    <div>
                        <h4 className="mb-1 font-normal">{t('Services.IsActive')}</h4>
                        <RadixSwitch
                            checked={formik?.values?.isActive}
                            onChange={(checked) => formik?.setFieldValue('isActive', checked)}
                            name="isActive"
                        />
                    </div>
                </div>

                {(formik?.values?.reminderTemplateType === 'SMS' ||
                    formik?.values?.reminderTemplateType === 'EMAIL_AND_SMS') && (
                    <div>
                        <h4 className="mb-1 font-normal">{t('Services.SmSContent')}</h4>
                        <RadixTextarea
                            name="smsContent"
                            value={
                                formik?.values?.reminderTemplateType === 'SMS' ||
                                formik?.values?.reminderTemplateType === 'EMAIL_AND_SMS'
                                    ? formik?.values?.smsContent
                                    : ''
                            }
                            onChange={formik?.handleChange}
                            onBlur={formik?.handleBlur}
                        />
                        {formik.touched.smsContent && formik.errors.smsContent && (
                            <p className="text-red-500 text-sm mt-1">{formik.errors.smsContent}</p>
                        )}
                    </div>
                )}

                {(formik?.values?.reminderTemplateType === 'EMAIL' ||
                    formik?.values?.reminderTemplateType === 'EMAIL_AND_SMS') && (
                    <div>
                        <h4 className="mb-1 font-normal">{t('Services.EmailContent')}</h4>
                        <div className="border">
                            <RadixInput
                                value={formik.values.emailSubject || ''}
                                placeholder={t('Services.EmailHeaderPlaceholder')}
                                className="w-full h-10 border-b rounded-none px-0 rounded-t-md py-1"
                                name="emailSubject"
                                onChange={(e) => formik.setFieldValue('emailSubject', e?.target?.value)}
                                onBlur={formik.handleBlur}
                            />

                            <CustomRichTextEditor
                                ref={editorRef}
                                key={formik?.values?.reminderTemplateId}
                                value={formik?.values?.emailContent || ''}
                                onChange={(val: string) => formik.setFieldValue('emailContent', val)}
                                className="w-full px-0 border rounded-none rounded-b-md"
                            />
                            <div className="flex flex-wrap gap-x-2 gap-y-3 mt-3">
                                {AdvanceReminderKeywords?.map((keywords: string, i: number) => (
                                    <RadixButton
                                        key={i}
                                        onClick={() => editorRef.current?.insertTextAtCursor(`\${${keywords}} `)}
                                        variant="outline"
                                        size="xs"
                                        className="!bg-[#fff4e9] !border-none !py-1 !px-2 !h-auto m-0 whitespace-nowrap"
                                    >
                                        {`{${keywords}}`}
                                    </RadixButton>
                                ))}
                            </div>
                            {formik?.touched?.emailContent && formik?.errors?.emailContent && (
                                <p className="text-red-500 text-sm mt-1">{formik?.errors?.emailContent}</p>
                            )}
                            {formik?.touched?.emailSubject && formik?.errors?.emailSubject && (
                                <p className="text-red-500 text-sm mt-1">{formik?.errors?.emailSubject}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full md:w-1/2 space-y-1 md:overflow-y-auto md:pr-2 mt-7 md:mt-0">
                <h4 className="m-0 font-normal">{t('POS.SelectService')}</h4>

                <RadixAccordionGroup type="multiple">
                    {services?.length > 0 ? (
                        services
                            ?.filter((group: any) => group?.services?.length > 0)
                            .map((group: any, idx: number) => {
                                const groupId = String(group?.id ?? idx);
                                const groupTitle = group?.group;
                                const servicesList: any[] = group?.services || [];

                                // ---- If no sub services
                                if (servicesList.length === 0) {
                                    const singleId = String(groupTitle);

                                    return (
                                        <RadixAccordion
                                            className="mb-2"
                                            asItem
                                            key={groupId}
                                            value={groupId}
                                            title={groupTitle}
                                        >
                                            <RadixCheckbox
                                                checked={formik?.values?.services?.includes(singleId)}
                                                onChange={(checked) => toggleService(singleId, checked)}
                                                label={groupTitle}
                                            />
                                        </RadixAccordion>
                                    );
                                }

                                // ---- Group with children
                                const groupIds = servicesList.map((svc) => String(svc.id ?? svc.value));

                                const allSelected =
                                    groupIds.length > 0 &&
                                    groupIds.every((id) => formik?.values?.services?.includes(id));

                                const someSelected = groupIds.some((id) => formik?.values?.services?.includes(id));

                                return (
                                    <RadixAccordion
                                        asItem
                                        key={groupId}
                                        value={groupId}
                                        className="mb-2"
                                        title={
                                            <div className="flex items-center gap-3 flex-1">
                                                <RadixCheckbox
                                                    checked={allSelected}
                                                    onChange={(checked) => toggleGroup(groupIds, checked)}
                                                    label={groupTitle}
                                                    className="flex-1"
                                                />
                                                {someSelected && !allSelected && (
                                                    <span className="text-xs text-gray-500">
                                                        (
                                                        {
                                                            groupIds.filter((id) =>
                                                                formik?.values?.services?.includes(id),
                                                            ).length
                                                        }
                                                        /{groupIds.length})
                                                    </span>
                                                )}
                                            </div>
                                        }
                                    >
                                        <div className="flex flex-col gap-3 ml-4">
                                            {servicesList.map((svc) => {
                                                const svcId = String(svc.id ?? svc.value);
                                                return (
                                                    <RadixCheckbox
                                                        key={svcId}
                                                        checked={formik?.values?.services?.includes(svcId)}
                                                        onChange={(checked) => toggleService(svcId, checked)}
                                                        label={svc?.name}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </RadixAccordion>
                                );
                            })
                    ) : (
                        <div className="text-gray-500 text-sm">{t('SpOffers.NoServ')}</div>
                    )}
                </RadixAccordionGroup>
                {formik?.touched?.services && formik?.errors?.services && (
                    <p className="text-red-500 text-sm mt-2">{formik?.errors?.services}</p>
                )}
            </div>

            {isPreview && (
                <RadixDialog
                    onOpenChange={() => setIsPreview(false)}
                    open={isPreview}
                    className="md:max-w-[80vw] h-[97%] flex flex-col pt-2"
                    title={
                        <h2 className="text-xl font-semibold m-0">
                            {t('Common.Email')} {t('Setting.Preview')}
                        </h2>
                    }
                >
                    <div className="flex-1 h-[95%]">
                        <iframe
                            title={t('Common.Email')}
                            srcDoc={generatePreviewHtml()}
                            width="100%"
                            height="100%"
                            className="w-full h-full"
                        />
                    </div>
                </RadixDialog>
            )}
        </>
    );
};

export default ReminderForm;
