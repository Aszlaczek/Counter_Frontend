import EntryKindSelect from "../components/EntryKindSelect";
import { signedDuration, entryKind, type EntryKind } from "../utils/timeRecords";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { extraHoursService } from "../services/extraHoursService";
import { personService } from "../services/personService";
import { toast } from "../store";
import { getApiErrorDetail } from "../utils/apiErrors";
import Spinner from "../components/ui/Spinner";
import MinutesConverter from "../components/MinutesConverter";
import type { Person } from "../type";

const ExtraHoursEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recordId = Number(id);

  const [persons, setPersons] = useState<Person[]>([]);
  const [personId, setPersonId] = useState<number>(0);
  const [kind, setKind] = useState<EntryKind>("overtime");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [record, personsData] = await Promise.all([
          extraHoursService.getById(recordId),
          personService.getAllRecords(),
        ]);
        setPersonId(record.person_id);
        setKind(entryKind(record));
        setHours(String(Math.floor(Math.abs(record.hours * 60 + record.minutes) / 60)));
        setMinutes(String(Math.abs(record.hours * 60 + record.minutes) % 60));
        setDescription(record.description ?? "");
        setDate(record.date);
        setPersons(personsData);
      } catch {
        toast.error("Nie udało się pobrać rekordu.");
        navigate("/extra-hours");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recordId, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try { signedDuration(hours, minutes, kind); } catch (err) { toast.error((err as Error).message); return; }
    setSaving(true);
    try {
      await extraHoursService.update(recordId, {
        ...signedDuration(hours, minutes, kind),
        description: description || null,
        ...(date ? { date } : {}),
      });
      toast.success("Wpis czasu został zaktualizowany.");
      navigate("/extra-hours");
    } catch (err) {
      toast.error(
        getApiErrorDetail(err, "Nie udało się zaktualizować rekordu."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner label="Ładowanie rekordu..." full />;
  }

  return (
    <div className="crud-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Edytuj wpis</h1>
          <p className="page-subtitle">
            Zaktualizuj wpis czasu #{recordId}.
          </p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate("/extra-hours")}
        >
          ← Wróć
        </button>
      </header>

      <form onSubmit={handleSubmit} className="form-page">
        <div className="info-box">
          {personId > 0 && persons.length > 0 && (
            <p>
              Osoba:{" "}
              <strong>
                {persons.find((p) => p.id === personId)?.name}{" "}
                {persons.find((p) => p.id === personId)?.surname}
              </strong>
            </p>
          )}
        </div>

        <EntryKindSelect value={kind} onChange={setKind} />
        <div className="form-row">
          <label htmlFor="ee-hours">
            <span className="field-label-text">Godziny</span>
            <input
              type="number"
              id="ee-hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              min={0}
              inputMode="numeric"
            />
          </label>

          <label htmlFor="ee-minutes">
            <span className="field-label-text">Minuty (0-59)</span>
            <input
              type="number"
              id="ee-minutes"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              min={0}
              max={59}
              inputMode="numeric"
            />
          </label>
        </div>

        <MinutesConverter
          connected
          hours={hours}
          minutes={minutes}
          onHoursChange={setHours}
          onMinutesChange={setMinutes}
        />

        <label htmlFor="ee-date">
          <span className="field-label-text">Data</span>
          <input
            type="date"
            id="ee-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label htmlFor="ee-desc">
          <span className="field-label-text">Opis</span>
          <textarea
            id="ee-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opis pracy / powód nadgodzin"
            maxLength={500}
            rows={3}
          />
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/extra-hours")}
          >
            Anuluj
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExtraHoursEdit;
