import { useEffect, useState, type FormEvent } from "react";

type MinutesConverterProps = {
  /** Current hours value of the linked form (optional). */
  hours?: string;
  /** Current minutes value of the linked form (optional). */
  minutes?: string;
  /** Setter for the hours field of the linked form. */
  onHoursChange?: (value: string) => void;
  /** Setter for the minutes field of the linked form. */
  onMinutesChange?: (value: string) => void;
  /**
   * When true, the converter is connected to the linked form's hours/minutes
   * fields: typing into the "Łączne minuty" input instantly fills the hours
   * and minutes fields, and minutes ≥ 60 roll over into hours automatically.
   * When false, it is a standalone tool with a convert button.
   */
  connected?: boolean;
};

/**
 * Dynamic minutes → hours & minutes converter.
 *
 * - **Connected mode** (`connected=true`): typing a total minute count
 *   automatically writes the split hours/minutes into the linked form fields
 *   on every keystroke (no button needed). It also live-normalizes the form:
 *   minutes ≥ 60 roll over into hours (e.g. 2h 90min → 3h 30min).
 * - **Standalone mode** (`connected=false`): a simple tool that converts total
 *   minutes into hours + minutes when you press the button.
 */
const MinutesConverter = ({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  connected = false,
}: MinutesConverterProps) => {
  const [totalMinutes, setTotalMinutes] = useState("");
  const [display, setDisplay] = useState("");

  // Live normalization: whenever minutes >= 60, carry the overflow into
  // hours and drop the remainder back into minutes. Also clamp negatives.
  useEffect(() => {
    if (!connected || !onHoursChange || !onMinutesChange) return;

    const m = parseInt(minutes || "", 10);
    if (Number.isNaN(m)) return;

    if (m >= 60) {
      const h = parseInt(hours || "0", 10) || 0;
      const carry = Math.floor(m / 60);
      onHoursChange(String(h + carry));
      onMinutesChange(String(m % 60));
    } else if (m < 0) {
      onMinutesChange("0");
    }
  }, [minutes, hours, connected, onHoursChange, onMinutesChange]);

  // Keep the "Łączne minuty" field in sync with the linked form values so it
  // always reflects the real total even when the form fields change elsewhere.
  useEffect(() => {
    if (!connected) return;
    const h = parseInt(hours || "0", 10) || 0;
    const m = parseInt(minutes || "0", 10) || 0;
    const total = h * 60 + m;
    setTotalMinutes(total > 0 ? String(total) : "");
  }, [hours, minutes, connected]);

  // DYNAMIC: every keystroke in the total-minutes field immediately writes
  // the split hours/minutes into the linked form inputs.
  const handleTotalChange = (value: string) => {
    setTotalMinutes(value);
    if (!connected) return;

    const total = parseInt(value, 10);
    if (Number.isNaN(total) || total < 0) return;

    const h = Math.floor(total / 60);
    const m = total % 60;
    onHoursChange?.(String(h));
    onMinutesChange?.(String(m));
    setDisplay(`${total} min = ${h} godz. ${m} min`);
  };

  // Standalone mode: convert when the button is pressed.
  const handleConvert = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const total = parseInt(totalMinutes, 10) || 0;
    if (total < 0) {
      setTotalMinutes("0");
      return;
    }
    const h = Math.floor(total / 60);
    const m = total % 60;
    setDisplay(`${total} min = ${h} godz. ${m} min`);
  };

  // Live display values based on the current form state (connected mode).
  const curHours = parseInt(hours || "0", 10) || 0;
  const curMinutes = parseInt(minutes || "0", 10) || 0;
  const totalMin = curHours * 60 + curMinutes;
  const decimal = (totalMin / 60).toFixed(2);

  return (
    <div className="minutes-converter">
      <h4 className="converter-title">⏱️ Konwersja minut</h4>

      {connected ? (
        // Connected mode: typing auto-fills the linked hours/minutes fields.
        <div className="converter-field">
          <label className="converter-label">
            <span className="field-label-text">Łączne minuty</span>
            <input
              type="number"
              value={totalMinutes}
              onChange={(e) => handleTotalChange(e.target.value)}
              placeholder="np. 150"
              min={0}
              inputMode="numeric"
            />
          </label>
          <p className="converter-hint">
            Wpisana wartość automatycznie uzupełnia pola "Godziny" i "Minuty".
          </p>
        </div>
      ) : (
        <form onSubmit={handleConvert} className="converter-form">
          <label className="converter-label">
            <span className="field-label-text">Łączne minuty</span>
            <input
              type="number"
              value={totalMinutes}
              onChange={(e) => setTotalMinutes(e.target.value)}
              placeholder="np. 150"
              min={0}
              inputMode="numeric"
            />
          </label>
          <button type="submit" className="btn-primary">
            Konwertuj
          </button>
        </form>
      )}

      {connected && (
        <>
          <p className="converter-result">
            Aktualnie: <strong>{curHours}</strong> godz.{" "}
            <strong>{curMinutes}</strong> min = <strong>{decimal} h</strong>
          </p>
          {display && <p className="converter-hint">{display}</p>}
        </>
      )}

      {!connected && display && <p className="converter-result">{display}</p>}
    </div>
  );
};

export default MinutesConverter;
