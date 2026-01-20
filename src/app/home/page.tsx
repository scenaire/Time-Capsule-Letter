"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// ✅ 1. Import useSession
import { useSession } from "next-auth/react";

// Components
import { MiniEnvelope } from '@/components/home/MiniEnvelope';
import { HeroEnvelope } from '@/components/home/HeroEnvelope';
import { ENVELOPES } from '@/constants/assets';
import { FONTS } from '@/styles/fonts';
import { THEMES } from '@/styles/themes';

interface LetterData {
    id: string;
    user_id: string;
    envelope_id: string;
    theme_name: string;
    font_id: string;
    seal_id: string;
    message: string;
    sender_nickname: string;
    created_at: string;
}

const generatePosition = () => {
    let x, y;
    do {
        x = Math.random() * 90 + 5;
        y = Math.random() * 80 + 10;
    } while (x > 30 && x < 70 && y > 20 && y < 80);
    return { x, y };
};

export default function HomePage() {
    const router = useRouter();
    // ✅ 2. เรียกใช้ Hook useSession
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(true);
    const [myLetter, setMyLetter] = useState<any>(null);
    const [companions, setCompanions] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState("");

    const deadline = new Date('2026-02-10T00:00:00');
    const now = new Date();
    const canEdit = now < deadline;

    useEffect(() => {
        // ✅ 3. เช็ค status ของ Session ก่อน
        if (status === "loading") return; // รอก่อน

        if (status === "unauthenticated" || !session?.user) {
            router.push('/'); // ถ้าไม่มี session ดีดออก
            return;
        }

        const fetchHomeData = async () => {
            try {
                // ✅ 4. ใช้ ID จาก Session (NextAuth) แทน Supabase Auth
                const userId = (session.user as any).id;

                // --- (Logic ดึงข้อมูลเหมือนเดิม) ---
                const { data, error } = await supabase
                    .from('letters')
                    .select('*')
                    .eq('user_id', userId) // ใช้ userId จาก NextAuth
                    .single();

                const myLetterData = data as unknown as LetterData;

                if (error || !myLetterData) {
                    console.log("No letter found for user:", userId);
                    router.push('/write');
                    return;
                }

                // Map Data
                const matchedEnvelope = ENVELOPES.find(e => e.id === myLetterData.envelope_id) || ENVELOPES[0];
                const matchedTheme = THEMES.find(t => t.name === myLetterData.theme_name) || THEMES[0];
                const matchedFont = FONTS.find(f => f.id === myLetterData.font_id) || FONTS[0];

                setMyLetter({
                    envelope: matchedEnvelope,
                    theme: matchedTheme,
                    font: matchedFont,
                    postcard: {
                        message: myLetterData.message,
                        sender: myLetterData.sender_nickname
                    },
                    sealId: myLetterData.seal_id || 'leaf'
                });

                // Fetch Companions (คนอื่นที่ไม่ใช่เรา)
                const { data: othersData } = await supabase
                    .from('letters')
                    .select('id, envelope_id, sender_nickname')
                    .neq('user_id', userId) // ใช้ userId จาก NextAuth
                    .limit(30);

                if (othersData) {
                    const mappedCompanions = othersData.map((letter: any, index: number) => {
                        const pos = generatePosition();
                        const envObj = ENVELOPES.find(e => e.id === letter.envelope_id) || ENVELOPES[0];

                        return {
                            id: index,
                            x: pos.x,
                            y: pos.y,
                            rotation: Math.random() * 40 - 20,
                            color: envObj.env,
                            sender: letter.sender_nickname,
                            delay: Math.random() * 2
                        };
                    });
                    setCompanions(mappedCompanions);
                }

            } catch (error) {
                console.error("Error loading home:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();

        // Timer Logic
        const targetDate = new Date('2027-01-01T00:00:00');
        const updateTimer = () => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeLeft("The Time Has Come.");
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setTimeLeft(`${days} Days : ${hours} Hours`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);

    }, [session, status, router]); // ✅ เพิ่ม dependency


    if (loading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#2d2d2d] text-white">
                <div className="animate-pulse font-adelia">Loading Memories...</div>
            </div>
        );
    }

    if (!myLetter) return null;

    return (
        <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-6 bg-[#fdfbf7] text-[#2d2d2d]">

            {/* 🎨 2. เพิ่มลายจุด (Dot Pattern) เหมือนหน้า Archived */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(#d1ccc0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="absolute inset-0 pointer-events-none">
                {companions.map((c) => (
                    <MiniEnvelope key={c.id} {...c} />
                ))}
            </div>

            <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#1a1a1a]/80 pointer-events-none z-0" />

            <div className="relative z-10 w-full max-w-md md:max-w-lg px-4 flex flex-col items-center gap-8">
                <div className="text-center space-y-2">
                    <h1 className="font-adelia text-4xl md:text-6xl drop-shadow-lg select-none">
                        See you in <br />
                        <span className="relative inline-block text-[#ff4d4d] font-ibm-plex">
                            2027
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#2d2d2d] pointer-events-none" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                                <path d="M2.00025 7.00002C55.0315 1.70183 133.029 -1.61129 198.001 3.50002" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>

                    <p className="font-ibm-plex text-sm tracking-widest uppercase bg-[#2d2d2d]/10 text-[#2d2d2d]/60 px-4 py-1 rounded-full backdrop-blur-sm inline-block mt-6 select-none">
                        Unlocking in: {timeLeft}
                    </p>
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-full relative"
                >
                    <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl scale-110 -z-60 animate-pulse" />
                    <HeroEnvelope
                        {...myLetter}
                        canEdit={canEdit}
                        onEdit={() => router.push('/write')}
                    />
                </motion.div>

                {canEdit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="font-ibm-plex text-xs text-center max-w-xs opacity-40"
                    >
                        * You can edit this letter until Feb 10, 2026. <br />
                        After that, it will be sealed until Jan 1, 2027.
                    </motion.div>
                )}
            </div>
        </main>
    );
}