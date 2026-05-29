import { getApi, postApi } from "../../services/axios/api"
import { showToast } from "../../utils/ToastAndroid"
import { companyEndpoint, faqEndpoint, imageUploadEndpoint } from "../api/apiEndpoint"
import { COMPANY_DATA, FAQ_DATA } from "../types"

const handleError = (error, cb, endpoint) => {
    // console.log(`${endpoint} API ERROR -->`, error)
    showToast(error)
    cb?.(false)
}


export const companyApi = ({ cb }) => async (dispatch, getState) => {
    const { user } = getState().auth
    try {
        cb?.(true)
        const response = await getApi(`${companyEndpoint}`)
        if (response?.status === 200 || response?.status === 201) {
            // console.log(`${companyEndpoint} API RESPONSE -->`, response?.data?.data)
            dispatch({ type: COMPANY_DATA, payload: response?.data?.data })
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, companyEndpoint)
    }
}

export const faqApi = ({ cb }) => async (dispatch, getState) => {
    const { user } = getState().auth
    try {
        cb?.(true)
        const response = await getApi(`${faqEndpoint}`)
        if (response?.status === 200 || response?.status === 201) {
            // console.log(`${faqEndpoint} API RESPONSE -->`, response?.data?.data)
            dispatch({ type: FAQ_DATA, payload: response?.data?.data })
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, faqEndpoint)
    }
}


export const uploadImage = ({ cb, data, success }) => async (dispatch, getState) => {
    const { user } = getState().auth
    try {
        cb?.(true)
        const response = await postApi(`${imageUploadEndpoint}`, data, {}, true)
        if (response?.status === 200 || response?.status === 201) {
            console.log(`${imageUploadEndpoint} API RESPONSE -->`, response?.data)
            success(response?.data?.URL)
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, imageUploadEndpoint)
    }
}