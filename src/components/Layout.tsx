import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import ToastViewport from "./ToastViewport";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/persons", label: "Osoby" },
  { to: "/extra-hours", label: "Nadgodziny" },
];

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <NavLink to="/" className="app-brand">
            <span className="app-brand-icon" aria-hidden="true">
              ⏱️
            </span>
            <span className="app-brand-text">Extra Hours Admin</span>
          </NavLink>

          <nav className="app-nav" aria-label="Główna nawigacja">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `app-nav-link${isActive ? " active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-user">
            {user && (
              <div
                className="app-user-info"
                title={`${user.name} ${user.surname}`}
              >
                <span className="app-user-avatar" aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                  {user.surname.charAt(0).toUpperCase()}
                </span>
                <div className="app-user-text">
                  <span className="app-user-name">
                    {user.name} {user.surname}
                  </span>
                  <span className="app-user-username">@{user.username}</span>
                </div>
              </div>
            )}
            <button type="button" className="btn-logout" onClick={handleLogout}>
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </main>

      <ToastViewport />
    </div>
  );
};

export default Layout;
