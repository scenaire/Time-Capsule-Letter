"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getLetter, getCompanionEnvelopes } from '@/app/actions/letterActions';
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

// Components
import InteractiveBackground from '@/components/home/InteractiveBackground';
import { HeroEnvelope } from '@/components/home/HeroEnvelope';
import { ENVELOPES } from '@/constants/assets';
import { FONTS } from '@/styles/fonts';
import { THEMES } from '@/styles/themes';

// Interface
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

// 🎨 1. สร้าง Decoration Icons (SVG Shapes)
// 🎨 1. แก้ไข Decoration Icons (เพิ่มจำนวนเป็น 15 ชิ้น)
const DECORATIONS = [
    // --- โซนบนซ้าย ---
    { id: 1, d: "M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z", color: "#FFD700", size: 24, top: "15%", left: "10%", delay: 0 },
    { id: 2, d: "M6 6L18 18M6 18L18 6", color: "#e2e8f0", size: 20, top: "8%", left: "25%", delay: 3, fill: "none", stroke: true },
    { id: 3, d: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", color: "#FF9090", size: 16, top: "25%", left: "5%", delay: 1.2, fill: "none", stroke: true },

    // --- โซนบนขวา ---
    { id: 4, d: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", color: "#90b3d9", size: 22, top: "20%", left: "85%", delay: 1.5, fill: "none", stroke: true },
    { id: 5, d: "M12 4L4 20H20L12 4Z", color: "#9bc49b", size: 18, top: "12%", left: "70%", delay: 0.5, fill: "none", stroke: true },
    { id: 6, d: "M6 6L18 18M6 18L18 6", color: "#FFD700", size: 14, top: "28%", left: "92%", delay: 4, fill: "none", stroke: true },

    // --- โซนกลาง (หลบตรงกลาง) ---
    { id: 7, d: "M4 12c2-6 10-6 12 0s10 6 12 0", color: "#e2e8f0", size: 28, top: "45%", left: "8%", delay: 2, fill: "none", stroke: true },
    { id: 8, d: "M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z", color: "#FF9090", size: 18, top: "55%", left: "88%", delay: 0.8 },

    // --- โซนล่างซ้าย ---
    { id: 9, d: "M4 12c2-6 10-6 12 0s10 6 12 0", color: "#90b3d9", size: 32, top: "80%", left: "15%", delay: 2.5, fill: "none", stroke: true },
    { id: 10, d: "M12 4L4 20H20L12 4Z", color: "#e2e8f0", size: 20, top: "88%", left: "25%", delay: 1.8, fill: "none", stroke: true },
    { id: 11, d: "M6 6L18 18M6 18L18 6", color: "#9bc49b", size: 24, top: "72%", left: "5%", delay: 3.5, fill: "none", stroke: true },

    // --- โซนล่างขวา ---
    { id: 12, d: "M12 4L4 20H20L12 4Z", color: "#FFD700", size: 20, top: "75%", left: "80%", delay: 0.5, fill: "none", stroke: true },
    { id: 13, d: "M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z", color: "#90b3d9", size: 16, top: "90%", left: "60%", delay: 4.2 },
    { id: 14, d: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", color: "#FF9090", size: 24, top: "85%", left: "90%", delay: 1.0, fill: "none", stroke: true },
    { id: 15, d: "M4 12c2-6 10-6 12 0s10 6 12 0", color: "#9bc49b", size: 26, top: "65%", left: "92%", delay: 2.8, fill: "none", stroke: true },
];

export default function HomePage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(true);
    const [myLetter, setMyLetter] = useState<any>(null);
    const [companionData, setCompanionData] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState("");
    // ✅ เพิ่ม state สำหรับ Doodles เพื่อแก้ปัญหา Hydration Mismatch (Render ฝั่ง Client เท่านั้น)
    const [showDecorations, setShowDecorations] = useState(false);

    const deadline = new Date('2026-02-10T00:00:00');
    const now = new Date();
    const canEdit = now < deadline;

    useEffect(() => {
        setShowDecorations(true);

        if (status === "loading") return;

        if (status === "unauthenticated" || !session?.user) {
            router.push('/');
            return;
        }

        const fetchHomeData = async () => {
            try {
                // 🚀 1. Fetch My Letter ผ่าน Server Action
                const { data, error } = await getLetter();

                const myLetterData = data as unknown as LetterData;

                if (error || !myLetterData) {
                    router.push('/write');
                    return;
                }

                // Map Data (เหมือนเดิม)
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

                // 🚀 2. Fetch Companions ผ่าน Server Action
                const { data: othersData } = await getCompanionEnvelopes();

                if (othersData) {
                    setCompanionData(othersData);
                }

            } catch (error) {
                console.error("Error loading home:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();

        // Timer Logic (เหมือนเดิม)
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

    }, [session, status, router]);


    if (loading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] text-[#2d2d2d]">
                <div className="animate-pulse font-adelia text-2xl">Loading Playground...</div>
            </div>
        );
    }

    if (!myLetter) return null;

    return (
        <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-6 bg-[#fdfbf7] text-[#2d2d2d]">

            {/* Agent Profile Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-6 right-6 z-50"
            >
                <div className="flex items-center gap-3 bg-[#e2e8f0]/80 backdrop-blur-md py-1.5 pl-5 pr-2 rounded-full shadow-sm border border-white/50">
                    <div className="flex flex-col items-end mr-1">
                        <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase leading-tight font-ibm-plex">
                            AGENT
                        </span>
                        <span className="text-sm font-bold text-[#8b5cf6] leading-none font-ibm-plex">
                            {session?.user?.name || "Unknown"}
                        </span>
                    </div>
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-300 flex items-center justify-center text-xs text-slate-500">?</div>
                        )}
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="p-2 ml-1 text-rose-500 hover:bg-white rounded-full transition-all shadow-sm hover:shadow-md group"
                        title="Logout"
                    >
                        <LogOut size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </motion.div>

            {/* 🎨 Dot Pattern Background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(#d1ccc0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* ✅ 2. Doodles Decoration Layer */}
            {showDecorations && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {DECORATIONS.map((item) => (
                        <motion.div
                            key={item.id}
                            className="absolute"
                            style={{ top: item.top, left: item.left }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: 0.6,
                                scale: 1,
                                y: [0, -15, 0], // ลอยขึ้นลง
                                rotate: [0, 10, -10, 0] // หมุนไปมา
                            }}
                            transition={{
                                opacity: { duration: 1, delay: item.delay },
                                scale: { duration: 1, delay: item.delay },
                                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: item.delay }
                            }}
                        >
                            <svg
                                width={item.size}
                                height={item.size}
                                viewBox="0 0 24 24"
                                fill={item.fill || "currentColor"}
                                stroke={item.stroke ? item.color : "none"}
                                strokeWidth={item.stroke ? 2 : 0}
                                style={{ color: item.color }}
                            >
                                <path d={item.d} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* 🌌 Interactive Physics Background (Z-0) */}
            <InteractiveBackground envelopeData={companionData} />

            {/* 👑 Foreground Layer (Hero) (Z-10) */}
            <div className="relative z-10 w-full max-w-md md:max-w-lg px-4 flex flex-col items-center gap-6 pointer-events-none">

                {/* Header */}
                <div className="text-center space-y-2 select-none pointer-events-auto">
                    <h1 className="font-adelia text-4xl md:text-5xl drop-shadow-sm text-[#2d2d2d]">
                        See you in <span className="text-[#ff4d4d] font-straw-milky">2027</span>
                    </h1>

                    {/* Tag Countdown */}
                    <div className="inline-flex items-center gap-2 bg-white border border-[#2d2d2d]/10 px-4 py-1.5 rounded-sm shadow-sm rotate-[-2deg]">
                        <div className="w-2 h-2 rounded-full bg-[#ff4d4d] animate-pulse" />
                        <p className="font-ibm-plex text-xs tracking-widest uppercase text-[#2d2d2d]/80 font-bold">
                            Unlocking in: {timeLeft}
                        </p>
                    </div>
                </div>

                {/* The Envelope */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    // ✅ เพิ่ม drop-shadow-xl เพื่อให้ตัวจดหมายมีเงาคมๆ ลอยออกมา
                    className="w-full relative pointer-events-auto drop-shadow-xl"
                >
                    {/* ✨ ใส่เป้นอันนี้แทน: "Clean White Spotlight" */}
                    {/* ใช้สีขาว bg-white/60 + เบลอนิดเดียว พอให้ดูนวลๆ ไม่ฟุ้งจนเลอะ */}
                    <div className="absolute inset-0 bg-white/40 rounded-full blur-xl scale-110 -z-10" />

                    <HeroEnvelope
                        {...myLetter}
                        canEdit={canEdit}
                        onEdit={() => router.push('/write')}
                    />
                </motion.div>

                {/* Deadline Warning */}
                {canEdit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="font-ibm-plex text-xs text-center max-w-xs text-[#2d2d2d]/40 pointer-events-auto bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg"
                    >
                        * You can edit this letter until Feb 10, 2026.
                    </motion.div>
                )}

            </div>

            <style jsx global>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: scale(1.1); }
                    50% { opacity: 0.6; transform: scale(1.3); }
                }
                .animate-pulse-slow { animation: pulse-slow 10s ease-in-out infinite; }
            `}</style>
        </main>
    );
}