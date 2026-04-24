import React from 'react';

interface Transaction {
  task?: string;
  task_description?: string;
  winner?: string;
  winner_agent?: string;
  amount_usdc?: string | number;
  amount?: string | number;
  tx_id?: string;
  tx_hash?: string;
  timestamp?: string;
  created_at?: string;
  status?: string;
}

function formatWhen(tx: Transaction): string {
  const raw = tx.created_at ?? tx.timestamp;
  if (!raw) return '\u2014';
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return '\u2014';
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

const TransactionHistory: React.FC<{ transactions?: Transaction[] }> = ({ transactions = [] }) => {
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }} className="px-6 md:px-[80px]">
      <p className="label" style={{ marginBottom: 24 }}>Transaction History</p>

      {!transactions.length ? (
        <div
          className="glass-card"
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 14,
          }}
        >
          No transactions yet.
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            background: 'rgba(26, 26, 26, 0.8)',
          }}
        >
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table
              style={{
                width: '100%',
                minWidth: 680,
                borderCollapse: 'separate',
                borderSpacing: 0,
                tableLayout: 'fixed',
              }}
            >
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '26%' }} />
                <col style={{ width: '18%' }} />
              </colgroup>
              <thead>
                <tr>
                  {(['Task', 'Worker', 'Amount', 'TX', 'Time'] as const).map(h => (
                    <th
                      key={h}
                      className="label"
                      style={{
                        textAlign: 'left',
                        padding: '14px 16px 14px 20px',
                        margin: 0,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        verticalAlign: 'bottom',
                        background: 'rgba(18, 18, 18, 0.6)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const task = String(tx.task ?? tx.task_description ?? '\u2014');
                  const worker = String(tx.winner ?? tx.winner_agent ?? '\u2014');
                  const amt = tx.amount_usdc ?? tx.amount;
                  const amount =
                    amt !== undefined && amt !== ''
                      ? `$${parseFloat(String(amt)).toFixed(6)}`
                      : '\u2014';
                  const txId = String(tx.tx_id ?? tx.tx_hash ?? '');
                  const txShort = txId ? `${txId.slice(0, 12)}\u2026` : '\u2014';
                  const isHex = /^0x[a-fA-F0-9]{16,}$/.test(txId);
                  const txUrl = isHex ? `https://testnet.arcscan.app/tx/${txId}` : null;
                  const rowBg = i % 2 === 0 ? 'rgba(18,18,18,0.55)' : 'rgba(26,26,26,0.5)';

                  return (
                    <tr key={`${txId}-${i}`} style={{ background: rowBg }}>
                      <td
                        style={{
                          padding: '14px 16px 14px 20px',
                          margin: 0,
                          color: 'var(--color-text-primary)',
                          fontSize: 14,
                          lineHeight: 1.45,
                          verticalAlign: 'middle',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={task}
                      >
                        {task.length > 48 ? `${task.slice(0, 48)}\u2026` : task}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          margin: 0,
                          color: 'var(--color-text-secondary)',
                          fontSize: 14,
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {worker}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          margin: 0,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          color: 'var(--color-text-primary)',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {amount}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          margin: 0,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          color: 'var(--color-text-secondary)',
                          wordBreak: 'break-all',
                          verticalAlign: 'middle',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {txUrl ? (
                          <a
                            href={txUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#A78BFA', textDecoration: 'none' }}
                          >
                            {txShort}
                          </a>
                        ) : (
                          <span title={txId || undefined}>{txShort}</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px 14px 12px',
                          margin: 0,
                          fontSize: 12,
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {formatWhen(tx)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
