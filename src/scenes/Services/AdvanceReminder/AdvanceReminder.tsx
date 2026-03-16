import { RowType } from '@/components/POS/Common';
import {
    RadixBadge,
    RadixButton,
    RadixDialog,
    RadixInput,
    RadixSelect,
    RadixTable,
    RadixCard,
    RadixSpinner,
    ColumnType,
    RadixDropdown,
    RadixMultiSelect,
} from '@/components/radix';
import { Edit, MoreVert, Visibility, Close } from '@mui/icons-material';
import { t } from 'i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from '@/hooks/shared';
// @ts-ignore
import { GetServiceGroup } from '@/utils/Api/Service';
import { useFormik } from 'formik';
import ReminderForm from '@/components/reminderTemplate/ReminderForm';
import * as Yup from 'yup';
import { api } from '@/utils/Api/POS';
import {
    GetApiServiceAdvancedReminderTemplates200TemplatesItem,
    GetApiServiceAdvancedReminderTemplates200TemplatesItemServicesItem,
    PostApiServiceAdvancedReminderTemplatesBodyReminderTemplateType,
    GetApiServiceAdvancedReminderTemplatesSortBy,
} from '@/shared/api/models';
import { toast } from '@/utils/toast';
import ChevronRightIcon from '@/assets/Marketing/ChevronRight.svg';
//@ts-ignore
import { DefaultEmail } from '@/scenes/Services/AdvanceReminder/AdvanceReminderDefaultEmail.js';
// @ts-ignore
import { SmsEmailTemplates } from '@/components/settings/onlineBooking/DefaultSmsEmails';
const DeleteIcon = require('@/assets/Delete.svg').default;

export interface ReminderTemplate {
    emailContent: string;
    emailSubject: string;
    isActive: boolean;
    reminderMinutes: number;
    reminderTemplateId?: string;
    reminderTemplateName: string;
    reminderTemplateType: string;
    services: string[];
    smsContent: string;
    serviceIds?: number[];
}

interface QueryParamsDataType {
    page: number;
    limit: number;
    totalPages: number;
    debouncedSearchTerm: string;
    sortOrder: 'asc' | 'desc' | null;
    sortBy: GetApiServiceAdvancedReminderTemplatesSortBy | null;
    statusFilter: boolean | null;
}

const AdvanceReminder = () => {
    const isDesktop = useMediaQuery('(min-width: 960px)');
    const [isLoading, setLoading] = useState(false);
    const [postLoading, setPostLoading] = useState(false);
    const [createTemplate, setCreateTemplate] = useState<boolean>(false);
    const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [services, setServices] = useState([]);
    const [componentOpenType, setComponentOpenType] = useState<'create' | 'edit'>('create');
    const [searchTerm, setSearchTerm] = useState('');
    const [msgTypeFilter, setMsgTypeFilter] = useState<Set<string>>(new Set());
    const [templates, setTemplates] = useState<GetApiServiceAdvancedReminderTemplates200TemplatesItem[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ReminderTemplate | null>(null);
    const [isPreview, setIsPreview] = useState(false);

    const [queryParams, setQueryParams] = useState<QueryParamsDataType>({
        page: 1,
        limit: 25,
        totalPages: 1,
        debouncedSearchTerm: searchTerm,
        sortOrder: null,
        sortBy: null,
        statusFilter: null,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setQueryParams((prev) => ({
                ...prev,
                debouncedSearchTerm: searchTerm,
            }));
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const defaultValues: ReminderTemplate = {
        reminderTemplateName: '',
        reminderTemplateType: 'EMAIL_AND_SMS',
        reminderMinutes: 5,
        emailSubject: DefaultEmail?.custom_email?.email_subject || '',
        emailContent: DefaultEmail?.custom_email?.default_body_content || '',
        smsContent: '',
        isActive: true,
        services: [],
    };
    const [initialValues, setInitialValues] = useState<ReminderTemplate>(defaultValues);
    const validationSchema = Yup.object().shape({
        reminderTemplateName: Yup.string().required(t('Services.TempNameReq')).trim(),

        services: Yup.array().min(1, t('Marketing.ServicesRequired')).required(t('Marketing.ServicesRequired')),

        smsContent: Yup.string().when('reminderTemplateType', {
            is: (val: string) => val === 'SMS' || val === 'EMAIL_AND_SMS',
            then: (schema) => schema.required(t('Services.SMSReq')).trim(),
            otherwise: (schema) => schema.notRequired(),
        }),

        emailSubject: Yup.string().when('reminderTemplateType', {
            is: (val: string) => val === 'EMAIL' || val === 'EMAIL_AND_SMS',
            then: (schema) => schema.required(t('Services.EmailHeaderReq')).trim(),
            otherwise: (schema) => schema.notRequired(),
        }),

        emailContent: Yup.string().when('reminderTemplateType', {
            is: (val: string) => val === 'EMAIL' || val === 'EMAIL_AND_SMS',
            then: (schema) => schema.required(t('Services.EmailReq')).trim(),
            otherwise: (schema) => schema.notRequired(),
        }),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: (value) => postAndPatchTemplate(value as ReminderTemplate),
    });

    const fetchServices = async () => {
        try {
            const response = await GetServiceGroup();

            if (response) {
                setServices(response?.data?.data);
            }
        } catch (error) {
            console.error('Error : ', error);
        }
    };

    const postAndPatchTemplate = async (value: ReminderTemplate) => {
        const allServices = services?.flatMap((serviceObj) => serviceObj?.services)?.map((service) => service.id);
        const filterValues = value?.services?.filter((service) => allServices?.includes(Number(service)))?.map(Number);

        try {
            setPostLoading(true);
            const inMin =
                typeof value?.reminderMinutes === 'string'
                    ? parseInt(value?.reminderMinutes, 10)
                    : value?.reminderMinutes;

            if (componentOpenType === 'create') {
                const response = await api.postApiServiceAdvancedReminderTemplates({
                    reminderMinutes: inMin,
                    reminderTemplateName: value?.reminderTemplateName,
                    reminderTemplateType:
                        value?.reminderTemplateType as PostApiServiceAdvancedReminderTemplatesBodyReminderTemplateType,
                    emailContent: value?.emailContent,
                    emailSubject: value?.emailSubject,
                    isActive: value?.isActive,
                    serviceIds: value?.services.map((id: string) => parseInt(id, 10)),
                    smsContent: value?.smsContent,
                });

                if (response) {
                    setCreateTemplate(false);
                    formik?.resetForm();
                    setInitialValues(defaultValues);
                    fetchAllTemplates();
                    toast.success(t('Services.TemplateCreatedSuccessfully'));
                }
            }

            if (componentOpenType === 'edit') {
                if (selectedTemplate && selectedTemplate?.reminderTemplateId) {
                    const response = await api.patchApiServiceAdvancedReminderTemplatesReminderTemplateId(
                        selectedTemplate?.reminderTemplateId,
                        {
                            reminderMinutes: inMin,
                            reminderTemplateName: value?.reminderTemplateName,
                            reminderTemplateType:
                                value?.reminderTemplateType as PostApiServiceAdvancedReminderTemplatesBodyReminderTemplateType,
                            emailContent: value?.emailContent,
                            emailSubject: value?.emailSubject,
                            isActive: value?.isActive,
                            serviceIds: filterValues,
                            smsContent: value?.smsContent,
                        },
                    );

                    if (response) {
                        setCreateTemplate(false);
                        formik?.resetForm();
                        setInitialValues(defaultValues);
                        fetchAllTemplates();
                        toast.success(t('Services.TemplateUpdatedSuccessfully'));
                    }
                }
            }
        } catch (error) {
            console.error('Error : ', error);
            toast.error(t('POS.SomethingWentWrong'));
        } finally {
            setPostLoading(false);
        }
    };

    const deleteTemplate = async () => {
        try {
            setPostLoading(true);
            if (selectedTemplate && selectedTemplate?.reminderTemplateId) {
                const response = await api.deleteApiServiceAdvancedReminderTemplatesReminderTemplateId(
                    selectedTemplate?.reminderTemplateId,
                );

                if (response) {
                    setIsDeleteModelOpen(false);
                    fetchAllTemplates();
                    toast.success(t('Services.TemplateDeletedSuccessfully'));
                }
            }
        } catch (error) {
            console.error('Error : ', error);
        } finally {
            setPostLoading(false);
        }
    };

    const durationOptions = useMemo(
        () => [
            ...Array.from({ length: 12 }, (_, i) => {
                const minutes = (i + 1) * 5;
                return { label: `${minutes} min`, value: `${minutes}min` };
            }),
            // Fixed hourly durations
            { label: '2 hours', value: '120min' },
            { label: '6 hours', value: '360min' },
            { label: '12 hours', value: '720min' },
            { label: '24 hours', value: '1440min' },
            { label: '48 hours', value: '2880min' },
            { label: '72 hours', value: '4320min' },
        ],
        [],
    );

    const formatDuration = (minutes?: number) => {
        if (!minutes && minutes !== 0) return '';

        if (minutes < 60) {
            return `${minutes} min`;
        }

        if (minutes < 1440) {
            const hours = minutes / 60;
            return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hour`;
        }

        const days = minutes / 1440;
        return `${days % 1 === 0 ? days : days.toFixed(1)} day${days > 1 ? 's' : ''}`;
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const generatePreviewHtml = (template: ReminderTemplate) => {
        const defaultTemplate = DefaultEmail?.custom_email?.email_body || '';
        const subject = template?.emailSubject || '';
        const content = template?.emailContent || '';

        if (content.includes('<!DOCTYPE') || content.includes('<html')) {
            return content;
        }

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

    const column: ColumnType[] = useMemo(() => {
        return [
            {
                id: 'reminderTemplateName',
                name: t('Customer.TmpName'),
                width: '40%',
                selector: (row: RowType) => (
                    <h4 className="m-0">
                        <div className="font-normal">{row?.reminderTemplateName}</div>
                        <div className="mt-2 flex gap-2 font-normal items-center w-full overflow-hidden">
                            {(() => {
                                const maxToShow = 3;
                                const services = row?.services || [];
                                const visibleServices = services.slice(0, maxToShow);
                                const remainingCount = services.length - maxToShow;

                                return (
                                    <>
                                        {visibleServices.map(
                                            (
                                                service: GetApiServiceAdvancedReminderTemplates200TemplatesItemServicesItem,
                                            ) => (
                                                <div key={service?.serviceId} className="flex-shrink-0 max-w-[180px]">
                                                    <RadixBadge rounded variant="info">
                                                        <div className="truncate w-16 overflow-hidden">
                                                            {service?.serviceName}
                                                        </div>
                                                    </RadixBadge>
                                                </div>
                                            ),
                                        )}

                                        {remainingCount > 0 && (
                                            <div className="flex-shrink-0">
                                                <RadixBadge rounded variant="info">
                                                    +{remainingCount} {t('Statistics.AppointmentsServices')}
                                                </RadixBadge>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </h4>
                ),
                sortable: true,
            },
            {
                id: 'reminderTemplateType',
                name: t('Services.MsgType'),
                width: '10%',
                selector: (row: RowType) => (
                    <h4 className="m-0 font-normal text-center">
                        {row?.reminderTemplateType === 'EMAIL'
                            ? t('Common.Email')
                            : row?.reminderTemplateType === 'SMS'
                              ? t('Calendar.SMS')
                              : row?.reminderTemplateType === 'EMAIL_AND_SMS'
                                ? t('Services.SMSEmail')
                                : null}
                    </h4>
                ),
                textAlign: 'center',
                columnLabelStyles: '!text-center [&>div]:!justify-center',
            },
            {
                id: 'reminderMinutes',
                name: t('Common.Duration'),
                width: '10%',
                selector: (row: RowType) => (
                    <h4 className="m-0 font-normal text-center">{formatDuration(row?.reminderMinutes)}</h4>
                ),
                sortable: true,
                textAlign: 'center',
                columnLabelStyles: '!text-center [&>div]:!justify-center',
            },
            {
                id: 'isActive',
                name: t('Common.Status'),
                width: '10%',
                selector: (row: RowType) => (
                    <div className="w-full flex justify-center">
                        <RadixBadge rounded variant={row?.isActive ? 'success' : 'danger'}>
                            {row.isActive ? t('Marketing.Active') : t('Services.Inactive')}
                        </RadixBadge>
                    </div>
                ),
                columnLabelStyles: '!text-center [&>div]:!justify-center',
            },
            {
                id: 'actions',
                name: '',
                width: '10%',
                selector: (row: RowType) => (
                    <div className="flex justify-end w-full">
                        <RadixDropdown
                            trigger={
                                <div className="cursor-pointer hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                                    <MoreVert className="text-gray-500" fontSize="small" />
                                </div>
                            }
                            itemClassName="!py-2"
                            contentClassName="min-w-[30px] mr-5"
                            items={[
                                {
                                    label: (
                                        <div className="flex justify-between items-center w-full gap-4 text-sm font-medium">
                                            <span>{t('Common.Edit')}</span>
                                            <Edit fontSize="small" className="text-gray-500" />
                                        </div>
                                    ),
                                    onClick: () => {
                                        setComponentOpenType('edit');
                                        setCreateTemplate(true);

                                        const formattedValues: ReminderTemplate = {
                                            reminderTemplateName: row?.reminderTemplateName,
                                            reminderTemplateType: row?.reminderTemplateType,
                                            reminderMinutes: row?.reminderMinutes,
                                            emailSubject: row?.emailSubject,
                                            emailContent: row?.emailContent,
                                            smsContent: row?.smsContent,
                                            isActive: row?.isActive,
                                            reminderTemplateId: row?.reminderTemplateId,
                                            services:
                                                row?.services?.map(
                                                    (
                                                        service: GetApiServiceAdvancedReminderTemplates200TemplatesItemServicesItem,
                                                    ) => service?.serviceId.toString(),
                                                ) || [],
                                        };

                                        setSelectedTemplate(formattedValues);
                                        setInitialValues(formattedValues);
                                    },
                                },
                                ...(row?.reminderTemplateType === 'EMAIL' ||
                                row?.reminderTemplateType === 'EMAIL_AND_SMS'
                                    ? [
                                          {
                                              label: (
                                                  <div className="flex justify-between items-center w-full gap-4 text-sm font-medium">
                                                      <span>{t('Setting.Preview')}</span>
                                                      <Visibility fontSize="small" className="text-gray-500" />
                                                  </div>
                                              ),
                                              onClick: () => {
                                                  setPreviewContent(
                                                      generatePreviewHtml(row as unknown as ReminderTemplate),
                                                  );
                                                  setIsPreviewOpen(true);
                                              },
                                          },
                                      ]
                                    : []),
                                {
                                    label: (
                                        <div className="flex justify-between items-center w-full gap-4 text-sm font-medium text-red-500">
                                            <span>{t('Common.Delete')}</span>
                                            <img src={DeleteIcon} alt="delete" className="w-[18px]" />
                                        </div>
                                    ),
                                    onClick: () => {
                                        setIsDeleteModelOpen(true);
                                        setSelectedTemplate(row as ReminderTemplate);
                                    },
                                },
                            ]}
                        />
                    </div>
                ),
            },
        ];
    }, [
        t,
        formatDuration,
        generatePreviewHtml,
        setComponentOpenType,
        setCreateTemplate,
        setSelectedTemplate,
        setInitialValues,
        setPreviewContent,
        setIsPreviewOpen,
        setIsDeleteModelOpen,
    ]);

    const fetchAllTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.getApiServiceAdvancedReminderTemplates({
                page: queryParams?.page,
                limit: queryParams?.limit,
                isActive: queryParams?.statusFilter ?? undefined,
                reminderTemplateType: msgTypeFilter.size > 0 ? Array.from(msgTypeFilter).join(',') : undefined,
                keyword: queryParams?.debouncedSearchTerm,
                sortBy: (queryParams?.sortBy as GetApiServiceAdvancedReminderTemplatesSortBy) || undefined,
                sortOrder: queryParams?.sortOrder || undefined,
            });

            if (response?.templates) {
                setTemplates(response?.templates);
                setQueryParams((prev) => ({
                    ...prev,
                    totalPages: response?.totalPages || 1,
                }));
            }
        } catch (error) {
            console.error('Error : ', error);
        } finally {
            setLoading(false);
        }
    }, [
        queryParams?.page,
        queryParams?.limit,
        queryParams?.statusFilter,
        msgTypeFilter,
        queryParams?.debouncedSearchTerm,
        queryParams?.sortBy,
        queryParams?.sortOrder,
    ]);

    useEffect(() => {
        fetchAllTemplates();
    }, [fetchAllTemplates]);

    return (
        <div className="p-4 py-6">
            {/* filter options */}
            <div className="block md:flex justify-between items-center gap-5 mt-4">
                <h3 className="mb-0">{t('Services.AdvanceReminderTemp')}</h3>
                <div className="block md:flex items-center gap-6">
                    <div className="w-1/8">
                        <RadixInput
                            className="w-[200px] mt-[18px]"
                            placeholder={t('Services.SearchTemplate')}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setQueryParams((prev) => ({
                                    ...prev,
                                    page: 1,
                                }));
                            }}
                        />
                    </div>
                    <div className="ml-0 md:ml-2 w-30 mt-[18px]">
                        <RadixSelect
                            options={[
                                { label: t('Services.AllTemp'), value: 'null' },
                                { label: t('Services.ActiveTemp'), value: 'active' },
                                { label: t('Services.InactiveTemp'), value: 'deactive' },
                            ]}
                            onValueChange={(value) => {
                                setQueryParams((prev) => ({
                                    ...prev,
                                    statusFilter: value === 'null' ? null : value === 'active' ? true : false,
                                    page: 1,
                                }));
                            }}
                            value={
                                queryParams?.statusFilter === null
                                    ? 'null'
                                    : queryParams?.statusFilter === true
                                      ? 'active'
                                      : 'deactive'
                            }
                            placeholder={t('Common.Status')}
                        />
                    </div>

                    <div className="mt-[18px]">
                        <RadixMultiSelect
                            options={[
                                { label: t('Services.SMS'), value: 'SMS' },
                                { label: t('Services.Email'), value: 'EMAIL' },
                            ]}
                            selectedValues={msgTypeFilter}
                            onSelectionChange={(values) => {
                                setMsgTypeFilter(values);
                                setQueryParams((prev) => ({
                                    ...prev,
                                    page: 1,
                                }));
                            }}
                            placeholder={t('Services.MsgType')}
                            textToDisplayWithCount={t('Services.SMSEmail')}
                            hideCount={true}
                            className="w-full"
                        />
                    </div>
                    <RadixButton
                        onClick={() => {
                            setComponentOpenType('create');
                            setCreateTemplate(true);
                            setInitialValues(defaultValues);
                        }}
                        size="base"
                        className="mt-5 w-full md:w-auto"
                    >
                        {`+ ${t('Setting.AddReminderTemp')}`}
                    </RadixButton>
                </div>
            </div>

            {/* table */}
            <div className="mt-5">
                {isDesktop ? (
                    <div className="overflow-x-auto">
                        <RadixTable
                            loading={isLoading}
                            columns={column}
                            data={templates}
                            isServerSorting={true}
                            serverSortOrder={queryParams?.sortOrder || 'desc'}
                            defaultOrder={queryParams?.sortBy || 'createdAt'}
                            onSort={(columnId) => {
                                setQueryParams((prev) => ({
                                    ...prev,
                                    sortBy: columnId as GetApiServiceAdvancedReminderTemplatesSortBy,
                                    sortOrder:
                                        prev.sortBy === columnId ? (prev.sortOrder === 'asc' ? 'desc' : 'asc') : 'desc',
                                    page: 1,
                                }));
                            }}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {templates.length === 0 && !isLoading && (
                            <div className="text-center py-8 border border-border-default rounded-md p-4 border-solid">
                                <p className="text-text-secondary">{t('Customer.NoDataFound')}</p>
                            </div>
                        )}
                        {templates.map((template) => (
                            <RadixCard
                                key={template.reminderTemplateId}
                                className="border border-solid border-border-default rounded-lg p-4"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-semibold text-text-primary m-0 mb-1 truncate block w-full">
                                            {template.reminderTemplateName}
                                        </h4>
                                        <div className="mt-1 flex gap-2 font-normal items-center w-full overflow-hidden">
                                            {(() => {
                                                const maxToShow = 2;
                                                const services = template.services || [];
                                                const visibleServices = services.slice(0, maxToShow);
                                                const remainingCount = services.length - maxToShow;

                                                return (
                                                    <>
                                                        {visibleServices.map(
                                                            (
                                                                service: GetApiServiceAdvancedReminderTemplates200TemplatesItemServicesItem,
                                                            ) => (
                                                                <div
                                                                    key={service.serviceId}
                                                                    className="flex-shrink-0 max-w-[120px]"
                                                                >
                                                                    <RadixBadge rounded variant="info">
                                                                        <div className="truncate w-12 overflow-hidden">
                                                                            {service.serviceName}
                                                                        </div>
                                                                    </RadixBadge>
                                                                </div>
                                                            ),
                                                        )}

                                                        {remainingCount > 0 && (
                                                            <div className="flex-shrink-0">
                                                                <RadixBadge rounded variant="info">
                                                                    +{remainingCount}{' '}
                                                                    {t('Statistics.AppointmentsServices')}
                                                                </RadixBadge>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <RadixBadge rounded variant={template?.isActive ? 'success' : 'danger'}>
                                        {template?.isActive ? t('Marketing.Active') : t('Integration.Deactive')}
                                    </RadixBadge>
                                </div>

                                <div className="space-y-2 border-border-default border-t-2 border-dashed border-b-0 border-l-0 border-r-0 pb-2 pt-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-secondary">{t('Services.MsgType')}:</span>
                                        <span className="text-text-primary font-medium">
                                            {template?.reminderTemplateType === 'EMAIL'
                                                ? t('Common.Email')
                                                : template?.reminderTemplateType === 'SMS'
                                                  ? t('Calendar.SMS')
                                                  : template?.reminderTemplateType === 'EMAIL_AND_SMS'
                                                    ? t('Services.SMSEmail')
                                                    : template?.reminderTemplateType}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-secondary">{t('Common.Duration')}:</span>
                                        <span className="text-text-primary font-medium">
                                            {formatDuration(template?.reminderMinutes)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-6 mt-3 pt-3">
                                    <div
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => {
                                            setComponentOpenType('edit');
                                            setCreateTemplate(true);

                                            const formattedValues: ReminderTemplate = {
                                                reminderTemplateName: template?.reminderTemplateName || '',
                                                reminderTemplateType: template?.reminderTemplateType || 'SMS',
                                                reminderMinutes: template?.reminderMinutes || 5,
                                                emailSubject: template?.emailSubject || '',
                                                emailContent: template?.emailContent || '',
                                                smsContent: template?.smsContent || '',
                                                isActive: template?.isActive || false,
                                                reminderTemplateId: template?.reminderTemplateId,
                                                services:
                                                    template?.services?.map(
                                                        (
                                                            service: GetApiServiceAdvancedReminderTemplates200TemplatesItemServicesItem,
                                                        ) => service?.serviceId.toString(),
                                                    ) || [],
                                            };

                                            setSelectedTemplate(formattedValues);
                                            setInitialValues(formattedValues);
                                        }}
                                    >
                                        <Edit fontSize="small" />
                                        <h4 className="font-normal m-0 text-sm">{t('Common.Edit')}</h4>
                                    </div>
                                    {(template?.reminderTemplateType === 'EMAIL' ||
                                        template?.reminderTemplateType === 'EMAIL_AND_SMS') && (
                                        <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={() => {
                                                setPreviewContent(
                                                    generatePreviewHtml(template as unknown as ReminderTemplate),
                                                );
                                                setIsPreviewOpen(true);
                                            }}
                                        >
                                            <Visibility fontSize="small" className="text-gray-500" />
                                            <h4 className="font-normal m-0 text-sm">{t('Setting.Preview')}</h4>
                                        </div>
                                    )}

                                    <div
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => {
                                            setIsDeleteModelOpen(true);
                                            setSelectedTemplate(template as unknown as ReminderTemplate);
                                        }}
                                    >
                                        <img src={DeleteIcon} alt="deleteIcon" />
                                        <h4 className="font-normal m-0 text-sm">{t('Common.Delete')}</h4>
                                    </div>
                                </div>
                            </RadixCard>
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-between p-4 border-solid border-[1px] mt-4 md:mt-2 rounded-md border-border-default">
                    <div className="text-sm text-text-primary">
                        {t('Common.Showing')} {templates.length} {t('Common.of')} {queryParams?.limit}{' '}
                        {t('Common.items')}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text-primary">
                            {t('Common.Page')} {queryParams?.page} {t('Common.of')} {queryParams?.totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <RadixButton
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setQueryParams((prev) => ({
                                        ...prev,
                                        page: Math.max(prev.page - 1, 1),
                                    }))
                                }
                                iconOnly
                                disabled={queryParams?.page === 1 || isLoading}
                            >
                                <img src={ChevronRightIcon} alt="Chevron Left" className="w-4 h-4 rotate-[180deg]" />
                            </RadixButton>
                            <RadixButton
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setQueryParams((prev) => ({
                                        ...prev,
                                        page: Math.min(prev.page + 1, queryParams?.totalPages),
                                    }))
                                }
                                iconOnly
                                disabled={queryParams?.page === queryParams?.totalPages || isLoading}
                            >
                                <img src={ChevronRightIcon} alt="Chevron Right" className="w-4 h-4" />
                            </RadixButton>
                        </div>
                    </div>
                </div>
            </div>

            {createTemplate && (
                <RadixDialog
                    onOpenChange={(open) => {
                        if (!open) {
                            formik.resetForm();
                            setInitialValues(defaultValues);
                            setSelectedTemplate(null);
                            setComponentOpenType('create');
                        }
                        setCreateTemplate(open);
                    }}
                    footer={
                        <div
                            className={`flex items-center w-full mt-2 ${formik?.values?.reminderTemplateType === 'EMAIL' || formik?.values?.reminderTemplateType === 'EMAIL_AND_SMS' ? 'justify-between' : 'justify-end'}`}
                        >
                            {(formik?.values?.reminderTemplateType === 'EMAIL' ||
                                formik?.values?.reminderTemplateType === 'EMAIL_AND_SMS') && (
                                <RadixButton
                                    variant="primary"
                                    className={`flex items-center gap-2 mb-2 sm:mb-0 cursor-pointer h-[33.5px] ${!isDesktop && 'mt-2'} ${isDesktop && 'min-w-[135px]'}`}
                                    onClick={() => {
                                        setIsPreview(true);
                                    }}
                                    size={isDesktop ? 'xs' : 'sm'}
                                    iconOnly={!isDesktop}
                                >
                                    <Visibility className="w-5" />
                                    {isDesktop && <h4>{t('Setting.Preview')}</h4>}
                                </RadixButton>
                            )}
                            <div className="flex gap-3">
                                <RadixButton
                                    onClick={() => {
                                        formik.resetForm();
                                        setCreateTemplate(false);
                                    }}
                                    className="bg-[#d9d9d9] mr-0.5"
                                    disabled={postLoading}
                                    size="xs"
                                >
                                    {t('Setting.Cancel')}
                                </RadixButton>

                                <RadixButton onClick={() => formik?.handleSubmit()} disabled={postLoading} size="xs">
                                    {postLoading ? (
                                        <span className="flex items-center gap-2">
                                            <RadixSpinner size="sm" variant="white" />
                                            {t('Common.Submit')}
                                        </span>
                                    ) : (
                                        t('Common.Submit')
                                    )}
                                </RadixButton>
                            </div>
                        </div>
                    }
                    open={createTemplate}
                    title={componentOpenType === 'create' ? t('Services.CreateTemplate') : t('Services.EditTemplate')}
                    className="max-h-[95%] md:max-h-[75vh] md:max-w-[70%] flex flex-col pb-2 pt-2"
                    children={
                        <ReminderForm
                            durationOptions={durationOptions}
                            formik={formik}
                            services={services}
                            setCreateTemplate={setCreateTemplate}
                            postLoading={postLoading}
                            AdvanceReminderKeywords={SmsEmailTemplates?.AdvanceReminderKeywords}
                            isPreview={isPreview}
                            setIsPreview={setIsPreview}
                        />
                    }
                    contentClassName="md:flex gap-2"
                />
            )}

            {isDeleteModelOpen && (
                <RadixDialog
                    open={isDeleteModelOpen}
                    title={t('Setting.AreYouSureYouWantToDelete')}
                    description={t('Services.DeleteTemplateMsg')}
                    onOpenChange={() => setIsDeleteModelOpen(false)}
                >
                    <div className="flex justify-end gap-2">
                        <RadixButton
                            disabled={postLoading}
                            className="bg-[#d9d9d9]"
                            onClick={() => setIsDeleteModelOpen(false)}
                        >
                            {t('Marketing.Cancel')}
                        </RadixButton>
                        <RadixButton
                            variant="danger"
                            onClick={() => {
                                deleteTemplate();
                            }}
                            disabled={postLoading}
                        >
                            {postLoading ? (
                                <div className="flex items-center gap-2">
                                    <RadixSpinner size="sm" variant="white" />
                                    {t('Common.Delete')}
                                </div>
                            ) : (
                                t('Common.Delete')
                            )}
                        </RadixButton>
                    </div>
                </RadixDialog>
            )}

            {isPreviewOpen && (
                <RadixDialog
                    onOpenChange={() => setIsPreviewOpen(false)}
                    open={isPreviewOpen}
                    className="md:max-w-[80vw] h-[95%] flex flex-col p-4"
                    title={
                        <h2 className="text-xl font-semibold m-0">
                            {t('Common.Email')} {t('Setting.Preview')}
                        </h2>
                    }
                >
                    <div className="flex-1 overflow-hidden h-[95%]">
                        <iframe
                            title="Template Preview"
                            srcDoc={previewContent}
                            width="100%"
                            height="100%"
                            className="w-full h-full border-none rounded-md bg-white"
                        />
                    </div>
                </RadixDialog>
            )}
        </div>
    );
};

export default AdvanceReminder;
