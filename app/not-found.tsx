import { Metadata } from 'next';
import Link from 'next/link';
import { Home, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Degentalk',
  description: 'The page you are looking for does not exist.',
};

export const dynamic = 'force-dynamic';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-zinc-500" />
          </div>
          
          <h1 className="text-6xl font-bold text-zinc-400 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-zinc-300 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">
            Looks like you've ventured into uncharted territory. The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/faq">
            <Button variant="outline" className="gap-2 border-zinc-700 hover:bg-zinc-800">
              <Search className="w-4 h-4" />
              Browse FAQ
            </Button>
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-zinc-600">
          If you believe this is an error, please{' '}
          <Link href="/contact" className="text-emerald-500 hover:text-emerald-400 underline">
            contact us
          </Link>
        </p>
      </div>
    </div>
  );
}