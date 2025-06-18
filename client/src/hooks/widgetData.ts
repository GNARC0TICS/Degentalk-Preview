export function createWidgetQueryKey(id: string, params?: Record<string, unknown>) {
  const key: (string | Record<string, unknown>)[] = ['widget', id];
  if (params) {
    key.push(params);
  }
  return key;
}
