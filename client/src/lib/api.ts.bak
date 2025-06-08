/**
 * Healthcheck endpoint to verify backend readiness
 */
export async function getApiStatus() {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('API not ready');
  return res.json();
} 