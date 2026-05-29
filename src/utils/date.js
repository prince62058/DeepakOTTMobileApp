export const dateFormate = (date) => {
    if (!date) return null
    const value = new Date(date)
    return value?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

}

export const timeFormate = (date) => {
    if (!date) return null
    const value = new Date(date)
    return value?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}


export const getNextMidnightISO = () => {
    const now = new Date()
    const nextMidnight = new Date(now)

    // Move to next day
    nextMidnight.setDate(now.getDate() + 1)
    nextMidnight.setHours(0, 0, 0, 0)

    return nextMidnight
}
