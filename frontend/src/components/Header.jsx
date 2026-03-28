export default function Header() {
  return (
    <header
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        background: 'rgba(15, 17, 23, 0.85)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Logo mark */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #6c63ff 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 12px rgba(108,99,255,0.4)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.3px',
                background: 'linear-gradient(90deg, #f0f2f8 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.2,
              }}
            >
              IntentBridge AI
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              Real-world input → Structured actions
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '4px 12px',
            borderRadius: 20,
            background: 'rgba(108,99,255,0.12)',
            border: '1px solid rgba(108,99,255,0.25)',
            fontSize: 12,
            color: '#a78bfa',
            fontWeight: 500,
          }}
        >
          AI-Powered
        </div>
      </div>
    </header>
  );
}
