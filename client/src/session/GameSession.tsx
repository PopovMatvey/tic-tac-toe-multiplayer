import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { getUser, socketUrl } from '../api/http';
import { ClientMatchState, PublicUser } from '../model/types';

interface GameSessionValue {
  ready: boolean;
  user: PublicUser | null;
  state: ClientMatchState | null;
  error: string | null;
  setUser: (user: PublicUser) => void;
  logout: () => void;
  join: () => void;
  move: (cell: number) => void;
  clearError: () => void;
}

const GameSessionContext = createContext<GameSessionValue | null>(null);

export function GameSessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [user, setUserState] = useState<PublicUser | null>(null);
  const [state, setState] = useState<ClientMatchState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      setReady(true);
      return;
    }
    getUser(id)
      .then((found) => setUserState(found))
      .catch(() => localStorage.removeItem('userId'))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    const socket = io(socketUrl(), {
      transports: ['websocket'],
      auth: { userId: user.id },
    });
    socketRef.current = socket;
    socket.on('match.state', (next: ClientMatchState) => {
      setState(next);
      setError(null);
    });
    socket.on('game.error', (payload: { message?: string }) => {
      setError(payload.message ?? 'Ошибка игры');
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (state?.status === 'active' && location.pathname !== '/leaders') {
      navigate('/game');
    }
  }, [state?.status, state?.matchId, location.pathname, navigate]);

  const value = useMemo<GameSessionValue>(
    () => ({
      ready,
      user,
      state,
      error,
      setUser: (next) => {
        localStorage.setItem('userId', next.id);
        setUserState(next);
        setState(null);
        setError(null);
      },
      logout: () => {
        localStorage.removeItem('userId');
        setUserState(null);
        setState(null);
        setError(null);
        navigate('/');
      },
      join: () => {
        setError(null);
        socketRef.current?.emit('queue.join');
      },
      move: (cell: number) => {
        socketRef.current?.emit('game.move', { cell });
      },
      clearError: () => setError(null),
    }),
    [ready, user, state, error, navigate],
  );

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}

export function useGameSession(): GameSessionValue {
  const value = useContext(GameSessionContext);
  if (!value) {
    throw new Error('Сессия игры не подключена');
  }
  return value;
}
