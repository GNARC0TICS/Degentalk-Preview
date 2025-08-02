// Stub for search easter eggs
const responses: Record<string, string> = {
  moon: 'Send it to the moon! 🚀',
  lambo: 'When Lambo? Probably never.',
};

export function getCachedSearchResponse(query: string): string {
  const key = query.toLowerCase();
  return responses[key] || 'No easter egg found.';
}