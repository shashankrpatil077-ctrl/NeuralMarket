import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Props {
  onSubmit: (description: string, maxBudget: number) => void;
  isSubmitting: boolean;
}

export function SubmitTask({ onSubmit, isSubmitting }: Props) {
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(0.005);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isSubmitting) return;
    onSubmit(description.trim(), budget);
    setDescription('');
    setBudget(0.005);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }} className="sm:!px-[80px]">
      <p className="label" style={{ marginBottom: 32, textAlign: 'center' }}>Submit Task</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your task..."
          style={{
            width: '100%',
            height: 56,
            padding: '0 24px',
            borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(26,26,26,0.80)',
            color: '#E8E8E8',
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            outline: 'none',
            transition: 'border-color 0.3s',
            marginBottom: 24,
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.3)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />

        <div style={{ marginBottom: 32 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span className="label">Max Budget</span>
            <span className="mono" style={{ color: '#E8E8E8' }}>{budget.toFixed(3)} USDC</span>
          </div>
          <input
            type="range"
            min={0.001}
            max={0.01}
            step={0.001}
            value={budget}
            onChange={e => setBudget(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#A78BFA',
              height: 2,
              cursor: 'pointer',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          className="flex items-center justify-center"
          style={{
            width: '100%',
            height: 48,
            borderRadius: 14,
            border: 'none',
            background: isSubmitting ? '#1E1E1E' : '#1A1A1A',
            color: '#E8E8E8',
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.04em',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s',
            gap: 8,
            opacity: !description.trim() ? 0.4 : 1,
          }}
          onMouseEnter={e => {
            if (!isSubmitting) e.currentTarget.style.background = '#252525';
          }}
          onMouseLeave={e => {
            if (!isSubmitting) e.currentTarget.style.background = '#1A1A1A';
          }}
        >
          {isSubmitting ? (
            <Loader2 size={18} style={{ color: '#8A8A8A', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Send size={18} style={{ color: '#8A8A8A' }} />
          )}
          {isSubmitting ? 'Processing...' : 'Submit Task'}
        </button>
      </form>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
