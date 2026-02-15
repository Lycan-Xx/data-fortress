import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { runBreachScan } from '../services/scheduler';
import * as vault from '../services/vault';
import { checkEmailBreachAccount } from '../services/haveibeenpwned';
import { config } from '../config';

export async function scan(req: AuthRequest, res: Response): Promise<void> {
  const { credentialId } = req.body;

  try {
    if (credentialId) {
      // Scan single credential
      const cred = vault.getById(credentialId);
      if (!cred) {
        res.status(404).json({ error: 'Credential not found' });
        return;
      }

      if (!cred.username.includes('@')) {
        vault.updateBreachStatus(cred.id, 'unknown');
        res.json({ id: cred.id, breach_status: 'unknown', message: 'Username is not an email' });
        return;
      }

      const apiKey = config.hibpApiKey;
      if (!apiKey) {
        res.status(500).json({ error: 'HIBP API key not configured' });
        return;
      }

      const result = await checkEmailBreachAccount(cred.username, apiKey);
      const status = result.breached ? 'compromised' : 'safe';
      vault.updateBreachStatus(cred.id, status);

      res.json({
        id: cred.id,
        breach_status: status,
        breaches: result.breaches,
      });
    } else {
      // Scan all credentials
      await runBreachScan();
      const credentials = vault.getAll();
      const results = credentials.map(({ encrypted_password, iv, auth_tag, ...rest }) => rest);
      res.json({ results });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Breach scan failed' });
  }
}
