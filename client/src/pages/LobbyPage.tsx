import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGameSession } from '../session/GameSession';

export function LobbyPage() {
  const navigate = useNavigate();
  const { ready, user, state, error, join } = useGameSession();

  useEffect(() => {
    if (ready && !user) {
      navigate('/');
    }
  }, [ready, user, navigate]);

  const waiting = state?.status === 'waiting';

  return (
    <section className="card narrow">
      <p className="eyebrow">Лобби</p>
      <h1>{user ? `Привет, ${user.name}` : 'Лобби'}</h1>
      <p className="lead">
        Первый игрок в очереди играет крестиками и ходит первым. Побеждает тот, кто выиграет три партии.
        Ничья не засчитывается.
      </p>
      {waiting ? <p className="status-line">Ищем соперника…</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <div className="actions">
        <button type="button" className="primary" onClick={join} disabled={!user}>
          {waiting ? 'В очереди' : 'Искать игру'}
        </button>
        <Link className="text-link" to="/leaders">
          Таблица лидеров
        </Link>
      </div>
    </section>
  );
}
