package com.vlocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class SimStateReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d("SimStateReceiver", "Received action: $action")

        if (action == "android.intent.action.SIM_STATE_CHANGED" ||
            action == Intent.ACTION_BOOT_COMPLETED) {
            
            // Check logic inside SimUtil
            SimUtil.checkAndSyncSimChange(context)
        }
    }
}
