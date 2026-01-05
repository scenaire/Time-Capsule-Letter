import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

// 1. ลงฟอนต์ที่คุณ Nair อัปโหลด (ตรวจสอบชื่อไฟล์ให้ตรงเป๊ะนะคะ)
const fontOumin = localFont({
  src: '../public/fonts/oumineveryday.ttf',
  variable: '--font-oumin',
})

const fontPani = localFont({
  src: '../public/fonts/GivePANINewYear2026-Regular.ttf',
  variable: '--font-pani',
})

const fontIbmPlex = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex", // กำหนดชื่อตัวแปร
});

// 2. ตั้งค่าข้อมูลพื้นฐานของเว็บไซต์ (Metadata)
export const metadata: Metadata = {
  title: "Time Capsule 2026 | จดหมายถึงอนาคต",
  description: "พื้นที่เก็บความทรงจำและข้อความข้ามเวลาของคุณ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      {/* เพิ่ม variable ของฟอนต์ใหม่ลงใน body */}
      <body className={`
        ${fontOumin.variable} 
        ${fontPani.variable} 
        ${fontIbmPlex.variable} 
        antialiased
      `}>
        {children}
      </body>
    </html>
  );
}