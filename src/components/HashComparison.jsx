import { useState } from 'react'

function HashView({ hash, label, isDiff }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(hash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <div className="flex items-center gap-2">
        <code
          className={`font-mono-hash break-all px-2 py-1 rounded ${isDiff ? 'bg-red-500/20 text-[var(--tampered)]' : 'bg-white/5'}`}
        >
          {hash}
        </code>
        <button
          type="button"
          onClick={copy}
          className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-all hover:scale-110 shrink-0"
          title="Copy hash"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  )
}

export default function HashComparison({ originalHash, recalculatedHash, onClose }) {
  const match = originalHash === recalculatedHash
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 animate-[fadeSlide_0.2s_ease-out]" onClick={onClose}>
      <div
        className="rounded-2xl bg-[var(--bg-card)] card-glow shadow-2xl p-6 max-w-lg w-full space-y-4 animate-[fadeSlide_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold gradient-text">Hash Comparison</h3>
        <HashView hash={originalHash} label="Original hash (stored)" isDiff={!match} />
        <HashView hash={recalculatedHash} label="Recalculated hash" isDiff={!match} />
        <p className={`text-sm ${match ? 'text-[var(--valid)]' : 'text-[var(--tampered)]'}`}>
          {match ? '✅ Hashes match — log is valid.' : '❌ Hashes differ — log may have been tampered.'}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl btn-gradient font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}
