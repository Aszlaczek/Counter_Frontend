import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { extraHoursService } from '../services/extraHoursService';
import { personService } from '../services/personService';
import { toast } from '../store';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExtraHoursTable from '../components/ExtraHoursTable';
import { emptyFilters, filterRecords, formatTime, summarizeRecords } from '../utils/timeRecords';
import type { ExtraHours, Person } from '../type';

const PAGE_SIZE = 10;
export default function ExtraHoursList() {
  const [params] = useSearchParams();
  const [records, setRecords] = useState<ExtraHours[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [filters, setFilters] = useState({ ...emptyFilters, personIds: params.get('person_id') ? [Number(params.get('person_id'))] : [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ExtraHours | null>(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [rows, people] = await Promise.all([extraHoursService.getAllRecords(), personService.getAllRecords()]);
      setRecords(rows); setPersons(people);
    } catch { setError(true); toast.error('Nie udało się pobrać pełnych danych. Spróbuj ponownie.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const invalidRange = !!filters.from && !!filters.to && filters.from > filters.to;
  const filtered = invalidRange ? [] : filterRecords(records, filters);
  const summaries = summarizeRecords(filtered);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const name = (id: number) => { const p = persons.find(p => p.id === id); return p ? `${p.name} ${p.surname}` : `#${id}`; };
  const updateFilter = (key: 'year' | 'quarter' | 'from' | 'to' | 'kind', value: string) => { setFilters(f => ({ ...f, [key]: value })); setPage(1); };
  const years = [...new Set([String(new Date().getFullYear()), ...records.map(r => r.date.slice(0, 4))])].sort().reverse();
  const handleExport = async () => {
    setExporting(true);
    try { const { downloadRecords } = await import('../utils/exportRecords'); await downloadRecords(filtered, persons, filters); }
    catch { toast.error('Nie udało się wyeksportować danych.'); }
    finally { setExporting(false); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await extraHoursService.delete(deleteTarget.id); setDeleteTarget(null); await load(); }
    catch { toast.error('Nie udało się usunąć wpisu.'); }
    finally { setDeleting(false); }
  };
  return <div className="crud-page">
    <header className="page-header"><div><h1 className="page-title">Ewidencja czasu</h1><p className="page-subtitle">Nadgodziny (+), wyjścia (−) i saldo wybranych osób.</p></div>
      <div className="page-actions"><Link to="/persons/new" className="btn-outline">+ Dodaj osobę</Link><Link to="/extra-hours/new" className="btn-primary">+ Dodaj wpis</Link></div>
    </header>
    <section className="toolbar time-filters" aria-label="Filtry ewidencji">
      <label>Osoby (brak wyboru = wszyscy)<select multiple aria-label="Osoby" className="select-field" value={filters.personIds.map(String)} onChange={e => { setFilters(f => ({ ...f, personIds: Array.from(e.target.selectedOptions, o => Number(o.value)) })); setPage(1); }}>
        {persons.map(p => <option key={p.id} value={p.id}>{p.name} {p.surname} (#{p.id})</option>)}
      </select><small>Ctrl / Cmd pozwala wybrać kilka osób.</small></label>
      <label>Rok<select className="select-field" value={filters.year} onChange={e => updateFilter('year', e.target.value)}><option value="">Wszystkie lata</option>{years.map(y => <option key={y}>{y}</option>)}</select></label>
      <label>Kwartał<select className="select-field" value={filters.quarter} onChange={e => updateFilter('quarter', e.target.value)}><option value="">Cały rok</option>{['I (styczeń–marzec)', 'II (kwiecień–czerwiec)', 'III (lipiec–wrzesień)', 'IV (październik–grudzień)'].map((q, i) => <option key={q} value={i + 1}>{q}</option>)}</select></label>
      <label>Od<input type="date" value={filters.from} onChange={e => updateFilter('from', e.target.value)} /></label>
      <label>Do<input type="date" value={filters.to} onChange={e => updateFilter('to', e.target.value)} /></label>
      <label>Rodzaj<select className="select-field" value={filters.kind} onChange={e => updateFilter('kind', e.target.value)}><option value="">Wszystkie</option><option value="overtime">Nadgodziny (+)</option><option value="departure">Wyjścia (−)</option></select></label>
      <button className="btn-outline" onClick={() => { setFilters({ ...emptyFilters }); setPage(1); }}>Wyczyść filtry</button>
    </section>
    {invalidRange && <p role="alert">Data „Od” nie może być późniejsza niż „Do”.</p>}
    {loading ? <Spinner label="Ładowanie wszystkich danych..." /> : error ? <div role="alert">Dane są niedostępne. <button className="btn-outline" onClick={load}>Spróbuj ponownie</button></div> : <>
      <div className="toolbar"><p aria-live="polite">Wpisy: {filtered.length} · Saldo: {formatTime(summaries.reduce((s, r) => s + r.balance, 0))}</p><button className="btn-primary" disabled={exporting || !filtered.length || invalidRange} onClick={handleExport}>{exporting ? 'Eksportowanie...' : `Eksportuj Excel (.xlsx) — ${filtered.length} wpisów`}</button></div>
      <ExtraHoursTable rows={visible.map(r => ({ ...r, person_name: name(r.person_id) }))} emptyMessage="Brak wpisów dla wybranych filtrów." renderActions={id => <><Link className="btn-icon-link" to={`/extra-hours/${id}/edit`}>Edytuj</Link><button className="btn-icon-link btn-danger-link" onClick={() => setDeleteTarget(records.find(r => r.id === id)!)}>Usuń</button></>} />
      <Pagination page={currentPage} hasMore={currentPage * PAGE_SIZE < filtered.length} onPageChange={setPage} />
      {!!summaries.length && <section><h2>Porównanie osób w wybranym okresie</h2><div className="persons-table-wrap"><table className="persons-table"><thead><tr><th>Osoba</th><th>Nadgodziny</th><th>Wyjścia</th><th>Saldo</th><th>Wpisy</th></tr></thead><tbody>{summaries.map(s => <tr key={s.personId}><td>{name(s.personId)}</td><td>{formatTime(s.overtime)}</td><td>{formatTime(s.departures)}</td><td>{formatTime(s.balance)}</td><td>{s.count}</td></tr>)}</tbody></table></div></section>}
    </>}
    <ConfirmDialog open={!!deleteTarget} title="Usunąć wpis?" message="Wpis zostanie trwale usunięty." confirmLabel="Usuń" loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
  </div>;
}
