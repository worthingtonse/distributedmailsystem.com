const BASE_URL = import.meta.env.VITE_BASE_URL || '';

export function track(event, props = {}) {
  try {
    navigator.sendBeacon(
      `${BASE_URL}/api/track`,
      new Blob([JSON.stringify({ event, props })], { type: 'application/json' })
    );
  } catch {
    // Fire-and-forget — never block the UI
    fetch(`${BASE_URL}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, props }),
      keepalive: true,
    }).catch(() => {});
  }
}
