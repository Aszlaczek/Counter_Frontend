import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { personService } from "../services/personService";
import { toast } from "../store";
import { getApiErrorDetail } from "../utils/apiErrors";

const PersonCreate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [faculty, setFaculty] = useState("");
  const [isWorking, setIsWorking] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await personService.create({
        name,
        surname,
        faculty: faculty || null,
        is_working: isWorking,
      });
      toast.success("Osoba została dodana.");
      navigate("/persons");
    } catch (err) {
      toast.error(getApiErrorDetail(err, "Nie udało się dodać osoby."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dodaj osobę</h1>
          <p className="page-subtitle">Dodaj nową osobę do bazy.</p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate("/persons")}
        >
          ← Wróć
        </button>
      </header>

      <form onSubmit={handleSubmit} className="form-page">
        <label htmlFor="pc-name">
          <span className="field-label-text">Imię *</span>
          <input
            type="text"
            id="pc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Wpisz imię"
            required
            maxLength={100}
            autoComplete="off"
          />
        </label>

        <label htmlFor="pc-surname">
          <span className="field-label-text">Nazwisko *</span>
          <input
            type="text"
            id="pc-surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Wpisz nazwisko"
            required
            maxLength={100}
            autoComplete="off"
          />
        </label>

        <label htmlFor="pc-faculty">
          <span className="field-label-text">Wydział (opcjonalnie)</span>
          <input
            type="text"
            id="pc-faculty"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            placeholder="np. Wydział Inżynierii"
            maxLength={200}
            autoComplete="off"
          />
        </label>

        <label htmlFor="pc-working" className="checkbox-row">
          <input
            type="checkbox"
            id="pc-working"
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
            onClick={() => navigate("/persons")}
          >
            Anuluj
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Dodawanie..." : "Dodaj osobę"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonCreate;
