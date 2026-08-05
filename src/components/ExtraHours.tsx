import { useState, useEffect, type FormEvent } from "react";
import { extraHoursService } from "../services/extraHoursService";
import { personService } from "../services/personService";
import { useExtraHoursListStore, usePersonListStore } from "../store";
import type { Person } from "../type";
import "../style/ExtraHours.css";

const ExtraHours = () => {
  const {
    list: extraList,
    setList: setExtraList,
    addToList,
    removeFromList,
  } = useExtraHoursListStore();
  const { list: persons, setList: setPersons } = usePersonListStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [extraData, personsData] = await Promise.all([
          extraHoursService.getAll(),
          personService.getAll(),
        ]);
        setExtraList(extraData);
        setPersons(personsData);
      } catch {
        console.error("Failed to fetch data");
      }
    };
    fetchData();
  }, [setExtraList, setPersons]);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPersonId) return;

    try {
      const created = await extraHoursService.create({
        person_id: selectedPersonId,
        hours: hours ? Number(hours) : undefined,
        minutes: minutes ? Number(minutes) : undefined,
        description: description || null,
      });
      addToList(created);
      setHours("");
      setMinutes("");
      setDescription("");
      setShowForm(false);
    } catch {
      alert("Nie udało się dodać nadgodzin.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Usunąć ten rekord?")) return;
    try {
      await extraHoursService.delete(id);
      removeFromList(id);
    } catch {
      alert("Nie udało się usunąć.");
    }
  };

  return (
    <div className="extra-hours-container">
      <div className="extra-hours-header">
        <h3 className="extra-hours-title">Nadgodziny</h3>
        <button
          className="btn-open-form"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Zamknij" : "Dodaj nadgodziny"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="form-create extra-hours-form">
          <h3 className="extra-hours-form-title">Dodaj Nadgodziny</h3>

          <label htmlFor="eh-person">
            <p className="field-label-text">Osoba</p>
            <select
              id="eh-person"
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(Number(e.target.value))}
              required
              className="select-field"
            >
              <option value={0}>-- Wybierz osobę --</option>
              {persons.map((p: Person) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.surname}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="eh-hours">
            <p className="field-label-text">Godziny</p>
            <input
              type="number"
              id="eh-hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="np. 2"
              min={0}
              inputMode="numeric"
              style={{ width: "100%" }}
            />
          </label>

          <label htmlFor="eh-minutes">
            <p className="field-label-text">Minuty</p>
            <input
              type="number"
              id="eh-minutes"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="np. 30"
              min={0}
              max={59}
              inputMode="numeric"
              style={{ width: "100%" }}
            />
          </label>

          <label htmlFor="eh-desc">
            <p className="field-label-text">Opis (opcjonalnie)</p>
            <input
              type="text"
              id="eh-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opis..."
              style={{ width: "100%" }}
            />
          </label>

          <button type="submit">Zapisz</button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Osoby</th>
              <th>Godziny</th>
              <th>Minuty</th>
              <th>Opis</th>
              <th>Data</th>
              <th>Opcje</th>
            </tr>
          </thead>
          <tbody>
            {extraList.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.person_id}</td>
                <td>{item.hours}</td>
                <td>{item.minutes}</td>
                <td>{item.description || "-"}</td>
                <td>{item.date}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(item.id)}
                      title="Usuń"
                    >
                      <img
                        src="/delete-svgrepo-com.svg"
                        alt="Usuń"
                        className="delete-icon"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {extraList.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  Brak rekordów nadgodzin
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExtraHours;
