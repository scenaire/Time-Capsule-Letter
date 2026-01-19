import { useState, RefObject } from 'react';

export const useScrollIndicator = (scrollRef: RefObject<HTMLElement | null>, threshold: number = 5) => {
    const [isAtTop, setIsAtTop] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const checkScroll = () => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        // เช็คด้านบน (Buffer 5px เหมือนเดิม)
        setIsAtTop(scrollTop <= 5);

        // เช็คด้านล่าง: ใช้ค่า threshold ที่ส่งมา (เช่น 50px)
        // ถ้าเหลือพื้นที่ข้างล่างน้อยกว่า threshold ให้ถือว่า "ถึงก้นแล้ว"
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - threshold);
    };

    return {
        isAtTop,
        isAtBottom,
        checkScroll
    };
};