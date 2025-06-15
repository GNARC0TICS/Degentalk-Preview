import React, { useState } from 'react'; // Added useState
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query'; // Added useQuery
import { ForumStructureProvider, useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedZone, MergedForum } from '@/contexts/ForumStructureContext';
import ThreadCard from '@/components/forum/ThreadCard'; // Corrected import for ThreadCard
import { Pagination } from '@/components/ui/pagination'; // Added Pagination
import { getQueryFn } from '@/lib/queryClient'; // Added getQueryFn
import type { ThreadsApiResponse, ApiPagination, ApiThread } from '@/features/forum/components/ThreadList'; // Added ApiThread type from ThreadList

// Placeholder for a proper NotFoundPage component
const NotFoundPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Zone Not Found</h1>
      <p>The zone you are looking for does not exist or could not be found.</p>
      <Link href="/">
        <span style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>Go back to Home</span>
      </Link>
    </div>
  );
};

// Placeholder for Breadcrumbs component
const BreadcrumbsStub: React.FC<{ zoneName?: string }> = ({ zoneName }) => {
  return (
    <div style={{ padding: '10px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', marginBottom: '20px' }}>
      <Link href="/"><span style={{cursor: 'pointer'}}>Home</span></Link>
      {zoneName && (
        <>
          <span> {'>'} </span>
          <span>{zoneName}</span>
        </>
      )}
      {/* Future: Add more levels for forums and threads */}
    </div>
  );
};

const PrimaryZonePage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { getZone, isLoading, error: contextError } = useForumStructure();

  if (typeof slug !== 'string' || slug.trim() === '') {
    return <NotFoundPage />;
  }
  
  const currentZoneSlug = slug;
  
  if (isLoading) {
    return (
      <div>
        <BreadcrumbsStub />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading zone data...</div>
      </div>
    );
  }

  if (contextError) {
    return (
      <div>
        <BreadcrumbsStub />
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          Error loading zone data: {contextError.message}
        </div>
      </div>
    );
  }
  
  const zone: MergedZone | undefined = currentZoneSlug ? getZone(currentZoneSlug) : undefined;

  if (!zone) {
    return (
      <div>
        <BreadcrumbsStub />
        <NotFoundPage />
      </div>
    );
  }

  const theme = zone.theme;
  const [currentPage, setCurrentPage] = useState(1);
  const threadsPerPage = 10; // Or make this configurable

  // API endpoint for fetching threads in a zone
  const ZONE_THREADS_API_BASE_PATH = `/api/zones/${currentZoneSlug}/threads`;

  const zoneThreadsQueryKey = [ZONE_THREADS_API_BASE_PATH, currentPage, threadsPerPage];

  const {
    data: threadsResponse,
    isLoading: isLoadingThreads,
    error: threadsError,
    isPlaceholderData: isThreadsPlaceholderData,
  } = useQuery<ThreadsApiResponse | null, Error>({
    queryKey: zoneThreadsQueryKey,
    queryFn: async () => {
      if (!currentZoneSlug) return null;
      const url = `${ZONE_THREADS_API_BASE_PATH}?page=${currentPage}&limit=${threadsPerPage}&sortBy=latest`;
      const fetcher = getQueryFn<ThreadsApiResponse>({ on401: 'returnNull' });
      try {
        const response = await fetcher({ queryKey: [url], meta: undefined } as any);
        return response;
      } catch (e) {
        console.error(`[ZoneBySlugPage] Error fetching threads for zone ${currentZoneSlug}:`, e);
        throw e;
      }
    },
    enabled: !!currentZoneSlug,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const threads = threadsResponse?.threads || [];
  const threadPagination: ApiPagination = threadsResponse?.pagination || {
    page: 1,
    limit: threadsPerPage,
    totalThreads: 0,
    totalPages: 0,
  };

  return (
    <div>
      <BreadcrumbsStub zoneName={zone.name} />
      {/* Zone Header */}
      {theme?.bannerImage && (
        <img 
          src={theme.bannerImage} 
          alt={`${zone.name} banner`} 
          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} 
        />
      )}
      <div style={{ 
        backgroundColor: theme?.color || '#f0f0f0',
        padding: '20px', 
        color: (theme?.color ? (parseInt(theme.color.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff') : '#000'),
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          {theme?.icon && (
            theme.icon.startsWith('/') || theme.icon.startsWith('http') ? (
              <img 
                src={theme.icon} 
                alt={`${zone.name} icon`} 
                style={{ width: '50px', height: '50px', marginRight: '15px', borderRadius: '8px' }}
              />
            ) : (
              <span style={{ fontSize: '2.5em', marginRight: '15px' }}>{theme.icon}</span>
            )
          )}
          <h1 style={{ margin: 0 }}>{zone.name}</h1>
        </div>
        <p style={{ margin: '5px 0 10px 0' }}>{zone.description || 'No description available.'}</p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Total Threads: {zone.threadCount} | Total Posts: {zone.postCount}</p>
      </div>

      {/* List of Forums */}
      <section style={{ marginTop: '20px', padding: '0 20px' }}>
        <h2 style={{ marginBottom: '15px' }}>Forums in {zone.name}</h2>
        {zone.forums && zone.forums.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {zone.forums.map((forum: MergedForum) => (
              <li key={forum.slug} style={{ border: '1px solid #e0e0e0', marginBottom: '10px', padding: '15px', borderRadius: '5px', backgroundColor: '#fff' }}>
                <Link href={`/forums/${forum.slug}`}>
                  <span style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
                    <h3 style={{ marginTop: 0, color: theme?.color || '#007bff' }}>{forum.name}</h3>
                    {/* forum.description does not exist on MergedForum type */}
                    {/* <p style={{ fontSize: '0.95em', color: '#555' }}>{forum.description || 'No description.'}</p> */}
                    <p style={{ fontSize: '0.85em', color: '#777' }}>Threads: {forum.threadCount} | Posts: {forum.postCount}</p>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No forums found in this zone.</p>
        )}
      </section>

      {/* List of Threads in the Zone */}
      <section style={{ marginTop: '30px', padding: '0 20px' }}>
        <h2 style={{ marginBottom: '15px' }}>Threads in {zone.name}</h2>
        {isLoadingThreads && <div style={{ textAlign: 'center', padding: '20px' }}>Loading threads...</div>}
        {threadsError && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            Error loading threads: {threadsError.message}
          </div>
        )}
        {!isLoadingThreads && !threadsError && threads.length === 0 && (
          <p>No threads found in this zone.</p>
        )}
        {!isLoadingThreads && !threadsError && threads.length > 0 && (
          <>
            {threads.map((thread: ApiThread) => (
              // Assuming ThreadCard needs forumSlug, we might need to adjust if threads can belong to multiple forums in a zone view
              // For now, let's pass the zone slug as a placeholder or consider if ThreadCard can adapt
              <ThreadCard 
                key={thread.id} 
                thread={{
                  ...thread,
                  user: {
                    ...thread.user,
                    role: thread.user.role as "user" | "mod" | "admin" | null, // Cast role
                  },
                  // Ensure all other fields from ApiThread match or are compatible with ThreadCardPropsData
                  // isFeatured is used for ThreadCardPropsData.isFeatured
                  isFeatured: (thread as any).isFeatured, // ApiThread might not have isFeatured, cast if needed
                  // category from ApiThread is ApiThreadCategory, compatible with ThreadCardPropsData.category
                  // prefix from ApiThread is not directly available, ThreadCardPropsData.prefix is optional
                  // tags from ApiThread is ApiTag[], compatible with ThreadCardPropsData.tags (Partial<ThreadTag>[])
                }}
                // forumSlug={thread.category.slug} // This prop is not on ThreadCardComponentProps
              />
            ))}
            {threadPagination.totalThreads > 0 && threadPagination.totalPages > 1 && (
              <div className="mt-5 flex justify-center">
                <Pagination
                  currentPage={threadPagination.page}
                  totalPages={threadPagination.totalPages}
                  onPageChange={(newPage) => {
                    if (!isThreadsPlaceholderData) {
                      setCurrentPage(newPage);
                    }
                  }}
                  showSummary={false}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

const PrimaryZonePageWithProvider: React.FC = () => (
  <ForumStructureProvider>
    <PrimaryZonePage />
  </ForumStructureProvider>
);

export default PrimaryZonePageWithProvider;
