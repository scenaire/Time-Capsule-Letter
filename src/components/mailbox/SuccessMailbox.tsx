"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
// 📦 เปลี่ยนจาก THEMES เป็น ENVELOPES จาก assets.ts
import { ENVELOPES } from '@/constants/assets';

// 🎨✨ Cute Color Map: ตารางแปลงสีจาก "ซองจริง" เป็น "สีลูกบอลสไตล์เกาหลี"
// เลือกใช้โทนพาสเทลที่สดใส (High Brightness, Moderate Saturation)
// 🎨✨ Cute Color Map: แปลงสีซองจริง -> สีลูกบอลสไตล์เกาหลี (Pastel & Milky)
const CUTE_COLOR_MAP: Record<string, string> = {
    // 1. Basic
    'white': '#FFF9C4', // Creamy Yellow (นวลๆ เหมือนเนย)
    'black': '#CFD8DC', // Blue Grey (เทาฟ้าอ่อนๆ ไม่ดำสนิท)

    // 2. Rhythm Start (Pop & Soft)
    'pink': '#F48FB1', // Pastel Rose (ชมพูนมเย็น)
    'ink_teal': '#80DEEA', // Icy Cyan (ฟ้าเขียวน้ำแข็ง)
    'lemon': '#FFF176', // Soft Lemon (เหลืองสดใส)
    'grape_ash': '#CE93D8', // Taro Milk (ม่วงเผือก)

    // 3. Earth & Nature (Warm)
    'mint': '#A5D6A7', // Soft Mint (เขียวมินต์)
    'butter': '#FFE0B2', // Peach Cream (ส้มนวลๆ)
    'burnt_matcha': '#C5E1A5', // Light Sage (เขียวตองอ่อน)

    // 4. Pop & Classic
    'sky': '#90CAF9', // Baby Blue (ฟ้าเด็กน้อย)
    'electric_apricot': '#FFAB91', // Soft Coral (ส้มพีช)
    'navy': '#9FA8DA', // Blueberry Milk (น้ำเงินม่วงอ่อน)

    // 5. Cozy Finish
    'lavender': '#E1BEE7', // Pale Lavender (ม่วงอ่อนมาก)
    'matcha': '#C8E6C9', // Green Tea Latte (เขียวชาเขียวนม)
    'cocoa': '#BCAAA4', // Mocha Cream (น้ำตาลกาแฟนม)

    // Fallback
    'default': '#FFE082'
};

const BALL_RADIUS = 33;
const PHYSICS_RADIUS = BALL_RADIUS - 1;
const WALL_THICK = 60;

const DOODLE_SHAPES = [
    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" key="1" />,
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" key="2" />,
    <path d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 16 0 8 8 0 0 0-8-8" key="3" />,
    <circle cx="12" cy="12" r="8" key="4" />,
    <path d="M6 6L18 18M6 18L18 6" key="5" />
];

type Ball = {
    id: number;
    isUser: boolean;
    envelopeId: string; // ✉️ เก็บ ID ของซองจดหมายแทน themeName
};

type DoodleItem = {
    id: number;
    shapeIndex: number;
    top: string;
    left: string;
    scale: number;
    rotation: number;
    delay: string;
    color: string;
    opacity: number;
};

export default function SuccessMailbox({
    userEnvelopeId = 'white', // ✉️ รับ ID ซองจดหมายแทน userTheme
    ballCount = 40
}: {
    userEnvelopeId?: string;
    ballCount?: number;
}) {
    const engineRef = useRef<Matter.Engine | null>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    const [doodles, setDoodles] = useState<DoodleItem[]>([]);
    const ballDomRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ✨ Generate Random Doodles (เหมือนเดิม)
    useEffect(() => {
        const newDoodles: DoodleItem[] = [];
        const count = 20;

        for (let i = 0; i < count; i++) {
            const zone = Math.floor(Math.random() * 3);
            let topStr = '0%';
            let leftStr = '0%';

            if (zone === 0) {
                leftStr = (Math.random() * 40 - 50) + '%';
                topStr = (Math.random() * 120 - 10) + '%';
            } else if (zone === 1) {
                leftStr = (Math.random() * 40 + 110) + '%';
                topStr = (Math.random() * 120 - 10) + '%';
            } else {
                leftStr = (Math.random() * 160 - 30) + '%';
                topStr = (Math.random() * 30 - 40) + '%';
            }

            newDoodles.push({
                id: i,
                shapeIndex: Math.floor(Math.random() * DOODLE_SHAPES.length),
                top: topStr,
                left: leftStr,
                scale: 0.4 + Math.random() * 0.6,
                rotation: Math.random() * 360,
                delay: Math.random() * 5 + 's',
                color: ['#FFCC00', '#FF9090', '#90b3d9', '#9bc49b'][Math.floor(Math.random() * 4)],
                opacity: 0.4 + Math.random() * 0.4
            });
        }
        setDoodles(newDoodles);
    }, []);

    // --- Matter.js Logic ---
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
        engine.gravity.y = 1.5;

        const width = 400;
        const height = 500;
        const wallOptions = { isStatic: true };
        const wallHeight = 2000;

        World.add(engine.world, [
            Bodies.rectangle(width / 2, height + 20, width, WALL_THICK, wallOptions),
            Bodies.rectangle(0, height / 2 - (wallHeight / 2) + (height / 2), WALL_THICK, wallHeight, wallOptions),
            Bodies.rectangle(width, height / 2 - (wallHeight / 2) + (height / 2), WALL_THICK, wallHeight, wallOptions),
            Bodies.rectangle(width / 2, -1000, width, WALL_THICK, wallOptions)
        ]);

        const crowdCount = Math.max(0, ballCount - 1);
        const initialBalls: Ball[] = [];
        const crowdBodies: Matter.Body[] = [];

        for (let i = 0; i < crowdCount; i++) {
            // 🎲 สุ่ม Envelope จากรายการทั้งหมด
            const randomEnv = ENVELOPES[Math.floor(Math.random() * ENVELOPES.length)];
            const startX = Math.random() * 300 + 50;
            const startY = Math.random() * 300;
            const body = Bodies.circle(startX, startY, PHYSICS_RADIUS, {
                restitution: 0.3, friction: 0.1, density: 0.04,
            });
            crowdBodies.push(body);
            initialBalls.push({ id: body.id, isUser: false, envelopeId: randomEnv.id });
        }
        World.add(engine.world, crowdBodies);

        const Mouse = Matter.Mouse;
        const MouseConstraint = Matter.MouseConstraint;
        if (containerRef.current) {
            const mouse = Mouse.create(containerRef.current);
            const mouseConstraint = MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: { stiffness: 0.2, render: { visible: false } }
            });
            World.add(engine.world, mouseConstraint);
        }

        for (let i = 0; i < 200; i++) { Engine.update(engine, 1000 / 60); }
        setBalls(initialBalls);

        const runner = Runner.create();
        Runner.run(runner, engine);

        Events.on(engine, 'afterUpdate', () => {
            engine.world.bodies.forEach((body) => {
                if (body.isStatic) return;
                const ballDiv = ballDomRefs.current.get(body.id);
                if (ballDiv) {
                    ballDiv.style.transform = `translate3d(${body.position.x - BALL_RADIUS}px, ${body.position.y - BALL_RADIUS}px, 0) rotate(${body.angle}rad)`;
                }
            });
        });

        timeoutRef.current = setTimeout(() => {
            if (!engineRef.current) return;

            // 💌 หา Envelope ของ User จาก ID ที่ส่งเข้ามา
            const heroEnv = ENVELOPES.find(e => e.id === userEnvelopeId) || ENVELOPES[0];

            const startX = Math.random() * 100 + 150;
            const heroBody = Bodies.circle(startX, -150, PHYSICS_RADIUS, {
                restitution: 0.7, friction: 0.05, frictionAir: 0.05, density: 0.1,
            });
            Matter.Body.setAngularVelocity(heroBody, Math.random() * 0.2 - 0.1);
            Matter.Body.setVelocity(heroBody, { x: 0, y: 15 });
            Matter.World.add(engineRef.current.world, heroBody);

            setBalls(prev => [...prev, { id: heroBody.id, isUser: true, envelopeId: heroEnv.id }]);
        }, 600);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            Runner.stop(runner);
            if (engineRef.current) {
                Matter.World.clear(engineRef.current.world, false);
                Matter.Engine.clear(engineRef.current);
            }
        };
    }, [userEnvelopeId, ballCount]); // Re-run ถ้า userEnvelopeId เปลี่ยน

    return (
        <div ref={containerRef} className="relative w-[400px] h-[500px]">

            {/* Atmosphere Doodles */}
            <div className="absolute inset-0 pointer-events-none">
                {doodles.map((doodle) => (
                    <div
                        key={doodle.id}
                        className="absolute animate-float-slow"
                        style={{
                            top: doodle.top,
                            left: doodle.left,
                            transform: `scale(${doodle.scale}) rotate(${doodle.rotation}deg)`,
                            opacity: doodle.opacity,
                            animationDelay: doodle.delay,
                            width: '20px',
                            height: '20px'
                        }}
                    >
                        <svg
                            width="100%" height="100%" viewBox="0 0 24 24"
                            fill="none"
                            stroke={doodle.color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {DOODLE_SHAPES[doodle.shapeIndex]}
                        </svg>
                    </div>
                ))}
            </div>

            {/* The Sketchbook Jar */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
                style={{
                    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                    border: '3px solid #4a4a4a',
                    backgroundColor: '#fffdf5',
                    backgroundImage: 'radial-gradient(#d1ccc0 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    boxShadow: '8px 8px 0px rgba(0,0,0,0.1)'
                }}
            >
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#4a4a4a]/10 to-transparent pointer-events-none" />
            </div>

            {/* Balls Container */}
            <div className="absolute inset-0 z-20 overflow-hidden"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>

                {balls.map(ball => {
                    // 🎨 ใช้ CUTE_COLOR_MAP
                    const fillColor = CUTE_COLOR_MAP[ball.envelopeId] || CUTE_COLOR_MAP['default'];

                    return (
                        <div
                            key={ball.id}
                            ref={el => { if (el) ballDomRefs.current.set(ball.id, el); }}
                            className={`absolute top-0 left-0 w-[66px] h-[66px] rounded-full flex items-center justify-center ${ball.isUser ? 'z-50' : 'z-0'}`}
                            style={{ opacity: ball.isUser ? 1 : 0.9, transition: 'all 0.5s ease-out' }}
                        >
                            {/* CROWD BALL */}
                            {!ball.isUser && (
                                <>
                                    <div className="absolute inset-0 rounded-full"
                                        style={{
                                            // ปรับลายเส้นให้ดูซอฟต์ลง
                                            backgroundImage: `repeating-linear-gradient(45deg, ${fillColor}, ${fillColor} 2px, transparent 2px, transparent 6px)`,
                                            transform: 'scale(0.75)',
                                            filter: 'blur(0.5px)'
                                        }}
                                    />
                                    <div className="absolute inset-0 rounded-full"
                                        style={{
                                            border: '2px solid rgba(255, 255, 255, 0.8)',
                                            boxShadow: `inset 0 0 15px rgba(255,255,255,0.6), 0 4px 8px rgba(0,0,0,0.05)`
                                        }}
                                    />
                                </>
                            )}

                            {/* HERO BALL */}
                            {ball.isUser && (
                                <>
                                    <div className="w-[85%] h-[85%] rounded-full animate-scribble"
                                        style={{
                                            backgroundImage: `repeating-linear-gradient(45deg, ${fillColor}, ${fillColor} 2px, transparent 2px, transparent 6px)`,
                                            border: 'none',
                                            borderRadius: '50% 45% 55% 40% / 40% 60% 50% 55%'
                                        }}
                                    />
                                    <div className="absolute inset-0 rounded-full border-[3px] pointer-events-none animate-wiggle-slow"
                                        style={{
                                            transform: 'rotate(-3deg) scale(1.05)',
                                            borderRadius: '55% 40% 50% 60% / 50% 60% 40% 55%',
                                            borderColor: '#2d2d2d',
                                            boxShadow: `2px 4px 12px ${fillColor}66`
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    );
                })}

            </div>

            {/* Frosted Glass Washi Tape */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60]">
                <div className="relative group cursor-default">
                    <div
                        className="px-8 py-3 text-[#2d2d2d] font-ibm-plex text-sm font-bold tracking-widest uppercase relative overflow-hidden"
                        style={{
                            borderRadius: '2px 4px 3px 5px',
                            transform: 'rotate(-2deg)',
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-5 bg-white/40 rotate-90 blur-[1px] rounded-sm border border-white/20" />
                        <span className="relative z-10 drop-shadow-sm">Memory no. {balls.length}</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scribble {
                    0% { transform: rotate(0deg) scale(1); border-radius: 50% 45% 55% 40% / 40% 60% 50% 55%; background-position: 0% 0%; }
                    33% { transform: rotate(2deg) scale(0.98); border-radius: 45% 55% 40% 60% / 55% 40% 60% 50%; background-position: 2px 2px; }
                    66% { transform: rotate(-1deg) scale(1.02); border-radius: 60% 40% 50% 45% / 45% 55% 40% 60%; background-position: -1px -1px; }
                    100% { transform: rotate(0deg) scale(1); border-radius: 50% 45% 55% 40% / 40% 60% 50% 55%; background-position: 0% 0%; }
                }
                .animate-scribble { animation: scribble 0.4s steps(1) infinite; }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
                .animate-float-slow { animation: float 6s ease-in-out infinite; }

                @keyframes pulse-fast {
                    0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                    50% { transform: scale(0.8) rotate(15deg); opacity: 0.8; }
                }
                .animate-pulse-fast { animation: pulse-fast 1.5s ease-in-out infinite; }

                @keyframes wiggle-slow {
                    0% { border-radius: 55% 40% 50% 60% / 50% 60% 40% 55%; transform: rotate(-3deg) scale(1.05); }
                    33% { border-radius: 50% 55% 45% 50% / 55% 50% 60% 45%; transform: rotate(0deg) scale(1.03); }
                    66% { border-radius: 60% 45% 55% 40% / 45% 55% 50% 60%; transform: rotate(-5deg) scale(1.06); }
                    100% { border-radius: 55% 40% 50% 60% / 50% 60% 40% 55%; transform: rotate(-3deg) scale(1.05); }
                }
                .animate-wiggle-slow { animation: wiggle-slow 4s ease-in-out infinite; }

                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }

                @keyframes pulse-core {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
                .animate-pulse-core { animation: pulse-core 2s ease-in-out infinite; }
            `}</style>
        </div>
    );
}