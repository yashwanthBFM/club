export const env = {
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4200',
  },
  auth: {
    tokenKey: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token',
  },
} as const; 