import { TRANSACTION_DATA } from "../types";


const initialState = {
    transaction: null,
}

export const transactionReducer = (state = initialState, action) => {
    switch (action.type) {
        case TRANSACTION_DATA: {
            const newData = action.payload;
            if (newData?.currentPage > 1 && state.transaction?.data) {
                return {
                    ...state,
                    transaction: { ...newData, data: [...state.transaction.data, ...newData.data] }
                };
            } else {
                return { ...state, transaction: newData };
            }
        }
        default:
            return state
    }
} 