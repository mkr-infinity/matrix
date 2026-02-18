import AsyncStorage from '@react-native-async-storage/async-storage';
import { Matrix } from './matrix-operations';

export interface HistoryEntry {
  id: string;
  matrixA: Matrix;
  matrixB: Matrix | null;
  operation: string;
  result: Matrix | number | null;
  timestamp: number;
  rowsA: number;
  colsA: number;
  rowsB: number;
  colsB: number;
}

const HISTORY_KEY = '@matrix_solver_history';

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<void> {
  const history = await getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
  };
  history.unshift(newEntry);
  if (history.length > 50) history.pop();
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
