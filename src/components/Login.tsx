import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthStore, toast } from "../store";
import { getApiErrorDetail } from "../utils/apiErrors";
import MinutesConverter from "./MinutesConverter";
import "../style/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Clear any stale tokens first to avoid interceptor confusion.
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      const authRes = await authService.login({ username, password });
      localStorage.setItem("access_token", authRes.access_token);
      localStorage.setItem("refresh_token", authRes.refresh_token);

      // The login response already contains the admin profile — use it directly
      // to avoid a fragile second request and ensure auth state is set.
      const profile = authRes.admin;
      setUser(profile);
      toast.success(`Witaj, ${profile.name}!`);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorDetail(err, "Błąd logowania. Spróbuj ponownie."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Logowanie</h2>

        {error && <p className="auth-error">{error}</p>}

        <label htmlFor="username">
          <p className="auth-label-text">Nazwa użytkownika</p>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Wpisz nazwę użytkownika"
            required
            autoComplete="username"
            className="auth-input"
          />
        </label>

        <label htmlFor="password">
          <p className="auth-label-text">Hasło</p>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wpisz hasło"
            required
            autoComplete="current-password"
            className="auth-input"
          />
        </label>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>

        <p className="auth-switch">
          Nie masz konta?{" "}
          <Link to="/register" className="auth-link">
            Zarejestruj się
          </Link>
        </p>
      </form>

      <div className="auth-converter-wrap">
        <MinutesConverter />
      </div>
    </div>
  );
};

export default Login;
