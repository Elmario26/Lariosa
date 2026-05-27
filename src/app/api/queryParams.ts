/** Build URLSearchParams, omitting empty strings and default filter values. */
export function buildQueryParams(
  params: Record<string, unknown> = {}
): string {
  const entries: [string, string][] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue;
    if (key === 'type' && String(value) === 'All') continue;
    if (key === 'refresh' || key === 'silent') continue;
    entries.push([key, String(value)]);
  }

  return new URLSearchParams(entries).toString();
}
