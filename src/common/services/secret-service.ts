import crypto from 'crypto';

export default class SecretService {
  public static generateSecret(): string {
    return crypto.randomBytes(24).toString('hex');
  }
}
