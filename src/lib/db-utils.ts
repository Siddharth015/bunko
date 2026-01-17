import { supabase } from './supabase';
import {
    Profile,
    ProfileInsert,
    ProfileUpdate,
    MediaEntry,
    MediaEntryInsert,
    MediaEntryUpdate,
    MediaType,
    MediaStatus,
    DatabaseResponse,
    DatabaseListResponse,
    UserStats,
} from '@/src/types/database.types';

// ============================================================
// ERROR HANDLING UTILITIES
// ============================================================

/**
 * Standard error handler for database operations
 */
function handleError(error: any, operation: string): void {
    console.error(`[Database Error] ${operation}:`, error);
}

/**
 * Wrapper for single-item database operations with error handling
 */
async function executeSingleQuery<T>(
    query: PromiseLike<{ data: T | null; error: any }>,
    operation: string
): Promise<DatabaseResponse<T>> {
    try {
        const { data, error } = await query;

        if (error) {
            handleError(error, operation);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        handleError(error, operation);
        return { data: null, error: error as Error };
    }
}

/**
 * Wrapper for list database operations with error handling
 */
async function executeListQuery<T>(
    query: PromiseLike<{ data: T[] | null; error: any; count?: number | null }>,
    operation: string
): Promise<DatabaseListResponse<T>> {
    try {
        const { data, error, count } = await query;

        if (error) {
            handleError(error, operation);
            return { data: null, error, count: 0 };
        }

        return { data, error: null, count: count ?? undefined };
    } catch (error) {
        handleError(error, operation);
        return { data: null, error: error as Error, count: 0 };
    }
}

// ============================================================
// PROFILE OPERATIONS
// ============================================================

/**
 * Get a profile by user ID
 */
export async function getProfileById(
    userId: string
): Promise<DatabaseResponse<Profile>> {
    return executeSingleQuery(
        supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single(),
        'getProfileById'
    );
}

/**
 * Get a profile by username
 */
export async function getProfileByUsername(
    username: string
): Promise<DatabaseResponse<Profile>> {
    return executeSingleQuery(
        supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single(),
        'getProfileByUsername'
    );
}

/**
 * Create a new profile
 */
export async function createProfile(
    profile: ProfileInsert
): Promise<DatabaseResponse<Profile>> {
    return executeSingleQuery(
        supabase
            .from('profiles')
            .insert(profile as any)
            .select()
            .single(),
        'createProfile'
    );
}

/**
 * Update an existing profile
 */
export async function updateProfile(
    userId: string,
    updates: ProfileUpdate
): Promise<DatabaseResponse<Profile>> {
    return executeSingleQuery(
        supabase
            .from('profiles')
            // @ts-ignore
            .update(updates as any)
            .eq('id', userId)
            .select()
            .single(),
        'updateProfile'
    );
}

/**
 * Delete a profile
 */
export async function deleteProfile(
    userId: string
): Promise<DatabaseResponse<void>> {
    return executeSingleQuery(
        supabase
            .from('profiles')
            .delete()
            .eq('id', userId),
        'deleteProfile'
    );
}

// ============================================================
// MEDIA ENTRY OPERATIONS
// ============================================================

/**
 * Get all media entries for a user
 */
export async function getUserMediaEntries(
    userId: string
): Promise<DatabaseListResponse<MediaEntry>> {
    return executeListQuery(
        supabase
            .from('media_entries')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
        'getUserMediaEntries'
    );
}

/**
 * Get media entries by type for a user
 */
export async function getUserMediaByType(
    userId: string,
    mediaType: MediaType
): Promise<DatabaseListResponse<MediaEntry>> {
    return executeListQuery(
        supabase
            .from('media_entries')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .eq('media_type', mediaType)
            .order('created_at', { ascending: false }),
        'getUserMediaByType'
    );
}

/**
 * Get media entries by status for a user
 */
export async function getUserMediaByStatus(
    userId: string,
    status: MediaStatus
): Promise<DatabaseListResponse<MediaEntry>> {
    return executeListQuery(
        supabase
            .from('media_entries')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .eq('status', status)
            .order('created_at', { ascending: false }),
        'getUserMediaByStatus'
    );
}

/**
 * Get a specific media entry
 */
export async function getMediaEntry(
    entryId: string
): Promise<DatabaseResponse<MediaEntry>> {
    return executeSingleQuery(
        supabase
            .from('media_entries')
            .select('*')
            .eq('id', entryId)
            .single(),
        'getMediaEntry'
    );
}

/**
 * Check if user has already tracked a specific media item
 */
export async function getMediaEntryByMediaId(
    userId: string,
    mediaId: string,
    mediaType: MediaType
): Promise<DatabaseResponse<MediaEntry>> {
    return executeSingleQuery(
        supabase
            .from('media_entries')
            .select('*')
            .eq('user_id', userId)
            .eq('media_id', mediaId)
            .eq('media_type', mediaType)
            .single(),
        'getMediaEntryByMediaId'
    );
}

/**
 * Create a new media entry
 */
export async function createMediaEntry(
    entry: MediaEntryInsert
): Promise<DatabaseResponse<MediaEntry>> {
    return executeSingleQuery(
        supabase
            .from('media_entries')
            .insert(entry as any)
            .select()
            .single(),
        'createMediaEntry'
    );
}

/**
 * Update an existing media entry
 */
export async function updateMediaEntry(
    entryId: string,
    updates: MediaEntryUpdate
): Promise<DatabaseResponse<MediaEntry>> {
    return executeSingleQuery(
        supabase
            .from('media_entries')
            // @ts-ignore
            .update(updates as any)
            .eq('id', entryId)
            .select()
            .single(),
        'updateMediaEntry'
    );
}

/**
 * Delete a media entry
 */
export async function deleteMediaEntry(
    entryId: string
): Promise<DatabaseResponse<void>> {
    return executeSingleQuery(
        supabase
            .from('media_entries')
            .delete()
            .eq('id', entryId),
        'deleteMediaEntry'
    );
}

// ============================================================
// ADVANCED QUERIES
// ============================================================

/**
 * Get user statistics using the database function
 */
export async function getUserStats(
    userId: string
): Promise<DatabaseResponse<UserStats>> {
    return executeSingleQuery(
        supabase.rpc('get_user_stats', { p_user_id: userId } as any),
        'getUserStats'
    );
}

/**
 * Get top-rated entries for a user
 */
export async function getTopRatedEntries(
    userId: string,
    limit: number = 10
): Promise<DatabaseListResponse<MediaEntry>> {
    return executeListQuery(
        supabase
            .from('media_entries')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .not('rating', 'is', null)
            .order('rating', { ascending: false })
            .limit(limit),
        'getTopRatedEntries'
    );
}

/**
 * Search media entries by review content
 */
export async function searchMediaEntries(
    userId: string,
    searchTerm: string
): Promise<DatabaseListResponse<MediaEntry>> {
    return executeListQuery(
        supabase
            .from('media_entries')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .ilike('review', `%${searchTerm}%`)
            .order('created_at', { ascending: false }),
        'searchMediaEntries'
    );
}

/**
 * Get recently added entries across all users (for discovery/social features)
 */
export async function getRecentEntries(
    limit: number = 20
): Promise<DatabaseListResponse<MediaEntry>> {
    return executeListQuery(
        supabase
            .from('media_entries')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(limit),
        'getRecentEntries'
    );
}
