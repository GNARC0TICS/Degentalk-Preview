// lib/kv.ts
import { kv } from '@vercel/kv';

// Zero-config client that automatically picks up environment variables:
// - UPSTASH_REDIS_REST_URL
// - UPSTASH_REDIS_REST_TOKEN
// - KV_REST_API_URL (Vercel-KV alias)
// - KV_REST_API_TOKEN (Vercel-KV alias)

export default kv;