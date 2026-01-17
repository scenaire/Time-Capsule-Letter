"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from "next/navigation";

// Hooks
import { usePostcardForm } from '@/hooks/usePostcardForm';
import { useEnvelopeAnimation } from '@/hooks/useEnvelopeAnimation';

// Components
import LoginButton from '@/components/common/LoginButton';
import { EnvelopeContainer } from '@/components/envelope/EnvelopeContainer';
import { LetterEditor } from '@/components/letter/LetterEditor';
import { ControlPanel } from '@/components/letter/ControlPanel';

export default function TimeCapsulePage() {
  const router = useRouter();

  // 1. Data Logic (Sender, Message, Theme, Font)
  const {
    postcard,
    updateField,
    cycleFont,
    cycleTheme,
    cycleEnvelope,
    currentTheme,
    currentFont,
    currentEnvelope
  } = usePostcardForm();

  // 2. Animation Logic (Folding, Sealing)
  const {
    isFolding,
    foldStep,
    isReadyToSeal,
    selectedSeal,
    isSent,
    startFolding,
    cancelFolding,
    handleCloseEnvelope,
    handleApplySeal
  } = useEnvelopeAnimation();

  // 3. UI Local State
  const [isTyping, setIsTyping] = useState(false);

  // Effect: Redirect after sending
  useEffect(() => {
    if (isSent) {
      const themeColor = currentTheme.name.toLowerCase();
      const timeout = setTimeout(() => {
        router.push(`/archived?theme=${themeColor}`);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isSent, currentTheme, router]);

  // Styles
  const dotColor = currentTheme.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <main
      className={`h-screen w-full flex items-center justify-center overflow-hidden p-4 transition-colors duration-700 ${currentTheme.pageBg}`}
      style={{
        perspective: '2000px',
        backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px'
      }}
    >
      <LoginButton />

      <AnimatePresence mode="wait">
        {!isSent ? (
          <motion.div
            key="letter-container"
            animate={{ scale: isFolding ? 0.9 : 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`relative w-full max-w-xl h-fit max-h-[70vh] flex flex-col transition-all duration-1000 
                            ${isFolding ? 'bg-transparent shadow-none' : `${currentTheme.bg} shadow-2xl postage-edge`} 
                            ${currentTheme.text}`}
            style={{ transformStyle: 'preserve-3d', fontFamily: `var(--${currentFont.id})` }}
          >
            {/* 3D Envelope Animation Layer */}
            {isFolding && (
              <EnvelopeContainer
                envelope={currentEnvelope}
                theme={currentTheme}
                font={currentFont}
                postcard={postcard}
                foldStep={foldStep}
                selectedSeal={selectedSeal}
                readyToSeal={isReadyToSeal}
                onCloseEnvelope={handleCloseEnvelope}
                onApplySeal={handleApplySeal}
                onCancel={cancelFolding}
                onCycleEnvelope={cycleEnvelope}
              />
            )}

            {/* Editor Layer */}
            <LetterEditor
              postcard={postcard}
              theme={currentTheme}
              font={currentFont}
              isFolding={isFolding}
              onUpdatePostcard={updateField}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
            />

          </motion.div>
        ) : (
          // Success State (Sealing...)
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center font-ibm-plex text-xl opacity-60 ${currentTheme.text}`}
          >
            Sealing your memory...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel (Hide when typing or folding) */}
      {!isSent && !isFolding && (
        <div
          className={`absolute bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-300 
                    ${isTyping ? 'translate-y-[200%] md:translate-y-0' : 'translate-y-0'}`}
        >
          <div className="pointer-events-auto">
            <ControlPanel
              theme={currentTheme}
              font={currentFont}
              isMessageEmpty={!postcard.message}
              onCycleFont={cycleFont}
              onCycleTheme={cycleTheme}
              onStartFolding={startFolding}
            />
          </div>
        </div>
      )}
    </main>
  );
}