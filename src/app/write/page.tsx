"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginButton from '@/components/LoginButton';
import { useLetterLogic } from '@/hooks/useLetterLogic';
import { EnvelopeContainer } from '@/components/EnvelopeContainer';
import { LetterEditor } from '@/components/LetterEditor';
import { ControlPanel } from '@/components/ControlPanel';
import { SuccessMessage } from '@/components/SuccessMessage';

export default function TimeCapsulePage() {
  const {
    state,
    actions,
    refs,
    derived
  } = useLetterLogic();

  if (state.status === "loading") return null;

  return (
    <main
      className={`h-screen w-full flex items-center justify-center overflow-hidden p-4 transition-colors duration-700 ${derived.currentTheme.pageBg}`}
      style={{ perspective: '2000px' }}
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
          <SuccessMessage textColor={derived.currentTheme.text} />
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