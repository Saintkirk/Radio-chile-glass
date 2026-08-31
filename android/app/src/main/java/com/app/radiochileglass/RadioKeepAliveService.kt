package com.app.radiochileglass

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class RadioKeepAliveService : Service() {
  override fun onCreate() {
    super.onCreate()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java)
      manager.createNotificationChannel(
        NotificationChannel(CHANNEL_ID, "Radio Chile Glass", NotificationManager.IMPORTANCE_LOW).apply {
          setShowBadge(false)
          description = "Reproducción de radio en segundo plano"
        },
      )
    }
    startForeground(NOTIFICATION_ID, buildNotification())
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int = START_STICKY

  override fun onBind(intent: Intent?): IBinder? = null

  private fun buildNotification(): Notification = NotificationCompat.Builder(this, CHANNEL_ID)
    .setSmallIcon(android.R.drawable.ic_media_play)
    .setContentTitle("Radio Chile Glass")
    .setContentText("Reproducción en segundo plano activa")
    .setCategory(NotificationCompat.CATEGORY_SERVICE)
    .setOngoing(true)
    .setOnlyAlertOnce(true)
    .setShowWhen(false)
    .build()

  companion object {
    const val CHANNEL_ID = "radio_chile_glass_playback"
    const val NOTIFICATION_ID = 9133
  }
}
