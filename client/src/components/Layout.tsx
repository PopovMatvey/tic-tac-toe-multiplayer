import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useGameSession } from '../session/GameSession';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout, state } = useGameSession();
  const gamePath = state?.status === 'active' || state?.status === 'finished' ? '/game' : '/lobby';

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to={user ? '/lobby' : '/'}>
          Крестики-нолики
        </Link>
        <nav className="nav">
          {user ? <Link to={gamePath}>Игра</Link> : null}
          <Link to="/leaders">Лидеры</Link>
        </nav>
        {user ? (
          <div className="who">
            <span>{user.name}</span>
            <button type="button" className="ghost" onClick={logout}>
              Выйти
            </button>
          </div>
        ) : (
          <span className="who-placeholder" />
        )}
      </header>
      <main className="stage">{children}</main>
    </div>
  );
}
