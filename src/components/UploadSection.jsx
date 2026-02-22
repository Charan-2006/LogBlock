import { useRef, useState } from 'react'

export default function UploadSection({ onUpload, disabled, isLarge = false }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
    e.target.value = ''
  }

  function processFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') onUpload(text, file.name)
    }
    reader.readAsText(file)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const onDragLeave = () => {
    setIsDragging(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    processFile(file)
  }

  if (isLarge) {
    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl fade-in-up">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white tracking-tight">System ready for log ingestion</h2>
          <p className="text-[var(--text-muted)] text-lg max-w-lg mx-auto">
            Blockchain anchoring is active. Upload a log file to begin integrity monitoring.
          </p>
          <div className="flex items-center justify-center gap-6 pt-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-cyan)] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
              🔗 Blockchain connected
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold text-[var(--valid)] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--valid)]" />
              🛡 Integrity monitoring enabled
            </span>
          </div>
        </div>

        <div
          className={`upload-zone-large ${isDragging ? 'drag-over' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.json,text/plain,application/json"
            onChange={handleFile}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] flex items-center justify-center text-3xl animate-glow-pulse border border-[var(--accent-cyan)]/20">
              📤
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Upload Log File</h3>
              <p className="text-[var(--text-muted)]">
                Drag & drop a .txt or .json log file, or click to browse
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 mt-2">
              <button
                type="button"
                disabled={disabled}
                className="px-8 py-3 rounded-xl btn-gradient text-base font-bold shadow-lg transition-all"
              >
                Choose File
              </button>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">.TXT</span>
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">.JSON</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-2xl bg-[var(--bg-card)] glass-panel card-glow shadow-xl p-4 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl animate-glow-pulse">📤</span>
          <div>
            <h2 className="text-sm font-semibold text-white">Upload New File</h2>
            <p className="text-xs text-[var(--text-muted)]">.txt or .json</p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.json,text/plain,application/json"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="px-4 py-2 rounded-xl btn-gradient text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Upload
        </button>
      </div>
    </section>
  )
}
