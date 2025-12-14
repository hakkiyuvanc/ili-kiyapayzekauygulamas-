const Sentry = require('@sentry/electron/main');
const log = require('electron-log');

function initSentry(isDev) {
  // Only initialize Sentry in production
  if (isDev) {
    log.info('Sentry disabled in development mode');
    return;
  }

  // Replace with your actual Sentry DSN when ready
  const SENTRY_DSN = process.env.SENTRY_DSN || null;

  if (!SENTRY_DSN) {
    log.warn('Sentry DSN not configured, crash reporting disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      
      // Environment
      environment: process.env.NODE_ENV || 'production',
      
      // Release tracking
      release: `iliski-analiz-ai@${require('../../package.json').version}`,
      
      // Sample rate (100% = all errors, 0.1 = 10% of errors)
      sampleRate: 1.0,
      
      // Trace sampling (for performance monitoring)
      tracesSampleRate: 0.1,
      
      // Integrations
      integrations: [
        // Additional context
        new Sentry.Integrations.ExtraErrorData({
          depth: 5
        }),
      ],
      
      // Before send hook (filter sensitive data)
      beforeSend(event, hint) {
        // Remove sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        
        // Filter out certain errors
        if (event.exception) {
          const errorMessage = event.exception.values?.[0]?.value || '';
          
          // Ignore network errors (common in desktop apps)
          if (errorMessage.includes('net::ERR_INTERNET_DISCONNECTED') ||
              errorMessage.includes('net::ERR_CONNECTION_REFUSED')) {
            return null;
          }
        }
        
        return event;
      },
      
      // Breadcrumbs (event trail before errors)
      beforeBreadcrumb(breadcrumb, hint) {
        // Filter console logs
        if (breadcrumb.category === 'console') {
          return breadcrumb.level === 'error' ? breadcrumb : null;
        }
        return breadcrumb;
      }
    });

    log.info('Sentry initialized successfully');
    
    // Set user context (non-PII)
    Sentry.setContext('device', {
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion()
    });

  } catch (error) {
    log.error('Failed to initialize Sentry:', error);
  }
}

// Manual error capturing (optional)
function captureError(error, context = {}) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context
    });
  }
  log.error('Error captured:', error, context);
}

// Capture message (for non-errors)
function captureMessage(message, level = 'info') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  }
  log.info('Message captured:', message);
}

// Set user ID (when auth is implemented)
function setUser(userId, email = null) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser({
      id: userId,
      // Don't send email in production (privacy)
      // email: email
    });
  }
}

module.exports = {
  initSentry,
  captureError,
  captureMessage,
  setUser
};
