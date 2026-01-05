"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Stamp, Palette, Heart } from 'lucide-react';

const THEMES = [
  { name: 'Classic Cocoa', bg: 'bg-cowhide-cocoa', text: 'text-golden-batter', placeholder: 'placeholder:text-golden-batter/40' },
  { name: 'Warm Golden', bg: 'bg-golden-batter', text: 'text-spiced-wine', placeholder: 'placeholder:text-spiced-wine/40' },
  { name: 'Vintage Paper', bg: 'bg-[#FDFBF7]', text: 'text-cowhide-cocoa', placeholder: 'placeholder:text-cowhide-cocoa/40' },
  { name: 'Avocado Toast', bg: 'bg-olive-harvest', text: 'text-cowhide-cocoa', placeholder: 'placeholder:text-cowhide-cocoa/40' },
];

const FONTS = [
  { id: 'font-oumin', name: 'Oumin Everyday' },
  { id: 'font-pani', name: 'PANI New Year' },
];

export default function TimeCapsuleFinal() {
  const [postcard, setPostcard] = useState({
    sender: '',
    message: '',
    fontIdx: 0,
    themeIdx: 0,
    stamp: 'wax'
  });
  const [isSent, setIsSent] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ฟังก์ชันคำนวณความสูงให้ TextArea ขยายตามเนื้อหา
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [postcard.message]);

  const currentTheme = THEMES[postcard.themeIdx];
  const currentFont = FONTS[postcard.fontIdx];

  const cycle = (key: string, list: any[]) => {
    setPostcard(prev => ({
      ...prev,
      [key]: (Number(prev[key as keyof typeof prev]) + 1) % list.length
    }));
  };

  return (
    <main className="h-screen w-full flex items-center justify-center bg-[#F7F5F2] overflow-hidden p-4">
      <AnimatePresence mode="wait">
        {!isSent ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            // ล็อคความสูงที่ 85vh ชัดเจน
            className={`
            relative w-full max-w-xl h-fit max-h-[70vh] postage-edge shadow-2xl flex flex-col
            ${currentTheme.bg} ${currentTheme.text} transition-colors duration-500
          `}
            style={{ fontFamily: `var(--${currentFont.id})` }}
          >
            <div className="absolute -top-10 left-0 w-full flex justify-between px-2 text-[10px] uppercase tracking-[0.2em] text-cowhide-cocoa font-bold opacity-40">
              <span>Font: {currentFont.name}</span>
              <span>Theme: {currentTheme.name}</span>
            </div>

            {/* เพิ่ม pb-40 เพื่อให้ข้อความบรรทัดสุดท้ายอยู่เหนือแผงปุ่มกดเสมอ */}
            <div className="flex-1 overflow-y-auto no-scrollbar soft-fade-mask p-10 md:p-14 pb-40">
              <div className="absolute top-10 right-10 opacity-80 z-10 pointer-events-none">
                {postcard.stamp === 'wax' ? (
                  <Heart size={48} className="fill-current" />
                ) : (
                  <div className="border-4 border-double border-current p-2 text-[10px] rotate-12 font-mono">
                    2026<br />POST
                  </div>
                )}
              </div>

              <textarea
                ref={textareaRef}
                placeholder="เขียนถึงตัวคุณในปี 2027..."
                className={`w-full bg-transparent border-none outline-none resize-none text-xl md:text-2xl leading-relaxed overflow-hidden ${currentTheme.placeholder}`}
                value={postcard.message}
                onChange={(e) => setPostcard({ ...postcard, message: e.target.value })}
              />

              <div className="mt-10 flex flex-col items-end">
                <span className="text-xs uppercase tracking-[0.9em] opacity-85 mb-1">Sender:</span>
                <input
                  className={`bg-transparent border-b border-current outline-none text-right text-2xl w-full max-w-[200px] opacity-60 ${currentTheme.placeholder}`}
                  value={postcard.sender}
                  onChange={(e) => setPostcard({ ...postcard, sender: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-cowhide-cocoa">
            <h2 className="text-3xl font-bold font-ibm-plex">บันทึกเรียบร้อย</h2>
            <p className="mt-2 opacity-60 font-ibm-plex">เจอกันในปี 2027 ค่ะ</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toolbar */}
      {!isSent && (
        <div className="fixed bottom-8 flex gap-4 p-2 bg-white/40 backdrop-blur-xl rounded-full shadow-xl border border-white/20 z-50">
          <button onClick={() => cycle('fontIdx', FONTS)} className="p-4 hover:bg-white/50 rounded-full transition-all text-cowhide-cocoa"><RefreshCw size={20} /></button>
          <button onClick={() => cycle('themeIdx', THEMES)} className="p-4 hover:bg-white/50 rounded-full transition-all text-cowhide-cocoa"><Palette size={20} /></button>
          <button onClick={() => setPostcard(p => ({ ...p, stamp: p.stamp === 'wax' ? 'date' : 'wax' }))} className="p-4 hover:bg-white/50 rounded-full transition-all text-cowhide-cocoa"><Stamp size={20} /></button>
          <button onClick={() => setIsSent(true)} className="px-8 bg-cowhide-cocoa text-golden-batter rounded-full font-bold hover:scale-105 active:scale-95 transition-all font-ibm-plex uppercase tracking-widest text-xs">ส่งข้อความ</button>
        </div>
      )}
    </main>
  );

}