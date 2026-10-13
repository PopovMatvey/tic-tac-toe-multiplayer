import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Board } from '../components/Board';
import { SeriesPips } from '../components/SeriesPips';
import { Outcome } from '../model/types';
import { useGameSession } from '../session/GameSession';

export function GamePage() {
  const navigate = useNavigate();
  const { ready, user, state, error, join, move } = useGameSession();

  useEffect(() => {
    if (ready && !user) {
      navigate('/');
    }
  }, [ready, user, navigate]);

  if (!state || state.status === 'waiting' || !state.game) {
    return (
      <section className="card narrow">
        <h1>Партия ещё не началась</h1>
        <p className="lead">{state?.status === 'waiting' ? 'Ищем соперника…' : 'Вернитесь в лобби и начните поиск.'}</p>
        <Link className="text-link" to="/lobby">
          В лобби
        </Link>
      </section>
    );
  }

  const yours = state.you !== null && state.game.turn === state.you && state.status === 'active';
  const finished = state.status === 'finished';
  const banner = state.status === 'active' ? outcomeText(state.lastOutcome) : null;

  return (
    <section className="card game-card">
      <div className="score-row">
        <PlayerSide
          title="Крестики"
          name={state.players.X.name}
          wins={state.series.X}
          mark="X"
          active={state.you === 'X'}
          turn={state.game.turn === 'X' && state.status === 'active'}
        />
        <PlayerSide
          title="Нолики"
          name={state.players.O?.name ?? 'Ожидание'}
          wins={state.series.O}
          mark="O"
          active={state.you === 'O'}
          turn={state.game.turn === 'O' && state.status === 'active'}
        />
      </div>
      <p className="turn-line">
        {finished ? 'Матч завершён' : yours ? 'Ваш ход' : 'Ход соперника'}
      </p>
      {banner ? <p className="banner">{banner}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <Board size={state.boardSize} board={state.game.board} canPlay={yours} onMove={move} />
      {finished ? (
        <div className="result">
          <h2>{state.matchWinner === 'X' ? 'Крестики выиграли матч' : 'Нолики выиграли матч'}</h2>
          <p>
            Счёт партий {state.series.X}:{state.series.O}
          </p>
          <button type="button" className="primary" onClick={join}>
            Новая игра
          </button>
        </div>
      ) : null}
    </section>
  );
}

function PlayerSide({
  title,
  name,
  wins,
  mark,
  active,
  turn,
}: {
  title: string;
  name: string;
  wins: number;
  mark: 'X' | 'O';
  active: boolean;
  turn: boolean;
}) {
  return (
    <div className={`side ${active ? 'side-you' : ''} ${turn ? 'side-turn' : ''}`}>
      <span className="side-title">{title}</span>
      <strong>{name}</strong>
      {active ? <span className="you-tag">вы</span> : null}
      <SeriesPips wins={wins} mark={mark} />
    </div>
  );
}

function outcomeText(outcome: Outcome | null): string | null {
  if (outcome === 'x_win') {
    return 'Крестики выиграли партию. Новое поле.';
  }
  if (outcome === 'o_win') {
    return 'Нолики выиграли партию. Новое поле.';
  }
  if (outcome === 'draw') {
    return 'Ничья. Партия не засчитана.';
  }
  return null;
}
