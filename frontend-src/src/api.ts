import type { Agent, Transaction } from './types';

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  'https://web-production-67884.up.railway.app';

async function fetchWithRetry<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  }
}

type RawTx = Record<string, unknown>;

function normalizeTransaction(row: RawTx): Transaction {
  const id = row.id ?? row.tx_id ?? '';
  const amount = Number(row.amount_usdc ?? row.amount ?? 0);
  const created = row.created_at;
  let created_at = '';
  if (typeof created === 'string') created_at = created;
  else if (created != null) created_at = String(created);

  return {
    id: String(id),
    task_description: String(row.task ?? row.task_description ?? ''),
    winner_agent: String(row.winner ?? row.winner_agent ?? ''),
    quality_score: Number(row.quality_score ?? 0),
    amount,
    tx_hash: String(row.tx_id ?? row.tx_hash ?? ''),
    fee_tx_id: row.fee_tx_id != null ? String(row.fee_tx_id) : undefined,
    bonus_tx_id: row.bonus_tx_id != null ? String(row.bonus_tx_id) : undefined,
    slash_tx_id: row.slash_tx_id != null ? String(row.slash_tx_id) : undefined,
    credential_tx_id: row.credential_tx_id != null ? String(row.credential_tx_id) : undefined,
    created_at,
  };
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const data = await fetchWithRetry<unknown>(`${API_BASE}/transactions`);
  const rows = Array.isArray(data)
    ? (data as RawTx[])
    : (data as { transactions?: RawTx[] })?.transactions;
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeTransaction);
}

export async function fetchAgents(): Promise<Agent[]> {
  const data = await fetchWithRetry<Record<string, { capabilities?: string[] }>>(`${API_BASE}/agents`);
  return Object.entries(data).map(([name, meta]) => ({
    id: name,
    name,
    status: 'active',
    specialty: meta.capabilities?.[0] ?? '',
  }));
}

export async function fetchHealth() {
  return fetchWithRetry<unknown>(`${API_BASE}/health`);
}

export async function submitTask(description: string, max_budget: number) {
  return fetchWithRetry<unknown>(`${API_BASE}/run_elite_loop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, max_budget }),
  });
}

const SSE_EVENTS = [
  'task_received',
  'orchestrator_complete',
  'negotiation_start',
  'agent_speak',
  'negotiation_complete',
  'agent_start',
  'agent_complete',
  'validation_complete',
  'settlement_complete',
  'task_complete',
] as const;

export function createSSEConnection(
  onMessage: (event: string, data: Record<string, unknown>) => void,
  onError: () => void
): { close: () => void } {
  let closed = false;
  let es: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const connect = () => {
    if (closed) return;
    clearTimer();
    es = new EventSource(`${API_BASE}/events`);

    SSE_EVENTS.forEach(type => {
      es!.addEventListener(type, (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data) as Record<string, unknown>;
          onMessage(type, parsed);
        } catch {
          onMessage(type, { raw: e.data });
        }
      });
    });

    es.onerror = () => {
      onError();
      if (es) {
        es.close();
        es = null;
      }
      if (!closed) reconnectTimer = setTimeout(connect, 2000);
    };
  };

  connect();

  return {
    close: () => {
      closed = true;
      clearTimer();
      es?.close();
      es = null;
    },
  };
}
