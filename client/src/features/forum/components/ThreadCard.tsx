import React from 'react';
import Link from 'next/link';
// Import ApiThread and ApiTag types from ThreadList.tsx or a shared types file
import type { ApiThread, ApiTag } from './ThreadList'; 

interface ThreadCardProps {
  thread: ApiThread; // Use the ApiThread type
  forumSlug: string;
  parentForumTheme?: string | null;
  tippingEnabled?: boolean;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, forumSlug, parentForumTheme, tippingEnabled }) => {
  const threadLink = `/threads/${thread.slug}`;

  // Helper to format date strings (optional, can be more sophisticated)
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  return (
    <div style={{ border: '1px solid #e0e0e0', marginBottom: '10px', padding: '15px', borderRadius: '5px', backgroundColor: '#fff' }}>
      <Link href={threadLink}>
        <a style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <h4 style={{ marginTop: 0, marginBottom: '5px', color: '#007bff' }}>{thread.title}</h4>
          <p style={{ fontSize: '0.85em', color: '#555', margin: '0 0 5px 0' }}>
            Started by: {thread.user?.username || 'Unknown Author'}
            {thread.user?.activeAvatarUrl && (
              <img 
                src={thread.user.activeAvatarUrl} 
                alt={`${thread.user.username}'s avatar`} 
                style={{ width: '20px', height: '20px', borderRadius: '50%', marginLeft: '5px', verticalAlign: 'middle' }} 
              />
            )}
          </p>
          <div style={{ fontSize: '0.8em', color: '#777', marginBottom: '5px' }}>
            <span>Replies: {thread.postCount === undefined ? 'N/A' : thread.postCount -1 }</span> {/* Assuming postCount includes the first post */}
            <span style={{ marginLeft: '10px' }}>Views: {thread.viewCount === undefined ? 'N/A' : thread.viewCount}</span>
            {thread.lastPostAt && <span style={{ marginLeft: '10px' }}>Last Post: {formatDate(thread.lastPostAt)}</span>}
          </div>
          {thread.tags && thread.tags.length > 0 && (
            <div style={{ fontSize: '0.75em', marginTop: '5px' }}>
              Tags: {thread.tags.map((tag: ApiTag) => (
                <span key={tag.id} style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '3px', marginRight: '5px' }}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </a>
      </Link>
    </div>
  );
};

export default ThreadCard;
