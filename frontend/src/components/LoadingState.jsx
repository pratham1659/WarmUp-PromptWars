export default function LoadingState() {
  return (
    <div className="card animate-fade-in" style={{ padding: 24 }}>
      {/* Header stub */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 160, height: 14 }} />
        <div className="skeleton" style={{ width: 64, height: 22, borderRadius: 20 }} />
      </div>

      {/* Intent line */}
      <div style={{ marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 80, height: 11, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '70%', height: 20 }} />
      </div>

      <div className="divider" style={{ marginBottom: 20 }} />

      {/* Message lines */}
      <div style={{ marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 110, height: 11, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: '100%', height: 13, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: '88%', height: 13, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: '62%', height: 13 }} />
      </div>

      <div className="divider" style={{ marginBottom: 20 }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="skeleton" style={{ width: 110, height: 34, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 90, height: 34, borderRadius: 8 }} />
      </div>

      {/* Spinner overlay */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
        <div
          className="animate-spin-custom"
          style={{
            width: 18,
            height: 18,
            border: '2px solid rgba(0,0,0,0.08)',
            borderTopColor: 'var(--text-primary)',
            borderRadius: '50%',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Analysing your input and generating actions…
        </span>
      </div>
    </div>
  );
}
