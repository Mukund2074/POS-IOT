import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from 'i18next';
import { RadixButton } from '@/components/radix';
import '../../tailwind.css';

export default function Unauthorized() {
    const navigate = useNavigate();
    const location = useLocation();
    const callbackUrl = location.state?.callbackUrl;

    return (
        <section className="fixed inset-0 flex items-center justify-center p-4 bg-background-subtle overflow-hidden z-10">
            {/* Ghost 403 background */}
            <div
                aria-hidden="true"
                className="pointer-events-none select-none fixed inset-0 flex items-center justify-center z-0"
            >
                <span
                    className="font-bold leading-none tracking-tighter"
                    style={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: 'clamp(160px, 28vw, 360px)',
                        background: 'linear-gradient(180deg, rgba(250,135,60,0.09) 0%, rgba(239,68,68,0.04) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    403
                </span>
            </div>

            {/* Ambient glow */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 flex items-center justify-center z-0">
                <div
                    className="w-[460px] h-[460px] rounded-full animate-pulse"
                    style={{
                        background: 'radial-gradient(circle, rgba(250,135,60,0.09) 0%, transparent 65%)',
                        animationDuration: '3s',
                    }}
                />
            </div>

            {/* Card */}
            <div
                className="relative z-10 w-full max-w-[500px] text-center rounded-xl bg-[#ffffff30] border border-solid border-border-default shadow-xl p-20"
                style={{ animation: 'rise .6s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}
            >
                {/* Top red shine */}
                <div
                    className="absolute top-0 left-[20%] right-[20%] h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, #FA873C, transparent)' }}
                />

                {/* Corner brackets */}
                <span className="absolute top-2.5 left-2.5 w-4 h-4 border-0 border-solid border-t-[1.5px] border-l-[1.5px] border-red-400/25 rounded-tl" />
                <span className="absolute top-2.5 right-2.5 w-4 h-4 border-0 border-solid border-t-[1.5px] border-r-[1.5px] border-red-400/25 rounded-tr" />
                <span className="absolute bottom-2.5 left-2.5 w-4 h-4 border-0 border-solid border-b-[1.5px] border-l-[1.5px] border-red-400/25 rounded-bl" />
                <span className="absolute bottom-2.5 right-2.5 w-4 h-4 border-0 border-solid border-b-[1.5px] border-r-[1.5px] border-red-400/25 rounded-br" />

                {/* Lock icon */}
                <div className="flex justify-center mb-6" aria-hidden="true">
                    <div className="relative">
                        <div
                            className="absolute rounded-full border border-dashed border-primary-500/80"
                            style={{ inset: '-12px', animation: 'spin 20s linear infinite' }}
                        />
                        <div
                            className="absolute rounded-full border border-dashed border-primary-500/80"
                            style={{ inset: '-24px', animation: 'spin 32s linear infinite reverse' }}
                        />
                        <div
                            className="relative w-20 h-20 rounded-full flex items-center justify-center border border-primary-500/25"
                            style={{
                                background:
                                    'radial-gradient(circle at 40% 35%, rgba(250,135,60,0.14), rgba(250,135,60,0.04))',
                                boxShadow: '0 0 22px rgba(250,135,60,0.12)',
                            }}
                        >
                            <span
                                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 animate-pulse"
                                style={{ boxShadow: '0 0 5px #FA873C' }}
                            />
                            <svg
                                width="36"
                                height="42"
                                viewBox="0 0 36 42"
                                fill="none"
                                style={{ color: '#FA873C', filter: 'drop-shadow(0 0 5px rgba(250,135,60,0.38))' }}
                            >
                                <path
                                    d="M6 18V12C6 5.925 10.925 1 17 1C23.075 1 28 5.925 28 12V18"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                                <rect
                                    x="1.5"
                                    y="18"
                                    width="31"
                                    height="22"
                                    rx="5"
                                    fill="currentColor"
                                    fillOpacity="0.14"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <circle cx="17" cy="29" r="3" fill="currentColor" />
                                <path d="M17 32V36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Badge */}
                <div className="flex justify-center mb-3.5">
                    <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 mt-4 rounded-full text-primary-500 text-[10px] font-semibold tracking-widest uppercase border border-primary-500/18"
                        style={{ background: 'rgba(239,68,68,0.07)', fontFamily: '"DM Sans", sans-serif' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                        Access Denied
                    </span>
                </div>

                {/* Heading — h3 token */}
                <h1
                    className="text-text-primary font-bold mb-2.5"
                    style={{
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '1.375rem',
                        lineHeight: '1.3',
                        letterSpacing: '-0.02em',
                    }}
                >
                    {t('Common.UnauthorizedMessage')}
                </h1>

                {/* Body — body-s token */}
                <p
                    className="text-text-secondary mx-auto mb-7"
                    style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.813rem',
                        lineHeight: '1.7',
                        maxWidth: '268px',
                    }}
                >
                    {t(
                        'Common.UnauthorizedDescription',
                        "You don't have permission to view this page. Contact your administrator if you think this is a mistake.",
                    )}
                </p>

                {/* Divider */}
                <div className="relative w-full h-px bg-border-default mb-7">
                    <span
                        className="absolute left-1/2 top-0 -translate-x-1/2 w-9 h-px"
                        style={{ background: 'rgba(250,135,60,0.35)' }}
                    />
                </div>

                {/* Button — uses RadixButton primary which maps to primary-500 */}
                <RadixButton
                    variant="primary"
                    onClick={() => {
                        if (callbackUrl) {
                            navigate(callbackUrl, { replace: true });
                        } else {
                            navigate(-1);
                        }
                    }}
                    className="inline-flex items-center gap-2"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                            d="M9 11L5 7L9 3"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    {t('Common.GoBack')}
                </RadixButton>
            </div>

            <style>{`
        @keyframes rise { to { opacity: 1; transform: translateY(0); } }
        @keyframes spin  { to { transform: rotate(360deg); } }
      `}</style>
        </section>
    );
}
