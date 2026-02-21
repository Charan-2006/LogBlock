import { useState } from 'react'

const DUMMY = {
  network: 'Demo / Mock',
  contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bC1e',
  lastTxHash: '0x8f7a2e...d4c9b1',
  blockNumber: '124507',
  anchoringStatus: 'Confirmed',
}

export default function BlockchainStatusPanel() {
  const [copied, setCopied] = useState(null)
  function copy(text, key) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <section className="rounded-2xl bg-[var(--bg-card)] card-glow shadow-xl p-6">
      <h2 className="text-lg font-semibold gradient-text mb-4 flex items-center gap-2">
        <span className="text-xl animate-glow-pulse">⛓</span> Blockchain Status
      </h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[var(--text-muted)]">Network</span>
          <span className="font-mono-hash text-[var(--accent-cyan)]">{DUMMY.network}</span>
        </div>
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <span className="text-[var(--text-muted)]">Contract Address</span>
          <span className="font-mono-hash text-[var(--accent-cyan)] truncate max-w-[200px]" title={DUMMY.contractAddress}>
            {DUMMY.contractAddress}
          </span>
          <button
            type="button"
            onClick={() => copy(DUMMY.contractAddress, 'contract')}
            className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-all hover:scale-110 inline-block"
            title="Copy"
          >
            {copied === 'contract' ? '✓' : '📋'}
          </button>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-[var(--text-muted)]">Last Transaction Hash</span>
          <span className="font-mono-hash text-[var(--accent-cyan)]">{DUMMY.lastTxHash}</span>
          <button
            type="button"
            onClick={() => copy(DUMMY.lastTxHash, 'tx')}
            className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-all hover:scale-110 inline-block"
          >
            {copied === 'tx' ? '✓' : '📋'}
          </button>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-[var(--text-muted)]">Block Number</span>
          <span className="font-mono-hash">{DUMMY.blockNumber}</span>
        </div>
        <div className="flex justify-between items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <span className="text-[var(--text-muted)]">Anchoring Status</span>
          <span className="inline-flex items-center gap-1 text-[var(--valid)] font-medium animate-pulse">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--valid)]" /> ✅ {DUMMY.anchoringStatus}
          </span>
        </div>
      </div>
    </section>
  )
}
