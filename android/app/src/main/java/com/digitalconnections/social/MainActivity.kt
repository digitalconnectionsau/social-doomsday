package com.digitalconnections.social

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.util.Log

class MainActivity : ReactActivity() {

  private var wakeLock: PowerManager.WakeLock? = null

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "SocialMediaCheck"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    Log.d("SocialKiosk", "Starting Social Doomsday kiosk app on Android ${Build.VERSION.RELEASE}")
    
    // Initialize wake lock for extended screen time (45+ minutes)
    initializeWakeLock()
    
    // Enable kiosk mode features
    enableKioskMode()
    
    // Start lock task mode for Android 15 kiosk support
    try {
      startLockTask()
      Log.d("SocialKiosk", "Lock task mode started successfully")
    } catch (e: Exception) {
      Log.w("SocialKiosk", "Lock task mode not available - use Android settings to enable", e)
    }
  }

  override fun onResume() {
    super.onResume()
    enableKioskMode()
    
    // Acquire wake lock to keep screen on for extended periods
    acquireWakeLock()
    
    // Continuously hide system UI elements with a slight delay
    window.decorView.postDelayed({
      enableKioskMode()
      hideAndroid15SystemElements()
    }, 100)
  }

  override fun onPause() {
    super.onPause()
    // Keep wake lock active even when paused - don't release it
    Log.d("SocialKiosk", "App paused but keeping screen alive")
  }

  override fun onDestroy() {
    super.onDestroy()
    releaseWakeLock()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      enableKioskMode()
      hideAndroid15SystemElements()
      
      // Start continuous monitoring
      startSystemUIMonitor()
    }
  }

  private fun startSystemUIMonitor() {
    // Monitor and re-hide system UI elements every 2 seconds
    window.decorView.postDelayed({
      if (!isDestroyed && !isFinishing) {
        enableKioskMode()
        hideAndroid15SystemElements()
        // Ensure wake lock is still active
        if (wakeLock?.isHeld != true) {
          acquireWakeLock()
        }
        startSystemUIMonitor() // Continue monitoring
      }
    }, 2000)
  }

  private fun enableKioskMode() {
    try {
      // Set fullscreen flags for different Android versions
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        // Android 11+ (API 30+) - Use WindowInsetsController
        window.setDecorFitsSystemWindows(false)
        val controller = window.insetsController
        if (controller != null) {
          controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
          controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
      } else {
        // Legacy Android versions
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = (
          View.SYSTEM_UI_FLAG_FULLSCREEN or
          View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
          View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
          View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
          View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
          View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )
      }
      
      // Additional window flags for kiosk mode
      window.addFlags(
        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      )
      
    } catch (e: Exception) {
      Log.e("SocialKiosk", "Error enabling kiosk mode", e)
    }
  }

  private fun hideAndroid15SystemElements() {
    // Additional hiding for Android 15+ specific elements
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
      try {
        window.decorView.postDelayed({
          window.insetsController?.let { controller ->
            controller.hide(
              WindowInsets.Type.statusBars() or 
              WindowInsets.Type.navigationBars() or
              WindowInsets.Type.systemGestures()
            )
          }
        }, 50)
      } catch (e: Exception) {
        Log.w("SocialKiosk", "Advanced Android 15 hiding not available", e)
      }
    }
  }

  private fun initializeWakeLock() {
    try {
      val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
      wakeLock = powerManager.newWakeLock(
        PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
        "SocialKiosk::ScreenWakeLock"
      )
      Log.d("SocialKiosk", "Wake lock initialized for extended screen time")
    } catch (e: Exception) {
      Log.e("SocialKiosk", "Failed to initialize wake lock", e)
    }
  }

  private fun acquireWakeLock() {
    try {
      if (wakeLock?.isHeld != true) {
        // Acquire wake lock for 60 minutes (3600000ms) for long gameplay sessions
        wakeLock?.acquire(3600000)
        Log.d("SocialKiosk", "Wake lock acquired for 60 minutes")
      }
    } catch (e: Exception) {
      Log.e("SocialKiosk", "Failed to acquire wake lock", e)
    }
  }

  private fun releaseWakeLock() {
    try {
      if (wakeLock?.isHeld == true) {
        wakeLock?.release()
        Log.d("SocialKiosk", "Wake lock released")
      }
    } catch (e: Exception) {
      Log.e("SocialKiosk", "Failed to release wake lock", e)
    }
  }

  // Handle back button to prevent accidental exits
  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    // Block back button in kiosk mode
    // Players must use the hidden exit method in the React app
    Log.d("SocialKiosk", "Back button blocked - use app's hidden exit method")
    // Don't call super.onBackPressed() to prevent exit
  }

  // Prevent task switching
  override fun onUserLeaveHint() {
    super.onUserLeaveHint()
    Log.d("SocialKiosk", "User attempted to leave app - blocked in kiosk mode")
    // Immediately bring app back to front
    val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    activityManager.moveTaskToFront(taskId, 0)
  }

  // Handle recent apps button
  override fun onTrimMemory(level: Int) {
    super.onTrimMemory(level)
    if (level == TRIM_MEMORY_UI_HIDDEN) {
      // App moved to background, bring it back
      Log.d("SocialKiosk", "App moved to background - returning to foreground")
      val intent = Intent(this, MainActivity::class.java)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      startActivity(intent)
    }
  }
}