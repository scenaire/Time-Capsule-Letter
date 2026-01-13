// src/app/page.tsx
"use client";

import React, { useEffect } from 'react';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Twitch } from "lucide-react";

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect ถ้า Login แล้ว
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/write");
        }
    }, [status, router]);

    // Loading State: มินิมอลด้วยการกระพริบเบาๆ
    if (status === "loading") {
        return (
            <div className="h-screen w-full bg-[#fdfbf7] flex items-center justify-center">
                <div className="font-adelia text-2xl text-[#2d2d2d] animate-pulse opacity-50">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        // 1. พื้นหลัง: Warm Paper (#fdfbf7) + Dot Pattern จางๆ
        <main className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden p-6 bg-[#fdfbf7] text-[#2d2d2d]">

            {/* CSS Dot Pattern Background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(#d1ccc0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto"
            >
                {/* 2. หัวข้อใหญ่ (Typography Focus) */}
                <div className="relative mb-6">
                    {/* ของตกแต่งเล็กน้อย: เส้นขีดฆ่า หรือวงกลม (ใช้ SVG วาดสด) */}


                    <h1 className="font-adelia text-6xl md:text-8xl lg:text-9xl leading-tight text-[#2d2d2d] drop-shadow-sm rotate-[-2deg]">
                        Time <br className="md:hidden" />
                        <span className="relative inline-block">
                            Capsule
                            {/* เส้นขีดเส้นใต้แบบวาดมือ */}
                            <svg className="absolute w-full h-4 -bottom-2 left-0 text-[#2d2d2d] pointer-events-none" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                                <path d="M2.00025 7.00002C55.0315 1.70183 133.029 -1.61129 198.001 3.50002" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>
                </div>

                {/* 3. คำโปรย (Subtitle) - IBM Plex */}
                <p className="font-ibm-plex text-lg md:text-2xl text-[#2d2d2d]/70 mb-12 max-w-lg leading-relaxed">
                    เขียนจดหมายถึงตัวคุณในอนาคต... <br />
                    เก็บความทรงจำวันนี้ ไว้เปิดอ่านในปี <span className="font-bold text-[#2d2d2d] underline decoration-wavy decoration-[#ff4d4d]">2027</span>
                </p>

                {/* 4. The "Stamp/Ticket" Button (ออกแบบใหม่) */}
                <motion.button
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    whileTap={{ scale: 0.98, translateY: 4 }}
                    onClick={() => signIn("twitch", { callbackUrl: "/write" })}
                    className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#2d2d2d] font-bold text-xl md:text-2xl transition-all"
                    style={{
                        // Wobbly Border Magic: สูตรลับขอบบิดเบี้ยว
                        borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                        border: "3px solid #2d2d2d",
                        // Hard Shadow (เงาแข็ง)
                        boxShadow: "5px 5px 0px 0px #2d2d2d"
                    }}
                >
                    {/* Hover Effect: เปลี่ยนสีพื้นหลังเมื่อเอาเมาส์ชี้ */}
                    <div className="absolute inset-0 bg-[#ff4d4d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                        style={{ borderRadius: "inherit" }}
                    />

                    {/* Icon & Text */}
                    <Twitch size={32} className="group-hover:text-white transition-colors" />
                    <span className="font-ibm-plex tracking-wider group-hover:text-white transition-colors">
                        Login with Twitch
                    </span>
                </motion.button>

                <p className="mt-6 text-sm text-[#2d2d2d]/40 font-ibm-plex">
                    *Requires Twitch account to secure your letter
                </p>

            </motion.div>

            {/* Footer Minimal */}
            <div className="absolute bottom-6 w-full text-center">
                <p className="font-ibm-plex text-[#2d2d2d]/30 text-xs tracking-[0.2em] uppercase">
                    c_nairs • 2026 Event
                </p>
            </div>
        </main>
    );
}