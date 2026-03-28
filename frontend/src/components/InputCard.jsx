import { useRef, useState } from 'react';

const MicIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function InputCard({ onSubmit, loading }) {
  const [text, setText] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleMicToggle = () => {
    setMicActive(prev => !prev);
    // Mock: in a real app, toggle Web Speech API here
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!text.trim() && !imagePreview) return;
    onSubmit({ text, imagePreview });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const charCount = text.length;
  const maxChars = 1000;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header strip */}
      <div
        style={{
          padding: '14px 20px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Describe your situation
        </span>
      </div>

      {/* Text area */}
      <div style={{ padding: '16px 20px 8px' }}>
        <textarea
          className="intent-input"
          id="intent-text-input"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 'My laptop won't turn on and I have a presentation in 2 hours...'"
          maxLength={maxChars}
          disabled={loading}
        />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div className="image-preview">
            <img src={imagePreview} alt="Uploaded preview" />
            <button
              className="image-preview-remove"
              onClick={() => setImagePreview(null)}
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Image attached
          </span>
        </div>
      )}

      {/* Footer bar: tools + submit */}
      <div
        style={{
          padding: '10px 16px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Mic button */}
          <button
            id="mic-button"
            className={`btn-icon${micActive ? ' active' : ''}`}
            onClick={handleMicToggle}
            title={micActive ? 'Stop recording' : 'Start voice input'}
            aria-label="Voice input"
            disabled={loading}
          >
            <MicIcon active={micActive} />
          </button>

          {/* Image upload button */}
          <button
            id="image-upload-button"
            className="btn-icon"
            onClick={() => fileInputRef.current?.click()}
            title="Upload an image"
            aria-label="Upload image"
            disabled={loading}
          >
            <ImageIcon />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
            id="hidden-file-input"
          />

          {/* Char count */}
          <span style={{ fontSize: 12, color: charCount > maxChars * 0.9 ? '#f87171' : 'var(--text-muted)' }}>
            {charCount}/{maxChars}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            ⌘ + Enter
          </span>
          <button
            id="submit-button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading || (!text.trim() && !imagePreview)}
          >
            {loading ? (
              <>
                <span className="animate-spin-custom" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                Processing…
              </>
            ) : (
              <>
                <SendIcon />
                Process Input
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
