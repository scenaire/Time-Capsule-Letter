"use client";

import MailboxOverlay from '@/components/MailboxOverlay';

export default function OverlayPage() {
    return (
        // กำหนดให้ Container หลักโปร่งใส
        <main className="min-h-screen w-full flex items-start justify-start p-10 bg-transparent overflow-hidden">

            {/* 🛠️ Hack: ฝัง CSS เพื่อบังคับให้ Body/HTML โปร่งใสเฉพาะหน้านี้ */}
            <style dangerouslySetInnerHTML={{
                __html: `
        body, html {
          background: transparent !important;
          background-color: transparent !important;
        }
      `}} />

            {/* เรียกใช้ Component ตู้ไปรษณีย์ */}
            <MailboxOverlay />

        </main>
    );
}