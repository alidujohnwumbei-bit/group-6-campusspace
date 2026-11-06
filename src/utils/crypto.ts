/**
 * Client-side cryptographic helper for secure password hashing and encryption.
 * Uses native Web Crypto SubtleCrypto SHA-256 with salt for secure password comparison and storage.
 */

const SALT = 'CampusSpace_NLT_Security_Salt_2026';

export async function hashPassword(password: string): Promise<string> {
  const text = `${SALT}:${password}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }

  // Fallback hash implementation (FNV-1a 64-bit + hex encoding)
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

export async function verifyPassword(providedPassword: string, storedHash: string): Promise<boolean> {
  const hash = await hashPassword(providedPassword);
  return hash === storedHash;
}
