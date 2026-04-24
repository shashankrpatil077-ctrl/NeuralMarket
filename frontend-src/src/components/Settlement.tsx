import { DollarSign, Gem, ShieldAlert, FileCheck } from 'lucide-react';
import type { PaymentInfo } from '../types';

interface Props {
  data: PaymentInfo | null;
}

interface CardConfig {
  label: string;
  key: keyof PaymentInfo;
  icon: React.ReactNode;
}

const cards: CardConfig[] = [
  { label: 'Platform Fee', key: 'platform_fee', icon: <DollarSign size={18} /> },
  { label: 'Quality Bonus', key: 'quality_bonus', icon: <Gem size={18} /> },
  { label: 'Slash Penalty', key: 'slash_penalty', icon: <ShieldAlert size={18} /> },
  { label: 'ERC-8004 Credential', key: 'erc8004_credential', icon: <FileCheck size={18} /> },
];

export function Settlement({ data }: Props) {
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }} className="px-6 md:px-[80px]">
      <p className="label" style={{ marginBottom: 32 }}>Settlement</p>

      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 24 }}>
        {cards.map(card => {
          const value = data?.[card.key];
          const isActive = value && value !== '—' && value !== 'N/A';
          return (
            <div
              key={card.key}
              className={`glass-card ${isActive ? 'accent-border-success' : 'accent-border-muted'}`}
              style={{ padding: 32 }}
            >
              <div className="flex items-center" style={{ gap: 10, marginBottom: 16 }}>
                <span style={{ color: '#5A5A5A' }}>{card.icon}</span>
                <span className="label">{card.label}</span>
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  color: isActive ? '#E8E8E8' : '#5A5A5A',
                }}
              >
                {value || '\u2014'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
