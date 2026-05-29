import { WISHLIST_DATA } from "../types";

const initialState = {
    wishlist: null,
}

export const wishlistReducer = (state = initialState, action) => {
    switch (action.type) {
        case WISHLIST_DATA: {
            const newData = action.payload;
            if (newData?.currentPage > 1 && state.wishlist?.data) {
                return {
                    ...state,
                    wishlist: { ...newData, data: [...state.wishlist.data, ...newData.data] }
                };
            } else {
                return { ...state, wishlist: newData };
            }
        }
        case WISHLIST_DATA:
            return { ...state, wishlist: action.payload }
        default:
            return state
    }
} 