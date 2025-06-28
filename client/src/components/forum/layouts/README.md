# Forum Layout System

Advanced responsive layout components for building dynamic, mobile-first forum experiences with Magic UI integration.

## Components Overview

### 🏗️ ResponsiveForumLayout

Master layout component that adapts to any screen size with collapsible sidebar and dynamic content areas.

**Key Features:**

- **Auto-collapsing sidebar** on tablet breakpoints
- **Mobile sheet navigation** with swipe gestures
- **Flexible content areas** with header, filters, and main content
- **Layout switching** (grid/list/masonry) with smooth transitions
- **Backdrop blur effects** for modern aesthetics

**Usage:**

```typescript
import { ResponsiveForumLayout } from '@/components/forum/layouts';

<ResponsiveForumLayout
  showNavigation={true}
  showFilters={true}
  layout="list"
  onLayoutChange={(layout) => setLayout(layout)}
  breadcrumbs={<BreadcrumbNav items={breadcrumbItems} />}
  filters={<ThreadFilters />}
  header={<ForumHeader />}
>
  <ThreadList threads={threads} />
</ResponsiveForumLayout>
```

### 🎨 MagicForumBuilder

Visual forum builder with real-time preview and Magic UI integration for dynamic component creation.

**Builder Features:**

- **Real-time preview** with sample data
- **4 tabbed sections**: Layout, Style, Features, Mobile
- **Live configuration** updates
- **Export/Import** settings
- **Animation controls** with speed and type selection
- **Responsive breakpoint** management

**Configuration Options:**

```typescript
interface ForumLayoutConfig {
	layout: 'grid' | 'list' | 'masonry' | 'carousel';
	columns: number;
	spacing: number;
	cardVariant: 'default' | 'compact' | 'featured';
	showEngagement: boolean;
	showReactions: boolean;
	animations: {
		enabled: boolean;
		speed: number;
		type: 'slide' | 'fade' | 'scale' | 'bounce';
	};
	theme: {
		accentColor: string;
		backgroundStyle: 'solid' | 'gradient' | 'blur';
		borderRadius: number;
		shadows: boolean;
	};
	responsive: {
		mobileColumns: number;
		tabletColumns: number;
		breakpoints: { mobile: number; tablet: number; desktop: number };
	};
	filters: {
		enabled: boolean;
		position: 'sidebar' | 'top' | 'floating';
		sticky: boolean;
	};
}
```

**Usage:**

```typescript
import { MagicForumBuilder } from '@/components/forum/layouts';

<MagicForumBuilder
  onSave={(config) => saveLayoutConfig(config)}
  onPreview={(config) => previewLayout(config)}
  onExport={(config) => exportConfig(config)}
  initialConfig={savedConfig}
/>
```

### 📱 AdaptiveForumGrid

High-performance grid system with virtualization, masonry layout, and responsive columns.

**Advanced Features:**

- **Virtual scrolling** for large datasets
- **Masonry layout** with auto-balancing columns
- **Real-time layout switching** with animations
- **Responsive column counts** per breakpoint
- **Staggered animations** for smooth loading
- **Built-in sorting** and filtering controls

**Performance Features:**

- **@tanstack/react-virtual** integration
- **Skeleton loading states** with staggered animations
- **Optimized re-rendering** with React.memo
- **Dynamic column calculation** based on container width

**Usage:**

```typescript
import { AdaptiveForumGrid } from '@/components/forum/layouts';

<AdaptiveForumGrid
  items={threads}
  renderItem={(thread, index) => (
    <EnhancedThreadCard key={thread.id} thread={thread} />
  )}
  layout="auto" // Auto-adjusts based on screen size
  columns={{
    mobile: 1,
    tablet: 2,
    desktop: 3,
    large: 4
  }}
  virtualized={threads.length > 50}
  estimateSize={400}
  onLayoutChange={(layout) => setLayout(layout)}
  sortOptions={[
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' }
  ]}
  onSortChange={(sort) => setSort(sort)}
  currentSort={currentSort}
/>
```

## Responsive Design System

### Breakpoint Strategy

```typescript
const breakpoints = {
	mobile: '(max-width: 767px)', // 0-767px
	tablet: '(min-width: 768px) and (max-width: 1023px)', // 768-1023px
	desktop: '(min-width: 1024px)', // 1024px+
	large: '(min-width: 1280px)', // 1280px+
	xlarge: '(min-width: 1536px)' // 1536px+
};
```

### Adaptive Behavior

- **Mobile (< 768px)**: Single column, full-width navigation drawer, touch gestures
- **Tablet (768-1023px)**: Auto-collapsing sidebar, 2-column grids, sheet navigation
- **Desktop (1024px+)**: Full sidebar, 3+ column grids, hover interactions
- **Large (1280px+)**: Expanded layouts, 4+ columns, enhanced spacing

### Column Configuration

```typescript
const defaultColumns = {
	mobile: 1, // Always single column on mobile
	tablet: 2, // 2 columns work well on tablets
	desktop: 3, // 3 columns for standard desktop
	large: 4 // 4+ columns on large screens
};
```

## Magic UI Integration

### Dynamic Component Generation

The MagicForumBuilder integrates with Magic UI system for dynamic component creation:

```typescript
// Magic UI integration points
const magicIntegration = {
	// Auto-generate components based on configuration
	generateComponent: (config: ForumLayoutConfig) => {
		return Magic.createComponent({
			type: 'ForumLayout',
			props: config,
			children: ['ThreadCard', 'EngagementBar', 'QuickReactions']
		});
	},

	// Export as reusable template
	exportTemplate: (config: ForumLayoutConfig) => {
		return Magic.exportTemplate({
			name: `Forum_${config.layout}_${Date.now()}`,
			config,
			preview: generatePreview(config)
		});
	},

	// Live preview with Magic rendering
	livePreview: (config: ForumLayoutConfig) => {
		return Magic.renderPreview({
			component: 'ResponsiveForumLayout',
			props: config,
			sampleData: generateSampleData()
		});
	}
};
```

### Template System

```typescript
// Pre-built templates for common use cases
const forumTemplates = {
	'crypto-trading': {
		layout: 'grid',
		columns: 3,
		showEngagement: true,
		showReactions: true,
		theme: { accentColor: '#10b981', backgroundStyle: 'gradient' }
	},
	'discussion-heavy': {
		layout: 'list',
		cardVariant: 'featured',
		showEngagement: true,
		animations: { enabled: true, type: 'slide' }
	},
	'mobile-first': {
		layout: 'list',
		responsive: { mobileColumns: 1, tabletColumns: 1 },
		filters: { position: 'floating' }
	}
};
```

## Performance Optimizations

### Virtual Scrolling

For large datasets (>50 items), automatic virtualization:

```typescript
// Automatic virtualization threshold
const VIRTUALIZATION_THRESHOLD = 50;

const shouldVirtualize = items.length > VIRTUALIZATION_THRESHOLD;

<AdaptiveForumGrid
  items={items}
  virtualized={shouldVirtualize}
  estimateSize={calculateEstimatedHeight(cardVariant)}
  renderItem={renderOptimizedItem}
/>
```

### Animation Performance

- **Transform-based animations** for 60fps performance
- **GPU acceleration** with transform3d
- **Reduced motion support** via prefers-reduced-motion
- **Intersection Observer** for scroll-triggered animations

### Bundle Optimization

- **Code splitting** for layout components
- **Dynamic imports** for Magic UI integration
- **Tree shaking** for unused layout features
- **Component lazy loading** for better initial load

## Integration Examples

### Complete Forum Page

```typescript
import {
  ResponsiveForumLayout,
  AdaptiveForumGrid
} from '@/components/forum/layouts';
import {
  EnhancedThreadCard,
  CryptoEngagementBar,
  QuickReactions
} from '@/components/forum/enhanced';

function ForumPage() {
  const [layout, setLayout] = useState<'grid' | 'list' | 'masonry'>('list');
  const [threads, setThreads] = useState([]);

  return (
    <ResponsiveForumLayout
      layout={layout}
      onLayoutChange={setLayout}
      breadcrumbs={<ForumBreadcrumbs />}
      filters={<ThreadFilters />}
      header={<ForumHeader />}
    >
      <AdaptiveForumGrid
        items={threads}
        layout={layout}
        renderItem={(thread) => (
          <div className="space-y-3">
            <EnhancedThreadCard thread={thread} />
            <CryptoEngagementBar engagement={thread.engagement} />
            <QuickReactions reactions={thread.reactions} />
          </div>
        )}
        virtualized={threads.length > 50}
        sortOptions={sortOptions}
        onSortChange={setSort}
      />
    </ResponsiveForumLayout>
  );
}
```

### Magic Builder Integration

```typescript
import { MagicForumBuilder } from '@/components/forum/layouts';

function ForumAdminPage() {
  const [savedConfigs, setSavedConfigs] = useState([]);

  return (
    <div className="h-screen">
      <MagicForumBuilder
        onSave={(config) => {
          setSavedConfigs(prev => [...prev, config]);
          // Auto-sync with Magic UI system
          Magic.saveTemplate(`forum_${Date.now()}`, config);
        }}
        onExport={(config) => {
          // Export as reusable component
          Magic.exportComponent(config);
        }}
        initialConfig={savedConfigs[0]}
      />
    </div>
  );
}
```

## Browser Support

- **Modern browsers** with CSS Grid and Flexbox support
- **Progressive enhancement** for older browsers
- **Intersection Observer API** with polyfill fallback
- **ResizeObserver API** for responsive calculations
- **CSS Custom Properties** for dynamic theming

## TypeScript Support

Full TypeScript coverage with comprehensive type definitions:

```typescript
interface ResponsiveForumLayoutProps {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
	header?: React.ReactNode;
	filters?: React.ReactNode;
	breadcrumbs?: React.ReactNode;
	showNavigation?: boolean;
	showFilters?: boolean;
	layout?: 'grid' | 'list' | 'masonry';
	onLayoutChange?: (layout: 'grid' | 'list' | 'masonry') => void;
	className?: string;
}
```

---

_Built for Degentalk's responsive forum experience with Magic UI integration and performance-first design._
