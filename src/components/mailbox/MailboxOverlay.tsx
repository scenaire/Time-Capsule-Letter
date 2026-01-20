"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { supabase } from '@/lib/supabase';
import { ENVELOPE_OVERLAY_MAP } from '@/constants/assets';

const BALL_RADIUS = 33;
const BALL_PADDING = 4;
const PHYSICS_RADIUS = BALL_RADIUS + BALL_PADDING;

type Ball = {
    id: number;       // Matter Body ID
    letterId: string; // ✅ Supabase Letter ID (เอาไว้หาตัวตนตอน Edit)
    color: string;
};

export default function MailboxOverlay() {
    const engineRef = useRef<Matter.Engine | null>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    const ballDomRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const [totalCount, setTotalCount] = useState(0);

    const playSound = () => {
        const audio = new Audio('/sounds/crystal_drop.mp3');
        audio.volume = 0.5;
        audio.play().catch((err) => console.warn("Audio blocked:", err));
    };

    useEffect(() => {
        // --- Setup Matter.js (เหมือนเดิม) ---
        const Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Runner = Matter.Runner, Events = Matter.Events;
        const engine = Engine.create();
        engineRef.current = engine;

        const width = 400, height = 500, wallThick = 60;
        const wallOptions = { isStatic: true, render: { visible: false } };

        World.add(engine.world, [
            Bodies.rectangle(width / 2, height + 20, width, wallThick, wallOptions),
            Bodies.rectangle(0, height / 2, wallThick, height, wallOptions),
            Bodies.rectangle(width, height / 2, wallThick, height, wallOptions)
        ]);

        Events.on(engine, 'afterUpdate', () => {
            engine.world.bodies.forEach((body) => {
                if (body.isStatic) return;
                const ballDiv = ballDomRefs.current.get(body.id);
                if (ballDiv) {
                    ballDiv.style.transform = `translate3d(${body.position.x - 33}px, ${body.position.y - 33}px, 0) rotate(${body.angle}rad)`;
                }
            });
        });

        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => {
            Runner.stop(runner);
            Engine.clear(engine);
        };
    }, []);

    // ✅ รับ letterId มาด้วย
    const spawnBall = (letterId: string, envelopeId: string, isNew: boolean = true) => {
        if (!engineRef.current) return;

        const color = ENVELOPE_OVERLAY_MAP[envelopeId] || '#FFFFFF';
        const startX = Math.random() * 200 + 100;
        const startY = isNew ? -50 : Math.random() * 300 + 100;

        const body = Matter.Bodies.circle(startX, startY, PHYSICS_RADIUS, {
            restitution: 0.5, friction: 0.005, density: 0.04
        });

        Matter.World.add(engineRef.current.world, body);

        // ✅ Save letterId to State
        setBalls(prev => [...prev, { id: body.id, letterId, color }]);

        if (isNew) {
            playSound();
            setTotalCount(prev => prev + 1);
        }
    };

    useEffect(() => {
        // A. Load All (ต้องดึง id มาด้วย)
        const fetchExisting = async () => {
            const { data } = await supabase
                .from('letters')
                // ✅ ดึง user_id หรือ id (primary key) มาใช้เป็น letterId
                .select('user_id, envelope_id');

            if (data) {
                setTotalCount(data.length);
                data.forEach((letter: any) => {
                    // ใช้ user_id เป็น ID ประจำตัวบอล (เพราะ 1 คนส่งได้ 1 ฉบับ)
                    spawnBall(letter.user_id, letter.envelope_id, false);
                });
            }
        };

        fetchExisting();

        // B. Real-time Listener (INSERT & UPDATE)
        const channel = supabase
            .channel('mailbox-overlay')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'letters' }, // ✅ ฟังทุก event
                (payload) => {
                    console.log("📨 Received Payload:", payload);
                    const eventType = payload.eventType;
                    const newLetter = payload.new as any;

                    // ใช้ user_id เป็น key ในการอ้างอิง
                    const targetId = newLetter.user_id;

                    if (eventType === 'INSERT') {
                        // 📥 จดหมายใหม่ -> ปล่อยบอล
                        console.log("New Letter! 💌");
                        setTimeout(() => {
                            spawnBall(targetId, newLetter.envelope_id, true);
                        }, 500);
                    }
                    else if (eventType === 'UPDATE') {
                        // 🎨 แก้ไข -> เปลี่ยนสีบอลเดิม
                        console.log("Update Color! 🎨");
                        const newColor = ENVELOPE_OVERLAY_MAP[newLetter.envelope_id] || '#FFFFFF';

                        setBalls(prevBalls => prevBalls.map(ball => {
                            if (ball.letterId === targetId) {
                                return { ...ball, color: newColor }; // เปลี่ยนแค่สี
                            }
                            return ball;
                        }));
                    }
                }
            )
            .subscribe((status, err) => {
                // 🔥 นี่คือจุดสำคัญ! ให้มันรายงานสถานะการเชื่อมต่อ
                console.log(`🔌 Realtime Status: ${status}`, err);

                if (status === 'SUBSCRIBED') {
                    console.log("✅ Connected! Ready to listen.");
                } else if (status === 'CHANNEL_ERROR') {
                    console.error("❌ Connection Failed:", err);
                } else if (status === 'TIMED_OUT') {
                    console.warn("⏳ Connection Timed out...");
                }
            });

        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        // ... (JSX ส่วน Render เหมือนเดิมเป๊ะ ไม่ต้องแก้) ...
        // Copy JSX จากโค้ดก่อนหน้ามาวางตรงนี้ได้เลยค่ะ 
        // (ส่วน div, styles, balls.map เหมือนเดิมทุกประการ)
        <div className="flex flex-col items-center gap-8 p-10">
            <div className="relative w-[400px] h-[500px]">
                <div className="absolute inset-0 z-10 pointer-events-none rounded-[40px] border-[2px] border-white/30 overflow-hidden shadow-lg">
                    <div className="absolute inset-0 opacity-20 animate-noise-sparkle"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                            backgroundSize: '150px 150px'
                        }}
                    />
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent" />
                </div>

                <div className="absolute inset-0 z-20 overflow-hidden rounded-[40px]">
                    {balls.map(ball => (
                        <div
                            key={ball.id}
                            ref={el => { if (el) ballDomRefs.current.set(ball.id, el); }}
                            className="absolute top-0 left-0 w-[66px] h-[66px] rounded-full glass-disc transition-colors duration-500 ease-in-out" // ✅ เพิ่ม transition-colors ให้เปลี่ยนสีนุ่มๆ
                            style={{
                                '--ball-bg': `${ball.color}99`,
                                '--ball-glow': ball.color,
                            } as React.CSSProperties}
                        />
                    ))}
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 select-none">
                    <div className="px-8 py-3 rounded-full bg-black/50 border-2 border-white/30 text-white font-bold backdrop-blur-md shadow-xl text-4xl min-w-[80px] text-center font-ibm-plex">
                        {totalCount}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .glass-disc {
                    background: var(--ball-bg);
                    border: 2px solid var(--ball-glow);
                    box-shadow: 0 0 15px var(--ball-glow), inset 0 0 10px rgba(255,255,255,0.2);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }
                .animate-noise-sparkle { animation: noise-sparkle 2s steps(10) infinite; }
                @keyframes noise-sparkle { 0% { background-position: 0 0; } 100% { background-position: 100% 100%; } }
            `}</style>
        </div>
    );
}