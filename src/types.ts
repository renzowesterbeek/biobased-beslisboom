export type OptionCard = {
  price?: string;
  rdValue?: string;
  pros?: string[];
  cons?: string[];
  description?: string;
  biobasedAlternativeIndex?: number;
};

export type DecisionNodeOption = {
  label: string;
  nextId?: string;
  result?: string;
  card?: OptionCard;
  disabled?: boolean;
};

export type DecisionNode = {
  id: string;
  title?: string;
  question: string;
  options: DecisionNodeOption[];
  note?: string;
};

export type TooltipDefinition = {
  term: string;
  explanation: string;
};

export type DecisionFlowDefinition = {
  title?: string;
  description?: string;
  startId: string;
  nodes: DecisionNode[];
  tooltips?: TooltipDefinition[];
};
