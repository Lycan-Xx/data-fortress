import cron from 'node-cron';
import { config } from '../config';
import * as vault from './vault';
import { checkEmailBreachAccount } from './haveibeenpwned';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runBreachScan(): Promise<void> {
  console.log('[Scheduler] Starting breach scan...');

  const credentials = vault.getAll();
  if (credentials.length === 0) {
    console.log('[Scheduler] No credentials to scan');
    return;
  }

  // Extract unique emails (usernames containing @)
  const emailMap = new Map<string, number[]>();
  for (const cred of credentials) {
    if (cred.username.includes('@')) {
      const email = cred.username.toLowerCase().trim();
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email)!.push(cred.id);
    }
  }

  if (emailMap.size === 0) {
    console.log('[Scheduler] No email-based usernames found');
    return;
  }

  const apiKey = config.hibpApiKey;
  if (!apiKey) {
    console.warn('[Scheduler] HIBP_API_KEY not set — skipping breach scan');
    return;
  }

  for (const [email, credentialIds] of emailMap) {
    try {
      const result = await checkEmailBreachAccount(email, apiKey);
      const status = result.breached ? 'compromised' : 'safe';

      for (const id of credentialIds) {
        vault.updateBreachStatus(id, status);
      }

      console.log(`[Scheduler] ${email}: ${status} (${result.breaches.length} breaches)`);
    } catch (err) {
      console.error(`[Scheduler] Failed to check ${email}:`, err);
    }

    // Respect HIBP rate limit: 1 request per 1.5 seconds
    await sleep(1500);
  }

  console.log('[Scheduler] Breach scan complete');
}

export function startScheduler(): void {
  const schedule = config.cronSchedule;

  if (!cron.validate(schedule)) {
    console.error(`[Scheduler] Invalid cron expression: ${schedule}`);
    return;
  }

  cron.schedule(schedule, () => {
    runBreachScan().catch((err) =>
      console.error('[Scheduler] Unhandled error:', err)
    );
  });

  console.log(`[Scheduler] Breach scanner armed — schedule: ${schedule}`);
}

// Export for manual scan trigger
export { runBreachScan };
