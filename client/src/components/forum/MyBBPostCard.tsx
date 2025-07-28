import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Quote, Edit, Trash, Flag, Award, Shield, Star } from 'lucide-react';
import type { Post } from '@shared/types/post.types';
import { cn } from '@/utils/utils';

interface MyBBPostCardProps {
  post: Post;
  isFirst?: boolean;
  isEditable?: boolean;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onLike?: (postId: string, hasLiked: boolean) => void;
  onQuote?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

export function MyBBPostCard({
  post,
  isFirst = false,
  isEditable = false,
  onEdit,
  onDelete,
  onLike,
  onQuote,
  onReport
}: MyBBPostCardProps) {
  // Parse user stats
  const userLevel = post.user?.forumStats?.level || 1;
  const userPosts = post.user?.forumStats?.totalPosts || 0;
  const userReputation = post.user?.forumStats?.reputation || 0;
  const joinDate = post.user?.joinedAt ? new Date(post.user.joinedAt) : new Date();

  // Get user rank based on post count
  const getUserRank = (postCount: number): string => {
    if (postCount >= 5000) return 'Legendary Member';
    if (postCount >= 2000) return 'Elite Member';
    if (postCount >= 1000) return 'Senior Member';
    if (postCount >= 500) return 'Advanced Member';
    if (postCount >= 100) return 'Active Member';
    if (postCount >= 25) return 'Member';
    return 'New Member';
  };

  return (
    <div className={cn('mybb-post', isFirst && 'mybb-post-first')}>
      <table className="mybb-post-table">
        <tbody>
          <tr>
            {/* User Info Column */}
            <td className="mybb-post-user">
              <div className="mybb-user-info">
                {/* Username */}
                <Link to={`/profile/${post.user?.username}`} className="mybb-username-link">
                  {post.user?.displayName || post.user?.username}
                </Link>

                {/* User Title/Role */}
                <div className="mybb-user-title">
                  {post.user?.isAdmin && (
                    <span className="mybb-badge mybb-badge-admin">
                      <Shield className="w-3 h-3" /> Administrator
                    </span>
                  )}
                  {post.user?.isModerator && !post.user?.isAdmin && (
                    <span className="mybb-badge mybb-badge-mod">
                      <Shield className="w-3 h-3" /> Moderator
                    </span>
                  )}
                  {!post.user?.isAdmin && !post.user?.isModerator && (
                    <span className="mybb-user-rank">{getUserRank(userPosts)}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="mybb-avatar">
                  {post.user?.activeAvatarUrl ? (
                    <img 
                      src={post.user?.activeAvatarUrl} 
                      alt={post.user?.username}
                      className="mybb-avatar-img"
                    />
                  ) : (
                    <div className="mybb-avatar-default">
                      {post.user?.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {post.user?.isOnline && <div className="mybb-online-indicator" />}
                </div>

                {/* User Stats */}
                <div className="mybb-user-stats">
                  <div className="mybb-stat">
                    <span className="mybb-stat-label">Posts:</span>
                    <span className="mybb-stat-value">{userPosts.toLocaleString()}</span>
                  </div>
                  <div className="mybb-stat">
                    <span className="mybb-stat-label">Joined:</span>
                    <span className="mybb-stat-value">
                      {joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="mybb-stat">
                    <span className="mybb-stat-label">Reputation:</span>
                    <span className={cn(
                      'mybb-stat-value',
                      userReputation > 0 && 'text-green-400',
                      userReputation < 0 && 'text-red-400'
                    )}>
                      {userReputation > 0 && '+'}{userReputation}
                    </span>
                  </div>
                </div>

                {/* User Level */}
                <div className="mybb-user-level">
                  <div className="mybb-level-bar">
                    <div 
                      className="mybb-level-fill"
                      style={{ width: `${(userLevel % 10) * 10}%` }}
                    />
                  </div>
                  <div className="mybb-level-text">Level {userLevel}</div>
                </div>
              </div>
            </td>

            {/* Post Content Column */}
            <td className="mybb-post-content">
              {/* Post Header */}
              <div className="mybb-post-header">
                <div className="mybb-post-date">
                  Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
                <div className="mybb-post-number">#{post.postNumber || 1}</div>
              </div>

              {/* Post Body */}
              <div className="mybb-post-body">
                <div 
                  className="mybb-post-text"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Post Footer */}
              <div className="mybb-post-footer">
                {/* Signature */}
                {post.user?.signature && (
                  <div className="mybb-signature">
                    <div className="mybb-signature-divider" />
                    <div className="mybb-signature-content">
                      {post.user?.signature}
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="mybb-post-actions">
                  <button 
                    onClick={() => onQuote?.(post.id)}
                    className="mybb-action-btn"
                  >
                    <Quote className="w-4 h-4" />
                    Quote
                  </button>

                  {isEditable && (
                    <>
                      <button 
                        onClick={() => onEdit?.(post.id)}
                        className="mybb-action-btn"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete?.(post.id)}
                        className="mybb-action-btn mybb-action-danger"
                      >
                        <Trash className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}

                  <button 
                    onClick={() => onReport?.(post.id)}
                    className="mybb-action-btn"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>

                  <button 
                    onClick={() => onLike?.(post.id, post.hasLiked || false)}
                    className={cn(
                      'mybb-action-btn mybb-action-like',
                      post.hasLiked && 'liked'
                    )}
                  >
                    <Heart className="w-4 h-4" />
                    {post.likeCount || 0}
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}