import type { AgentOutput } from '../types';

interface Props {
  outputs: AgentOutput[];
}

const agentAccents: Record<string, { border: string; color: string }> = {
  ash: { border: 'accent-border-ash', color: '#A78BFA' },
  greyninja: { border: 'accent-border-greyninja', color: '#6EE7B7' },
  twinswift: { border: 'accent-border-twinswift', color: '#F9A8D4' },
};

function getAccent(name: string) {
  const lower = (name || "").toLowerCase();
  if (lower.includes('ash')) return agentAccents.ash;
  if (lower.includes('grey') || lower.includes('ninja') || lower.includes('data')) return agentAccents.greyninja;
  if (lower.includes('twin') || lower.includes('swift') || lower.includes('writ')) return agentAccents.twinswift;
  // Default rotation
  const keys = Object.keys(agentAccents);
  return agentAccents[keys[name.length % keys.length]];
}

const statusColors: Record<string, string> = {
  Complete: '#4ADE80',
  Processing: '#FBBF24',
  Failed: '#F87171',
};

export function AgentWorkspace({ outputs }: Props) {
  const placeholders = (outputs && outputs.length ? outputs.length : 0) > 0 ? outputs : [
    { agent_name: 'Ash', output: '', status: 'Processing' as const },
    { agent_name: 'GreyNinja', output: '', status: 'Processing' as const },
    { agent_name: 'TwinSwift', output: '', status: 'Processing' as const },
  ];

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }} className="px-6 md:px-[80px]">
      <p className="label" style={{ marginBottom: 32 }}>Agent Workspace</p>

      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
        {placeholders.map((agent, i) => {
          const accent = getAccent(agent.agent_name);
          return (
            <div
              key={i}
              className={`glass-card ${accent.border}`}
              style={{ padding: 32 }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 500, color: '#E8E8E8' }}>
                  {agent.agent_name}
                </span>
                <span
                  className="label"
                  style={{
                    fontSize: 11,
                    color: statusColors[agent.status] || '#5A5A5A',
                  }}
                >
                  {agent.status}
                </span>
              </div>

              <div
                className="mono"
                style={{
                  color: '#A3A3A3',
                  minHeight: 80,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {agent.output || 'Awaiting task submission...'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
