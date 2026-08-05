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
          personService.getAll({ limit: 500 }),
        ]);
        setPersonId(record.person_id);
        setHours(String(record.hours));
        setMinutes(String(record.minutes));
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
    setSaving(true);
    try {
      await extraHoursService.update(recordId, {
        hours: hours ? Number(hours) : undefined,
        minutes: minutes ? Number(minutes) : undefined,
        description: description || null,
        date: date || null,
      });
      toast.success("Rekord nadgodzin został zaktualizowany.");
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
          <h1 className="page-title">Edytuj nadgodziny</h1>
          <p className="page-subtitle">
            Zaktualizuj rekord nadgodzin #{recordId}.
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
