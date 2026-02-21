/** Simple SVG pie chart for log distribution (valid / tampered / deleted) */
const PIE_COLORS = {
  valid: '#06b6d4',    // cyan
  tampered: '#ec4899', // pink
  deleted: '#eab308',  // amber
}

export default function PieChart({ valid = 0, tampered = 0, deleted = 0 }) {
  const total = valid + tampered + deleted
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-sm">
        No data
      </div>
    )
  }
  const v = valid / total
  const t = tampered / total
  const d = deleted / total
  let offset = 0
  const seg = (pct, color) => {
    const o = offset
    offset += pct
    return { o, pct, color }
  }
  const segments = [
    seg(v, PIE_COLORS.valid),
    seg(t, PIE_COLORS.tampered),
    seg(d, PIE_COLORS.deleted),
  ].filter((s) => s.pct > 0)
  const r = 48
  const cx = 50
  const cy = 50
  const path = (start, len) => {
    const a1 = start * 2 * Math.PI - Math.PI / 2
    const a2 = (start + len) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const x2 = cx + r * Math.cos(a2)
    const y2 = cy + r * Math.sin(a2)
    const large = len >= 0.5 ? 1 : 0
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {segments.map((s, i) => (
          <path
            key={i}
            d={path(s.o, s.pct)}
            fill={s.color}
            className="transition-opacity hover:opacity-90"
            style={{ opacity: 0.9 }}
          />
        ))}
      </svg>
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS.valid }} /> Valid</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS.tampered }} /> Tampered</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS.deleted }} /> Deleted</span>
      </div>
    </div>
  )
}
