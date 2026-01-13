// src/components/EnvelopeContainer.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stamp, Mail, Send } from 'lucide-react';
import { SEALS } from '@/constants/assets';
import { EnvelopeBack, EnvelopeFront, EnvelopeFlap, EnvelopeSecond, EnvelopeFlapClose } from '@/components/EnvelopeSVGs'; // 👈 เพิ่ม EnvelopeFlapClose
import { SealSelector } from '@/components/SealSelector';
import { ActionButton, UndoButton } from '@/components/ActionButtons';
import { EnvelopeShadow } from '@/components/EnvelopeSVGs';

// 🔴 FIX: แยก Type ออกเป็น 2 ส่วนให้ชัดเจน
interface EnvelopeContainerProps {
    envelope: { // รับค่าสีซอง
        env: string;
        envSecond: string;
        envFront: string;
    };
    theme: { // รับค่าสีกระดาษ
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
    envelope, // 👈 รับ envelope มา
    theme,    // 👈 รับ theme มา
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

    return (
        <div className="relative w-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-lg aspect-[1001/1083] overflow-hidden rounded-b-[40px]">

                {/* ใช้ envelope.env สำหรับสีซอง */}
                <EnvelopeBack color={envelope.env} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

                <div className={`absolute inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-0 ${foldStep >= 2 ? 'opacity-0' : 'opacity-100'}`}>
                    <EnvelopeFlap color={envelope.env} className="absolute inset-0 w-full h-full" />
                </div>

                {/* ใช้ theme.bg และ theme.text สำหรับกระดาษจดหมาย */}
                <motion.div
                    className={`absolute left-[10%] right-[10%] z-10 ${theme.bg} ${theme.text} shadow-sm flex flex-col items-start`}
                    initial={{ top: "12%", height: "85%" }}
                    animate={{ top: foldStep >= 1 ? "50%" : "12%" }}
                    transition={{ duration: 2.0, ease: [0.42, 0, 0.58, 1] }}
                >
                    {/* ================= HEADER ================= */}
                    <div
                        className="px-10 md:px-14 pt-12 pb-2 mb-2 text-center opacity-70 shrink-0"
                    >
                        <h2
                            className={`font-bold text-xs tracking-widest uppercase ${font.envelopeSenderText}`}
                            style={{ fontFamily: `var(--${font.id})` }}
                        >
                            To the One I Haven’t Met Yet.
                        </h2>
                    </div>

                    {/* ================= BODY ================= */}
                    <div className="flex-1 px-10 md:px-14 py-4 overflow-hidden">
                        <p
                            className={`whitespace-pre-wrap leading-relaxed ${font.envelopeText} opacity-85 break-words`}
                        >
                            {postcard.message}
                        </p>
                    </div>

                    {/* ================= FOOTER ================= */}
                    <div
                        className="px-10 md:px-14 pb-12 pt-4 flex flex-col items-end shrink-0 opacity-80"
                    >
                        <span
                            className={`font-bold text-xs tracking-widest uppercase mb-1 ${font.envelopeSenderText}`}
                            style={{ fontFamily: `var(--${font.id})` }}
                        >
                            A Letter From…
                        </span>

                        <div className="relative w-full max-w-[200px] text-right">
                            <span
                                className={`${font.envelopeSenderText} font-bold`}
                            >
                                {postcard.sender}
                            </span>
                        </div>
                    </div>


                </motion.div>

                {/* ใช้ envelope.xxx สำหรับเลเยอร์ซองที่เหลือ */}
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
                <div className={`
          /* Mobile: ลอยอยู่ด้านล่าง ตรงกลาง, z-index สูงๆ */
          fixed bottom-[20%] left-0 w-full flex items-center justify-center gap-4 z-50 pointer-events-auto
      `}>

                    {/* 4. เพิ่มปุ่มเปลี่ยนซอง (ใช้ ActionButton ตัวเดิมแต่เปลี่ยนไอคอน) */}
                    <ActionButton
                        onClick={onCycleEnvelope}
                        icon={<Mail size={24} />}
                        label="Envelope"
                        theme={theme}
                        tooltip="เปลี่ยนซองจดหมาย"
                    />

                    <ActionButton
                        onClick={onCloseEnvelope}
                        icon={<Send size={28} />}
                        label="Fold It"
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