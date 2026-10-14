import type { EntryKind } from '../utils/timeRecords';
export default function EntryKindSelect({ value, onChange }: { value: EntryKind; onChange: (kind: EntryKind) => void }) {
  return <label><span className="field-label-text">Rodzaj wpisu *</span><select className="select-field" value={value} onChange={e => onChange(e.target.value as EntryKind)}><option value="departure">Wyjście (−)</option><option value="overtime">Nadgodziny (+)</option></select><small>Wpisz dodatni czas. Znak zostanie ustawiony zgodnie z rodzajem wpisu.</small></label>;
}
