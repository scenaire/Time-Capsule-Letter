"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

// 🎨 Palette: แปลงเป็น RGBA เพื่อคุมความใส (Alpha) ได้ง่าย
const BALL_STYLES = [
    { color: 'rgba(255, 59, 48, 0.6)', glow: '#FF3B30' },   // Red
    { color: 'rgba(255, 149, 0, 0.6)', glow: '#FF9500' },   // Orange
    { color: 'rgba(255, 204, 0, 0.6)', glow: '#FFCC00' },   // Yellow
    { color: 'rgba(52, 199, 89, 0.6)', glow: '#34C759' },   // Green
    { color: 'rgba(0, 122, 255, 0.6)', glow: '#007AFF' },   // Blue
    { color: 'rgba(88, 86, 214, 0.6)', glow: '#5856D6' },   // Indigo
    { color: 'rgba(175, 82, 222, 0.6)', glow: '#AF52DE' },  // Purple
    { color: 'rgba(255, 45, 85, 0.6)', glow: '#FF2D55' },   // Pink
];

// 📏 Config ขนาด
const BALL_RADIUS = 33; // รัศมีที่ตาเห็น (Diameter = 66px)
const BALL_PADDING = 4; // 🔴 เพิ่ม Padding ที่มองไม่เห็น (4px)
// รัศมีสำหรับฟิสิกส์ = รัศมีจริง + Padding
const PHYSICS_RADIUS = BALL_RADIUS + BALL_PADDING;

const WALL_THICK = 60;

type Ball = {
    id: number;
    style: { color: string; glow: string };
};

export default function MailboxOverlay() {
    const engineRef = useRef<Matter.Engine | null>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    const ballDomRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const playSound = () => {
        // สร้าง Object เสียงใหม่ทุกครั้งที่เรียก (เพื่อให้เล่นซ้อนกันได้ถ้ารัวมา)
        const audio = new Audio('/sounds/crystal_drop.mp3');
        audio.volume = 0.5; // ปรับความดัง (0.0 - 1.0)
        audio.play().catch((err) => {
            // กัน Error กรณี Browser บล๊อกเสียงถ้ายังไม่ได้คลิกหน้าจอ
            console.warn("Audio blocked:", err);
        });
    };

    useEffect(() => {
        const Engine = Matter.Engine,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Runner = Matter.Runner,
            Events = Matter.Events;

        const engine = Engine.create();
        engineRef.current = engine;

        const width = 400;
        const height = 500;
        const wallThick = 60;
        const wallOptions = { isStatic: true };

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
                    ballDiv.style.transform = `translate3d(${body.position.x - 28}px, ${body.position.y - 28}px, 0) rotate(${body.angle}rad)`;
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

    const dropBall = () => {
        if (!engineRef.current) return;

        playSound();

        const style = BALL_STYLES[Math.floor(Math.random() * BALL_STYLES.length)];

        const body = Matter.Bodies.circle(
            Math.random() * 200 + 100, -50, PHYSICS_RADIUS,
            { restitution: 0.6, friction: 0.005 }
        );
        Matter.World.add(engineRef.current.world, body);

        setBalls(prev => [...prev, { id: body.id, style }]);
    };

    return (
        <div className="flex flex-col items-center gap-8 p-10">

            <div className="relative w-[400px] h-[500px]">

                {/* 1. Container ขวดโหล (คงไว้เหมือนเดิม) */}
                <div className="absolute inset-0 z-10 pointer-events-none rounded-[40px] border-[2px] border-white/30 overflow-hidden shadow-lg">
                    <div className="absolute inset-0 opacity-20 animate-noise-sparkle"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                            backgroundSize: '150px 150px'
                        }}
                    />
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent" />
                </div>

                {/* 2. Balls Container */}
                <div className="absolute inset-0 z-20 overflow-hidden rounded-[40px]">
                    {balls.map(ball => (
                        <div
                            key={ball.id}
                            ref={el => { if (el) ballDomRefs.current.set(ball.id, el); }}
                            className="absolute top-0 left-0 w-[66px] h-[66px] rounded-full glass-disc cursor-grab active:cursor-grabbing"
                            style={{
                                '--ball-bg': ball.style.color,
                                '--ball-glow': ball.style.glow,
                            } as React.CSSProperties}
                        />
                    ))}
                </div>

                {/* 3. Counter */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <div className="px-8 py-3 rounded-full bg-black/50 border-2 border-white/30 text-white font-bold backdrop-blur-md shadow-xl text-4xl min-w-[80px] text-center font-ibm-plex">
                        {balls.length}
                    </div>
                </div>

            </div>

            <button
                onClick={dropBall}
                className="relative z-50 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-500 active:scale-95 transition-all"
            >
                DROP BALL
            </button>

            <style jsx global>{`
                /* ✨ CSS สำหรับแผ่นกระจกเรืองแสง (Flat Glowing Glass) */
                .glass-disc {
                    /* พื้นหลังสีตามที่กำหนด แต่โปร่งแสง */
                    background: var(--ball-bg);
                    
                    /* ขอบขาวบางๆ เหมือนขอบกระจก */
                    border: 2px solid var(--ball-bg);

                    /* ❌ ลบ Inset Shadow ที่ทำให้ดูนูน 3D ออก */
                    /* ✅ ใส่ Outer Glow (เงาฟุ้งด้านนอก) สีเดียวกับลูกบอล */
                    box-shadow: 0 0 20px var(--ball-glow);
                    
                    /* ความฝ้า (Frosted Effect) */
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);

                    /* ทำให้สี Blend เข้ากับพื้นหลังแบบสวยๆ (Optional) */
                    /* mix-blend-mode: screen; (ถ้าอยากให้สว่างขึ้นลองเปิดบรรทัดนี้ได้) */
                }

                @keyframes noise-sparkle {
                    0% { background-position: 0 0; }
                    10% { background-position: -5% -10%; }
                    20% { background-position: -15% 5%; }
                    30% { background-position: 7% -25%; }
                    40% { background-position: 20% 25%; }
                    50% { background-position: -25% 10%; }
                    100% { background-position: 0 0; }
                }
                .animate-noise-sparkle {
                    animation: noise-sparkle 0.5s steps(3) infinite; 
                }
            `}</style>

        </div>
    );
}