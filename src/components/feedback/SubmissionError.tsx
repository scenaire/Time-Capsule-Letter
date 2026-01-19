import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, XCircle } from 'lucide-react';

interface SubmissionErrorProps {
    onRetry: () => void;
    onClose: () => void;
}

export const SubmissionError = ({ onRetry, onClose }: SubmissionErrorProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#fdfbf7]/95 backdrop-blur-sm text-[#2d2d2d]"
        >
            {/* Background Pattern (เหมือน Archive) */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(#d1ccc0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative max-w-md w-full text-center"
            >
                {/* 🎨 Illustration: น้องจดหมายป่วย (Doodle) */}
                <motion.div
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6 relative inline-block"
                >
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff4d4d]">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <path d="M22 6l-10 7L2 6" />
                        {/* Bandage (พลาสเตอร์ยา) */}
                        <path d="M9 14l6-6" strokeWidth="2" stroke="#2d2d2d" />
                        <path d="M10.5 9.5l3 3" strokeWidth="2" stroke="#2d2d2d" />
                    </svg>
                    {/* เหงื่อตก */}
                    <motion.div
                        animate={{ y: [0, 5, 0], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute -right-2 top-0 text-[#68A6B2]"
                    >
                        <span className="text-2xl">💧</span>
                    </motion.div>
                </motion.div>

                {/* Typography */}
                <h2 className="font-adelia text-4xl md:text-5xl text-[#2d2d2d] mb-4 rotate-[-1deg]">
                    Oops! <span className="text-[#ff4d4d]">Stuck?</span>
                </h2>

                <p className="font-ibm-plex text-lg text-[#2d2d2d]/70 mb-8 leading-relaxed">
                    ดูเหมือนจดหมายจะสะดุดระหว่างทาง <br />
                    (อาจจะเป็นที่อินเทอร์เน็ต หรือระบบกำลังงีบหลับ)
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-4 items-center">
                    {/* Retry Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRetry}
                        className="group relative flex items-center gap-3 px-8 py-4 bg-[#2d2d2d] text-white font-bold text-lg cursor-pointer shadow-lg"
                        style={{
                            borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                        }}
                    >
                        <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="font-ibm-plex tracking-wider uppercase">Try Sending Again</span>
                    </motion.button>

                    {/* Cancel Text Button */}
                    <button
                        onClick={onClose}
                        className="mt-2 text-sm text-[#2d2d2d]/40 font-ibm-plex hover:text-[#ff4d4d] hover:underline transition-colors flex items-center gap-2"
                    >
                        <XCircle size={16} />
                        ฉันขอแก้ข้อความก่อนนะ (Edit Draft)
                    </button>
                </div>

            </motion.div>
        </motion.div>
    );
};