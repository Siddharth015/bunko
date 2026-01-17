import { createClient } from '@supabase/supabase-js';
import { Database } from '@/src/types/database.types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log warning if environment variables are missing (not in build time)
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    console.warn(
        'Missing Supabase environment variables. Please check your .env.local file.'
    );
}

/**
 * Browser-side Supabase client
 * Use this in Client Components and browser contexts
 */
export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    }
);

/**
 * Create a Supabase client for Server Components
 * This should be used in server-side contexts (Server Components, API routes)
 * Note: For production, you should implement proper session management
 */
export function createServerClient() {
    return createClient<Database>(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key',
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        }
    );
}

/**
 * Type-safe helper to get the current user
 */
export async function getCurrentUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        console.error('Error fetching user:', error.message);
        return null;
    }

    return user;
}

/**
 * Type-safe helper to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}
