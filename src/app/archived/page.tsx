"use client";

import React, { Suspense } from 'react'; // ต้องใช้ Suspense เพราะมีการอ่าน SearchParams
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, ArrowRight } from "lucide-react";
import SuccessMailbox from '@/components/mailbox/SuccessMailbox'; // Import ตัวที่เราเพิ่งสร้าง


export function ArchivedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const theme = searchParams.get('theme') || 'red'; // ถ้าไม่มีให้ Default เป็นแดง

    return (
        // 1. พื้นหลัง: Warm Paper + Dot Pattern (เหมือน Landing Page เป๊ะๆ)
        <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden p-6 bg-[#fdfbf7] text-[#2d2d2d]">

            {/* CSS Dot Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(#d1ccc0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full"
            >
                {/* 2. หัวข้อใหญ่ (Typography) */}
                <div className="relative mb-2">
                    <h1 className="font-adelia text-4xl md:text-6xl lg:text-7xl leading-tight text-[#2d2d2d] drop-shadow-sm rotate-[-2deg]">
                        See You in <br />
                        <span className="relative inline-block text-[#ff4d4d] font-ibm-plex">
                            2027
                            {/* ขีดเส้นใต้ */}
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#2d2d2d] pointer-events-none" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                                <path d="M2.00025 7.00002C55.0315 1.70183 133.029 -1.61129 198.001 3.50002" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>
                </div>

                <p className="font-ibm-plex text-lg md:text-xl text-[#2d2d2d]/60 mb-8 mt-4">
                    จดหมายของคุณถูกเก็บรักษาไว้อย่างปลอดภัยแล้ว
                </p>

                {/* 3. 🏺 The Hero Section: Success Mailbox */}
                <div className="relative mb-10 scale-90 md:scale-100">
                    <SuccessMailbox userEnvelopeId={theme} ballCount={20} />
                </div>

                {/* 4. Action Buttons (กลับหน้าแรก) */}
                <motion.button
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/")}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#2d2d2d] font-bold text-lg md:text-xl transition-all cursor-pointer"
                    style={{
                        borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px", // Wobbly Border
                        border: "3px solid #2d2d2d",
                        boxShadow: "4px 4px 0px 0px #2d2d2d" // Hard Shadow
                    }}
                >
                    {/* Hover BG */}
                    <div className="absolute inset-0 bg-[#2d2d2d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                        style={{ borderRadius: "inherit" }}
                    />

                    <Home size={24} className="group-hover:text-white transition-colors" />
                    <span className="font-ibm-plex tracking-wider group-hover:text-white transition-colors uppercase">
                        Back to Home
                    </span>
                </motion.button>

                {/* Footer Text */}
                <p className="mt-8 text-xs text-[#2d2d2d]/30 font-ibm-plex uppercase tracking-[0.2em]">
                    Thank you for being part of history
                </p>

            </motion.div>
        </main>
    );
}

export default function ArchivedPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ArchivedContent />
        </Suspense>
    );
}