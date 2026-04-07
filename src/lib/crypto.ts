import "server-only";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const keyHex = process.env.VAULT_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY must be set as a 64-char hex string (32 bytes). " +
      "Generate one with: node -e \"const c = require('crypto'); console.log(c.randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(keyHex, "hex");
}

/**
 * Encrypts plaintext with AES-256-GCM.
 * Returns a colon-delimited string: `iv:authTag:ciphertext` (all hex-encoded).
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV — recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 128-bit authentication tag
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a value produced by `encrypt()`.
 * Throws if the data is tampered or the key is wrong.
 */
export function decrypt(encryptedData: string): string {
  const key = getKey();
  const parts = encryptedData.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted data format.");
  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  if (iv.length !== 12) throw new Error("Corrupt encrypted data: invalid IV length.");
  if (authTag.length !== 16) throw new Error("Corrupt encrypted data: invalid auth tag length.");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext).toString("utf8") + decipher.final("utf8");
}
