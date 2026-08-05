import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { extraHoursService } from "../services/extraHoursService";
import { personService } from "../services/personService";
import { toast } from "../store";
import { getApiErrorDetail } from "../utils/apiErrors";
import MinutesConverter from "../components/MinutesConverter";
import type { Person } from "../type";

const today = () => new Date().toISOString().split("T")[0];

const ExtraHoursCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Optional pre-selected person passed via ?person_id=... (e.g. from a person's detail page).
  const preselectId = Number(searchParams.get("person_id")) || 0;

  const [persons, setPersons] = useState<Person[]>([]);
  const [personId, setPersonId] = useState<number>(preselectId);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [personsLoading, setPersonsLoading] = useState(true);

  useEffect(() => {
    const loadPersons = async () => {
      try {
        const data = await personService.getAll({ limit: 500 });
        setPersons(data);
        // If a person was pre-linked via query param, ensure it exists in the list.
        if (preselectId && !data.some((p) => p.id === preselectId)) {
          setPersonId(0);
        }
      } catch {
        toast.error("Nie udało się pobrać listy osób.");
      } finally {
        setPersonsLoading(false);
      }
    };
    loadPersons();
  }, [preselectId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!personId) {
      toast.error("Wybierz osobę.");
      return;
    }
    setLoading(true);
    try {
      await extraHoursService.create({
        person_id: personId,
        hours: hours ? Number(hours) : undefined,
        minutes: minutes ? Number(minutes) : undefined,
        description: description || null,
        date: date || null,
      });
      toast.success("Rekord nadgodzin został dodany.");
      navigate("/extra-hours");
    } catch (err) {
      toast.error(getApiErrorDetail(err, "Nie udało się dodać rekordu."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dodaj nadgodziny</h1>
          <p className="page-subtitle">
            Dodaj nowy rekord nadgodzin dla osoby.
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
        <label htmlFor="eh-person">
          <span className="field-label-text">Osoba *</span>
          <select
            id="eh-person"
            className="select-field"
            value={personId}
            onChange={(e) => setPersonId(Number(e.target.value))}
            required
            disabled={personsLoading || preselectId > 0}
          >
            <option value={0}>-- Wybierz osobę --</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.surname}
              </option>
            ))}
          </select>
        </label>

        {preselectId > 0 && (
          <p className="converter-hint">
            ✓ Osoba została automatycznie wybrana i jest zablokowana.
          </p>
        )}

        <div className="form-row">
          <label htmlFor="eh-hours">
            <span className="field-label-text">Godziny</span>
            <input
              type="number"
              id="eh-hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              min={0}
              inputMode="numeric"
            />
          </label>

          <label htmlFor="eh-minutes">
            <span className="field-label-text">Minuty (0-59)</span>
            <input
              type="number"
              id="eh-minutes"
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

        <label htmlFor="eh-date">
          <span className="field-label-text">Data (opcjonalnie)</span>
          <input
            type="date"
            id="eh-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label htmlFor="eh-desc">
          <span className="field-label-text">Opis (opcjonalnie)</span>
          <textarea
            id="eh-desc"
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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Dodawanie..." : "Dodaj nadgodziny"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExtraHoursCreate;
