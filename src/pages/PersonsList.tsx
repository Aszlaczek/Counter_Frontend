import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { personService } from "../services/personService";
import { usePersonListStore } from "../store";
import { toast } from "../store";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import PersonsTable from "../components/PersonsTable";
import type { Person, PersonDetailResponse } from "../type";

const PAGE_SIZE = 10;

const PersonsList = () => {
  const { list, setList, removeFromList } = usePersonListStore();
  const [loading, setLoading] = useState(true);
  const [isWorking, setIsWorking] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [details, setDetails] = useState<PersonDetailResponse[]>([]);

  const fetchPersons = useCallback(async () => {
    setLoading(true);
    try {
      const params: { skip: number; limit: number; is_working?: boolean } = {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      };
      if (isWorking !== "") {
        params.is_working = isWorking === "true";
      }
      const data = await personService.getAll(params);
      setList(data);
      // Fetch details (with hours summary) for each person on the page.
      const detailData = await Promise.all(
        data.map((p) => personService.getById(p.id)),
      );
      setDetails(detailData);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      toast.error("Nie udało się pobrać listy osób.");
    } finally {
      setLoading(false);
    }
  }, [page, isWorking, setList]);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  const handleFilterChange = (value: string) => {
    setIsWorking(value as "" | "true" | "false");
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await personService.delete(deleteTarget.id);
      removeFromList(deleteTarget.id);
      toast.success("Osoba została usunięta.");
      fetchPersons();
    } catch {
      toast.error("Nie udało się usunąć osoby.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="crud-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Osoby</h1>
          <p className="page-subtitle">
            Zarządzaj osobami i śledź ich nadgodziny.
          </p>
        </div>
        <Link to="/persons/new" className="btn-primary">
          + Dodaj osobę
        </Link>
      </header>

      <div className="toolbar">
        <div className="filter-group">
          <label htmlFor="filter-working" className="filter-label">
            Status:
          </label>
          <select
            id="filter-working"
            className="select-field"
            value={isWorking}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">Wszyscy</option>
            <option value="true">Aktywni</option>
            <option value="false">Nieaktywni</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner label="Ładowanie osób..." />
      ) : list.length === 0 ? (
        <EmptyState
          title="Brak osób"
          message="Nie znaleziono żadnych osób dla wybranych kryteriów."
          action={
            <Link to="/persons/new" className="btn-primary">
              + Dodaj osobę
            </Link>
          }
        />
      ) : (
        <PersonsTable
          rows={details.map((d) => ({
            id: d.id,
            name: d.name,
            surname: d.surname,
            faculty: d.faculty,
            is_working: d.is_working,
            total_extra_hours: d.total_extra_hours ?? 0,
            extra_hours_count: d.extra_hours_count ?? 0,
          }))}
          renderActions={(row) => (
            <>
              <Link
                to={`/persons/${row.id}/edit`}
                className="btn-icon-link"
                title="Edytuj"
              >
                Edytuj
              </Link>
              <button
                type="button"
                className="btn-icon-link btn-danger-link"
                onClick={() =>
                  setDeleteTarget(list.find((p) => p.id === row.id) ?? null)
                }
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
        title="Usunąć osobę?"
        message={`Ta operacja usunie osobę ${deleteTarget?.name} ${deleteTarget?.surname} ORAZ wszystkie jej rekordy nadgodzin. Tej operacji nie można cofnąć.`}
        confirmLabel="Usuń"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default PersonsList;
