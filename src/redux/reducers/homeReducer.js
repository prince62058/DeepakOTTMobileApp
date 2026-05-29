import {
    HOME_DATA,
    TRENDING_DATA,
    RECOMMAND_DATA,
    NEWRELEASE_DATA,
    CATEGORY_DATA,
} from "../types";

const initialState = {
    home: null,
    trending: null,
    recommand: null,
    newrelease: null,
    category: null,
};

export const homeReducer = (state = initialState, action) => {
    switch (action.type) {
        case HOME_DATA:
            return { ...state, home: action.payload };
        case TRENDING_DATA: {
            const newData = action.payload
            if (newData?.currentPage > 1 && state.trending?.data) {
                return {
                    ...state,
                    trending: { ...newData, data: [...state.trending.data, ...newData.data] },
                }
            } else {
                return { ...state, trending: newData }
            }
        }
        case RECOMMAND_DATA: {
            const newData = action.payload
            if (newData?.currentPage > 1 && state.recommand?.data) {
                return {
                    ...state,
                    recommand: { ...newData, data: [...state.recommand.data, ...newData.data] },
                }
            } else {
                return { ...state, recommand: newData }
            }
        }
        case NEWRELEASE_DATA:
            return { ...state, newrelease: action.payload };
        case CATEGORY_DATA:
            return { ...state, category: action.payload };
        default:
            return state;
    }
};
