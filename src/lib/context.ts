export function buildContextQuery(domain: string | null | undefined, userId: string | number | null | undefined) {
  const params = new URLSearchParams();
  if (domain) params.set('domain', domain);
  if (userId) params.set('user_id', String(userId));

  const query = params.toString();
  return query ? `?${query}` : '';
}
