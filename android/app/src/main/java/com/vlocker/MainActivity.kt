package com.vlocker

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "VLocker"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  private var screenReceiver: ScreenReceiver? = null

  override fun onCreate(savedInstanceState: android.os.Bundle?) {
    super.onCreate(savedInstanceState)
    
    // keyguard handling moved to common function or ensured here
    applyLockScreenFlags()

    // Register Screen Receiver
    val filter = android.content.IntentFilter(android.content.Intent.ACTION_SCREEN_ON)
    filter.addAction(android.content.Intent.ACTION_SCREEN_OFF)
    screenReceiver = ScreenReceiver(application as com.facebook.react.ReactApplication)
    registerReceiver(screenReceiver, filter)

    // Start LockService
    val lockServiceIntent = android.content.Intent(this, LockService::class.java)
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      startForegroundService(lockServiceIntent)
    } else {
      startService(lockServiceIntent)
    }

    checkAndGrantPermissions()
  }

  private fun checkAndGrantPermissions() {
    try {
        val dpm = getSystemService(android.content.Context.DEVICE_POLICY_SERVICE) as? android.app.admin.DevicePolicyManager
        val componentName = android.content.ComponentName(this, MyDeviceAdminReceiver::class.java)

        val permissions = mutableListOf(
            android.Manifest.permission.ACCESS_FINE_LOCATION,
            android.Manifest.permission.ACCESS_COARSE_LOCATION,
            android.Manifest.permission.READ_PHONE_STATE,
            android.Manifest.permission.READ_PHONE_NUMBERS,
            android.Manifest.permission.READ_SMS
        )

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            permissions.add(android.Manifest.permission.ACCESS_BACKGROUND_LOCATION)
        }

        if (dpm != null && dpm.isDeviceOwnerApp(packageName)) {
            // Grant Permissions silently as Device Owner
            permissions.forEach { perm ->
                val granted = dpm.setPermissionGrantState(componentName, packageName, perm, android.app.admin.DevicePolicyManager.PERMISSION_GRANT_STATE_GRANTED)
                android.util.Log.d("VLocker", "Grant $perm: $granted")
            }

            // Ensure location is enabled
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                dpm.setLocationEnabled(componentName, true)
                android.util.Log.d("VLocker", "Location enabled by Device Owner")
            }

            // Remove user restriction from changing location settings
            dpm.clearUserRestriction(componentName, android.os.UserManager.DISALLOW_CONFIG_LOCATION)
            dpm.clearUserRestriction(componentName, android.os.UserManager.DISALLOW_SHARE_LOCATION) 
            android.util.Log.d("VLocker", "Location restrictions cleared by Device Owner")
        } else {
            // Request Permissions interactively if not Device Owner
            val missingPermissions = permissions.filter {
                checkSelfPermission(it) != android.content.pm.PackageManager.PERMISSION_GRANTED
            }
            if (missingPermissions.isNotEmpty()) {
                requestPermissions(missingPermissions.toTypedArray(), 101)
            }
        }
    } catch (e: Exception) {
        android.util.Log.e("VLocker", "Error granting permissions: ${e.message}")
    }
  }

  override fun onStart() {
      super.onStart()
      applyLockScreenFlags()
  }

  private val pinningHandler = android.os.Handler(android.os.Looper.getMainLooper())
  private val pinningRunnable = object : Runnable {
      override fun run() {
          try {
              val sharedPref = getSharedPreferences("VLockerPrefs", android.content.Context.MODE_PRIVATE)
              val status = sharedPref.getString("last_status", "UNLOCKED")
              val isPaying = sharedPref.getBoolean("is_paying", false)

              if (isPaying) {
                  // Skip pinning if user is in settings or making payment
                  android.util.Log.d("VLocker", "pinningRunnable: is_paying is true, skipping pinning check")
              } else if (status == "LOCKED") {
                  // 1. Force Pinning if not pinned
                  val dpm = getSystemService(android.content.Context.DEVICE_POLICY_SERVICE) as? android.app.admin.DevicePolicyManager
                  if (dpm != null && dpm.isDeviceOwnerApp(packageName)) {
                      val am = getSystemService(android.content.Context.ACTIVITY_SERVICE) as android.app.ActivityManager
                      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                          if (am.lockTaskModeState == android.app.ActivityManager.LOCK_TASK_MODE_NONE) {
                              startLockTask()
                              android.util.Log.d("VLocker", "Redundant pinning check triggered startLockTask")
                          }
                      }
                  }

                  // 2. Re-enforce Immersive Mode (Hide Nav Bar)
                  window.decorView.systemUiVisibility = (
                      android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                      or android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                      or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                      or android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                      or android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                      or android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                  )
              }
          } catch (e: Exception) {
              // Silent fail to avoid crash loop
          }
          pinningHandler.postDelayed(this, 3000) // Every 3 seconds
      }
  }

  override fun onResume() {
      super.onResume()
      pinningHandler.post(pinningRunnable)
      try {
          val sharedPref = getSharedPreferences("VLockerPrefs", android.content.Context.MODE_PRIVATE)
          sharedPref.edit().putBoolean("is_paying", false).apply()
          android.util.Log.d("VLocker", "is_paying reset to false in onResume")

          val status = sharedPref.getString("last_status", "UNLOCKED")
          val dpm = getSystemService(android.content.Context.DEVICE_POLICY_SERVICE) as? android.app.admin.DevicePolicyManager
          
          if (status == "LOCKED" && dpm != null && dpm.isDeviceOwnerApp(packageName)) {
              val am = getSystemService(android.content.Context.ACTIVITY_SERVICE) as android.app.ActivityManager
              if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                  if (am.lockTaskModeState == android.app.ActivityManager.LOCK_TASK_MODE_NONE) {
                      startLockTask()
                      android.util.Log.d("VLocker", "Auto-pinned app in onResume")
                  }
              } else if (!am.isInLockTaskMode) {
                  startLockTask()
              }
          }
      } catch (e: Exception) {
          android.util.Log.e("VLocker", "Error in onResume auto-pin: ${e.message}")
      }
  }

  override fun onPause() {
      super.onPause()
      pinningHandler.removeCallbacks(pinningRunnable)
  }

  private fun applyLockScreenFlags() {
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O_MR1) {
          setShowWhenLocked(true)
          setTurnScreenOn(true)
          // keyguardManager.requestDismissKeyguard(this, null) // Optional: might be too aggressive if not locked
      } else {
          window.addFlags(
              android.view.WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
              android.view.WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
              android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
              android.view.WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
              android.view.WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
          )
      }
  }

  override fun onDestroy() {
      super.onDestroy()
      if (screenReceiver != null) {
          unregisterReceiver(screenReceiver)
      }
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
      super.onWindowFocusChanged(hasFocus)
      if (hasFocus) {
          window.decorView.systemUiVisibility = (
              android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
              or android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
              or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
              or android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
              or android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
              or android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
          )
      }
  }

  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
      // Block back button completely if Kiosk/Device Owner mode is active
      // logic can be added here, or just prevent exit.
  }
}
