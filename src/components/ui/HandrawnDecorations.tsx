import React from 'react';

export const HandDrawnUnderline = ({ className = "" }: { className?: string }) => (
    <svg
        className={`absolute w-full h-4 -bottom-2 left-0 pointer-events-none ${className}`}
        viewBox="0 0 200 9"
        fill="none"
        preserveAspectRatio="none"
    >
        <path
            d="M2.00025 7.00002C55.0315 1.70183 133.029 -1.61129 198.001 3.50002"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
        />
    </svg>
);