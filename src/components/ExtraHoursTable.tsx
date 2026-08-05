import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../style/PersonsTable.css";

export type ExtraHoursRow = {
  id: number;
  person_name: string;
  person_id: number;
  date: string;
  hours: number;
  minutes: number;
  description: string | null;
};

type ExtraHoursTableProps = {
  rows: ExtraHoursRow[];
  /** Optional empty-state message. */
  emptyMessage?: string;
  /** Optional per-row actions rendered in a trailing column. */
  renderActions?: (id: number) => ReactNode;
};

/**
 * Minimalistic, reusable table showing extra hours records.
 * Reuses the same styles as PersonsTable for a consistent look.
 */
const ExtraHoursTable = ({
  rows,
  emptyMessage,
  renderActions,
}: ExtraHoursTableProps) => {
  if (rows.length === 0) {
    return (
      <div className="persons-table-empty">
        {emptyMessage ?? "Brak rekordów do wyświetlenia."}
      </div>
    );
  }

  return (
    <div className="persons-table-wrap">
      <table className="persons-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Osoba</th>
            <th className="num">Godziny</th>
            <th className="num">Minuty</th>
            <th>Opis</th>
            {renderActions && <th className="num">Akcje</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="pt-muted">{r.date}</td>
              <td>
                <Link to={`/persons/${r.person_id}`} className="pt-name">
                  {r.person_name}
                </Link>
              </td>
              <td className="num pt-muted">{r.hours}</td>
              <td className="num pt-muted">{r.minutes}</td>
              <td className="pt-muted">{r.description || "—"}</td>
              {renderActions && (
                <td className="num">
                  <div className="table-actions">{renderActions(r.id)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExtraHoursTable;
