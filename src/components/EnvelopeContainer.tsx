// src/components/EnvelopeContainer.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stamp } from 'lucide-react';

import { EnvelopeBack, EnvelopeFront, EnvelopeFlap, EnvelopeSecond } from '@/components/EnvelopeSVGs';
import { SEALS } from '@/constants/assets';
import { SealSelector } from '@/components/SealSelector';
import { ActionButton, UndoButton } from '@/components/ActionButtons';

// กำหนด Type ของ Props ให้ชัดเจน
interface EnvelopeContainerProps {
    theme: {
        env: string;
        envSecond: string;
        envFront: string;
        bg: string;
        text: string;
    };
    font: {
        size: string;
        senderSize: string;
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
}

export const EnvelopeContainer = ({
    theme,
    font,
    postcard,
    foldStep,
    selectedSeal,
    readyToSeal,
    onCloseEnvelope,
    onApplySeal,
    onCancel
}: EnvelopeContainerProps) => {

    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">

            {/* Container หลักของซองจดหมาย */}
            <div className="relative w-full max-w-lg aspect-[1001/1083] overflow-hidden rounded-b-[40px]">

                {/* Layer 1: Envelope Back (หลังสุด) */}
                <EnvelopeBack color={theme.env} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

                {/* Layer 2: Flap Open (จะหายไปเมื่อเริ่มปิด) */}
                <div className={`absolute inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-0 ${foldStep >= 2 ? 'opacity-0' : 'opacity-100'}`}>
                    <EnvelopeFlap color={theme.env} className="absolute inset-0 w-full h-full" />
                </div>

                {/* Layer 3: Letter (กระดาษจดหมายที่เลื่อนลง) */}
                <motion.div
                    className={`absolute left-[10%] right-[10%] z-10 ${theme.bg} ${theme.text} shadow-sm flex flex-col items-start`}
                    initial={{ top: "12%", height: "85%" }}
                    animate={{ top: foldStep >= 1 ? "50%" : "12%" }}
                    transition={{ duration: 2.0, ease: [0.42, 0, 0.58, 1] }}
                >
                    <div className="w-full h-full p-6 md:p-8 flex flex-col overflow-hidden relative">
                        <p className={`whitespace-pre-wrap leading-relaxed ${font.size} opacity-85 break-words`}>
                            {postcard.message}
                        </p>
                        <div className="mt-auto pt-4 text-right opacity-75 shrink-0 border-t border-current/10 w-full">
                            <p className={`${font.senderSize} mt-1`}>{postcard.sender}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Layer 4 & 5: Envelope Layers (ซองชั้นหน้า) */}
                <EnvelopeSecond secondColor={theme.envSecond} className="absolute inset-0 w-full h-full z-20 pointer-events-none" />
                <EnvelopeFront frontColor={theme.envFront} className="absolute inset-0 w-full h-full z-30 pointer-events-none" />

                {/* Layer 6: Flap Close (ฝาที่จะหมุนปิดลงมา) */}
                <motion.div
                    className="absolute inset-0 w-full h-full origin-[50%_46.53%]"
                    initial={{ rotateX: 0, opacity: 0, z: 0 }}
                    animate={{
                        rotateX: foldStep >= 2 ? -180 : 0,
                        opacity: foldStep >= 2 ? 1 : 0,
                        zIndex: 40,
                        // fix: ใช้ -1 เพื่อให้ตอนกลับหัว มันเด้งมาอยู่หน้าสุด
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
                    <EnvelopeFlap color={theme.env} className="absolute inset-0 w-full h-full pointer-events-none" />
                </motion.div>

                {/* Layer 7: Wax Seal Overlay (แยกมาอยู่ layer บนสุดเพื่อแก้เรื่องกลับหัว) */}
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
                                // จัดตำแหน่งให้อยู่ตรงกลางสามเหลี่ยมด้านล่างพอดี (ปรับได้ที่นี่)
                                style={{ marginTop: '80%' }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* ปุ่มกดพับจดหมาย (แสดงเฉพาะตอนยังไม่พับ) */}
            {foldStep === 0 && (
                <div className="absolute -right-24 md:-right-32 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                    <ActionButton
                        onClick={onCloseEnvelope}
                        icon={<Stamp size={28} />}
                        label="Fold It"
                        theme={theme}
                    />
                    <UndoButton onClick={onCancel} />
                </div>
            )}

            {/* ถาดเลือก Seal (แสดงเมื่อพับเสร็จแล้ว) */}
            {readyToSeal && !selectedSeal && (
                <SealSelector onSelect={onApplySeal} />
            )}

        </div>
    );
};