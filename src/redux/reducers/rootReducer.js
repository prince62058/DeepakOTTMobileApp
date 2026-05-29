/*
    Definition:
    A root reducer is the main reducer function that combines multiple smaller reducers 
    into a single state tree using Redux's `combineReducers`. Each reducer manages its 
    own slice of the state, and the root reducer merges them together.

    In this Example:
    - We combine `authReducer` (manages authentication: token & user data) 
      with other reducers if needed (e.g., productReducer, cartReducer, etc.).
    - The root reducer defines the overall shape of the Redux store state.
    - Example structure of state after combining:
        {
            auth: { token: "...", user: {...} },
        }
*/

import { combineReducers } from 'redux'
import { authReducer } from './authReducer'
import { companyReducer } from './companyReducer'
import { notificationReducer } from './notificationReducer'
import { subscriptionReducer } from './subscriptionReducer'
import { bankReducer } from './bankReducer'
import { transactionReducer } from './transactionReducer'
import { wishlistReducer } from './wishlistReducer'
import { watchlistReducer } from './watchReducer'
import { homeReducer } from './homeReducer'
import { searchReducer } from './searchReducer'

export const rootReducer = combineReducers({
    auth: authReducer,
    company: companyReducer,
    notification: notificationReducer,
    subscription: subscriptionReducer,
    banks: bankReducer,
    transaction: transactionReducer,
    wishlist: wishlistReducer,
    watchlist: watchlistReducer,
    home: homeReducer,
    search: searchReducer,
})
