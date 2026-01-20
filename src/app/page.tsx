"use client";

import React, { useEffect, useState } from 'react';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from '@/lib/supabase'; // ✅ 1. Import Supabase

// Components
import { DotPatternBackground } from '@/components/ui/DotPatternBackground';
import { HandDrawnUnderline } from '@/components/ui/HandrawnDecorations';
import { TicketButton } from '@/components/landing/TicketButton';

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(false); // ✅ 2. State สำหรับรอเช็ค DB

    // 🚦 3. Logic: Redirect Strategy
    useEffect(() => {
        const checkUserStatus = async () => {
            // ถ้ายังไม่ Login หรือกำลังโหลด Session ให้ข้ามไปก่อน
            if (status !== "authenticated" || !session?.user) return;

            setIsChecking(true); // เริ่มเช็ค DB -> เปิดหน้า Loading

            try {
                const userId = (session.user as any).id;

                // เช็คว่ามีจดหมายของ User นี้ไหม?
                const { data, error } = await supabase
                    .from('letters')
                    .select('id')
                    .eq('user_id', userId)
                    .maybeSingle(); // ใช้ maybeSingle เพื่อไม่ให้ Error ถ้าไม่เจอ

                if (data) {
                    // ✅ Case A: มีจดหมายแล้ว -> ไป Home
                    router.replace("/home");
                } else {
                    // 📝 Case B: ยังไม่มีจดหมาย -> ไป Write
                    router.replace("/write");
                }
            } catch (err) {
                console.error("Check status failed:", err);
                // ถ้า Error กันเหนียวให้ไปหน้า Write ก่อน
                router.replace("/write");
            }
        };

        checkUserStatus();
    }, [status, session, router]);

    // ⏳ 4. Loading State (แสดงตอนกำลังโหลด Session หรือกำลังเช็ค DB)
    if (status === "loading" || isChecking) {
        return (
            <div className="h-screen w-full bg-[#fdfbf7] flex items-center justify-center">
                <div className="font-adelia text-2xl text-[#2d2d2d] animate-pulse opacity-50">
                    Checking Ticket...
                </div>
            </div>
        );
    }

    // 5. Render (สำหรับคนยังไม่ Login)
    return (
        <DotPatternBackground className="flex flex-col items-center justify-center p-6 bg-[#fdfbf7] text-[#2d2d2d]">

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto"
            >
                {/* --- Typography Focus --- */}
                <div className="relative mb-6">
                    <h1 className="font-adelia text-6xl md:text-8xl lg:text-9xl leading-tight text-[#2d2d2d] drop-shadow-sm rotate-[-2deg]">
                        Time <br className="md:hidden" />
                        <span className="relative inline-block">
                            Capsule
                            <HandDrawnUnderline className="text-[#2d2d2d]" />
                        </span>
                    </h1>
                </div>

                {/* --- Subtitle --- */}
                <p className="font-ibm-plex text-lg md:text-2xl text-[#2d2d2d]/70 mb-12 max-w-lg leading-relaxed">
                    เขียนจดหมายถึงตัวคุณในอนาคต... <br />
                    เก็บความทรงจำวันนี้ ไว้เปิดอ่านในปี <span className="font-bold text-[#2d2d2d] underline decoration-wavy decoration-[#ff4d4d]">2027</span>
                </p>

                {/* --- Action Button --- */}
                {/* ปุ่ม Login: เมื่อกดจะเริ่ม Flow การล็อกอิน */}
                <TicketButton onClick={() => signIn("twitch")} />

                <p className="mt-6 text-sm text-[#2d2d2d]/40 font-ibm-plex">
                    *Requires Twitch account to secure your letter
                </p>

            </motion.div>

            {/* --- Footer --- */}
            <div className="absolute bottom-6 w-full text-center">
                <p className="font-ibm-plex text-[#2d2d2d]/30 text-xs tracking-[0.2em] uppercase">
                    c_nairs • 2026 Event
                </p>
            </div>

        </DotPatternBackground>
    );
}