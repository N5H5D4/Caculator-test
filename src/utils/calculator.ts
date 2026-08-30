import { Operation } from '../types';

export function calculate(prev: number, current: number, op: Operation): number | 'Error' {
  if (op === null) return current;

  let result = 0;
  switch (op) {
    case '+':
      result = prev + current;
      break;
    case '-':
      result = prev - current;
      break;
    case '×':
      result = prev * current;
      break;
    case '÷':
      if (current === 0) {
        return 'Error';
      }
      result = prev / current;
      break;
    default:
      return current;
  }

  // Handle precision errors (e.g. 0.1 + 0.2 = 0.30000000000000004)
  const rounded = Number(Math.round(Number(result + 'e12')) + 'e-12');
  return rounded;
}

export function formatDisplayNumber(value: string): string {
  if (value === 'Error' || value === 'Infinity' || value === '-Infinity' || value === 'NaN') {
    return value;
  }

  const parts = value.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : null;

  const isNegative = integerPart.startsWith('-');
  const rawNumber = isNegative ? integerPart.slice(1) : integerPart;

  // Add thousand separators
  const formattedInteger = rawNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = isNegative ? '-' : '';

  if (decimalPart !== null) {
    return `${sign}${formattedInteger}.${decimalPart}`;
  }
  return `${sign}${formattedInteger}`;
}
