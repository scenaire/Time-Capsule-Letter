import React, { RefObject } from 'react'; // เพิ่ม RefObject

interface LetterEditorProps {
    postcard: { sender: string; message: string };
    theme: any;
    font: any;
    isFolding: boolean;
    scrollState: { isAtTop: boolean; isAtBottom: boolean };
    onUpdatePostcard: (field: 'sender' | 'message', value: string) => void;
    onScroll: () => void;
    // 🔴 FIX 2: รับ Refs เป็น Props ธรรมดา แทนที่จะซ่อนใน forwardRef
    scrollRef: RefObject<HTMLDivElement | null>;
    textareaRef: RefObject<HTMLTextAreaElement | null>;
}

// 🔴 FIX 2: ลบ forwardRef ออก ประกาศเป็น Component ธรรมดา
export const LetterEditor = ({
    postcard,
    theme,
    font,
    isFolding,
    scrollState,
    onUpdatePostcard,
    onScroll,
    scrollRef,     // รับมาตรงนี้
    textareaRef    // รับมาตรงนี้
}: LetterEditorProps) => {

    return (
        <div
            className={`flex-1 flex flex-col overflow-hidden z-10 transition-opacity duration-500 ${isFolding ? 'opacity-0 pointer-events-none' : 'opacity-100'} pt-12 pb-6`}
        >
            {/* Textarea Zone */}
            <div
                ref={scrollRef} // ใช้ prop ที่รับมา
                onScroll={onScroll}
                className="flex-1 overflow-y-auto no-scrollbar px-10 md:px-14 pt-4 pb-8 relative"
                style={{
                    maskImage: `linear-gradient(to bottom, ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`,
                    WebkitMaskImage: `linear-gradient(to bottom, ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`
                }}
            >
                <textarea
                    ref={textareaRef} // ใช้ prop ที่รับมา
                    placeholder="เขียนถึงตัวคุณในปี 2027..."
                    value={postcard.message}
                    onChange={(e) => onUpdatePostcard('message', e.target.value)}
                    className={`w-full bg-transparent border-none outline-none resize-none leading-relaxed overflow-hidden transition-all duration-300 ${font.size} ${theme.placeholder}`}
                    disabled={isFolding}
                />
            </div>

            {/* Sender Input Zone */}
            <div className="px-10 md:px-14 pb-10 flex flex-col items-end shrink-0">
                <span className={`${font.senderText} opacity-85 mb-1`}>A Letter From…</span>
                <input
                    className={`bg-transparent border-none border-current outline-none text-right w-full max-w-[200px] ${font.senderSize} ${theme.placeholder}`}
                    value={postcard.sender}
                    onChange={(e) => onUpdatePostcard('sender', e.target.value)}
                    disabled={isFolding}
                />
            </div>
        </div>
    );
};