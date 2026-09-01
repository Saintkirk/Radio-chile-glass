/**
 * Logger condicional que solo funciona en desarrollo
 * Elimina overhead de logging en producción para mejor rendimiento
 */

const __DEV__ = process.env.NODE_ENV === 'development';

export const devLogger = {
  log: (...args: unknown[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Errors siempre se loguean, incluso en producción
    console.error(...args);
  },
  debug: (...args: unknown[]) => {
    if (__DEV__) {
      console.debug(...args);
    }
  },
};
