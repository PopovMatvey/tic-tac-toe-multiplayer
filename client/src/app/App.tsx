import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { GamePage } from '../pages/GamePage';
import { LeadersPage } from '../pages/LeadersPage';
import { LobbyPage } from '../pages/LobbyPage';
import { RegisterPage } from '../pages/RegisterPage';
import { GameSessionProvider, useGameSession } from '../session/GameSession';

export function App() {
  return (
    <GameSessionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/leaders" element={<LeadersPage />} />
          <Route path="*" element={<Fallback />} />
        </Routes>
      </Layout>
    </GameSessionProvider>
  );
}

function Fallback() {
  const { user } = useGameSession();
  return <Navigate to={user ? '/lobby' : '/'} replace />;
}
