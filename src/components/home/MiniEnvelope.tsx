"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface MiniEnvelopeProps {
    x: number;      // ตำแหน่ง % แกน X
    y: number;      // ตำแหน่ง % แกน Y
    rotation: number;
    color: string;  // สีซอง
    sender: string; // ชื่อเพื่อน
    delay: number;  // เพื่อให้จังหวะลอยไม่พร้อมกัน
}

export const MiniEnvelope = ({ x, y, rotation, color, sender, delay }: MiniEnvelopeProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: 0.6,
                scale: 1,
                y: [0, -10, 0] // Floating Animation
            }}
            transition={{
                opacity: { duration: 1 },
                scale: { duration: 0.8, delay: delay * 0.1 },
                y: {
                    duration: 3 + Math.random() * 2, // สุ่มความเร็วลอย 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay
                }
            }}
            className="absolute w-24 h-16 group cursor-default"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                rotate: `${rotation}deg`,
                zIndex: 0,
                filter: 'blur(1px)' // ✨ Depth of Field Effect
            }}
        >
            {/* ✉️ Envelope Shape (SVG) */}
            <svg viewBox="0 0 100 66" className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-110">
                {/* Body */}
                <rect x="0" y="0" width="100" height="66" rx="4" fill={color} />
                {/* Flap Lines (วาดเส้นซองจดหมาย) */}
                <path d="M0 0 L50 33 L100 0" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
                <path d="M0 66 L50 33 L100 66" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
            </svg>

            {/* 🏷️ Tooltip (Show on Hover) */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                <div className="bg-[#2d2d2d] text-[#fdfbf7] text-xs px-2 py-1 rounded-md font-ibm-plex shadow-lg">
                    From {sender}
                </div>
                {/* Arrow */}
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#2d2d2d] mx-auto"></div>
            </div>
        </motion.div>
    );
};