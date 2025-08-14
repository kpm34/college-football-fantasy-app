// Use Web Crypto API for Edge compatibility
const crypto = globalThis.crypto || require('crypto');

export class RotowireAuth {
  private static algorithm = 'aes-256-gcm';
  
  // Generate a secure encryption key
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  // Encrypt sensitive data
  static encrypt(text: string, key: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }
  
  // Decrypt sensitive data
  static decrypt(encryptedData: string, key: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const keyBuffer = Buffer.from(key, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Get credentials from environment
  static getCredentials() {
    const username = process.env.ROTOWIRE_USERNAME;
    const encryptedPassword = process.env.ROTOWIRE_PASSWORD_ENCRYPTED;
    const key = process.env.ROTOWIRE_ENCRYPTION_KEY;
    
    if (!username || !encryptedPassword || !key) {
      throw new Error('Rotowire credentials not configured');
    }
    
    return {
      username,
      password: this.decrypt(encryptedPassword, key)
    };
  }
}
