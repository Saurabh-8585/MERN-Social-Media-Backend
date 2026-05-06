
const isDev = process.env.NODE_ENV === "development";

const defaultApiOrigin = isDev
  ? "http://localhost:5000"
  : "https://snapia-backend.vercel.app";

const defaultSiteOrigin = isDev
  ? "http://localhost:3000"
  : "https://snapia.vercel.app";

const trimSlash = (s) => s.replace(/\/+$/, "");

export const apiOrigin = trimSlash(
  process.env.REACT_APP_API_ORIGIN || defaultApiOrigin
);

export const siteOrigin = trimSlash(
  process.env.REACT_APP_SITE_ORIGIN || defaultSiteOrigin
);

const API = "/api";

export const apiEndpoints = {
  post: `${apiOrigin}${API}/post`,
  auth: `${apiOrigin}${API}/auth`,
  bookmark: `${apiOrigin}${API}/bookmark`,
  user: `${apiOrigin}${API}/user`,
  conversation: `${apiOrigin}${API}/conversation`,
  message: `${apiOrigin}${API}/message`,
};
