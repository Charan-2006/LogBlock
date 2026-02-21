import { useRef } from 'react'

export default function UploadSection({ onUpload, disabled }) {
  const inputRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') onUpload(text, file.name)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <section className="rounded-2xl bg-[var(--bg-card)] card-glow shadow-xl p-6 transition-all duration-200">
      <h2 className="text-lg font-semibold gradient-text mb-4 flex items-center gap-2">
        <span className="text-xl animate-glow-pulse">📤</span> Upload Log File
      </h2>
      <div className="flex flex-wrap items-center gap-4">
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
          className="px-5 py-2.5 rounded-xl btn-gradient font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Choose File
        </button>
        <span className="text-[var(--text-muted)] text-sm">.txt (line-by-line) or .json array</span>
      </div>
    </section>
  )
}
