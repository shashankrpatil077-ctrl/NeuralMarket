import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Welcome } from './components/Welcome';
import { SubmitTask } from './components/SubmitTask';
import { LiveAuction } from './components/LiveAuction';
import { OrchestratorAnalysis } from './components/OrchestratorAnalysis';
import { AgentWorkspace } from './components/AgentWorkspace';
import { ValidationVerdict } from './components/ValidationVerdict';
import { Settlement } from './components/Settlement';
import { TransactionHistory } from './components/TransactionHistory';
import { Toast } from './components/Toast';
import { fetchTransactions, fetchAgents, submitTask, createSSEConnection } from './api';
import type { EliteLoopResponse, Transaction, Agent, PaymentInfo } from './types';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [eliteResult, setEliteResult] = useState<EliteLoopResponse | null>(null);
  const [auctionMessages, setAuctionMessages] = useState<string[]>([]);
  const [settlementLive, setSettlementLive] = useState<PaymentInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const sseRef = useRef<{ close: () => void } | null>(null);
  const [liveTask, setLiveTask] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const settlementDisplay = useMemo((): PaymentInfo | null => {
    if (settlementLive) return settlementLive;
    const p = eliteResult?.phase_6_payments as Record<string, unknown> | undefined;
    if (!p) return null;
    const fee = p.fee ?? p.winner_payment;
    return {
      platform_fee:
        typeof fee === 'string' && fee
          ? `Payment ref · ${fee.slice(0, 14)}…`
          : typeof p.fee === 'string'
            ? `Fee · ${String(p.fee).slice(0, 14)}…`
            : '\u2014',
      quality_bonus: p.bonus ? `Bonus · ${String(p.bonus).slice(0, 14)}…` : '\u2014',
      slash_penalty: p.slash ? `Slash · ${String(p.slash).slice(0, 14)}…` : '\u2014',
      erc8004_credential: p.credential ? String(p.credential) : '\u2014',
    };
  }, [settlementLive, eliteResult]);

  useEffect(() => {
    fetchTransactions().then(setTransactions).catch(() => showToast('Failed to load transactions'));
    fetchAgents().then(setAgents).catch(() => showToast('Failed to load agents'));
  }, [showToast]);

  useEffect(() => {
    const ms = liveTask || isSubmitting ? 2000 : 12000;
    const id = setInterval(() => {
      fetchTransactions().then(setTransactions).catch(() => {});
    }, ms);
    return () => clearInterval(id);
  }, [liveTask, isSubmitting]);

  useEffect(() => {
    const agentInterval = setInterval(() => {
      fetchAgents().then(setAgents).catch(() => {});
    }, 30000);
    return () => clearInterval(agentInterval);
  }, []);

  useEffect(() => {
    sseRef.current = createSSEConnection(
      (type, data) => {
        let msg = '';
        switch (type) {
          case 'task_received':
            setLiveTask(true);
            setSettlementLive(null);
            msg = `Task queued: ${String(data.task ?? '').slice(0, 72)}${String(data.task ?? '').length > 72 ? '…' : ''}`;
            break;
          case 'orchestrator_complete': {
            const a = data.analysis as Record<string, unknown> | undefined;
            const cx = a?.complexity ?? '?';
            const bp = a?.base_price;
            msg = `Orchestrator: ${cx} complexity, base price $${bp}`;
            break;
          }
          case 'negotiation_start':
            msg = 'Negotiation started — agents submitting bids.';
            break;
          case 'agent_speak': {
            const r = data.round != null && data.round !== '' ? `R${data.round}` : '';
            const agent = String(data.agent ?? 'Agent');
            const m = String(data.message ?? '');
            const bid = data.bid != null ? `$${data.bid}` : '\u2014';
            msg = `[${r} ${agent}] ${m} · bid ${bid}`;
            break;
          }
          case 'negotiation_complete':
            msg = 'Negotiation complete — executing tasks.';
            break;
          case 'agent_start':
            msg = `${data.agent}: working…`;
            break;
          case 'agent_complete':
            msg = `${data.agent}: completed (${data.status ?? 'ok'})`;
            break;
          case 'validation_complete':
            msg = `Winner: ${data.winner ?? 'TBD'} — validation complete`;
            break;
          case 'settlement_complete': {
            const feeAmt = data.fee_amount != null ? String(data.fee_amount) : '';
            const bonusAmt = data.bonus_amount != null ? String(data.bonus_amount) : '';
            const slashAmt = data.slash_amount != null ? String(data.slash_amount) : '';
            const cred = data.credential_tx != null ? String(data.credential_tx) : '';
            setSettlementLive({
              platform_fee: data.fee ? `$${feeAmt} USDC collected` : '\u2014',
              quality_bonus: data.bonus ? `$${bonusAmt} USDC paid` : 'No bonus (needs score > 90)',
              slash_penalty: data.slash ? `$${slashAmt} USDC withheld` : 'No slash (score ≥ 60)',
              erc8004_credential: data.credential && cred ? cred : 'Not issued (score > 80 required)',
            });
            msg = `Settlement complete for ${String(data.winner ?? 'winner')}`;
            fetchTransactions().then(setTransactions).catch(() => {});
            break;
          }
          case 'task_complete':
            setLiveTask(false);
            msg = `Task complete · winner ${String(data.winner ?? '')} · $${data.amount ?? ''}`;
            fetchTransactions().then(setTransactions).catch(() => {});
            break;
          default:
            msg = typeof data.raw === 'string' ? data.raw : JSON.stringify(data);
        }
        queueMicrotask(() => setAuctionMessages(prev => [...prev, msg]));
      },
      () => showToast('Live stream interrupted — reconnecting…')
    );
    return () => sseRef.current?.close();
  }, [showToast]);

  const handleSubmit = useCallback(
    async (description: string, maxBudget: number) => {
      setIsSubmitting(true);
      setAuctionMessages([]);
      try {
        const result = await submitTask(description, maxBudget);
        setEliteResult(result as EliteLoopResponse);
        fetchTransactions().then(setTransactions).catch(() => {});
      } catch {
        showToast('Task submission failed — please retry');
      } finally {
        setIsSubmitting(false);
      }
    },
    [showToast]
  );

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="grain min-h-screen" style={{ background: '#121212' }}>
      <Navbar />

      <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="welcome">
          <Welcome agentCount={agents.length} />
        </section>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
      >
        <section id="submit" style={{ paddingTop: 80 }}>
          <SubmitTask onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </section>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
      >
        <section id="auction" style={{ paddingTop: 80 }}>
          <LiveAuction messages={auctionMessages} />
        </section>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
      >
        <section id="orchestrator" style={{ paddingTop: 80 }}>
          <OrchestratorAnalysis data={eliteResult?.phase_1_analysis || null} />
        </section>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
      >
        <section id="workspace" style={{ paddingTop: 80 }}>
          <AgentWorkspace outputs={eliteResult?.phase_3_all_outputs || []} />
        </section>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
      >
        <section id="verdict" style={{ paddingTop: 80 }}>
          <ValidationVerdict data={eliteResult?.phase_4_council_validation || null} />
        </section>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
      >
        <section id="settlement" style={{ paddingTop: 80 }}>
          <Settlement data={settlementDisplay} />
        </section>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
      >
        <section id="history" style={{ paddingTop: 80, paddingBottom: 120 }}>
          <TransactionHistory transactions={transactions} />
        </section>
      </motion.div>

      {toast && <Toast message={toast} />}
    </div>
  );
}

export default App;
