export type Operation = '+' | '-' | '×' | '÷' | null;

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export type Theme = 'dark' | 'light';
