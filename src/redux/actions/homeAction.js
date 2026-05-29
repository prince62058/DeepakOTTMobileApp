import { getApi } from "../../services/axios/api"
import { showToast } from "../../utils/ToastAndroid"
import { categoryEndpoint, homeEndpoint, newReleaseEndpoint, recommandedEndpoint, trendingEndpoint } from "../api/apiEndpoint"
import { TRENDING_DATA, RECOMMAND_DATA, NEWRELEASE_DATA, CATEGORY_DATA, HOME_DATA } from "../types"

const handleError = (error, cb, endpoint) => {
    console.log(`${endpoint} API ERROR -->`, error)
    showToast(error)
    cb?.(false)
}


export const homeApi = ({ cb }) => async (dispatch, getState) => {
    const { user } = getState().auth
    const params = { userId: user?._id }
    try {
        // cb?.(true)
        const response = await getApi(`${homeEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            // console.log(`${homeEndpoint} API RESPONSE -->`, response?.data?.data)
            dispatch({ type: HOME_DATA, payload: response?.data?.data })
            // cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, homeEndpoint)
    }
}

export const newReleaseApi = ({ cb }) => async (dispatch, getState) => {
    const { user } = getState().auth
    try {
        // cb?.(true)
        const response = await getApi(`${newReleaseEndpoint}`)
        if (response?.status === 200 || response?.status === 201) {
            // console.log(`${newReleaseEndpoint} API RESPONSE -->`, response?.data?.data)
            dispatch({ type: NEWRELEASE_DATA, payload: response?.data?.data })
            // cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, newReleaseEndpoint)
    }
}

export const trendingApi = ({ cb, page = 1, limit = 21 }) => async (dispatch, getState) => {
    const params = { page, limit }
    try {
        cb?.(true)
        const response = await getApi(`${trendingEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            // console.log(`${trendingEndpoint} API RESPONSE -->`, response?.data)
            dispatch({ type: TRENDING_DATA, payload: response?.data })
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, trendingEndpoint)
    }
}

export const recommandedApi = ({ cb, page = 1, limit = 21 }) => async (dispatch, getState) => {
    const { user } = getState().auth
    const params = { userId: user?._id, page, limit }
    try {
        cb?.(true)
        const response = await getApi(`${recommandedEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            // console.log(`${recommandedEndpoint} API RESPONSE -->`, response?.data)
            dispatch({ type: RECOMMAND_DATA, payload: response?.data })
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, recommandedEndpoint)
    }
}

export const categoryApi = ({ cb, mainType = 'MOVIE' }) => async (dispatch, getState) => {
    const { user } = getState().auth
    const params = { mainType, userId: user?._id }
    try {
        cb?.(true)
        const response = await getApi(`${categoryEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            // console.log(`${categoryEndpoint} API RESPONSE -->`, response?.data?.data)
            dispatch({ type: CATEGORY_DATA, payload: response?.data?.data })
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, categoryEndpoint)
    }
}