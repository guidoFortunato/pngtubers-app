export const TWITCH_CONFIG = {
  clientId: process.env.TWITCH_CLIENT_ID || '',
  clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
  redirectUri: 'http://localhost:3000/auth/callback',
  scopes: ['chat:read', 'chat:edit', 'channel:moderate', 'whispers:read', 'whispers:edit']
}
