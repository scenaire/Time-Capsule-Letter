// src/components/LoginButton.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Twitch, LogOut } from "lucide-react";

export default function LoginButton() {
    const { data: session } = useSession();

    // ถ้า Login แล้ว -> โชว์ชื่อและรูป
    if (session) {
        return (
            <div className="fixed top-4 right-4 z-[100] flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 pl-4 rounded-full shadow-lg border border-white/50 animate-in fade-in slide-in-from-top-4">
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Agent</p>
                    <p className="text-xs font-bold text-[#9146FF]">{session.user?.name}</p>
                </div>

                {session.user?.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full border border-white shadow-sm"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-[#9146FF] text-white flex items-center justify-center font-bold">
                        {session.user?.name?.[0]}
                    </div>
                )}

                <button
                    onClick={() => signOut()}
                    className="p-2 ml-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            </div>
        );
    }

    // ถ้ายังไม่ Login -> โชว์ปุ่มม่วง
    return (
        <button
            onClick={() => signIn("twitch")}
            className="fixed top-4 right-4 z-[100] flex items-center gap-2 px-6 py-3 bg-[#9146FF] text-white rounded-full font-bold shadow-xl hover:bg-[#772ce8] active:scale-95 transition-all hover:shadow-[#9146FF]/30 hover:shadow-2xl animate-in fade-in slide-in-from-top-4"
        >
            <Twitch size={18} />
            <span className="text-xs uppercase tracking-widest">Login</span>
        </button>
    );
}