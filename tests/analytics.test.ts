import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  logAnalytics, 
  trackAppStart, 
  trackRadioPlay, 
  trackPlaybackError, 
  trackMetadataUpdate,
  getAnalyticsSummary 
} from '../lib/analytics';

describe('Analytics Module', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('debe registrar eventos de analytics en desarrollo', () => {
    const event = { event: 'app_start' as const, timestamp: Date.now(), source: 'cold' as const };
    logAnalytics(event);
    
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy.mock.calls[0][0]).toContain('[ANALYTICS]');
    expect(consoleLogSpy.mock.calls[0][0]).toContain('app.start');
  });

  it('debe formatear correctamente los nombres de eventos', () => {
    const event = { event: 'radio_play' as const, radioId: 'test', radioName: 'Test FM', genre: 'Pop', timestamp: Date.now() };
    logAnalytics(event);
    
    expect(consoleLogSpy.mock.calls[0][0]).toContain('radio.play');
  });

  it('debe incluir timestamp ISO en los eventos', () => {
    const now = Date.now();
    const event = { event: 'cache_hit' as const, type: 'logo' as const, uri: 'http://test.com/logo.png', timestamp: now };
    logAnalytics(event);
    
    const eventData = consoleLogSpy.mock.calls[0][1];
    expect(eventData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('trackAppStart debe registrar evento de inicio de app', () => {
    trackAppStart('cold');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYTICS] app.start'),
      expect.objectContaining({
        event: 'app_start',
        source: 'cold',
      })
    );
  });

  it('trackAppStart debe soportar todos los tipos de inicio', () => {
    consoleLogSpy.mockClear();
    
    trackAppStart('warm');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('app.start'),
      expect.objectContaining({ source: 'warm' })
    );

    consoleLogSpy.mockClear();
    trackAppStart('hot');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('app.start'),
      expect.objectContaining({ source: 'hot' })
    );
  });

  it('trackRadioPlay debe registrar reproducción de emisora', () => {
    const radio = { id: 'fmlatina', name: 'FM Latina', genre: 'Pop' };
    trackRadioPlay(radio);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYTICS] radio.play'),
      expect.objectContaining({
        event: 'radio_play',
        radioId: 'fmlatina',
        radioName: 'FM Latina',
        genre: 'Pop',
      })
    );
  });

  it('trackPlaybackError debe registrar errores de reproducción', () => {
    const error = new Error('Stream timeout');
    trackPlaybackError('cooperativa', error, 2);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYTICS] playback.error'),
      expect.objectContaining({
        event: 'playback_error',
        radioId: 'cooperativa',
        errorType: 'Stream timeout',
        retryCount: 2,
      })
    );
  });

  it('trackPlaybackError debe manejar errores sin mensaje', () => {
    const error = { message: '' };
    trackPlaybackError('futuro', error as Error, 0);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYTICS] playback.error'),
      expect.objectContaining({
        errorType: 'Unknown error',
      })
    );
  });

  it('trackMetadataUpdate debe registrar actualizaciones de metadatos ICY', () => {
    trackMetadataUpdate('carolina', 'icy', 'Los Prisioneros');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYTICS] metadata.update'),
      expect.objectContaining({
        event: 'metadata_update',
        radioId: 'carolina',
        source: 'icy',
        hasArtist: true,
      })
    );
  });

  it('trackMetadataUpdate debe manejar metadatos sin artista', () => {
    consoleLogSpy.mockClear();
    trackMetadataUpdate('concierto', 'fallback', undefined);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYTICS] metadata.update'),
      expect.objectContaining({
        hasArtist: false,
      })
    );
  });

  it('getAnalyticsSummary debe retornar objeto vacío (placeholder)', () => {
    const summary = getAnalyticsSummary();
    
    expect(summary).toEqual({});
    expect(typeof summary).toBe('object');
  });

  it('debe manejar múltiples eventos consecutivos', () => {
    consoleLogSpy.mockClear();
    
    trackAppStart('cold');
    trackRadioPlay({ id: 'test1', name: 'Test 1', genre: 'Rock' });
    trackRadioPlay({ id: 'test2', name: 'Test 2', genre: 'Pop' });
    
    expect(consoleLogSpy).toHaveBeenCalledTimes(3);
  });
});
