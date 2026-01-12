import { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FONTS } from '@/styles/fonts';
import { THEMES as BASE_THEMES } from '@/styles/themes';

// Types
export interface PostcardState {
    sender: string;
    message: string;
    fontIdx: number;
    themeIdx: number;
}

export interface ScrollState {
    isAtTop: boolean;
    isAtBottom: boolean;
}

export const useLetterLogic = () => {
    const { status } = useSession();
    const router = useRouter();

    // State
    const [postcard, setPostcard] = useState<PostcardState>({ sender: '', message: '', fontIdx: 0, themeIdx: 0 });
    const [isSent, setIsSent] = useState(false);
    const [isFolding, setIsFolding] = useState(false);
    const [foldStep, setFoldStep] = useState(0);
    const [readyToSeal, setReadyToSeal] = useState(false);
    const [selectedSeal, setSelectedSeal] = useState<string | null>(null);
    const [scrollState, setScrollState] = useState<ScrollState>({ isAtTop: true, isAtBottom: true });

    // Refs
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /* 🔴 FIX 1: เพิ่ม Logic แปลง Theme ให้มีสีซองจดหมาย (env) ครบถ้วน */
    const MAPPED_THEMES = BASE_THEMES.map(t => {
        let env = '#4B1D10';
        let envFront = '#62231E';
        let envSecond = '#783D2E';

        if (t.name === 'Classic Cocoa') {
            env = '#4B1D10'; envFront = '#62231E'; envSecond = '#E5D0BA';
        } else if (t.name === 'Carbon Fiber') {
            env = '#1A1A1A'; envFront = '#2C2C2C'; envSecond = '#404040';
        }
        return { ...t, env, envFront, envSecond };
    });

    // Derived Data (ใช้ตัวที่ Map แล้ว)
    const currentTheme = MAPPED_THEMES[postcard.themeIdx];
    const currentFont = FONTS[postcard.fontIdx];

    // ... (Helpers, Actions, Effects ส่วนที่เหลือเหมือนเดิมเป๊ะ ไม่ต้องแก้) ...
    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            setScrollState({
                isAtTop: scrollTop <= 5,
                isAtBottom: scrollTop + clientHeight >= scrollHeight - 5
            });
        }
    };

    const cycleProperty = (key: 'fontIdx' | 'themeIdx', listLength: number) => {
        setPostcard(prev => ({ ...prev, [key]: (prev[key] + 1) % listLength }));
    };

    const updatePostcard = (field: keyof PostcardState, value: string) => {
        setPostcard(prev => ({ ...prev, [field]: value }));
    };

    const startFoldingRitual = () => {
        setIsFolding(true);
        setFoldStep(0);
        setSelectedSeal(null);
        setReadyToSeal(false);
    };

    const cancelFolding = () => {
        setIsFolding(false);
        setFoldStep(0);
        setSelectedSeal(null);
        setReadyToSeal(false);
    };

    const handleCloseEnvelope = () => {
        setFoldStep(1);
        setTimeout(() => {
            setFoldStep(2);
            setTimeout(() => setReadyToSeal(true), 1500);
        }, 2000);
    };

    const handleApplySeal = (sealId: string) => {
        setSelectedSeal(sealId);
        setTimeout(() => setIsSent(true), 1500);
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        if (textareaRef.current && scrollRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            if (textareaRef.current.selectionStart >= postcard.message.length) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
            checkScroll();
        }
    }, [postcard.message]);

    return {
        state: { postcard, isSent, isFolding, foldStep, readyToSeal, selectedSeal, scrollState, status },
        actions: {
            updatePostcard,
            cycleFont: () => cycleProperty('fontIdx', FONTS.length),
            cycleTheme: () => cycleProperty('themeIdx', MAPPED_THEMES.length), // แก้เป็น MAPPED_THEMES
            startFoldingRitual,
            cancelFolding,
            handleCloseEnvelope,
            handleApplySeal,
            handleScroll: checkScroll
        },
        refs: { scrollRef, textareaRef },
        derived: { currentTheme, currentFont }
    };
};