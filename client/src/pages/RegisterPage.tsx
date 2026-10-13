import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, registerUser } from '../api/http';
import { useGameSession } from '../session/GameSession';

export function RegisterPage() {
  const navigate = useNavigate();
  const { ready, user, setUser } = useGameSession();
  const [name, setName] = useState('Mattew');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && user) {
      navigate('/lobby');
    }
  }, [ready, user, navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const created = await registerUser(name.trim());
      setUser(created);
      navigate('/lobby');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось зарегистрироваться');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card narrow">
      <p className="eyebrow">Мультиплеер</p>
      <h1>Вход в игру</h1>
      <p className="lead">Имя латиницей, от 2 до 20 символов. Оно должно быть уникальным.</p>
      <form onSubmit={onSubmit} className="stack">
        <label htmlFor="player-name">Имя</label>
        <input
          id="player-name"
          value={name}
          autoComplete="off"
          maxLength={20}
          onChange={(event) => setName(event.target.value)}
          placeholder="Mattew"
        />
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" className="primary" disabled={pending || name.trim().length < 2}>
          {pending ? 'Сохраняем…' : 'Зарегистрироваться'}
        </button>
      </form>
    </section>
  );
}
