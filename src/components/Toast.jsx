import { useEffect } from 'react'

export default function Toast({ message, type = 'error', onClose, visible }) {
  useEffect(() => {
    if (!visible || !onClose) return
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [visible, onClose])

  if (!visible) return null
  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 max-w-md rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-[fadeSlide_0.3s_ease-out]"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${type === 'error' ? 'var(--tampered)' : 'var(--accent-cyan)'}`,
        boxShadow: type === 'error' ? '0 0 24px rgba(239,68,68,0.3)' : '0 0 24px rgba(106,255,106,0.25), 0 0 48px rgba(0,255,255,0.1)',
      }}
    >
      <span className="text-2xl">{type === 'error' ? '⚠️' : '✅'}</span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-all hover:scale-110 text-lg"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  )
}
