import { useAuth } from '../context/AuthContext';

export default function Header({ modelName }) {
  const { currentUser, logout } = useAuth();
  
  return (
    <header
      style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Logo mark */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '-0.3px',
                color: 'var(--text-primary)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Login Status */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 10, borderRight: '1px solid var(--border-subtle)' }}>
              <img 
                src={currentUser.photoURL || 'https://via.placeholder.com/32'} 
                alt="avatar" 
                title={currentUser.email}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} 
              />
              <button 
                onClick={logout} 
                style={{
                  background: 'none', border: 'none', fontSize: 12, 
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Sign Out
              </button>
            </div>
          )}
          
          <div
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            {modelName || 'Gemini 2.5 Flash'}
          </div>
        </div>
      </div>
    </header>
  );
}
