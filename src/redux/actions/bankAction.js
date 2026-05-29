import { deleteApi, getApi, postApi } from "../../services/axios/api"
import { showToast } from "../../utils/ToastAndroid"
import { createBankEndpoint, deleteBankEndpoint, getAllBankEndpoint, getBankDetailsEndpoint } from "../api/apiEndpoint"
import { BANK_DATA } from "../types"

const handleError = (error, cb, endpoint) => {
    // console.log(`${endpoint} API ERROR -->`, error)
    showToast(error)
    cb?.(false)
}


export const getAllBankApi = ({ cb, page = 1 }) => async (dispatch, getState) => {
    const { user } = getState().auth
    const params = { page, userId: user?._id }
    try {
        cb?.(true)
        const response = await getApi(`${getAllBankEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            console.log(`${getAllBankEndpoint} API RESPONSE -->`, response?.data?.data)
            dispatch({ type: BANK_DATA, payload: response?.data?.data })
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, getAllBankEndpoint)
    }
}

export const getBankDetailApi = ({ cb, bankAccountId }) => async (dispatch) => {
    const params = { bankAccountId }
    try {
        cb?.(true)
        const response = await getApi(`${getBankDetailsEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            console.log(`${getBankDetailsEndpoint} API RESPONSE -->`, response?.data?.data)
            // dispatch({ type: BANK_DATA, payload: response?.data?.data })
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, getBankDetailsEndpoint)
    }
}

export const createBankApi = ({ cb, data, success }) => async (dispatch, getState) => {
    try {
        cb?.(true)
        const response = await postApi(`${createBankEndpoint}`, data)
        if (response?.status === 200 || response?.status === 201) {
            console.log(`${createBankEndpoint} API RESPONSE -->`, response?.data?.data)
            success()
            showToast(response?.data?.message)
            dispatch(getAllBankApi({}))
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, createBankEndpoint)
    }
}

export const deleteBankApi = ({ cb, bankAccountId }) => async (dispatch, getState) => {
    const params = { bankAccountId }
    try {
        cb?.(true)
        const response = await deleteApi(`${deleteBankEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            console.log(`${deleteBankEndpoint} API RESPONSE -->`, response?.data?.data)
            showToast(response?.data?.message)
            dispatch(getAllBankApi({}))
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, deleteBankEndpoint)
    }
}