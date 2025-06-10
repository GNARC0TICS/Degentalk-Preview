import React from 'react';
import { Link } from 'wouter';
import { AlertTriangle, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header'; // Assuming a shared header

export default function NotFoundPage() {
	return (
		<>
			{/* Optional: Include site header if desired on 404 pages */}
			{/* <SiteHeader /> */}
			<div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black text-white p-8">
				<div className="text-center max-w-md">
					<AlertTriangle className="mx-auto h-20 w-20 text-amber-500 mb-6 animate-pulse" />
					<h1 className="text-6xl font-bold text-zinc-300 mb-4">404</h1>
					<h2 className="text-2xl font-semibold text-white mb-3">Page Not Found</h2>
					<p className="text-zinc-400 mb-8">
						Oops! The page you're looking for doesn't exist, might have been removed, or is
						temporarily unavailable.
					</p>

					<div className="flex justify-center gap-4">
						<Button
							variant="outline"
							className="border-zinc-700 hover:bg-zinc-800"
							onClick={() => window.history.back()} // Go back one step
						>
							Go Back
						</Button>
						<Link href="/">
							<Button className="bg-emerald-700 hover:bg-emerald-600">
								<HomeIcon className="mr-2 h-4 w-4" />
								Go to Homepage
							</Button>
						</Link>
					</div>
				</div>

				{/* Optional Footer or additional links */}
				<footer className="mt-16 text-xs text-zinc-600">
					DegenTalk - {new Date().getFullYear()}
				</footer>
			</div>
		</>
	);
}
