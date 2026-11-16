const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function api(path, { method = 'GET', body, token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    ...options,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(result.message || `Request failed (${response.status})`);
    err.status = response.status;
    throw err;
  }
  return result;
}

export const readableDate = (date, options = {}) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', ...options,
}).format(new Date(date));

export const readableTime = (date) => new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: true,
}).format(new Date(date));

export const formatDateInput = (value) => {
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};
export const CATEGORIES = ['All', 'Technology', 'Business', 'Music', 'Arts', 'Community', 'Sports'];
