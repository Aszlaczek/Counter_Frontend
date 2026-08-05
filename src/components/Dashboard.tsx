import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, usePersonListStore } from "../store";
import { personService } from "../services/personService";
import Counter from "./Counter";
import Form from "./Form";
import Table from "./Table";
import EditForm from "./EditForm";
import ExtraHours from "./ExtraHours";
import ExtraHoursSummary from "./ExtraHoursSummary";
import "../style/Dashboard.css";

type ActiveTab = "persons" | "extra-hours" | "summary";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setList } = usePersonListStore();
  const [showForm, setShowForm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("persons");
  const fetchPersons = useCallback(async () => {
    try {
      const persons = await personService.getAll();
      setList(persons);
    } catch {
      console.error("Failed to fetch persons");
    }
  }, [setList]);

  useEffect(() => {
    if (activeTab === "persons") {
      fetchPersons();
    }
  }, [activeTab, fetchPersons]);

  const handleToggleForm = () => {
    if (showForm) {
      setIsExiting(true);
      setTimeout(() => {
        setShowForm(false);
        setIsExiting(false);
      }, 300);
    } else {
      setShowForm(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container-main">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Panel administracyjny</h1>
          {user && (
            <p className="dashboard-user">
              Zalogowano jako: <strong>{user.username}</strong>
            </p>
          )}
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Wyloguj się
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        {[
          { key: "persons", label: "Osoby" },
          { key: "extra-hours", label: "Nadgodziny" },
          { key: "summary", label: "Podsumowanie" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`nav-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key as ActiveTab)}
          >
            {tab.label}
          </button>
        ))}
        <button
          className="nav-tab"
          onClick={() => navigate("/add-person")}
          title="Dodaj nową osobę do bazy"
        >
          + Dodaj osobę
        </button>
      </nav>

      {/* Content based on active tab */}
      {activeTab === "persons" && (
        <>
          <Counter />
          <button
            type="button"
            className="btn-open-form"
            onClick={handleToggleForm}
          >
            {showForm ? "Zamknij formularz" : "Pokaż formularz"}
          </button>
          {showForm && (
            <Form
              key="create-form"
              isClosing={isExiting}
              onSuccess={() => {
                setShowForm(false);
                fetchPersons();
              }}
            />
          )}
          <Table onUpdate={fetchPersons} />
          <EditForm onUpdate={fetchPersons} />
        </>
      )}

      {activeTab === "extra-hours" && <ExtraHours />}
      {activeTab === "summary" && <ExtraHoursSummary />}
    </div>
  );
};

export default Dashboard;
