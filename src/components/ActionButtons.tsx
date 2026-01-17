// src/components/ActionButtons.tsx
import React from 'react';
import ButtonTooltip from './ButtonTooltip';

interface ActionButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    theme: {
        bg: string;
        text: string;
    };
    tooltip?: string;
}

export const ActionButton = ({ onClick, icon, label, theme, tooltip }: ActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            // 🔴 แก้ไข: ใช้ theme.bg และ theme.text แทน bg-white
            // ยังคง wobbly-border และ hard-shadow ไว้ แต่เปลี่ยนสี border เป็น #2d2d2d (Pencil)
            className={`group relative flex items-center gap-3 px-6 py-3 w-full md:w-auto
                ${theme.bg} ${theme.text} opacity-100
                wobbly-border hard-shadow border-[3px] border-[#000000]
                hover:scale-105 hover:-rotate-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                transition-all duration-200 cursor-pointer`}
        >
            <ButtonTooltip text={tooltip || label} />

            {/* ไอคอน */}
            <span className="transition-transform group-hover:scale-110 group-hover:-rotate-12">
                {icon}
            </span>
            {/* ข้อความ */}
            <span className="font-ibm-plex font-bold tracking-tight uppercase text-sm">
                {label}
            </span>
        </button>
    );
};

export const UndoButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            // ปรับปุ่ม Undo ให้เข้าธีมเล็กน้อย แต่ยังคงความ Minimal
            className="group relative p-3 bg-white wobbly-border border-2 border-[#000000] hard-shadow 
                hover:bg-[#2d5da1] hover:text-white hover:border-[#2d5da1] opacity-100
                hover:rotate-12 active:scale-95 transition-all cursor-pointer text-[#000000]"
        >
            <ButtonTooltip text="กลับไปแก้ไขข้อความ" />

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
            </svg>
        </button>
    );
};