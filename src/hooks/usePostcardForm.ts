import { useState, useEffect, useRef } from 'react';
import { useSession } from "next-auth/react";
import { PostcardData, Theme, Font, Envelope } from '@/types';
import { THEMES } from '@/styles/themes';
import { FONTS } from '@/styles/fonts';
import { ENVELOPES } from '@/constants/assets';

export const usePostcardForm = () => {
    const { data: session } = useSession();
    const hasAutoFilledName = useRef(false);

    const [postcard, setPostcard] = useState<PostcardData>({
        sender: '',
        message: '',
        fontIdx: 0,
        themeIdx: 0,
        envelopeIdx: 0
    });

    // Auto-fill sender name from session
    useEffect(() => {
        if (session?.user?.name && !hasAutoFilledName.current) {
            const userName = session.user.name;

            setPostcard(prev => ({
                ...prev,
                sender: prev.sender || userName || ''
            }));
            hasAutoFilledName.current = true;
        }
    }, [session]);

    const updateField = (field: keyof PostcardData, value: string) => {
        setPostcard(prev => ({ ...prev, [field]: value }));
    };

    const cycleProperty = (key: 'fontIdx' | 'themeIdx' | 'envelopeIdx', listLength: number) => {
        setPostcard(prev => ({ ...prev, [key]: (prev[key] + 1) % listLength }));
    };

    // Derived values (Helpers)
    const currentTheme: Theme = THEMES[postcard.themeIdx];
    const currentFont: Font = FONTS[postcard.fontIdx];
    const currentEnvelope: Envelope = ENVELOPES[postcard.envelopeIdx];

    return {
        postcard,
        updateField,
        cycleFont: () => cycleProperty('fontIdx', FONTS.length),
        cycleTheme: () => cycleProperty('themeIdx', THEMES.length),
        cycleEnvelope: () => cycleProperty('envelopeIdx', ENVELOPES.length),
        currentTheme,
        currentFont,
        currentEnvelope
    };
};