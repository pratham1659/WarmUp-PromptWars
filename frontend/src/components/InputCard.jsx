import { useRef, useState, useEffect, useCallback } from 'react';

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

const LocationIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ── Web Speech API Hook ─────────────────────────────────────────────────
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, transcript, isSupported, startListening, stopListening };
}

// ── InputCard Component ─────────────────────────────────────────────────
export default function InputCard({ onSubmit, loading, models = [], selectedModel = '', onModelChange }) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);        // { lat, lng }
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const fileInputRef = useRef(null);

  const { isListening, transcript, isSupported, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setText(prev => {
        const base = prev.endsWith(' ') || prev === '' ? prev : prev + ' ';
        return base + transcript;
      });
    }
  }, [transcript]);

  const handleMicToggle = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // ── Location handling ───────────────────────────────────────────────
  const handleLocationToggle = () => {
    if (location) {
      // Remove location
      setLocation(null);
      setLocationError(null);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Location access denied. Please enable it in your browser settings.'
            : 'Could not get your location. Please try again.'
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRemoveLocation = () => {
    setLocation(null);
    setLocationError(null);
  };

  const handleSubmit = () => {
    if (!text.trim() && !imageFile && !location) return;
    if (isListening) stopListening();
    onSubmit({ text, imageFile, location });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const charCount = text.length;
  const maxChars = 2000;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header strip */}
      <div
        style={{
          padding: '12px 20px 10px',
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
            background: isListening ? '#dc2626' : '#16a34a',
            transition: 'all 0.3s ease',
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {isListening ? '🎙️ Listening…' : 'Describe your situation'}
        </span>
        {isListening && (
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <div className="recording-pulse" />
            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>REC</span>
          </div>
        )}
      </div>

      {/* Text area */}
      <div style={{ padding: '16px 20px 8px' }}>
        <textarea
          className="intent-input"
          id="intent-text-input"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 'My car broke down on the highway and I have a job interview in 1 hour…'"
          aria-label="Describe your situation or problem"
          maxLength={maxChars}
          disabled={loading}
        />
      </div>

      {/* Attachments area — image + location side by side */}
      {(imagePreview || location) && (
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Image preview */}
          {imagePreview && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div className="image-preview">
                <img src={imagePreview} alt="Uploaded preview" />
                <button
                  className="image-preview-remove"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  📎 {imageFile?.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : ''}
                </span>
              </div>
            </div>
          )}

          {/* Location preview */}
          {location && (
            <div className="location-preview animate-fade-in">
              <div className="location-map-container">
                <iframe
                  title="Your location"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: 8 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${location.lat},${location.lng}&zoom=15`}
                />
                <button
                  className="image-preview-remove"
                  onClick={handleRemoveLocation}
                  aria-label="Remove location"
                  style={{ top: 6, right: 6 }}
                >
                  ×
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <LocationIcon active={false} />
                  Current Location
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, marginTop: 2 }}
                >
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Location error */}
      {locationError && (
        <div style={{ padding: '0 20px 10px' }}>
          <div style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            fontSize: 12,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ flexShrink: 0 }}>⚠</span>
            {locationError}
            <button
              onClick={() => setLocationError(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14, padding: 0 }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Footer bar */}
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
          <button
            id="mic-button"
            className={`btn-icon${isListening ? ' active' : ''}`}
            onClick={handleMicToggle}
            title={isListening ? 'Stop recording' : 'Start voice input'}
            aria-label="Voice input"
            disabled={loading}
          >
            <MicIcon active={isListening} />
          </button>

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

          <button
            id="location-button"
            className={`btn-icon${location ? ' location-active' : ''}`}
            onClick={handleLocationToggle}
            title={location ? 'Remove location' : 'Share current location'}
            aria-label="Share location"
            disabled={loading || locationLoading}
          >
            {locationLoading ? (
              <div
                className="animate-spin-custom"
                style={{
                  width: 14,
                  height: 14,
                  border: '2px solid var(--border-subtle)',
                  borderTopColor: 'var(--accent)',
                  borderRadius: '50%',
                }}
              />
            ) : (
              <LocationIcon active={!!location} />
            )}
          </button>

          {/* Model Selector */}
          {models.length > 0 && (
            <select
              id="model-selector"
              className="model-select"
              value={selectedModel}
              onChange={e => onModelChange?.(e.target.value)}
              disabled={loading}
              title="Select AI model"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.tier === 'paid' ? ' 💎' : ''}
                </option>
              ))}
            </select>
          )}

          <span style={{ fontSize: 12, color: charCount > maxChars * 0.9 ? '#dc2626' : 'var(--text-muted)' }}>
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
            disabled={loading || (!text.trim() && !imageFile && !location)}
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
