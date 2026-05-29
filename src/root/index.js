import { useDispatch, useSelector } from 'react-redux'
import Auth from '../navigation/stackNavigation/Auth'
import Main from '../navigation/stackNavigation/Main'
import { companyApi } from '../redux/actions/companyAction'
import { useEffect } from 'react'
import { checkAppUpdate } from '../services/inappupdate/appUpdate'


const Root = () => {

    const dispatch = useDispatch()
    const { token } = useSelector(state => state.auth)
    const { company } = useSelector(state => state.company)

    useEffect(() => {
        dispatch(companyApi({}))
    }, [])

    if (company?.updateStatus) checkAppUpdate(company?.updateStatus)

    return (
        <>
            {token ? <Main /> : <Auth />}
        </>
    )
}

export default Root
