import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Welcome } from './components/Welcome';
import { SubmitTask } from './components/SubmitTask';
import { LiveAuction } from './components/LiveAuction';
import { OrchestratorAnalysis } from './components/OrchestratorAnalysis';
import { AgentWorkspace } from './components/AgentWorkspace';
import { ValidationVerdict } from './components/ValidationVerdict';
import { Settlement } from './components/Settlement';
import TransactionHistory from './components/TransactionHistory';
import { Toast } from './components/Toast';
import { fetchTransactions, fetchAgents, submitTask, createSSEConnection } from './api';
import type { EliteLoopResponse, Transaction, Agent } from './types';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [eliteResult, setEliteResult] = useState<EliteLoopResponse | null>(null);
  const [auctionMessages, setAuctionMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const [agentOutputs, setAgentOutputs] = useState<any[]>([]);
  const [verdictData, setVerdictData] = useState<any>(null);
  const [settlementData, setSettlementData] = useState<any>(null);
  const [orchestratorData, setOrchestratorData] = useState<any>(null);

  const pushMessage = useCallback((msg: string) => {
    if (!msg) return;
    setAuctionMessages(prev => [...prev, msg]);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    fetchTransactions().then(setTransactions).catch(() => showToast('Failed to load transactions'));
    fetchAgents().then(setAgents).catch(() => showToast('Failed to load agents'));
  }, [showToast]);

  useEffect(() => {
    const txInterval = setInterval(() => {
      fetchTransactions().then(setTransactions).catch(() => {});
    }, 8000);
    const agentInterval = setInterval(() => {
      fetchAgents().then(setAgents).catch(() => {});
    }, 15000);
    return () => { clearInterval(txInterval); clearInterval(agentInterval); };
  }, []);

  useEffect(() => {
    sseRef.current = createSSEConnection(
      (type, data) => {
        let msg = '';
        switch (type) {
          case 'task_received':
            msg = `New task received: "${(data.task || '').slice(0, 60)}" (budget: $${data.max_budget || '—'})`;
            break;
          case 'negotiation_start':
            msg = `Negotiation started — base price $${data.base_price || '—'} USDC`;
            break;
          case 'agent_speak': {
            const agent = data.agent || 'Agent';
            const bid = data.bid !== undefined ? `$${parseFloat(String(data.bid)).toFixed(6)}` : '—';
            const round = data.round !== undefined ? `R${data.round}` : '';
            const finalTag = data.final ? ' FINAL' : '';
            msg = `[${agent}] ${round}: ${data.message || 'Bid placed'} (${bid})${finalTag}`;
            break;
          }
          case 'negotiation_complete':
            msg = `Negotiation complete — ${(data.final_bids || []).length} agents finalized bids`;
            break;
          case 'orchestrator_complete':
            setOrchestratorData(data.analysis || null);
            msg = `Orchestrator: ${data.analysis?.complexity || ''} complexity, base price $${data.analysis?.base_price || ''}`;
            break;
          case 'agent_start':
            msg = `${data.agent || 'Agent'} processing task...`;
            break;
          case 'agent_complete':
            setAgentOutputs(prev => {
              const filtered = prev.filter((o: any) => o.agent_name !== data.agent);
              return [...filtered, {
                agent_name: data.agent,
                output: data.output || `${data.agent} completed task.`,
                status: data.status === 'success' ? 'Complete' : 'Failed'
              }];
            });
            msg = `${data.agent || 'Agent'} — ${data.status === 'success' ? 'completed' : 'failed'}`;
            break;
          case 'validation_complete':
            setVerdictData({
              winner: data.winner,
              quality_score: data.scores?.[data.winner] ?? 0,
              explanation: data.explanation || '',
              quality_scores: data.scores
            });
            msg = `Winner: ${data.winner || 'TBD'} — Validation complete`;
            break;
          case 'settlement_complete':
            setSettlementData({
              platform_fee: data.fee_amount
                ? `$${parseFloat(data.fee_amount).toFixed(6)} USDC collected`
                : (data.fee ? 'Collected' : '—'),
              quality_bonus: data.bonus_amount
                ? `$${parseFloat(data.bonus_amount).toFixed(6)} USDC awarded`
                : (data.bonus ? 'Awarded' : '—'),
              slash_penalty: data.slash_amount
                ? `$${parseFloat(data.slash_amount).toFixed(6)} USDC deducted`
                : (data.slash ? 'Applied' : '—'),
              erc8004_credential: data.credential
                ? `Issued — tx: ${(data.credential_tx || '').slice(0, 16)}`
                : '—',
            });
            setVerdictData((prev: any) => prev
              ? { ...prev, winner: data.winner, quality_score: data.score }
              : { winner: data.winner, quality_score: data.score, explanation: '' }
            );
            fetchTransactions().then(setTransactions).catch(() => {});
            msg = `Settlement complete for ${data.winner || 'winner'} — $${data.amount ? parseFloat(String(data.amount)).toFixed(6) : '—'} USDC`;
            break;
          case 'task_complete':
            fetchTransactions().then(setTransactions).catch(() => {});
            msg = 'Task complete — all phases finished.';
            break;
          default:
            msg = data.data || '';
        }
        if (msg) pushMessage(msg);
      },
      () => showToast('Connection interrupted — retrying...')
    );
    return () => sseRef.current?.close();
  }, [showToast, pushMessage]);

  const handleSubmit = useCallback(async (description: string, maxBudget: number) => {
    setIsSubmitting(true);
    setAgentOutputs([]);
    setVerdictData(null);
    setSettlementData(null);
    setOrchestratorData(null);
    setEliteResult(null);
    setAuctionMessages([]);
    try {
      await submitTask(description, maxBudget);
      showToast('Task queued — watch live auction stream!');
    } catch {
      showToast('Task submission failed — please retry');
    } finally {
      setIsSubmitting(false);
    }
  }, [showToast]);

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="grain min-h-screen" style={{ background: '#121212' }}>
      <Navbar />
      <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="welcome"><Welcome agentCount={agents.length} /></section>
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="submit" style={{ paddingTop: 48 }}><SubmitTask onSubmit={handleSubmit} isSubmitting={isSubmitting} /></section>
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="auction" style={{ paddingTop: 48 }}><LiveAuction messages={auctionMessages} /></section>
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="orchestrator" style={{ paddingTop: 48 }}>
          <OrchestratorAnalysis data={orchestratorData || eliteResult?.phase_1_analysis || null} />
        </section>
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="workspace" style={{ paddingTop: 48 }}>
          <AgentWorkspace outputs={agentOutputs.length > 0 ? agentOutputs : (eliteResult?.phase_3_all_outputs || [])} />
        </section>
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="verdict" style={{ paddingTop: 48 }}>
          <ValidationVerdict data={verdictData || eliteResult?.phase_4_council_validation || null} />
        </section>
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="settlement" style={{ paddingTop: 48 }}>
          <Settlement data={settlementData || eliteResult?.phase_6_payments || null} />
        </section>
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="history" style={{ paddingTop: 48, paddingBottom: 120, width: '100%' }}>
          <TransactionHistory transactions={transactions} />
        </section>
      </motion.div>
      {toast && <Toast message={toast} />}
    </div>
  );
}

export default App;
