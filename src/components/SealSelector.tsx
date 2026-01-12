import React from 'react';
import { motion } from 'framer-motion';
import { SEALS } from '@/constants/assets';

interface SealSelectorProps {
    onSelect: (id: string) => void;
}

export const SealSelector = ({ onSelect }: SealSelectorProps) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 pointer-events-auto shadow-2xl z-[60]"
    >
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-white font-ibm-plex text-sm uppercase tracking-widest drop-shadow-md whitespace-nowrap">
            Select a Seal to Finish
        </span>

        {SEALS.map((seal) => (
            <motion.button
                key={seal.id}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelect(seal.id)}
                className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/30 transition-all flex items-center justify-center border border-white/20 shadow-lg relative group"
            >
                <img src={seal.src} alt={seal.name} className="w-12 h-12 object-contain drop-shadow-md" />
            </motion.button>
        ))}
    </motion.div>
);