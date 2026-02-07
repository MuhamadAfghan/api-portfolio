import { createClient } from '@supabase/supabase-js';
let cached = null;
export const getSupabaseClient = () => {
    if (cached)
        return cached;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_*_KEY in backend env.');
    }
    cached = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return cached;
};
