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

  const msgQueue = React.useRef<string[]>([]);
  const isDraining = React.useRef(false);
  const queueMessage = React.useCallback((msg: string) => {
    if (!msg || msg.trim().startsWith('{') || msg.trim().startsWith('[')) return;
    msgQueue.current.push(msg);
    if (!isDraining.current) {
      isDraining.current = true;
      const drain = () => {
        if (msgQueue.current.length === 0) { isDraining.current = false; return; }
        const next = msgQueue.current.shift()!;
        setAuctionMessages((prev: string[]) => [...prev, next]);
        setTimeout(drain, 400);
      };
      drain();
    }
  }, []);


  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchTransactions().then(setTransactions).catch(() => showToast('Failed to load transactions'));
    fetchAgents().then(setAgents).catch(() => showToast('Failed to load agents'));
  }, [showToast]);

  // Polling
  useEffect(() => {
    const txInterval = setInterval(() => {
      fetchTransactions().then(setTransactions).catch(() => {});
    }, 15000);
    const agentInterval = setInterval(() => {
      fetchAgents().then(setAgents).catch(() => {});
    }, 30000);
    return () => { clearInterval(txInterval); clearInterval(agentInterval); };
  }, []);

  // SSE
  useEffect(() => {
    sseRef.current = createSSEConnection(
      (type, data) => {
        let msg = '';
        switch (type) {
          case 'negotiation_start':
            msg = 'Negotiation started...';
            break;
          case 'agent_speak':
            msg = `[${data.agent || 'Agent'}]: ${data.message || ''} ($${data.bid || '—'})`;
            break;
          case 'validation_complete':
            msg = `Winner: ${data.winner || 'TBD'} — Validation complete`;
            break;
          case 'orchestrator_complete':
            setOrchestratorData(data.analysis || null);
            msg = `Orchestrator: ${data.analysis?.complexity || ''} complexity, base price $${data.analysis?.base_price || ''}`;
            break;
          case 'agent_complete':
            setAgentOutputs(prev => {
              const filtered = prev.filter((o: any) => o.agent_name !== data.agent);
              return [...filtered, { agent_name: data.agent, output: data.output, status: data.status === 'success' ? 'Complete' : 'Failed' }];
            });
            msg = `${data.agent || 'Agent'} completed`;
            break;
          case 'settlement_complete':
            setSettlementData({
              platform_fee: data.fee_amount ? `$${parseFloat(data.fee_amount).toFixed(6)} USDC collected` : (data.fee ? 'Collected' : '—'),
              quality_bonus: data.bonus_amount ? `$${parseFloat(data.bonus_amount).toFixed(6)} USDC awarded` : (data.bonus ? 'Awarded' : '—'),
              slash_penalty: data.slash_amount ? `$${parseFloat(data.slash_amount).toFixed(6)} USDC deducted` : (data.slash ? 'Applied' : '—'),
              erc8004_credential: data.credential ? `Issued — tx: ${(data.credential_tx || '').slice(0, 10)}` : '—',
            });
            setVerdictData((prev: any) => prev ? { ...prev, winner: data.winner, quality_score: data.score } : { winner: data.winner, quality_score: data.score, explanation: '' });
            msg = `Settlement complete for ${data.winner || 'winner'}`;
            break;
          case 'validation_complete':
            setVerdictData({ winner: data.winner, quality_score: data.scores?.[data.winner] ?? 0, explanation: data.explanation || '', quality_scores: data.scores });
            msg = `Winner: ${data.winner || 'TBD'} — Validation complete`;
            break;
          case 'task_complete':
            fetchTransactions().then(setTransactions).catch(() => {});
            msg = 'Task complete.';
            break;
          default:
            msg = data.data || JSON.stringify(data);
        }
        setTimeout(() => queueMessage(msg), 0);
      },
      () => showToast('Connection interrupted — retrying...')
    );
    return () => sseRef.current?.close();
  }, [showToast]);

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
      showToast('✅ Task queued — watch live auction stream!');
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
        <section id="submit" style={{ paddingTop: 80 }}><SubmitTask onSubmit={handleSubmit} isSubmitting={isSubmitting} /></section>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="auction" style={{ paddingTop: 80 }}><LiveAuction messages={auctionMessages} /></section>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="orchestrator" style={{ paddingTop: 80 }}>
          <OrchestratorAnalysis data={orchestratorData || eliteResult?.phase_1_analysis || null} />
        </section>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="workspace" style={{ paddingTop: 80 }}>
          <AgentWorkspace outputs={agentOutputs.length > 0 ? agentOutputs : (eliteResult?.phase_3_all_outputs || [])} />
        </section>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="verdict" style={{ paddingTop: 80 }}>
          <ValidationVerdict data={verdictData || eliteResult?.phase_4_council_validation || null} />
        </section>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="settlement" style={{ paddingTop: 80 }}>
          <Settlement data={settlementData || eliteResult?.phase_6_payments || null} />
        </section>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.6 }}>
        <section id="history" style={{ paddingTop: 80, paddingBottom: 120, width: '100%' }}>
          <TransactionHistory transactions={transactions} />
        </section>
      </motion.div>

      {toast && <Toast message={toast} />}
    </div>
  );
}

export default App;
