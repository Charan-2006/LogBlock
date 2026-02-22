import PieChart from './PieChart'

export default function IntegrityOverviewCard({ valid, tampered, deleted, lastVerifiedTime }) {
    const total = valid + tampered + deleted
    const integrityScore = total === 0 ? 100 : Math.round((valid / total) * 100)

    return (
        <section className="card-glow rounded-2xl p-6 card-entrance">
            <h3 className="text-lg font-bold text-white mb-6">Integrity Overview</h3>

            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-muted)] font-medium">Total Logs</span>
                    <span className="text-white font-bold">{total}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-muted)] font-medium">Last Verified</span>
                    <span className="text-white font-mono text-xs">{lastVerifiedTime || 'Never'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-muted)] font-medium">Integrity Score</span>
                    <span className={`font-bold ${integrityScore === 100 ? 'text-[var(--valid)]' : integrityScore > 70 ? 'text-orange-400' : 'text-[var(--tampered)]'}`}>
                        {integrityScore}%
                    </span>
                </div>
            </div>

            <PieChart valid={valid} tampered={tampered} deleted={deleted} />
        </section>
    )
}
