import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

// ปุ่ม Fold It
export const ActionButton = ({ onClick, icon, label, theme }: any) => (
    <motion.button
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`${theme.bg} ${theme.text} p-4 rounded-full shadow-lg flex flex-col items-center gap-2 pointer-events-auto border-2 border-[#E5D0BA]/20`}
    >
        {icon}
        <span className="text-[12px] font-bold tracking-widest uppercase whitespace-nowrap">{label}</span>
    </motion.button>
);

// ปุ่ม Undo
export const UndoButton = ({ onClick }: { onClick: () => void }) => (
    <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        onClick={onClick}
        className="p-3 bg-white/20 rounded-full backdrop-blur-sm self-center pointer-events-auto text-cowhide-cocoa"
    >
        <RotateCcw size={20} />
    </motion.button>
);