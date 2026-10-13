import { useEffect, useState } from 'react';
import { ApiError, getLeaders } from '../api/http';
import { PublicUser } from '../model/types';

export function LeadersPage() {
  const [leaders, setLeaders] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeaders()
      .then(setLeaders)
      .catch((caught: unknown) => {
        setError(caught instanceof ApiError ? caught.message : 'Не удалось загрузить таблицу');
      });
  }, []);

  return (
    <section className="card wide">
      <p className="eyebrow">Статистика</p>
      <h1>Лидеры</h1>
      <p className="lead">Победа в матче — три выигранные партии. Список по убыванию побед.</p>
      {error ? <p className="error">{error}</p> : null}
      {leaders.length === 0 && !error ? <p className="status-line">Пока нет игроков.</p> : null}
      {leaders.length > 0 ? (
        <table className="leaders">
          <thead>
            <tr>
              <th>Место</th>
              <th>Игрок</th>
              <th>Победы</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
