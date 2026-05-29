import { WATCHLIST_DATA, MOVIESERIES_DETAILS, MOVIESERIES_TRAILER } from "../types";

const initialState = {
    watchlist: null,
    movieTrailer: null,
    moreLikeThis: null,
    movieDetails: null,
}

export const watchlistReducer = (state = initialState, action) => {
    switch (action.type) {
        case WATCHLIST_DATA: {
            const newData = action.payload;
            if (newData?.currentPage > 1 && state.watchlist?.data) {
                return {
                    ...state,
                    watchlist: { ...newData, data: [...state.watchlist.data, ...newData.data] }
                };
            } else {
                return { ...state, watchlist: newData };
            }
        }
        case MOVIESERIES_TRAILER:
            return { ...state, movieTrailer: action.payload?.trailer, moreLikeThis: action.payload.morelike }
        case MOVIESERIES_DETAILS:
            return { ...state, movieDetails: action.payload }
        default:
            return state
    }
} 