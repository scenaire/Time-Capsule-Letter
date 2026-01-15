"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

// 🎨 Theme Config (สี Muted สำหรับ Crowd / สี Vivid สำหรับ Hero)
const THEME_MAP: Record<string, { muted: string; vivid: string; glow: string }> = {
    'red': { muted: 'rgba(255, 59, 48, 0.25)', vivid: 'rgba(255, 59, 48, 0.85)', glow: 'rgba(255, 59, 48, 0.6)' },
    'orange': { muted: 'rgba(255, 149, 0, 0.25)', vivid: 'rgba(255, 149, 0, 0.85)', glow: 'rgba(255, 149, 0, 0.6)' },
    'yellow': { muted: 'rgba(255, 204, 0, 0.25)', vivid: 'rgba(255, 204, 0, 0.85)', glow: 'rgba(255, 204, 0, 0.6)' },
    'green': { muted: 'rgba(52, 199, 89, 0.25)', vivid: 'rgba(52, 199, 89, 0.85)', glow: 'rgba(52, 199, 89, 0.6)' },
    'blue': { muted: 'rgba(0, 122, 255, 0.25)', vivid: 'rgba(0, 122, 255, 0.85)', glow: 'rgba(0, 122, 255, 0.6)' },
    'purple': { muted: 'rgba(175, 82, 222, 0.25)', vivid: 'rgba(175, 82, 222, 0.85)', glow: 'rgba(175, 82, 222, 0.6)' },
    'pink': { muted: 'rgba(255, 45, 85, 0.25)', vivid: 'rgba(255, 45, 85, 0.85)', glow: 'rgba(255, 45, 85, 0.6)' },
};

const THEME_KEYS = Object.keys(THEME_MAP);
const BALL_RADIUS = 33; // ขนาดภาพ (66px)
// 🔴 แก้ไข 1: ลด Gap ให้เหลือ 0 หรือติดลบนิดๆ ให้ซ้อนกันได้หน่อยๆ ดูแน่นๆ
const PHYSICS_RADIUS = BALL_RADIUS - 1;
const WALL_THICK = 60;

type Ball = {
    id: number;
    isUser: boolean;
    themeKey: string;
};

export default function SuccessMailbox({
    userTheme = 'red',
    ballCount = 20 // ค่า Default ถ้ายังไม่มี Database
}: {
    userTheme?: string;
    ballCount?: number;
}) {
    const engineRef = useRef<Matter.Engine | null>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    const ballDomRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setBalls([]);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (engineRef.current) {
            Matter.World.clear(engineRef.current.world, false);
            Matter.Engine.clear(engineRef.current);
        }

        const Engine = Matter.Engine,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Runner = Matter.Runner,
            Events = Matter.Events;

        const engine = Engine.create();
        engineRef.current = engine;

        // ปรับแรงโน้มถ่วงให้สมจริงขึ้นนิดนึง
        engine.gravity.y = 2.5;

        const width = 400;
        const height = 500;
        const wallOptions = { isStatic: true };

        World.add(engine.world, [
            Bodies.rectangle(width / 2, height + 20, width, WALL_THICK, wallOptions),
            Bodies.rectangle(0, height / 2, WALL_THICK, height, wallOptions),
            Bodies.rectangle(width, height / 2, WALL_THICK, height, wallOptions)
        ]);

        // --- 1. Crowd Balls (กองล่าง) ---
        // ใช้ ballCount ที่รับมา ลบ 1 (เพื่อเว้นที่ให้ Hero Ball ของเรา)
        // แต่ถ้า database ยังน้อยกว่า 0 ให้กันเหนียวไว้
        const crowdCount = Math.max(0, ballCount - 1);
        const initialBalls: Ball[] = [];
        const crowdBodies: Matter.Body[] = [];

        for (let i = 0; i < crowdCount; i++) {
            const randomKey = THEME_KEYS[Math.floor(Math.random() * THEME_KEYS.length)];
            const startX = Math.random() * 300 + 50;
            const startY = Math.random() * 300;

            const body = Bodies.circle(startX, startY, PHYSICS_RADIUS, {
                restitution: 0.3, // คนอื่นไม่ต้องเด้งมาก
                friction: 0.1,    // ฝืดหน่อยจะได้กองสวย
                density: 0.04,
            });

            crowdBodies.push(body);
            initialBalls.push({ id: body.id, isUser: false, themeKey: randomKey });
        }

        World.add(engine.world, crowdBodies);

        // --- ⚡ 2. Pre-warm (เร่งเวลาให้กองเสร็จ) ---
        for (let i = 0; i < 200; i++) {
            Engine.update(engine, 1000 / 60);
        }
        setBalls(initialBalls);

        const runner = Runner.create();
        Runner.run(runner, engine);

        Events.on(engine, 'afterUpdate', () => {
            engine.world.bodies.forEach((body) => {
                if (body.isStatic) return;
                const ballDiv = ballDomRefs.current.get(body.id);
                if (ballDiv) {
                    // Offset ตำแหน่งให้ตรง
                    ballDiv.style.transform = `translate3d(${body.position.x - BALL_RADIUS}px, ${body.position.y - BALL_RADIUS}px, 0) rotate(${body.angle}rad)`;
                }
            });
        });

        // --- 3. Hero Ball (ตกลงมาแบบ Lively) ---
        timeoutRef.current = setTimeout(() => {
            if (!engineRef.current) return;

            const heroColor = THEME_MAP[userTheme] ? userTheme : 'red';
            // สุ่มตำแหน่งตกนิดหน่อย ไม่ให้ซ้ำซาก
            const startX = Math.random() * 100 + 150;

            // 🔴 แก้ไข 4: Lively Physics
            const heroBody = Bodies.circle(startX, -150, PHYSICS_RADIUS, {
                restitution: 0.5, // เด้งดึ๋ง
                friction: 0.001,  // ลื่นๆ ไม่ติดขัด
                frictionAir: 0.001, // ต้านอากาศต่ำ
                density: 0.1,    // หนักกว่าคนอื่น 2 เท่า (จะแหวกกองลงไปได้สวยๆ)
            });

            // ใส่แรงหมุนเริ่มต้น (Torque) ให้ดูมีชีวิตชีวาตอนตก
            Matter.Body.setAngularVelocity(heroBody, Math.random() * 0.2 - 0.1);
            Matter.Body.setVelocity(heroBody, { x: 0, y: 15 });

            Matter.World.add(engineRef.current.world, heroBody);
            setBalls(prev => [...prev, { id: heroBody.id, isUser: true, themeKey: heroColor }]);

        }, 600);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            Runner.stop(runner);
            Engine.clear(engine);
        };
    }, [userTheme, ballCount]);

    return (
        <div className="relative w-[400px] h-[500px]">
            {/* โหลแก้ว */}
            <div className="absolute inset-0 z-10 pointer-events-none rounded-[40px] border-[2px] border-white/20 overflow-hidden shadow-sm bg-white/5 backdrop-blur-[2px]">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/30 to-transparent" />
            </div>

            {/* Balls Container */}
            <div className="absolute inset-0 z-20 overflow-hidden rounded-[40px]">
                {balls.map(ball => {
                    const theme = THEME_MAP[ball.themeKey] || THEME_MAP['blue'];

                    return (
                        <div
                            key={ball.id}
                            ref={el => { if (el) ballDomRefs.current.set(ball.id, el); }}
                            className={`
                                absolute top-0 left-0 w-[66px] h-[66px] rounded-full 
                                transition-all duration-500
                                ${ball.isUser ? 'z-50' : 'z-0'} 
                            `}
                            style={{
                                // 🔴 แก้ไข 3: Apple iOS Frosted Glass Style (ทุกคนใช้สไตล์นี้หมด)
                                background: ball.isUser ? theme.vivid : theme.muted, // Hero เข้ม / Crowd จาง

                                // Glass Effect หัวใจสำคัญ
                                backdropFilter: 'blur(12px)',           // เบลอฉากหลังทะลุลูกบอล
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.4)', // ขอบขาวใส
                                boxShadow: ball.isUser
                                    ? `0 8px 32px 0 ${theme.glow}, inset 0 0 0 1px rgba(255,255,255,0.2)` // Hero มี Glow
                                    : '0 4px 10px 0 rgba(0,0,0,0.05)', // Crowd เงาบางๆ

                                // 🔴 แก้ไข 2: เอา Emoji ออก (ใน div นี้ไม่มี content แล้ว)
                            }}
                        />
                    );
                })}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                <div className="px-6 py-2 rounded-full bg-[#2d2d2d]/90 backdrop-blur-md text-white font-bold font-ibm-plex text-sm tracking-widest uppercase shadow-xl border border-white/10">
                    Your Memory
                </div>
            </div>
        </div>
    );
}