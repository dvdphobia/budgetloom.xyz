// Structured, privacy-safe application logger for BudgetLoom.
// Never logs passwords, tokens, database credentials, email addresses, or private financial amounts.

export type LogLevel = 'info' | 'warn' | 'error' | 'security'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  event: string
  message: string
  route?: string
  code?: string
  meta?: Record<string, unknown>
}

const SENSITIVE_KEY_PATTERN = /password|secret|token|authorization|cookie|connectionstring|postgres_url|database_url|api_key|apikey|email|income|balance|salary|ssn|card/i
const CREDENTIAL_URL_PATTERN = /(postgres(?:ql)?:\/\/)([^@\s]+@)/gi
const EMAIL_VALUE_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

export function redactString(input: string): string {
  return input
    .replace(CREDENTIAL_URL_PATTERN, '$1[REDACTED]@')
    .replace(EMAIL_VALUE_PATTERN, '[REDACTED_EMAIL]')
}

export function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      clean[key] = '[REDACTED]'
    } else if (typeof value === 'string') {
      clean[key] = redactString(value).slice(0, 500)
    } else if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      clean[key] = value
    } else if (Array.isArray(value)) {
      clean[key] = value.slice(0, 20).map(item => (typeof item === 'string' ? redactString(item) : typeof item === 'number' || typeof item === 'boolean' ? item : '[OBJECT]'))
    } else if (typeof value === 'object') {
      clean[key] = sanitizeMeta(value as Record<string, unknown>)
    }
  }
  return clean
}

export function extractErrorInfo(error: unknown): { message: string; code?: string; name?: string } {
  if (!error) return { message: 'Unknown error' }
  if (typeof error === 'string') return { message: redactString(error) }
  if (typeof error === 'object') {
    const errObj = error as { message?: unknown; code?: unknown; name?: unknown }
    const message = typeof errObj.message === 'string' ? redactString(errObj.message) : 'Unexpected error'
    const code = typeof errObj.code === 'string' ? errObj.code : undefined
    const name = typeof errObj.name === 'string' ? errObj.name : undefined
    return { message, code, name }
  }
  return { message: 'Unexpected error' }
}

const recentLogs: LogEntry[] = []
const MAX_RECENT_LOGS = 100

function emit(level: LogLevel, event: string, message: string, options?: { route?: string; error?: unknown; meta?: Record<string, unknown> }): LogEntry {
  const errInfo = options?.error ? extractErrorInfo(options.error) : undefined
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    message: redactString(message),
    ...(options?.route ? { route: options.route } : {}),
    ...(errInfo?.code ? { code: errInfo.code } : {}),
    ...(options?.meta || errInfo
      ? {
          meta: {
            ...(sanitizeMeta(options?.meta) ?? {}),
            ...(errInfo ? { errorMessage: errInfo.message, ...(errInfo.name ? { errorName: errInfo.name } : {}) } : {}),
          },
        }
      : {}),
  }

  recentLogs.unshift(entry)
  if (recentLogs.length > MAX_RECENT_LOGS) recentLogs.length = MAX_RECENT_LOGS

  if (process.env.NODE_ENV !== 'test') {
    const serialized = JSON.stringify(entry)
    if (level === 'error' || level === 'security') {
      console.error(serialized)
    } else if (level === 'warn') {
      console.warn(serialized)
    } else {
      console.info(serialized)
    }
  }

  return entry
}

export const logger = {
  info: (event: string, message: string, options?: { route?: string; meta?: Record<string, unknown> }) =>
    emit('info', event, message, options),
  warn: (event: string, message: string, options?: { route?: string; error?: unknown; meta?: Record<string, unknown> }) =>
    emit('warn', event, message, options),
  error: (event: string, message: string, options?: { route?: string; error?: unknown; meta?: Record<string, unknown> }) =>
    emit('error', event, message, options),
  security: (event: string, message: string, options?: { route?: string; error?: unknown; meta?: Record<string, unknown> }) =>
    emit('security', event, message, options),
  getRecentLogs: (): LogEntry[] => [...recentLogs],
}
