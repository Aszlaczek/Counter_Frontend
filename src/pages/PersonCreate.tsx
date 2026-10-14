import { useNavigate } from 'react-router-dom';
import PersonForm from '../components/PersonForm';
export default function PersonCreate() {
  const navigate = useNavigate();
  return <div className="crud-page"><h1 className="page-title">Dodaj osobę</h1><PersonForm onCreated={() => navigate('/persons')} onCancel={() => navigate('/persons')} /></div>;
}
