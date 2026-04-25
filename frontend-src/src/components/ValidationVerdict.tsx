import { Award, ExternalLink } from 'lucide-react';
import type { CouncilValidation } from '../types';

interface Props {
  data: CouncilValidation | null;
}

const winnerColors: Record<string, string> = {
  ash: '#A78BFA',
  greyninja: '#6EE7B7',
  twinswift: '#F9A8D4',
};

function getWinnerColor(name: string): string {
  const lower = (name || "").toLowerCase();
  if (lower.includes('ash')) return winnerColors.ash;
  if (lower.includes('grey') || lower.includes('ninja')) return winnerColors.greyninja;
  if (lower.includes('twin') || lower.includes('swift')) return winnerColors.twinswift;
  return '#A78BFA';
}

export function ValidationVerdict({ data }: Props) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 80px' }}>
      <p className="label" style={{ marginBottom: 32, textAlign: 'center' }}>Validation Verdict</p>

      <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
        {!data ? (
          <p style={{ color: '#5A5A5A', fontSize: 14 }}>
            Verdict will appear after task validation
          </p>
        ) : (
          <>
            <Award size={18} style={{ color: '#5A5A5A', margin: '0 auto 16px' }} />
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 32,
                fontWeight: 700,
                color: '#E8E8E8',
                marginBottom: 16,
              }}
            >
              {data.winner}
            </p>

            <p
              className="mono"
              style={{
                fontSize: 48,
                color: getWinnerColor(data.winner),
                marginBottom: 24,
              }}
            >
              {data.quality_score}
            </p>

            <p style={{ color: '#8A8A8A', fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
              {data.explanation}
            </p>

            {data.tx_hash && (
              <a
                href={`https://arcscan.io/tx/${data.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
                style={{
                  gap: 6,
                  color: '#5A5A5A',
                  fontSize: 13,
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#8A8A8A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#5A5A5A')}
              >
                View on ArcScan <ExternalLink size={14} />
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
