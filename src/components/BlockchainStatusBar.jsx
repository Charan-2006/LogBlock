export default function BlockchainStatusBar() {
    return (
        <div className="global-status-bar animate-fade-in">
            <div className="flex items-center gap-2">
                <div className="status-dot" />
                <span className="font-semibold text-white/90">Network:</span>
                <span>Hardhat Local</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xl leading-none">🔗</span>
                <span className="font-semibold text-white/90">Smart Contract:</span>
                <span className="text-[var(--accent-cyan)]">Connected</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xl leading-none">⛓</span>
                <span className="font-semibold text-white/90">Anchoring:</span>
                <span className="text-[var(--valid)]">Confirmed</span>
            </div>
        </div>
    )
}
