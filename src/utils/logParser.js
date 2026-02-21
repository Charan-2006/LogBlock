/**
 * Parse uploaded file: line-by-line text or JSON array.
 * Returns array of { id, message, timestamp, status }.
 */
export function parseLogFile(text, filename) {
  const trimmed = text.trim()
  if (!trimmed) return []

  // Try JSON array first
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed)
      if (!Array.isArray(arr)) return []
      return arr.map((item, index) => normalizeLogEntry(item, index + 1))
    } catch {
      // fall through to line-by-line
    }
  }

  // Line-by-line
  const lines = trimmed.split(/\r?\n/).filter(Boolean)
  const now = new Date()
  return lines.map((line, index) => ({
    id: index + 1,
    message: line.trim(),
    timestamp: formatTime(now, index),
    status: 'valid',
  }))
}

function formatTime(date, offset) {
  const d = new Date(date.getTime() + offset * 60000)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function normalizeLogEntry(item, id) {
  const msg = item?.message ?? item?.msg ?? item?.text ?? String(item)
  const ts = item?.timestamp ?? item?.time ?? item?.ts ?? formatTime(new Date(), id)
  const status = item?.status ?? 'valid'
  return { id, message: String(msg), timestamp: String(ts), status }
}
