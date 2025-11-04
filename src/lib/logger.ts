/**
 * Structured logging utilities for third-party API
 * Provides consistent logging format and integration points for monitoring
 */

export interface ApiLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  action: string;
  table?: string;
  id?: string;
  duration?: number;
  status: number;
  error?: string;
  metadata?: Record<string, unknown>;
  auditEventId?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Log API request/response
 */
export function logApiEvent(entry: ApiLogEntry): void {
  const logData = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  // Format log message
  const message = `[${logData.level.toUpperCase()}] ${logData.action} - ${logData.status}${
    logData.duration ? ` (${logData.duration}ms)` : ''
  }${logData.error ? ` - ${logData.error}` : ''}`;

  // Log to console with structured data
  if (logData.level === 'error') {
    console.error(message, logData);
  } else if (logData.level === 'warn') {
    console.warn(message, logData);
  } else {
    console.log(message, logData);
  }

  // In production, send to monitoring service (e.g., Sentry, DataDog, etc.)
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoring(logData);
  }
}

/**
 * Send log entry to monitoring service
 * Placeholder - integrate with your monitoring solution
 */
function sendToMonitoring(entry: ApiLogEntry): void {
  // Example: Send to Sentry
  if (entry.level === 'error' && process.env.SENTRY_DSN) {
    // Sentry integration would go here
    // For now, just log that we would send it
    console.debug('Would send to monitoring:', entry);
  }

  // Example: Send to custom logging service
  // Could also batch logs and send periodically
}

/**
 * Create a timer for measuring operation duration
 */
export function startTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}

/**
 * Log successful API operation
 */
export function logSuccess(params: {
  action: string;
  table: string;
  id?: string;
  duration: number;
  auditEventId?: string;
  metadata?: Record<string, unknown>;
}): void {
  logApiEvent({
    timestamp: new Date().toISOString(),
    level: 'info',
    action: params.action,
    table: params.table,
    id: params.id,
    duration: params.duration,
    status: 200,
    auditEventId: params.auditEventId,
    metadata: params.metadata,
  });
}

/**
 * Log failed API operation
 */
export function logError(params: {
  action: string;
  table?: string;
  id?: string;
  duration?: number;
  status: number;
  error: string;
  metadata?: Record<string, unknown>;
}): void {
  logApiEvent({
    timestamp: new Date().toISOString(),
    level: 'error',
    action: params.action,
    table: params.table,
    id: params.id,
    duration: params.duration,
    status: params.status,
    error: params.error,
    metadata: params.metadata,
  });
}

/**
 * Log warning
 */
export function logWarning(params: {
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
}): void {
  logApiEvent({
    timestamp: new Date().toISOString(),
    level: 'warn',
    action: params.action,
    status: 0,
    error: params.message,
    metadata: params.metadata,
  });
}

/**
 * Format error for logging (sanitize sensitive data)
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}
