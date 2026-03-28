const ACTION_ICONS = {
  call: '📞',
  email: '✉️',
  search: '🔍',
  book: '📅',
  buy: '🛒',
  navigate: '🗺️',
  message: '💬',
  alert: '🚨',
  default: '⚡',
};

function getActionIcon(type) {
  return ACTION_ICONS[type?.toLowerCase()] ?? ACTION_ICONS.default;
}

function UrgencyBadge({ urgency }) {
  const level = urgency?.toLowerCase() ?? 'low';
  const dots = { low: 1, medium: 2, high: 3, critical: 4 };
  const n = dots[level] ?? 1;

  return (
    <span className={`badge badge-${level}`}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      ))}
      {level}
    </span>
  );
}

export default function ResultCard({ result }) {
  const { intent, urgency, user_message, actions = [] } = result;

  return (
    <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Card header */}
      <div
        style={{
          padding: '14px 20px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#4ade80',
              boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Analysis Complete
          </span>
        </div>
        <UrgencyBadge urgency={urgency} />
      </div>

      <div style={{ padding: '20px' }}>
        {/* Detected Intent */}
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              margin: '0 0 6px',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Detected Intent
          </p>
          <p
            id="result-intent"
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
              lineHeight: 1.3,
            }}
          >
            {intent}
          </p>
        </div>

        <div className="divider" style={{ marginBottom: 20 }} />

        {/* AI Explanation */}
        <div style={{ marginBottom: actions.length > 0 ? 20 : 0 }}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            AI Explanation
          </p>
          <p
            id="result-message"
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            {user_message}
          </p>
        </div>

        {/* Suggested Actions */}
        {actions.length > 0 && (
          <>
            <div className="divider" style={{ marginBottom: 20 }} />
            <div>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Suggested Actions
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {actions.map((action, idx) => (
                  <button
                    key={idx}
                    id={`action-btn-${idx}`}
                    className="btn-action"
                    onClick={() => {
                      // Mock: in a real app dispatch action.type
                      console.log('Action triggered:', action);
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{getActionIcon(action.type)}</span>
                    {action.description}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
