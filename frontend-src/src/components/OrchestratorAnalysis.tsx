import type { OrchestratorAnalysis as OAType } from '../types';

interface Props {
  data: OAType | null;
}

export function OrchestratorAnalysis({ data }: Props) {
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 80px' }}>
      <p className="label" style={{ marginBottom: 32 }}>Orchestrator Analysis</p>

      <div className="glass-card" style={{ padding: 32 }}>
        {!data ? (
          <p style={{ color: '#5A5A5A', fontSize: 14 }}>
            Submit a task to see orchestrator analysis
          </p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            <InfoBlock label="Primary Capability" value={data.primary_capability} />
            <InfoBlock label="Complexity" value={data.complexity} />
            <InfoBlock label="Base Price" value={`$${data.base_price}`} />
            <InfoBlock label="Reasoning" value={data.reasoning} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label" style={{ marginBottom: 8 }}>{label}</p>
      <p style={{ color: '#E8E8E8', fontSize: 14, lineHeight: 1.6 }}>{value}</p>
    </div>
  );
}
