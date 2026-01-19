"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from "next/navigation";

// Tiptap Imports ✨
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';

// Hooks
import { usePostcardForm } from '@/hooks/usePostcardForm';
import { useEnvelopeAnimation } from '@/hooks/useEnvelopeAnimation';

// Components
import LoginButton from '@/components/common/LoginButton';
import { EnvelopeContainer } from '@/components/envelope/EnvelopeContainer';
import { LetterEditor } from '@/components/letter/LetterEditor'; // ✅ อันใหม่ที่เราเพิ่งแก้
import { ControlPanel } from '@/components/letter/ControlPanel';

export default function TimeCapsulePage() {
  const router = useRouter();

  // 1. Data Logic
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

  // 2. Animation Logic
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
  const [, setForceUpdate] = useState(0);

  // ✨ 4. Setup Tiptap Editor
  // ✨ Setup Editor
  const editor = useEditor({
    immediatelyRender: false, // ✅ จุดสำคัญ! แก้ Error SSR ตรงนี้
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'เขียนถึงตัวคุณในปี 2027...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['center', 'left'], // justify คือ Thai Distributed
      }),
    ],
    content: postcard.message,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose focus:outline-none w-full max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      updateField('message', editor.getHTML());
    },

    onSelectionUpdate: () => {
      setForceUpdate((prev) => prev + 1);
    },
    // ✨ และตรงนี้: เพื่อความชัวร์ (ครอบคลุมการกด Bold/Italic แล้ว state เปลี่ยน)
    onTransaction: () => {
      setForceUpdate((prev) => prev + 1);
    }
  });

  // Effect: Redirect after sending
  useEffect(() => {
    if (isSent) {
      const envId = currentEnvelope.id;
      const timeout = setTimeout(() => {
        router.push(`/archived?theme=${envId}`);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isSent, currentEnvelope, router]);

  // Styles
  const dotColor = currentTheme.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <main
      className={`fixed inset-0 h-[100dvh] w-full flex items-center justify-center overflow-hidden p-4 transition-colors duration-700 overscroll-none ${currentTheme.pageBg}`}
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
            className={`relative w-full max-w-xl h-fit max-h-[85vh] md:max-h-[80vh] flex flex-col transition-all duration-1000 
                            ${isFolding ? 'bg-transparent shadow-none' : `${currentTheme.bg} shadow-2xl postage-edge`} 
                            ${currentTheme.text}`}
            style={{ transformStyle: 'preserve-3d', fontFamily: `var(--${currentFont.id})` }}
          >
            {/* 3D Envelope Layer */}
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
              editor={editor}
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
          // Success State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center font-ibm-plex text-xl opacity-60 ${currentTheme.text}`}
          >
            Sealing your memory...
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Control Panel: Logic ใหม่ */}
      {/* Mobile: ซ่อนตอนพิมพ์ | Desktop: แสดงตลอดเวลา */}
      {!isSent && !isFolding && (
        <div
          className={`absolute bottom-4 left-0 right-0 z-50 flex justify-center transition-all duration-300
                        ${isTyping
              ? 'opacity-0 translate-y-10 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto'
              : 'opacity-100 translate-y-0 pointer-events-auto'
            }
                    `}
        >
          <ControlPanel
            theme={currentTheme}
            font={currentFont}
            isMessageEmpty={!editor || editor.isEmpty}
            onCycleFont={cycleFont}
            onCycleTheme={cycleTheme}
            onStartFolding={startFolding}
          />
        </div>
      )}
    </main>
  );
}