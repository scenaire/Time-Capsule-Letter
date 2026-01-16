"use client";

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import LoginButton from '@/components/LoginButton';
import { useLetterLogic } from '@/hooks/useLetterLogic';
import { EnvelopeContainer } from '@/components/EnvelopeContainer';
import { LetterEditor } from '@/components/LetterEditor';
import { ControlPanel } from '@/components/ControlPanel';

// 🌑 Dark Theme List (อ้างอิงจาก themes.ts)
// พื้นหลังเหล่านี้ถือว่าเป็น "สีเข้ม" -> Dots สีขาว
const DARK_THEME_BGS = [
  'bg-sapphire',        // Royal Blue
  'bg-spanish-bistre',  // Pink Pop! (Darkish)
  'bg-pine-tree',       // Fresh Orange (Background is Dark Green)
  'bg-claret',          // Red Wine
  'bg-dark-charcoal'    // Eggplant
];

export default function TimeCapsulePage() {
  const router = useRouter();
  const {
    state,
    actions,
    refs,
    derived
  } = useLetterLogic();

  // 1. Theme Logic: เช็คว่าเป็นธีมสีเข้มหรือไม่
  const isDarkTheme = DARK_THEME_BGS.includes(derived.currentTheme.pageBg);

  // 2. Dot Pattern Logic: กำหนดสีจุดตามความเข้มของพื้นหลัง
  const dotColor = isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

  useEffect(() => {
    if (state.isSent) {
      // เพราะ TypeScript ฟ้องว่าไม่มี id ใน Type นี้
      // สมมติว่า name คือ "Red", "Blue" -> แปลงเป็น "red", "blue"
      const themeColor = derived.currentTheme.name.toLowerCase();

      // หน่วงเวลาแป๊บนึง (0.5วิ) ให้ความรู้สึกว่าซีลปิดสนิทแล้วค่อยเด้ง
      const timeout = setTimeout(() => {
        router.push(`/archived?theme=${themeColor}`);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [state.isSent, derived.currentTheme, router]);

  if (state.status === "loading") return null;

  return (
    <main
      className={`h-screen w-full flex items-center justify-center overflow-hidden p-4 transition-colors duration-700 ${derived.currentTheme.pageBg}`}
      style={{
        perspective: '2000px',
        // 2. Dot Pattern Background (ใส่ลายจุดที่นี่)
        backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px'
      }}
    >
      <LoginButton />

      <AnimatePresence mode="wait">
        {!state.isSent ? (
          <motion.div
            key="letter-container"
            animate={{ scale: state.isFolding ? 0.9 : 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`relative w-full max-w-xl h-fit max-h-[70vh] flex flex-col transition-all duration-1000 
              ${state.isFolding ? 'bg-transparent shadow-none' : `${derived.currentTheme.bg} shadow-2xl postage-edge`} 
              ${derived.currentTheme.text}`}
            style={{ transformStyle: 'preserve-3d', fontFamily: `var(--${derived.currentFont.id})` }}
          >
            {/* 3D Envelope Animation */}
            {state.isFolding && (
              <EnvelopeContainer
                envelope={derived.currentEnvelope} // ซอง (เอาสี env)
                theme={derived.currentTheme}
                font={derived.currentFont}
                postcard={state.postcard}
                foldStep={state.foldStep}
                selectedSeal={state.selectedSeal}
                readyToSeal={state.readyToSeal}
                onCloseEnvelope={actions.handleCloseEnvelope}
                onApplySeal={actions.handleApplySeal}
                onCancel={actions.cancelFolding}
                onCycleEnvelope={actions.cycleEnvelope}
              />
            )}

            {/* Text Editor Area */}
            <LetterEditor
              scrollRef={refs.scrollRef}
              textareaRef={refs.textareaRef}

              postcard={state.postcard}
              theme={derived.currentTheme}
              font={derived.currentFont}
              isFolding={state.isFolding}
              scrollState={state.scrollState}
              onUpdatePostcard={actions.updatePostcard}
              onScroll={actions.handleScroll}
            />

          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center font-ibm-plex text-xl opacity-60 ${derived.currentTheme.text}`}
          >
            Sealing your memory...
          </motion.div>
        )}
      </AnimatePresence>

      {!state.isSent && !state.isFolding && (
        <ControlPanel
          theme={derived.currentTheme}
          isMessageEmpty={!state.postcard.message}
          onCycleFont={actions.cycleFont}
          onCycleTheme={actions.cycleTheme}

          onStartFolding={actions.startFoldingRitual}
        />
      )}
    </main>
  );
}