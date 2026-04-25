import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Clock, Trophy, Coins, Hash } from 'lucide-react';

interface Transaction {
  task?: string; task_description?: string;
  winner?: string; winner_agent?: string;
  amount_usdc?: string|number; amount?: string|number;
  quality_score?: number;
  tx_id?: string; tx_hash?: string;
  timestamp?: string; created_at?: string;
  on_chain_txns?: number; status?: string;
}

function formatWhen(tx: Transaction): string {
  const raw = tx.created_at ?? tx.timestamp;
  if (!raw) return '\u2014';
  const s = String(raw);
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '\u2014';
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#4ADE80';
  if (score >= 60) return '#FBBF24';
  return '#F87171';
}
function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Low';
}
const agentColors: Record<string, string> = { ash: '#A78BFA', greyninja: '#6EE7B7', twinswift: '#F9A8D4' };
function getAgentColor(name: string): string {
  const l = (name||'').toLowerCase();
  if (l.includes('ash')) return agentColors.ash;
  if (l.includes('grey')||l.includes('ninja')) return agentColors.greyninja;
  if (l.includes('twin')||l.includes('swift')) return agentColors.twinswift;
  return '#A3A3A3';
}

function TxCard({ tx, isLatest }: { tx: Transaction; isLatest?: boolean }) {
  const task   = String(tx.task ?? tx.task_description ?? '\u2014');
  const worker = String(tx.winner ?? tx.winner_agent ?? '\u2014');
  const amt    = tx.amount_usdc ?? tx.amount;
  const amount = amt != null ? parseFloat(String(amt)).toFixed(6) : null;
  const score  = tx.quality_score;
  const txId   = String(tx.tx_id ?? tx.tx_hash ?? '');
  const txShort = txId ? `${txId.slice(0,8)}\u2026${txId.slice(-4)}` : null;
  const txUrl  = txId ? `https://testnet.arcscan.app/tx/${txId}` : null;
  const time   = formatWhen(tx);

  const baseBg  = isLatest ? 'linear-gradient(135deg,rgba(167,139,250,0.08),rgba(26,26,26,0.85),rgba(110,231,183,0.06))' : 'rgba(26,26,26,0.65)';
  const hoverBg = isLatest ? 'linear-gradient(135deg,rgba(167,139,250,0.12),rgba(30,30,30,0.9),rgba(110,231,183,0.09))' : 'rgba(30,30,30,0.75)';
  const baseBd  = isLatest ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)';
  const hoverBd = isLatest ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.1)';

  return (
    <div style={{ background: baseBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${baseBd}`, borderRadius: 14, padding: '24px 28px', transition: 'all 0.3s ease' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background=hoverBg; el.style.borderColor=hoverBd; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background=baseBg; el.style.borderColor=baseBd; }}
    >
      <p style={{ fontSize:15, fontWeight:500, color:'#E8E8E8', marginBottom:16, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={task}>{task}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Trophy size={14} style={{ color:'#5A5A5A' }} />
          <span style={{ fontSize:12, color:'#5A5A5A' }}>Winner</span>
          <span style={{ marginLeft:'auto', fontSize:13, fontWeight:600, color:getAgentColor(worker) }}>{worker}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Hash size={14} style={{ color:'#5A5A5A' }} />
          <span style={{ fontSize:12, color:'#5A5A5A' }}>Score</span>
          <span style={{ marginLeft:'auto', fontSize:13, fontWeight:700, fontFamily:'var(--font-mono)', color: score!=null ? getScoreColor(score) : '#5A5A5A' }}>
            {score!=null ? `${score} · ${getScoreLabel(score)}` : '\u2014'}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Coins size={14} style={{ color:'#5A5A5A' }} />
          <span style={{ fontSize:12, color:'#5A5A5A' }}>Amount</span>
          <span style={{ marginLeft:'auto', fontSize:13, fontFamily:'var(--font-mono)', color:'#E8E8E8' }}>{amount ? `$${amount}` : '\u2014'}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Clock size={14} style={{ color:'#5A5A5A' }} />
          <span style={{ fontSize:12, color:'#5A5A5A' }}>Time</span>
          <span style={{ marginLeft:'auto', fontSize:12, color:'#8A8A8A' }}>{time}</span>
        </div>
      </div>
      {txShort && (
        <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, color:'#5A5A5A', fontFamily:'var(--font-mono)' }}>TX</span>
          {txUrl
            ? <a href={txUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'#A78BFA', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}
                onMouseEnter={e=>(e.currentTarget.style.color='#C4B5FD')} onMouseLeave={e=>(e.currentTarget.style.color='#A78BFA')}>
                {txShort} <ExternalLink size={10} />
              </a>
            : <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'#5A5A5A' }}>{txShort}</span>}
        </div>
      )}
    </div>
  );
}

const TransactionHistory: React.FC<{ transactions?: Transaction[] }> = ({ transactions = [] }) => {
  const [showAll, setShowAll] = useState(false);
  const latest = transactions[0] ?? null;
  const rest   = transactions.slice(1);
  return (
    <div style={{ maxWidth:1240, margin:'0 auto' }} className="px-6 md:px-[80px]">
      <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
        <p className="label" style={{ margin:0 }}>Transaction History</p>
        {transactions.length > 0 && (
          <span style={{ marginLeft:12, fontSize:11, fontFamily:'var(--font-mono)', color:'#5A5A5A', background:'rgba(255,255,255,0.04)', padding:'3px 10px', borderRadius:20 }}>
            {transactions.length} total
          </span>
        )}
      </div>
      {!transactions.length ? (
        <div style={{ background:'rgba(26,26,26,0.65)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'48px 32px', textAlign:'center', color:'#5A5A5A', fontSize:14 }}>
          No transactions yet. Submit a task to see results here.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {latest && (
            <div>
              <p style={{ fontSize:11, color:'#5A5A5A', marginBottom:8, letterSpacing:'0.08em', textTransform:'uppercase' }}>Latest</p>
              <TxCard tx={latest} isLatest />
            </div>
          )}
          {rest.length > 0 && (
            <button onClick={() => setShowAll(!showAll)}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'14px 24px', background:'rgba(26,26,26,0.5)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, color:'#8A8A8A', fontSize:13, cursor:'pointer', transition:'all 0.25s ease', outline:'none' }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.background='rgba(30,30,30,0.7)';el.style.borderColor='rgba(255,255,255,0.1)';el.style.color='#E8E8E8';}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.background='rgba(26,26,26,0.5)';el.style.borderColor='rgba(255,255,255,0.06)';el.style.color='#8A8A8A';}}>
              {showAll ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              {showAll ? 'Hide Previous' : `View All Previous (${rest.length})`}
            </button>
          )}
          {showAll && rest.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:11, color:'#5A5A5A', marginBottom:0, letterSpacing:'0.08em', textTransform:'uppercase' }}>Previous</p>
              {rest.map((tx,i) => <TxCard key={i} tx={tx} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default TransactionHistory;
