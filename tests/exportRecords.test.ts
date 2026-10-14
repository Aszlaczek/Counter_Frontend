// @vitest-environment node
import { expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { buildRecordsWorkbook } from '../src/utils/exportRecords';
import { emptyFilters } from '../src/utils/timeRecords';
import type { ExtraHours, Person } from '../src/type';
it('writes a real XLSX with numeric signed time, Excel dates and separate person IDs', async () => {
  const rows = [{ id: 1, person_id: 7, date: '2024-03-31', hours: 0, minutes: -30, description: '=1+1' }, { id: 2, person_id: 8, date: '2024-03-31', hours: 1, minutes: 15, description: null }] as ExtraHours[];
  const people = [{ id: 7, name: 'Jan', surname: 'Nowak', faculty: 'IT' }, { id: 8, name: 'Jan', surname: 'Nowak', faculty: 'IT' }] as Person[];
  const original = buildRecordsWorkbook(rows, people, { ...emptyFilters, year: '2024', quarter: '1' });
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await original.xlsx.writeBuffer());
  const sheet = workbook.getWorksheet('Rekordy');
  expect(sheet.rowCount).toBe(3);
  expect(sheet.getCell('J2').value).toBe(-30);
  expect(sheet.getCell('K2').value).toBe(-0.5);
  expect(sheet.getCell('F2').value).toEqual(new Date('2024-03-31T00:00:00Z'));
  expect(sheet.getCell('H2').value).toBe(1);
  expect(sheet.getCell('L2').value).toBe('=1+1');
  expect(sheet.getCell('L2').type).toBe(ExcelJS.ValueType.String);
  expect(workbook.getWorksheet('Podsumowanie').getCell('F2').value).toBe(-30);
  expect(workbook.getWorksheet('Podsumowanie').getCell('F3').value).toBe(75);
  expect(workbook.getWorksheet('Instrukcja').getCell('B4').value).toBe('2024');
});
