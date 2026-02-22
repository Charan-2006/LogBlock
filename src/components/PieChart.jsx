export default function PieChart({ valid, tampered, deleted }) {
  const total = valid + tampered + deleted
  const validPct = total === 0 ? 0 : Math.round((valid / total) * 100)

  // Professional colors: Green, Red, Orange
  const colors = {
    valid: '#22c55e',
    tampered: '#ef4444',
    deleted: '#f97316'
  }

  // SVG pie chart with dynamic segments
  const radius = 35
  const circum = 2 * Math.PI * radius

  const vDash = total === 0 ? 0 : (valid / total) * circum
  const tDash = total === 0 ? 0 : (tampered / total) * circum
  const dDash = total === 0 ? 0 : (deleted / total) * circum

  return (
    <div className="flex flex-col items-center justify-center py-4 relative">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />

          {/* Valid slice */}
          <circle
            cx="50" cy="50" r={radius} fill="transparent"
            stroke={colors.valid} strokeWidth="12"
            strokeDasharray={`${vDash} ${circum}`}
            className="transition-all duration-700 ease-out"
          />

          {/* Tampered slice */}
          <circle
            cx="50" cy="50" r={radius} fill="transparent"
            stroke={colors.tampered} strokeWidth="12"
            strokeDasharray={`${tDash} ${circum}`}
            strokeDashoffset={-vDash}
            className="transition-all duration-700 ease-out"
          />

          {/* Deleted slice */}
          <circle
            cx="50" cy="50" r={radius} fill="transparent"
            stroke={colors.deleted} strokeWidth="12"
            strokeDasharray={`${dDash} ${circum}`}
            strokeDashoffset={-(vDash + tDash)}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white leading-none">{validPct}%</span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mt-1">Valid</span>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 mt-8 w-full text-sm font-medium">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.valid }} />
          <span className="text-white/80">Valid Logs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.tampered }} />
          <span className="text-white/80">Tampered Logs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.deleted }} />
          <span className="text-white/80">Deleted Logs</span>
        </div>
      </div>
    </div>
  )
}
