package com.digitalconnections.social

import android.app.ActivityManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.os.Handler
import android.os.Looper
import android.util.Log

class KioskModeService : Service() {
    
    private val handler = Handler(Looper.getMainLooper())
    private var monitoringRunnable: Runnable? = null
    private val MONITORING_INTERVAL = 500L // Check every 500ms
    
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startKioskMonitoring()
        return START_STICKY // Restart service if killed
    }
    
    private fun startKioskMonitoring() {
        monitoringRunnable = object : Runnable {
            override fun run() {
                ensureKioskMode()
                handler.postDelayed(this, MONITORING_INTERVAL)
            }
        }
        handler.post(monitoringRunnable!!)
    }
    
    private fun ensureKioskMode() {
        try {
            val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val runningTasks = activityManager.getRunningTasks(1)
            
            if (runningTasks.isNotEmpty()) {
                val topActivity = runningTasks[0].topActivity
                
                // If our app is not on top, bring it back
                if (topActivity?.packageName != packageName) {
                    Log.d("KioskService", "App not on top, bringing back: ${topActivity?.packageName}")
                    bringAppToFront()
                }
            }
        } catch (e: Exception) {
            Log.e("KioskService", "Error monitoring kiosk mode", e)
        }
    }
    
    private fun bringAppToFront() {
        try {
            val intent = Intent(this, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            startActivity(intent)
        } catch (e: Exception) {
            Log.e("KioskService", "Error bringing app to front", e)
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        monitoringRunnable?.let { handler.removeCallbacks(it) }
        
        // Restart service if destroyed
        val intent = Intent(this, KioskModeService::class.java)
        startService(intent)
    }
}