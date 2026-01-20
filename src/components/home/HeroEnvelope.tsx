"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Edit3, Lock } from 'lucide-react';
import { SEALS } from '@/constants/assets';
import { EnvelopeBack, EnvelopeFront, EnvelopeFlap, EnvelopeSecond, EnvelopeFlapClose } from '@/components/envelope/EnvelopeSVGs'; // ✅ Import FlapClose
import { highlightStyles } from '@/styles/highlight';

interface HeroEnvelopeProps {
    envelope: { env: string; envSecond: string; envFront: string };
    theme: { name: string; bg: string; text: string };
    font: { id: string; envelopeText: string; envelopeSenderText: string };
    postcard: { message: string; sender: string };
    sealId: string;
    canEdit: boolean;
    onEdit: () => void;
}

export const HeroEnvelope = ({
    envelope,
    theme,
    font,
    postcard,
    sealId,
    canEdit,
    onEdit
}: HeroEnvelopeProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const currentHighlights = highlightStyles[theme.name as keyof typeof highlightStyles] || highlightStyles['Carbon Fiber'];
    const dynamicStyles = {
        '--highlight-soft': `${currentHighlights.soft}B3`,
        '--highlight-standard': `${currentHighlights.standard}B3`,
        '--highlight-accent': `${currentHighlights.accent}B3`,
    } as React.CSSProperties;

    // 🎬 Animation Variants
    // FlapClose: เริ่มที่ 0 (ปิด) -> หมุนไป 180 (เปิด) -> แล้วหายไป (Opacity 0)
    const flapVariants: Variants = {
        closed: {
            rotateX: 0,
            opacity: 1,
            zIndex: 50
        },
        open: {
            rotateX: 180,
            opacity: 0, // ✅ สลับร่าง: หายไปเมื่อหมุนเสร็จ
            zIndex: 50, // ค้างไว้หน้าสุดจนกว่าจะหายไป
            transition: {
                rotateX: { duration: 1.0, ease: "easeInOut", delay: 0.2 }, // หมุน
                opacity: { duration: 0, delay: 1.2 } // หายวับเมื่อวินาทีที่ 1.2 (หมุนเสร็จพอดี)
            }
        }
    };

    const letterVariants: Variants = {
        closed: { top: "50%" },
        open: {
            top: "12%",
            transition: { delay: 1.2, duration: 1.2, ease: [0.42, 0, 0.58, 1] } // เริ่มเลื่อนเมื่อซองเปิดสุดแล้ว
        }
    };

    return (
        <div className="relative w-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-lg aspect-[1001/1083] overflow-hidden rounded-b-[40px]">

                {/* 1. Base Envelope */}
                <EnvelopeBack color={envelope.env} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

                {/* ✅ 2. Static Flap (Background Layer) */}
                {/* ตัวนี้จะ "โผล่มา" เมื่อเปิดซองเสร็จแล้ว (เพื่อเป็นฉากหลังให้จดหมาย) */}
                <div className={`absolute inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-0 delay-[1.2s] ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <EnvelopeFlap color={envelope.env} className="absolute inset-0 w-full h-full" />
                </div>

                {/* 📝 3. The Letter (Layer 10) */}
                <motion.div
                    className={`absolute left-[10%] right-[10%] z-10 flex flex-col items-start ${theme.bg} ${theme.text} border-[2px] border-[#18181b]`}
                    variants={letterVariants}
                    initial="closed"
                    animate={isOpen ? "open" : "closed"}
                    style={{
                        maxHeight: '85%',
                        minHeight: '40%',
                        height: 'auto',
                        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.15)',
                        borderRadius: '2px',
                        ...dynamicStyles
                    }}
                >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 5 5 Q 50 4 95 6 Q 96 50 94 95 Q 50 96 6 94 Q 4 50 5 5 Z" stroke="currentColor" strokeWidth="0.3" fill="none" strokeDasharray="4 2" />
                    </svg>

                    <div className="relative z-10 w-full flex flex-col h-full">
                        <div className="px-10 md:px-14 pt-10 pb-2 mb-2 text-center opacity-70 shrink-0">
                            <h2 className={`font-bold text-xs tracking-widest uppercase ${font.envelopeSenderText}`} style={{ fontFamily: `var(--${font.id})` }}>
                                To the one i haven't met yet
                            </h2>
                        </div>

                        <div className="flex-1 px-10 md:px-12 py-2 overflow-y-auto no-scrollbar select-none min-h-0 relative">
                            {canEdit ? (
                                <div
                                    className={`ProseMirror w-full break-words opacity-80 ${font.envelopeText}`}
                                    style={{ fontFamily: `var(--${font.id})`, color: theme.text }}
                                    dangerouslySetInnerHTML={{ __html: postcard.message }}
                                />
                            ) : (
                                <div className="relative w-full h-full min-h-[100px]">
                                    <div
                                        className={`ProseMirror w-full break-words opacity-60 select-none ${font.envelopeText}`}
                                        style={{ fontFamily: `var(--${font.id})`, filter: 'blur(6px)', userSelect: 'none' }}
                                        dangerouslySetInnerHTML={{ __html: postcard.message }}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                        <span className="bg-[#2d2d2d]/10 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[#2d2d2d]">
                                            Locked until 2027
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-10 md:px-14 pb-10 pt-4 flex flex-col items-end shrink-0 opacity-80 mt-auto">
                            <span className={`font-bold text-xs tracking-widest uppercase mb-1 ${font.envelopeSenderText}`} style={{ fontFamily: `var(--${font.id})` }}>
                                A Letter from...
                            </span>
                            <div className="relative inline-block text-right max-w-full">
                                <span className={`${font.envelopeSenderText} font-bold`} style={{ fontFamily: `var(--${font.id})` }}>
                                    {postcard.sender}
                                </span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        {isOpen && canEdit && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 2.2, type: "spring" }} // เด้งดึ๋งออกมาหลังจากจดหมายนิ่งแล้ว
                                onClick={(e) => {
                                    e.stopPropagation(); // กันไม่ให้ไปกดโดนตัวจดหมาย
                                    onEdit();
                                }}
                                className="absolute top-6 right-6 flex items-center gap-2 pl-3 pr-4 py-2 bg-[#2d2d2d] text-[#fdfbf7] rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all z-50 cursor-pointer border border-white/10"
                                title="Edit Letter"
                            >
                                <Edit3 size={18} strokeWidth={2.5} />
                                <span className="font-bold font-ibm-plex text-sm tracking-wide">EDIT</span>
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* 4. Front Layers */}
                <EnvelopeSecond secondColor={envelope.envSecond} className="absolute inset-0 w-full h-full z-20 pointer-events-none" />
                <EnvelopeFront frontColor={envelope.envFront} className="absolute inset-0 w-full h-full z-30 pointer-events-none" />

                {/* ✅ 5. Animated Flap (Foreground Layer - Z50) */}
                {/* ใช้ FlapClose + หมุน 0->180 + หายตัวเมื่อเสร็จ */}
                <motion.div
                    className="absolute inset-0 w-full h-full origin-[50%_46.53%] pointer-events-none"
                    variants={flapVariants}
                    initial="closed"
                    animate={isOpen ? "open" : "closed"}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <EnvelopeFlapClose color={envelope.env} className="absolute inset-0 w-full h-full pointer-events-none" />
                </motion.div>

                {/* 6. Seal */}
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div
                            key="seal-overlay"
                            exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                            className="absolute inset-0 z-50 flex items-center justify-center"
                            style={{
                                pointerEvents: 'auto'
                            }}
                        >
                            <div
                                className="relative cursor-pointer group"
                                onClick={() => setIsOpen(true)}
                                style={{ marginTop: '79%' }}
                            >
                                <img
                                    src={SEALS.find(s => s.id === sealId)?.src}
                                    className="w-24 h-24 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                                    alt="Seal"
                                />
                                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse -z-10 group-hover:bg-white/50" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};