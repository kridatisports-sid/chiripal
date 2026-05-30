import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Athletes from './pages/Athletes';
import AthleteDetail from './pages/AthleteDetail';
import Finance from './pages/Finance';
import Stakeholders from './pages/Stakeholders';
import Marketing from './pages/Marketing';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/athletes" element={<Athletes />} />
              <Route path="/athletes/:id" element={<AthleteDetail />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/stakeholders" element={<Stakeholders />} />
              <Route path="/marketing" element={<Marketing />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
