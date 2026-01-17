// src/components/PostageStampFrame.tsx
import React from 'react';

interface PostageStampFrameProps {
    children: React.ReactNode;
    className?: string;
    bgClass?: string;
}

export const PostageStampFrame = ({
    children,
    className = '',
    bgClass = ''
}: PostageStampFrameProps) => {
    return (
        // กล่องนอก: รับหน้าที่จัดการ Drop Shadow และ Layout
        <div className={`relative filter drop-shadow-lg ${className}`}>

            {/* กล่องใน: ตัวกระดาษแสตมป์ (จัดการ Masking) */}
            <div
                className={`w-full h-full ${bgClass}`}
                style={{
                    // --- 🛠️ THE MAGIC MASK FORMULA 🛠️ ---
                    // Layer 1 (บน): สี่เหลี่ยมทึบตรงกลาง (ปิดรูพรุนตรงกลาง)
                    // Layer 2 (ล่าง): รูวงกลมเรียงต่อกัน (สร้างขอบหยัก)
                    maskImage: `
            linear-gradient(#000, #000), 
            radial-gradient(circle at 10px 10px, transparent 6px, black 7px)
          `,
                    WebkitMaskImage: `
            linear-gradient(#000, #000), 
            radial-gradient(circle at 10px 10px, transparent 6px, black 7px)
          `,

                    // จัดตำแหน่ง: Layer 1 อยู่ตรงกลาง, Layer 2 เริ่มที่มุมซ้ายบน
                    maskPosition: 'center, 0 0',
                    WebkitMaskPosition: 'center, 0 0',

                    // ขนาด: Layer 1 เต็มพื้นที่, Layer 2 ขนาด 20x20px ต่อบล็อก
                    maskSize: '100% 100%, 20px 20px',
                    WebkitMaskSize: '100% 100%, 20px 20px',

                    // การซ้ำ: Layer 1 ไม่ซ้ำ, Layer 2 ซ้ำแบบ Round (คำนวณให้พอดีขอบ)
                    maskRepeat: 'no-repeat, round',
                    WebkitMaskRepeat: 'no-repeat, round',

                    // 🔴 หัวใจสำคัญ: Layer 1 อิงเนื้อหา (Content Box), Layer 2 อิงขอบ (Border Box)
                    maskOrigin: 'content-box, border-box',
                    WebkitMaskOrigin: 'content-box, border-box',

                    // ดันเนื้อหาเข้ามา 10px เพื่อให้ Layer 1 (สีทึบ) เล็กลงกว่า Layer 2 (รูพรุน)
                    // ทำให้รูพรุนโผล่มาแค่ที่ขอบ 10px รอบๆ เท่านั้น
                    padding: '10px'
                }}
            >
                {/* เนื้อหาจดหมาย (ดันกลับให้เต็มพื้นที่ ถ้าต้องการ) */}
                <div className="w-full h-full overflow-y-auto no-scrollbar flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );
};