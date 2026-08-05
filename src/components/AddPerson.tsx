import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { personService } from "../services/personService";
import "../style/AddPerson.css";

const AddPerson = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [faculty, setFaculty] = useState("");
  const [isWorking, setIsWorking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await personService.create({
        name,
        surname,
        faculty: faculty || null,
        is_working: isWorking,
      });
      setSuccess("Osoba została dodana pomyślnie!");
      setName("");
      setSurname("");
      setFaculty("");
      setIsWorking(true);
    } catch {
      setError("Nie udało się dodać osoby. Sprawdź połączenie z API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main">
      <div className="add-person-container">
        <div className="add-person-header">
          <h2 className="add-person-title">Dodaj nową osobę</h2>
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Wróć do panelu
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="add-person-success">{success}</p>}

        <form onSubmit={handleSubmit} className="form-create">
          <h3 className="form-title">Nowa osoba</h3>

          <label htmlFor="ap-name">
            <p className="field-label-text">Imię</p>
            <input
              type="text"
              id="ap-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Wpisz imię"
              required
              autoComplete="off"
            />
          </label>

          <label htmlFor="ap-surname">
            <p className="field-label-text">Nazwisko</p>
            <input
              type="text"
              id="ap-surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Wpisz nazwisko"
              required
              autoComplete="off"
            />
          </label>

          <label htmlFor="ap-faculty">
            <p className="field-label-text">Wydział</p>
            <input
              type="text"
              id="ap-faculty"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="Wydział (opcjonalnie)"
              autoComplete="off"
            />
          </label>

          <label htmlFor="ap-isWorking" className="checkbox-row">
            <input
              type="checkbox"
              id="ap-isWorking"
              checked={isWorking}
              onChange={(e) => setIsWorking(e.target.checked)}
              className="checkbox-input"
            />
            <p className="field-label-text">Aktywny</p>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Dodawanie..." : "Dodaj osobę"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPerson;
