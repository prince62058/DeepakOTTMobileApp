import { SUBSCRIPTION_DATA } from "../types";


const initialState = {
    subscription: null,
}

export const subscriptionReducer = (state = initialState, action) => {
    switch (action.type) {
        case SUBSCRIPTION_DATA:
            return { ...state, subscription: action.payload }
        default:
            return state
    }
} 