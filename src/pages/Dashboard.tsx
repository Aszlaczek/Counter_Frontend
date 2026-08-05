import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { personService } from "../services/personService";
import { extraHoursService } from "../services/extraHoursService";
import { useAuthStore } from "../store";
import type { PersonDetailResponse } from "../type";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import MinutesConverter from "../components/MinutesConverter";
import PersonsTable from "../components/PersonsTable";

type DashboardStats = {
  persons: number;
  records: number;
  totalHours: number;
};

type PersonWithHours = {
  id: number;
  name: string;
  surname: string;
  faculty: string;
  is_working: boolean;
  total_extra_hours: number;
  extra_hours_count: number;
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    persons: 0,
    records: 0,
    totalHours: 0,
  });
  const [personsWithHours, setPersonsWithHours] = useState<PersonWithHours[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [persons, records] = await Promise.all([
          personService.getAll({ limit: 500 }),
          extraHoursService.getAll({ limit: 500 }),
        ]);

        // Fetch details (with summary) for each person to compute hours.
        const details: PersonDetailResponse[] = await Promise.all(
          persons.map((p) => personService.getById(p.id)),
        );

        const totalHours = details.reduce(
          (sum, d) => sum + (d.total_extra_hours || 0),
          0,
        );

        setStats({
          persons: persons.length,
          records: records.length,
          totalHours: Math.round(totalHours * 100) / 100,
        });

        const withHours: PersonWithHours[] = details.map((d) => ({
          id: d.id,
          name: d.name,
          surname: d.surname,
          faculty: d.faculty,
          is_working: d.is_working,
          total_extra_hours: d.total_extra_hours ?? 0,
          extra_hours_count: d.extra_hours_count ?? 0,
        }));

        withHours.sort((a, b) => b.total_extra_hours - a.total_extra_hours);
        setPersonsWithHours(withHours);
      } catch {
        // handled by interceptor; leave empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <Spinner label="Ładowanie danych..." full />;
  }

  const statCards = [
    { label: "Osoby", value: stats.persons, icon: "👥" },
    { label: "Rekordy nadgodzin", value: stats.records, icon: "📋" },
    { label: "Łączne godziny", value: `${stats.totalHours} h`, icon: "⏱️" },
  ];

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Witaj, {user?.name} {user?.surname}! Oto przegląd nadgodzin.
          </p>
        </div>
        <Link to="/extra-hours/new" className="btn-primary">
          + Dodaj nadgodziny
        </Link>
      </header>

      <section className="dashboard-section converter-section">
        <div className="section-header">
          <h2 className="section-title">Przelicznik czasu</h2>
        </div>
        <div className="converter-center">
          <MinutesConverter />
        </div>
      </section>

      <section className="stat-grid" aria-label="Statystyki">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <span className="stat-icon" aria-hidden="true">
              {card.icon}
            </span>
            <div>
              <p className="stat-value">{card.value}</p>
              <p className="stat-label">{card.label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Nadgodziny osób</h2>
          <Link to="/persons" className="link-muted">
            Zobacz wszystkie →
          </Link>
        </div>

        {personsWithHours.length === 0 ? (
          <EmptyState
            title="Brak osób"
            message="Dodaj pierwszą osobę, aby zacząć śledzić nadgodziny."
            action={
              <Link to="/persons/new" className="btn-primary">
                + Dodaj osobę
              </Link>
            }
          />
        ) : (
          <PersonsTable rows={personsWithHours} />
        )}
      </section>
    </div>
  );
};

export default Dashboard;
