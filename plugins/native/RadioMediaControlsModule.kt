package com.app.radiochileglass

import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class RadioMediaControlsModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private val mediaSession = MediaSessionCompat(reactContext, "RadioChileGlass")
  private var active = false

  init {
    mediaSession.setFlags(
      MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or
        MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS,
    )
    mediaSession.setCallback(object : MediaSessionCompat.Callback() {
      override fun onPlay() = emit("play")
      override fun onPause() = emit("pause")
      override fun onSkipToNext() = emit("next")
      override fun onSkipToPrevious() = emit("previous")
      override fun onStop() = emit("stop")
    })
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun activate(title: String, artist: String, artworkUrl: String?, playing: Boolean) {
    updateMetadata(title, artist, artworkUrl)
    updatePlaybackState(playing)
    mediaSession.isActive = true
    active = true
  }

  @ReactMethod
  fun updateMetadata(title: String, artist: String, artworkUrl: String?) {
    val metadata = MediaMetadataCompat.Builder()
      .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
      .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
      .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, "Radio Chile Glass")
      .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_TITLE, title)
      .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_SUBTITLE, artist)
      .apply {
        if (!artworkUrl.isNullOrBlank()) {
          putString(MediaMetadataCompat.METADATA_KEY_ALBUM_ART_URI, artworkUrl)
          putString(MediaMetadataCompat.METADATA_KEY_ART_URI, artworkUrl)
        }
      }
      .build()
    mediaSession.setMetadata(metadata)
  }

  @ReactMethod
  fun updatePlaybackState(playing: Boolean) {
    val actions = PlaybackStateCompat.ACTION_PLAY or
      PlaybackStateCompat.ACTION_PAUSE or
      PlaybackStateCompat.ACTION_PLAY_PAUSE or
      PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
      PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
      PlaybackStateCompat.ACTION_STOP
    val state = if (playing) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
    mediaSession.setPlaybackState(PlaybackStateCompat.Builder().setActions(actions).setState(state, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1f).build())
  }

  @ReactMethod
  fun deactivate() {
    mediaSession.isActive = false
    active = false
  }

  private fun emit(action: String) {
    if (!active) return
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(EVENT_NAME, Arguments.createMap().apply { putString("action", action) })
  }

  companion object {
    const val NAME = "RadioMediaControls"
    const val EVENT_NAME = "RadioMediaControls.action"
  }
}
