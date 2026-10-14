import { describe, expect, it } from 'vitest';
import { emptyFilters, filterRecords, signedDuration, summarizeRecords, totalMinutes } from '../src/utils/timeRecords';
import { fetchAllPages } from '../src/services/pagination';
import type { ExtraHours } from '../src/type';
export const record = (id: number, person_id: number, date: string, hours: number, minutes = 0): ExtraHours => ({ id, person_id, date, hours, minutes, description: null, created_by_id: 1, created_at: '', updated_at: '', edited_by_id: null });
describe('signed time and filters', () => {
  it('represents departures shorter than an hour and mixed durations', () => {
    expect(signedDuration('0', '30', 'departure')).toEqual({ hours: -0, minutes: -30 });
    expect(totalMinutes(signedDuration('1', '30', 'departure'))).toBe(-90);
    expect(totalMinutes(signedDuration('1', '30', 'overtime'))).toBe(90);
  });
  it.each([['0','0'], ['-1','0'], ['1.5','0'], ['0','60'], ['NaN','2']])('rejects invalid time %s:%s', (h,m) => expect(() => signedDuration(h,m,'overtime')).toThrow());
  it('filters inclusive quarter boundaries, leap day, year, people and kind', () => {
    const rows = [record(1,1,'2024-01-01',1),record(2,2,'2024-02-29',0,-30),record(3,2,'2024-03-31',-1),record(4,2,'2024-04-01',-1),record(5,2,'2025-03-31',-1)];
    expect(filterRecords(rows, { ...emptyFilters, year: '2024', quarter: '1' }).map(r => r.id)).toEqual([1,2,3]);
    expect(filterRecords(rows, { ...emptyFilters, personIds: [2], from: '2024-02-29', to: '2024-03-31', kind: 'departure' }).map(r => r.id)).toEqual([2,3]);
    expect(filterRecords(rows, { ...emptyFilters, year: '2024', quarter: '2' }).map(r => r.id)).toEqual([4]);
  });
  it('keeps exact minute balances for separate people', () => {
    expect(summarizeRecords([record(1,1,'2024-01-01',1),record(2,1,'2024-01-02',0,-45),record(3,2,'2024-01-01',0,-30)])).toEqual([
      { personId: 1, overtime: 60, departures: -45, balance: 15, count: 2 },
      { personId: 2, overtime: 0, departures: -30, balance: -30, count: 1 },
    ]);
  });
  it('fetches beyond 500 records, even when server caps pages', async () => {
    const all = Array.from({ length: 1101 }, (_, id) => ({ id }));
    expect(await fetchAllPages(async ({ skip }) => all.slice(skip, skip + 100))).toHaveLength(1101);
  });
  it('rejects a failed or repeated page instead of exporting partial data', async () => {
    await expect(fetchAllPages(async () => [{ id: 1 }])).rejects.toThrow();
    await expect(fetchAllPages(async ({ skip }) => { if (skip) throw new Error('offline'); return [{ id: 1 }]; })).rejects.toThrow('offline');
  });
});
