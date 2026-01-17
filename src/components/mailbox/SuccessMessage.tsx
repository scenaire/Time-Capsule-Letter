// src/components/SuccessMessage.tsx
import React from 'react';
import { motion } from 'framer-motion';

// รับ textColor เข้ามา
export const SuccessMessage = ({ textColor }: { textColor: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        // 🔴 เปลี่ยน class fix สี เป็นตัวแปร textColor ที่รับมา
        className={`text-center font-ibm-plex ${textColor}`}
    >
        <h2 className="text-3xl font-bold uppercase tracking-tighter">Archived successfully.</h2>
        <p className="mt-2 opacity-60">ความทรงจำถูกปิดผนึกไว้แล้ว พบกันในปี 2027 ค่ะ</p>
    </motion.div>
);