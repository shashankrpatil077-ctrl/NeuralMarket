import { ExternalLink } from 'lucide-react';
import type { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

const scoreColors = ['#A78BFA', '#6EE7B7', '#F9A8D4', '#FBBF24', '#4ADE80'];

function formatTime(iso: string): string {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '\u2014';
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' });
}

function isChainHash(h: string): boolean {
  return /^0x[a-fA-F0-9]{16,}$/.test(h);
}

export function TransactionHistory({ transactions }: Props) {
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }} className="px-6 md:px-[80px]">
      <p className="label" style={{ marginBottom: 32 }}>Transaction History</p>

      <div
        className="overflow-x-auto"
        style={{
          borderRadius: 14,
          background: '#1A1A1A',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: 720,
            borderCollapse: 'separate',
            borderSpacing: 0,
            tableLayout: 'fixed',
          }}
        >
          <colgroup>
            <col style={{ width: '26%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr>
              {['Task', 'Winner', 'Quality', 'Amount', 'TX ID', 'Time', ''].map((h, i) => (
                <th
                  key={i}
                  className="label"
                  style={{
                    textAlign: 'left',
                    padding: '16px 16px 16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontWeight: 500,
                    verticalAlign: 'bottom',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#5A5A5A', fontSize: 14 }}>
                  No transactions recorded yet
                </td>
              </tr>
            ) : (
              transactions.map((tx, i) => (
                <tr
                  key={tx.id || i}
                  style={{
                    background: i % 2 === 0 ? '#121212' : '#1A1A1A',
                    transition: 'background 0.2s',
                  }}
                >
                  <td
                    style={{
                      padding: '14px 16px 14px 20px',
                      color: '#E8E8E8',
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={tx.task_description}
                  >
                    {tx.task_description}
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      color: '#A3A3A3',
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tx.winner_agent}
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span className="mono" style={{ color: scoreColors[i % scoreColors.length] }}>
                      {tx.quality_score}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span className="mono" style={{ color: '#E8E8E8' }}>
                      ${typeof tx.amount === 'number' ? tx.amount.toFixed(6) : tx.amount}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      wordBreak: 'break-all',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    <span className="mono" style={{ color: '#8A8A8A', fontSize: 12 }}>
                      {tx.tx_hash || '\u2014'}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      color: '#8A8A8A',
                      fontSize: 12,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatTime(tx.created_at)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {tx.tx_hash && isChainHash(tx.tx_hash) && (
                      <a
                        href={`https://testnet.arcscan.app/tx/${tx.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#5A5A5A', transition: 'color 0.3s', display: 'inline-flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#8A8A8A')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#5A5A5A')}
                        title="View on explorer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
