// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";

const handler = NextAuth({
    providers: [
        TwitchProvider({
            clientId: process.env.TWITCH_CLIENT_ID!,
            clientSecret: process.env.TWITCH_CLIENT_SECRET!,
        }),
    ],
    // Callback: เอาไว้ดึงข้อมูลเพิ่มเติม เช่น User ID จาก Twitch
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                // เพิ่ม id ให้ session เพื่อเอาไปใช้ระบุตัวตนใน Database ทีหลัง
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };