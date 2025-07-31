# DegenTalk Landing Page

A beautiful, animated landing page for the DegenTalk crypto community platform.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
.
├── client/           # React/Vite frontend
│   ├── src/         # Source code
│   ├── public/      # Static assets
│   └── dist/        # Production build
├── shared/          # Shared types and configs
└── package.json     # Root package configuration
```

## 🎨 Features

- **Animated Hero Section** - Rotating quotes with smooth transitions
- **Announcement Ticker** - Scrolling announcements bar
- **Banner Carousel** - Featured community banners with auto-rotation
- **Fully Responsive** - Mobile-first design
- **Framer Motion Animations** - Smooth, performant animations
- **Static Build** - No backend required

## 🛠️ Tech Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons

## 🏗️ Development

From the root directory:

```bash
# Start dev server (http://localhost:5173)
pnpm dev

# Type checking
cd client && pnpm typecheck

# Build for production
pnpm build
```

## 📦 Deployment

The production build is a static site that can be deployed anywhere:

```bash
# Build the site
pnpm build

# The output is in client/dist/
# Deploy this folder to any static hosting service
```

## 🎯 Components

- **Hero Section** - Eye-catching hero with CTA button
- **Announcement Ticker** - News and updates
- **Banner Cards** - Community showcase cards
- **Site Header** - Navigation and branding
- **Site Footer** - Links and information

## ⚡ Performance

- Optimized bundle size (~440KB gzipped)
- Code splitting for faster loads
- Lazy loading for images
- CSS-in-JS optimization

## 🔧 Configuration

- `client/src/config/` - UI and theme configuration
- `client/tailwind.config.js` - Tailwind customization
- `client/vite.config.ts` - Build configuration

---

Built with ❤️ for the DegenTalk community