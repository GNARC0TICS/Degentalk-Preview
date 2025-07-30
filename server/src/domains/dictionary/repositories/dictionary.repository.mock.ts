/**
 * Mock author provider for testing
 */
import type { Author, AuthorProvider } from '../interfaces/author.interface';

export class MockAuthorProvider implements AuthorProvider {
  private authors = new Map<string, Author>([
    ['550e8400-e29b-41d4-a716-446655440000', {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser1',
      avatarUrl: null
    }],
    ['550e8400-e29b-41d4-a716-446655440001', {
      id: '550e8400-e29b-41d4-a716-446655440001',
      username: 'testuser2',
      avatarUrl: 'https://example.com/avatar.jpg'
    }]
  ]);

  async getAuthor(userId: string): Promise<Author | null> {
    return this.authors.get(userId) || null;
  }

  async getAuthors(userIds: string[]): Promise<Map<string, Author>> {
    const result = new Map<string, Author>();
    for (const id of userIds) {
      const author = this.authors.get(id);
      if (author) {
        result.set(id, author);
      }
    }
    return result;
  }
}