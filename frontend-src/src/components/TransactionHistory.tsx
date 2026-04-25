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
  status?: string;
}

const TransactionHistory: React.FC<{ transactions?: Transaction[] }> = ({ transactions = [] }) => {
  if (!transactions.length) return <div className="tx-history"><p>No transactions yet.</p></div>;
  return (
    <div className="tx-history">
      <table className="tx-table">
        <thead><tr><th>Task</th><th>Winner</th><th>Amount</th><th>Tx</th><th>Time</th></tr></thead>
        <tbody>
          {transactions.map((tx, i) => {
            const task   = tx.task   ?? tx.task_description   ?? '—';
            const winner = tx.winner ?? tx.winner_agent        ?? '—';
            const amt    = tx.amount_usdc ?? tx.amount;
            const amount = amt !== undefined ? `$${parseFloat(String(amt)).toFixed(6)}` : '—';
            const txId   = tx.tx_id ?? tx.tx_hash ?? '';
            const txShort = txId ? `${txId.slice(0, 10)}...` : '—';
            const txUrl  = txId ? `https://testnet.arcscan.app/tx/${txId}` : null;
            let time = '—';
            try { if (tx.timestamp) time = new Date(tx.timestamp).toLocaleTimeString(); } catch {}
            return (
              <tr key={i}>
                <td title={task}>{task.length > 45 ? task.slice(0, 45) + '…' : task}</td>
                <td>{winner}</td>
                <td>{amount}</td>
                <td>{txUrl ? <a href={txUrl} target="_blank" rel="noreferrer">{txShort}</a> : txShort}</td>
                <td>{time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
