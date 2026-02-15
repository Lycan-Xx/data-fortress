// Mock data for frontend preview when backend is unavailable

export interface Credential {
  id: number;
  site_name: string;
  site_url: string;
  username: string;
  breach_status: 'safe' | 'compromised' | 'unknown';
  last_scanned: string | null;
  created_at: string;
  updated_at: string;
}

export const mockCredentials: Credential[] = [
  {
    id: 1,
    site_name: 'GitHub',
    site_url: 'https://github.com',
    username: 'dev@example.com',
    breach_status: 'safe',
    last_scanned: '2026-02-15T10:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 2,
    site_name: 'LinkedIn',
    site_url: 'https://linkedin.com',
    username: 'user@example.com',
    breach_status: 'compromised',
    last_scanned: '2026-02-15T10:00:00Z',
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 3,
    site_name: 'Twitter',
    site_url: 'https://twitter.com',
    username: 'myhandle',
    breach_status: 'unknown',
    last_scanned: null,
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
];

let nextId = 4;
let credentials = [...mockCredentials];

export const getMockCredentials = () => [...credentials];

export const addMockCredential = (data: {
  site_name: string;
  site_url: string;
  username: string;
  password: string;
}): Credential => {
  const now = new Date().toISOString();
  const cred: Credential = {
    id: nextId++,
    site_name: data.site_name,
    site_url: data.site_url,
    username: data.username,
    breach_status: 'unknown',
    last_scanned: null,
    created_at: now,
    updated_at: now,
  };
  credentials.push(cred);
  return cred;
};

export const updateMockCredential = (
  id: number,
  data: Partial<{ site_name: string; site_url: string; username: string; password: string }>
): Credential | null => {
  const idx = credentials.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  credentials[idx] = {
    ...credentials[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return credentials[idx];
};

export const deleteMockCredential = (id: number): boolean => {
  const len = credentials.length;
  credentials = credentials.filter((c) => c.id !== id);
  return credentials.length < len;
};

export const mockScanBreaches = (): Credential[] => {
  credentials = credentials.map((c) => ({
    ...c,
    breach_status: c.username.includes('@')
      ? Math.random() > 0.5
        ? 'safe'
        : 'compromised'
      : 'unknown',
    last_scanned: new Date().toISOString(),
  }));
  return [...credentials];
};
