// Backend base URL. VITE_API_URL overrides it; production builds (Vercel, Render
// static site) default to the Render backend, local dev to the local backend.
export const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://scms-project-sgg8.onrender.com' : 'http://127.0.0.1:8000');

// Images are full Supabase URLs now; older ones are paths on the backend.
export const imageUrl = (path) => (path?.startsWith('http') ? path : `${API_URL}${path}`);
