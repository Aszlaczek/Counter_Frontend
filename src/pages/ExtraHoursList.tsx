import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { extraHoursService } from "../services/extraHoursService";
import { personService } from "../services/personService";
import { useExtraHoursListStore } from "../store";
import { toast } from "../store";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ExtraHoursTable from "../components/ExtraHoursTable";
import type { ExtraHours, Person } from "../type";

const PAGE_SIZE = 10;

const ExtraHoursList = () => {
  const { list, setList } = useExtraHoursListStore();
  const [persons, setPersons] = useState<Person[]>([]);
  const [personFilter, setPersonFilter] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExtraHours | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: { skip: number; limit: number; person_id?: number } = {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      };
      if (personFilter) {
        params.person_id = personFilter;
      }
      const data = await extraHoursService.getAll(params);
      setList(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      toast.error("Nie udało się pobrać rekordów nadgodzin.");
    } finally {
      setLoading(false);
    }
  }, [page, personFilter, setList]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    const loadPersons = async () => {
      try {
        const data = await personService.getAll({ limit: 500 });
        setPersons(data);
      } catch {
        // ignore
      }
    };
    loadPersons();
  }, []);

  const personName = (id: number) => {
    const p = persons.find((x) => x.id === id);
    return p ? `${p.name} ${p.surname}` : `#${id}`;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await extraHoursService.delete(deleteTarget.id);
      toast.success("Rekord nadgodzin usunięty.");
      fetchRecords();
    } catch {
      toast.error("Nie udało się usunąć rekordu.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="crud-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Nadgodziny</h1>
          <p className="page-subtitle">Zarządzaj rekordami nadgodzin.</p>
        </div>
        <Link to="/extra-hours/new" className="btn-primary">
          + Dodaj nadgodziny
        </Link>
      </header>

      <div className="toolbar">
        <div className="filter-group">
          <label htmlFor="filter-person" className="filter-label">
            Osoba:
          </label>
          <select
            id="filter-person"
            className="select-field"
            value={personFilter}
            onChange={(e) => {
              setPersonFilter(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={0}>Wszyscy</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.surname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner label="Ładowanie rekordów..." />
      ) : list.length === 0 ? (
        <EmptyState
          title="Brak rekordów"
          message="Nie znaleziono żadnych rekordów nadgodzin dla wybranych kryteriów."
          action={
            <Link to="/extra-hours/new" className="btn-primary">
              + Dodaj nadgodziny
            </Link>
          }
        />
      ) : (
        <ExtraHoursTable
          rows={list.map((item) => ({
            id: item.id,
            person_name: personName(item.person_id),
            person_id: item.person_id,
            date: item.date,
            hours: item.hours,
            minutes: item.minutes,
            description: item.description,
          }))}
          renderActions={(id) => (
            <>
              <Link
                to={`/extra-hours/${id}/edit`}
                className="btn-icon-link"
                title="Edytuj"
              >
                Edytuj
              </Link>
              <button
                type="button"
                className="btn-icon-link btn-danger-link"
                onClick={() => setDeleteTarget(list.find((x) => x.id === id)!)}
                title="Usuń"
              >
                Usuń
              </button>
            </>
          )}
        />
      )}

      <Pagination page={page} hasMore={hasMore} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Usunąć rekord?"
        message="Ten rekord nadgodzin zostanie trwale usunięty. Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ExtraHoursList;
