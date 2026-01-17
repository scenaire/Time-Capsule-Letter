import { useEffect, useRef, RefObject } from 'react';
import { Font } from '@/types';

// Easing function for smooth scrolling
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const animateScroll = (element: HTMLElement, to: number, duration: number) => {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutQuad(progress);

        element.scrollTop = start + change * ease;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);
};

interface UseAutoResizeProps {
    value: string;
    font: Font;
}

export const useAutoResizeTextArea = ({ value, font }: UseAutoResizeProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const shadowRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastFontIdRef = useRef(font.id);

    // ฟังก์ชันปรับความสูง (Logic เดิม)
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        const shadow = shadowRef.current;
        if (!textarea || !shadow) return;

        const realWidth = textarea.getBoundingClientRect().width;
        shadow.style.width = `${realWidth}px`;
        shadow.value = textarea.value;
        shadow.style.height = 'auto';

        const newHeight = shadow.scrollHeight + 10; // Buffer

        // Smart Snap Logic
        if (newHeight > parseFloat(textarea.style.height || '0')) {
            textarea.style.transition = 'none';
        } else {
            textarea.style.transition = 'height 0.3s ease';
        }

        textarea.style.height = `${newHeight}px`;
    };

    // Effect: Trigger เมื่อข้อความเปลี่ยน หรือ Font เปลี่ยน
    useEffect(() => {
        adjustHeight();

        // Handle Font Change & Auto Scroll
        if (lastFontIdRef.current !== font.id) {
            setTimeout(() => {
                adjustHeight();
                if (scrollRef.current && textareaRef.current && shadowRef.current) {
                    const textarea = textareaRef.current;
                    const shadow = shadowRef.current;

                    const cursorPos = textarea.selectionStart;
                    shadow.value = textarea.value.substring(0, cursorPos);
                    shadow.style.height = 'auto';

                    const caretTopPosition = shadow.scrollHeight;
                    const targetScrollTop = Math.max(0, caretTopPosition - 150);

                    animateScroll(scrollRef.current, targetScrollTop, 600);

                    // Restore shadow
                    shadow.value = textarea.value;
                    shadow.style.height = 'auto';
                }
                lastFontIdRef.current = font.id;
            }, 50);
        }

        // Handle Window Resize
        window.addEventListener('resize', adjustHeight);
        return () => window.removeEventListener('resize', adjustHeight);
    }, [value, font.id]);

    return {
        textareaRef,
        shadowRef,
        scrollRef
    };
};