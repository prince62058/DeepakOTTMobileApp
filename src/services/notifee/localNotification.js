import notifee, { AndroidImportance, AndroidCategory, EventType } from '@notifee/react-native'


const channelId = "create-audio-channel";
const notificatioId = "12345"
const ANDROID_SOUND = 'clockin'
const IOS_SOUND = 'default'

const androidActions = [
    { title: '<p style="color: #6938EF"><b>Clock-in</b> &#128111</p>', pressAction: { id: 'accept', launchActivity: 'default' } },
    { title: '<p style="color: #000000"><b>Cancel</b> &#128557</p>', pressAction: { id: 'cancel' } },
]

const ongoingActions = [
    { pressAction: { id: 'hangup' }, title: 'Hang up', titleColor: '#F44336' },
]

export const createNotification = async () => {
    setupNotifeeListeners(channelId)
    await setupAndroidChannel(channelId)
    await displayNotifeeNotification(notificatioId, channelId)
}

export const setupNotifeeListeners = (channelId) => {
    console.log('1. Initializing Notifee listeners : ', channelId)
    // Foreground handler
    notifee.onForegroundEvent((event) =>
        handleNotificationEvent(event, channelId)
    )
    // Background handler
    notifee.onBackgroundEvent(async (event) =>
        handleNotificationEvent(event, channelId)
    )
}


// Event Listeners
const handleNotificationEvent = ({ type, detail }, channelId) => {
    if (type === EventType.ACTION_PRESS && detail.notification) {
        const { id: actionId } = detail.pressAction
        const notificationId = detail.notification.id

        if (actionId === 'accept') {
            // updateNotifeeNotification(notificationId, channelId)
            deleteNotifeeNotification(notificationId)
        } else if (['cancel', 'hangup'].includes(actionId)) {
            deleteNotifeeNotification(notificationId)
        }
    }
}

// Channel/Group Management
export const setupAndroidChannel = async (channelId) => {
    console.log('2. Configuring Notifee channel:', channelId)
    await notifee.deleteChannel(channelId)
    await notifee.createChannel({
        id: channelId,
        name: 'Attandance Reminder',
        importance: AndroidImportance.HIGH,
        sound: ANDROID_SOUND,
        vibration: true,
        vibrationPattern: [500, 300],
        bypassDnd: true,
    })
}


// Notification Display
export const displayNotifeeNotification = async (notificationId, channelId) => {
    console.log('3. Displaying Notifee notification : ', channelId, notificationId)

    const notificationConfig = {
        id: notificationId,
        title: 'Attandance',
        body: 'Today attandance reminder!',
        ios: {
            sound: IOS_SOUND,
            categoryId: 'call',
            critical: true,
        },
        android: {
            channelId,
            sound: ANDROID_SOUND,
            importance: AndroidImportance.HIGH,
            category: AndroidCategory.CALL,
            actions: androidActions,
            pressAction: { id: 'default', launchActivity: 'default' },
            loopSound: false, // Android-specific loop control
            timeoutAfter: 10000, // Auto-cancel after 60s
        },
    }

    await notifee.displayNotification(notificationConfig)
}





// Permission Handling
// export const requestNotifeePermission = async () => {
//     console.log('2. Requesting notification permissions')
//     const { authorizationStatus } = await notifee.requestPermission({
//         sound: true,
//         alert: true,
//         badge: true,
//         criticalAlert: true,
//     })
//     return authorizationStatus
// }

// Notification Update
export const updateNotifeeNotification = async (id, channelId) => {
    console.log('4. Updating to ongoing notification')

    await notifee.displayNotification({
        id,
        title: 'Active Call',
        body: '00:00',
        android: {
            channelId,
            importance: AndroidImportance.HIGH,
            category: AndroidCategory.CALL,
            actions: ongoingActions,
            ongoing: true,
            showChronometer: true,
            largeIcon: 'callicon',
        },
        ios: {
            sound: undefined, // Explicitly remove sound for iOS update
            categoryId: 'ongoing-call',
        },
    })
}

// Notification Removal
export const deleteNotifeeNotification = async (notificationId) => {
    console.log('5. Removing notification:', notificationId)
    await notifee.cancelNotification(notificationId)
}