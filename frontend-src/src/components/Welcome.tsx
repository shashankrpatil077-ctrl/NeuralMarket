import { ArrowRight, Radio, Users, CircleDot } from 'lucide-react';

interface Props {
  agentCount: number;
}

export function Welcome({ agentCount }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ minHeight: '100vh', padding: '0 80px' }}
    >
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 64,
          fontWeight: 700,
          color: '#E8E8E8',
          letterSpacing: '-0.02em',
          marginBottom: 24,
        }}
      >
        NeuralMarket
      </h1>

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 18,
          fontWeight: 400,
          color: '#8A8A8A',
          marginBottom: 48,
        }}
      >
        Autonomous AI Economy &middot; Live on Arc
      </p>

      <div className="flex items-center" style={{ gap: 40, marginBottom: 56 }}>
        <StatusIndicator icon={<Radio size={18} />} text="Arc Testnet · Online" />
        <StatusIndicator icon={<Users size={18} />} text={`${agentCount || 3} Agents Active`} />
        <StatusIndicator icon={<CircleDot size={18} />} text="Economy Live" />
      </div>

      <a
        href="#submit"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 36px',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14,
          color: '#E8E8E8',
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          textDecoration: 'none',
          transition: 'all 0.3s',
          background: 'transparent',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        ENTER <ArrowRight size={18} style={{ color: '#8A8A8A' }} />
      </a>
    </div>
  );
}

function StatusIndicator({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <span style={{ color: '#5A5A5A' }}>{icon}</span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#5A5A5A' }}>
        {text}
      </span>
    </div>
  );
}
