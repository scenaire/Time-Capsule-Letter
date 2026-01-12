"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RefreshCw, Stamp, Palette, RotateCcw } from 'lucide-react';
import LoginButton from '@/components/LoginButton';

import { FONTS } from '@/styles/fonts';
import { THEMES as BASE_THEMES } from '@/styles/themes';
import { EnvelopeBack, EnvelopeFront, EnvelopeFlap, EnvelopeSecond, EnvelopeFlapClose } from '@/components/EnvelopeSVGs';

/* --- 🕯️ CONFIG: รายการ Wax Seals --- */
// Nair สามารถเพิ่มรูป Seal อื่นๆ ลงใน array นี้ได้เลยค่ะ
const SEALS = [
  { id: 'leaf', src: '/images/seals/seal-leaf.png', name: 'Autumn Leaf' }, // 👈 เอารูปที่อัปโหลดไปวาง path นี้นะคะ
  // { id: 'rose', src: '/images/seals/seal-rose.png', name: 'Rose' },
  // { id: 'heart', src: '/images/seals/seal-heart.png', name: 'Heart' },
];

const THEMES = BASE_THEMES.map(t => {
  let env = '#4B1D10';
  let envFront = '#62231E';
  let envSecond = '#783D2E';

  if (t.name === 'Classic Cocoa') {
    env = '#4B1D10'; envFront = '#62231E'; envSecond = '#E5D0BA';
  } else if (t.name === 'Carbon Fiber') {
    env = '#1A1A1A'; envFront = '#2C2C2C'; envSecond = '#404040';
  }
  return { ...t, env, envFront, envSecond };
});

export default function TimeCapsuleFinal() {
  const [postcard, setPostcard] = useState({ sender: '', message: '', fontIdx: 0, themeIdx: 0 });
  const [isSent, setIsSent] = useState(false);
  const [isFolding, setIsFolding] = useState(false);
  const [foldStep, setFoldStep] = useState(0); // 0:Open, 1:Sliding, 2:Closed (Ready to Seal)
  const [readyToSeal, setReadyToSeal] = useState(false);

  /* 🔴 New State: สำหรับเก็บ Seal ที่เลือก */
  const [selectedSeal, setSelectedSeal] = useState<string | null>(null);

  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { status } = useSession();
  const router = useRouter();

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setIsAtTop(scrollTop <= 5);
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 5);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (textareaRef.current && scrollRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      if (textareaRef.current.selectionStart >= postcard.message.length) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      checkScroll();
    }
  }, [postcard.message]);

  if (status === "loading") return null;

  const currentTheme = THEMES[postcard.themeIdx];
  const currentFont = FONTS[postcard.fontIdx];

  const cycle = (key: string, list: any[]) => {
    setPostcard(prev => ({ ...prev, [key]: (Number(prev[key as keyof typeof prev]) + 1) % list.length }));
  };

  const startFoldingRitual = () => {
    setIsFolding(true);
    setFoldStep(0);
    setSelectedSeal(null); // Reset Seal
    setReadyToSeal(false);
  };

  const cancelFolding = () => {
    setIsFolding(false);
    setFoldStep(0);
    setSelectedSeal(null);
    setReadyToSeal(false);
  };

  /* 🔴 Update: แค่ปิดซองเฉยๆ ยังไม่ส่ง (Waiting for Wax Seal) */
  const handleCloseEnvelope = () => {
    setFoldStep(1); // เริ่มเลื่อนจดหมายลง

    // รอเลื่อนเสร็จ (2 วินาที)
    setTimeout(() => {
      setFoldStep(2); // สั่งปิดฝา (อนิเมชั่นเริ่มหมุนตรงนี้ ใช้เวลา 1.5 วิ)

      // 🔴 เพิ่ม: รออีก 1.5 วินาที (เท่ากับเวลาหมุนฝา) แล้วค่อยบอกว่าพร้อม Seal
      setTimeout(() => {
        setReadyToSeal(true);
      }, 1500);

    }, 2000);
  };

  /* 🔴 New Function: เมื่อเลือก Seal แล้วทำการประทับตรา */
  const handleApplySeal = (sealId: string) => {
    setSelectedSeal(sealId);

    // รอ Animation ประทับตราเสร็จ (สมมติ 1.5 วิ) แล้วค่อยไปหน้า Success
    setTimeout(() => {
      setIsSent(true);
    }, 1500);
  };

  return (
    <main className={`h-screen w-full flex items-center justify-center overflow-hidden p-4 transition-colors duration-700 ${currentTheme.pageBg}`} style={{ perspective: '2000px' }}>
      <LoginButton />
      <AnimatePresence mode="wait">
        {!isSent ? (
          <motion.div
            key="letter-container"
            animate={{ scale: isFolding ? 0.9 : 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`relative w-full max-w-xl h-fit max-h-[70vh] flex flex-col transition-all duration-1000 ${isFolding ? 'bg-transparent shadow-none' : `${currentTheme.bg} shadow-2xl postage-edge`} ${currentTheme.text}`}
            style={{ transformStyle: 'preserve-3d', fontFamily: `var(--${currentFont.id})` }}
          >

            {/* --- 🦌 ZONE ENVELOPE --- */}
            {isFolding && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">

                <div className="relative w-full max-w-lg aspect-[1001/1083] overflow-hidden rounded-b-[40px]">

                  {/* Layer 1: Back */}
                  <EnvelopeBack color={currentTheme.env} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

                  {/* Layer 2: Flap (Open) */}
                  <div className={`absolute inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-0 ${foldStep >= 2 ? 'opacity-0' : 'opacity-100'}`}>
                    <EnvelopeFlap color={currentTheme.env} className="absolute inset-0 w-full h-full" />
                  </div>

                  {/* Layer 3: Letter */}
                  <motion.div
                    onClick={foldStep === 0 ? cancelFolding : undefined}
                    className={`absolute left-[10%] right-[10%] z-10 ${currentTheme.bg} ${currentTheme.text} shadow-sm flex flex-col items-start cursor-pointer hover:brightness-95 pointer-events-auto`}
                    initial={{ top: "12%", height: "85%" }}
                    animate={{ top: foldStep >= 1 ? "50%" : "12%" }}
                    transition={{ duration: 2.0, ease: [0.42, 0, 0.58, 1] }}
                  >
                    <div className="w-full h-full p-6 md:p-8 flex flex-col overflow-hidden relative pointer-events-none">
                      <div className="w-full h-full flex flex-col gap-4">
                        <div className="flex-1 w-full overflow-hidden min-h-0 relative text-left">
                          <p className={`whitespace-pre-wrap leading-relaxed ${currentFont.size} opacity-85 break-words`}>
                            {postcard.message || "..."}
                          </p>
                        </div>
                        <div className="mt-auto pt-4 text-right opacity-75 shrink-0 border-t border-current/10 w-full">
                          <p className={`${currentFont.senderText} uppercase tracking-widest text-[10px]`}>Sent with love by</p>
                          <p className={`${currentFont.senderSize} mt-1`}>{postcard.sender}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Layer 4 & 5: Second + Front */}
                  <EnvelopeSecond secondColor={currentTheme.envSecond} className="absolute inset-0 w-full h-full z-20 pointer-events-none" />
                  <EnvelopeFront frontColor={currentTheme.envFront} className="absolute inset-0 w-full h-full z-30 pointer-events-none" />

                  {/* Layer 6: Flap Close */}
                  <motion.div
                    className="absolute inset-0 w-full h-full origin-[50%_46.53%]"
                    initial={{ rotateX: 0, opacity: 0, z: 0 }}
                    animate={{
                      rotateX: foldStep >= 2 ? -180 : 0,
                      opacity: foldStep >= 2 ? 1 : 0,
                      zIndex: 40,
                      // 🔴 FIX: เปลี่ยนจาก 1 เป็น -1 (เพราะแกนกลับทิศตอนหมุน)
                      z: foldStep >= 2 ? -1 : 0
                    }}
                    transition={{
                      rotateX: { duration: 1.5, ease: "easeInOut" },
                      opacity: { duration: 0 },
                      zIndex: { duration: 0 },
                      z: { duration: 0 }
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <EnvelopeFlap color={currentTheme.env} className="absolute inset-0 w-full h-full pointer-events-none" />
                  </motion.div>

                  {/* 🔴 Layer 7: Final Wax Seal (แยกออกมาอยู่ layer บนสุด) */}
                  <AnimatePresence>
                    {selectedSeal && (
                      <motion.div
                        key="final-seal-container"
                        className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
                      >
                        <motion.img
                          src={SEALS.find(s => s.id === selectedSeal)?.src}
                          initial={{ scale: 2, opacity: 0 }} // เริ่มแบบใหญ่ๆ จางๆ
                          animate={{ scale: 1, opacity: 1 }} // ประทับลงมาขนาดจริง
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            mass: 0.8
                          }}
                          className="w-24 h-24 object-contain drop-shadow-2xl"
                          style={{
                            // จัดตำแหน่งให้อยู่ตรงกลางสามเหลี่ยมด้านล่างพอดี
                            // (ปรับค่า marginTop ได้ถ้าอยากให้ขยับขึ้นลง)
                            marginTop: '80%'
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* 🔴 UI Step 1: ปุ่มปิดซอง (แสดงตอนแรก) */}
                {foldStep === 0 && (
                  <div className="absolute -right-24 md:-right-32 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                    <motion.button
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCloseEnvelope}
                      className={`${currentTheme.bg} ${currentTheme.text} p-4 rounded-full shadow-lg flex flex-col items-center gap-2 pointer-events-auto border-2 border-[#E5D0BA]/20`}
                    >
                      <Stamp size={28} />
                      <span className="text-[12px] font-bold tracking-widest uppercase whitespace-nowrap">Fold It</span>
                    </motion.button>

                    {/* ปุ่ม Undo */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      whileHover={{ opacity: 1, scale: 1.1 }}
                      onClick={cancelFolding}
                      className="p-3 bg-white/20 rounded-full backdrop-blur-sm self-center pointer-events-auto text-cowhide-cocoa"
                    >
                      <RotateCcw size={20} />
                    </motion.button>
                  </div>
                )}

                {/* 🔴 UI Step 2: ถาดเลือก Wax Seal (แสดงเมื่อพับซองเสร็จ และยังไม่ได้เลือก) */}
                {readyToSeal && !selectedSeal && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 pointer-events-auto shadow-2xl z-[60]"
                  >
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-white font-ibm-plex text-sm uppercase tracking-widest drop-shadow-md whitespace-nowrap">
                      Select a Seal to Finish
                    </span>

                    {SEALS.map((seal) => (
                      <motion.button
                        key={seal.id}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleApplySeal(seal.id)}
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/30 transition-all flex items-center justify-center border border-white/20 shadow-lg relative group"
                      >
                        {/* รูป Preview Seal */}
                        <img src={seal.src} alt={seal.name} className="w-12 h-12 object-contain drop-shadow-md" />
                      </motion.button>
                    ))}
                  </motion.div>
                )}

              </div>
            )}

            {/* --- ส่วน Editor (เหมือนเดิม) --- */}
            <div className={`flex-1 flex flex-col overflow-hidden z-10 transition-opacity duration-500 ${isFolding ? 'opacity-0 pointer-events-none' : 'opacity-100'} pt-12 pb-6`}>
              <div ref={scrollRef} onScroll={checkScroll} className="flex-1 overflow-y-auto no-scrollbar px-10 md:px-14 pt-4 pb-8 relative" style={{ maskImage: `linear-gradient(to bottom, ${isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${isAtBottom ? 'black' : 'transparent'} 100%)`, WebkitMaskImage: `linear-gradient(to bottom, ${isAtTop ? 'black' : 'transparent'} 0%, black 15%, black 85%, ${isAtBottom ? 'black' : 'transparent'} 100%)` }}>
                <textarea ref={textareaRef} placeholder="เขียนถึงตัวคุณในปี 2027..." value={postcard.message} onChange={(e) => setPostcard({ ...postcard, message: e.target.value })} className={`w-full bg-transparent border-none outline-none resize-none leading-relaxed overflow-hidden transition-all duration-300 ${currentFont.size} ${currentTheme.placeholder}`} disabled={isFolding} />
              </div>
              <div className="px-10 md:px-14 pb-10 flex flex-col items-end shrink-0">
                <span className={`${currentFont.senderText} uppercase tracking-[0.9em] opacity-85 mb-1`}>Sender:</span>
                <input className={`bg-transparent border-b border-current outline-none text-right w-full max-w-[200px] ${currentFont.senderSize} ${currentTheme.placeholder}`} value={postcard.sender} onChange={(e) => setPostcard({ ...postcard, sender: e.target.value })} disabled={isFolding} />
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center text-cowhide-cocoa font-ibm-plex">
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Archived successfully.</h2>
            <p className="mt-2 opacity-60">ความทรงจำถูกปิดผนึกไว้แล้ว พบกันในปี 2027 ค่ะ</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSent && !isFolding && (
        <div className="fixed bottom-8 flex gap-4 p-2 bg-white/40 backdrop-blur-xl rounded-full shadow-xl border border-white/20 z-50">
          <button onClick={() => cycle('fontIdx', FONTS)} className="p-4 hover:bg-white/50 rounded-full transition-all text-cowhide-cocoa"><RefreshCw size={20} /></button>
          <button onClick={() => cycle('themeIdx', THEMES)} className="p-4 hover:bg-white/50 rounded-full transition-all text-cowhide-cocoa"><Palette size={20} /></button>
          <button onClick={startFoldingRitual} disabled={!postcard.message} className={`px-8 ${currentTheme.bg} ${currentTheme.text} rounded-full font-bold hover:scale-105 active:scale-95 transition-all font-ibm-plex uppercase tracking-widest text-xs disabled:opacity-50`}>
            ส่งข้อความ
          </button>
        </div>
      )}
    </main>
  );
}