// Database type definitions for Bunko app
// Auto-generated types matching the Supabase schema

/**
 * Media type enum - represents the type of media being tracked
 */
export enum MediaType {
    MOVIE = 'MOVIE',
    BOOK = 'BOOK',
    ANIME = 'ANIME',
}

/**
 * Media status enum - represents the user's progress with the media
 */
export enum MediaStatus {
    PLAN_TO_WATCH = 'PLAN_TO_WATCH',
    WATCHING = 'WATCHING',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
    DROPPED = 'DROPPED',
}

/**
 * Profile interface - represents a user profile
 */
export interface Profile {
    id: string; // UUID
    username: string;
    bio: string | null;
    avatar_url: string | null;
    top_four_ids: string[]; // Array of media IDs for top 4 selections
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

/**
 * Media entry interface - represents a single media tracking entry
 */
export interface MediaEntry {
    id: string; // UUID
    user_id: string; // UUID - foreign key to profiles
    media_id: string; // External media ID (e.g., from TMDB, MAL)
    media_type: MediaType;
    rating: number | null; // 1-10 scale
    review: string | null;
    status: MediaStatus;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

/**
 * Insert types - used when creating new records (omit auto-generated fields)
 */
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
    created_at?: string;
    updated_at?: string;
};

export type MediaEntryInsert = Omit<MediaEntry, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

/**
 * Update types - all fields optional except id
 */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type MediaEntryUpdate = Partial<Omit<MediaEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/**
 * Database response types with Supabase metadata
 */
export interface DatabaseResponse<T> {
    data: T | null;
    error: Error | null;
}

export interface DatabaseListResponse<T> {
    data: T[] | null;
    error: Error | null;
    count?: number;
}

/**
 * User statistics interface
 */
export interface UserStats {
    total_entries: number;
    movies: number;
    books: number;
    anime: number;
    completed: number;
    watching: number;
    plan_to_watch: number;
}

/**
 * Supabase Database schema type
 */
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: ProfileInsert;
                Update: ProfileUpdate;
            };
            media_entries: {
                Row: MediaEntry;
                Insert: MediaEntryInsert;
                Update: MediaEntryUpdate;
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            get_user_media_by_type: {
                Args: {
                    p_user_id: string;
                    p_media_type: MediaType;
                };
                Returns: MediaEntry[];
            };
            get_user_stats: {
                Args: {
                    p_user_id: string;
                };
                Returns: UserStats;
            };
        };
        Enums: {
            media_type: MediaType;
            media_status: MediaStatus;
        };
    };
}
