import { createHash } from 'crypto';

export function hash(value) {
  const hash = createHash('sha512');
  hash.update(value);
  return hash.digest('base64');
}
