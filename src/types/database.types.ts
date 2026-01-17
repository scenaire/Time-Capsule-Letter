export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string // Twitch ID
                    username: string
                    display_name: string
                    image: string | null
                    email: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    username: string
                    display_name: string
                    image?: string | null
                    email?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    display_name?: string
                    image?: string | null
                    email?: string | null
                    created_at?: string
                }
            }
            letters: {
                Row: {
                    id: string // UUID
                    user_id: string
                    message: string
                    sender_nickname: string
                    theme_name: string
                    font_id: string
                    envelope_id: string
                    seal_id: string | null
                    status: 'draft' | 'sealed'
                    is_featured: boolean
                    metadata: Json | null
                    open_at: string
                    created_at: string
                }
                Insert: {
                    id?: string // Let DB generate UUID
                    user_id: string
                    message: string
                    sender_nickname: string
                    theme_name: string
                    font_id: string
                    envelope_id: string
                    seal_id?: string | null
                    status?: 'draft' | 'sealed'
                    is_featured?: boolean
                    metadata?: Json | null
                    open_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    message?: string
                    sender_nickname?: string
                    theme_name?: string
                    font_id?: string
                    envelope_id?: string
                    seal_id?: string | null
                    status?: 'draft' | 'sealed'
                    is_featured?: boolean
                    metadata?: Json | null
                    open_at?: string
                    created_at?: string
                }
            }
        }
    }
}