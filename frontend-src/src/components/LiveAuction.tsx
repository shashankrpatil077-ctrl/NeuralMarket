import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface Props { messages: string[]; }

const agentColors: Record<string, string> = {
  ash: '#A78BFA', greyninja: '#6EE7B7', twinswift: '#F9A8D4',
};

function getAgentColor(msg: string): string | null {
  const lower = msg.toLowerCase();
  if (lower.includes('[ash]')) return agentColors.ash;
  if (lower.includes('[greyninja]')) return agentColors.greyninja;
  if (lower.includes('[twinswift]')) return agentColors.twinswift;
  return null;
}

export function LiveAuction({ messages }: Props) {
  const feedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }} className="px-6 md:px-[80px]">
      <p className="label" style={{ marginBottom: 24 }}>Live Auction</p>
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex items-center" style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 8 }}>
          <Terminal size={16} style={{ color: '#5A5A5A' }} />
          <span className="label" style={{ letterSpacing: '0.1em' }}>Auction Feed</span>
          {messages.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#5A5A5A', fontFamily: 'var(--font-mono)' }}>
              {messages.length} events
            </span>
          )}
        </div>
        <div ref={feedRef} style={{ maxHeight: 480, overflowY: 'auto', padding: '16px 24px', background: '#141414' }}>
          {messages.length === 0 ? (
            <p className="mono" style={{ color: '#5A5A5A', padding: '24px 0' }}>Waiting for auction events...</p>
          ) : (
            messages.map((msg, i) => {
              const accentColor = getAgentColor(msg);
              return (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < messages.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', animation: 'fade-msg 0.4s ease' }}>
                  <span className="mono" style={{ color: accentColor || '#A3A3A3', lineHeight: 1.6, display: 'block', ...(accentColor ? { borderLeft: `2px solid ${accentColor}40`, paddingLeft: 12 } : {}) }}>
                    {msg}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
      <style>{`@keyframes fade-msg { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
