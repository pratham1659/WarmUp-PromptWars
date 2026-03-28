import { useState, useEffect } from 'react';

// ── SVG Icons ───────────────────────────────────────────────────────────
const InboxIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const BrainIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a6 6 0 0 0-6 6c0 1.6.6 3 1.7 4.1L12 16l4.3-3.9A6 6 0 0 0 18 8a6 6 0 0 0-6-6z" />
    <path d="M12 16v6" />
    <path d="M8 22h8" />
  </svg>
);

const ZapIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const STAGE_ICONS = {
  'Input Received': <InboxIcon />,
  'Intent Extraction': <BrainIcon />,
  'Action Generation': <ZapIcon />,
  'Response Ready': <CheckCircleIcon />,
};

const STAGE_LABELS = ['Input Received', 'Intent Extraction', 'Action Generation', 'Response Ready'];

function StatusDot({ status }) {
  const colors = {
    pending: 'var(--text-muted)',
    active: 'var(--accent)',
    done: '#16a34a',
    error: '#dc2626',
  };

  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: colors[status] || colors.pending,
        flexShrink: 0,
        boxShadow: status === 'active' ? '0 0 8px var(--accent-glow)' : 'none',
        transition: 'all 0.3s ease',
      }}
      className={status === 'active' ? 'animate-pulse-glow' : ''}
    />
  );
}

function ConnectorLine({ active }) {
  return (
    <div
      style={{
        width: 2,
        height: 24,
        marginLeft: 4,
        background: active
          ? 'linear-gradient(180deg, #16a34a 0%, var(--accent) 100%)'
          : 'var(--border-subtle)',
        borderRadius: 1,
        transition: 'background 0.4s ease',
      }}
    />
  );
}

export default function PipelineSidebar({ stages, loading, isOpen, onToggle, modelName }) {
  const [animatedStages, setAnimatedStages] = useState([]);

  useEffect(() => {
    if (stages && stages.length > 0) {
      setAnimatedStages(stages);
    } else if (loading) {
      setAnimatedStages(
        STAGE_LABELS.map((label, i) => ({
          label,
          status: i === 0 ? 'done' : i === 1 ? 'active' : 'pending',
          duration_ms: i === 0 ? 0 : null,
        }))
      );
    } else {
      setAnimatedStages(
        STAGE_LABELS.map((label) => ({
          label,
          status: 'pending',
          duration_ms: null,
        }))
      );
    }
  }, [stages, loading]);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle pipeline sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={isOpen ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
        </svg>
      </button>

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-inner">
          {/* Sidebar header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: loading ? 'var(--accent)' : (stages?.length > 0 ? '#16a34a' : 'var(--text-muted)'),
                transition: 'all 0.3s ease',
              }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Pipeline
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {loading ? 'Processing your input…' : stages?.length > 0 ? 'Pipeline complete' : 'Awaiting input'}
            </p>
          </div>

          {/* Pipeline stages */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {animatedStages.map((stage, idx) => (
              <div key={stage.label}>
                <div
                  className="pipeline-step"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: stage.status === 'active'
                      ? 'rgba(217, 119, 6, 0.06)'
                      : stage.status === 'done'
                      ? 'rgba(22, 163, 74, 0.04)'
                      : 'transparent',
                    transition: 'background 0.3s ease',
                  }}
                >
                  <StatusDot status={stage.status} />

                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <div style={{
                      color: stage.status === 'pending'
                        ? 'var(--text-muted)'
                        : stage.status === 'active'
                        ? 'var(--accent)'
                        : '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                      transition: 'color 0.3s ease',
                    }}>
                      {STAGE_ICONS[stage.label] || <ZapIcon />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: stage.status === 'active' ? 600 : 500,
                        color: stage.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                        transition: 'color 0.3s ease',
                        display: 'block',
                      }}>
                        {stage.label}
                      </span>
                      {stage.duration_ms != null && stage.status === 'done' && (
                        <span style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}>
                          {stage.duration_ms < 1 ? '<1ms' : `${Math.round(stage.duration_ms)}ms`}
                        </span>
                      )}
                    </div>
                  </div>

                  {stage.status === 'active' && (
                    <div
                      className="animate-spin-custom"
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(217, 119, 6, 0.2)',
                        borderTopColor: 'var(--accent)',
                        borderRadius: '50%',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>

                {idx < animatedStages.length - 1 && (
                  <div style={{ paddingLeft: 16 }}>
                    <ConnectorLine active={stage.status === 'done'} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom model info */}
          <div style={{
            marginTop: 28,
            padding: '14px 14px',
            background: 'rgba(0,0,0,0.02)',
            borderRadius: 10,
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Model
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
              {modelName || 'Gemini 2.5 Flash'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
              Multimodal · Text + Vision
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
