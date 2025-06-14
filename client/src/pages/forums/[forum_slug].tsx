import React from 'react';
import { Link, useParams } from 'wouter';
import { ForumStructureProvider, useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedForum, MergedZone } from '@/contexts/ForumStructureContext';
import type { ForumRules } from '@/config/forumMap.config';

// Placeholder for a proper NotFoundPage component
const NotFoundPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Forum Not Found</h1>
      <p>The forum you are looking for does not exist or could not be found.</p>
      <Link href="/" style={{ color: '#007bff', textDecoration: 'underline' }}>
        Go back to Home
      </Link>
    </div>
  );
};

// Placeholder for Breadcrumbs component
const BreadcrumbsStub: React.FC<{ zoneName?: string; zoneSlug?: string; forumName?: string }> = ({ zoneName, zoneSlug, forumName }) => {
  return (
    <div style={{ padding: '10px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', marginBottom: '20px' }}>
      <Link href="/">Home</Link>
      {zoneName && zoneSlug && (
        <>
          <span> {'>'} </span>
          <Link href={`/zones/${zoneSlug}`}>{zoneName}</Link>
        </>
      )}
      {forumName && (
        <>
          <span> {'>'} </span>
          <span>{forumName}</span>
        </>
      )}
      {/* Future: Add more levels for threads */}
    </div>
  );
};

// Importing the actual ThreadList component
import ThreadList from '@/features/forum/components/ThreadList';

// Placeholder for CreateThreadButton component
const CreateThreadButtonStub: React.FC<{ forumSlugOrId: string }> = ({ forumSlugOrId }) => {
  // TODO: Implement actual CreateThreadButton
  // Link to /threads/create?forumId={forumSlugOrId}
  return (
    <Link 
      href={`/threads/create?forumId=${forumSlugOrId}`}
      style={{
        display: 'inline-block',
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        marginTop: '20px'
      }}
    >
      Create New Thread (Placeholder)
    </Link>
  );
};

const ForumPage: React.FC = () => {
  console.log('[ForumPage] Component mounted.');
  const params = useParams<{ slug?: string }>(); // Changed to slug
  const forum_slug = params?.slug; // Changed to params?.slug
  console.log(`[ForumPage] forum_slug from useParams (now 'slug'): '${forum_slug}'`); // Updated log message
  const { getForum, getZone, zones, isLoading, error: contextError } = useForumStructure();
  console.log(`[ForumPage] From useForumStructure - isLoading: ${isLoading}, contextError:`, contextError);

  // Strict slug validation
  if (typeof forum_slug !== 'string' || forum_slug.trim() === '') {
    console.log(`[ForumPage] Invalid forum_slug ('${forum_slug}'). Rendering NotFoundPage.`);
    return <NotFoundPage />;
  }
  
  // const currentForumSlug = typeof forum_slug === 'string' ? forum_slug : undefined; // forum_slug is now directly used
  
  if (isLoading) { // isLoading from context is the primary loading state
    console.log(`[ForumPage] isLoading is true. Rendering loading state.`);
    return (
      <div>
        <BreadcrumbsStub />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading forum data...</div>
      </div>
    );
  }

  if (contextError) {
    console.log(`[ForumPage] contextError is present. Rendering error state:`, contextError.message);
    return (
      <div>
        <BreadcrumbsStub />
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          Error loading forum data: {contextError.message}
        </div>
      </div>
    );
  }
  
  const forum: MergedForum | undefined = getForum(forum_slug); // Use forum_slug directly
  console.log(`[ForumPage] Attempting to get forum for slug: '${forum_slug}'. Found:`, forum ? forum.name : 'NOT FOUND', 'isLoading:', isLoading, 'contextError:', contextError);

  if (!forum) {
    console.log(`[ForumPage] Forum with slug '${forum_slug}' not found in context. Rendering NotFoundPage.`);
    return (
      <div>
        <BreadcrumbsStub />
        <NotFoundPage />
      </div>
    );
  }

  // Find parent zone for breadcrumbs
  let parentZone: MergedZone | undefined;
  if (zones && forum_slug) { // Use forum_slug here
    for (const zone of zones) {
      if (zone.forums.some(f => f.slug === forum_slug)) { // Use forum_slug here
        parentZone = zone;
        break;
      }
    }
  }
  
  // Use zone's theme or forum's themeOverride if available
  const zoneTheme = parentZone?.theme;
  const forumThemeOverride = forum.themeOverride;
  const displayTheme = { ...zoneTheme, ...forumThemeOverride };

  const renderRules = (rules: ForumRules) => {
    return (
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
        {Object.entries(rules).map(([key, value]) => {
          if (value === undefined) return null;
          let displayValue = '';
          if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
          } else if (Array.isArray(value)) {
            displayValue = value.join(', ');
          } else if (typeof value === 'object' && value !== null) {
            displayValue = JSON.stringify(value); // Simple display for nested objects like prefixGrantRules
          } else {
            displayValue = String(value);
          }
          return <li key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {displayValue}</li>;
        })}
      </ul>
    );
  };

  console.log(`[ForumPage] Rendering ThreadList with forumId: ${forum?.id} and forumSlug: ${forum?.slug}`);
  return (
    <div>
      <BreadcrumbsStub zoneName={parentZone?.name} zoneSlug={parentZone?.slug} forumName={forum.name} />
      
      {/* Forum Header */}
      {displayTheme?.bannerImage && (
        <img 
          src={displayTheme.bannerImage} 
          alt={`${forum.name} banner`} 
          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} 
        />
      )}
      <div style={{ 
        backgroundColor: displayTheme?.color || '#f0f0f0',
        padding: '20px', 
        color: (displayTheme?.color ? (parseInt(displayTheme.color.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff') : '#000'),
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          {displayTheme?.icon && (
            displayTheme.icon.startsWith('/') || displayTheme.icon.startsWith('http') ? (
              <img 
                src={displayTheme.icon} 
                alt={`${forum.name} icon`} 
                style={{ width: '50px', height: '50px', marginRight: '15px', borderRadius: '8px' }}
              />
            ) : (
              <span style={{ fontSize: '2.5em', marginRight: '15px' }}>{displayTheme.icon}</span>
            )
          )}
          <h1 style={{ margin: 0 }}>{forum.name}</h1>
        </div>
        {/* Forum description is not directly available on MergedForum. 
            It might be part of zone.description or a new field in Forum type.
            For now, omitting. A general description could be: "Threads and discussions for {forum.name}." 
        */}
        {/* <p style={{ margin: '5px 0 10px 0' }}>{forum.description || 'Welcome to ' + forum.name}</p> */}
        <p style={{ margin: 0, fontSize: '0.9em' }}>Total Threads: {forum.threadCount} | Total Posts: {forum.postCount}</p>
      </div>

      {/* Forum Rules */}
      <section style={{ marginTop: '20px', padding: '0 20px' }}>
        <h2 style={{ marginBottom: '10px' }}>Forum Rules</h2>
        {forum.rules ? renderRules(forum.rules) : <p>No specific rules defined for this forum.</p>}
      </section>

      {/* Create Thread Button */}
      <section style={{ marginTop: '20px', padding: '0 20px' }}>
        <CreateThreadButtonStub forumSlugOrId={forum.slug} />
      </section>

      {/* Thread List */}
      <section style={{ marginTop: '20px', padding: '0 20px 20px 20px' }}>
        <ThreadList forumId={forum.id} forumSlug={forum.slug} />
      </section>
    </div>
  );
};

const ForumPageWithProvider: React.FC = () => (
  <ForumStructureProvider>
    <ForumPage />
  </ForumStructureProvider>
);

export default ForumPageWithProvider;
