import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, TrendingUp, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '@app/components/ui/card';
import { Container } from '@app/layout/primitives';
import { useForumStructure } from '@app/features/forum/contexts/ForumStructureContext';
import { Button } from '@app/components/ui/button';
import { cn } from '@app/lib/utils';

export default function ForumsIndexPage() {
  const navigate = useNavigate();
  const context = useForumStructure();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'featured' | 'general'>('all');
  
  // Since zones are now top-level forums, use zones as our forums list
  const allForums = context.zones || [];
  const loading = context.isLoading;
  const error = context.error;
  
  console.log('Forums page - allForums:', allForums, 'loading:', loading);

  if (loading) {
    return (
      <Container className="py-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center text-red-500">
          <p>Error loading forums: {error}</p>
        </div>
      </Container>
    );
  }

  // Filter forums based on selection
  const filteredForums = allForums.filter(forum => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'featured') return forum.isFeatured;
    if (selectedCategory === 'general') return !forum.isFeatured;
    return true;
  });

  return (
    <Container className="py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Community Forums</h1>
          <p className="text-muted-foreground">
            Join the conversation in our vibrant community forums
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            size="sm"
          >
            All Forums
          </Button>
          <Button
            variant={selectedCategory === 'featured' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('featured')}
            size="sm"
          >
            <Star className="w-4 h-4 mr-1" />
            Featured
          </Button>
          <Button
            variant={selectedCategory === 'general' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('general')}
            size="sm"
          >
            General
          </Button>
        </div>

        {/* Forums Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredForums.map((forum) => (
            <Card
              key={forum.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                forum.isFeatured && "ring-2 ring-primary/20"
              )}
              onClick={() => navigate(`/forums/${forum.slug}`)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Forum Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {forum.name}
                        {forum.isFeatured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {forum.description || 'Join the discussion'}
                      </p>
                    </div>
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `var(--color-${forum.colorTheme || 'primary'})` }}
                    >
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Forum Stats */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span>{forum.stats?.totalThreads || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{forum.stats?.totalPosts || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span>{forum.stats?.activeUsers || 0}</span>
                    </div>
                  </div>

                  {/* Subforums Preview */}
                  {forum.forums && forum.forums.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        {forum.forums.length} subforum{forum.forums.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {forum.forums.slice(0, 3).map((subforum) => (
                          <span 
                            key={subforum.id}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {subforum.name}
                          </span>
                        ))}
                        {forum.forums.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{forum.forums.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredForums.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No forums found in this category.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}