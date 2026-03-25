import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const TAG_LENGTH = 16;
const SECRET = process.env.ENCRYPTION_SECRET;

/**
 * Encrypts a string using AES-256-GCM.
 * @param text The string to encrypt.
 * @returns An encrypted string in the format: iv:authTag:encryptedText
 */
export function encrypt(text: string): string {
  if (!text) return '';
  if (!SECRET) {
    console.warn('ENCRYPTION_SECRET not set. Returning plain text.');
    return text;
  }

  // Ensure secret is 32 bytes
  const key = crypto.scryptSync(SECRET, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string previously encrypted with encrypt().
 * @param hash The format: iv:authTag:encryptedText
 * @returns The original string, or the input if it's not a valid format.
 */
export function decrypt(hash: string): string {
  if (!hash || !hash.includes(':')) return hash;
  if (!SECRET) return hash;

  try {
    const [ivHex, authTagHex, encryptedHex] = hash.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) return hash;

    const key = crypto.scryptSync(SECRET, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex' as any, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return hash; // Return original if decryption fails (might be unencrypted old value)
  }
}
