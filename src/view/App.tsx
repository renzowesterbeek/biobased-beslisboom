import { useEffect, useState } from 'react';
import { DecisionFlow } from '../widgets/DecisionFlow';
import { loadYamlFlow } from '../utils/yamlLoader';
import { DecisionFlowDefinition } from '../types';
import { initAnalytics, analytics } from '../utils/analytics';

export function App(): JSX.Element {
  const [flow, setFlow] = useState<DecisionFlowDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize Google Analytics
    initAnalytics();
    
    let isMounted = true;
    loadYamlFlow('/flow.yaml')
      .then((def) => {
        if (isMounted) {
          setFlow(def);
          setLoading(false);
          // Track flow start when loaded
          analytics.trackFlowStart();
        }
      })
      .catch((e: unknown) => {
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Onbekende fout');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div style={{ color: '#04452e', padding: '40px' }}>Laden…</div>;
  if (error) return <div style={{ color: '#04452e', padding: '40px' }}>Fout: {error}</div>;
  if (!flow) return <div style={{ color: '#04452e', padding: '40px' }}>Geen flow geladen.</div>;

  return (
    <div style={{ padding: '40px' }}>
      <DecisionFlow definition={flow} />
    </div>
  );
}
