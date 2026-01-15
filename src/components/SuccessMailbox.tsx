"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

// 🎨 Theme Config: กำหนดคู่สี Muted (คนอื่น) vs Vivid (ของเรา)
// Nair สามารถมาแก้ map สีตรงนี้ทีหลังได้เลยครับ
const THEME_MAP: Record<string, { muted: string; vivid: string; glow: string }> = {
    'red': { muted: 'rgba(255, 59, 48, 0.15)', vivid: 'rgba(255, 59, 48, 0.85)', glow: '#FF3B30' },
    'orange': { muted: 'rgba(255, 149, 0, 0.15)', vivid: 'rgba(255, 149, 0, 0.85)', glow: '#FF9500' },
    'yellow': { muted: 'rgba(255, 204, 0, 0.15)', vivid: 'rgba(255, 204, 0, 0.85)', glow: '#FFCC00' },
    'green': { muted: 'rgba(52, 199, 89, 0.15)', vivid: 'rgba(52, 199, 89, 0.85)', glow: '#34C759' },
    'blue': { muted: 'rgba(0, 122, 255, 0.15)', vivid: 'rgba(0, 122, 255, 0.85)', glow: '#007AFF' },
    'purple': { muted: 'rgba(175, 82, 222, 0.15)', vivid: 'rgba(175, 82, 222, 0.85)', glow: '#AF52DE' },
    'pink': { muted: 'rgba(255, 45, 85, 0.15)', vivid: 'rgba(255, 45, 85, 0.85)', glow: '#FF2D55' },
};

const THEME_KEYS = Object.keys(THEME_MAP);

// 📏 Config
const BALL_RADIUS = 33;
const BALL_PADDING = 4;
const PHYSICS_RADIUS = BALL_RADIUS + BALL_PADDING;
const WALL_THICK = 60;

type Ball = {
    id: number;
    isUser: boolean; // ✨ แยกแยะว่าเป็นของเราหรือคนอื่น
    themeKey: string;
};

export default function SuccessMailbox() {
    const engineRef = useRef<Matter.Engine | null>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    const ballDomRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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
        const wallOptions = { isStatic: true };

        // สร้างกำแพงโหลแก้ว
        World.add(engine.world, [
            Bodies.rectangle(width / 2, height + 20, width, WALL_THICK, wallOptions),
            Bodies.rectangle(0, height / 2, WALL_THICK, height, wallOptions),
            Bodies.rectangle(width, height / 2, WALL_THICK, height, wallOptions)
        ]);

        // Sync Physics -> DOM
        Events.on(engine, 'afterUpdate', () => {
            engine.world.bodies.forEach((body) => {
                if (body.isStatic) return;
                const ballDiv = ballDomRefs.current.get(body.id);
                if (ballDiv) {
                    ballDiv.style.transform = `translate3d(${body.position.x - BALL_RADIUS}px, ${body.position.y - BALL_RADIUS}px, 0) rotate(${body.angle}rad)`;
                }
            });
        });

        const runner = Runner.create();
        Runner.run(runner, engine);

        // --- 🎬 Sequence การปล่อยลูกบอล ---

        // 1. ปล่อย "Crowd Balls" (ลูกบอลคนอื่น) ลงมาก่อน 20 ลูก
        const crowdCount = 20;
        for (let i = 0; i < crowdCount; i++) {
            setTimeout(() => {
                // สุ่ม Theme สำหรับคนอื่น
                const randomKey = THEME_KEYS[Math.floor(Math.random() * THEME_KEYS.length)];
                spawnBall(randomKey, false); // isUser = false
            }, i * 50); // ทยอยปล่อยเร็วๆ
        }

        // 2. ปล่อย "Hero Ball" (ลูกบอลของเรา) ลงมาทีหลังสุด เพื่อให้เด่นและอยู่ข้างบน
        setTimeout(() => {
            // สมมติว่าของเราเป็นสีแดง (Nair เปลี่ยน key ตรงนี้ได้ตามซองที่ user เลือกจริง)
            spawnBall('red', true); // isUser = true ✨
        }, 1500); // รอ 1.5 วิ ให้คนอื่นกองกันเสร็จก่อน

        return () => {
            Runner.stop(runner);
            Engine.clear(engine);
        };
    }, []);

    const spawnBall = (themeKey: string, isUser: boolean) => {
        if (!engineRef.current) return;

        // สุ่มตำแหน่ง X ไม่ให้ซ้ำกันเกินไป
        const startX = Math.random() * 200 + 100;
        const body = Matter.Bodies.circle(startX, -50, PHYSICS_RADIUS, {
            restitution: 0.5,
            friction: 0.005,
        });

        Matter.World.add(engineRef.current.world, body);
        setBalls(prev => [...prev, { id: body.id, isUser, themeKey }]);
    };

    return (
        <div className="relative w-[400px] h-[500px]">
            {/* 1. Container ขวดโหล */}
            <div className="absolute inset-0 z-10 pointer-events-none rounded-[40px] border-[2px] border-[#2d2d2d]/10 overflow-hidden shadow-sm bg-white/5">
                {/* ลด Noise ลงหน่อยให้ดู Clean ขึ้นสำหรับหน้า Success */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/40 to-transparent" />
            </div>

            {/* 2. Balls Container */}
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
                                // 🎨 ถ้าเป็น User: ใช้สี Vivid + Glow + Border ชัด
                                // 🌫️ ถ้าเป็นคนอื่น: ใช้สี Muted + Border จางๆ + ไม่มี Glow
                                background: ball.isUser ? theme.vivid : theme.muted,
                                boxShadow: ball.isUser ? `0 0 30px ${theme.glow}` : 'none',
                                border: ball.isUser
                                    ? '2px solid rgba(255,255,255,0.9)'
                                    : '1px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            {/* ✨ Star/Sparkle สำหรับลูกบอลเราเท่านั้น */}
                            {ball.isUser && (
                                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                                    <span className="text-white text-2xl drop-shadow-md">✨</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 3. Label (Optional) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                <div className="px-6 py-2 rounded-full bg-[#2d2d2d] text-white font-bold font-ibm-plex text-sm tracking-widest uppercase">
                    Your Memory
                </div>
            </div>
        </div>
    );
}