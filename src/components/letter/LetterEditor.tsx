import React, { useRef, useState, useEffect } from 'react';
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
                        lineHeight: '1.6',
                    }}
                    onBlur={onBlur}
                />
            </div>

            {/* --- ✨ Universal Toolbar Container --- */}
            {/* Logic: แสดงเมื่อ isFocused = true */}
            <div className={`
                transition-all duration-500 ease-out z-40
                ${isFocused ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
                
                /* 📱 Mobile: ติดขอบล่างซองจดหมาย (Sliding Ribbon) */
                absolute bottom-0 left-0 right-0
                
                /* 💻 Desktop: ลอยอยู่เหนือขอบล่างนิดหน่อย (Floating Capsule) */
                md:bottom-4 md:left-1/2 md:right-auto md:-translate-x-1/2
            `}>
                <div className={`
                    /* Glassmorphism Effect */
                    bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl
                    
                    /* 📱 Mobile Styling: เต็มจอ, เหลี่ยมบน, ไม่มีขอบมนล่าง */
                    w-full rounded-t-2xl border-b-0
                    
                    /* 💻 Desktop Styling: แคปซูลมนๆ, กว้างพอดีเนื้อหา */
                    md:w-auto md:rounded-full md:border
                `}>
                    {/* ส่ง isMobile prop: ถ้าจอเล็กกว่า md ให้ถือเป็น Mobile */}
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