/*
    Redux Store Configuration with Persistence

    Purpose:
    - Configure the global Redux store using Redux Toolkit.
    - Enable persistence with redux-persist so the state (e.g., auth, user data)
      is saved in AsyncStorage and rehydrated on app restart.

    Key Concepts:
    - persistConfig → Defines how redux-persist should store data.
        - key: 'root' → The top-level key in storage.
        - storage: AsyncStorage → Where the data is stored (React Native async storage).
    - persistReducer → Wraps the rootReducer with persistence capabilities.
    - store → The Redux store created using configureStore from Redux Toolkit.
    - persistor → Persists and rehydrates the store automatically.
    - middleware → Default middlewares with immutability & serializability checks disabled
      (to avoid warnings when storing non-serializable data like Dates, FormData, etc.).

    Flow:
    1. User interacts with app → actions dispatched → reducers update state.
    2. redux-persist saves updated state in AsyncStorage.
    3. On app reload, redux-persist rehydrates the state from AsyncStorage.
*/

import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore } from "@reduxjs/toolkit"
import { persistReducer, persistStore } from "redux-persist"
import { rootReducer } from './reducers/rootReducer'

// 🔹 Config for redux-persist
const persistConfig = {
    key: 'root',             // storage key
    storage: AsyncStorage,   // storage engine for React Native
}

// 🔹 Wrap root reducer with persistence capabilities
const persistedRootReducers = persistReducer(persistConfig, rootReducer)

// 🔹 Configure Redux store
export const store = configureStore({
    reducer: persistedRootReducers,
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware({
            immutableCheck: false,     // disable immutability check for performance
            serializableCheck: false,  // disable serializable check for non-serializable values
        })
    ]
})

// 🔹 Persistor to rehydrate store on app reload
export const persistor = persistStore(store)
