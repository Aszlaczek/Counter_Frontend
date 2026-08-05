import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { personService } from "../services/personService";
import { toast } from "../store";
import { getApiErrorDetail } from "../utils/apiErrors";
import Spinner from "../components/ui/Spinner";

const PersonEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const personId = Number(id);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [faculty, setFaculty] = useState("");
  const [isWorking, setIsWorking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const person = await personService.getById(personId);
        setName(person.name);
        setSurname(person.surname);
        setFaculty(person.faculty ?? "");
        setIsWorking(person.is_working);
      } catch {
        toast.error("Nie udało się pobrać danych osoby.");
        navigate("/persons");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [personId, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await personService.update(personId, {
        name,
        surname,
        faculty: faculty || null,
        is_working: isWorking,
      });
      toast.success("Dane osoby zostały zaktualizowane.");
      navigate(`/persons/${personId}`);
    } catch (err) {
      toast.error(getApiErrorDetail(err, "Nie udało się zaktualizować osoby."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner label="Ładowanie danych..." full />;
  }

  return (
    <div className="crud-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Edytuj osobę</h1>
          <p className="page-subtitle">Zaktualizuj dane osoby #{personId}.</p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate(`/persons/${personId}`)}
        >
          ← Wróć
        </button>
      </header>

      <form onSubmit={handleSubmit} className="form-page">
        <label htmlFor="pe-name">
          <span className="field-label-text">Imię *</span>
          <input
            type="text"
            id="pe-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Wpisz imię"
            required
            maxLength={100}
            autoComplete="off"
          />
        </label>

        <label htmlFor="pe-surname">
          <span className="field-label-text">Nazwisko *</span>
          <input
            type="text"
            id="pe-surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Wpisz nazwisko"
            required
            maxLength={100}
            autoComplete="off"
          />
        </label>

        <label htmlFor="pe-faculty">
          <span className="field-label-text">Wydział</span>
          <input
            type="text"
            id="pe-faculty"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            placeholder="np. Wydział Inżynierii"
            maxLength={200}
            autoComplete="off"
          />
        </label>

        <label htmlFor="pe-working" className="checkbox-row">
          <input
            type="checkbox"
            id="pe-working"
            checked={isWorking}
            onChange={(e) => setIsWorking(e.target.checked)}
            className="checkbox-input"
          />
          <span>Aktywny</span>
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate(`/persons/${personId}`)}
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

export default PersonEdit;
