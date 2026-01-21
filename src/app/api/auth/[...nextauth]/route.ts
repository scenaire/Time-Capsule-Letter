import NextAuth, { AuthOptions } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
// ❌ ลบอันเก่า: import { supabase } from "@/lib/supabase";
// ✅ ใช้อันใหม่: Import Admin Client (ที่มี Service Role Key)
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// สร้างตัวแปร authOptions แยกออกมา (เผื่อเอาไปใช้ใน Server Component อื่นๆ)
export const authOptions: AuthOptions = {
    providers: [
        TwitchProvider({
            clientId: process.env.TWITCH_CLIENT_ID!,
            clientSecret: process.env.TWITCH_CLIENT_SECRET!,
        }),
        // ⚠️ หมายเหตุ: ถ้าคุณแนร์จะใช้ Google Login ด้วย อย่าลืมเพิ่ม GoogleProvider ตรงนี้นะคะ
        // GoogleProvider({ ... }) 
    ],
    callbacks: {
        // 🔐 1. SignIn Callback: ทำงานทันทีที่ล็อกอินสำเร็จ
        async signIn({ user, account, profile }) {
            // เช็คว่าเป็น Twitch จริงไหม (ถ้ามี Google ก็เพิ่ม || account?.provider === "google")
            if (account && profile) {

                // เตรียมข้อมูล User
                // หมายเหตุ: แต่ละ Provider อาจเก็บ ID ไว้ต่างที่กัน (Twitch ใช้ sub)
                const providerId = (profile as any).sub || user.id;

                const userData = {
                    id: providerId, // ใช้ Provider ID เป็น Primary Key
                    username: (profile as any).preferred_username || user.name, // Twitch ใช้ preferred_username
                    display_name: user.name,
                    image: user.image,
                    email: user.email,
                    // created_at ปล่อยให้ DB จัดการเอง
                };

                // 🔥 Upsert: ยิงใส่ Supabase โดยใช้ 'supabaseAdmin' (ทะลุ RLS ได้แน่นอน)
                const { error } = await supabaseAdmin
                    .from('users')
                    .upsert(userData as any, { onConflict: 'id' });

                if (error) {
                    console.error("❌ Error syncing user to Supabase:", error);
                    // ถ้าเซฟ User ไม่ลง DB -> เราควร Block การล็อกอินไปเลย เพราะเดี๋ยวจะส่งจดหมายไม่ได้
                    return false;
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
                token.sub = (profile as any).sub || token.sub; // บันทึก ID ลง Token
            }
            return token;
        },
    },
    // Secret สำหรับเข้ารหัส Token (ควรมีใน .env)
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };