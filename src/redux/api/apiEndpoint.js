/*
    API Endpoints Configuration

    Purpose:
    - Centralized place to manage all API endpoints used in the app.
    - Makes the codebase cleaner and avoids repeating raw strings in thunks/components.
    - Easier to update endpoint paths in the future — change here once and it's updated everywhere.

    Structure:
    - Authentication Endpoints → Login, Send OTP, Get Profile.
    - Attendance Endpoints → Clock In, Clock Out, Attendance List.
*/

// 🔹 Authentication Endpoints
export const sendOtpEndpoint = 'send';
export const verifyOtpEndpoint = 'verify';
export const registerEndpoint = 'CreateProfile';

// 🔹 Language Endpoints
export const getLanguageEndpoint = 'getLanguages';

// 🔹 Genre Endpoints
export const getGenreEndpoint = 'getGenre';

// 🔹 Profile Endpoints
export const getProfileEndpoint = 'profile';
export const updateProfileEndpoint = 'updateProfile';

// 🔹 Company Endpoints
export const companyEndpoint = 'getCompany';

// 🔹 FAQ Endpoints
export const faqEndpoint = 'getAllFAQ';
export const imageUploadEndpoint = 'imageToUrl';

// 🔹 Notification Endpoints
export const getNotificationEndpoint = 'getAllNotificationByuserId';
export const notificationSeenEndpoint = 'notificationSeenCount';
export const notificationDetailsEndpoint = 'getNotificationById';
export const clearAllNotificationsEndpoint = 'clearAllNotifications';

// 🔹 Subscription Endpoints
export const getSubscriptionEndpoint = 'getAllSubscription';
export const createPurchaseEndpoint = 'createPurchaseSubscription';
export const createRentOnMoviewEndpoint = 'createMovieRent';

// 🔹 Bank Endpoints
export const getAllBankEndpoint = 'getAllBankAccountDetailsOfUser';
export const getBankDetailsEndpoint = 'getBankAccountDetailsById';
export const createBankEndpoint = 'createbankAccountDetails';
export const deleteBankEndpoint = 'deleteBankAccountDetails';

// 🔹 transaction Endpoints
export const getTransactionEndpoint = 'getListTransactionByUserId';
export const withdrawReqEndpoint = 'createTransaction';

// 🔹 Wishlist Endpoints
export const wisthlistEndpoint = 'getAllWishListByUserId';
export const addWisthlistEndpoint = 'createWishList';
export const deleteWisthlistEndpoint = 'deleteWishListById';

// 🔹 Home screen Endpoints
export const homeEndpoint = 'homePage';
export const newReleaseEndpoint = 'newRelease';
export const trendingEndpoint = 'trending';
export const recommandedEndpoint = 'recommanded';
export const categoryEndpoint = 'categoryData';

// 🔹 Top search screen Endpoints
export const topSearchEndpoint = 'pastTopSearchedData';
export const searchMoviewSeriesEndpoint = 'searchedFilterApi';
export const createTopSearchEndpoint = 'createTopSearch';
export const deleteTopSearchEndpoint = 'deleteTopSearch';

// 🔹 Watchlist Endpoints
export const watchlistEndpoint = 'getAllWatchHistoryByUserId';
export const updateWatchEndpoint = 'updatePlayTimeStamp';
export const updateFreeWatchEndpoint = 'freeplanCheck';

// 🔹 Movies Endpoints
export const getMovieDetailsEndpoint = 'getMovieOrSeriesById';
export const getMovieTrailerEndpoint = 'getTrailerMovieOrSeriesById';
export const createRateEndpoint = 'createOrUpdateLikeRate';
