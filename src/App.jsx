import { useState, useCallback, useMemo } from 'react'
import { parseLogFile } from './utils/logParser'
import { simulateHash } from './utils/hashSimulation'
import UploadSection from './components/UploadSection'
import SummaryCards from './components/SummaryCards'
import LogsTable from './components/LogsTable'
import BlockchainStatusPanel from './components/BlockchainStatusPanel'
import BlockchainStatusBar from './components/BlockchainStatusBar'
import VerificationSummary from './components/VerificationSummary'
import IntegrityOverviewCard from './components/IntegrityOverviewCard'
import Toast from './components/Toast'
import HashComparison from './components/HashComparison'
import VerificationLoader from './components/VerificationLoader'

const INITIAL_LOGS = []
const STORAGE_KEYS = { logs: 'logs', hashes: 'originalHashes' }

function loadState() {
  try {
    const logs = localStorage.getItem(STORAGE_KEYS.logs)
    const hashes = localStorage.getItem(STORAGE_KEYS.hashes)
    if (logs && hashes) {
      return { logs: JSON.parse(logs), originalHashes: new Map(Object.entries(JSON.parse(hashes))) }
    }
  } catch (_) { }
  return { logs: INITIAL_LOGS, originalHashes: new Map() }
}

function saveState(logs, originalHashes) {
  try {
    localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs))
    localStorage.setItem(STORAGE_KEYS.hashes, JSON.stringify(Object.fromEntries(originalHashes)))
  } catch (_) { }
}

export default function App() {
  const [logs, setLogs] = useState(loadState().logs)
  const [originalHashes, setOriginalHashes] = useState(loadState().originalHashes)
  const [isVerifying, setIsVerifying] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [hashComparison, setHashComparison] = useState(null)
  const [lastVerification, setLastVerification] = useState(null)
  const [verificationDetails, setVerificationDetails] = useState(null)

  const hasData = logs.length > 0
  const isVerified = lastVerification !== null

  const handleUpload = useCallback((text, _filename) => {
    const parsed = parseLogFile(text, _filename)
    const hashes = new Map()
    parsed.forEach((log) => {
      hashes.set(log.id, simulateHash(log.message + log.timestamp))
    })
    setLogs(parsed)
    setOriginalHashes(hashes)
    setLastVerification(null)
    setVerificationDetails(null)
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

    // Simulate network delay and blockchain anchoring
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
      setVerificationDetails({
        time: new Date().toLocaleTimeString(),
        block: 124500 + Math.floor(Math.random() * 100),
        tx: `0x${Math.random().toString(16).slice(2, 64)}`
      })
      setIsVerifying(false)
    }, 1500)
  }, [originalHashes])

  const stats = useMemo(() => ({
    total: logs.length,
    valid: logs.filter((l) => l.status === 'valid').length,
    tampered: logs.filter((l) => l.status === 'tampered').length,
    deleted: logs.filter((l) => l.status === 'deleted').length,
  }), [logs])

  const downloadPDFReport = useCallback(() => {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()

    // Header
    doc.setFillColor(17, 24, 24)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(106, 255, 106)
    doc.setFontSize(22)
    doc.text('Immutable Log Integrity Report', 15, 25)

    doc.setTextColor(150, 150, 150)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 33)

    // Section 1: System Info
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Section 1 — System Info', 15, 50)
    doc.setFontSize(10)
    const systemInfo = [
      ['Network', 'Hardhat Local'],
      ['Contract Address', '0x742d35Cc6634C0532925a3b844Bc9e7595f8bC1e'],
      ['Block Number', verificationDetails ? `#${verificationDetails.block}` : 'N/A'],
      ['Last Transaction', verificationDetails ? verificationDetails.tx.slice(0, 20) + '...' : 'N/A'],
      ['Anchoring Status', 'Confirmed']
    ]
    doc.autoTable({
      head: [['Parameter', 'Status']],
      body: systemInfo,
      startY: 55,
      theme: 'striped',
      headStyles: { fillColor: [21, 29, 34] }
    })

    // Section 2: Summary
    doc.text('Section 2 — Integrity Summary', 15, doc.lastAutoTable.finalY + 15)
    const score = stats.total === 0 ? 100 : Math.round((stats.valid / stats.total) * 100)
    const summary = [
      ['Total Logs', stats.total],
      ['Valid Logs', stats.valid],
      ['Tampered Logs', stats.tampered],
      ['Deleted Logs', stats.deleted],
      ['Integrity Score', `${score}%`],
      ['Verification Time', verificationDetails?.time || 'N/A']
    ]
    doc.autoTable({
      body: summary,
      startY: doc.lastAutoTable.finalY + 20,
      theme: 'grid'
    })

    // Section 3: Log Table
    doc.text('Section 3 — Log Details', 15, doc.lastAutoTable.finalY + 15)
    const logData = logs.map(l => [l.id, l.message, l.timestamp, l.status.toUpperCase()])
    doc.autoTable({
      head: [['ID', 'Message', 'Timestamp', 'Status']],
      body: logData,
      startY: doc.lastAutoTable.finalY + 20,
      styles: { fontSize: 8 }
    })

    doc.save(`log-integrity-report-${Date.now()}.pdf`)
  }, [logs, stats, verificationDetails])

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
    setVerificationDetails(null)
    try {
      localStorage.removeItem(STORAGE_KEYS.logs)
      localStorage.removeItem(STORAGE_KEYS.hashes)
    } catch (_) { }
  }, [])

  const dismissVerificationResult = useCallback(() => setLastVerification(null), [])

  return (
    <div className="min-h-screen bg-grid-pattern flex flex-col">
      <header className="sticky top-0 z-30 w-full bg-[var(--bg-dark)]/95 backdrop-blur-md border-b border-[var(--border-subtle)]/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight gradient-text">
              ⛓ LogBlock
            </h1>
            <div className="h-6 w-px bg-[var(--border-subtle)]" />
            <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-widest hidden sm:inline">
              Immutable Storage
            </span>
          </div>

          <div className="flex items-center gap-3">
            {hasData && (
              <>
                <UploadSection onUpload={handleUpload} disabled={isVerifying} />
                <button
                  type="button"
                  onClick={verifyIntegrity}
                  disabled={isVerifying}
                  className="px-5 py-2 rounded-xl btn-gradient text-sm font-bold shadow-[0_0_15px_rgba(106,255,106,0.3)] transition-300"
                >
                  Verify Integrity
                </button>
                <button
                  type="button"
                  onClick={downloadPDFReport}
                  className="p-2.5 rounded-xl btn-icon-secondary"
                  title="Download PDF Report"
                >
                  📥
                </button>
              </>
            )}
            <button
              type="button"
              onClick={clearData}
              className="p-2.5 rounded-xl btn-icon-secondary btn-destructive"
              title="Clear Data"
            >
              🗑
            </button>
          </div>
        </div>
        <BlockchainStatusBar />
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8 overflow-hidden">
        {/* Stepper Logic Component */}
        <nav className="flex items-center justify-center gap-8 mb-4" aria-label="Workflow Progress">
          {[
            { id: 1, label: 'Upload', status: hasData ? 'done' : 'active' },
            { id: 2, label: 'Review', status: hasData ? (isVerified ? 'done' : 'active') : 'todo' },
            { id: 3, label: 'Verify', status: isVerified ? 'done' : 'todo' },
          ].map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300
                ${step.status === 'done' ? 'bg-[var(--valid)] text-[var(--bg-dark)]' :
                  step.status === 'active' ? 'bg-[var(--accent-cyan)] text-[var(--bg-dark)] shadow-sm' :
                    'bg-white/5 text-[var(--text-muted)] border border-white/10'}
              `}>
                {step.status === 'done' ? '✔' : step.id}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step.status === 'todo' ? 'text-[var(--text-muted)]' : 'text-white'}`}>
                {step.label}
              </span>
              {idx < 2 && <div className="w-6 h-px bg-[var(--border-subtle)] sm:w-10 opacity-50" />}
            </div>
          ))}
        </nav>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh] animate-fade-in-up">
            <UploadSection onUpload={handleUpload} disabled={isVerifying} isLarge={true} />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in transition-300">
            <SummaryCards {...stats} />

            <VerificationSummary
              result={lastVerification}
              details={verificationDetails}
              onDismiss={dismissVerificationResult}
            />

            <div className="dashboard-grid">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    📄 System Logs
                    <span className="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-[var(--text-muted)] uppercase tracking-tighter">
                      {logs.length} Total Records
                    </span>
                  </h2>
                </div>
                <LogsTable
                  logs={logs}
                  originalHashes={originalHashes}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onShowHashComparison={showHashComparison}
                  isVerifying={isVerifying}
                />
              </div>

              <div className="space-y-6">
                <BlockchainStatusPanel />
                <IntegrityOverviewCard
                  {...stats}
                  lastVerifiedTime={verificationDetails?.time}
                />
              </div>
            </div>
          </div>
        )}
      </main>

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
