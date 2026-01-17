import { useState, RefObject } from 'react';

export const useScrollIndicator = (scrollRef: RefObject<HTMLElement | null>) => {
    const [isAtTop, setIsAtTop] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const checkScroll = () => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // Buffer 5px
        setIsAtTop(scrollTop <= 5);
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 5);
    };

    return {
        isAtTop,
        isAtBottom,
        checkScroll
    };
};