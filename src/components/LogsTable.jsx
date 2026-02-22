import { useState, useMemo } from 'react'

const statusConfig = {
  valid: { label: 'Valid', color: 'var(--valid)', icon: '✅' },
  tampered: { label: 'Tampered', color: 'var(--tampered)', icon: '❌' },
  deleted: { label: 'Deleted', color: 'var(--deleted)', icon: '⚠' },
}

export default function LogsTable({ logs, originalHashes, onEdit, onDelete, onShowHashComparison, isVerifying, emptyMessage }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const filtered = useMemo(() => {
    let list = [...logs]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((l) => String(l.message).toLowerCase().includes(q) || String(l.id).includes(q))
    }
    if (filterStatus !== 'all') list = list.filter((l) => l.status === filterStatus)
    return list
  }, [logs, search, filterStatus])

  function startEdit(log) {
    setEditingId(log.id)
    setEditValue(log.message)
  }
  function saveEdit() {
    if (editingId != null && editValue.trim() !== '') {
      onEdit(editingId, editValue.trim())
      setEditingId(null)
      setEditValue('')
    }
  }
  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  return (
    <section className="rounded-2xl bg-[var(--bg-card)] card-glow shadow-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border-subtle)] flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-2 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-subtle)] text-white placeholder-[var(--text-muted)] outline-none transition-all duration-200 focus:border-[var(--accent-cyan)] focus:ring-2 focus:ring-[var(--accent-cyan)]/30 focus:shadow-[0_0_12px_rgba(0,255,255,0.15)]"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[var(--bg-dark)] border border-[var(--border-subtle)] text-white focus:border-[var(--accent-cyan)] focus:ring-2 focus:ring-[var(--accent-cyan)]/30 outline-none transition-all duration-200"
        >
          <option value="all">All statuses</option>
          <option value="valid">Valid</option>
          <option value="tampered">Tampered</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] z-10">
            <tr className="text-[var(--text-muted)] text-sm font-medium">
              <th className="px-4 py-3 w-20">Log ID</th>
              <th className="px-4 py-3">Log Message</th>
              <th className="px-4 py-3 w-28">Timestamp</th>
              <th className="px-4 py-3 w-32">Status</th>
              <th className="px-4 py-3 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                      <span className="text-4xl opacity-60">📤</span>
                      <p className="font-medium">{emptyMessage ?? 'Upload a log file to get started.'}</p>
                      <p className="text-sm opacity-80">.txt (line-by-line) or .json array</p>
                    </div>
                  ) : (
                    'No logs match your filters.'
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--border-subtle)] hover:bg-white/5 transition-all duration-200 hover:shadow-[inset_0_0_20px_rgba(106,255,106,0.03)]"
                >
                  <td className="px-4 py-3 font-mono-hash">{log.id}</td>
                  <td className="px-4 py-3">
                    {editingId === log.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="flex-1 px-2 py-1 rounded bg-[var(--bg-dark)] border border-[var(--accent-cyan)]/50 text-white font-mono-hash text-sm focus:ring-2 focus:ring-[var(--accent-cyan)]/30 outline-none"
                          autoFocus
                        />
                        <button type="button" onClick={saveEdit} className="text-[var(--accent-green)] text-sm hover:underline transition-opacity">Save</button>
                        <button type="button" onClick={cancelEdit} className="text-[var(--text-muted)] text-sm hover:text-white transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <span className="font-mono-hash break-all">{log.message}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                      style={{
                        color: statusConfig[log.status]?.color ?? 'inherit',
                        backgroundColor: `${statusConfig[log.status]?.color ?? '#333'}15`,
                        border: `1px solid ${statusConfig[log.status]?.color ?? '#333'}30`
                      }}
                    >
                      {statusConfig[log.status]?.icon ?? '•'} {statusConfig[log.status]?.label ?? log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {onShowHashComparison && (
                      <button
                        type="button"
                        onClick={() => onShowHashComparison(log)}
                        className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] text-sm mr-2 transition-colors hover:scale-105 inline-block"
                        title="Compare hashes"
                      >
                        📋 Hash
                      </button>
                    )}
                    {!isVerifying && log.status !== 'deleted' && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(log)}
                          className="text-[var(--accent-cyan)] hover:underline text-sm mr-2 transition-all hover:scale-105"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(log.id)}
                          className="text-[var(--tampered)] hover:underline text-sm transition-all hover:scale-105"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
