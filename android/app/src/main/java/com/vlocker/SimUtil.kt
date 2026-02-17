package com.vlocker

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.app.ActivityCompat
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

object SimUtil {
    private const val TAG = "SimUtil"
    private const val PREFS_NAME = "VLockerPrefs"
    private const val KEY_SAVED_SIMS = "saved_sim_details"

    private fun getApiUrl(): String {
        return if (BuildConfig.DEBUG) {
            "http://172.20.10.2:3005/api/customerLoan/device/sim"
        } else {
            "https://api.vlocker.in/api/customerLoan/device/sim"
        }
    }

    data class SimDetails(
        val slotIndex: Int,
        val subscriptionId: Int,
        val carrierName: String,
        val iccid: String,
        val number: String, // Note: Might be empty on some carriers/OS versions
        val countryIso: String
    ) {
        fun toJson(): JSONObject {
            return JSONObject().apply {
                put("slotIndex", slotIndex)
                put("subscriptionId", subscriptionId)
                put("carrierName", carrierName)
                put("iccid", iccid)
                put("number", number)
                put("countryIso", countryIso)
            }
        }
    }

    @SuppressLint("MissingPermission")
    fun getSimDetails(context: Context): List<SimDetails> {
        val simList = mutableListOf<SimDetails>()
        try {
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
                Log.e(TAG, "READ_PHONE_STATE permission missing")
                return simList
            }

            val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            val activeSubscriptionInfoList = subscriptionManager.activeSubscriptionInfoList

            if (activeSubscriptionInfoList != null) {
                for (subInfo in activeSubscriptionInfoList) {
                    val number = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                         // On Android 13+, obtaining phone number might require READ_PHONE_NUMBERS
                         if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED) {
                             try {
                                 subscriptionManager.getPhoneNumber(subInfo.subscriptionId) ?: subInfo.number ?: ""
                             } catch (e: Exception) {
                                 subInfo.number ?: ""
                             }
                         } else {
                             subInfo.number ?: ""
                         }
                    } else {
                        subInfo.number ?: ""
                    }
                    
                    val details = SimDetails(
                        slotIndex = subInfo.simSlotIndex,
                        subscriptionId = subInfo.subscriptionId,
                        carrierName = subInfo.carrierName.toString(),
                        iccid = subInfo.iccId ?: "",
                        number = number,
                        countryIso = subInfo.countryIso ?: ""
                    )
                    simList.add(details)
                    Log.d(TAG, "Found SIM: $details")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting SIM details: ${e.message}")
        }
        return simList
    }

    fun checkAndSyncSimChange(context: Context) {
        thread {
            try {
                val currentSims = getSimDetails(context)
                if (currentSims.isEmpty()) {
                    Log.d(TAG, "No active SIMs found.")
                    return@thread
                }

                val sharedPref = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val savedSimsJson = sharedPref.getString(KEY_SAVED_SIMS, "[]")
                val savedSimsArray = JSONArray(savedSimsJson)
                
                // Compare logic: If ICCID sets don't match, trigger sync
                val currentIccids = currentSims.map { it.iccid }.toSet()
                val savedIccids = mutableSetOf<String>()
                
                for (i in 0 until savedSimsArray.length()) {
                    val obj = savedSimsArray.getJSONObject(i)
                    if (obj.has("iccid")) {
                        savedIccids.add(obj.getString("iccid"))
                    }
                }

                // If sets differ, we have a change (or first run)
                if (currentIccids != savedIccids) {
                    Log.i(TAG, "SIM Change Detected! Saved: $savedIccids, Current: $currentIccids")
                    
                    // 1. Send to server
                    val success = sendSimDetailsToServer(context, currentSims)
                    
                    // 2. If success, update local cache
                    if (success) {
                        val newSimsJsonArray = JSONArray()
                        currentSims.forEach { newSimsJsonArray.put(it.toJson()) }
                        sharedPref.edit().putString(KEY_SAVED_SIMS, newSimsJsonArray.toString()).apply()
                        Log.d(TAG, "SIM details saved locally.")
                    } else {
                        Log.w(TAG, "Failed to sync SIM details to server. Will retry next time.")
                    }
                } else {
                    Log.d(TAG, "No SIM change detected.")
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error in checkAndSyncSimChange: ${e.message}")
            }
        }
    }

    fun syncSimDetails(context: Context) {
        thread {
            try {
                Log.i(TAG, "Force Syncing SIM details...")
                val currentSims = getSimDetails(context)
                if (currentSims.isEmpty()) {
                    Log.d(TAG, "No active SIMs found for force sync.")
                    return@thread
                }

                val success = sendSimDetailsToServer(context, currentSims)
                if (success) {
                    val sharedPref = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    val newSimsJsonArray = JSONArray()
                    currentSims.forEach { newSimsJsonArray.put(it.toJson()) }
                    sharedPref.edit().putString(KEY_SAVED_SIMS, newSimsJsonArray.toString()).apply()
                    Log.d(TAG, "SIM details force synced and saved locally.")
                } else {
                    Log.e(TAG, "Failed to force sync SIM details to server.")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error in syncSimDetails: ${e.message}")
            }
        }
    }

    private fun sendSimDetailsToServer(context: Context, simList: List<SimDetails>): Boolean {
        return try {
            val deviceId = getDeviceIdentifier(context)
            
            val sharedPref = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val loanPhone = sharedPref.getString("loan_phone", "")
            
            val jsonBody = JSONObject()
            jsonBody.put("deviceId", deviceId)
            if (!loanPhone.isNullOrEmpty()) {
                jsonBody.put("phone", loanPhone)
            }
            
            val simArray = JSONArray()
            simList.forEach { simArray.put(it.toJson()) }
            jsonBody.put("simDetails", simArray)
            jsonBody.put("timestamp", System.currentTimeMillis())

            val apiUrl = getApiUrl()
            Log.d(TAG, "Sending SIM details to $apiUrl: $jsonBody")

            val url = URL(apiUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
            connection.doOutput = true
            connection.connectTimeout = 15000
            connection.readTimeout = 15000

            val os = OutputStreamWriter(connection.outputStream)
            os.write(jsonBody.toString())
            os.flush()
            os.close()

            val responseCode = connection.responseCode
            Log.d(TAG, "Server Response Code: $responseCode")
            
            if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_CREATED) {
                 Log.d(TAG, "SIM details updated successfully")
                 true
            } else {
                Log.e(TAG, "Server error: ${connection.errorMessage()}")
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Network error sending SIM details: ${e.message}")
            false
        }
    }
    
    // Configurable Device ID getter (Synchronized with LockService/LocationUtil)
    private fun getDeviceIdentifier(context: Context): String {
        try {
            val sharedPref = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val loanImei = sharedPref.getString("loan_imei", null)
            
            if (!loanImei.isNullOrEmpty()) {
                Log.d(TAG, "Using Loan IMEI: $loanImei")
                return loanImei
            }

            val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as? android.telephony.TelephonyManager
            val imei = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
                        telephonyManager?.imei
                    } else null
                } catch (e: SecurityException) { null }
            } else {
                @Suppress("DEPRECATION")
                try {
                    if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
                        telephonyManager?.deviceId
                    } else null
                } catch (e: SecurityException) { null }
            }

            return imei ?: android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID)
        } catch (e: Exception) {
            return android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID)
        }
    }
    
    private fun HttpURLConnection.errorMessage(): String {
        return try {
            errorStream?.bufferedReader()?.use { it.readText() } ?: "Unknown Error"
        } catch (e: Exception) {
            e.message ?: "Error reading error stream"
        }
    }
}
