import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline, Strikethrough,
    Heading1, Heading2, ALargeSmall, // Icon สำหรับ Body Text
    Highlighter,
    AlignCenter, AlignLeft
} from 'lucide-react';

interface EditorToolbarProps {
    editor: Editor | null;
    isMobile?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    editor,
    isMobile = false }) => {
    // State สำหรับ Dropdown ของ Heading (Desktop Only)
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const headingMenuRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // ถ้าเป็นมือถือ ให้ดีดกลับไปซ้ายสุด (0) เสมอในครั้งแรกที่โหลด
        if (isMobile && scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
        }
    }, []); // [] = ทำแค่ครั้งเดียวตอน Mount (ครั้งถัดไปจะจำค่าล่าสุดที่ User เลื่อนไว้)

    // ... (useEffect handleClickOutside เดิม) ...

    // ปิด Dropdown เมื่อคลิกที่อื่น
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headingMenuRef.current && !headingMenuRef.current.contains(event.target as Node)) {
                setShowHeadingMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!editor) return null;

    // ✅ Logic เลือกสีตามธีม (แก้ไข Error ตรงนี้)
    // 1. Cast themeName เป็น ThemeName เพื่อให้ TypeScript ยอมรับ
    // 2. ใช้ || highlightStyles['Daydream Tide'] เป็นตัวกันตาย (Fallback) กรณีชื่อธีมไม่ตรง
    const themeColors = [
        { color: 'var(--highlight-soft)', name: 'Soft' },
        { color: 'var(--highlight-standard)', name: 'Standard' },
        { color: 'var(--highlight-accent)', name: 'Accent' },
    ];

    // --- Helper Logic ---

    // 1. เช็คว่าตอนนี้เป็น Heading อะไร?
    const getCurrentHeadingIcon = () => {
        if (editor.isActive('heading', { level: 1 })) return <Heading1 size={18} />;
        if (editor.isActive('heading', { level: 2 })) return <Heading2 size={18} />;
        return <ALargeSmall size={18} />; // Default เป็น Body
    };

    // 2. Mobile Cycle Logic (วนลูป H1 -> H2 -> Body)
    const cycleHeading = () => {
        if (editor.isActive('heading', { level: 1 })) {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
        } else if (editor.isActive('heading', { level: 2 })) {
            editor.chain().focus().setParagraph().run();
        } else {
            editor.chain().focus().toggleHeading({ level: 1 }).run();
        }
    };

    // 3. Alignment Toggle Logic (Left <-> Center)
    const toggleAlign = () => {
        if (editor.isActive({ textAlign: 'center' })) {
            editor.chain().focus().setTextAlign('left').run();
        } else {
            editor.chain().focus().setTextAlign('center').run();
        }
    };

    // --- Styles ---
    const btnClass = (isActive: boolean) =>
        `p-2 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 select-none
        ${isActive
            ? 'bg-black/80 text-white shadow-md'
            : 'text-black/60 hover:bg-black/5 hover:text-black'
        }`;

    const colorBtnClass = (color: string, isActive: boolean) =>
        `w-5 h-5 rounded-full border border-black/10 transition-all duration-300 cursor-pointer shrink-0
        ${isActive ? 'scale-125 ring-2 ring-black ring-offset-1 shadow-md' : 'hover:scale-110 hover:shadow-sm'}`;

    const Divider = () => <div className="w-[1px] h-5 bg-black/10 mx-1 shrink-0" />;

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    };

    return (

        <div
            ref={scrollContainerRef} // ✅ เพิ่ม: ผูก Ref ตรงนี้
            className={`flex items-center
            ${isMobile
                    ? 'w-full py-3 gap-3 overflow-x-auto no-scrollbar snap-x before:w-6 before:shrink-0 after:w-6 after:shrink-0'
                    : 'gap-1 p-1.5'
                }`}
        >
            {/* --- Group 1: Headings (Redesigned) --- */}
            <div className="flex items-center gap-1 shrink-0 snap-start relative" ref={headingMenuRef}>
                {isMobile ? (
                    // 📱 Mobile: ปุ่มเดียว กดแล้ววนลูป
                    <button
                        onMouseDown={(e) => handleAction(e, cycleHeading)}
                        className={btnClass(false)}
                        title="Change Text Style"
                    >
                        {getCurrentHeadingIcon()}
                    </button>
                ) : (
                    // 💻 Desktop: ปุ่มเดียว กดแล้วเปิด Dropdown
                    <>
                        <button
                            onMouseDown={(e) => handleAction(e, () => setShowHeadingMenu(!showHeadingMenu))}
                            className={btnClass(showHeadingMenu)} // Active เมื่อเปิดเมนู
                            title="Text Style"
                        >
                            {getCurrentHeadingIcon()}
                        </button>

                        {/* Dropdown Menu (Popup) */}
                        {showHeadingMenu && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white/90 backdrop-blur-xl border border-black/10 rounded-xl shadow-xl p-1 flex flex-col gap-1 min-w-[50px] animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onMouseDown={(e) => handleAction(e, () => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowHeadingMenu(false); })}
                                    className={btnClass(editor.isActive('heading', { level: 1 }))}
                                    title="Heading 1"
                                >
                                    <Heading1 size={18} />
                                </button>
                                <button
                                    onMouseDown={(e) => handleAction(e, () => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false); })}
                                    className={btnClass(editor.isActive('heading', { level: 2 }))}
                                    title="Heading 2"
                                >
                                    <Heading2 size={18} />
                                </button>
                                <button
                                    onMouseDown={(e) => handleAction(e, () => { editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false); })}
                                    className={btnClass(editor.isActive('paragraph'))}
                                    title="Body Text"
                                >
                                    <ALargeSmall size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Divider />

            {/* --- Group 2: Formatting (B / I / U / S) --- */}
            <div className="flex items-center gap-1 shrink-0 snap-start">
                <button onMouseDown={(e) => handleAction(e, () => editor.chain().focus().toggleBold().run())} className={btnClass(editor.isActive('bold'))}>
                    <Bold size={18} />
                </button>
                <button onMouseDown={(e) => handleAction(e, () => editor.chain().focus().toggleItalic().run())} className={btnClass(editor.isActive('italic'))}>
                    <Italic size={18} />
                </button>
                <button onMouseDown={(e) => handleAction(e, () => editor.chain().focus().toggleUnderline().run())} className={btnClass(editor.isActive('underline'))}>
                    <Underline size={18} />
                </button>
                <button onMouseDown={(e) => handleAction(e, () => editor.chain().focus().toggleStrike().run())} className={btnClass(editor.isActive('strike'))}>
                    <Strikethrough size={18} />
                </button>
            </div>

            <Divider />

            {/* --- Group 3: Alignments (Left / Center Toggle) --- */}
            <div className="flex items-center gap-1 shrink-0 snap-start">
                <button
                    onMouseDown={(e) => handleAction(e, toggleAlign)}
                    className={btnClass(false)}
                    title="Toggle Alignment"
                >
                    {editor.isActive({ textAlign: 'center' }) ? (
                        <AlignCenter size={18} />
                    ) : (
                        <AlignLeft size={18} />
                    )}
                </button>
            </div>

            <Divider />

            {/* --- Group 4: Colors --- */}
            <div className="flex items-center gap-3 pl-1 shrink-0 snap-start">
                <Highlighter size={16} className="text-black/30 mr-1" />
                {themeColors.map(({ color, name }) => (
                    <button
                        key={color}
                        onMouseDown={(e) => handleAction(e, () => editor.chain().focus().toggleHighlight({ color }).run())}
                        className={colorBtnClass(color, editor.isActive('highlight', { color }))}
                        style={{ backgroundColor: color }}
                        title={name} // เพิ่ม title เพื่อให้โชว์ชื่อสี (Soft, Standard, Accent)
                    />
                ))}
            </div>
        </div>
    );
};