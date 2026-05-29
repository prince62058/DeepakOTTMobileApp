import { NOTIFICATION_DATA, NOTIFICATION_COUNT } from "../types";


const initialState = {
    notifications: null,
    notificationCount: null,
}

export const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case NOTIFICATION_DATA:
            return { ...state, notifications: action.payload }
        case NOTIFICATION_COUNT:
            return { ...state, notificationCount: action.payload }
        default:
            return state
    }
} 