export default function VerificationSummary({ result, details, onDismiss }) {
    if (!result) {
        return (
            <section className="bg-[var(--bg-card)]/30 backdrop-blur-sm border border-[var(--border-subtle)]/50 rounded-2xl p-4 flex items-center justify-center gap-3 animate-fade-in">
                <span className="text-sm text-[var(--text-muted)] italic">No verification performed yet</span>
            </section>
        )
    }

    return (
        <section className="card-glow rounded-2xl p-5 space-y-4 animate-fade-in transition-300">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">Last Verification Result</h3>
                <button
                    onClick={onDismiss}
                    className="text-xs text-[var(--text-muted)] hover:text-white transition-colors"
                >
                    Dismiss
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-[var(--valid)]">✔</span>
                        <span className="text-white text-lg">{result.valid}</span>
                        <span className="text-[var(--text-muted)] text-[10px] uppercase ml-1">Valid</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-[var(--tampered)]">✖</span>
                        <span className="text-white text-lg">{result.tampered}</span>
                        <span className="text-[var(--text-muted)] text-[10px] uppercase ml-1">Tampered</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-[var(--deleted)]">⚠</span>
                        <span className="text-white text-lg">{result.deleted}</span>
                        <span className="text-[var(--text-muted)] text-[10px] uppercase ml-1">Deleted</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] sm:text-xs">
                    <div className="space-y-1">
                        <p className="text-[var(--text-muted)] uppercase font-bold tracking-tighter">Verified at</p>
                        <p className="text-white font-mono">{details.time}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[var(--text-muted)] uppercase font-bold tracking-tighter">Block Reference</p>
                        <p className="text-white font-mono">#{details.block}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <p className="text-[var(--text-muted)] uppercase font-bold tracking-tighter">Transaction Hash</p>
                        <p className="text-[var(--accent-cyan)] font-mono truncate">{details.tx}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
