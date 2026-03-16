import React from 'react';
import MobilePhoneSvg from '@/assets/Marketing/MobilePhone.svg';
import { cnMerge } from '@/utils/cnMerge';
import { UserIcon } from 'lucide-react';
import ChevronRightIcon from '@/assets/Marketing/ChevronRight.svg';
import SendSmsIcon from '@/assets/Marketing/SendSms.svg';
interface MobilePreviewProps {
    content: string;
    sender?: string;
    subject?: string;
    triggerType?: 'SMS' | 'EMAIL';
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ content, triggerType = 'EMAIL' }) => {
    // Phone frame dimensions: 278px × 571px (aspect ratio ~0.487)
    // Screen area: x=14.2305px (5.12%), y=13.1602px (2.3%), width=250px (90%), height=546.517px (95.7%)

    return (
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full overflow-hidden">
            <div
                className="relative w-[278px] max-w-[278px] mx-auto overflow-hidden"
                style={{
                    aspectRatio: '278 / 571',
                    // minHeight: '571px',
                }}
            >
                {/* Mobile Phone SVG Frame */}
                <img
                    src={MobilePhoneSvg}
                    alt="Mobile Phone"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ objectFit: 'contain' }}
                />
                {/* [Profile picture section] */}
                {triggerType === 'SMS' && (
                    <div className="absolute top-6 py-2.5 px-3 left-0  right-0 flex items-center w-[88%] mx-auto rounded-t-[30px] border-0 border-b-[1px] border-border-default bg-[#f5f5f520] border-solid">
                        <img src={ChevronRightIcon} alt="Profile" className="w-4 h-4 rounded-full rotate-180" />
                        <div className="w-10 h-10 rounded-full flex items-center justify-center">
                            <UserIcon className="w-7 h-7 text-primary-500 border-[1px] border-primary-500 border-solid rounded-full p-1" />
                        </div>
                        <div className="flex flex-col ml-2">
                            <div className="font-medium">{'John Doe'}</div>
                        </div>
                    </div>
                )}

                {/* Content Area - positioned inside the phone screen using percentages */}
                <div
                    className={cnMerge(
                        'absolute overflow-hidden ml-auto px-1.5',
                        triggerType === 'SMS' ? 'overflow-y-scroll scrollbar-hidden' : 'overflow-hidden mt-3',
                    )}
                    style={{
                        left: '5%',
                        top: triggerType === 'SMS' ? '15%' : '2.3%',
                        right: triggerType === 'SMS' ? '5%' : undefined,
                        width: triggerType === 'SMS' ? '80%' : '90%',
                        height: triggerType === 'SMS' ? '72.5%' : '95.7%',
                    }}
                >
                    <div
                        className={cnMerge(
                            'flex flex-col h-auto rounded-2xl ',
                            triggerType === 'SMS' ? 'min-h-[50px] my-2' : 'min-h-[200px] mt-4',
                        )}
                    >
                        <div
                            className={cnMerge(
                                'flex-1 text-xs sm:text-sm text-gray-800 leading-relaxed p-1.5',
                                triggerType === 'SMS'
                                    ? 'rounded-lg bg-primary-500 text-white'
                                    : 'rounded-t-md rounded-b-2xl bg-background-subtle',
                                content && triggerType !== 'SMS' && `overflow-y-auto scrollbar-hidden max-h-[500px]`,
                            )}
                        >
                            <style>
                                {`
                                    .mobile-preview-content img {
                                        max-width: 100% !important;
                                        // height: auto !important;
                                        // display: block !important;
                                        // margin: clamp(4px, 1vw, 8px) 0 !important;
                                    }
                                    .mobile-preview-content * {
                                        max-width: 100% !important;
                                    }
                                    .mobile-preview-content p {
                                        margin: 0 !important;
                                    }
                                `}
                            </style>
                            {triggerType === 'SMS' ? (
                                <p className="text-white text-sm m-0 p-0 max-w-[180px] break-words whitespace-pre-line">
                                    {content}
                                </p>
                            ) : (
                                <div
                                    className="mobile-preview-content"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            content ||
                                            `<span class='text-text-secondary h-[200px] items-center justify-center rounded-xl m-0 w-full mt-4 flex px-2'>
                                            No content yet
                                        </span>`,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* [Type your message section] */}
                {triggerType === 'SMS' && (
                    <div className="absolute bottom-5 py-1.5 px-3 left-0 right-0 flex items-center gap-3 w-[88%] mx-auto rounded-b-[30px] bg-[#f5f5f520] border-0 border-t-[1px] border-border-default border-solid">
                        <input
                            disabled={true}
                            type="text"
                            placeholder="Type your message..."
                            className="w-full h-10 rounded-lg border-0 border-border-default bg-background-subtle border-solid px-2 py-1"
                        />
                        <img
                            src={SendSmsIcon}
                            alt="Send SMS"
                            className="w-8 h-8 text-white bg-primary-500 border-[1px] border-primary-500 border-solid rounded-full p-1 cursor-pointer "
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobilePreview;
