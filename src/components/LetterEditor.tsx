// src/components/LetterEditor.tsx
import React, { RefObject, useRef, useEffect } from 'react';

interface LetterEditorProps {
    postcard: { sender: string; message: string };
    theme: any;
    font: any;
    isFolding: boolean;
    scrollState: { isAtTop: boolean; isAtBottom: boolean };
    onUpdatePostcard: (field: 'sender' | 'message', value: string) => void;
    onScroll: () => void;
    scrollRef: RefObject<HTMLDivElement | null>;
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    onFocus?: () => void;
    onBlur?: () => void;
}

// 📐 Easing Function
const easeInOutQuad = (t: number) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const animateScroll = (element: HTMLElement, to: number, duration: number) => {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutQuad(progress);

        element.scrollTop = start + (change * ease);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);
};

export const LetterEditor = ({
    postcard,
    theme,
    font,
    isFolding,
    scrollState,
    onUpdatePostcard,
    onScroll,
    scrollRef,
    textareaRef,
    onFocus,
    onBlur
}: LetterEditorProps) => {

    const shadowRef = useRef<HTMLTextAreaElement>(null);
    const lastFontIdRef = useRef(font.id);
    const lastHeightRef = useRef(0);

    // ✨ CSS Config: คุมเองเหมือนเดิม
    const baseClass = `w-full bg-transparent border-none outline-none resize-none leading-relaxed overflow-hidden ${theme.placeholder}`;
    const realClass = `${baseClass} ${font.size}`;
    const shadowClass = `${baseClass} ${font.size}`;

    useEffect(() => {
        const textarea = textareaRef.current;
        const shadow = shadowRef.current;
        if (!textarea || !shadow) return;

        const isFontChanged = lastFontIdRef.current !== font.id;

        // ฟังก์ชันปรับความสูง
        const adjustHeight = () => {
            // 🚨 แก้ไขจุดตาย: ซิงค์ความกว้างให้เท่ากันเป๊ะ! (แก้ปัญหา Scrollbar กินที่)
            // เราใช้ getBoundingClientRect() เพื่อเอาความกว้างจริงๆ ที่ User เห็น
            const realWidth = textarea.getBoundingClientRect().width;
            shadow.style.width = `${realWidth}px`;

            shadow.value = textarea.value;
            shadow.style.height = 'auto';

            // บวก Buffer 10px กันพลาดเรื่อง sub-pixel rendering (แก้ Clipping เศษๆ)
            const newHeight = shadow.scrollHeight + 10;
            const currentHeight = lastHeightRef.current;

            // 🔥 Smart Snap: ใหญ่ขึ้น -> ห้าม Transition, เล็กลง -> ค่อยๆ หด
            if (newHeight > currentHeight) {
                textarea.style.transition = 'none';
            } else {
                textarea.style.transition = 'height 0.3s ease';
            }

            textarea.style.height = `${newHeight}px`;
            lastHeightRef.current = newHeight;
        };

        // ทำงานทันที
        adjustHeight();

        // แถม: ดัก Resize หน้าจอด้วย เผื่อคนหมุนจอ/ย่อขยายจอ
        window.addEventListener('resize', adjustHeight);

        // Logic Scroll (ทำงานเฉพาะตอนเปลี่ยน Font)
        if (isFontChanged) {
            // เพิ่ม Delay นิดนึง (50ms) เพื่อความชัวร์หลัง Snap
            const timeoutId = setTimeout(() => {
                adjustHeight(); // วัดซ้ำอีกทีก่อน Scroll

                if (scrollRef.current) {
                    const cursorPos = textarea.selectionStart;

                    // ซิงค์ความกว้างอีกรอบ (สำคัญมากสำหรับการตัดคำที่ถูกต้อง)
                    const realWidth = textarea.getBoundingClientRect().width;
                    shadow.style.width = `${realWidth}px`;

                    shadow.value = textarea.value.substring(0, cursorPos);
                    shadow.style.height = 'auto';
                    const caretTopPosition = shadow.scrollHeight;

                    // Scroll ไปหา (ลบ 150px)
                    const targetScrollTop = Math.max(0, caretTopPosition - 150);
                    animateScroll(scrollRef.current, targetScrollTop, 600);

                    // Cleanup Shadow
                    shadow.value = textarea.value;
                    shadow.style.height = 'auto';
                }

                lastFontIdRef.current = font.id;

            }, 50);

            return () => {
                clearTimeout(timeoutId);
                window.removeEventListener('resize', adjustHeight);
            };
        }

        return () => window.removeEventListener('resize', adjustHeight);

    }, [
        postcard.message,
        font,
        textareaRef,
        scrollRef
    ]);

    return (
        <div
            className={`relative flex-1 flex flex-col overflow-hidden z-10 transition-opacity duration-500
                ${isFolding ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                 decoration-tape border-[2px] border-[#000000] hard-shadow-lg`}
            style={{
                backgroundColor: theme.bg,
                padding: '0'
            }}
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
                onScroll={onScroll}
                className="flex-1 overflow-y-auto no-scrollbar px-10 md:px-14 py-4 relative"
                style={{
                    maskImage: `linear-gradient(to bottom, ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`,
                    WebkitMaskImage: `linear-gradient(to bottom, ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`
                }}
            >
                {/* ตัวจริง */}
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

                {/* ตัวเงา */}
                <textarea
                    ref={shadowRef}
                    aria-hidden="true"
                    tabIndex={-1}
                    readOnly
                    value={postcard.message}
                    className={`${shadowClass} absolute top-0 left-0 -z-50 opacity-0 pointer-events-none`}
                    style={{
                        fontFamily: `var(--${font.id})`,
                        lineHeight: '1.45',
                        height: 'auto',
                        padding: '0',
                        margin: '0',
                        transition: 'none',
                        // ✨ สำคัญ: ต้องใส่ width 100% ไว้ก่อน แต่อย่างไรก็ตาม JS จะมาทับค่านี้
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
                        style={{
                            fontFamily: `var(--${font.id})`,
                            color: theme.text
                        }}
                        value={postcard.sender}
                        onChange={(e) => onUpdatePostcard('sender', e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        disabled={isFolding}
                    />

                    <div className="absolute -bottom-2 right-0 w-full text-current opacity-60 pointer-events-none">
                        <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                            <path d="M0 4 Q 5 0, 10 4 T 20 4 T 30 4 T 40 4 T 50 4 T 60 4 T 70 4 T 80 4 T 90 4 T 100 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill="none"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};