"use client";

import React, { useEffect } from 'react';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Components
import { DotPatternBackground } from '@/components/ui/DotPatternBackground';
import { HandDrawnUnderline } from '@/components/ui/HandrawnDecorations';
import { TicketButton } from '@/components/landing/TicketButton';

export default function LandingPage() {
    const { status } = useSession();
    const router = useRouter();

    // 1. Logic: Redirect Strategy
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/write");
        }
    }, [status, router]);

    // 2. Loading State (Minimal)
    if (status === "loading") {
        return (
            <div className="h-screen w-full bg-[#fdfbf7] flex items-center justify-center">
                <div className="font-adelia text-2xl text-[#2d2d2d] animate-pulse opacity-50">
                    Loading...
                </div>
            </div>
        );
    }

    // 3. Render
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
                <TicketButton onClick={() => signIn("twitch", { callbackUrl: "/write" })} />

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