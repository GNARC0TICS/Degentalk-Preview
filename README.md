# Next.js Migration - Safe Implementation

This directory contains the Next.js migration setup that preserves ALL existing React components without modification.

## Structure

```
degentalk-landing/
├── package.json              # Next.js dependencies
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript config (Next.js compatible)
├── app/                     # Next.js App Router (minimal wrappers only)
│   ├── layout.tsx          # Root layout wrapper
│   ├── page.tsx            # Home page wrapper
│   ├── contact/
│   │   └── page.tsx        # Contact page wrapper
│   ├── about/
│   │   └── page.tsx        # About page wrapper
│   └── legal/
│       ├── privacy/
│       │   └── page.tsx    # Privacy page wrapper
│       └── terms/
│           └── page.tsx    # Terms page wrapper
├── lib/
│   └── router-compat.tsx   # React Router compatibility layer
└── scripts/
    └── migrate.sh          # Migration script to copy files
```

## Migration Process

1. **Install dependencies**: `npm install`
2. **Copy existing files**: `./scripts/migrate.sh`
3. **Start development**: `npm run dev`
4. **Verify**: Compare with original site side-by-side

## Key Features

- **Zero component changes** - All React components remain untouched
- **Preserved routing** - React Router hooks work via compatibility layer
- **Same styling** - All CSS/Tailwind classes work identically
- **SEO benefits** - Server-side rendering for better search visibility
- **Performance** - Automatic code splitting and optimization

## Deployment

Build for production: `npm run build`
Start production server: `npm start`

## Search Bar Easter Eggs

The landing page search bar includes an intelligent response system that provides humorous, crypto-themed responses to any search query.

### How It Works

The system uses pattern matching to provide contextual responses based on what users type:
- **Crypto terms** (BTC, ETH, pump, moon) → Specific crypto humor
- **Emotions** (broke, rich, rekt) → Relatable trader experiences  
- **Questions** (how, what, when) → Meta-commentary on seeking advice
- **Any other input** → Falls back to generic degen responses

### Adding New Responses

To add or modify search responses, edit `/lib/search-easter-eggs.ts`:

```typescript
// Add a new category
{
  priority: 8,  // Higher = checked first (1-10)
  patterns: [/your-pattern/i, 'exact-match'],
  responses: [
    "Your witty response here...",
    "Alternative response for variety..."
  ]
}
```

### Response Guidelines

1. **Keep it satirical** - Self-aware humor about crypto trading
2. **Be relatable** - Reference common trader experiences
3. **Stay safe** - Avoid anything that could be construed as financial advice
4. **Add variety** - Multiple responses per pattern prevent repetition

### Testing Responses

In development, responses appear in the console. Test with:
- Common crypto terms: "bitcoin", "pump", "moon"
- Emotions: "broke", "lambo", "rekt"
- Questions: "how to trade", "when moon"
- Random text to test fallbacks

### Production Considerations

- Responses are cached for 1 minute to improve performance
- Consider adding toast notifications for better UX
- Monitor which responses users engage with
- Add new categories based on common searches