import { atou } from './utils';
import { logger } from '../logger';
import { IS_PRODUCTION } from '../constants';

const HOST = process.env.HOST;
const hostDomain = IS_PRODUCTION
  ? 'https://localhost:3000/apply/applicant'
  : HOST;

const fetchSecret = async () => {
  try {
    logger.info('Fetching CSRF secret');
    const response = await fetch(`${hostDomain}/api/csrf`);
    logger.http('response', response);
    const data = await response.json();
    return atou(data.secret);
  } catch (e) {
    // the aws sdk throws a string, not an error...
    if (typeof e === 'string') throw new Error(e);
    throw e;
  }
};

class CsrfSecret {
  private _lastFetch: number;
  // 1 hour
  private _ttl: number = 3600 * 1000;
  private _value: Uint8Array;

  async get() {
    if (!this._value || Date.now() - this._lastFetch >= this._ttl) {
      this._value = await fetchSecret();
      this._lastFetch = Date.now();
    }
    return this._value;
  }
}

export const csrfSecret = new CsrfSecret();
