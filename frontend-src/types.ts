// ── API Types ──

export interface Agent {
  id: string;
  name: string;
  status: string;
  specialty: string;
  wallet_address?: string;
}

export interface Transaction {
  id: string;
  task_description: string;
  winner_agent: string;
  quality_score: number;
  quality_scores?: Record<string, number>;
  amount: number;
  tx_hash: string;
  created_at: string;
}

export interface OrchestratorAnalysis {
  primary_capability: string;
  complexity: string;
  base_price: number;
  reasoning: string;
}

export interface AgentOutput {
  agent_name: string;
  output: string;
  status: 'Complete' | 'Processing' | 'Failed';
  quality_score?: number;
}

export interface CouncilValidation {
  winner: string;
  quality_score: number;
  quality_scores?: Record<string, number>;
  explanation: string;
  tx_hash?: string;
}

export interface PaymentInfo {
  platform_fee: string;
  quality_bonus: string;
  slash_penalty: string;
  erc8004_credential: string;
}

export interface EliteLoopResponse {
  status: string;
  phase_1_analysis: OrchestratorAnalysis;
  phase_3_all_outputs: AgentOutput[];
  phase_4_council_validation: CouncilValidation;
  phase_6_payments: PaymentInfo;
}

export interface SSEMessage {
  type: 'negotiation_start' | 'agent_speak' | 'validation_complete' | 'task_complete';
  agent?: string;
  message?: string;
  bid?: number;
  winner?: string;
  data?: string;
}
