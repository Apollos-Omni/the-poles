export async function swIsServeable(path = "/functions/sw", timeoutMs = 3000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const r = await fetch(`${path}?v=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: ctrl.signal,
    });
    const ct = (r.headers.get("content-type") || "").toLowerCase();
    const ok = r.ok && ct.startsWith("application/javascript");
    if (!ok) {
        console.warn(`[SW] Health check failed: GET ${path} returned status ${r.status} with content type ${ct}`);
    }
    return ok;
  } catch (e) {
    if (e.name === 'AbortError') {
      console.warn(`[SW] Health check for ${path} timed out after ${timeoutMs}ms.`);
    } else {
      console.warn("[SW] Health check failed with fetch error:", e.message);
    }
    return false;
  } finally {
    clearTimeout(t);
  }
}