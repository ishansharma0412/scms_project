// Backend base URL. Set VITE_API_URL on Vercel; falls back to the local backend in dev.
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Images are full Supabase URLs now; older ones are paths on the backend.
export const imageUrl = (path) => (path?.startsWith('http') ? path : `${API_URL}${path}`);
