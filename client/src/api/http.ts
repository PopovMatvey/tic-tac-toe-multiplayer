import { PublicUser } from '../model/types';

export function apiBase(): string {
  return import.meta.env.REACT_APP_API_URL ?? '';
}

export function socketUrl(): string | undefined {
  const base = apiBase();
  return base.length > 0 ? base : undefined;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function registerUser(name: string): Promise<PublicUser> {
  return request<PublicUser>('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function getUser(id: string): Promise<PublicUser> {
  return request<PublicUser>(`/api/users/${id}`);
}

export async function getLeaders(): Promise<PublicUser[]> {
  return request<PublicUser[]>('/api/leaders');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new ApiError(await readError(response));
  }
  return (await response.json()) as T;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    return 'Запрос не выполнен';
  }
  return 'Запрос не выполнен';
}
