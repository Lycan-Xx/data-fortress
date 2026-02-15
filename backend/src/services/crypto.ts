import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;  // 96 bits for GCM
const PBKDF2_ITERATIONS = 100_000;
const SALT = 'securevault-static-salt'; // In production, use a per-user random salt

/**
 * Derive a 256-bit key from the master password using PBKDF2
 */
function deriveKey(masterPassword: string): Buffer {
  const passWithPepper = masterPassword + config.encryptionPepper;
  return crypto.pbkdf2Sync(passWithPepper, SALT, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns { ciphertext, iv, authTag } all as hex strings
 */
export function encrypt(
  plaintext: string,
  masterPassword: string
): { ciphertext: string; iv: string; authTag: string } {
  const key = deriveKey(masterPassword);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * All inputs expected as hex strings
 */
export function decrypt(
  ciphertext: string,
  iv: string,
  authTag: string,
  masterPassword: string
): string {
  const key = deriveKey(masterPassword);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
