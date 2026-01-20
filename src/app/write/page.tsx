"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import { AlertCircle, FileText, Database } from 'lucide-react'; // Icons

// Tiptap Imports ✨
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';

// Hooks (ใช้ตัวใหม่)
import { useLetterLogic } from '@/hooks/useLetterLogic';

// Components
import LoginButton from '@/components/common/LoginButton';
import { EnvelopeContainer } from '@/components/envelope/EnvelopeContainer';
import { LetterEditor } from '@/components/letter/LetterEditor';
import { ControlPanel } from '@/components/letter/ControlPanel';
import { SubmissionError } from '@/components/feedback/SubmissionError';

export default function TimeCapsulePage() {
  const router = useRouter();

  // 1. Data & Animation Logic (รวมร่างใน Hook เดียวแล้ว)
  const { state, actions, derived } = useLetterLogic();

  const {
    postcard, isFolding, foldStep, readyToSeal, selectedSeal,
    isSent, isLoading, isError, isConflict
  } = state;

  const { currentTheme, currentFont, currentEnvelope } = derived;

  // UI Local State
  const [isTyping, setIsTyping] = useState(false);

  // ✨ 2. Setup Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false, // ✅ กัน Error SSR
    extensions: [
      StarterKit.configure({
        paragraph: { HTMLAttributes: { class: 'leading-relaxed mb-4' } },
        heading: { levels: [1, 2, 3] },
        dropcursor: { color: '#555', width: 2 },
        gapcursor: false,
      }),
      Underline,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'เขียนถึงตัวคุณในปี 2027...',
        emptyEditorClass: 'is-editor-empty',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['center', 'left'],
      }),
    ],
    content: postcard.message,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose focus:outline-none w-full max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      actions.updatePostcard('message', editor.getHTML());
    },
  });

  // ✨ Sync DB Content to Editor (เมื่อโหลดเสร็จ หรือเปลี่ยน Draft)
  useEffect(() => {
    if (editor && postcard.message && !editor.isFocused) {
      if (editor.getHTML() !== postcard.message) {
        editor.commands.setContent(postcard.message);
      }
    }
  }, [isLoading, postcard.message, editor, isConflict]); // เพิ่ม isConflict เพื่อให้มันไม่อัปเดตตอนกำลังเลือก

  // Effect: Redirect after sending
  useEffect(() => {
    if (isSent) {
      const envId = currentEnvelope.id;
      const timeout = setTimeout(() => {
        router.push(`/archived?envelope=${envId}`); // ✅ ไปหน้า Archive
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isSent, currentEnvelope, router]);

  // Styles
  const dotColor = currentTheme.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

  // Loading View
  if (isLoading) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center font-adelia ${currentTheme.bg} ${currentTheme.text}`}>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          Loading memories...
        </motion.div>
      </div>
    );
  }

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

      {/* ✅ Error Overlay */}
      <AnimatePresence>
        {isError && (
          <SubmissionError
            onRetry={() => actions.resetError()}
            onClose={() => actions.resetError()}
          />
        )}
      </AnimatePresence>

      {/* ✅ Draft Conflict Modal (Handrawn Style) */}
      <AnimatePresence>
        {isConflict && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#fdfbf7] p-8 max-w-md w-full text-center relative shadow-2xl"
              style={{
                borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                border: "3px solid #2d2d2d"
              }}
            >
              <div className="flex justify-center mb-4 text-[#ffcc00]">
                <AlertCircle size={48} />
              </div>
              <h2 className="font-adelia text-2xl md:text-3xl text-[#2d2d2d] mb-4">
                Found a Lost Page
              </h2>
              <p className="font-ibm-plex text-[#2d2d2d]/70 mb-8 leading-relaxed">
                เราเจอข้อความที่คุณเขียนค้างไว้ในเครื่องนี้ (Local Draft)
                แต่มันไม่ตรงกับข้อมูลล่าสุดที่คุณเคยบันทึกไว้ (Cloud)
                <br /><br />
                <span className="font-bold text-[#2d2d2d]">คุณอยากใช้ฉบับไหน?</span>
              </p>

              <div className="flex flex-col gap-3">
                {/* Use Local Draft */}
                <button
                  onClick={() => actions.resolveConflict(true)}
                  className="group flex items-center justify-center gap-3 px-6 py-3 bg-[#2d2d2d] text-white font-bold rounded-lg hover:scale-[1.02] transition-transform font-ibm-plex"
                >
                  <FileText size={20} />
                  <span>ใช้ฉบับในเครื่องนี้ (Local Draft)</span>
                </button>

                {/* Use Database (Discard Local) */}
                <button
                  onClick={() => actions.resolveConflict(false)}
                  className="group flex items-center justify-center gap-3 px-6 py-3 bg-transparent border-2 border-[#2d2d2d]/20 text-[#2d2d2d] font-bold rounded-lg hover:bg-[#2d2d2d]/5 transition-colors font-ibm-plex"
                >
                  <Database size={20} />
                  <span>ใช้ฉบับล่าสุดจาก Cloud</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                readyToSeal={readyToSeal}
                onCloseEnvelope={actions.handleCloseEnvelope}
                onApplySeal={actions.handleApplySeal} // ✅ ยิงเข้า DB
                onCancel={actions.cancelFolding}
                onCycleEnvelope={actions.cycleEnvelope}
              />
            )}

            {/* Editor Layer */}
            <LetterEditor
              editor={editor}
              postcard={postcard}
              theme={currentTheme}
              font={currentFont}
              isFolding={isFolding}
              onUpdatePostcard={actions.updatePostcard}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
            />

          </motion.div>
        ) : (
          // Success State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // ✅ แก้ตรงนี้: เช็ค isDark -> ถ้าจริงใช้สีขาว, ถ้าเท็จใช้สีดำเข้ม (#2d2d2d)
            className={`text-center font-adelia select-none text-3xl opacity-60 ${currentTheme.isDark ? 'text-[#fffdf0]' : 'text-[#1f1512]'
              }`}
          >
            Sealing your memory...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel */}
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
            onCycleFont={actions.cycleFont}
            onCycleTheme={actions.cycleTheme}
            onStartFolding={actions.startFoldingRitual}
          />
        </div>
      )}
    </main>
  );
}