import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface Props {
  messages: string[];
}

export function LiveAuction({ messages }: Props) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 80px' }}>
      <p className="label" style={{ marginBottom: 32 }}>Live Auction</p>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          className="flex items-center"
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            gap: 8,
          }}
        >
          <Terminal size={18} style={{ color: '#5A5A5A' }} />
          <span className="label" style={{ letterSpacing: '0.1em' }}>Auction Feed</span>
        </div>

        <div
          ref={feedRef}
          style={{
            maxHeight: 400,
            overflowY: 'auto',
            padding: 24,
            background: '#1A1A1A',
          }}
        >
          {messages.length === 0 ? (
            <p className="mono" style={{ color: '#5A5A5A' }}>
              Waiting for auction events...
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 0',
                  borderBottom: i < messages.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  animation: 'fade-msg 0.3s ease',
                }}
              >
                <span className="mono" style={{ color: '#A3A3A3' }}>{msg}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`@keyframes fade-msg { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
