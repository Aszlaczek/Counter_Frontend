import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../style/PersonsTable.css";

export type PersonsTableRow = {
  id: number;
  name: string;
  surname: string;
  faculty: string;
  is_working: boolean;
  total_extra_hours: number;
  extra_hours_count: number;
};

type PersonsTableProps = {
  rows: PersonsTableRow[];
  /** Optional empty-state message. */
  emptyMessage?: string;
  /** Optional per-row actions rendered in a trailing column. */
  renderActions?: (row: PersonsTableRow) => ReactNode;
};

/**
 * Minimalistic, reusable table showing persons and their accumulated hours.
 * Each row links to the person's detail page.
 */
const PersonsTable = ({
  rows,
  emptyMessage,
  renderActions,
}: PersonsTableProps) => {
  if (rows.length === 0) {
    return (
      <div className="persons-table-empty">
        {emptyMessage ?? "Brak danych do wyświetlenia."}
      </div>
    );
  }

  return (
    <div className="persons-table-wrap">
      <table className="persons-table">
        <thead>
          <tr>
            <th>Osoba</th>
            <th>Wydział</th>
            <th>Status</th>
            <th className="num">Rekordy</th>
            <th className="num">Suma godzin</th>
            {renderActions && <th className="num">Akcje</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>
                <Link to={`/persons/${p.id}`} className="pt-name">
                  {p.name} {p.surname}
                </Link>
              </td>
              <td className="pt-muted">{p.faculty || "—"}</td>
              <td>
                <span
                  className={`pt-badge ${p.is_working ? "pt-on" : "pt-off"}`}
                >
                  {p.is_working ? "Aktywny" : "Nieaktywny"}
                </span>
              </td>
              <td className="num pt-muted">{p.extra_hours_count}</td>
              <td className="num pt-hours">{p.total_extra_hours} h</td>
              {renderActions && (
                <td className="num">
                  <div className="table-actions">{renderActions(p)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonsTable;
