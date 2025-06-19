export function createWidgetQueryKey(
  id: string,
  params: Record<string, unknown> = {}
) {
  // Stringify params to keep the key stable across renders when callers
  // pass inline objects. React-Query treats reference changes as new keys.
  return ['widget', id, JSON.stringify(params)] as const;
}
