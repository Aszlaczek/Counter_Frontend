import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { personService } from "../services/personService";
import { extraHoursService } from "../services/extraHoursService";
import { usePersonListStore } from "../store";
import { toast } from "../store";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ExtraHoursTable from "../components/ExtraHoursTable";
import type { ExtraHours, PersonDetailResponse } from "../type";

const PersonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const personId = Number(id);
  const navigate = useNavigate();

  const { removeFromList } = usePersonListStore();
  const [person, setPerson] = useState<PersonDetailResponse | null>(null);
  const [records, setRecords] = useState<ExtraHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deletePerson, setDeletePerson] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, hours] = await Promise.all([
        personService.getById(personId),
        extraHoursService.getAllRecords().then(rows => rows.filter(r => r.person_id === personId)),
      ]);
      setPerson(detail);
      setRecords(hours);
    } catch {
      toast.error("Nie udało się pobrać danych osoby.");
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeletePerson = async () => {
    setDeleting(true);
    try {
      await personService.delete(personId);
      removeFromList(personId);
      toast.success("Osoba została usunięta.");
      window.location.href = "/persons";
    } catch {
      toast.error("Nie udało się usunąć osoby.");
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDeleteRecord = async () => {
    if (deleteTarget === null) return;
    setDeleting(true);
    try {
      await extraHoursService.delete(deleteTarget);
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget));
      toast.success("Rekord nadgodzin usunięty.");
      load();
    } catch {
      toast.error("Nie udało się usunąć rekordu.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return <Spinner label="Ładowanie danych osoby..." full />;
  }

  if (!person) {
    return (
      <EmptyState
        title="Nie znaleziono osoby"
        message="Osoba o podanym identyfikatorze nie istnieje."
        action={
          <Link to="/persons" className="btn-primary">
            ← Wróć do listy
          </Link>
        }
      />
    );
  }

  return (
    <div className="crud-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">
            {person.name} {person.surname}
          </h1>
          <p className="page-subtitle">
            {person.faculty || "Brak wydziału"} · ID #{person.id}
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/persons")}
          >
            ← Cofnij
          </button>
          <Link to={`/persons/${person.id}/edit`} className="btn-outline">
            Edytuj
          </Link>
          <button
            type="button"
            className="btn-danger"
            onClick={() => setDeletePerson(true)}
          >
            Usuń osobę
          </button>
        </div>
      </header>

      <Link className="btn-outline" to={`/extra-hours?person_id=${person.id}`}>Filtruj i eksportuj czas tej osoby</Link>
      <section className="detail-cards">
        <div className="stat-card">
          <span className="stat-icon" aria-hidden="true">
            ⏱️
          </span>
          <div>
            <p className="stat-value">{person.total_extra_hours ?? 0} h</p>
            <p className="stat-label">Saldo godzin</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" aria-hidden="true">
            📋
          </span>
          <div>
            <p className="stat-value">{person.extra_hours_count ?? 0}</p>
            <p className="stat-label">Liczba rekordów</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" aria-hidden="true">
            {person.is_working ? "✅" : "⛔"}
          </span>
          <div>
            <p className="stat-value">
              {person.is_working ? "Aktywny" : "Nieaktywny"}
            </p>
            <p className="stat-label">Status</p>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Wpisy czasu</h2>
          <Link
            to={`/extra-hours/new?person_id=${person.id}`}
            className="btn-primary"
          >
            + Dodaj wpis
          </Link>
        </div>

        {records.length === 0 ? (
          <EmptyState
            title="Brak rekordów"
            message="Ta osoba nie ma jeszcze żadnych rekordów nadgodzin."
          />
        ) : (
          <ExtraHoursTable
            rows={records.map((r) => ({
              id: r.id,
              person_name: `${person.name} ${person.surname}`,
              person_id: r.person_id,
              date: r.date,
              hours: r.hours,
              minutes: r.minutes,
              description: r.description,
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
                  onClick={() => setDeleteTarget(id)}
                  title="Usuń"
                >
                  Usuń
                </button>
              </>
            )}
          />
        )}
      </section>

      <ConfirmDialog
        open={deletePerson}
        title="Usunąć osobę?"
        message={`Ta operacja usunie osobę ${person.name} ${person.surname} ORAZ wszystkie jej rekordy nadgodzin. Tej operacji nie można cofnąć.`}
        confirmLabel="Usuń"
        loading={deleting}
        onConfirm={handleDeletePerson}
        onCancel={() => { setDeleteTarget(null); setDeletePerson(false); }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Usunąć rekord?"
        message="Ten rekord nadgodzin zostanie trwale usunięty."
        confirmLabel="Usuń"
        loading={deleting}
        onConfirm={handleDeleteRecord}
        onCancel={() => { setDeleteTarget(null); setDeletePerson(false); }}
      />
    </div>
  );
};

export default PersonDetail;
