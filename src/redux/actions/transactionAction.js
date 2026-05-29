import { getApi, postApi } from "../../services/axios/api"
import { showToast } from "../../utils/ToastAndroid"
import { getTransactionEndpoint, withdrawReqEndpoint } from "../api/apiEndpoint"
import { TRANSACTION_DATA } from "../types"
import { getProfileApi } from "./authAction"

const handleError = (error, cb, endpoint) => {
    // console.log(`${endpoint} API ERROR -->`, error)
    showToast(error)
    cb?.(false)
}


export const getTransactionApi = ({ cb, page = 1, limit = 10 }) => async (dispatch, getState) => {
    const { user } = getState().auth
    const params = { userId: user?._id, page, limit }
    try {
        cb?.(true)
        const response = await getApi(`${getTransactionEndpoint}`, params)
        if (response?.status === 200 || response?.status === 201) {
            console.log(`${getTransactionEndpoint} API RESPONSE -->`, response?.data)
            dispatch({ type: TRANSACTION_DATA, payload: response?.data })
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, getTransactionEndpoint)
    }
}

export const withdrawReqApi = ({ cb, data, success }) => async (dispatch, getState) => {
    try {
        cb?.(true)
        const response = await postApi(`${withdrawReqEndpoint}`, data)
        if (response?.status === 200 || response?.status === 201) {
            console.log(`${withdrawReqEndpoint} API RESPONSE -->`, response?.data?.data)
            success()
            showToast(response?.data?.message)
            dispatch(getTransactionApi({}))
            dispatch(getProfileApi({}))
            cb?.(false)
        }
    } catch (error) {
        handleError(error, cb, withdrawReqEndpoint)
    }
}

