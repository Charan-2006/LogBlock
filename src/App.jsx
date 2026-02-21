import { useState, useCallback } from 'react'
import { parseLogFile } from './utils/logParser'
import { simulateHash } from './utils/hashSimulation'
import UploadSection from './components/UploadSection'
import SummaryCards from './components/SummaryCards'
import LogsTable from './components/LogsTable'
import BlockchainStatusPanel from './components/BlockchainStatusPanel'
import Toast from './components/Toast'
import HashComparison from './components/HashComparison'
import VerificationLoader from './components/VerificationLoader'
import PieChart from './components/PieChart'

const INITIAL_LOGS = []
const STORAGE_KEYS = { logs: 'logs', hashes: 'originalHashes' }

function loadState() {
  try {
    const logs = localStorage.getItem(STORAGE_KEYS.logs)
    const hashes = localStorage.getItem(STORAGE_KEYS.hashes)
    if (logs && hashes) {
      return { logs: JSON.parse(logs), originalHashes: new Map(Object.entries(JSON.parse(hashes))) }
    }
  } catch (_) {}
  return { logs: INITIAL_LOGS, originalHashes: new Map() }
}

function saveState(logs, originalHashes) {
  try {
    localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs))
    localStorage.setItem(STORAGE_KEYS.hashes, JSON.stringify(Object.fromEntries(originalHashes)))
  } catch (_) {}
}

export default function App() {
  const [logs, setLogs] = useState(loadState().logs)
  const [originalHashes, setOriginalHashes] = useState(loadState().originalHashes)
  const [isVerifying, setIsVerifying] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [hashComparison, setHashComparison] = useState(null)
  const [lastVerification, setLastVerification] = useState(null)

  const handleUpload = useCallback((text, _filename) => {
    const parsed = parseLogFile(text, _filename)
    const hashes = new Map()
    parsed.forEach((log) => {
      hashes.set(log.id, simulateHash(log.message + log.timestamp))
    })
    setLogs(parsed)
    setOriginalHashes(hashes)
    saveState(parsed, hashes)
  }, [])

  const handleEdit = useCallback((id, newMessage) => {
    setLogs((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, message: newMessage } : l))
      saveState(next, originalHashes)
      return next
    })
  }, [originalHashes])

  const handleDelete = useCallback((id) => {
    setLogs((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, status: 'deleted', message: '(deleted)' } : l))
      saveState(next, originalHashes)
      return next
    })
  }, [originalHashes])

  const verifyIntegrity = useCallback(() => {
    setIsVerifying(true)
    setToastVisible(false)
    // Simulate network delay
    setTimeout(() => {
      let hasTampered = false
      let resultCounts = { valid: 0, tampered: 0, deleted: 0 }
      const storedHashes = new Map(originalHashes)
      setLogs((prev) => {
        const next = prev.map((log) => {
          if (log.status === 'deleted') {
            hasTampered = true
            return { ...log, status: 'deleted' }
          }
          const originalHash = storedHashes.get(log.id)
          const recalc = simulateHash(log.message + log.timestamp)
          if (originalHash === undefined) {
            hasTampered = true
            return { ...log, status: 'deleted' }
          }
          if (originalHash !== recalc) {
            hasTampered = true
            return { ...log, status: 'tampered' }
          }
          return { ...log, status: 'valid' }
        })
        resultCounts = {
          valid: next.filter((l) => l.status === 'valid').length,
          tampered: next.filter((l) => l.status === 'tampered').length,
          deleted: next.filter((l) => l.status === 'deleted').length,
        }
        saveState(next, originalHashes)
        return next
      })
      if (hasTampered) {
        setToastMessage('⚠ Log integrity compromised')
        setToastVisible(true)
      }
      setLastVerification(resultCounts)
      setIsVerifying(false)
    }, 1800)
  }, [originalHashes])

  const stats = {
    total: logs.length,
    valid: logs.filter((l) => l.status === 'valid').length,
    tampered: logs.filter((l) => l.status === 'tampered').length,
    deleted: logs.filter((l) => l.status === 'deleted').length,
  }

  const downloadReport = useCallback(() => {
    const lines = [
      'Blockchain Log Verification Report',
      new Date().toISOString(),
      '---',
      `Total: ${stats.total}, Valid: ${stats.valid}, Tampered: ${stats.tampered}, Deleted: ${stats.deleted}`,
      '---',
      ...logs.map((l) => `[${l.id}] ${l.status.toUpperCase()} | ${l.timestamp} | ${l.message}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `verification-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [logs, stats])

  const showHashComparison = useCallback((log) => {
    const original = originalHashes.get(log.id)
    const recalc = simulateHash(log.message + log.timestamp)
    setHashComparison({ original: original ?? '(none)', recalculated: recalc })
  }, [originalHashes])

  const clearData = useCallback(() => {
    setLogs(INITIAL_LOGS)
    setOriginalHashes(new Map())
    setToastVisible(false)
    setLastVerification(null)
    try {
      localStorage.removeItem(STORAGE_KEYS.logs)
      localStorage.removeItem(STORAGE_KEYS.hashes)
    } catch (_) {}
  }, [])

  const dismissVerificationResult = useCallback(() => setLastVerification(null), [])

  return (
    <div className="min-h-screen bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <header className="sticky top-0 z-20 -mx-4 px-4 py-4 -mt-4 mb-2 flex flex-wrap items-center justify-between gap-4 animate-[fadeSlide_0.5s_ease-out] bg-[var(--bg-dark)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)]/50">
          <h1 className="text-2xl font-bold tracking-tight gradient-text">
            ⛓ Blockchain-Based Immutable Log Storage
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={downloadReport}
              disabled={logs.length === 0}
              className="px-3 py-1.5 rounded-xl btn-outline-gradient text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📥 Download Report
            </button>
            <button
              type="button"
              onClick={clearData}
              className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--tampered)] hover:border-[var(--tampered)]/50 text-sm transition-all duration-200"
              title="Clear all logs and stored data (hides toast)"
            >
              🗑 Clear data
            </button>
          </div>
        </header>

        {/* Flow hint: guides user without changing layout */}
        <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm text-[var(--text-muted)]" aria-label="Workflow">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] flex items-center justify-center text-xs font-bold">1</span>
            Upload
          </span>
          <span className="opacity-50">→</span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] flex items-center justify-center text-xs font-bold">2</span>
            Review / Edit
          </span>
          <span className="opacity-50">→</span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] flex items-center justify-center text-xs font-bold">3</span>
            Verify
          </span>
        </nav>

        <UploadSection onUpload={handleUpload} disabled={isVerifying} />

        <SummaryCards {...stats} />

        {lastVerification && (
          <section className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4 py-3 flex flex-wrap items-center justify-between gap-3 animate-[fadeSlide_0.3s_ease-out]">
            <span className="text-sm text-[var(--text-muted)]">Last verification:</span>
            <span className="flex flex-wrap items-center gap-4 text-sm">
              <span style={{ color: 'var(--valid)' }}>✓ {lastVerification.valid} valid</span>
              <span style={{ color: 'var(--tampered)' }}>✗ {lastVerification.tampered} tampered</span>
              <span style={{ color: 'var(--deleted)' }}>⚠ {lastVerification.deleted} deleted</span>
            </span>
            <button type="button" onClick={dismissVerificationResult} className="text-[var(--text-muted)] hover:text-white text-xs transition-colors">Dismiss</button>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold gradient-text">Logs</h2>
              <button
                type="button"
                onClick={verifyIntegrity}
                disabled={logs.length === 0 || isVerifying}
                className="px-5 py-2.5 rounded-xl btn-gradient font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify Integrity
              </button>
            </div>
            <LogsTable
              logs={logs}
              originalHashes={originalHashes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShowHashComparison={showHashComparison}
              isVerifying={isVerifying}
              emptyMessage={logs.length === 0 ? 'Upload a log file above to get started. Use .txt (line-by-line) or .json.' : null}
            />
          </div>
          <div className="lg:w-80 shrink-0 space-y-6">
            <BlockchainStatusPanel />
            <section className="rounded-2xl bg-[var(--bg-card)] card-glow shadow-xl p-6">
              <h2 className="text-lg font-semibold gradient-text mb-3">Log distribution</h2>
              <PieChart valid={stats.valid} tampered={stats.tampered} deleted={stats.deleted} />
            </section>
          </div>
        </div>
      </div>

      {isVerifying && <VerificationLoader />}
      <Toast
        message={toastMessage}
        type="error"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      {hashComparison && (
        <HashComparison
          originalHash={hashComparison.original}
          recalculatedHash={hashComparison.recalculated}
          onClose={() => setHashComparison(null)}
        />
      )}

    </div>
  )
}
