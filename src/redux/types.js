/*
    Redux Action Type Constants

    Purpose:
    - Define action type constants in a centralized file.
    - Prevents hardcoding strings in reducers/actions (avoids typos).
    - Makes the codebase easier to maintain and scale.

    Structure:
    - User-related action types → Tokens, user data.
    - Attendance-related action types → Attendance records, logs, etc.
*/

// 🔹 User Action Types
export const USER_TOKEN = 'USER_TOKEN'     // Stores/updates user authentication token
export const USER_DATA = 'USER_DATA'       // Stores/updates user profile data

// 🔹 Language Action Types
export const LANGUAGE_DATA = 'LANGUAGE_DATA' // Stores/updates user attendance data

// 🔹 GENRE Action Types
export const GENRE_DATA = 'GENRE_DATA' // Stores/updates user attendance data

// 🔹 Company Action Types
export const COMPANY_DATA = 'COMPANY_DATA'
export const FAQ_DATA = 'FAQ_DATA'

export const NOTIFICATION_DATA = 'NOTIFICATION_DATA'
export const NOTIFICATION_COUNT = 'NOTIFICATION_COUNT'
export const SUBSCRIPTION_DATA = 'SUBSCRIPTION_DATA'
export const BANK_DATA = 'BANK_DATA'
export const TRANSACTION_DATA = 'TRANSACTION_DATA'
export const WISHLIST_DATA = 'WISHLIST_DATA'
export const WATCHLIST_DATA = 'WATCHLIST_DATA'


export const HOME_DATA = 'HOME_DATA'
export const TRENDING_DATA = 'TRENDING_DATA'
export const RECOMMAND_DATA = 'RECOMMAND_DATA'
export const NEWRELEASE_DATA = 'NEWRELEASE_DATA'
export const CATEGORY_DATA = 'CATEGORY_DATA'
export const TOP_SEARCHES = 'TOP_SEARCHES'
export const MOVIESERIES_SEARCH = 'MOVIESERIES_SEARCH'
export const MOVIESERIES_TRAILER = 'MOVIESERIES_TRAILER'
export const MOVIESERIES_DETAILS = 'MOVIESERIES_SEARCH'
export const GENRE_MOVIES = 'GENRE_MOVIES'


