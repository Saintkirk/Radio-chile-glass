/**
 * Analytics utilities for tracking user behavior and app performance
 * Logs events to console in development, ready for production analytics integration
 */

type AnalyticsEvent = 
  | { event: 'app_start'; timestamp: number; source: 'cold' | 'warm' | 'hot' }
  | { event: 'radio_play'; radioId: string; radioName: string; genre: string; timestamp: number }
  | { event: 'radio_pause'; radioId: string; duration: number; timestamp: number }
  | { event: 'radio_skip'; direction: 'next' | 'previous'; fromRadioId?: string; toRadioId: string; timestamp: number }
  | { event: 'favorite_toggle'; radioId: string; action: 'add' | 'remove'; timestamp: number }
  | { event: 'playback_error'; radioId: string; errorType: string; retryCount: number; timestamp: number }
  | { event: 'metadata_update'; radioId: string; source: 'icy' | 'fallback'; hasArtist: boolean; timestamp: number }
  | { event: 'crossfade_complete'; fromRadioId?: string; toRadioId: string; duration: number; timestamp: number }
  | { event: 'cache_hit'; type: 'logo' | 'catalog' | 'metadata'; uri?: string; timestamp: number }
  | { event: 'cache_miss'; type: 'logo' | 'catalog' | 'metadata'; uri?: string; timestamp: number };

const ANALYTICS_ENABLED = true; // Always enabled for testing, controlled by environment in production

/**
 * Log analytics event with structured data
 * In production, this would send to analytics service (Mixpanel, Amplitude, etc.)
 */
export function logAnalytics(event: AnalyticsEvent): void {
  if (!ANALYTICS_ENABLED) return;
  
  const eventType = event.event.replace(/_/g, '.');
  const eventData = {
    ...event,
    timestamp: new Date(event.timestamp).toISOString(),
  };
  
  console.log(`[ANALYTICS] ${eventType}`, eventData);
}

/**
 * Track session start with timing metrics
 */
export function trackAppStart(source: 'cold' | 'warm' | 'hot'): void {
  logAnalytics({ event: 'app_start', timestamp: Date.now(), source });
}

/**
 * Track radio playback initiation
 */
export function trackRadioPlay(radio: { id: string; name: string; genre: string }): void {
  logAnalytics({
    event: 'radio_play',
    radioId: radio.id,
    radioName: radio.name,
    genre: radio.genre,
    timestamp: Date.now(),
  });
}

/**
 * Track playback errors for monitoring stream health
 */
export function trackPlaybackError(radioId: string, error: Error, retryCount: number): void {
  logAnalytics({
    event: 'playback_error',
    radioId,
    errorType: error.message || 'Unknown error',
    retryCount,
    timestamp: Date.now(),
  });
}

/**
 * Track metadata updates to measure ICY stream quality
 */
export function trackMetadataUpdate(radioId: string, source: 'icy' | 'fallback', artist?: string): void {
  logAnalytics({
    event: 'metadata_update',
    radioId,
    source,
    hasArtist: Boolean(artist),
    timestamp: Date.now(),
  });
}

/**
 * Aggregate analytics for periodic reporting
 * In production, this would batch and send to backend
 */
export function getAnalyticsSummary(): Record<string, number> {
  // Placeholder for analytics aggregation
  // Would integrate with actual analytics service in production
  return {};
}
