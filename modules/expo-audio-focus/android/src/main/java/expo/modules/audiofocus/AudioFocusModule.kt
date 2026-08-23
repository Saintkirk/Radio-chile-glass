package expo.modules.audiofocus

import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AudioFocusModule : Module() {
  private var audioManager: AudioManager? = null
  private var focusRequest: AudioFocusRequest? = null
  private var focusListener: AudioManager.OnAudioFocusChangeListener? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoAudioFocus")
    Events("onAudioFocusChange")

    Function("requestFocus") {
      requestAudioFocus()
    }

    Function("abandonFocus") {
      abandonAudioFocus()
    }

    OnDestroy {
      abandonAudioFocus()
    }
  }

  private fun requestAudioFocus(): String {
    val context = requireNotNull(appContext.reactContext)
    val manager = audioManager ?: (context.getSystemService(AudioManager::class.java)).also { audioManager = it }
    val listener = focusListener ?: AudioManager.OnAudioFocusChangeListener { change ->
      val event = Bundle().apply {
        putString("change", focusChangeName(change))
        putInt("rawChange", change)
      }
      sendEvent("onAudioFocusChange", event)
    }.also { focusListener = it }

    val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val request = focusRequest ?: AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
        .setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build(),
        )
        .setWillPauseWhenDucked(true)
        .setOnAudioFocusChangeListener(listener, Handler(Looper.getMainLooper()))
        .build()
        .also { focusRequest = it }
      manager.requestAudioFocus(request)
    } else {
      @Suppress("DEPRECATION")
      manager.requestAudioFocus(listener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN)
    }

    return when (result) {
      AudioManager.AUDIOFOCUS_REQUEST_GRANTED -> "granted"
      AudioManager.AUDIOFOCUS_REQUEST_DELAYED -> "delayed"
      else -> "failed"
    }
  }

  private fun abandonAudioFocus() {
    val manager = audioManager ?: return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      focusRequest?.let { manager.abandonAudioFocusRequest(it) }
    } else {
      @Suppress("DEPRECATION")
      focusListener?.let { manager.abandonAudioFocus(it) }
    }
  }

  private fun focusChangeName(change: Int): String = when (change) {
    AudioManager.AUDIOFOCUS_GAIN -> "gain"
    AudioManager.AUDIOFOCUS_LOSS -> "loss"
    AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> "loss_transient"
    AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> "loss_transient_can_duck"
    else -> "unknown"
  }
}
