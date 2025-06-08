import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import forumApi from '@/features/forum/services/forumApi';

export default function ForumListingPage() {
  const { forum_slug } = useParams();
  const [forum, setForum] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchForumAndThreads() {
      setLoading(true);
      setError(null);
      try {
        const forumRes = await forumApi.getForumBySlug(forum_slug);
        setForum(forumRes.forum);
        const threadsRes = await forumApi.searchThreads({ categoryId: forumRes.forum.id });
        setThreads(threadsRes.threads || []);
      } catch (err) {
        setError(err.message || 'Error loading forum');
      } finally {
        setLoading(false);
      }
    }
    fetchForumAndThreads();
  }, [forum_slug]);

  if (loading) return <div className="flex justify-center items-center min-h-[40vh]"><LoadingSpinner size="lg" text="Loading forum..." /></div>;
  if (error) return <ErrorDisplay title="Forum Not Found" description={error} />;
  if (!forum) return <ErrorDisplay title="Forum Not Found" description="This forum does not exist." />;

  return (
    <div className="container max-w-3xl mx-auto py-6 md:py-8 px-2 md:px-4">
      <div className="mb-4 flex items-center gap-2">
        <Link href="/forum" className="text-emerald-400 hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Forums
        </Link>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{forum.name}</CardTitle>
          {forum.description && <div className="text-zinc-400 mt-2">{forum.description}</div>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <MessageSquare className="h-4 w-4 mr-1" />
            {forum.threadCount || 0} threads
            <span>•</span>
            {forum.postCount || 0} posts
          </div>
        </CardContent>
      </Card>
      <div>
        <h2 className="text-xl font-semibold mb-4">Threads</h2>
        {threads.length === 0 ? (
          <div className="text-zinc-500">No threads yet. Be the first to post!</div>
        ) : (
          <div className="space-y-4">
            {threads.map(thread => (
              <Card key={thread.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="py-4 px-6 flex flex-col gap-2">
                  <Link href={`/threads/${thread.slug}`} className="text-lg font-bold text-emerald-400 hover:underline">
                    {thread.title}
                  </Link>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span>By {thread.user?.username || 'Unknown'}</span>
                    <span>•</span>
                    <span>{thread.replyCount || 0} replies</span>
                  </div>
                  <div className="text-sm text-zinc-300 line-clamp-2">{thread.content?.replace(/<[^>]+>/g, '').slice(0, 120) || ''}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 