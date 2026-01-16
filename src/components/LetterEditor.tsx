// src/components/LetterEditor.tsx
import React, { RefObject } from 'react';

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
}

export const LetterEditor = ({
    postcard,
    theme,
    font,
    isFolding,
    scrollState,
    onUpdatePostcard,
    onScroll,
    scrollRef,
    textareaRef
}: LetterEditorProps) => {

    // ✨ 1. เพิ่ม Ref สำหรับตัวเงา (Shadow)
    const shadowRef = React.useRef<HTMLTextAreaElement>(null);

    // ✨ 2. แยก Class พื้นฐานออกมาเพื่อให้ทั้งตัวจริงและตัวเงาเท่ากันเป๊ะ
    // สังเกตว่า transition-all duration-300 ยังอยู่ เพื่อให้ตัวจริงขยับนุ่มๆ
    const baseTextAreaClass = `w-full bg-transparent border-none outline-none resize-none leading-relaxed overflow-hidden transition-all duration-300 ${font.size} ${theme.placeholder}`;

    React.useEffect(() => {
        const textarea = textareaRef.current;
        const shadow = shadowRef.current;
        if (!textarea || !shadow) return;

        const adjustHeight = () => {
            // A. ก๊อปปี้ข้อความไปใส่ตัวเงา
            shadow.value = textarea.value;

            // B. รีเซ็ตความสูงตัวเงาเป็น auto เพื่อวัดขนาดใหม่ (ตัวจริงไม่ถูกรีเซ็ต เลยไม่กระตุก)
            shadow.style.height = 'auto';

            // C. เอาความสูงที่วัดได้จากตัวเงา ไปใส่ตัวจริง
            // ตัวจริงที่มี transition จะค่อยๆ ไหลไปหาความสูงนี้เอง
            const newHeight = shadow.scrollHeight;
            textarea.style.height = `${newHeight}px`;
        };

        // 1. รอบแรก: ปรับทันที
        adjustHeight();

        // 2. รอบสอง: รอให้ Transition ของฟอนต์ (300ms) จบก่อน แล้ววัดใหม่อีกที
        // เผื่อไว้ 350ms กันพลาด
        const timeoutId = setTimeout(() => {
            adjustHeight();
        }, 320);

        return () => clearTimeout(timeoutId);
    }, [
        postcard.message,
        font, // เช็คว่ามี font ใน dependency array ไหม (สำคัญ)
        textareaRef
    ]);

    return (
        <div
            // 🔴 1 & 2: ใส่ Wobbly Border, Tape Decoration และ Hard Shadow (คงเดิม)
            className={`relative flex-1 flex flex-col overflow-hidden z-10 transition-opacity duration-500
                ${isFolding ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                 decoration-tape border-[2px] border-[#000000] hard-shadow-lg`}
            style={{
                backgroundColor: theme.bg, // ดึงสีพื้นหลังมาจาก Theme
                // เพิ่ม Padding เพื่อไม่ให้เนื้อหาชิดขอบกระดาษที่เบี้ยวเกินไป
                padding: '0'
            }}
        >
            {/* 🔴 แก้ไข 1: Header ใช้ฟอนต์และสีเดียวกับ Message (คงเดิม) */}
            <div className="px-10 md:px-14 pt-12 pb-2 mb-2 border-b-2 border-none border-current opacity-70 relative z-20"
                style={{ color: theme.text }} // ใช้สีเดียวกับ Text
            >
                <h2 className={`font-bold text-center text-xs tracking-widest uppercase mb-1 opacity-70 ${font.senderText}`}
                    style={{ fontFamily: `var(--${font.id})` }} // ใช้ฟอนต์ลายมือ
                >
                    To the One I Haven’t Met Yet.
                </h2>
            </div>

            {/* Textarea Zone (Message) */}
            <div
                ref={scrollRef}
                onScroll={onScroll}
                className="flex-1 overflow-y-auto no-scrollbar px-10 md:px-14 py-4 relative"
                style={{
                    maskImage: `linear-gradient(to bottom, ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`,
                    WebkitMaskImage: `linear-gradient(to bottom, ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`
                }}
            >
                {/* ✨ 3. ตัวจริง (Visible) */}
                <textarea
                    ref={textareaRef}
                    placeholder="เขียนถึงตัวคุณในปี 2027..."
                    value={postcard.message}
                    onChange={(e) => onUpdatePostcard('message', e.target.value)}
                    // ใช้ base class + สี text
                    className={`${baseTextAreaClass}`}
                    style={{
                        fontFamily: `var(--${font.id})`,
                        color: theme.text,
                        lineHeight: '1.45',
                        // height จะถูกคุมโดย JS ไม่ต้องใส่ auto ตรงนี้
                    }}
                    disabled={isFolding}
                />

                {/* ✨ 4. ตัวเงา (Shadow/Hidden) เอาไว้วัดความสูง */}
                <textarea
                    ref={shadowRef}
                    aria-hidden="true"
                    tabIndex={-1}
                    readOnly
                    value={postcard.message}
                    className={`${baseTextAreaClass} absolute top-0 left-0 -z-50 opacity-0 pointer-events-none`}
                    style={{
                        fontFamily: `var(--${font.id})`,
                        lineHeight: '1.45',
                        height: 'auto', // ตัวเงาต้อง auto เสมอเพื่อวัดค่า
                        padding: '0',   // ต้องระวังเรื่อง padding ถ้า parent มี padding แล้ว
                        margin: '0'
                    }}
                />
            </div>

            {/* 🔴 แก้ไข 1 & 4: Footer ใช้ฟอนต์เดียวกัน และเพิ่มเส้นหยักใต้ชื่อ (คงเดิม) */}
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
                        disabled={isFolding}
                    />

                    {/* 🔴 แก้ไข 4: เส้น Decoration หยักๆ ใต้ชื่อ (Wavy Line SVG) */}
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