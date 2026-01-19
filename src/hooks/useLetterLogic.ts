import { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase';
import { FONTS } from '@/styles/fonts';
import { THEMES } from '@/styles/themes';
import { ENVELOPES } from '@/constants/assets';
import { useAutoSave } from './useAutoSave';

// Types
export interface PostcardState {
    sender: string;
    message: string;
    fontIdx: number;
    themeIdx: number;
    envelopeIdx: number;
}

export interface ScrollState {
    isAtTop: boolean;
    isAtBottom: boolean;
}

export const useLetterLogic = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    // State
    const [postcard, setPostcard] = useState<PostcardState>({ sender: '', message: '', fontIdx: 0, themeIdx: 0, envelopeIdx: 0 });
    const [isSent, setIsSent] = useState(false);
    const [isFolding, setIsFolding] = useState(false);
    const [foldStep, setFoldStep] = useState(0);
    const [readyToSeal, setReadyToSeal] = useState(false);
    const [selectedSeal, setSelectedSeal] = useState<string | null>(null);
    const [scrollState, setScrollState] = useState<ScrollState>({ isAtTop: true, isAtBottom: true });

    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    // ✨ Conflict State: เอาไว้เก็บข้อมูลตีกัน (Local vs DB)
    const [conflictData, setConflictData] = useState<PostcardState | null>(null);
    const [isConflict, setIsConflict] = useState(false);

    const userId = (session?.user as any)?.id;
    const draftKey = userId ? `draft_${userId}` : null;

    // Auto-Save: หยุดเซฟถ้ากำลังตีกัน (isConflict) หรือส่งแล้ว
    const { loadDraft, clearDraft } = useAutoSave(draftKey, postcard, !isSent && !isConflict && !isLoading);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hasInitialized = useRef(false);

    // Derived Data
    const currentTheme = THEMES[postcard.themeIdx];
    const currentFont = FONTS[postcard.fontIdx];
    const currentEnvelope = ENVELOPES[postcard.envelopeIdx];

    // ... (Helpers เหมือนเดิม)
    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            setScrollState({
                isAtTop: scrollTop <= 5,
                isAtBottom: scrollTop + clientHeight >= scrollHeight - 5
            });
        }
    };

    const cycleProperty = (key: 'fontIdx' | 'themeIdx' | 'envelopeIdx', listLength: number) => {
        setPostcard(prev => ({ ...prev, [key]: (prev[key] + 1) % listLength }));
    };

    const updatePostcard = (field: keyof PostcardState, value: string) => {
        setPostcard(prev => ({ ...prev, [field]: value }));
    };

    const startFoldingRitual = () => { setIsFolding(true); setFoldStep(0); setSelectedSeal(null); setReadyToSeal(false); };
    const cancelFolding = () => { setIsFolding(false); setFoldStep(0); setSelectedSeal(null); setReadyToSeal(false); };

    const handleCloseEnvelope = () => {
        setFoldStep(1);
        setTimeout(() => { setFoldStep(2); setTimeout(() => setReadyToSeal(true), 1500); }, 2000);
    };

    const resetError = () => setIsError(false);

    // ✨ ฟังก์ชันเลือกข้อมูล (เมื่อเกิด Conflict)
    const resolveConflict = (useLocal: boolean) => {
        if (useLocal && conflictData) {
            setPostcard(conflictData); // ใช้ของ Local
        } else {
            clearDraft(); // ใช้ของ DB -> ลบ Local ทิ้งเลย
        }
        setConflictData(null);
        setIsConflict(false);
    };

    const handleApplySeal = async (sealId: string) => {
        if (!userId) return;
        setIsError(false);
        setSelectedSeal(sealId);

        const letterData = {
            user_id: userId,
            message: postcard.message,
            sender_nickname: postcard.sender,
            theme_name: currentTheme.name,
            font_id: currentFont.id,
            envelope_id: currentEnvelope.id,
            seal_id: sealId,
            status: 'sealed',
            updated_at: new Date().toISOString(),
            open_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        };

        try {
            const { error } = await supabase.from('letters').upsert(letterData as any, { onConflict: 'user_id' });
            if (error) throw error;

            console.log('Sealed!');
            clearDraft();
            setTimeout(() => setIsSent(true), 1500);
        } catch (error) {
            console.error('Failed:', error);
            setIsError(true);
            setSelectedSeal(null);
        }
    };

    // Load Data Logic (Updated) 🧠
    useEffect(() => {
        if (status === "loading" || !userId || hasInitialized.current) return;

        const initData = async () => {
            setIsLoading(true);
            try {
                const localData = loadDraft(); // 1. ดึง Local
                const { data: dbDataRaw } = await supabase // 2. ดึง DB
                    .from('letters')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();

                const dbData = dbDataRaw as any;

                let parsedDBData: PostcardState | null = null;

                if (dbData) {
                    // แปลง DB Data เป็น Format State
                    const fontIdx = FONTS.findIndex(f => f.id === dbData.font_id);
                    const themeIdx = THEMES.findIndex(t => t.name === dbData.theme_name);
                    const envelopeIdx = ENVELOPES.findIndex(e => e.id === dbData.envelope_id);

                    parsedDBData = {
                        sender: dbData.sender_nickname,
                        message: dbData.message,
                        fontIdx: fontIdx !== -1 ? fontIdx : 0,
                        themeIdx: themeIdx !== -1 ? themeIdx : 0,
                        envelopeIdx: envelopeIdx !== -1 ? envelopeIdx : 0,
                    };
                }

                // ✨ 3. Logic ตัดสินใจ
                if (localData && parsedDBData) {
                    // กรณี: มีทั้งคู่ -> เช็คว่าเนื้อหาต่างกันไหม?
                    if (JSON.stringify(localData) !== JSON.stringify(parsedDBData)) {
                        // ต่างกัน! -> แจ้ง Conflict
                        setPostcard(parsedDBData); // โชว์ของ DB เป็นพื้นหลังไปก่อน
                        setConflictData(localData); // เก็บของ Local ไว้รอ User เลือก
                        setIsConflict(true);
                    } else {
                        // เหมือนกันเป๊ะ -> ใช้ DB เลย
                        setPostcard(parsedDBData);
                    }
                } else if (localData) {
                    setPostcard(localData); // มีแค่ Local
                } else if (parsedDBData) {
                    setPostcard(parsedDBData); // มีแค่ DB
                } else {
                    setPostcard(prev => ({ ...prev, sender: session?.user?.name || '' })); // ใหม่กิ๊ก
                }

            } catch (err) {
                console.error("Error initializing letter:", err);
            } finally {
                setIsLoading(false);
                hasInitialized.current = true;
            }
        };

        initData();
    }, [session, status, loadDraft, userId]);

    // Scroll sync (เหมือนเดิม)
    useEffect(() => {
        if (textareaRef.current && scrollRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            checkScroll();
        }
    }, [postcard.message]);

    return {
        state: { postcard, isSent, isFolding, foldStep, readyToSeal, selectedSeal, scrollState, status, isLoading, isError, isConflict },
        actions: {
            updatePostcard,
            cycleFont: () => cycleProperty('fontIdx', FONTS.length),
            cycleTheme: () => cycleProperty('themeIdx', THEMES.length),
            cycleEnvelope: () => cycleProperty('envelopeIdx', ENVELOPES.length),
            startFoldingRitual,
            cancelFolding,
            handleCloseEnvelope,
            handleApplySeal,
            handleScroll: checkScroll,
            resetError,
            resolveConflict // ✅ ส่งตัวนี้ออกไปใช้
        },
        refs: { scrollRef, textareaRef },
        derived: { currentTheme, currentFont, currentEnvelope }
    };
};