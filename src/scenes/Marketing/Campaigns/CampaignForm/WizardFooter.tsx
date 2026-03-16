import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { toast } from '@/utils/toast';
import {
    CampaignData,
    CampaignState,
    resetCampaignForm,
    setStep2ValidationErrors,
    BOOKING_VALIDATION_SCHEMA,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
} from '@/redux/slices/Marketing/campaigns';
import { RadixButton, RadixSpinner, RadixDialog, RadixInput, RadixPhoneField } from '@/components/radix';
import { api } from '@/utils/Api/POS';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateMarketingQueries } from '@/hooks/api/marketing';
import { useMediaQuery } from '@/hooks/shared';
import { cnMerge } from '@/utils/cnMerge';
import {
    setTestDialogOpen,
    setTestEmail,
    setTestPhone,
    setTestEmailSubject,
    setIsSendingTest,
    setCurrentStep,
} from '@/redux/slices/Marketing/campaigns';

interface WizardFooterProps {
    onNext?: (step: number) => void;
    // When false, hide edit/send-test/start/delete actions on the summary step.
    canEditCampaign?: boolean;
}

const FooterActions = ({
    onNext,
    nextDisabled,
    isLoading,
}: {
    onNext?: () => void;
    nextDisabled?: boolean;
    isLoading?: boolean;
}) => {
    const LoadingLabel = isLoading ? (
        <span className="flex items-center gap-2">
            <RadixSpinner size="sm" variant="white" />
            {t('Common.Loading')}
        </span>
    ) : null;

    return (
        <div className="flex gap-3 w-full md:justify-end">
            <RadixButton
                onClick={onNext}
                disabled={nextDisabled || isLoading}
                className="flex-1 md:flex-none  !font-[urbanist]"
            >
                {LoadingLabel || t('Common.Next')}
            </RadixButton>
        </div>
    );
};

const Step1Footer = ({ onNext, step1 }: any) => (
    <FooterActions onNext={() => onNext?.(1)} nextDisabled={!isStep1Valid(step1)} />
);

const Step2Footer = ({ step2Data, onNext }: any) => {
    const dispatch = useDispatch();
    const nextDisabled = !isStep2Valid(step2Data);
    const { selectedGroups, customerGroupName, filters, group2Value } = step2Data || {};
    const hasGroup1 = selectedGroups?.includes('ALL_WITH_CONSENT') || selectedGroups?.includes('WITHOUT_CONSENT');

    const handleNext = async () => {
        if (!hasGroup1) return;

        if (group2Value === 'CUSTOMER_GROUP' && !customerGroupName?.trim()) {
            dispatch(
                setStep2ValidationErrors({ customerGroup: t('Marketing.EmailCampaignsPleaseSelectCustomerGroup') }),
            );
            return;
        }

        if (group2Value === 'BOOKING') {
            try {
                await BOOKING_VALIDATION_SCHEMA.validate(
                    {
                        fromDate: filters?.fromDate || '',
                        toDate: filters?.toDate || '',
                        employee: filters?.employee || '',
                        treatments: filters?.treatments || [],
                    },
                    { abortEarly: false },
                );
                dispatch(setStep2ValidationErrors(null));
            } catch (e: any) {
                const errors: Record<string, string> = {};
                if (e.inner) {
                    e.inner.forEach((err: any) => {
                        if (err.path) {
                            errors[err.path] = err.message;
                        }
                    });
                }
                dispatch(setStep2ValidationErrors(errors));
                return;
            }
        }

        dispatch(setStep2ValidationErrors(null));
        onNext?.(2);
    };

    return <FooterActions onNext={handleNext} nextDisabled={nextDisabled} />;
};

const Step3Footer = ({ step3Data, onNext, campaignType }: any) => (
    <FooterActions onNext={() => onNext?.(3)} nextDisabled={!isStep3Valid(step3Data, campaignType)} />
);

const Step4Footer = ({
    step4Data,
    onNext,
    isCreating,
    step1,
    step2,
    step3,
    campaignType,
}: {
    step4Data: CampaignData['step4'];
    onNext?: (step: number) => Promise<void>;
    isCreating: boolean;
    step1: CampaignData['step1'];
    step2: CampaignData['step2'];
    step3: CampaignData['step3'];
    campaignType: CampaignState['campaignType'];
}) => {
    const step4Valid = isStep4Valid(step4Data ?? ({} as CampaignData['step4']));

    const validatePreviousSteps = async () => {
        if (!isStep1Valid(step1)) {
            toast.error(t('Marketing.Step1DataPending'));
            return false;
        }
        if (!isStep2Valid(step2)) {
            toast.error(t('Marketing.Step2DataPending'));
            return false;
        }
        if (!isStep3Valid(step3, campaignType)) {
            toast.error(t('Marketing.Step3DataPending'));
            return false;
        }
        return true;
    };

    const handleNext = async () => {
        const isValid = await validatePreviousSteps();
        if (!isValid) {
            return;
        }
        await onNext?.(4);
    };

    return <FooterActions onNext={handleNext} nextDisabled={!step4Valid || isCreating} isLoading={isCreating} />;
};

const Step5Footer = ({
    isEditing,
    isTriggering,
    isDeleting,
    createdCampaign,
    step4Data,
    onStart,
    onDelete,
    onEditCampaign,
    onSendTest,
    isDesktop,
    campaignType,
    step3Data,
    canEditCampaign = true,
}: any) => {
    const hasNoRecipients = createdCampaign?.recipientCount === 0;
    const sendImmediately = step4Data?.isManualTrigger;

    const disableStart = isTriggering || (hasNoRecipients && sendImmediately);
    const isSMS = campaignType === 'SMS';

    const LoadingLabel = (
        <span className="flex items-center gap-2">
            <RadixSpinner size="sm" variant="white" />
            {t('Common.Loading')}
        </span>
    );

    return (
        <div className="flex flex-col gap-3 pt-4">
            {/* Mobile-only buttons: Edit Campaign and Send Test */}
            {!isDesktop && canEditCampaign && (
                <div className="flex gap-2 w-full">
                    <RadixButton
                        onClick={onEditCampaign}
                        variant="outline"
                        className="flex-1 border-primary-500 !text-primary-500 !font-[urbanist]"
                    >
                        {t('Marketing.EditCampaign')}
                    </RadixButton>
                    <RadixButton
                        onClick={onSendTest}
                        variant="outline"
                        className="flex-1 border-primary-500 !text-primary-500 !font-[urbanist]"
                    >
                        {isSMS ? t('Marketing.SMSCampaignsSendTestSMS') : t('Marketing.EmailCampaignsSendTestEmail')}
                    </RadixButton>
                </div>
            )}

            {/* Start and Delete buttons */}
            <div className="flex gap-3 w-full justify-between">
                {canEditCampaign && isEditing && (
                    <RadixButton
                        onClick={onDelete}
                        disabled={isDeleting || isTriggering}
                        variant="outline"
                        className="w-full md:w-fit border-none text-red-500 underline !font-[urbanist] !text-base"
                    >
                        {isDeleting ? LoadingLabel : t('SpOffers.DelCmp')}
                    </RadixButton>
                )}

                {canEditCampaign && (
                    <RadixButton
                        onClick={onStart}
                        disabled={disableStart}
                        variant="primary"
                        className={cnMerge('w-full md:w-fit !font-[urbanist]', !isEditing && 'ms-auto')}
                    >
                        {isTriggering ? LoadingLabel : t('Marketing.EmailCampaignsStartCampaign')}
                    </RadixButton>
                )}
            </div>
        </div>
    );
};

export default function WizardFooter({ onNext, canEditCampaign = true }: WizardFooterProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isDesktop = useMediaQuery('(min-width: 960px)');
    const [isTriggering, setIsTriggering] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const {
        currentStep,
        editingCampaignId,
        campaignData: { step1, step2, step3, step4 },
        createdCampaign,
        isCreating,
        campaignType,
        testCampaign,
    } = useSelector((state: any) => state.campaigns) as CampaignState;

    const isSMS = campaignType === 'SMS';
    const { testDialogOpen, testEmail, testPhone, testEmailSubject, isSendingTest } = testCampaign;

    const isEditing = !!editingCampaignId;
    const activeStep = Math.max(currentStep, 1);

    /* ---------------------- Trigger Campaign ---------------------- */

    const handleTriggerCampaign = async () => {
        const baseRoute = isSMS ? '/marketing/sms-campaigns' : '/marketing/email-campaigns';
        if (!createdCampaign?.id) {
            toast.error(t('Marketing.EmailCampaignsNoCampaignToTrigger'));
            return;
        }

        const noRecipients = createdCampaign.recipientCount === 0;
        const sendImmediately = step4?.isManualTrigger;

        if (noRecipients && sendImmediately) {
            toast.error(t('Marketing.EmailCampaignsNotEnoughRecipients'));
            return;
        }

        try {
            setIsTriggering(true);

            const response = await api.postApiCampaignsIdTrigger(createdCampaign.id);
            if (response) {
                toast.success(t('Marketing.CampaignTriggeredSuccessfully'));
            } else {
                toast.error(t('Marketing.CampaignTriggerError'));
            }
            invalidateMarketingQueries(queryClient);
        } catch (error: any) {
            console.error('Error triggering campaign:', error);
            // Extract error message from API response
            const errorMessage =
                error?.response?.data?.message || error?.message || t('Marketing.CampaignTriggerError');
            toast.error(errorMessage);
        } finally {
            setIsTriggering(false);
            navigate(baseRoute, { replace: true });
            setTimeout(() => {
                dispatch(resetCampaignForm());
            }, 100);
        }
    };

    /* --------------------------- Delete ---------------------------- */

    const handleDeleteCampaign = async () => {
        const baseRoute = isSMS ? '/marketing/sms-campaigns' : '/marketing/email-campaigns';
        if (!editingCampaignId) return;

        try {
            setIsDeleting(true);

            await api.deleteApiCampaignsId(editingCampaignId);
            toast.success(t('SpOffers.ToastSCmpDel'));
            navigate(baseRoute);

            invalidateMarketingQueries(queryClient);
        } catch {
            toast.error(t('SpOffers.ToastErrCmpDel'));
        } finally {
            setIsDeleting(false);
            setTimeout(() => {
                dispatch(resetCampaignForm());
            }, 1500);
        }
    };

    /* --------------------------- Edit Campaign ---------------------------- */

    const handleEditCampaign = () => {
        const campaignId = editingCampaignId || createdCampaign?.id;
        if (!campaignId) {
            toast.error(t('Marketing.CannotEditCampaignNoId'));
            return;
        }

        dispatch(setCurrentStep(1));
        const baseRoute = isSMS ? '/marketing/sms-campaigns' : '/marketing/email-campaigns';
        const targetUrl = `${baseRoute}/${campaignId}#step1`;
        navigate(targetUrl, { replace: false });
    };

    /* --------------------------- Send Test ---------------------------- */

    const handleSendTest = () => {
        dispatch(setTestDialogOpen(true));
    };

    const handleSendTestSubmit = async () => {
        const campaignId = editingCampaignId || createdCampaign?.id;
        if (!campaignId) {
            toast.error(t('Marketing.CannotEditCampaignNoId'));
            return;
        }

        if (isSMS) {
            if (!testPhone?.phone || !testPhone.phone.trim()) {
                toast.error(t('Marketing.SMSCampaignsTestPhoneRequired'));
                return;
            }
            // TODO: Implement SMS test API endpoint when available
            toast.error(t('Marketing.SMSCampaignsTestSMSError'));
            return;
        } else {
            if (!testEmail || !testEmail.trim()) {
                toast.error(t('Marketing.EmailCampaignsTestEmailRequired'));
                return;
            }
            if (!testEmailSubject || !testEmailSubject.trim()) {
                toast.error(t('Marketing.EmailCampaignsTestEmailSubjectRequired'));
                return;
            }
        }

        try {
            dispatch(setIsSendingTest(true));

            if (!isSMS) {
                // Send test email via API
                await api.postApiCampaignsIdSendTestEmail(campaignId, {
                    testEmail: testEmail.trim(),
                    subject: testEmailSubject.trim(),
                });
            }

            toast.success(isSMS ? t('Marketing.SMSCampaignsTestSMSSent') : t('Marketing.EmailCampaignsTestEmailSent'));
            dispatch(setTestDialogOpen(false));
        } catch (error: any) {
            console.error(`Error sending test ${isSMS ? 'SMS' : 'email'}:`, error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                (isSMS ? t('Marketing.SMSCampaignsTestSMSError') : t('Marketing.EmailCampaignsTestEmailError'));
            toast.error(errorMessage);
        } finally {
            dispatch(setIsSendingTest(false));
        }
    };

    /* ----------------------- Render Step Footer ----------------------- */

    const stepFooters: Record<number, React.ReactNode> = {
        1: <Step1Footer onNext={onNext} step1={step1} isDesktop={isDesktop} />,
        2: <Step2Footer onNext={onNext} step2Data={step2} isDesktop={isDesktop} />,
        3: <Step3Footer onNext={onNext} step3Data={step3} campaignType={campaignType} isDesktop={isDesktop} />,
        4: (
            <Step4Footer
                onNext={async () => await onNext?.(4)}
                step4Data={step4}
                isCreating={isCreating}
                step1={step1}
                step2={step2}
                step3={step3}
                campaignType={campaignType as CampaignState['campaignType']}
            />
        ),
        5: (
            <Step5Footer
                isEditing={isEditing}
                isTriggering={isTriggering}
                isDeleting={isDeleting}
                createdCampaign={createdCampaign}
                step4Data={step4}
                onStart={handleTriggerCampaign}
                onDelete={() => setDeleteDialogOpen(true)}
                onEditCampaign={handleEditCampaign}
                onSendTest={handleSendTest}
                isDesktop={isDesktop}
                campaignType={campaignType}
                step3Data={step3}
                canEditCampaign={canEditCampaign}
            />
        ),
    };

    return (
        <React.Fragment>
            {stepFooters[activeStep]}

            {/* Delete Confirmation Dialog */}
            <RadixDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t('Marketing.EmailCampaignsDeleteConfirmTitle')}
                description={t('Marketing.EmailCampaignsDeleteConfirmWarning')}
                descriptionClassName="whitespace-pre-line"
            >
                <div className="flex flex-col gap-4 pt-6">
                    <div className="flex justify-end gap-3">
                        <RadixButton onClick={() => setDeleteDialogOpen(false)} variant="outline" disabled={isDeleting}>
                            {t('Setting.Cancel')}
                        </RadixButton>

                        <RadixButton
                            onClick={handleDeleteCampaign}
                            variant="danger"
                            disabled={isDeleting || isTriggering}
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <RadixSpinner size="sm" variant="white" />
                                    {t('Common.Loading')}
                                </span>
                            ) : (
                                t('SpOffers.DelCmp')
                            )}
                        </RadixButton>
                    </div>
                </div>
            </RadixDialog>

            {/* Test Email/SMS Dialog - Bottom Drawer on Mobile */}
            <RadixDialog
                open={testDialogOpen}
                onOpenChange={(open) => dispatch(setTestDialogOpen(open))}
                title={isSMS ? t('Marketing.SMSCampaignsSendTestSMS') : t('Marketing.EmailCampaignsSendTestEmail')}
                position={!isDesktop ? 'bottom' : 'center'}
                footer={
                    <RadixButton
                        onClick={handleSendTestSubmit}
                        variant="primary"
                        className="w-full md:w-fit ml-auto"
                        disabled={isSendingTest}
                    >
                        {isSendingTest ? (
                            <span className="flex items-center gap-2">
                                <RadixSpinner size="sm" variant="white" />
                                {t('Common.Loading')}
                            </span>
                        ) : (
                            t('Marketing.Send')
                        )}
                    </RadixButton>
                }
            >
                <div className="flex flex-col h-full gap-4">
                    {isSMS ? (
                        <RadixPhoneField
                            label={t('Common.MobileNumber')}
                            value={testPhone}
                            onChange={(value) => dispatch(setTestPhone(value))}
                            placeholder={t('Common.MobileNumber')}
                        />
                    ) : (
                        <>
                            <RadixInput
                                label={t('Common.Email')}
                                type="email"
                                value={testEmail}
                                onChange={(e) => dispatch(setTestEmail(e.target.value))}
                                placeholder="test@gmail.com"
                            />
                            <RadixInput
                                label={t('Marketing.EmailCampaignsEmailSubject')}
                                type="text"
                                value={testEmailSubject}
                                onChange={(e) => dispatch(setTestEmailSubject(e.target.value))}
                                placeholder="Email Test"
                            />
                        </>
                    )}
                </div>
            </RadixDialog>
        </React.Fragment>
    );
}
