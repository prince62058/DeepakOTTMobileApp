import { TOP_SEARCHES, MOVIESERIES_SEARCH, GENRE_MOVIES } from "../types"

const initialState = {
    topsearch: null,
    searchMoviesSeries: null,
    genreData: null
}

export const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case TOP_SEARCHES:
            return { ...state, topsearch: action.payload }
        case MOVIESERIES_SEARCH:
            return { ...state, searchMoviesSeries: action.payload }
        case GENRE_MOVIES: {
            const newData = action.payload;
            if (newData?.currentPage > 1 && state.genreData?.data) {
                return {
                    ...state,
                    genreData: { ...newData, data: [...state.genreData.data, ...newData.data] }
                };
            } else {
                return { ...state, genreData: newData };
            }
        }
        default:
            return state
    }
}
