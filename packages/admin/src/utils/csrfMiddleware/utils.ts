import type { NextRequest } from 'next/server';

export type TokenValueFunction = {
  (request: NextRequest): Promise<string>;
};

export function createSecret(length: number): Uint8Array {
  const secret = new Uint8Array(length);
  crypto.getRandomValues(secret);
  return secret;
}

export function utoa(input: Uint8Array): string {
  let output = '';
  for (let i = 0; i < input.byteLength; i++) {
    output += String.fromCharCode(input[i]);
  }
  return btoa(output);
}

export function atou(input: string): Uint8Array {
  input = atob(input);
  const output = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) output[i] = input.charCodeAt(i);
  return output;
}

const CSRF_FORM_KEY = '_csrf';

const csrfFormKeyRegex = new RegExp(`^(\\d+_)*${CSRF_FORM_KEY}$`);

const getTokenValueFromFormData = (
  formData: FormData
): FormDataEntryValue | undefined => {
  for (const [key, value] of [...formData]) {
    if (csrfFormKeyRegex.test(key)) return value;
  }
};

export const getTokenFromRequest = async (
  request: NextRequest,
  csrfHeader: string
): Promise<string> => {
  const token = request.headers.get(csrfHeader);
  if (token !== null) return token;

  // check request body
  const contentType = request.headers.get('content-type') || 'text/plain';

  // url-encoded or multipart/form-data
  if (
    contentType === 'application/x-www-form-urlencoded' ||
    contentType.startsWith('multipart/form-data;')
  ) {
    const formData = await request.formData();
    const formDataVal = getTokenValueFromFormData(formData);
    if (typeof formDataVal === 'string') return formDataVal;
    return '';
  }

  // json-encoded
  if (
    contentType === 'application/json' ||
    contentType === 'application/ld+json'
  ) {
    const json = await request.json();
    const jsonVal = json[CSRF_FORM_KEY];
    if (typeof jsonVal === 'string') return jsonVal;
    return '';
  }

  return await request.text();
};

export const createToken = async (
  secret: Uint8Array,
  saltByteLength: number
): Promise<Uint8Array> => {
  const salt = _createSalt(saltByteLength);
  const hash = await _hash(secret, salt);

  // build token
  const token = new Uint8Array(2 + saltByteLength + hash.byteLength);

  // first byte is hashing algo id (0 for now)
  token[0] = 0;

  // second byte is salt length
  token[1] = saltByteLength;

  // next bytes are salt
  token.set(salt, 2);

  // next bytes are hash
  token.set(hash, saltByteLength + 2);

  return token;
};

export const verifyToken = async (
  token: Uint8Array,
  secret: Uint8Array
): Promise<boolean> => {
  // check byteLength (must be greater than hash length (20) + reserved (2))
  if (token.byteLength < 22) return false;

  // extract salt and hash from token
  const saltByteLength = token[1];
  const salt = token.subarray(2, 2 + saltByteLength);
  const hash = token.subarray(2 + saltByteLength);

  // generate new hash to verify old hash
  const hashCheck = await _hash(secret, salt);

  // check hash length
  if (hash.byteLength !== hashCheck.byteLength) return false;

  // check hash values
  for (let i = 0; i < hash.byteLength; i++) {
    if (hash[i] !== hashCheck[i]) return false;
  }

  return true;
};

export function _createSalt(byteLength: number): Uint8Array {
  const salt = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    salt[i] = Math.floor(Math.random() * 255);
  }
  return salt;
}

export async function _hash(
  secret: Uint8Array,
  salt: Uint8Array
): Promise<Uint8Array> {
  const data = new Uint8Array(secret.byteLength + salt.byteLength);
  data.set(secret);
  data.set(salt, secret.byteLength);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return new Uint8Array(hashBuffer);
}
