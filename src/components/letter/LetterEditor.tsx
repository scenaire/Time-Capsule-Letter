import React, { useRef, useState, useEffect, useCallback } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import { PostcardData, Theme, Font } from '@/types';
import { EditorToolbar } from './EditorToolbar';
import { highlightStyles } from '@/styles/highlight';

interface LetterEditorProps {
    editor: Editor | null;
    postcard: PostcardData;
    theme: Theme;
    font: Font;
    isFolding: boolean;
    onUpdatePostcard: (field: keyof PostcardData, value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const LetterEditor: React.FC<LetterEditorProps> = ({
    editor,
    postcard,
    theme,
    font,
    isFolding,
    onUpdatePostcard,
    onFocus,
    onBlur
}) => {
    // 1. Setup Scroll Refs & State
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollState, setScrollState] = useState({ isAtTop: true, isAtBottom: true });

    // State ใหม่เก็บตำแหน่ง Top ของ Toolbar (สำหรับ Mobile Bubble)
    const [toolbarTop, setToolbarTop] = useState<number | null>(null);

    // State เช็ค Focus เพื่อโชว์ Toolbar
    const isFocused = editor?.isFocused;

    // 2. 🧠 Smart Scroll Logic
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        if (scrollHeight <= clientHeight) {
            setScrollState({ isAtTop: true, isAtBottom: true });
            return;
        }

        const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 60;
        setScrollState({
            isAtTop: scrollTop <= 5,
            isAtBottom: isBottom
        });
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [postcard.message]);

    // ✅ 3. Smart Floating Logic (คำนวณตำแหน่ง Bubble เฉพาะ Mobile)
    const updateToolbarPosition = useCallback(() => {
        // ทำงานเฉพาะตอน Focus และเป็นหน้าจอมือถือ (< 768px)
        if (!editor || !isFocused || window.innerWidth >= 768) return;

        // หาพิกัดของ Selection ปัจจุบัน
        const { from, to } = editor.state.selection;

        // ถาม Tiptap ว่าจุดเริ่มต้น (from) และจุดสิ้นสุด (to) อยู่ตรงไหนของจอ
        const startPos = editor.view.coordsAtPos(from);
        const endPos = editor.view.coordsAtPos(to);

        // เราจะอิง "จุดสิ้นสุด" (ปลายปากกา) เป็นหลัก
        // ความสูง Toolbar ประมาณ 50-60px + Offset 10px
        const toolbarHeight = 60;
        const offset = 15;
        const headerSafeZone = 80; // พื้นที่ด้านบนที่ห้ามไปบัง (Header / Top Edge)

        // 📐 ลองวางไว้ "ข้างบน" ก่อน (Top Strategy)
        let calculatedTop = startPos.top - toolbarHeight - offset;

        // 🛡️ Flip Logic: ถ้ามันสูงเกินไปจนชนขอบบน
        if (calculatedTop < headerSafeZone) {
            // ดีดลงไปอยู่ "ข้างล่าง" บรรทัดนั้นแทน (Bottom Strategy)
            calculatedTop = endPos.bottom + offset;
        }

        setToolbarTop(calculatedTop);
    }, [editor, isFocused]);

    // Hook: สั่งคำนวณใหม่ทุกครั้งที่ Cursor ขยับ
    useEffect(() => {
        if (!editor) return;

        const update = () => requestAnimationFrame(updateToolbarPosition);

        editor.on('selectionUpdate', update);
        editor.on('focus', update);
        editor.on('blur', update);

        // ดักจับ Scroll ของตัว Editor เองด้วย
        const scrollElement = scrollRef.current;
        if (scrollElement) scrollElement.addEventListener('scroll', update);
        window.addEventListener('resize', update);

        return () => {
            editor.off('selectionUpdate', update);
            editor.off('focus', update);
            editor.off('blur', update);
            if (scrollElement) scrollElement.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [editor, updateToolbarPosition]);

    // 3. 🎨 Dynamic Highlight Styles
    const currentHighlights = highlightStyles[theme.name as keyof typeof highlightStyles] || highlightStyles['Carbon Fiber'];
    const dynamicStyles = {
        backgroundColor: theme.bg,
        padding: '0',
        // ✅ กำหนดตัวแปร CSS พร้อมเติม 'B3' ต่อท้ายเพื่อทำ Opacity 70%
        '--highlight-soft': `${currentHighlights.soft}B3`,
        '--highlight-standard': `${currentHighlights.standard}B3`,
        '--highlight-accent': `${currentHighlights.accent}B3`,
    } as React.CSSProperties;

    return (
        <div
            className={`relative h-auto w-full max-h-[75vh] flex flex-col overflow-hidden z-10 transition-opacity duration-500
                ${isFolding ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                 decoration-tape border-[2px] border-[#000000] hard-shadow-lg`}
            style={dynamicStyles}
        >
            {/* --- Header --- */}
            <div className="px-6 md:px-14 pt-8 md:pt-12 pb-2 mb-2 border-b-2 border-none border-current opacity-70 relative z-20 shrink-0"
                style={{ color: theme.text }}
            >
                <h2 className={`font-bold text-center text-[10px] md:text-xs tracking-widest uppercase mb-1 opacity-70 ${font.senderText}`}
                    style={{ fontFamily: `var(--${font.id})` }}
                >
                    To the One I Haven’t Met Yet.
                </h2>
            </div>

            {/* --- Body: Tiptap Editor --- */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-auto overflow-y-auto px-6 md:px-14 py-2 cursor-default relative custom-scrollbar"
                onClick={() => {
                    editor?.commands.focus();
                    onFocus?.();
                }}
                style={{
                    maskImage: `linear-gradient(to bottom, 
                        ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, 
                        black 40px, 
                        black calc(100% - 40px), 
                        ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`,
                    WebkitMaskImage: `linear-gradient(to bottom, 
                        ${scrollState.isAtTop ? 'black' : 'transparent'} 0%, 
                        black 40px, 
                        black calc(100% - 40px), 
                        ${scrollState.isAtBottom ? 'black' : 'transparent'} 100%)`
                }}
            >
                <EditorContent
                    editor={editor}
                    className={`min-h-[100px] outline-none ${font.size} cursor-text`}
                    style={{
                        fontFamily: `var(--${font.id})`,
                        color: theme.text,
                        lineHeight: font.id === 'font-pani' ? '1.4' : '1.6',
                    }}
                    onBlur={onBlur}
                />
            </div>

            {/* ✅ 5. Floating Bubble Toolbar (Mobile Optimized) */}
            <div
                className={`
                    /* ✨ 1. ปรับ Animation: ช้าลง (500ms) + นุ่มนวล (Cubic Bezier) */
                    transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-[60]
                    
                    /* ✨ 2. เพิ่ม translate-y-0 ตอนแสดงผล เพื่อให้มั่นใจว่ามันวิ่งกลับมาที่เดิม */
                    ${isFocused ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}
                    
                    /* Mobile: ใช้ fixed เพื่อลอยเหนือ Keyboard */
                    fixed left-4 right-4
                    
                    /* Desktop: ใช้ absolute ในกรอบ */
                    /* ⚠️ ลบ md:translate-y-0 ออก เพื่อให้ Animation แนวตั้งทำงานบน Desktop ด้วย */
                    md:absolute md:bottom-4 md:left-1/2 md:right-auto md:-translate-x-1/2
                `}
                style={{
                    // ถ้าเป็น Mobile ให้ใช้ค่า toolbarTop ที่คำนวณมา (ถ้ายังไม่มีให้ซ่อนไปก่อนด้วย -1000)
                    top: (typeof window !== 'undefined' && window.innerWidth < 768)
                        ? (toolbarTop ?? -1000)
                        : undefined
                }}
            >
                <div className={`
    /* Design: แคปซูลลอยได้ */
    mx-auto max-w-sm
    bg-white/90 backdrop-blur-xl border border-black/10 shadow-xl
    rounded-full p-1
    
    /* Desktop Styling override */
    /* ✅ เพิ่ม md:max-w-none เพื่อปลดล็อคความกว้างบน Desktop ให้ยืดตามเนื้อหา */
    md:bg-white/80 md:border-white/40 md:shadow-2xl md:max-w-none
`}>
                    <div className="md:hidden">
                        <EditorToolbar editor={editor} isMobile={true} />
                    </div>
                    <div className="hidden md:block">
                        <EditorToolbar editor={editor} isMobile={false} />
                    </div>
                </div>
            </div>

            {/* --- Footer: Sender Input --- */}
            <div className="px-6 md:px-14 pb-8 md:pb-12 pt-4 flex flex-col items-end shrink-0 relative z-20"
                style={{ color: theme.text }}
            >
                <span className={`font-bold text-[10px] md:text-xs tracking-widest uppercase opacity-80 mb-1 ${font.senderText}`}
                    style={{ fontFamily: `var(--${font.id})` }}
                >
                    A Letter From…
                </span>

                <div className="relative w-full max-w-[160px] md:max-w-[200px]">
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

            {/* Global Styles */}
            <style jsx global>{`
                .ProseMirror { outline: none !important; }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: color-mix(in srgb, currentColor, transparent 60%);
                    /* Fallback สำหรับ Browser เก่า */
                    @supports not (color: color-mix(in srgb, currentColor, transparent 60%)) {
                        color: rgba(128, 128, 128, 0.4);
                    }
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror h1 { font-size: 1.6em; font-weight: 800; line-height: 1.2; margin-top: 0.5em; margin-bottom: 0.2em; }
                .ProseMirror h2 { font-size: 1.3em; font-weight: 700; line-height: 1.3; margin-top: 0.5em; margin-bottom: 0.2em; }
                .ProseMirror p { margin-bottom: 0.5em; }
                .ProseMirror p[style*="text-align: justify"] { text-justify: inter-cluster; }
                .ProseMirror mark {
                    background-color: inherit;
                    border-radius: 4px;
                    padding: 0 2px;
                    box-decoration-break: clone;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 12px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: color-mix(in srgb, currentColor, transparent 80%);
                    @supports not (background-color: color-mix(in srgb, currentColor, transparent 80%)) {
                        background-color: rgba(128, 128, 128, 0.3);
                    }
                    border: 4px solid transparent;
                    background-clip: content-box;
                    border-radius: 99px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: color-mix(in srgb, currentColor, transparent 50%);
                }
            `}</style>
        </div>
    );
};