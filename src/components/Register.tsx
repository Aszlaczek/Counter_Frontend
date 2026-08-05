import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { toast } from "../store";
import { getApiErrorDetail } from "../utils/apiErrors";
import MinutesConverter from "./MinutesConverter";
import "../style/Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Hasła nie są zgodne");
      return;
    }

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    setLoading(true);

    try {
      await authService.register({ username, email, password, name, surname });
      setSuccess("Konto utworzone! Za chwilę zostaniesz przekierowany...");
      toast.success("Konto zostało utworzone. Zaloguj się.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(getApiErrorDetail(err, "Nie udało się utworzyć konta."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Rejestracja</h2>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <label htmlFor="reg-username">
          <p className="auth-label-text">Nazwa użytkownika *</p>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Wpisz nazwę użytkownika"
            required
            minLength={3}
            maxLength={100}
            autoComplete="username"
            className="auth-input"
          />
        </label>

        <label htmlFor="reg-email">
          <p className="auth-label-text">Email (opcjonalnie)</p>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Wpisz adres email"
            autoComplete="email"
            className="auth-input"
          />
        </label>

        <label htmlFor="reg-name">
          <p className="auth-label-text">Imię *</p>
          <input
            type="text"
            id="reg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Wpisz imię"
            required
            maxLength={100}
            autoComplete="given-name"
            className="auth-input"
          />
        </label>

        <label htmlFor="reg-surname">
          <p className="auth-label-text">Nazwisko *</p>
          <input
            type="text"
            id="reg-surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Wpisz nazwisko"
            required
            maxLength={100}
            autoComplete="family-name"
            className="auth-input"
          />
        </label>

        <label htmlFor="reg-password">
          <p className="auth-label-text">Hasło *</p>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 znaków"
            required
            minLength={6}
            maxLength={72}
            autoComplete="new-password"
            className="auth-input"
          />
        </label>

        <label htmlFor="reg-confirm">
          <p className="auth-label-text">Potwierdź hasło *</p>
          <input
            type="password"
            id="reg-confirm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Powtórz hasło"
            required
            autoComplete="new-password"
            className="auth-input"
          />
        </label>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Rejestracja..." : "Zarejestruj się"}
        </button>

        <p className="auth-switch">
          Masz już konto?{" "}
          <Link to="/login" className="auth-link">
            Zaloguj się
          </Link>
        </p>
      </form>

      <div className="auth-converter-wrap">
        <MinutesConverter />
      </div>
    </div>
  );
};

export default Register;
