import ExcelJS from 'exceljs';
import type { ExtraHours, Person } from '../type';
import { entryKind, kindLabel, summarizeRecords, totalMinutes, type RecordFilters } from './timeRecords';

export function buildRecordsWorkbook(records: ExtraHours[], persons: Person[], filters: RecordFilters) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Counter';
  const people = new Map(persons.map(p => [p.id, p]));
  const sheet = workbook.addWorksheet('Rekordy');
  const headers = ['ID wpisu', 'ID osoby', 'Imię', 'Nazwisko', 'Wydział', 'Data', 'Rok', 'Kwartał', 'Rodzaj', 'Czas w minutach', 'Godziny dziesiętne', 'Opis'];
  sheet.addTable({ name: 'RekordyCzasu', ref: 'A1', headerRow: true,
    columns: headers.map(name => ({ name, filterButton: true })),
    rows: records.map(r => {
      const p = people.get(r.person_id);
      const date = r.date.slice(0, 10);
      return [r.id, r.person_id, p?.name ?? '', p?.surname ?? '', p?.faculty ?? '', new Date(`${date}T00:00:00Z`), Number(date.slice(0, 4)), Math.ceil(Number(date.slice(5, 7)) / 3), kindLabel(entryKind(r)), totalMinutes(r), totalMinutes(r) / 60, r.description ?? ''];
    }) });
  sheet.getColumn(6).numFmt = 'yyyy-mm-dd';
  sheet.getColumn(11).numFmt = '0.00';
  const summary = workbook.addWorksheet('Podsumowanie');
  summary.addRow(['ID osoby', 'Imię', 'Nazwisko', 'Nadgodziny (min)', 'Wyjścia (min)', 'Saldo (min)', 'Saldo (h)', 'Liczba wpisów']);
  for (const s of summarizeRecords(records)) {
    const p = people.get(s.personId);
    summary.addRow([s.personId, p?.name ?? '', p?.surname ?? '', s.overtime, s.departures, s.balance, s.balance / 60, s.count]);
  }
  summary.getColumn(7).numFmt = '0.00';
  const info = workbook.addWorksheet('Instrukcja');
  info.addRows([
    ['Pole', 'Opis'],
    ['Zakres', 'Wszystkie rekordy odpowiadające filtrom, ze wszystkich stron listy.'],
    ['Osoby (ID)', filters.personIds.join(', ') || 'Wszystkie'],
    ['Rok', filters.year || 'Wszystkie'], ['Kwartał', filters.quarter || 'Wszystkie'],
    ['Od / do (włącznie)', `${filters.from || 'bez ograniczenia'} / ${filters.to || 'bez ograniczenia'}`],
    ['Rodzaj', filters.kind || 'Wszystkie'],
    ['Czas w minutach', 'Całkowita liczba ze znakiem: nadgodziny dodatnie, wyjścia ujemne. Podstawa obliczeń.'],
    ['Godziny dziesiętne', 'Czas w minutach / 60. Format 0.00 zmienia tylko wyświetlanie, nie precyzję.'],
    ['Data', 'Rzeczywista data Excela; rok i kwartał są liczbami.'],
    ['Obliczenia', 'Tabela RekordyCzasu: użyj SUM, SUMIFS lub tabeli przestawnej według ID osoby, roku i kwartału.'],
    ['Podsumowanie', 'Migawka wybranych danych. Po edycji rekordów przelicz zestawienie samodzielnie.'],
    ['Starsze wpisy', 'Dodatnie wartości pozostają nadgodzinami; nie są automatycznie zmieniane na wyjścia.'],
  ]);
  for (const ws of [sheet, summary, info]) {
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.getRow(1).font = { bold: true };
    ws.columns.forEach(c => { c.width = 24; });
  }
  info.getColumn(2).width = 110;
  return workbook;
}

export async function downloadRecords(records: ExtraHours[], persons: Person[], filters: RecordFilters) {
  const workbook = buildRecordsWorkbook(records, persons, filters);
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `Ewidencja_${filters.year || 'wszystkie-lata'}_${filters.quarter ? `Q${filters.quarter}` : 'wszystkie-kwartaly'}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
