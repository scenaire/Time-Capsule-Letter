import React from 'react';
import { motion } from 'framer-motion';

export const SuccessMessage = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center text-cowhide-cocoa font-ibm-plex"
    >
        <h2 className="text-3xl font-bold uppercase tracking-tighter">Archived successfully.</h2>
        <p className="mt-2 opacity-60">ความทรงจำถูกปิดผนึกไว้แล้ว พบกันในปี 2027 ค่ะ</p>
    </motion.div>
);