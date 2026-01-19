import NextAuth, { AuthOptions } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
import { supabase } from "@/lib/supabase"; // ✅ Import Supabase Client ที่เราสร้างไว้

// สร้างตัวแปร authOptions แยกออกมา (เผื่อเอาไปใช้ใน Server Component อื่นๆ)
export const authOptions: AuthOptions = {
    providers: [
        TwitchProvider({
            clientId: process.env.TWITCH_CLIENT_ID!,
            clientSecret: process.env.TWITCH_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        // 🔐 1. SignIn Callback: ทำงานทันทีที่ล็อกอินผ่าน Twitch สำเร็จ
        async signIn({ user, account, profile }) {
            // เช็คว่าเป็น Twitch จริงไหม
            if (account?.provider === "twitch" && profile) {
                const twitchProfile = profile as any; // Cast เป็น any เพื่อดึง field เฉพาะของ Twitch (sub, preferred_username)

                // เตรียมข้อมูล User
                const userData = {
                    id: twitchProfile.sub, // ใช้ Twitch ID เป็น Primary Key (สำคัญมาก!)
                    username: twitchProfile.preferred_username || user.name, // ชื่อ ID (เช่น nair_vtuber)
                    display_name: user.name, // ชื่อที่โชว์ (เช่น Nair Channel)
                    image: user.image,
                    email: user.email,
                    // created_at ปล่อยให้ DB จัดการเอง
                };

                // 🔥 Upsert: ยิงใส่ Supabase (ถ้ามีแล้ว = อัปเดต, ถ้ายังไม่มี = สร้างใหม่)
                const { error } = await supabase
                    .from('users')
                    .upsert(userData as any, { onConflict: 'id' });

                if (error) {
                    console.error("❌ Error syncing user to Supabase:", error);
                    // หมายเหตุ: เรา return true เพื่อยอมให้ล็อกอินผ่านไปก่อน แม้จะเซฟลง DB ไม่สำเร็จ
                    // (แต่จริงๆ ควรเช็คดีๆ เพราะถ้าไม่ลง DB จะส่งจดหมายไม่ได้)
                    return true;
                }

                console.log("✅ User synced to DB:", userData.username);
            }
            return true;
        },

        // 🎫 2. Session Callback: ส่ง ID ไปให้ฝั่งหน้าเว็บ (Client) ใช้
        async session({ session, token }) {
            if (session.user) {
                // ยัด ID ใส่เข้าไปใน Session เพื่อให้ useSession() เรียกใช้ได้
                (session.user as any).id = token.sub;
            }
            return session;
        },

        // 🎫 3. JWT Callback: รับ ID จาก Provider มาส่งต่อให้ Session
        async jwt({ token, account, profile }) {
            // ทำงานครั้งแรกตอน Sign In
            if (account && profile) {
                token.sub = (profile as any).sub; // บันทึก Twitch ID ลง Token
            }
            return token;
        },
    },
    // Secret สำหรับเข้ารหัส Token (ควรมีใน .env)
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };