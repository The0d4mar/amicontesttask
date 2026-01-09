import { FinishedMatch } from '../types';

const KEY = 'infinite_ttt_history_v1';
const MAX_ITEMS = 50;

export function loadHistory(): FinishedMatch[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as FinishedMatch[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveFinishedMatch(match: FinishedMatch) {
  const prev = loadHistory();
  const next = [match, ...prev].slice(0, MAX_ITEMS);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
