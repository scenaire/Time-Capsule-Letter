import React from 'react';
import { Home, Wand2 } from 'lucide-react'; // ✅ 1. เพิ่ม Wand2
import { ButtonTooltip } from '../common/ButtonTooltip';
import { AnimatePresence, motion } from 'framer-motion';

interface ControlPanelProps {
    theme: any;
    font: any;
    isMessageEmpty: boolean;
    hasExistingLetter?: boolean;
    currentPrompt: string | null;
    onCycleFont: () => void;
    onCycleTheme: () => void;
    onMagicPrompt: () => void;   // ✅ 2. เพิ่ม Prop สำหรับสุ่มคำถาม
    onStartFolding: () => void;
    onGoHome?: () => void;
    onFocus: () => void;
    onClosePrompt: () => void
}

export const ControlPanel = ({
    theme,
    font,
    isMessageEmpty,
    hasExistingLetter = false,
    currentPrompt,
    onCycleFont,
    onCycleTheme,
    onMagicPrompt,
    onStartFolding,
    onGoHome,
    onFocus,
    onClosePrompt
}: ControlPanelProps) => (

    <>

        <AnimatePresence>
            {currentPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                    exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
                    // เปลี่ยนจาก absolute -> fixed และกำหนดตำแหน่งให้ลอยเหนือ Panel (bottom-28)
                    className="fixed bottom-28 left-1/2 z-[60] w-64 pointer-events-none"
                >
                    <div
                        className={`relative px-5 py-4 overflow-hidden text-center border-[1.5px] border-current ${theme.text}`}
                        style={{
                            borderRadius: '16px',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <div className={`absolute inset-0 ${theme.bg} opacity-90`} />
                        <span className={`relative z-10 font-ibm-plex text-sm font-bold leading-relaxed drop-shadow-sm ${theme.text}`}>
                            {currentPrompt}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-3 z-50 transition-transform duration-300 hover:-translate-y-1 max-w-[90vw] overflow-x-auto md:overflow-visible no-scrollbar"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                borderRadius: '50px 255px 40px 225px / 255px 40px 225px 50px',
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none rounded-[inherit]" />

            {/* --- ปุ่ม Home (แสดงเฉพาะเมื่อมีจดหมายแล้ว) --- */}
            {hasExistingLetter && (
                <>
                    <button
                        onClick={onGoHome}
                        className={`group relative w-12 h-12 flex items-center justify-center ${theme.bg} shrink-0 border-[1.5px] border-black/80 active:scale-95 transition-all z-10 text-black/70 hover:text-black`}
                        style={{ borderRadius: '55% 45% 40% 60% / 50% 60% 50% 50%' }}
                        title="Back to Home"
                    >
                        <Home size={22} strokeWidth={2.5} className={`${theme.text} hover:scale-110`} />
                        <ButtonTooltip text="กลับหน้าหลัก" />
                    </button>
                    <div className="w-[1.5px] h-6 bg-black/10 rounded-full mx-0 z-10" />
                </>
            )}

            {/* --- ปุ่มเปลี่ยน Font --- */}
            <button
                onClick={onCycleFont}
                className={`group relative w-12 h-12 flex items-center justify-center ${theme.bg} shrink-0 border-[1.5px] border-black/80 active:scale-95 transition-all z-10`}
                style={{ borderRadius: '60% 40% 50% 50% / 50% 60% 40% 60%' }}
            >
                <span className={`text-black font-semibold group-hover:scale-120 transition-transform text-l font-ibm-plex ${theme.text}`}>
                    Aa
                </span>
                <ButtonTooltip text="เปลี่ยนฟอนต์" />
            </button>

            {/* --- ปุ่มเปลี่ยน Theme --- */}
            <button
                onClick={onCycleTheme}
                className="group relative w-12 h-12 flex items-center justify-center bg-white/60 shrink-0 border-[1.5px] border-black/80 hover:bg-white active:scale-95 transition-all z-10"
                style={{ borderRadius: '40% 60% 60% 40% / 50% 50% 60% 40%' }}
            >
                <div className={`w-6 h-6 rounded-full border border-2 border-current group-hover:scale-110 transition-transform ${theme.text}`}
                    style={{ backgroundColor: theme.hex || theme.accent || '#ddd' }}>
                    <div className={`w-full h-full rounded-full opacity-80 ${theme.bg}`} />
                </div>
                <ButtonTooltip text="เปลี่ยนสีกระดาษ" />
            </button>

            {/* --- ปุ่มสุ่ม Card คำถาม --- */}

            <div className="relative shrink-0">


                {/* 3. ปุ่ม Magic Prompt (Crystal Ball Style) */}
                <button
                    onClick={onMagicPrompt}
                    className="group relative w-12 h-12 flex items-center justify-center bg-white/60 border-[1.5px] border-black/80 hover:bg-white active:scale-95 transition-all z-10"
                    style={{
                        borderRadius: '30% 70% 70% 30% / 50% 50% 50% 50%', // ทรงลูกแก้วเบี้ยวๆ น่ารัก
                        boxShadow: 'inset 0 0 15px rgba(139, 92, 246, 0.1)' // ใส่ Glow ม่วงอ่อนๆ ด้านใน
                    }}
                >
                    {/* พื้นหลังลูกแก้วจางๆ */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <Wand2
                        size={22}
                        strokeWidth={2}
                        // ✅ ใช้สี theme.text เพื่อให้กลมกลืนกับปุ่มอื่นๆ
                        className={`${theme.text} group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
                    />
                    <ButtonTooltip text="สุ่มคำถามนำ" />
                </button>
            </div>

            <div className="w-[1.5px] h-8 bg-black/20 rounded-full mx-1 z-10 shrink-0" />

            {/* --- ปุ่มส่ง (Stamp Style) --- */}
            <button
                onClick={onStartFolding}
                disabled={isMessageEmpty}
                className={`
                relative px-6 py-3 rounded-lg border-[1.5px] border-black/80 z-10
                font-bold uppercase tracking-widest text-xs
                transition-all duration-200 shrink-0
                hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-none
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
                ${theme.bg} ${theme.text}
            `}
                style={{
                    fontFamily: 'var(--font-ibm-plex-sans), sans-serif',
                    borderRadius: '3px 255px 2px 255px / 255px 5px 225px 3px'
                }}
            >
                <span className="relative z-10 flex items-center gap-2 text-current">
                    SEND
                    {!isMessageEmpty && (
                        <svg className="w-3 h-3 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    )}
                </span>
            </button>
        </div>
    </>
);