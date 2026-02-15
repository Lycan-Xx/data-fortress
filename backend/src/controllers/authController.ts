import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDB } from '../db/schema';
import { config } from '../config';

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRY = '1h';

interface MasterConfig {
  id: number;
  password_hash: string;
  created_at: string;
}

export async function getStatus(req: Request, res: Response): Promise<void> {
  const db = getDB();
  const row = db.prepare('SELECT * FROM master_config WHERE id = 1').get() as MasterConfig | undefined;
  res.json({ isConfigured: !!row });
}

export async function setup(req: Request, res: Response): Promise<void> {
  const { masterPassword } = req.body;

  if (!masterPassword || typeof masterPassword !== 'string' || masterPassword.length < 8) {
    res.status(400).json({ error: 'Master password must be at least 8 characters' });
    return;
  }

  const db = getDB();
  const existing = db.prepare('SELECT * FROM master_config WHERE id = 1').get();

  if (existing) {
    res.status(409).json({ error: 'Master password already configured. Use login instead.' });
    return;
  }

  const hash = await bcrypt.hash(masterPassword, BCRYPT_ROUNDS);
  db.prepare('INSERT INTO master_config (id, password_hash) VALUES (1, ?)').run(hash);

  const token = jwt.sign(
    { masterPassword },
    config.jwtSecret,
    { expiresIn: JWT_EXPIRY }
  );

  res.status(201).json({ token, message: 'Vault initialized successfully' });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { masterPassword } = req.body;

  if (!masterPassword || typeof masterPassword !== 'string') {
    res.status(400).json({ error: 'Master password is required' });
    return;
  }

  const db = getDB();
  const row = db.prepare('SELECT * FROM master_config WHERE id = 1').get() as MasterConfig | undefined;

  if (!row) {
    res.status(404).json({ error: 'No master password configured. Use setup first.' });
    return;
  }

  const valid = await bcrypt.compare(masterPassword, row.password_hash);

  if (!valid) {
    res.status(401).json({ error: 'Invalid master password' });
    return;
  }

  const token = jwt.sign(
    { masterPassword },
    config.jwtSecret,
    { expiresIn: JWT_EXPIRY }
  );

  res.json({ token, message: 'Vault unlocked' });
}
