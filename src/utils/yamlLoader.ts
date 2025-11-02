import yaml from 'js-yaml';
import { DecisionFlowDefinition } from '../types';

export async function loadYamlFlow(url: string): Promise<DecisionFlowDefinition> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Kon YAML niet laden (${res.status})`);
  }
  const text = await res.text();
  const data = yaml.load(text);
  if (!data || typeof data !== 'object') {
    throw new Error('Ongeldig YAML formaat');
  }
  return data as DecisionFlowDefinition;
}
