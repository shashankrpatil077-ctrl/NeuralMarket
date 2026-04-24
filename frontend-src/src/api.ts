const API_BASE = 'https://web-production-67884.up.railway.app';

async function fetchWithRetry<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Retry once after 2 seconds
    await new Promise(r => setTimeout(r, 2000));
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (retryErr) {
      throw retryErr;
    }
  }
}

export async function fetchTransactions() {
  return fetchWithRetry<any[]>(`${API_BASE}/transactions`);
}

export async function fetchAgents() {
  return fetchWithRetry<any[]>(`${API_BASE}/agents`);
}

export async function fetchHealth() {
  return fetchWithRetry<any>(`${API_BASE}/health`);
}

export async function submitTask(description: string, max_budget: number) {
  return fetchWithRetry<any>(`${API_BASE}/run_elite_loop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, max_budget }),
  });
}

export function createSSEConnection(
  onMessage: (event: string, data: any) => void,
  onError: () => void
): EventSource {
  const es = new EventSource(`${API_BASE}/events`);

  const eventTypes = ['negotiation_start', 'agent_speak', 'validation_complete', 'task_complete'];

  eventTypes.forEach(type => {
    es.addEventListener(type, (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onMessage(type, parsed);
      } catch {
        onMessage(type, { data: e.data });
      }
    });
  });

  es.addEventListener('message', (e: MessageEvent) => {
    try {
      const parsed = JSON.parse(e.data);
      onMessage(parsed.type || 'message', parsed);
    } catch {
      onMessage('message', { data: e.data });
    }
  });

  es.onerror = () => {
    onError();
    es.close();
    // Reconnect after 3 seconds
    setTimeout(() => {
      createSSEConnection(onMessage, onError);
    }, 3000);
  };

  return es;
}
