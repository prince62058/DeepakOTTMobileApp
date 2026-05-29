/*
    Definition: 
    A reducer is a pure function that takes the current state and an action, 
    then returns a new state without mutating the existing one. 
    Reducers decide how the state should change in response to dispatched actions.

    This Reducer (authReducer):
    - Manages the authentication state of the application.
    - Stores and updates the "token" (e.g., JWT token after login).
    - Stores and updates the "user" data (e.g., user profile information).
    - Returns the current state unchanged if the action type is not recognized.
*/

import { USER_TOKEN, USER_DATA, LANGUAGE_DATA, GENRE_DATA } from "../types"

const initialState = {
    token: null,
    user: null,
    languages: null,
    genre: null
}

export const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case USER_TOKEN:
            return { ...state, token: action.payload.token, user: action.payload.user }
        case USER_DATA:
            return { ...state, user: action.payload }
        case LANGUAGE_DATA:
            return { ...state, languages: action.payload }
        case GENRE_DATA:
            return { ...state, genre: action.payload }
        default:
            return state
    }
}
