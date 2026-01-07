// src/app/page.tsx
"use client";

import React, { useEffect } from 'react';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Twitch, Mail } from "lucide-react";

// ดึง Font มาใช้ (สมมติว่าเรียกผ่าน class font-cursive และ font-ibm-plex ได้ตามปกติ)

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // ถ้า Login อยู่แล้ว ให้ดีดไปหน้า /write ทันที
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/write");
        }
    }, [status, router]);

    // ถ้ากำลังโหลดสถานะ ให้แสดงหน้าจอว่างๆ ไปก่อน
    if (status === "loading") {
        return <div className="h-screen w-full bg-olive-harvest flex items-center justify-center"><div className="animate-pulse text-golden-batter">Loading...</div></div>;
    }

    // ถ้ายังไม่ Login ให้แสดงหน้านี้
    return (
        // ใช้ธีมสี Classic Cocoa เป็นพื้นฐาน (bg-olive-harvest, text-cowhide-cocoa, text-golden-batter)
        <main className="h-screen w-full flex flex-col items-center justify-center overflow-hidden p-4 bg-olive-harvest relative">

            {/* Background texture or decorative elements (Optional) */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #E5D0BA 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 flex flex-col items-center text-center max-w-2xl mx-auto p-8 md:p-12 rounded-[40px] bg-cowhide-cocoa/5 backdrop-blur-sm border border-cowhide-cocoa/10 shadow-xl"
            >
                {/* Icon หัวกระดาษ */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="mb-6 p-4 bg-golden-batter/20 rounded-full text-golden-batter"
                >
                    <Mail size={48} />
                </motion.div>

                {/* Header หลัก */}
                <h1 className="font-adelia text-4xl md:text-6xl text-golden-batter mb-6 drop-shadow-sm">
                    Time Capsule
                </h1 >

                {/* Subtitle */}
                <p className="font-ibm-plex text-cowhide-cocoa text-lg md:text-xl opacity-80 mb-12 leading-relaxed">
                    พื้นที่เก็บความทรงจำ... ส่งข้อความถึงตัวคุณในอนาคต <br className="hidden md:block" /> แล้วพบกันใหม่ในปี 2027
                </p>

                {/* ปุ่ม Twitch Login (CTA ใหญ่ๆ ตรงกลาง) */}
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#8227FE" }}
                    whileTap={{ scale: 0.95 }}
                    // ⚠️ สำคัญ: callbackUrl: "/write" คือพอล็อกอินเสร็จ ให้เด้งไปหน้าเขียนจดหมาย
                    onClick={() => signIn("twitch", { callbackUrl: "/write" })}
                    className="group relative flex items-center gap-3 px-8 py-4 bg-[#9146FF] text-white rounded-full font-bold text-lg md:text-xl shadow-[0_4px_0_0_#5d1cb5] hover:shadow-[0_2px_0_0_#5d1cb5] hover:translate-y-[2px] transition-all"
                >
                    <Twitch size={28} className="group-hover:rotate-[-10deg] transition-transform" />
                    <span className="tracking-wider">Login with Twitch</span>


                </motion.button>
            </motion.div>

            {/* Footer เล็กๆ */}
            <div className="absolute bottom-4 text-center font-ibm-plex text-cowhide-cocoa/50 text-xs tracking-widest uppercase">
                Secure • Private • Future-Proof
            </div>
        </main>
    );
}