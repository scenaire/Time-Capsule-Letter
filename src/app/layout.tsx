import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Sans_Thai, Anuphan } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/common/Providers";

// 1. ลงฟอนต์ที่คุณ Nair อัปโหลด (ตรวจสอบชื่อไฟล์ให้ตรงเป๊ะนะคะ)

const fontPani = localFont({
  src: '../../public/fonts/GivePANINewYear2026-Regular.ttf',
  variable: '--font-pani',
})

const fontADELIA = localFont({
  src: '../../public/fonts/ADELIA.otf',
  variable: '--font-adelia',
})

const fontIbmPlex = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex", // กำหนดชื่อตัวแปร
});

const fontAnuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  variable: "--font-anuphan", // กำหนดชื่อตัวแปร
});

const fontGoogleSans = localFont({
  src: '../../public/fonts/GoogleSans-VariableFont_wght.ttf',
  variable: '--font-google-sans',
})

const fontFkAmour = localFont({
  src: '../../public/fonts/FKAmourRegular.ttf',
  variable: '--font-fk-amour',
  declarations: [
    { prop: 'ascent-override', value: '100%' },   // ลดเพดานลงมา (จากปกติ ~100%)
    { prop: 'descent-override', value: '20%' },  // ยกพื้นขึ้นมา (จากปกติ ~30%)
    { prop: 'line-gap-override', value: '0%' },  // ตัดช่องว่างส่วนเกิน
  ],
})



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
        ${fontPani.variable}  
        ${fontADELIA.variable}
        ${fontAnuphan.variable}
        ${fontIbmPlex.variable}
        ${fontGoogleSans.variable}
        ${fontFkAmour.variable}
        antialiased
      `}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}