import React, { useState, useEffect } from 'react';
import { PostcardData, Theme, Font } from '@/types';
import { useAutoResizeTextArea } from '@/hooks/useAutoResizeTextArea';

interface LetterEditorProps {
    postcard: PostcardData;
    theme: Theme;
    font: Font;
    isFolding: boolean;
    onUpdatePostcard: (field: keyof PostcardData, value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const LetterEditor: React.FC<LetterEditorProps> = ({
    postcard,
    theme,
    font,
    isFolding,
    onUpdatePostcard,
    onFocus,
    onBlur
}) => {
    const { textareaRef, shadowRef, scrollRef } = useAutoResizeTextArea({
        value: postcard.message,
        font
    });

    // Default เป็น true ไว้ก่อน เพื่อให้เข้ามาถึงก็เห็นข้อความเลย ไม่โดนบัง
    const [scrollState, setScrollState] = useState({ isAtTop: true, isAtBottom: true });

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        // ✨ TWEAK: เพิ่ม Buffer เป็น 50px (หรือมากกว่านี้)
        // เพื่อให้ตอนพิมพ์ขึ้นบรรทัดใหม่ แม้ scroll ยังไม่ขยับสุด ก็ถือว่า "อยู่ล่างแล้ว" -> ปิดเงาทันที
        const isBottom = scrollTop + clientHeight >= scrollHeight - 50;

        setScrollState({
            isAtTop: scrollTop <= 10,
            isAtBottom: isBottom
        });
    };

    // เช็คทันทีเมื่อข้อความเปลี่ยน
    useEffect(() => {
        handleScroll();
    }, [postcard.message]);

    // Helper Styles
    const baseClass = `w-full bg-transparent border-none outline-none resize-none leading-relaxed overflow-hidden ${theme.placeholder}`;
    const realClass = `${baseClass} ${font.size}`;
    const shadowClass = `${baseClass} ${font.size} absolute top-0 left-0 -z-50 opacity-0 pointer-events-none`;

    return (
        <div
            className={`relative flex-1 flex flex-col overflow-hidden z-10 transition-opacity duration-500
                ${isFolding ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                 decoration-tape border-[2px] border-[#000000] hard-shadow-lg`}
            style={{ backgroundColor: theme.bg, padding: '0' }}
        >
            <div className="px-10 md:px-14 pt-12 pb-2 mb-2 border-b-2 border-none border-current opacity-70 relative z-20"
                style={{ color: theme.text }}
            >
                <h2 className={`font-bold text-center text-xs tracking-widest uppercase mb-1 opacity-70 ${font.senderText}`}
                    style={{ fontFamily: `var(--${font.id})` }}
                >
                    To the One I Haven’t Met Yet.
                </h2>
            </div>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                // ✨ REVERT: กลับมาใช้ Padding ปกติ (pb-4) + เผื่อไว้นิดหน่อย (pb-8) ให้ดูไม่อึดอัด
                className="flex-1 overflow-y-auto no-scrollbar px-10 md:px-14 py-4 pb-8 relative"
                style={{
                    // Logic เดิม: isAtBottom ? 'black' (เห็นชัด) : 'transparent' (จางหาย)
                    maskImage: `linear-gradient(to bottom, ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`,
                    WebkitMaskImage: `linear-gradient(to bottom, ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`
                }}
            >
                <textarea
                    ref={textareaRef}
                    placeholder="เขียนถึงตัวคุณในปี 2027..."
                    value={postcard.message}
                    onChange={(e) => onUpdatePostcard('message', e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className={realClass}
                    style={{
                        fontFamily: `var(--${font.id})`,
                        color: theme.text,
                        lineHeight: '1.45',
                    }}
                    disabled={isFolding}
                />

                <textarea
                    ref={shadowRef}
                    aria-hidden="true"
                    tabIndex={-1}
                    readOnly
                    value={postcard.message}
                    className={shadowClass}
                    style={{
                        fontFamily: `var(--${font.id})`,
                        lineHeight: '1.45',
                        height: 'auto',
                        padding: '0',
                        margin: '0',
                        transition: 'none',
                        width: '100%'
                    }}
                />
            </div>

            <div className="px-10 md:px-14 pb-12 pt-4 flex flex-col items-end shrink-0 relative z-20"
                style={{ color: theme.text }}
            >
                <span className={`font-bold text-xs tracking-widest uppercase opacity-80 mb-1 ${font.senderText}`}
                    style={{ fontFamily: `var(--${font.id})` }}
                >
                    A Letter From…
                </span>

                <div className="relative w-full max-w-[200px]">
                    <input
                        className={`bg-transparent border-none outline-none text-right w-full ${font.senderSize} ${theme.placeholder} font-bold`}
                        style={{ fontFamily: `var(--${font.id})`, color: theme.text }}
                        value={postcard.sender}
                        onChange={(e) => onUpdatePostcard('sender', e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        disabled={isFolding}
                    />
                    <div className="absolute -bottom-2 right-0 w-full text-current opacity-60 pointer-events-none">
                        <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                            <path d="M0 4 Q 5 0, 10 4 T 20 4 T 30 4 T 40 4 T 50 4 T 60 4 T 70 4 T 80 4 T 90 4 T 100 4"
                                stroke="currentColor" strokeWidth="1.5" fill="none"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};