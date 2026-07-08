import { getApiUrl } from './api';

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
}

export async function loginAsDemo(): Promise<AuthenticatedUser> {
  const response = await fetch(getApiUrl('/api/demo/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not start demo mode');
  }

  return data;
}
