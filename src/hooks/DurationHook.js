import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"

export const durationHook = (movieOrSeriesId, playTimeStamps) => {
    const { user } = useSelector(state => state.auth)
    const timerRef = useRef(null)
    const lastLoggedRef = useRef({ id: null, ts: null }) // avoid duplicate logs for same value

    console.log(playTimeStamps, movieOrSeriesId)
    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        // Guard: need valid user, movie id and a non-zero timestamp
        if (!user?._id || !movieOrSeriesId || playTimeStamps == null || playTimeStamps === 0) {
            // if timestamp becomes 0 or data missing, cancel any pending timer
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
            return
        }

        // If we've already logged this exact (movieId, timestamp) pair, don't reschedule
        if (lastLoggedRef.current.id === movieOrSeriesId &&
            lastLoggedRef.current.ts === playTimeStamps) {
            return
        }

        // reset existing timer and schedule new debounce for 30 seconds
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
            // double-check conditions at the time of firing
            if (!user?._id || !movieOrSeriesId || playTimeStamps == null || playTimeStamps === 0) {
                timerRef.current = null
                return
            }

            const payload = {
                userId: user._id,
                movieOrSeriesId,
                playTimeStamps
            }
            console.log("Api call with data", payload)

            // mark this pair as logged so we don't duplicate logs
            lastLoggedRef.current = { id: movieOrSeriesId, ts: playTimeStamps }
            timerRef.current = null
        }, 30 * 1000)

        // cleanup if dependencies change before timeout
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
    }, [user?._id, movieOrSeriesId, playTimeStamps])
}
