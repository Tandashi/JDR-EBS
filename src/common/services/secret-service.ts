import crypto from 'crypto';

export default class SecretService {
  /**
   * Generate a secret.
   *
   * @returns A new generated secret
   */
  public static generateSecret(): string {
    return crypto.randomBytes(24).toString('hex');
  }
}
