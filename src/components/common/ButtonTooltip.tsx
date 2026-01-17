import React from 'react';

interface ButtonTooltipProps {
    text: string;
}

export const ButtonTooltip = ({ text }: ButtonTooltipProps) => {
    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 
                        bg-[#2d2d2d] text-white font-ibm-plex text-[10px] font-bold tracking-widest uppercase 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                        pointer-events-none whitespace-nowrap rounded-md shadow-md z-50">
            {text}
            {/* หางลูกศร */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2d2d2d] rotate-45" />
        </div>
    );
}

export default ButtonTooltip;