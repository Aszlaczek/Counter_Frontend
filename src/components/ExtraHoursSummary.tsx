import { useState, useEffect, useCallback } from "react";
import { extraHoursService } from "../services/extraHoursService";
import { personService } from "../services/personService";
import type { ExtraHoursSummary as SummaryType, Person } from "../type";
import "../style/ExtraHoursSummary.css";

const ExtraHoursSummary = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const data = await personService.getAll();
        setPersons(data);
      } catch {
        console.error("Failed to fetch persons");
      }
    };
    fetchPersons();
  }, []);

  const fetchSummary = useCallback(async () => {
    if (!selectedPersonId) return;
    setLoading(true);
    try {
      const data = await extraHoursService.getSummary(selectedPersonId);
      setSummary(data);
    } catch {
      alert("Nie udało się pobrać podsumowania.");
    } finally {
      setLoading(false);
    }
  }, [selectedPersonId]);

  useEffect(() => {
    if (selectedPersonId) {
      fetchSummary();
    } else {
      setSummary(null);
    }
  }, [selectedPersonId, fetchSummary]);

  return (
    <div className="summary-container">
      <h3 className="summary-title">Podsumowanie nadgodzin</h3>

      <div className="summary-select-wrapper">
        <label htmlFor="summary-person">
          <p className="summary-select-label">Wybierz osobę</p>
          <select
            id="summary-person"
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(Number(e.target.value))}
            className="select-field"
          >
            <option value={0}>-- Wybierz osobę --</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.surname}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="summary-loading">Ładowanie podsumowania...</p>}

      {summary && !loading && (
        <>
          <div className="summary-card">
            <p className="summary-person">
              Osoba: <strong>{summary.person_name}</strong>
            </p>
            <p className="summary-total">
              Łącznie: {summary.total_hours}h {summary.total_minutes}min
            </p>
            <p className="summary-decimal">
              W przeliczeniu dziesiętnym: {summary.decimal_hours} h
            </p>
            <p className="summary-count">
              Liczba rekordów: {summary.total_records}
            </p>
          </div>
        </>
      )}

      {!selectedPersonId && !loading && (
        <p className="summary-placeholder">
          Wybierz osobę, aby zobaczyć podsumowanie nadgodzin
        </p>
      )}
    </div>
  );
};

export default ExtraHoursSummary;
