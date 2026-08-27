package com.app.radiochileglass

import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.media.app.NotificationCompat.MediaStyle
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import kotlin.LazyThreadSafetyMode

class RadioMediaControlsModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private val mediaSessionDelegate = lazy(LazyThreadSafetyMode.NONE) {
    MediaSessionCompat(reactContext, SESSION_TAG).apply {
      setFlags(
        MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or
          MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS,
      )
      setCallback(object : MediaSessionCompat.Callback() {
        override fun onPlay() = emit("play")
        override fun onPause() = emit("pause")
        override fun onSkipToNext() = emit("next")
        override fun onSkipToPrevious() = emit("previous")
        override fun onStop() = emit("stop")
      })
    }
  }
  private val mediaSession: MediaSessionCompat get() = mediaSessionDelegate.value
  private val executor = Executors.newSingleThreadExecutor()
  private var audioFocusRequest: AudioFocusRequest? = null
  private val audioFocusListener = AudioManager.OnAudioFocusChangeListener { change ->
    reactContext.runOnUiQueueThread {
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(AUDIO_FOCUS_EVENT, Arguments.createMap().apply { putInt("rawChange", change) })
    }
  }
  private var active = false
  private var lastTitle = "Radio Chile Glass"
  private var lastArtist = "Radio en vivo"
  private var lastArtworkUrl: String? = null
  private var lastArtwork: Bitmap? = null
  private var lastArtworkKey: String = ""
  private var artworkGeneration: Long = 0
  private var lastRadioId: String? = null
  private var lastPlaying = false

  override fun getName(): String = NAME

  @ReactMethod
  fun requestAudioFocus(promise: Promise) {
    try {
      val manager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      val attributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_MEDIA)
        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
        .build()
      val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
          .setAudioAttributes(attributes)
          .setAcceptsDelayedFocusGain(false)
          .setWillPauseWhenDucked(false)
          .setOnAudioFocusChangeListener(audioFocusListener)
          .build()
        manager.requestAudioFocus(audioFocusRequest!!)
      } else {
        @Suppress("DEPRECATION")
        manager.requestAudioFocus(audioFocusListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN)
      }
      promise.resolve(
        when (result) {
          AudioManager.AUDIOFOCUS_REQUEST_GRANTED -> "granted"
          AudioManager.AUDIOFOCUS_REQUEST_DELAYED -> "delayed"
          else -> "failed"
        },
      )
    } catch (error: Exception) {
      promise.reject("AUDIO_FOCUS_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun abandonAudioFocus() {
    val manager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      audioFocusRequest?.let { manager.abandonAudioFocusRequest(it) }
      audioFocusRequest = null
    } else {
      @Suppress("DEPRECATION")
      manager.abandonAudioFocus(audioFocusListener)
    }
  }

  @ReactMethod
  fun activate(title: String, artist: String, artworkUrl: String?, playing: Boolean, radioId: String?) {
    ensureNotificationChannel()
    val artworkKey = artworkKey(radioId, artworkUrl)
    if (artworkKey != lastArtworkKey) {
      artworkGeneration += 1
      lastArtwork = null
      lastArtworkKey = artworkKey
    }
    lastTitle = title
    lastArtist = artist
    lastArtworkUrl = artworkUrl
    lastRadioId = radioId
    lastPlaying = playing
    active = true
    try {
      val serviceIntent = android.content.Intent(reactContext, RadioKeepAliveService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) reactContext.startForegroundService(serviceIntent)
      else reactContext.startService(serviceIntent)
    } catch (_: Exception) {
      // expo-audio remains the primary playback service.
    }
    // Reclamar el registro de forma atómica evita que dos instancias del bridge
    // publiquen sesiones simultáneas o que una instancia antigua borre la nueva.
    val previousSession = RadioMediaSessionRegistry.claim(mediaSession)
    if (previousSession != null && previousSession !== mediaSession) {
      try { previousSession.isActive = false } catch (_: Exception) { /* no-op */ }
      try { previousSession.release() } catch (_: Exception) { /* no-op */ }
    }
    mediaSession.isActive = true
    updateMetadata(title, artist, artworkUrl, radioId)
    updatePlaybackState(playing)
    loadArtworkAsync(artworkUrl, artworkKey, artworkGeneration)
  }

  @ReactMethod
  fun updateMetadata(title: String, artist: String, artworkUrl: String?, radioId: String?) {
    val effectiveRadioId = radioId ?: lastRadioId
    val artworkKey = artworkKey(effectiveRadioId, artworkUrl)
    if (artworkKey != lastArtworkKey) {
      artworkGeneration += 1
      lastArtwork = null
      lastArtworkKey = artworkKey
    }
    lastTitle = title
    lastArtist = artist
    lastArtworkUrl = artworkUrl
    if (radioId != null) lastRadioId = radioId
    val metadata = MediaMetadataCompat.Builder()
      .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
      .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
      .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, "Radio Chile Glass")
      .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_TITLE, title)
      .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_SUBTITLE, artist)
      .apply {
        if (lastArtwork != null) {
          putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, lastArtwork)
          putBitmap(MediaMetadataCompat.METADATA_KEY_ART, lastArtwork)
        } else if (!artworkUrl.isNullOrBlank()) {
          putString(MediaMetadataCompat.METADATA_KEY_ALBUM_ART_URI, artworkUrl)
          putString(MediaMetadataCompat.METADATA_KEY_ART_URI, artworkUrl)
        }
      }
      .build()
    mediaSession.setMetadata(metadata)
    if (active) postNotification()
  }

  @ReactMethod
  fun updatePlaybackState(playing: Boolean) {
    lastPlaying = playing
    val actions = PlaybackStateCompat.ACTION_PLAY or
      PlaybackStateCompat.ACTION_PAUSE or
      PlaybackStateCompat.ACTION_PLAY_PAUSE or
      PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
      PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
      PlaybackStateCompat.ACTION_STOP
    val state = if (playing) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
    mediaSession.setPlaybackState(
      PlaybackStateCompat.Builder()
        .setActions(actions)
        .setState(state, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1f)
        .build(),
    )
    if (active) postNotification()
  }

  @ReactMethod
  fun openBatteryOptimizationSettings() {
    try {
      val intent = android.content.Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        .setData(Uri.parse("package:${reactContext.packageName}"))
        .addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
      reactContext.startActivity(intent)
    } catch (_: Exception) {
      try {
        reactContext.startActivity(
          android.content.Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
            .setData(Uri.parse("package:${reactContext.packageName}"))
            .addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK),
        )
      } catch (_: Exception) {
        // Settings are optional and unavailable on some OEM builds.
      }
    }
  }

  @ReactMethod
  fun deactivate() {
    abandonAudioFocus()
    val ownsSession = mediaSessionDelegate.isInitialized() && RadioMediaSessionRegistry.releaseIfOwner(mediaSession)
    if (ownsSession) {
      mediaSession.setPlaybackState(
        PlaybackStateCompat.Builder()
          .setActions(0)
          .setState(PlaybackStateCompat.STATE_NONE, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 0f)
          .build(),
      )
      mediaSession.setMetadata(MediaMetadataCompat.Builder().build())
      mediaSession.isActive = false
    }
    active = false
    lastArtwork = null
    lastArtworkUrl = null
    lastArtworkKey = ""
    artworkGeneration += 1
    lastRadioId = null
    try { reactContext.stopService(android.content.Intent(reactContext, RadioKeepAliveService::class.java)) } catch (_: Exception) { /* no-op */ }
    NotificationManagerCompat.from(reactContext).cancel(NOTIFICATION_ID)
  }

  private fun openRadioIntent(): android.app.PendingIntent? {
    val radioId = lastRadioId ?: return null
    // La ruta debe viajar como path explícito. Con `scheme://radio/id`, Android
    // interpreta `radio` como hostname y Expo Router puede resolverlo en Inicio.
    // Las tres barras fuerzan el path `/radio/{id}` esperado por la ruta dinámica.
    val deepLink = Uri.parse("manusradiochileglass:///radio/$radioId")
    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, deepLink)
      .addFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP or android.content.Intent.FLAG_ACTIVITY_SINGLE_TOP or android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
    return android.app.PendingIntent.getActivity(
      reactContext,
      7001,
      intent,
      android.app.PendingIntent.FLAG_UPDATE_CURRENT or
        (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) android.app.PendingIntent.FLAG_IMMUTABLE else 0),
    )
  }

  private fun loadArtworkAsync(artworkUrl: String?, artworkKey: String, generation: Long) {
    if (artworkUrl.isNullOrBlank()) return
    executor.execute {
      try {
        val connection = (URL(artworkUrl).openConnection() as HttpURLConnection).apply {
          connectTimeout = 5000
          readTimeout = 5000
          instanceFollowRedirects = true
        }
        connection.inputStream.use { input ->
          val bitmap = BitmapFactory.decodeStream(input)
          if (bitmap != null && active && artworkUrl == lastArtworkUrl && artworkKey == lastArtworkKey && generation == artworkGeneration) {
            lastArtwork = bitmap
            reactContext.runOnUiQueueThread {
              if (active && artworkKey == lastArtworkKey && generation == artworkGeneration) {
                updateMetadata(lastTitle, lastArtist, artworkUrl, lastRadioId)
              }
            }
          }
        }
        connection.disconnect()
      } catch (_: Exception) {
        // The notification remains usable with the application icon.
      }
    }
  }

  private fun artworkKey(radioId: String?, artworkUrl: String?): String =
    "${radioId.orEmpty()}|${artworkUrl.orEmpty()}"

  private fun ensureNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      manager.createNotificationChannel(
        NotificationChannel(CHANNEL_ID, "Radio Chile Glass", NotificationManager.IMPORTANCE_LOW).apply {
          description = "Controles de reproducción de Radio Chile Glass"
          setShowBadge(false)
        },
      )
    }
  }

  private fun actionIntent(action: String) = android.app.PendingIntent.getBroadcast(
    reactContext,
    action.hashCode(),
    android.content.Intent(reactContext, RadioMediaActionReceiver::class.java).setAction(action),
    android.app.PendingIntent.FLAG_UPDATE_CURRENT or
      (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) android.app.PendingIntent.FLAG_IMMUTABLE else 0),
  )

  private fun loadAppIcon(): Bitmap? {
    val iconId = reactContext.resources.getIdentifier("ic_launcher", "mipmap", reactContext.packageName)
    return if (iconId != 0) BitmapFactory.decodeResource(reactContext.resources, iconId) else null
  }

  private fun postNotification() {
    val playIcon = if (lastPlaying) android.R.drawable.ic_media_pause else android.R.drawable.ic_media_play
    val artwork = lastArtwork ?: loadAppIcon()
    val notification = NotificationCompat.Builder(reactContext, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_media_play)
      .setContentTitle(lastTitle)
      .setContentText(lastArtist)
      .setLargeIcon(artwork)
      .setOngoing(lastPlaying)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .apply { openRadioIntent()?.let { setContentIntent(it) } }
      .addAction(android.R.drawable.ic_media_previous, "Anterior", actionIntent(ACTION_PREVIOUS))
      .addAction(playIcon, if (lastPlaying) "Pausar" else "Reproducir", actionIntent(if (lastPlaying) ACTION_PAUSE else ACTION_PLAY))
      .addAction(android.R.drawable.ic_media_next, "Siguiente", actionIntent(ACTION_NEXT))
      .setStyle(MediaStyle().setMediaSession(mediaSession.sessionToken).setShowActionsInCompactView(0, 1, 2))
      .build()
    try {
      NotificationManagerCompat.from(reactContext).notify(NOTIFICATION_ID, notification)
    } catch (_: SecurityException) {
      // Playback continues through expo-audio even when notification permission is denied.
    }
  }

  private fun emit(action: String) {
    if (!active) return
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(EVENT_NAME, Arguments.createMap().apply { putString("action", action) })
  }

  companion object {
    const val NAME = "RadioMediaControls"
    const val EVENT_NAME = "RadioMediaControls.action"
    const val AUDIO_FOCUS_EVENT = "RadioMediaControls.audioFocus"
    const val ACTION_PLAY = "com.app.radiochileglass.PLAY"
    const val ACTION_PAUSE = "com.app.radiochileglass.PAUSE"
    const val ACTION_NEXT = "com.app.radiochileglass.NEXT"
    const val ACTION_PREVIOUS = "com.app.radiochileglass.PREVIOUS"
    const val ACTION_STOP = "com.app.radiochileglass.STOP"
    private const val SESSION_TAG = "RadioChileGlass"
    private const val CHANNEL_ID = "radio_chile_glass_playback"
    private const val NOTIFICATION_ID = 9133
  }
}

object RadioMediaSessionRegistry {
  @Volatile private var currentSession: MediaSessionCompat? = null

  @Synchronized
  fun claim(session: MediaSessionCompat): MediaSessionCompat? {
    val previous = currentSession
    currentSession = session
    return previous
  }

  @Synchronized
  fun current(): MediaSessionCompat? = currentSession

  @Synchronized
  fun releaseIfOwner(session: MediaSessionCompat): Boolean {
    if (currentSession !== session) return false
    currentSession = null
    return true
  }
}
