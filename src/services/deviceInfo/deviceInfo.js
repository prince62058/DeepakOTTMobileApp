import DeviceInfo from 'react-native-device-info'

export async function getDeviceData() {
    try {
        const deviceData = {
            deviceId: DeviceInfo.getDeviceId(), // Model ID (e.g., "iPhone13,4")
            brand: DeviceInfo.getBrand(),       // Brand (e.g., "Apple")
            model: DeviceInfo.getModel(),       // Model name (e.g., "iPhone 12 Pro Max")
            systemName: DeviceInfo.getSystemName(), // "iOS" or "Android"
            systemVersion: DeviceInfo.getSystemVersion(), // OS version (e.g., "17.0")
            uniqueId: DeviceInfo.getUniqueId(), // Unique device ID
            appVersion: DeviceInfo.getVersion(), // App version (e.g., "1.0.3")
            buildNumber: DeviceInfo.getBuildNumber(), // Build number
            ipAddress: await DeviceInfo.getIpAddress(), // Device IP address
        }

        return deviceData
    } catch (error) {
        console.error("Error getting device info:", error)
        return {}
    }
}
