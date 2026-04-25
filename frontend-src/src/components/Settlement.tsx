import { DollarSign, Gem, ShieldAlert, FileCheck } from 'lucide-react';

interface PaymentInfo {
  platform_fee?: string;
  quality_bonus?: string;
  slash_penalty?: string;
  erc8004_credential?: string;
}

interface Props { data: PaymentInfo | null; }

const cards = [
  { label: 'Platform Fee',       key: 'platform_fee'       as const, icon: <DollarSign size={18} />, activeColor: '#4ADE80' },
  { label: 'Quality Bonus',      key: 'quality_bonus'      as const, icon: <Gem size={18} />,        activeColor: '#A78BFA' },
  { label: 'Slash Penalty',      key: 'slash_penalty'      as const, icon: <ShieldAlert size={18} />, activeColor: '#F87171' },
  { label: 'ERC-8004 Credential',key: 'erc8004_credential' as const, icon: <FileCheck size={18} />,  activeColor: '#FBBF24' },
];

export function Settlement({ data }: Props) {
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }} className="px-6 md:px-[80px]">
      <p className="label" style={{ marginBottom: 24 }}>Settlement</p>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 20 }}>
        {cards.map(card => {
          const value = data?.[card.key];
          const isActive = !!value && value !== '—' && value !== 'N/A';
          return (
            <div key={card.key} className={`glass-card ${isActive ? 'accent-border-success' : 'accent-border-muted'}`} style={{ padding: '28px 32px' }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 12 }}>
                <span style={{ color: isActive ? card.activeColor : '#5A5A5A' }}>{card.icon}</span>
                <span className="label">{card.label}</span>
              </div>
              <p className="mono" style={{ fontSize: 15, color: isActive ? '#E8E8E8' : '#5A5A5A', lineHeight: 1.5 }}>
                {value || '\u2014'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
