// Cryptography utilities for secure reward system
// Note: This uses Web Crypto API for client-side encryption
// Sensitive operations should be handled in Supabase Edge Functions

/**
 * Generate a secure random key for AES encryption
 */
export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
};

/**
 * Convert CryptoKey to exportable format for storage
 */
export const exportKey = async (key: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey("raw", key);
  return Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Import key from hex string
 */
export const importKey = async (keyHex: string): Promise<CryptoKey> => {
  const keyArray = new Uint8Array(
    keyHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  
  return await crypto.subtle.importKey(
    "raw",
    keyArray,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypt sensitive coupon code using AES-GCM
 */
export const encryptCouponCode = async (
  couponCode: string,
  key: CryptoKey
): Promise<{ encryptedData: string; iv: string }> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(couponCode);
  
  // Generate random IV for each encryption
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    data
  );
  
  return {
    encryptedData: Array.from(new Uint8Array(encryptedBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    iv: Array.from(iv)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  };
};

/**
 * Decrypt coupon code
 */
export const decryptCouponCode = async (
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> => {
  const encryptedArray = new Uint8Array(
    encryptedData.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  
  const ivArray = new Uint8Array(
    iv.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivArray
    },
    key,
    encryptedArray
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};

/**
 * Generate cryptographically secure transaction nonce
 * Used to prevent replay attacks
 */
export const generateTransactionNonce = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Create secure transaction hash for integrity verification
 */
export const createTransactionHash = async (
  userId: string,
  amount: number,
  nonce: string,
  timestamp: number
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${userId}:${amount}:${nonce}:${timestamp}`);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Verify transaction hash integrity
 */
export const verifyTransactionHash = async (
  userId: string,
  amount: number,
  nonce: string,
  timestamp: number,
  providedHash: string
): Promise<boolean> => {
  const calculatedHash = await createTransactionHash(userId, amount, nonce, timestamp);
  return calculatedHash === providedHash;
};

/**
 * Secure coupon code generator
 * Generates cryptographically secure random coupon codes
 */
export const generateSecureCouponCode = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array)
    .map(byte => chars[byte % chars.length])
    .join('');
};

/**
 * Rate limiting helper - client side storage
 * For production, implement server-side rate limiting
 */
export const checkRateLimit = (
  operation: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean => {
  const key = `rate_limit_${operation}`;
  const now = Date.now();
  
  const attempts = JSON.parse(localStorage.getItem(key) || '[]') as number[];
  const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (validAttempts.length >= maxAttempts) {
    return false;
  }
  
  validAttempts.push(now);
  localStorage.setItem(key, JSON.stringify(validAttempts));
  return true;
};