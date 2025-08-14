/**
 * Encryption utilities for sensitive data
 *
 * Environment variables used:
 * - NEXT_PUBLIC_ENCRYPTION_SALT: Salt used for key derivation
 * - NEXT_PUBLIC_ENCRYPTION_KEY_SECRET: Secret key used for encryption
 *
 * SECURITY NOTE: In production, these values should be:
 * 1. Stored in environment variables (not in source code)
 * 2. Unique per environment and sufficiently complex
 * 3. Not prefixed with NEXT_PUBLIC_ if possible (server-side only)
 * 4. Rotated periodically according to security policies
 */
const ENCRYPTION_SALT = process.env.PEPPER || 'default-salt';
const ENCRYPTION_KEY_SECRET = process.env.SECRET_KEY || 'default-key';

// Check if Web Crypto API is available
function isCryptoAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.subtle &&
    typeof window.crypto.subtle.importKey === 'function'
  );
}

// Key derivation function to generate encryption key
async function deriveKey(): Promise<CryptoKey> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available. Ensure you are using HTTPS and a supported browser.');
  }

  // Convert the secret to a buffer
  const encoder = new TextEncoder();
  const secretBuffer = encoder.encode(ENCRYPTION_KEY_SECRET);
  const saltBuffer = encoder.encode(ENCRYPTION_SALT);

  // Import the secret as a key
  const importedKey = await window.crypto.subtle.importKey('raw', secretBuffer, { name: 'PBKDF2' }, false, [
    'deriveKey',
  ]);

  // Derive the actual encryption key
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an object using AES-GCM encryption
 * @param data The data to encrypt
 * @returns The encrypted data as a string
 */
export async function encryptData<T>(data: T): Promise<string> {
  try {
    if (!isCryptoAvailable()) {
      console.warn('Web Crypto API not available, returning unencrypted data');
      return JSON.stringify(data);
    }

    const key = await deriveKey();
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);

    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      dataBuffer
    );

    // Combine the IV and encrypted data and convert to base64
    const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Encryption failed:', error);
    // Return stringified data as fallback
    return JSON.stringify(data);
  }
}

/**
 * Decrypts an encrypted string back to its original object
 * @param encryptedData The encrypted data string
 * @returns The decrypted data object
 */
export async function decryptData<T>(encryptedData: string): Promise<T | null> {
  try {
    if (!isCryptoAvailable()) {
      console.warn('Web Crypto API not available, attempting to parse as JSON');
      try {
        return JSON.parse(encryptedData) as T;
      } catch {
        return null;
      }
    }

    // Validate and sanitize base64 string
    const sanitizedData = encryptedData.replace(/[^A-Za-z0-9+/]/g, '');

    // Add padding if necessary
    const paddedData = sanitizedData + '='.repeat((4 - (sanitizedData.length % 4)) % 4);

    // Convert from base64
    const binaryString = atob(paddedData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Extract the IV and encrypted data
    const iv = bytes.slice(0, 12);
    const encryptedBuffer = bytes.slice(12);

    const key = await deriveKey();

    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedBuffer
    );

    // Convert the decrypted data back to an object
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Decryption failed:', error);
    try {
      // Try parsing as JSON in case it wasn't encrypted
      return JSON.parse(encryptedData) as T;
    } catch {
      return null;
    }
  }
}
