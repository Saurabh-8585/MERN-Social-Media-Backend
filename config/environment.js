require('dotenv').config();

const trimSlash = (s) => String(s || '').replace(/\/+$/, '');

const isDev = process.env.NODE_ENV !== 'production';

const defaultFrontendUrl = isDev
  ? 'http://localhost:3000'
  : 'https://snapia.vercel.app';

const defaultBackendUrl = isDev
  ? 'http://localhost:5000'
  : 'https://snapia-backend.vercel.app';

const frontendUrl = trimSlash(process.env.FRONTEND_URL || defaultFrontendUrl);
const backendUrl = trimSlash(process.env.BACKEND_URL || defaultBackendUrl);

const corsOrigins = [frontendUrl, backendUrl];

/** CORS / Socket.IO + OAuth-related origins */
const allowedOrigins = [
  ...corsOrigins,
  'https://accounts.google.com',
  'https://oauth2.googleapis.com',
];

module.exports = {
  isDev,
  frontendUrl,
  backendUrl,
  corsOrigins,
  allowedOrigins,
};
