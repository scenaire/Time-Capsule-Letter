'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. เช็คว่ามีจดหมายไหม (Private)
export async function checkExistingLetter() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return false;
    const userId = (session.user as any).id;
    const { count } = await supabaseAdmin.from('letters').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    return count !== null && count > 0;
}

// 2. ดึงจดหมายตัวเอง (Private)
export async function getLetter() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { data: null, error: null };
    const userId = (session.user as any).id;
    const { data, error } = await supabaseAdmin.from('letters').select('*').eq('user_id', userId).maybeSingle();
    return { data, error };
}

// 3. ดึงซองจดหมายคนอื่น (Private - สำหรับหน้า Home/Archive)
export async function getCompanionEnvelopes() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // ✅ แก้ตรงนี้: เพิ่ม sender_nickname กับ theme_name เข้าไป
    let query = supabaseAdmin
        .from('letters')
        .select('envelope_id, sender_nickname, theme_name')
        .limit(50)
        .order('created_at', { ascending: false });

    if (userId) query = query.neq('user_id', userId);

    const { data, error } = await query;
    return { data, error };
}

// 4. ดึงข้อมูล Overlay (Public - สำหรับ OBS)
export async function getPublicOverlayData() {
    // ไม่เช็ค Session เพราะ OBS ไม่มี user
    // ดึงแค่ user_id กับ envelope_id พอ (ไม่เอาข้อความ)
    const { data, error } = await supabaseAdmin
        .from('letters')
        .select('user_id, envelope_id');

    return { data, error };
}

// 5. บันทึกและกระจายข่าว (Broadcast)
export async function saveLetter(letterData: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const finalData = { ...letterData, user_id: userId };

    // 5.1 บันทึกลง DB
    const { error } = await supabaseAdmin
        .from('letters')
        .upsert(finalData, { onConflict: 'user_id' });

    if (error) throw new Error(error.message);

    // 🚀 5.2 ตะโกนบอก OBS (Broadcast) ว่ามีจดหมายใหม่/อัปเดต!
    // เราต้องเชื่อมต่อ Channel ชั่วคราวเพื่อส่งข้อความ
    const channel = supabaseAdmin.channel('mailbox-overlay');

    // รอเชื่อมต่อแล้วส่งข้อความ
    await new Promise<void>((resolve) => {
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'letter-update', // Event ชื่อนี้
                    payload: {
                        user_id: userId,
                        envelope_id: letterData.envelope_id
                    }
                });
                // ส่งเสร็จแล้วปิด Channel ได้เลย
                supabaseAdmin.removeChannel(channel);
                resolve();
            }
        });
    });

    return { success: true };
}