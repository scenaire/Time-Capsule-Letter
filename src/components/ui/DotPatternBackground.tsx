import React from 'react';

interface DotPatternBackgroundProps {
    isDark?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const DotPatternBackground: React.FC<DotPatternBackgroundProps> = ({
    isDark = false,
    className = "",
    children
}) => {
    // Logic สีจุด: ถ้า Dark theme จุดขาวจางๆ, ถ้า Light theme จุดดำจางๆ
    const dotColor = isDark ? 'rgba(255, 255, 255, 0.15)' : '#d1ccc0';

    return (
        <div
            className={`relative h-screen w-full overflow-hidden ${className}`}
            style={{
                backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
                backgroundSize: '24px 24px'
            }}
        >
            {/* Gradient Overlay (Optional) เพื่อความนวล */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-current opacity-5" />

            {children}
        </div>
    );
};