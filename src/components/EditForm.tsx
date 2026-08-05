import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { personService } from "../services/personService";
import { usePersonListStore } from "../store";
import "../style/EditForm.css";
import type { Person } from "../type";

type Props = {
  onUpdate: () => Promise<void>;
};

const EditForm = ({ onUpdate }: Props) => {
  const { list } = usePersonListStore();
  const [visible, setVisible] = useState(false);
  const [person, setPerson] = useState<Person | null>(null);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [faculty, setFaculty] = useState("");
  const [isWorking, setIsWorking] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const found = list.find((p) => p.id === detail.id);
      if (found) {
        setPerson(found);
        setName(found.name);
        setSurname(found.surname);
        setFaculty(found.faculty);
        setIsWorking(found.is_working);
        setVisible(true);
      }
    };
    window.addEventListener("open-edit", handler);
    return () => window.removeEventListener("open-edit", handler);
  }, [list]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!person) return;

    try {
      await personService.update(person.id, {
        name,
        surname,
        faculty,
        is_working: isWorking,
      });
      setVisible(false);
      setPerson(null);
      await onUpdate();
    } catch {
      alert("Nie udało się zaktualizować danych.");
    }
  };

  const handleHide = () => {
    setVisible(false);
    setPerson(null);
  };

  if (!visible || !person) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleHide} />
      <form onSubmit={handleSubmit} className="form-edit">
        <h3>Edytuj Dane</h3>
        <label htmlFor="e-name">
          <p>Imię</p>
          <input
            type="text"
            name="e-name"
            required
            id="e-name"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            autoComplete="off"
          />
        </label>
        <label htmlFor="e-surname">
          <p>Nazwisko</p>
          <input
            type="text"
            name="e-surname"
            required
            id="e-surname"
            value={surname}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSurname(e.target.value)
            }
            autoComplete="off"
          />
        </label>
        <label htmlFor="e-faculty">
          <p>Wydział</p>
          <input
            type="text"
            name="e-faculty"
            id="e-faculty"
            value={faculty}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFaculty(e.target.value)
            }
            autoComplete="off"
          />
        </label>
        <label htmlFor="e-isWorking" className="checkbox-row">
          <input
            type="checkbox"
            name="e-isWorking"
            id="e-isWorking"
            checked={isWorking}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setIsWorking(e.target.checked)
            }
            className="checkbox-input"
          />
          <p>Aktywny</p>
        </label>
        <div className="container-btn">
          <button type="button" className="btn-cancel" onClick={handleHide}>
            Anuluj
          </button>
          <button type="submit" className="btn-update">
            Zapisz Zmiany
          </button>
        </div>
      </form>
    </>
  );
};

export default EditForm;
