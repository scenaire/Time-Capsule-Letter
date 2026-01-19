import { useState, useCallback, useEffect, RefObject } from 'react';
import { Editor } from '@tiptap/react';

export const useFloatingToolbar = (editor: Editor | null, scrollRef: RefObject<HTMLElement | null>) => {
    const [toolbarTop, setToolbarTop] = useState<number | null>(null);
    const isFocused = editor?.isFocused;

    const updateToolbarPosition = useCallback(() => {
        // ทำงานเฉพาะตอน Focus และเป็นหน้าจอมือถือ (< 768px)
        if (!editor || !isFocused || window.innerWidth >= 768) return;

        // หาพิกัดของ Selection ปัจจุบัน
        const { from, to } = editor.state.selection;

        // ถาม Tiptap ว่าจุดเริ่มต้น (from) และจุดสิ้นสุด (to) อยู่ตรงไหนของจอ
        const startPos = editor.view.coordsAtPos(from);
        const endPos = editor.view.coordsAtPos(to);

        // เราจะอิง "จุดสิ้นสุด" (ปลายปากกา) เป็นหลัก
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
    }, [editor, updateToolbarPosition, scrollRef]);

    return toolbarTop;
};