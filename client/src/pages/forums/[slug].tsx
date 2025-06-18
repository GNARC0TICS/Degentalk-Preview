import React from 'react';
import { Link, useParams } from 'wouter';
import { ForumStructureProvider, useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedForum, MergedZone, MergedRules } from '@/contexts/ForumStructureContext';

// Placeholder NotFound component
const NotFoundPage: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>404 - Forum Not Found</h1>
    <Link href="/" style={{ textDecoration: 'underline' }}>Go Home</Link>
  </div>
);

// Stub Breadcrumbs
const BreadcrumbsStub: React.FC<{ zoneName?: string; zoneSlug?: string; forumName?: string }> = ({ zoneName, zoneSlug, forumName }) => (
  <div style={{ padding: '10px 20px', borderBottom: '1px solid #333' }}>
    <Link href="/">Home</Link>
    {zoneName && zoneSlug && <> &gt; <Link href={`/zones/${zoneSlug}`}>{zoneName}</Link></>}
    {forumName && <> &gt; {forumName}</>}
  </div>
);

// ThreadList + ForumListItem are heavy; keep as dynamic imports or stubs for now
import ThreadList from '@/features/forum/components/ThreadList';
import { ForumListItem } from '@/features/forum/components/ForumListItem';

// Simple Create Thread button stub
const CreateThreadButton: React.FC<{ forumSlug: string }> = ({ forumSlug }) => (
  <Link href={`/threads/create?forumId=${forumSlug}`} style={{ padding: '10px 15px', background: '#0a0', color: '#fff', borderRadius: 6 }}>Create Thread</Link>
);

const ForumPageInner: React.FC = () => {
  const params = useParams<{ slug?: string }>();
  const forumSlug = params?.slug;
  const { getForum, getParentZone, isLoading, error } = useForumStructure();

  if (!forumSlug) return <NotFoundPage />;
  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error loading forum</div>;

  const forum = getForum(forumSlug);
  if (!forum) return <NotFoundPage />;

  const parentZone: MergedZone | undefined = getParentZone(forumSlug);
  const displayTheme = { ...parentZone?.theme, ...forum.theme };

  // SEO
  React.useEffect(() => {
    document.title = `${forum.name} | Forums | Degentalk`;
    const desc = forum.description ?? parentZone?.description ?? 'Forum discussions on Degentalk';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, [forum.name, forum.description, parentZone?.description]);

  return (
    <div>
      <BreadcrumbsStub zoneName={parentZone?.name} zoneSlug={parentZone?.slug} forumName={forum.name} />

      {/* Header */}
      <div style={{ background: displayTheme.color ?? '#222', padding: 20, color: '#fff' }}>
        <h1>{forum.name}</h1>
        {forum.description && <p>{forum.description}</p>}
        <p>{forum.threadCount} threads · {forum.postCount} posts</p>
      </div>

      {/* Subforums */}
      {forum.subforums && forum.subforums.length > 0 && (
        <section style={{ padding: 20 }}>
          <h2>Subforums</h2>
          {forum.subforums.map(sf => (
            <ForumListItem key={sf.slug} forum={sf} href={`/forums/${sf.slug}`} />
          ))}
        </section>
      )}

      {/* Threads */}
      <section style={{ padding: 20 }}>
        <h2>Threads</h2>
        {forum.threadCount === 0 ? (
          <p>Nothing here yet.</p>
        ) : (
          <ThreadList forumId={forum.id} forumSlug={forum.slug} />
        )}
        <div style={{ marginTop: 20 }}>
          <CreateThreadButton forumSlug={forum.slug} />
        </div>
      </section>
    </div>
  );
};

const ForumPage: React.FC = () => (
  <ForumStructureProvider>
    <ForumPageInner />
  </ForumStructureProvider>
);

export default ForumPage; 