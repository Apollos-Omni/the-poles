// Secure storage utilities for sensitive data
export class SecureStorage {
  static KEYS = {
    DEVICE_PREFERENCES: 'divine_device_prefs',
    UI_STATE: 'divine_ui_state',
    // Never store: tokens, passwords, PII, device IDs
  };

  static set(key, value) {
    try {
      if (this.isSensitiveKey(key)) {
        console.warn(`Attempted to store sensitive key: ${key}`);
        return false;
      }
      
      const encrypted = this.encrypt(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
      return true;
    } catch (error) {
      console.error('SecureStorage.set failed:', error);
      return false;
    }
  }

  static get(key) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      const decrypted = this.decrypt(stored);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('SecureStorage.get failed:', error);
      return null;
    }
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    Object.values(this.KEYS).forEach(key => {
      this.remove(key);
    });
  }

  // Basic encryption (in production, use proper crypto)
  static encrypt(data) {
    return btoa(data);
  }

  static decrypt(data) {
    return atob(data);
  }

  // Security audit - flag sensitive keys
  static isSensitiveKey(key) {
    const sensitivePatterns = [
      /token/i, /password/i, /secret/i, /key/i, 
      /auth/i, /credential/i, /session/i, /mqtt/i
    ];
    return sensitivePatterns.some(pattern => pattern.test(key));
  }

  // Audit existing localStorage for security issues
  static auditLocalStorage() {
    const issues = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      if (this.isSensitiveKey(key)) {
        issues.push({
          type: 'SENSITIVE_KEY',
          key,
          severity: 'HIGH',
          message: 'Potentially sensitive data in localStorage'
        });
      }
      
      // Check for PII patterns in values
      if (this.containsPII(value)) {
        issues.push({
          type: 'PII_DETECTED',
          key,
          severity: 'CRITICAL',
          message: 'Potential PII detected in storage'
        });
      }
    }
    
    return issues;
  }

  static containsPII(value) {
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/ // Phone
    ];
    return piiPatterns.some(pattern => pattern.test(value));
  }
}