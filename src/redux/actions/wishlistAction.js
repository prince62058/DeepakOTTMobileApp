import { deleteApi, getApi, postApi } from "../../services/axios/api"
import { showToast } from "../../utils/ToastAndroid"
import { addWisthlistEndpoint, deleteWisthlistEndpoint, wisthlistEndpoint } from "../api/apiEndpoint"
import { WISHLIST_DATA } from "../types"
import { getMovieTrailerApi } from "./watchAction"

const handleError = (error, cb, endpoint) => {
    // console.log(`${endpoint} API ERROR -->`, error)
    showToast(error)
    cb?.(false)
}


export const wishlistApi = ({ cb, page = 1, limit = 20 }) => async (dispatch, getState) => {
    const { user } = getState().auth
    const params = { userId: user?._id, page, limit }
    try {
        cb?.(true)
        const response = await getApi(`${wisthlistEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            console.log(`${wisthlistEndpoint} API RESPONSE -->`, response?.data)
            dispatch({ type: WISHLIST_DATA, payload: response?.data })
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, wisthlistEndpoint)
    }
}

export const createWishlistApi = ({ cb, id }) => async (dispatch, getState) => {
    const { user } = getState().auth
    const data = { userId: user?._id, movieOrSeriesId: id }
    try {
        cb?.(true)
        const response = await postApi(`${addWisthlistEndpoint}`, data)
        if (response?.status === 200 || response?.status === 201) {
            // console.log(`${addWisthlistEndpoint} API RESPONSE -->`, response?.data)
            dispatch(getMovieTrailerApi({ id }))
            dispatch(wishlistApi({}))
            showToast(response?.data?.message || 'Added to wishlist')
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, addWisthlistEndpoint)
    }
}


export const deleteWishlistApi = ({ cb, id }) => async (dispatch, getState) => {
    const { user } = getState().auth
    const params = { userId: user?._id, movieOrSeriesId: id }
    try {
        cb?.(true)
        const response = await deleteApi(`${deleteWisthlistEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            // console.log(`${deleteWisthlistEndpoint} API RESPONSE -->`, response?.data)
            dispatch(wishlistApi({}))
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, deleteWisthlistEndpoint)
    }
}