import React from 'react';
import { Text, Palette } from 'lucide-react';

interface ControlPanelProps {
    theme: any;
    isMessageEmpty: boolean;
    onCycleFont: () => void;
    onCycleTheme: () => void;
    onStartFolding: () => void;
}

export const ControlPanel = ({
    theme,
    isMessageEmpty,
    onCycleFont,
    onCycleTheme,
    onStartFolding
}: ControlPanelProps) => (
    <div className="fixed bottom-8 flex gap-4 p-2 bg-white/40 backdrop-blur-xl rounded-full shadow-xl border border-white/20 z-50">

        {/* ปุ่มเปลี่ยน Font */}
        <button onClick={onCycleFont} className="p-4 hover:bg-white/50 rounded-full transition-all text-cowhide-cocoa">
            <Text size={20} />
        </button>

        {/* ปุ่มเปลี่ยน Theme (พื้นหลัง) */}
        <button onClick={onCycleTheme} className="p-4 hover:bg-white/50 rounded-full transition-all text-cowhide-cocoa">
            <Palette size={20} />
        </button>

        {/* ปุ่มส่ง */}
        <button
            onClick={onStartFolding}
            disabled={isMessageEmpty}
            className={`px-8 ${theme.bg} ${theme.text} rounded-full font-bold hover:scale-105 active:scale-95 transition-all font-ibm-plex uppercase tracking-widest text-xs disabled:opacity-50`}
        >
            ส่งข้อความ
        </button>
    </div>
);