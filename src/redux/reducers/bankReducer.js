import { BANK_DATA } from "../types"

const initialState = {
    banks: null,
}

export const bankReducer = (state = initialState, action) => {
    switch (action.type) {
        case BANK_DATA:
            return { ...state, banks: action.payload }
        default:
            return state
    }
}
