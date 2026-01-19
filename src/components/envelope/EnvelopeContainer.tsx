// src/components/EnvelopeContainer.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import { SEALS } from '@/constants/assets';
import { EnvelopeBack, EnvelopeFront, EnvelopeFlap, EnvelopeSecond } from '@/components/envelope/EnvelopeSVGs';
import { SealSelector } from '@/components/envelope/SealSelector';
import { ActionButton, UndoButton } from '@/components/common/ActionButtons';
import { highlightStyles } from '@/styles/highlight';

interface EnvelopeContainerProps {
    envelope: {
        env: string;
        envSecond: string;
        envFront: string;
    };
    theme: {
        name: string;
        bg: string;
        text: string;
    };
    font: {
        id: string;
        envelopeText: string;
        envelopeSenderText: string;
    };
    postcard: {
        message: string;
        sender: string;
    };
    foldStep: number;
    selectedSeal: string | null;
    readyToSeal: boolean;
    onCloseEnvelope: () => void;
    onApplySeal: (id: string) => void;
    onCancel: () => void;
    onCycleEnvelope: () => void;
}

export const EnvelopeContainer = ({
    envelope,
    theme,
    font,
    postcard,
    foldStep,
    selectedSeal,
    readyToSeal,
    onCloseEnvelope,
    onApplySeal,
    onCancel,
    onCycleEnvelope
}: EnvelopeContainerProps) => {

    const currentHighlights = highlightStyles[theme.name as keyof typeof highlightStyles] || highlightStyles['Carbon Fiber'];

    const dynamicStyles = {
        '--highlight-soft': `${currentHighlights.soft}B3`,
        '--highlight-standard': `${currentHighlights.standard}B3`,
        '--highlight-accent': `${currentHighlights.accent}B3`,
    } as React.CSSProperties;

    return (
        <div className="relative w-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-lg aspect-[1001/1083] overflow-hidden rounded-b-[40px]">

                <EnvelopeBack color={envelope.env} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

                <div className={`absolute inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-0 ${foldStep >= 2 ? 'opacity-0' : 'opacity-100'}`}>
                    <EnvelopeFlap color={envelope.env} className="absolute inset-0 w-full h-full" />
                </div>

                {/* 📝 ส่วนของตัวจดหมาย (Letter) - Elastic Layout */}
                <motion.div
                    // ✨ Layout: ใช้ Flex Column เพื่อจัดเรียง Header -> Body -> Footer
                    className={`absolute left-[10%] right-[10%] z-10 flex flex-col items-start ${theme.bg} ${theme.text} border-[2px] border-[#18181b]`}

                    // 🚀 Elastic Height Logic:
                    // 1. ลบ height: "85%" ออกจาก initial
                    // 2. ใช้ top เพื่อดันตำแหน่งตอนพับ (Slide Down Animation)
                    initial={{ top: "12%" }}
                    animate={{ top: foldStep >= 1 ? "50%" : "12%" }}
                    transition={{ duration: 2.0, ease: [0.42, 0, 0.58, 1] }}

                    style={{
                        // ✨ Constraints:
                        maxHeight: '85%', // สูงสุดไม่เกิน 85% ของซอง (ถ้าเกินจะ Scroll)
                        minHeight: '40%', // ต่ำสุด 40% (กันสั้นเกินไปจนดูไม่ดี)
                        height: 'auto',   // ปล่อยให้สูงตามเนื้อหาจริง

                        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.15)',
                        borderRadius: '2px'
                    }}
                >
                    {/* 🎨 Texture เส้นขีดเขียน (แบบที่ 3: Inner Wobbly Frame) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                            d="M 5 5 Q 50 4 95 6 Q 96 50 94 95 Q 50 96 6 94 Q 4 50 5 5 Z"
                            stroke="currentColor"
                            strokeWidth="0.3"
                            fill="none"
                            strokeDasharray="4 2"
                        />
                    </svg>

                    {/* ✨ Content Wrapper: เอา h-full ออก เพื่อให้ Flex container หดตามเนื้อหาได้ */}
                    <div className="relative z-10 w-full flex flex-col h-full">

                        {/* ================= HEADER (Flex-none: ไม่ยืดหด) ================= */}
                        <div className="px-10 md:px-14 pt-10 pb-2 mb-2 text-center opacity-70 shrink-0">
                            <h2
                                className={`font-bold text-xs tracking-widest uppercase ${font.envelopeSenderText}`}
                                style={{ fontFamily: `var(--${font.id})` }}
                            >
                                To the One I Haven’t Met Yet.
                            </h2>
                        </div>

                        {/* ================= BODY (Flex-1: ยืดหยุ่น + Scrollable) ================= */}
                        {/* - flex-1: ให้กินพื้นที่ที่เหลือ
                           - overflow-y-auto: ถ้าเนื้อหายาวเกินพื้นที่ที่เหลือ (จนชน max-height) ให้ scroll ได้
                           - no-scrollbar: ซ่อน Scrollbar เพื่อความสวยงาม (ต้องมี class นี้ใน CSS หรือ Tailwind config)
                        */}
                        <div className="flex-1 px-10 md:px-12 py-2 overflow-y-auto no-scrollbar min-h-0">
                            <div
                                className={`ProseMirror w-full break-words opacity-80 ${font.envelopeText}`}
                                style={{
                                    ...dynamicStyles, // ยัดสี Highlight เข้าไป
                                    color: theme.text,
                                    fontFamily: `var(--${font.id})`,
                                    // ถ้าอยากให้จัดกึ่งกลางเหมือนหน้าเขียน ให้เพิ่ม textAlign ตาม editor หรือ force center ตรงนี้
                                    // textAlign: 'center' 
                                }}
                                dangerouslySetInnerHTML={{ __html: postcard.message }}
                            />
                        </div>

                        {/* ================= FOOTER (Flex-none: ติดท้ายเสมอ) ================= */}
                        {/* - pb-10: เผื่อระยะขอบล่างให้สวยงาม
                           - mt-auto: ดันตัวเองลงข้างล่างสุดเสมอ (ในกรณีที่ min-height ทำงาน)
                        */}
                        <div className="px-10 md:px-14 pb-10 pt-4 flex flex-col items-end shrink-0 opacity-80 mt-auto">
                            <span
                                className={`font-bold text-xs tracking-widest uppercase mb-1 ${font.envelopeSenderText}`}
                                style={{ fontFamily: `var(--${font.id})` }}
                            >
                                A Letter From…
                            </span>

                            {/* ✨ แก้ไข 1: ใช้ inline-block เพื่อให้กล่องกว้างเท่าข้อความพอดี (เส้นจะไม่ยาวเกิน) */}
                            <div className="relative inline-block text-right max-w-full">
                                <span className={`${font.envelopeSenderText} font-bold`} style={{ fontFamily: `var(--${font.id})` }}>
                                    {postcard.sender}
                                </span>


                            </div>
                        </div>
                    </div>
                </motion.div>

                <EnvelopeSecond secondColor={envelope.envSecond} className="absolute inset-0 w-full h-full z-20 pointer-events-none" />
                <EnvelopeFront frontColor={envelope.envFront} className="absolute inset-0 w-full h-full z-30 pointer-events-none" />

                <motion.div
                    className="absolute inset-0 w-full h-full origin-[50%_46.53%]"
                    initial={{ rotateX: 0, opacity: 0, z: 0 }}
                    animate={{
                        rotateX: foldStep >= 2 ? -180 : 0,
                        opacity: foldStep >= 2 ? 1 : 0,
                        zIndex: 40,
                        z: foldStep >= 2 ? -1 : 0
                    }}
                    transition={{
                        rotateX: { duration: 1.5, ease: "easeInOut" },
                        opacity: { duration: 0 },
                        zIndex: { duration: 0 },
                        z: { duration: 0 }
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <EnvelopeFlap color={envelope.env} className="absolute inset-0 w-full h-full pointer-events-none" />
                </motion.div>

                <AnimatePresence>
                    {selectedSeal && (
                        <motion.div
                            key="final-seal-overlay"
                            className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
                        >
                            <motion.img
                                src={SEALS.find(s => s.id === selectedSeal)?.src}
                                initial={{ scale: 2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-24 h-24 object-contain drop-shadow-2xl"
                                style={{ marginTop: '80%' }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {foldStep === 0 && (
                <div className="fixed bottom-[20%] left-0 w-full flex items-center justify-center gap-4 z-50 pointer-events-auto">
                    <ActionButton
                        onClick={onCycleEnvelope}
                        icon={<Mail size={24} />}
                        label="เปลี่ยนซอง"
                        theme={theme}
                        tooltip="เปลี่ยนซองจดหมาย"
                    />

                    <ActionButton
                        onClick={onCloseEnvelope}
                        icon={<Send size={28} />}
                        label="ส่งจดหมาย"
                        theme={theme}
                        tooltip="ส่งจดหมาย"
                    />

                    <UndoButton onClick={onCancel} />
                </div>
            )}

            {readyToSeal && !selectedSeal && (
                <SealSelector onSelect={onApplySeal} />
            )}
        </div>
    );
};