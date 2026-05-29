import { COMPANY_DATA, FAQ_DATA } from "../types"

const initialState = {
    company: null,
    faqs: null,
}

export const companyReducer = (state = initialState, action) => {
    switch (action.type) {
        case COMPANY_DATA:
            return { ...state, company: action.payload }
        case FAQ_DATA:
            return { ...state, faqs: action.payload }
        default:
            return state
    }
}
