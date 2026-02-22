import { useEffect, useState } from 'react'

const cards = [
  { key: 'total', label: 'Total Logs', icon: '📋', color: 'var(--accent-blue)' },
  { key: 'valid', label: 'Valid Logs', icon: '✅', color: 'var(--valid)' },
  { key: 'tampered', label: 'Tampered Logs', icon: '❌', color: 'var(--tampered)' },
  { key: 'deleted', label: 'Deleted Logs', icon: '⚠️', color: 'var(--deleted)' },
]

function AnimatedCounter({ value, duration = 600 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = display
    const end = value
    if (start === end) return
    const startTime = performance.now()
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - (1 - t) ** 2
      setDisplay(Math.round(start + (end - start) * eased))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])
  return <span>{display}</span>
}

export default function SummaryCards({ total, valid, tampered, deleted }) {
  const stats = { total, valid, tampered, deleted }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon, color }, i) => (
        <div
          key={key}
          className="rounded-2xl bg-[var(--bg-card)] card-glow shadow-xl p-5 flex items-center gap-4 card-entrance"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <span className="text-3xl opacity-80">{icon}</span>
          <div>
            <p className="text-[var(--text-muted)] text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold tabular-nums transition-colors duration-300" style={{ color }}>
              <AnimatedCounter value={stats[key] ?? 0} />
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
