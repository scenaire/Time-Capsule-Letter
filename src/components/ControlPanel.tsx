import React from 'react';
import { ButtonTooltip } from './ButtonTooltip';

interface ControlPanelProps {
    theme: any;
    font: any;
    isMessageEmpty: boolean;
    onCycleFont: () => void;
    onCycleTheme: () => void;
    onStartFolding: () => void;
}

export const ControlPanel = ({
    theme,
    font,
    isMessageEmpty,
    onCycleFont,
    onCycleTheme,
    onStartFolding
}: ControlPanelProps) => (
    // 1. Position: บังคับให้อยู่ตรงกลางล่างด้วย fixed positioning
    <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-3 z-50 transition-transform duration-300 hover:-translate-y-1"
        style={{
            // 3. Frosted Glass Washi Tape Style 🧊
            // ก๊อปปี้ Material มาจากหน้า SuccessMailbox
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '3px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',

            // คงรูปทรง "Hand-drawn Pill" (เม็ดยาเบี้ยวๆ) ไว้เพื่อให้ดูน่ารัก
            borderRadius: '50px 255px 40px 225px / 255px 40px 225px 50px',
        }}
    >
        {/* เพิ่ม Layer แสงเงาให้ดูเป็นกระจกมากขึ้น (Optional) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none rounded-[inherit]" />

        {/* --- ปุ่มเปลี่ยน Font --- */}
        <button
            onClick={onCycleFont}
            className={`group relative w-12 h-12 flex items-center justify-center ${theme.bg} border-[1.5px] border-black/80 active:scale-95 transition-all z-10`}
            style={{
                borderRadius: '60% 40% 50% 50% / 50% 60% 40% 60%'
            }}
            title="Change Handwriting"
        >
            {/* 2. Font Preview: ใช้ font.senderText เพื่อให้ขนาดถูกต้องตามฟอนต์นั้นๆ */}
            <span
                className={`text-black group-hover:scale-120 transition-transform text-l font-ibm-plex ${theme.text}`}
            >
                Aa
            </span>

            <ButtonTooltip text="เปลี่ยนฟอนต์" />
        </button>

        {/* --- ปุ่มเปลี่ยน Theme --- */}
        <button
            onClick={onCycleTheme}
            className="group relative w-12 h-12 flex items-center justify-center bg-white/60 border-[1.5px] border-black/80 hover:bg-white active:scale-95 transition-all z-10"
            style={{ borderRadius: '40% 60% 60% 40% / 50% 50% 60% 40%' }}
            title="Change Paper"
        >
            <div
                className={`w-6 h-6 rounded-full border border-current group-hover:scale-110 transition-transform ${theme.text}`}
                style={{ backgroundColor: theme.hex || theme.accent || '#ddd' }}
            >
                <div className={`w-full h-full rounded-full opacity-80 ${theme.bg}`} />
            </div>

            <ButtonTooltip text="เปลี่ยนสีกระดาษ" />
        </button>

        {/* เส้นคั่น */}
        <div className="w-[1.5px] h-8 bg-black/20 rounded-full mx-1 z-10" />

        {/* --- ปุ่มส่ง (Stamp Style) --- */}
        <button
            onClick={onStartFolding}
            disabled={isMessageEmpty}
            className={`
                relative px-6 py-3 rounded-lg border-[1.5px] border-black/80 z-10
                font-bold uppercase tracking-widest text-xs
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-none
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
                ${theme.bg} ${theme.text}
            `}
            style={{
                fontFamily: 'var(--font-ibm-plex-sans), sans-serif',
                borderRadius: '3px 255px 2px 255px / 255px 5px 225px 3px'
            }}
        >
            <span className="relative z-10 flex items-center gap-2">
                SEND
                {!isMessageEmpty && (

                    <svg className="w-3 h-3 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                )}
            </span>
        </button>
    </div>
);