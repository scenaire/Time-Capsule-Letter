// --- Config Types (Assets) ---

export interface Theme {
    name: string;
    bg: string;
    text: string;
    placeholder: string;
    pageBg: string;
    isDark: boolean;
    ball: {
        muted: string;
        vivid: string;
    };
}

export interface Font {
    id: string;
    name: string;

    // Editor Styling (ตอนพิมพ์)
    senderText: string;
    senderSize: string;
    size: string;

    // Envelope Styling (ตอนพับลงซอง) -> ✨ เพิ่ม 2 บรรทัดนี้ค่ะ
    envelopeText: string;
    envelopeSenderText: string;
}

export interface Envelope {
    id: string;
    name: string;
    env: string;
    envFront: string;
    envSecond: string;
}

export interface Seal {
    id: string;
    src: string;
    name: string;
}

// --- Application State Types ---

export interface PostcardData {
    sender: string;
    message: string;
    fontIdx: number;
    themeIdx: number;
    envelopeIdx: number;
}

export interface LetterState {
    status: 'idle' | 'folding' | 'sealed' | 'sending' | 'sent' | 'error';
    foldStep: number;
    selectedSeal: string | null;
    isReadyToSeal: boolean;
}