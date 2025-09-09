// lib/env.ts
// Environment variables validation and defaults for production

export const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || fallback || '';
};

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Required environment variables with fallbacks for build
export const ENV = {
  DATABASE_URL: getEnvVar('DATABASE_URL', 'mongodb://localhost:27017/defaultdb'),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'fallback_secret_key'),
  RESEND_API_KEY: getEnvVar('RESEND_API_KEY', 're_default_key_for_build'),
  GOOGLE_AI_API_KEY: getEnvVar('GOOGLE_AI_API_KEY', ''),
  NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY: getEnvVar('NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY', ''),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
} as const;

// Check if we're in a build environment
export const isBuild = process.env.NODE_ENV === undefined || process.env.VERCEL_ENV === undefined;

// Validate required environment variables in production
export const validateEnv = () => {
  if (isProduction) {
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = requiredVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};
