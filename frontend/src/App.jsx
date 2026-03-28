import { useState, useEffect } from 'react';
import Header from './components/Header';
import InputCard from './components/InputCard';
import ResultCard from './components/ResultCard';
import LoadingState from './components/LoadingState';
import PipelineSidebar from './components/PipelineSidebar';
import { useAuth } from './context/AuthContext';

async function processInput({ text, imageFile, model, location, token }) {
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const formData = new FormData();
  if (text) formData.append('text', text);
  if (imageFile) formData.append('image', imageFile);
  if (model) formData.append('model', model);
  if (location) formData.append('location', JSON.stringify(location));

  const res = await fetch(`${API_BASE}/api/process`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || `Server error (HTTP ${res.status})`);
  }

  return await res.json();
}

export default function App() {
  const { currentUser, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pipelineStages, setPipelineStages] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/models`)
      .then(r => r.json())
      .then(data => {
        setModels(data.models || []);
        if (data.models?.length) setSelectedModel(data.models[0].id);
      })
      .catch(() => {
        // Fallback models if backend is unreachable
        const fallback = [
          { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'free' },
        ];
        setModels(fallback);
        setSelectedModel(fallback[0].id);
      });
  }, []);

  const handleSubmit = async (input) => {
    if (!currentUser) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setPipelineStages(null);

    try {
      // Force fetching the live Firebase Authentication ID Token dynamically 
      const token = await currentUser.getIdToken();
      const data = await processInput({ ...input, model: selectedModel, token });
      setResult(data);
      setPipelineStages(data.pipeline || []);
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modelDisplayName = models.find(m => m.id === selectedModel)?.name || 'Gemini 2.5 Flash';

  // ── Authentication Gate ──────────────────────────────────────────
  if (!currentUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
        <div className="card animate-fade-in" style={{ padding: '40px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
          <div style={{
              width: 48, height: 48, borderRadius: 12, background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            IntentBridge AI
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Sign in to unleash lightning-fast multimodal action extraction.
          </p>
          <button 
            onClick={loginWithGoogle} 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: 15, display: 'flex', justifyContent: 'center', background: '#ffffff', color: '#1f2937', border: '1px solid #e5e7eb' }}
          >
            <svg style={{marginRight: 8}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px"><path fill="#fbc02d" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3.1l6.1-6.1C34.3 2.8 29.5 0 24 0 10.7 0 0 10.7 0 24s10.7 24 24 24c13.3 0 24-10.7 24-24 0-1.4-.1-2.7-.4-3.9z"/><path fill="#e53935" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 7.9 3.1l6.1-6.1C34.3 2.8 29.5 0 24 0 16.3 0 9.5 3.6 5.3 9l1 5.7z"/><path fill="#4caf50" d="M24 48c6.5 0 12.3-2.5 16.6-6.6l-6.3-5.3c-2.7 1.8-6.1 2.9-10.3 2.9-5.3 0-9.8-3.4-11.4-8.2l-6.7 5.2C10.2 43.1 16.6 48 24 48z"/><path fill="#1565c0" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.3 5.3C41.4 34.6 44 29.6 44 24c0-1.4-.1-2.7-.4-3.9z"/></svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // ── Main Authenticated View ──────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header modelName={modelDisplayName} />

      <div className="app-layout">
        {/* Left: Pipeline Sidebar */}
        <PipelineSidebar
          stages={pipelineStages}
          loading={loading}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
          modelName={modelDisplayName}
        />

        {/* Right: Main content */}
        <main className="main-content">
          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 20,
              background: 'var(--accent-light)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--accent)',
              marginBottom: 14,
            }}>
              ⚡ Powered by {modelDisplayName}
            </div>
            <h2
              style={{
                margin: '0 0 10px',
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: '-0.8px',
                lineHeight: 1.2,
                background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Speak it. Snap it. Solve it.
            </h2>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              Drop any chaotic thought, voice note, or image —
              <br />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>IntentBridge AI</span> turns it into a clear action plan.
            </p>
          </div>

          {/* Error banner */}
          {error && !loading && (
            <div
              className="card animate-fade-in"
              aria-live="polite"
              style={{
                padding: '14px 18px',
                borderColor: '#fecaca',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 12
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>⚠️</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#dc2626' }}>
                  Something went wrong
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                style={{
                  background: 'none', border: 'none', color: '#dc2626',
                  cursor: 'pointer', fontSize: 16, padding: 2, flexShrink: 0,
                  opacity: 0.7, transition: 'opacity 0.2s',
                }}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Input */}
          <InputCard
            onSubmit={handleSubmit}
            loading={loading}
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          {/* Loading skeleton */}
          {loading && <LoadingState />}

          {/* Result */}
          {result && !loading && <ResultCard result={result} />}

        </main>
      </div>
    </div>
  );
}
