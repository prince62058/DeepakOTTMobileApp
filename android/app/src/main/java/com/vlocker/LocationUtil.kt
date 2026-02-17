package com.vlocker

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

object LocationUtil {
    private const val TAG = "LocationUtil"
    private const val PREFS_NAME = "VLockerPrefs"

    private fun getApiUrl(): String {
        return if (BuildConfig.DEBUG) {
            "http://172.20.10.2:3005/api/customerLoan/location"
        } else {
            "https://api.vlocker.in/api/customerLoan/location"
        }
    }

    @SuppressLint("MissingPermission")
    fun RequestAndSendLocation(context: Context) {
        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.e(TAG, "Location permissions missing")
            return
        }

        try {
            val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            
            // Try to get last known location first for speed
            val lastKnownLocationGPS = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
            val lastKnownLocationNetwork = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            
            var bestLocation = lastKnownLocationGPS
            if (lastKnownLocationNetwork != null) {
                if (bestLocation == null || lastKnownLocationNetwork.time > bestLocation.time) {
                    bestLocation = lastKnownLocationNetwork
                }
            }

            if (bestLocation != null && (System.currentTimeMillis() - bestLocation.time < 2 * 60 * 1000)) {
                // If last known location is very recent (< 2 mins), use it
                Log.d(TAG, "Using very recent last known location")
                sendLocationToServer(context, bestLocation.latitude, bestLocation.longitude)
            } else {
                // Request single update
                Log.d(TAG, "Requesting new location update (Exact Priority)")
                val locationListener = object : LocationListener {
                    override fun onLocationChanged(location: Location) {
                        Log.d(TAG, "Location received: ${location.latitude}, ${location.longitude} via ${location.provider}")
                        sendLocationToServer(context, location.latitude, location.longitude)
                        locationManager.removeUpdates(this)
                    }
                    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                    override fun onProviderEnabled(provider: String) {}
                    override fun onProviderDisabled(provider: String) {}
                }

                // EXACT LOCATION FIX: Prioritize GPS for "exact" location
                // If indoors, GPS might fail, so we fallback to Network, but we TRY GPS first.
                if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                     Log.d(TAG, "Requesting GPS update")
                     locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0L, 0f, locationListener, context.mainLooper)
                } else if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                     Log.d(TAG, "GPS disabled, falling back to Network")
                     locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0L, 0f, locationListener, context.mainLooper)
                } else {
                     Log.e(TAG, "No location provider enabled")
                }
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error requesting location: ${e.message}")
        }
    }

    private fun sendLocationToServer(context: Context, latitude: Double, longitude: Double) {
        thread {
            try {
                val deviceId = getDeviceIdentifier(context)
                val jsonBody = JSONObject().apply {
                    put("deviceId", deviceId)
                    put("latitude", latitude)
                    put("longitude", longitude)
                }

                val apiUrl = getApiUrl()
                Log.d(TAG, "Sending location to $apiUrl: $jsonBody")

                val url = URL(apiUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                connection.connectTimeout = 15000
                connection.readTimeout = 15000
                connection.doOutput = true
                
                val os = OutputStreamWriter(connection.outputStream)
                os.write(jsonBody.toString())
                os.flush()
                os.close()

                val responseCode = connection.responseCode
                Log.d(TAG, "Location Send Response: $responseCode")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send location: ${e.message}")
            }
        }
    }

    private fun getDeviceIdentifier(context: Context): String {
        try {
            val sharedPref = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val loanImei = sharedPref.getString("loan_imei", null)
            
            if (!loanImei.isNullOrEmpty()) {
                Log.d(TAG, "Using Loan IMEI: $loanImei")
                return loanImei
            }

            // Fallback to real hardware IMEI if READ_PHONE_STATE is granted (aligned with LockService)
            val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as? android.telephony.TelephonyManager
            val imei = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
                        telephonyManager?.imei
                    } else null
                } catch (e: SecurityException) {
                    null
                }
            } else {
                @Suppress("DEPRECATION")
                try {
                    if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
                        telephonyManager?.deviceId
                    } else null
                } catch (e: SecurityException) {
                    null
                }
            }

            return imei ?: android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID)
        } catch (e: Exception) {
            return android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID)
        }
    }
}
