import React from 'react';
import { motion } from "framer-motion";
import { Twitch } from "lucide-react";

interface TicketButtonProps {
    onClick: () => void;
    label?: string;
}

export const TicketButton: React.FC<TicketButtonProps> = ({ onClick, label = "Login with Twitch" }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02, rotate: 1 }}
            whileTap={{ scale: 0.98, translateY: 4 }}
            onClick={onClick}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#2d2d2d] font-bold text-xl md:text-2xl transition-all"
            style={{
                // Wobbly Border Magic
                borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                border: "3px solid #2d2d2d",
                boxShadow: "5px 5px 0px 0px #2d2d2d"
            }}
        >
            {/* Hover Fill Effect */}
            <div
                className="absolute inset-0 bg-[#ff4d4d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                style={{ borderRadius: "inherit" }}
            />

            <Twitch size={32} className="group-hover:text-white transition-colors" />
            <span className="font-ibm-plex tracking-wider group-hover:text-white transition-colors">
                {label}
            </span>
        </motion.button>
    );
};