import { useEffect } from "react";
import "../style/Counter.css";
import { useHoursStore } from "../store";

const Counter = () => {
  const count = useHoursStore();

  useEffect(() => {
    const len = String(count.min);
    if (len.length >= 5) {
      alert("Za dużo znaków :P");
      count.setMin(0);
      return;
    } else {
      count.convert();
    }
  }, [count.min]);

  return (
    <div className="container-inner">
      <h1>Przelicznik Czasu</h1>
      <div className="counter-card">
        <div className="input-group">
          <p className="input-label">Wpisz minuty</p>
          <div className="input-wrapper">
            <input
              type="number"
              name="inp"
              id="inp"
              onChange={(e) => {
                count.setMin(Number(e.target.value));
              }}
              min={0}
              inputMode="numeric"
              max={9999}
              placeholder="0"
              value={count.min === 0 ? "" : count.min}
            />
          </div>
        </div>
        <div className="result-display">
          <p>Wynik w godzinach</p>
          <h2>{count.allHours}</h2>
        </div>
      </div>
    </div>
  );
};

export default Counter;
