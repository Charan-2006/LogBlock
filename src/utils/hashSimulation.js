/**
 * Simulated hash for frontend demo. Deterministic from content.
 * In production this would be a real cryptographic hash from the backend.
 */
export function simulateHash(content) {
  let h = 0
  const str = String(content)
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    h = ((h << 5) - h) + char
    h = h & h
  }
  const hex = Math.abs(h).toString(16).padStart(8, '0')
  return `0x${hex.repeat(8).slice(0, 64)}`
}
