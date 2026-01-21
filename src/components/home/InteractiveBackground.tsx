"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { CUTE_COLOR_MAP } from '@/constants/assets';
import { THEMES } from '@/styles/themes';

// ⚙️ Physics Config
const BALL_RADIUS = 30; // ขนาดบอล
const HERO_WIDTH = 320; // ความกว้างโดยประมาณของ Hero Envelope
const HERO_HEIGHT = 420; // ความสูงโดยประมาณ

interface BallState {
    id: number;
    color: string;
    x: number;
    y: number;
    angle: number;
    sender: string;       // เพิ่มชื่อคนส่ง
    theme: typeof THEMES[0]; // เพิ่มข้อมูลธีม
}

export default function InteractiveBackground({
    envelopeData = [] // รายชื่อสีซองจดหมายคนอื่น (เช่น ['pink', 'mint'])
}: {
    envelopeData: any[];
}) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const [balls, setBalls] = useState<BallState[]>([]);

    useEffect(() => {
        if (!sceneRef.current) return;

        // 1. Setup Matter.js
        const Engine = Matter.Engine,
            Render = Matter.Render,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Runner = Matter.Runner,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint,
            Events = Matter.Events;

        const engine = Engine.create();
        engine.world.gravity.y = 0; // 🌌 Zero Gravity! (ไร้น้ำหนัก)
        engine.world.gravity.x = 0;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // 2. Create Boundaries (กำแพงขอบจอ)
        const wallOptions = { isStatic: true, render: { visible: false }, restitution: 0.8 };
        const walls = [
            Bodies.rectangle(width / 2, -50, width, 100, wallOptions), // Top
            Bodies.rectangle(width / 2, height + 50, width, 100, wallOptions), // Bottom
            Bodies.rectangle(-50, height / 2, 100, height, wallOptions), // Left
            Bodies.rectangle(width + 50, height / 2, 100, height, wallOptions) // Right
        ];



        // 4. Create Balls (เพื่อนๆ)
        const ballBodies = envelopeData.map((envelope: any) => {
            // สุ่มตำแหน่งเกิด (ให้ห่างจากตรงกลาง)
            let x, y;
            do {
                x = Math.random() * width;
                y = Math.random() * height;
            } while (
                x > width / 2 - 200 && x < width / 2 + 200 &&
                y > height / 2 - 250 && y < height / 2 + 250
            ); // อย่าเกิดทับจดหมายตรงกลาง

            const body = Bodies.circle(x, y, BALL_RADIUS, {
                restitution: 0.5,  // ✅ ลดความเด้งลง (เดิม 0.9) ชนแล้วไม่กระดอนแรง
                friction: 0.1,     // ✅ เพิ่มแรงเสียดทานผิว (เดิม 0.001)
                frictionAir: 0.05, // ✅ หัวใจสำคัญ! เพิ่มแรงต้านอากาศสูงๆ (เดิม 0.02) ให้เหมือนอยู่ในน้ำ
                density: 0.05      // ✅ เพิ่มความหนาแน่น (เดิม 0.04) ให้รู้สึกมีน้ำหนักเวลาเหวี่ยง
            });

            // ใส่แรงส่งเริ่มต้นเบาๆ ให้บอลลอยไปมา
            Matter.Body.setVelocity(body, {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            });

            return body;
        });

        World.add(engine.world, [...walls, ...ballBodies]);

        // 5. Mouse Interaction (จับโยนได้)
        const mouse = Mouse.create(sceneRef.current);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.12,
                damping: 0.1,
                render: { visible: false }
            }
        });
        World.add(engine.world, mouseConstraint);

        // บังคับปล่อยบอลทันทีเมื่อ mouseup
        Events.on(mouseConstraint, 'mouseup', () => {
            mouseConstraint.constraint.bodyB = null;
        });

        // เพิ่มแรงปาเมื่อปล่อย
        Events.on(mouseConstraint, 'enddrag', (e: any) => {
            const body = e.body;
            if (!body) return;

            Matter.Body.applyForce(body, body.position, {
                x: body.velocity.x * 0.003,
                y: body.velocity.y * 0.003
            });
        });



        // 6. Runner Loop
        const runner = Runner.create();
        Runner.run(runner, engine);
        engineRef.current = engine;

        // 7. Sync Physics to React State (Update Position for Rendering)
        // เราใช้ Events.on 'afterUpdate' เพื่อดึงค่า x,y มาวาด div เอง (จะได้ใส่ CSS สวยๆ ได้)
        const updateLoop = () => {
            const newBalls = ballBodies.map((body, index) => {
                // ✅ ดึงข้อมูลของคนนี้ออกมา
                const data = envelopeData[index];
                // ✅ หา Theme Object จากชื่อ theme_name (ถ้าหาไม่เจอใช้ค่าแรก)
                const matchedTheme = THEMES.find(t => t.name === data.theme_name) || THEMES[0];

                return {
                    id: body.id,
                    color: CUTE_COLOR_MAP[data.envelope_id] || '#e2e8f0',
                    x: body.position.x,
                    y: body.position.y,
                    angle: body.angle,
                    sender: data.sender_nickname || 'Anonymous', // ✅ ใส่ชื่อ
                    theme: matchedTheme // ✅ ใส่ธีม
                };
            });
            setBalls(newBalls);
        };

        Events.on(engine, 'afterUpdate', updateLoop);

        // Cleanup
        return () => {
            Runner.stop(runner);
            World.clear(engine.world, false);
            Engine.clear(engine);
            Events.off(engine, 'afterUpdate', updateLoop);
            Events.off(mouseConstraint, 'mouseup');
            Events.off(mouseConstraint, 'enddrag');
        };
    }, [envelopeData]);

    return (
        <div ref={sceneRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
            {balls.map((ball) => (
                <div
                    key={ball.id}
                    className="group absolute w-[60px] h-[60px] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
                    style={{
                        transform: `translate3d(${ball.x - BALL_RADIUS}px, ${ball.y - BALL_RADIUS}px, 0) rotate(${ball.angle}rad)`,
                        width: BALL_RADIUS * 2,
                        height: BALL_RADIUS * 2,
                    }}
                >
                    {/* ✨ Visual Style: เหมือนหน้า SuccessMailbox */}
                    <div className="absolute inset-0 rounded-full"
                        style={{
                            backgroundImage: `repeating-linear-gradient(45deg, ${ball.color}, ${ball.color} 2px, transparent 2px, transparent 6px)`,
                            transform: 'scale(0.85)',
                            filter: 'blur(0.5px)'
                        }}
                    />
                    <div className="absolute inset-0 rounded-full"
                        style={{
                            border: '2px solid rgba(45, 45, 45, 0.1)', // ขอบจางๆ
                            boxShadow: `inset 0 0 10px rgba(255,255,255,0.4)`
                        }}
                    />

                    <div
                        className={`
                            absolute -top-10 left-1/2 -translate-x-1/2 
                            px-3 py-1.5 rounded-lg shadow-lg 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                            pointer-events-none whitespace-nowrap z-50
                            text-xs font-bold font-ibm-plex border border-black/10 select-none
                            ${ball.theme.bg} ${ball.theme.text} 
                        `}
                    >
                        {ball.sender}
                        {/* สามเหลี่ยมชี้ลงเล็กๆ */}
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-current ${ball.theme.text} opacity-20`} />
                    </div>

                </div>
            ))}
        </div>
    );
}