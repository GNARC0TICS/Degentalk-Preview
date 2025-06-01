import { Link } from 'wouter';
import { MessageSquare } from 'lucide-react';
import { ForumCategory } from '../hooks/useForumStructure';

interface ForumListItemProps {
  forum: ForumCategory;
  href: string;
}

export function ForumListItem({ forum, href }: ForumListItemProps) {
  if (forum.canHaveThreads) {
    return (
      <Link href={href} className="block p-4 hover:bg-black/20 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium mb-1">{forum.name}</h3>
            {forum.description && (
              <p className="text-sm text-zinc-400 mb-2">{forum.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                {forum.threadCount || 0} threads
              </div>
              <div>
                {forum.postCount || 0} posts
              </div>
            </div>
          </div>
          <MessageSquare className="h-5 w-5 text-zinc-600" />
        </div>
      </Link>
    );
  }
  return (
    <div
      className="block p-4 text-zinc-500 opacity-60 cursor-not-allowed"
      aria-label="This is a container and does not support threads."
      title="This is a container and does not support threads."
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium mb-1">{forum.name}</h3>
          {forum.description && (
            <p className="text-sm text-zinc-400 mb-2">{forum.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <div className="flex items-center">
              <MessageSquare className="h-3.5 w-3.5 mr-1 text-zinc-500" />
              {forum.threadCount || 0} threads
            </div>
            <div>
              {forum.postCount || 0} posts
            </div>
          </div>
        </div>
        <MessageSquare className="h-5 w-5 text-zinc-600" />
      </div>
    </div>
  );
} 