import { useState, useEffect } from 'react';
import Header from './components/Header';
import InputCard from './components/InputCard';
import ResultCard from './components/ResultCard';
import LoadingState from './components/LoadingState';
import PipelineSidebar from './components/PipelineSidebar';

async function processInput({ text, imageFile, model, location }) {
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const formData = new FormData();
  if (text) formData.append('text', text);
  if (imageFile) formData.append('image', imageFile);
  if (model) formData.append('model', model);
  if (location) formData.append('location', JSON.stringify(location));

  const res = await fetch(`${API_BASE}/api/process`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || `Server error (HTTP ${res.status})`);
  }

  return await res.json();
}

export default function App() {
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
          { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'paid' },
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tier: 'free' },
        ];
        setModels(fallback);
        setSelectedModel(fallback[0].id);
      });
  }, []);

  const handleSubmit = async (input) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setPipelineStages(null);

    try {
      const data = await processInput({ ...input, model: selectedModel });
      setResult(data);
      setPipelineStages(data.pipeline || []);
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modelDisplayName = models.find(m => m.id === selectedModel)?.name || 'Gemini 2.5 Flash';

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

          {/* Error banner — shown ABOVE the input card */}
          {error && !loading && (
            <div
              id="error-message"
              className="card animate-fade-in"
              aria-live="polite"
              style={{
                padding: '14px 18px',
                borderColor: '#fecaca',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
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
                onMouseEnter={e => e.target.style.opacity = 1}
                onMouseLeave={e => e.target.style.opacity = 0.7}
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
