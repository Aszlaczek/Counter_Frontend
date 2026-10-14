import type { ExtraHours } from '../type';

export type EntryKind = 'overtime' | 'departure';
export type RecordFilters = { personIds: number[]; year: string; quarter: string; from: string; to: string; kind: string };
export const emptyFilters: RecordFilters = { personIds: [], year: '', quarter: '', from: '', to: '', kind: '' };
export const totalMinutes = (record: Pick<ExtraHours, 'hours' | 'minutes'>) => record.hours * 60 + record.minutes;
export const entryKind = (record: Pick<ExtraHours, 'hours' | 'minutes'>): EntryKind => totalMinutes(record) < 0 ? 'departure' : 'overtime';
export const kindLabel = (kind: EntryKind) => kind === 'departure' ? 'Wyjście' : 'Nadgodziny';
export const formatTime = (minutes: number) => `${minutes < 0 ? '−' : '+'}${Math.floor(Math.abs(minutes) / 60)} h ${Math.abs(minutes) % 60} min`;
export function signedDuration(hours: string, minutes: string, kind: EntryKind) {
  const h = Number(hours), m = Number(minutes);
  if (!Number.isSafeInteger(h) || !Number.isSafeInteger(m) || h < 0 || m < 0 || m > 59 || !Number.isSafeInteger(h * 60 + m) || h * 60 + m === 0) {
    throw new Error('Podaj całkowite godziny i minuty 0–59. Czas musi być większy od zera.');
  }
  const sign = kind === 'departure' ? -1 : 1;
  return { hours: sign * h, minutes: sign * m };
}
export function filterRecords(records: ExtraHours[], filters: RecordFilters) {
  return records.filter(r => {
    const date = r.date.slice(0, 10);
    return (!filters.personIds.length || filters.personIds.includes(r.person_id)) &&
      (!filters.year || date.slice(0, 4) === filters.year) &&
      (!filters.quarter || Math.ceil(Number(date.slice(5, 7)) / 3) === Number(filters.quarter)) &&
      (!filters.from || date >= filters.from) && (!filters.to || date <= filters.to) &&
      (!filters.kind || entryKind(r) === filters.kind);
  }).sort((a, b) => a.date.localeCompare(b.date) || a.person_id - b.person_id || a.id - b.id);
}
export function summarizeRecords(records: ExtraHours[]) {
  const groups = new Map<number, { personId: number; overtime: number; departures: number; balance: number; count: number }>();
  for (const r of records) {
    const group = groups.get(r.person_id) ?? { personId: r.person_id, overtime: 0, departures: 0, balance: 0, count: 0 };
    const minutes = totalMinutes(r);
    group.overtime += Math.max(0, minutes);
    group.departures += Math.min(0, minutes);
    group.balance += minutes;
    group.count++;
    groups.set(r.person_id, group);
  }
  return [...groups.values()].sort((a, b) => a.personId - b.personId);
}
