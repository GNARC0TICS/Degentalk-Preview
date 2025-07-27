import React from 'react';
import { ContentArea } from '@/components/ui/content-area';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';

export function ContentFeedDemo() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <ContentArea
          title="DegenTalk Content Feed"
          description="A fully-featured, scalable content feed with infinite scroll"
          initialTab="trending"
          showCategory={true}
          variant="default"
          useInfiniteScroll={true}
        />
      </div>
      
      {/* Performance monitor for development */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor itemCount={100} position="bottom-right" />
      )}
    </div>
  );
}

export default ContentFeedDemo;