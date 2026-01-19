import { useEffect, useCallback, useRef } from 'react';

/**
 * 💾 Hook สำหรับ Auto-Save ลง LocalStorage
 * @param key - ชื่อกุญแจสำหรับเซฟ (เช่น 'draft_user123') ถ้าเป็น null จะไม่ทำงาน
 * @param data - ข้อมูลที่จะเซฟ (Postcard Object)
 * @param shouldSave - ตัวเปิด/ปิดสวิตช์ (เช่น ถ้าส่งจดหมายแล้ว ก็ไม่ต้องเซฟต่อ)
 */
export function useAutoSave<T>(key: string | null, data: T, shouldSave: boolean = true) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. ฟังก์ชันโหลดข้อมูล (Load)
    // เรียกใช้ตอนเปิดหน้าเว็บเพื่อดึงของเก่าคืนมา
    const loadDraft = useCallback((): T | null => {
        if (!key || typeof window === 'undefined') return null;
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load draft:', error);
            return null;
        }
    }, [key]);

    // 2. ฟังก์ชันลบข้อมูล (Clear)
    // เรียกใช้ตอน "ส่งจดหมายสำเร็จ" (ภารกิจเสร็จสิ้น ลบได้)
    const clearDraft = useCallback(() => {
        if (!key || typeof window === 'undefined') return;
        localStorage.removeItem(key);
        // console.log('Draft cleared:', key);
    }, [key]);

    // 3. Effect: เฝ้าดู data แล้วเซฟอัตโนมัติ (Debounce 1s)
    // หลักการ: ถ้ามีการพิมพ์รัวๆ จะยังไม่เซฟ รอจนหยุดพิมพ์ครบ 1 วินาทีค่อยเซฟ (ลดภาระเครื่อง)
    useEffect(() => {
        if (!key || !shouldSave) return;

        // เคลียร์ Timer เก่าทิ้ง (ถ้ามี)
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // ตั้งเวลาใหม่
        timeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                // console.log('Auto-saved to:', key);
            } catch (error) {
                console.error('Failed to auto-save:', error);
            }
        }, 1000); // ⏳ รอ 1 วินาที

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [key, data, shouldSave]);

    return { loadDraft, clearDraft };
}