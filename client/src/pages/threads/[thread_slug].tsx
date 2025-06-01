import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import forumApi from '@/features/forum/services/forumApi';
import ThreadCard from '@/components/forum/thread-card';
import PostCard from '@/components/forum/post-card';
import ReplyForm from '@/features/forum/components/ReplyForm';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CornerUpRight, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { BookmarkButton } from '@/components/ui/bookmark-button';
import LikeButton from '@/features/forum/components/LikeButton';
import ShareButton from '@/components/forum/ShareButton';
import { usePostUpdate } from '@/features/forum/hooks/useForumQueries';
import { PostWithUser } from '@db/schema';

const PAGE_SIZE = 20;

export default function ThreadPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { thread_slug } = useParams();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const postUpdateMutation = usePostUpdate();
  const [replyingToPost, setReplyingToPost] = useState<PostWithUser | null>(null);

  // Fetch thread by slug (includes posts/replies)
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: [`/api/threads/${thread_slug}`, { page, limit: PAGE_SIZE }],
    queryFn: () => forumApi.getThread(thread_slug),
    keepPreviousData: true
  });

  // Mark thread as solved mutation
  const solveMutation = useMutation({
    mutationFn: async (postId: number | null = null) => {
      return await forumApi.solveThread(data?.thread?.id, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/threads/${thread_slug}`] });
    }
  });

  // Handle post update
  const handlePostUpdate = async (postId: number, content: string, editorState?: any) => {
    await postUpdateMutation.mutateAsync({ postId, content, editorState });
  };
  
  // Handle reply to specific post
  const handleReplyToPost = (post: PostWithUser) => {
    setReplyingToPost(post);
    
    // Scroll to the reply form
    setTimeout(() => {
      const replyForm = document.getElementById('direct-reply-form');
      if (replyForm) {
        replyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
  
  // Cancel direct reply
  const handleCancelReply = () => {
    setReplyingToPost(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[40vh]"><LoadingSpinner size="lg" /></div>;
  }
  if (isError || !data) {
    return <ErrorDisplay title="Thread not found" description={error?.message || 'This thread does not exist.'} />;
  }

  const { thread, posts, pagination } = data;
  const isOP = user && user.id === thread.user?.id;
  const isAdmin = user && (user.role === 'admin' || user.isAdmin);
  const isMod = user && (user.role === 'mod' || user.isModerator);
  const canSolve = Boolean(isOP || isAdmin || isMod);
  
  // Add a debugging log to help troubleshoot permission issues
  console.debug('Solve permissions:', { isOP, isAdmin, isMod, canSolve, userId: user?.id, threadOwnerId: thread.user?.id });

  const firstPost = posts?.[0];
  const replies = posts?.slice(1) || [];

  // Handler for mark as solved
  const handleMarkSolved = () => {
    if (firstPost && firstPost.id) {
      solveMutation.mutate(firstPost.id);
    }
  };
  
  // Handle reply submission
  const handleSubmitReply = async (content: string, editorState?: any) => {
    try {
      await forumApi.createPost({
        threadId: thread.id,
        content,
        editorState,
        replyToPostId: replyingToPost?.id
      });
      
      // Reset the replying state
      setReplyingToPost(null);
      
      // Refresh the thread data
      queryClient.invalidateQueries({ queryKey: [`/api/threads/${thread_slug}`] });
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6 md:py-8 px-2 md:px-4">
      {/* Thread Header */}
      <div className="mb-4 md:mb-6 flex flex-col gap-2">
        <ThreadCard thread={thread} />
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="flex items-center gap-2">
            <BookmarkButton 
              threadId={thread.id} 
              hasBookmarked={thread.hasBookmarked || false}
              size="md" 
            />
            
            <ShareButton 
              threadId={thread.id} 
              threadTitle={thread.title} 
              variant="button"
              className="bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300"
              size="md"
            />
            
            {thread.isSolved && (
              <Badge className="bg-emerald-700 text-white ml-1"><CheckCircle className="h-4 w-4 mr-1" />Solved</Badge>
            )}
          </div>
          
          {canSolve && !thread.isSolved && (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto mt-1 md:mt-0" 
              onClick={handleMarkSolved}
              disabled={solveMutation.isPending}
            >
              {solveMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Mark as Solved
            </Button>
          )}
        </div>
      </div>

      {/* OP Signature (optional) */}
      {thread.user?.signature && (
        <div className="mb-4 md:mb-6 p-3 bg-zinc-900/60 border-l-4 border-emerald-500 text-zinc-300 rounded">
          <div className="text-xs font-semibold mb-1">Signature</div>
          <div dangerouslySetInnerHTML={{ __html: thread.user.signature }} />
        </div>
      )}

      {/* Replies */}
      <div className="space-y-4 md:space-y-6">
        {/* First post as main post */}
        {firstPost && (
          <PostCard 
            post={firstPost} 
            isFirst
            onUpdate={handlePostUpdate}
            renderActions={() => (
              <div className="flex flex-wrap items-center gap-2">
                <LikeButton 
                  postId={firstPost.id} 
                  hasLiked={firstPost.hasLiked || false}
                  likeCount={firstPost.likeCount}
                  size="md"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleReplyToPost(firstPost)}
                >
                  <CornerUpRight className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            )}
          />
        )}
        
        {/* Replies */}
        {replies.map((reply) => (
          <PostCard 
            key={reply.id} 
            post={reply}
            onUpdate={handlePostUpdate}
            renderActions={() => (
              <div className="flex flex-wrap items-center gap-2">
                <LikeButton 
                  postId={reply.id} 
                  hasLiked={reply.hasLiked || false}
                  likeCount={reply.likeCount}
                  size="md"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleReplyToPost(reply)}
                >
                  <CornerUpRight className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                {canSolve && !thread.isSolved && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-emerald-700 text-emerald-400 hover:bg-emerald-700/20 hover:text-emerald-300 mt-1 md:mt-0"
                    onClick={() => solveMutation.mutate(reply.id)}
                    disabled={solveMutation.isPending}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Mark as Solution
                  </Button>
                )}
              </div>
            )}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="my-6 md:my-8 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Direct Reply Form (when replying to a specific post) */}
      {replyingToPost && (
        <div id="direct-reply-form" className="mt-6">
          <ReplyForm
            threadId={thread.id}
            replyToId={replyingToPost.id}
            replyToPost={replyingToPost}
            onSubmit={handleSubmitReply}
            showRichEditor
            isReplying={true}
            onCancel={handleCancelReply}
            includeQuote={true}
          />
        </div>
      )}

      {/* Main Reply Form */}
      {!replyingToPost && (
        <div className="mt-6 md:mt-10">
          <div className="mb-2 text-sm font-medium flex items-center">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Leave a reply
          </div>
          <ReplyForm
            threadId={thread.id}
            onSubmit={handleSubmitReply}
            showRichEditor
          />
        </div>
      )}
    </div>
  );
} 