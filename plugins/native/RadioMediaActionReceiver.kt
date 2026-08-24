package com.app.radiochileglass

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class RadioMediaActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val controls = RadioMediaSessionRegistry.session?.controller?.transportControls ?: return
    when (intent.action) {
      RadioMediaControlsModule.ACTION_PLAY -> controls.play()
      RadioMediaControlsModule.ACTION_PAUSE -> controls.pause()
      RadioMediaControlsModule.ACTION_NEXT -> controls.skipToNext()
      RadioMediaControlsModule.ACTION_PREVIOUS -> controls.skipToPrevious()
      RadioMediaControlsModule.ACTION_STOP -> controls.stop()
      Intent.ACTION_MEDIA_BUTTON -> {
        val keyEvent = intent.getParcelableExtra<android.view.KeyEvent>(Intent.EXTRA_KEY_EVENT)
        if (keyEvent?.action == android.view.KeyEvent.ACTION_DOWN) {
          when (keyEvent.keyCode) {
            android.view.KeyEvent.KEYCODE_MEDIA_NEXT -> controls.skipToNext()
            android.view.KeyEvent.KEYCODE_MEDIA_PREVIOUS -> controls.skipToPrevious()
            android.view.KeyEvent.KEYCODE_MEDIA_PLAY -> controls.play()
            android.view.KeyEvent.KEYCODE_MEDIA_PAUSE -> controls.pause()
            android.view.KeyEvent.KEYCODE_MEDIA_STOP -> controls.stop()
          }
        }
      }
    }
  }
}
