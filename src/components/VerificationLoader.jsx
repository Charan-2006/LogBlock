export default function VerificationLoader() {
  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-[var(--bg-dark)]/90 backdrop-blur-sm animate-[fadeSlide_0.3s_ease-out]">
      <div
        className="w-14 h-14 rounded-full border-2 border-transparent border-t-[var(--accent-cyan)] border-r-[var(--accent-green)] animate-spin"
        style={{ boxShadow: '0 0 24px rgba(0,255,255,0.3)' }}
      />
      <p className="gradient-text font-medium animate-pulse">Verifying with blockchain...</p>
      <div className="w-64 h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
        <div
          className="h-full rounded-full animate-[progress_1.5s_ease-in-out_infinite]"
          style={{
            width: '40%',
            background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
            boxShadow: '0 0 10px rgba(106,255,106,0.5)',
          }}
        />
      </div>
    </div>
  )
}
