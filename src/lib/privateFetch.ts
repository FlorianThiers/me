export async function fetchPrivateJson<T>(path: string): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  const res = await fetch(path, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  const data = (await res.json()) as T;
  return { ok: true, data };
}
