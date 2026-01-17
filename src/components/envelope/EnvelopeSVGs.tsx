import React from 'react';

interface EnvelopeProps {
    color?: string;
    frontColor?: string;
    secondColor?: string;
    className?: string;
}

const VIEWBOX = "0 0 1001 1083";

/* 📜 1. สูตรสร้างลายกระดาษ (Paper Texture Filter) */
const PaperFilter = () => (
    <defs>
        <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
            {/* สร้าง Noise ละเอียดๆ */}
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" result="noise" />

            {/* ทำให้เป็นขาวดำ */}
            <feColorMatrix type="saturate" values="0" in="noise" result="bwNoise" />

            {/* ปรับความจางของลาย (slope = ความเข้ม 0.3 คือ 30%) */}
            <feComponentTransfer in="bwNoise" result="opacityNoise">
                <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>

            {/* ผสมลงไปในสีพื้นเดิม (Multiply) */}
            <feBlend in="SourceGraphic" in2="opacityNoise" mode="multiply" result="blended" />

            {/* (Optional) เพิ่ม Lighting ให้ดูนูนมีมิติเล็กน้อย */}
            <feComposite operator="in" in="blended" in2="SourceGraphic" />
        </filter>
    </defs>
);

/* วิธีใช้: 
   1. ใส่ <PaperFilter /> ไว้ใน <svg>
   2. ใส่ filter="url(#paper-grain)" ไว้ใน <path> หรือ <rect> 
*/

export const EnvelopeBack = ({ color, className }: EnvelopeProps) => (
    <svg viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
        <PaperFilter />
        <rect
            x="0.138428" y="503.5" width="1000" height="579"
            fill={color || '#4B1D10'}
            filter="url(#paper-grain)" // 👈 ใส่ตรงนี้
        />
    </svg>
);

export const EnvelopeSecond = ({ secondColor, className }: EnvelopeProps) => (
    <svg viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
        <PaperFilter />
        <path
            d="M939.341 515.725C964.646 500.641 996.748 518.841 996.798 548.301L997.616 1029.49C997.666 1058.95 965.626 1077.26 940.27 1062.26L534.678 822.354C528.017 818.415 523.14 812.948 520.047 806.771C516.78 813.433 511.455 819.284 504.066 823.296L57.4482 1065.78C32.1529 1079.52 1.36537 1061.24 1.31634 1032.45L0.495053 548.996C0.446122 520.213 31.1707 501.827 56.5126 515.475L503.953 756.443C511.304 760.402 516.627 766.181 519.922 772.774C522.991 766.532 527.871 760.998 534.566 757.007L939.341 515.725Z"
            fill={secondColor || '#53211A'}
            filter="url(#paper-grain)" // 👈 ใส่ตรงนี้
        />
    </svg>
);

export const EnvelopeFront = ({ frontColor, className }: EnvelopeProps) => (
    <svg viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
        <PaperFilter />
        <path
            d="M620.138 718.5C650.391 718.5 677.34 732.642 694.738 754.675L1000.14 1018.38V1082.5H0.138428V1018.2L309.619 750.97C327.032 731.069 352.617 718.5 381.138 718.5H620.138Z"
            fill={frontColor || '#62231E'}
            filter="url(#paper-grain)" // 👈 ใส่ตรงนี้
        />
    </svg>
);

export const EnvelopeFlap = ({ color, className }: EnvelopeProps) => (
    <svg viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
        <PaperFilter />
        <path
            d="M107.186 504.336C104.786 504.336 102.455 504.163 100.199 503.836H-6.52345e-05L101.758 397.336L101.773 397.352L467.007 14.2583C485.132 -4.75285 515.47 -4.75285 533.595 14.2583L924.523 424.303L1000.52 503.836L900.402 503.836C898.146 504.164 895.815 504.336 893.415 504.336L107.186 504.336Z"
            fill={color || '#4B1D10'}
            filter="url(#paper-grain)" // 👈 ใส่ตรงนี้
        />
    </svg>
);

export const EnvelopeFlapClose = ({ color, className }: EnvelopeProps) => (
    <svg viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
        <PaperFilter />
        <path
            d="M894.329 504C896.73 504 899.061 504.173 901.316 504.5H1001.52L899.758 611L899.742 610.984L534.509 994.078C516.384 1013.09 486.046 1013.09 467.921 994.078L76.9922 584.033L1 504.5H101.113C103.369 504.173 105.7 504 108.101 504H894.329Z"
            fill={color || '#4B1D10'}
            filter="url(#paper-grain)" // 👈 ใส่ตรงนี้
        />
    </svg>
);

export const EnvelopeShadow = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none">
        <defs>
            <radialGradient id="shadowGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 150) rotate(90) scale(150 200)">
                <stop stopColor="black" stopOpacity="0.3" />
                <stop offset="1" stopColor="black" stopOpacity="0" />
            </radialGradient>
        </defs>
        {/* เงาจะอยู่ภายใต้รูปทรงสามเหลี่ยมปิดซอง */}
        <path d="M200 150L0 0H400L200 150Z" fill="url(#shadowGrad)" style={{ mixBlendMode: 'multiply' }} />
    </svg>
);