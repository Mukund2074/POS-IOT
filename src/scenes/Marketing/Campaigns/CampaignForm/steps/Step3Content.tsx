import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { t } from 'i18next';
import { updateStepData, setCurrentStep, getStepValidationStatus } from '@/redux/slices/Marketing/campaigns';
import { RadixAccordion } from '@/components/radix';
import ContentIcon from '@/assets/Marketing/Content.svg';
import ContentIconActive from '@/assets/Marketing/ContentActive.svg';
import CheckIcon from '@/assets/Marketing/Check.svg';
import WarningIcon from '@/assets/Marketing/Warning.svg';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import ContentBox from '@/components/Marketing/ContentBox';
import { useLocation } from 'react-router-dom';
import { cnMerge } from '@/utils/cnMerge';

interface Step3ContentProps {
    readonly?: boolean;
    isCurrentStep?: boolean;
    isDisabled?: boolean;
    forceOpen?: boolean;
}

export default function Step3Content({
    readonly = false,
    isCurrentStep = false,
    isDisabled = false,
    forceOpen = false,
}: Step3ContentProps) {
    const dispatch = useDispatch();
    const { campaignData, campaignType } = useSelector((state: any) => state.campaigns);
    const { step3: step3Data, step2: step2Data } = campaignData;
    const stepStatus = getStepValidationStatus(campaignData, campaignType);
    const step3Valid = stepStatus.step3;
    const settings = useSelector((state: any) => state.settings.data);
    const isSMSCampaign = campaignType === PostApiCampaignsBodyCampaignType.SMS;
    const location = useLocation();

    const defaultSenderName = settings?.profile?.name ?? '';

    // Initialize with step3Data or defaults
    const [subject, setSubject] = useState(step3Data.subject ?? '');
    const [content, setContent] = useState(step3Data.content ?? '');
    const [sender, setSender] = useState(step3Data.sender || defaultSenderName);

    // Initialize default sender values in Redux if not already set
    useEffect(() => {
        const needsUpdate: any = {};

        // Set default sender only if undefined/null (not if it's an empty string)
        if ((step3Data.sender === undefined || step3Data.sender === null) && defaultSenderName) {
            const defaultSender = isSMSCampaign ? defaultSenderName.slice(0, 11) : defaultSenderName;
            needsUpdate.sender = defaultSender;
            setSender(defaultSender);
        }

        // Update Redux if we have defaults to set
        if (Object.keys(needsUpdate).length > 0) {
            dispatch(
                updateStepData({
                    step: 'step3',
                    data: needsUpdate,
                }),
            );
        }
    }, [dispatch, step3Data.sender, defaultSenderName]);

    // Sync local state when Redux state changes (for edit mode)
    useEffect(() => {
        if (step3Data.subject !== undefined) {
            setSubject(step3Data.subject);
        }
        if (step3Data.content !== undefined) {
            setContent(step3Data.content);
        }
        if (step3Data.sender !== undefined) {
            // Only use default if sender is null/undefined, preserve empty strings
            setSender(step3Data.sender ?? defaultSenderName);
        }
    }, [step3Data.subject, step3Data.content, step3Data.sender, defaultSenderName]);

    // Determine if accordion should be open based on URL hash
    // In readonly mode: always open
    // In step mode: only open if hash matches this step
    const hashMatches = location?.hash === '#step3';
    const shouldBeOpen = readonly ? true : hashMatches || forceOpen;
    const shouldBeDisabled = readonly;

    // Update Redux store in real-time so mobile preview updates
    useEffect(() => {
        const senderValue = isSMSCampaign && sender.length > 11 ? sender.slice(0, 11) : sender;
        dispatch(
            updateStepData({
                step: 'step3',
                data: { subject, content, sender: senderValue },
            }),
        );
    }, [subject, content, sender, dispatch, isSMSCampaign]);

    // Handle field changes
    const handleSubjectChange = (value: string) => {
        setSubject(value);
    };

    const handleContentChange = (value: string) => {
        setContent(value);
    };

    const handleSenderChange = (value: string) => {
        setSender(value);
    };

    return (
        <RadixAccordion
            hideIcon={readonly}
            key={`step3-${location?.hash}`}
            value="step3"
            disabled={shouldBeDisabled}
            open={shouldBeOpen}
            onChange={(open) => {
                // Only handle opening - closing is handled by hash change
                if (!readonly && open) {
                    dispatch(setCurrentStep(3));
                }
            }}
            triggerClassName={cnMerge(readonly && '!opacity-100 cursor-default')}
            titleClassName="w-full pr-4"
            title={
                <div className="flex items-center gap-3 justify-between w-full">
                    <span className="flex items-center gap-3">
                        <img
                            src={location?.hash === '#step3' || readonly ? ContentIconActive : ContentIcon}
                            alt="Content Icon"
                            className="h-5 shrink-0"
                        />
                        <span className="text-lg capitalize m-0">{t('Marketing.EmailCampaignsContent')}</span>
                    </span>
                    {!readonly && (
                        <img
                            src={step3Valid ? CheckIcon : WarningIcon}
                            alt=""
                            className={cnMerge(
                                'h-5 w-5 shrink-0',
                                step3Valid
                                    ? 'opacity-100 [filter:invert(48%)_sepia(79%)_saturate(2476%)_hue-rotate(86deg)]'
                                    : 'opacity-80',
                            )}
                            aria-hidden
                        />
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <ContentBox
                    values={{
                        sender,
                        subject,
                        content,
                    }}
                    showToolbar={!readonly}
                    onSenderChange={handleSenderChange}
                    onSubjectChange={handleSubjectChange}
                    onContentChange={handleContentChange}
                    triggerType={isSMSCampaign ? 'SMS' : 'EMAIL'}
                    isReadOnly={shouldBeDisabled}
                    isDisabled={shouldBeDisabled}
                    senderMode="editable"
                    selectedGroups={step2Data?.selectedGroups || []}
                />
            </div>
        </RadixAccordion>
    );
}
