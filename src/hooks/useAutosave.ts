import { useEffect, useCallback, useRef } from 'react';

// Hook สำหรับ Auto-Save ลง LocalStorage
export function useAutoSave<T>(key: string | null, data: T, shouldSave: boolean = true) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. ฟังก์ชันโหลดข้อมูล (Synchronous)
    // เรียกใช้ตอนเริ่มต้นเพื่อดูว่ามี Draft ค้างไหม
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

    // 2. ฟังก์ชันลบข้อมูล
    // เรียกใช้ตอน "ส่งจดหมายสำเร็จ" (Sealed)
    const clearDraft = useCallback(() => {
        if (!key || typeof window === 'undefined') return;
        localStorage.removeItem(key);
    }, [key]);

    // 3. Effect: เฝ้าดู data แล้วเซฟอัตโนมัติ (Debounce 1s)
    useEffect(() => {
        if (!key || !shouldSave) return;

        // เคลียร์ Timer เก่า (ถ้ามีการพิมพ์รัวๆ)
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // ตั้ง Timer ใหม่ (รอ 1 วินาทีหลังหยุดพิมพ์ค่อยเซฟ)
        timeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                // console.log('Auto-saved to:', key); // Uncomment for debug
            } catch (error) {
                console.error('Failed to auto-save:', error);
            }
        }, 1000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [key, data, shouldSave]);

    return { loadDraft, clearDraft };
}