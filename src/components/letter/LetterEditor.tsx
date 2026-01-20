import React, { useRef, useEffect, useState } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import { PostcardData, Theme, Font } from '@/types';
import { EditorToolbar } from './EditorToolbar';
import { highlightStyles } from '@/styles/highlight';

// ✅ Import Hooks
import { useScrollIndicator } from '@/hooks/useScrollIndicator';
import { useFloatingToolbar } from '@/hooks/useFloatingToolbar';

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
    // 1. Setup Refs
    const scrollRef = useRef<HTMLDivElement>(null);

    // ✅ 2. Use Custom Hooks
    // ใช้ Logic Scroll ที่คุณมีอยู่แล้วใน hooks
    const { isAtTop, isAtBottom, checkScroll } = useScrollIndicator(scrollRef, 20);

    // ใช้ Logic Toolbar ที่แยกออกมาใหม่
    const toolbarTop = useFloatingToolbar(editor, scrollRef);

    const [isEditorFocused, setIsEditorFocused] = useState(false);

    // Trigger checkScroll เมื่อข้อความเปลี่ยน (เพื่อ update เงา scroll)
    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [postcard.message, checkScroll]);

    // 3. 🎨 Dynamic Highlight Styles (เหมือนเดิมเป๊ะ)
    const currentHighlights = highlightStyles[theme.name as keyof typeof highlightStyles] || highlightStyles['Carbon Fiber'];
    const dynamicStyles = {
        backgroundColor: theme.bg,
        padding: '0',
        '--highlight-soft': `${currentHighlights.soft}B3`,
        '--highlight-standard': `${currentHighlights.standard}B3`,
        '--highlight-accent': `${currentHighlights.accent}B3`,
    } as React.CSSProperties;

    useEffect(() => {
        if (!editor) return;

        const handleFocus = () => setIsEditorFocused(true);
        const handleBlur = () => setIsEditorFocused(false);

        editor.on('focus', handleFocus);
        editor.on('blur', handleBlur);

        return () => {
            editor.off('focus', handleFocus);
            editor.off('blur', handleBlur);
        };
    }, [editor]);

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
                <h2 className={`font-bold text-center text-[10px] md:text-xs tracking-widest uppercase mb-1 select-none opacity-70 ${font.senderText}`}
                    style={{ fontFamily: `var(--${font.id})` }}
                >
                    To the One I Haven’t Met Yet.
                </h2>
            </div>

            {/* --- Body: Tiptap Editor --- */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="h-auto overflow-y-auto px-6 md:px-14 py-2 cursor-default relative custom-scrollbar"
                // ... (onClick) ...
                style={{
                    // ✅ แก้ไข 2: กลับมาใช้ isAtBottom เพียวๆ (เพราะตอนนี้มันฉลาดขึ้นแล้ว)
                    maskImage: `linear-gradient(to bottom, 
                        ${isAtTop ? 'black' : 'transparent'} 0%, 
                        black 40px, 
                        black calc(100% - 40px), 
                        ${isAtBottom ? 'black' : 'transparent'} 100%)`, // ตัด || isEditingLastLine ออก
                    WebkitMaskImage: `linear-gradient(to bottom, 
                        ${isAtTop ? 'black' : 'transparent'} 0%, 
                        black 40px, 
                        black calc(100% - 40px), 
                        ${isAtBottom ? 'black' : 'transparent'} 100%)`  // ตัด || isEditingLastLine ออก
                }}
            >
                <EditorContent
                    editor={editor}
                    className={`min-h-[100px] outline-none ${font.size} cursor-text`}
                    style={{
                        fontFamily: `var(--${font.id})`,
                        color: theme.text,
                        // ✅ คงค่า Config เดิมของคุณไว้ (1.4 สำหรับ pani, 1.6 สำหรับอื่น ๆ)
                        lineHeight: font.id === 'font-pani' || font.id === 'font-fk-amour' ? '1.4' : '1.6',
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
                    ${isEditorFocused ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}
                    
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
                    /* ✅ คงค่าเดิม: ปลดล็อคความกว้างบน Desktop */
                    md:bg-white/80 md:border-white/40 md:shadow-2xl md:max-w-none
                `}>
                    <div className="md:hidden">
                        {/* ✅ ไม่ใส่ themeName เพราะ Component คุณไม่รับ prop นี้ */}
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
                <span className={`font-bold text-[10px] md:text-xs tracking-widest uppercase select-none opacity-80 mb-1 ${font.senderText}`}
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

            {/* Global Styles (เหมือนเดิมเป๊ะ) */}
            <style jsx global>{`
                .ProseMirror { outline: none !important; }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: color-mix(in srgb, currentColor, transparent 60%);
                    @supports not (color: color-mix(in srgb, currentColor, transparent 60%)) {
                        color: rgba(128, 128, 128, 0.4);
                    }
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror h1 { font-size: 1.6em; font-weight: 800; line-height: 1.2; margin-top: 0.5em; margin-bottom: 0.5em; }
                .ProseMirror h2 { font-size: 1.3em; font-weight: 700; line-height: 1.3; margin-top: 0.5em; margin-bottom: 0.5em; }
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