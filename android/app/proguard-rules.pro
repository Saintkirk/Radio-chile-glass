# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class org.jetbrains.** { *; }

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Kotlin
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-keepclassmembers class kotlinx.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# Fresco (image loading)
-keep class com.facebook.cache.** { *; }
-keep class com.facebook.datasource.** { *; }
-keep class com.facebook.drawee.** { *; }
-keep class com.facebook.imagepipeline.** { *; }

# Expo modules
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# Media
-keep class androidx.media.** { *; }

# Add any project specific keep options here:
-keep class com.app.radiochileglass.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep custom view constructors
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
}
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Keep setters in Views
-keepclassmembers public class * extends android.view.View {
   void set*(***);
   *** get*();
}

# Keep Parcelables
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Keep Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
