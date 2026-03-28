import { useState } from 'react';
import Header from './components/Header';
import InputCard from './components/InputCard';
import ResultCard from './components/ResultCard';
import LoadingState from './components/LoadingState';

// Mock response for demo / when backend is unavailable
const MOCK_RESPONSE = {
  intent: 'Emergency Tech Support',
  urgency: 'critical',
  user_message:
    "You're in a time-sensitive situation. Your laptop isn't powering on before a critical presentation. Based on your input, I've identified the most likely causes and prepared immediate action steps to help you recover quickly.",
  actions: [
    { description: 'Hard reset laptop', type: 'alert' },
    { description: 'Check charger & power', type: 'search' },
    { description: 'Find alternate device', type: 'search' },
    { description: 'Email slides to self', type: 'email' },
    { description: 'Call IT support', type: 'call' },
  ],
};

async function processInput({ text, imagePreview }) {
  // Attempt to call the real backend; fall back to mock on failure
  try {
    const body = { text };
    if (imagePreview) body.imagePreview = imagePreview;

    const API_BASE = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${API_BASE}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Simulate realistic latency for the mock
    await new Promise(r => setTimeout(r, 1400));
    return MOCK_RESPONSE;
  }
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (input) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await processInput(input);
      setResult(data);
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main
        style={{
          flex: 1,
          maxWidth: 760,
          width: '100%',
          margin: '0 auto',
          padding: '32px 20px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Hero text */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--text-primary)',
              lineHeight: 1.25,
            }}
          >
            Turn chaos into clarity
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Describe any messy real-world situation — IntentBridge AI detects your intent
            and turns it into structured, actionable steps.
          </p>
        </div>

        {/* Input */}
        <InputCard onSubmit={handleSubmit} loading={loading} />

        {/* Loading skeleton */}
        {loading && <LoadingState />}

        {/* Error state */}
        {error && !loading && (
          <div
            id="error-message"
            className="card animate-fade-in"
            style={{
              padding: 20,
              borderColor: 'rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.06)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#f87171' }}>
                Something went wrong
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && <ResultCard result={result} />}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              padding: '48px 20px',
              opacity: 0.5,
            }}
          >
            <div style={{ fontSize: 40 }}>🧠</div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              Your structured output will appear here
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
