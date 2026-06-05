import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'node:crypto';

const ALGO = 'aes-256-gcm';

/** Deriva uma chave de 32 bytes a partir do segredo do env (qualquer comprimento). */
function key(): Buffer {
  const secret = process.env.GOOGLE_TOKEN_ENC_KEY;
  if (!secret) {
    throw new Error('GOOGLE_TOKEN_ENC_KEY não configurada');
  }
  return createHash('sha256').update(secret).digest();
}

/** Retorna iv:authTag:ciphertext em base64, separados por ".". */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.');
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Payload cifrado inválido');
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
