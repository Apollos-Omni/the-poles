// Design System Constants - Ship Ready 1.0
export const COLORS = {
  // Primary palette - purple/black/gray/white as per style DNA
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe', 
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6', // Main purple
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065'
  },
  
  // Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  },

  // Status colors
  success: '#10b981',
  warning: '#f59e0b', 
  error: '#ef4444',
  info: '#3b82f6'
};

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'monospace']
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  }
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  divine: '0 0 20px rgb(139 92 246 / 0.3)', // Purple glow
};

export const BORDER_RADIUS = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px  
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px'
};

// App-specific constants
export const APP_CONFIG = {
  name: 'DivineHinge',
  version: '1.0.0',
  
  // Performance targets
  performance: {
    maxBundleSize: '2MB',
    targetLaunchTime: {
      ios: 1800, // 1.8s
      android: 2500 // 2.5s
    }
  },

  // API timeouts
  api: {
    timeout: 10000, // 10s
    retryAttempts: 3,
    retryDelay: 1000 // 1s base delay
  },

  // Feature flags for 1.0 scope lock
  features: {
    divineHinge: true,
    visionBoard: true, 
    agentDashboard: true,
    communityFeed: true,
    // Deferred to 1.1+
    marketplace: false,
    gamification: false,
    advancedAnalytics: false
  }
};

// Integrity layer constants
export const INTEGRITY = {
  sourceBadges: {
    device: { label: 'Device', color: 'blue', icon: 'Cpu' },
    human: { label: 'Human', color: 'green', icon: 'User' },
    imported: { label: 'Imported', color: 'orange', icon: 'Download' },
    system: { label: 'System', color: 'gray', icon: 'Settings' }
  }
};

// Validation rules
export const VALIDATION = {
  password: {
    minLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    requireUppercase: true
  },
  file: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedImages: ['jpg', 'jpeg', 'png', 'webp'],
    allowedVideos: ['mp4', 'webm']
  }
};