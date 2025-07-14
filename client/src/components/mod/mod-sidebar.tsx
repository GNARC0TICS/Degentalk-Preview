import { Link, useLocation } from 'wouter';
import {
	ShieldCheck,
	Megaphone,
	Users,
	ArrowLeft,
	Flag,
	MessageSquare,
	File,
	Home,
	Activity,
	Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from '@/components/ui/accordion';
import { cn } from '@/utils/utils';

export function ModSidebar() {
	const [location] = useLocation();

	const isActive = (path: string) => {
		return location === path || location.startsWith(path + '/');
	};

	return (
		<aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 space-y-4">
			<div className="mb-8 flex items-center">
				<h2 className="text-lg font-semibold text-white">Moderator Panel</h2>
			</div>

			<div className="mb-4">
				<Link href="/">
					<Button variant="ghost" className="w-full justify-start px-2">
						<ArrowLeft size={18} className="mr-2" />
						<span>Return to Main Site</span>
					</Button>
				</Link>
			</div>

			<Accordion
				type="multiple"
				defaultValue={['overview', 'content', 'community']}
				className="space-y-2"
			>
				<AccordionItem value="overview" className="border rounded-md overflow-hidden">
					<AccordionTrigger className="px-2 py-2 hover:bg-zinc-800 transition-colors">
						<div className="flex items-center">
							<Activity size={18} className="mr-2 text-zinc-400" />
							<span>Overview</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="pb-1">
						<div className="space-y-1 p-1">
							<Link href="/mod">
								<div
									className={`flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 ${isActive('/mod') && !isActive('/mod/activity') ? 'bg-zinc-800 text-primary' : 'text-zinc-300'}`}
								>
									<Home size={16} />
									<span>Dashboard</span>
								</div>
							</Link>
							<Link href="/mod/activity">
								<div
									className={`flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 ${isActive('/mod/activity') ? 'bg-zinc-800 text-primary' : 'text-zinc-300'}`}
								>
									<Activity size={16} />
									<span>Activity Log</span>
								</div>
							</Link>
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="content" className="border rounded-md overflow-hidden">
					<AccordionTrigger className="px-2 py-2 hover:bg-zinc-800 transition-colors">
						<div className="flex items-center">
							<File size={18} className="mr-2 text-zinc-400" />
							<span>Content</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="pb-1">
						<div className="space-y-1 p-1">
							<Link href="/mod/threads">
								<div
									className={`flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 ${isActive('/mod/threads') ? 'bg-zinc-800 text-primary' : 'text-zinc-300'}`}
								>
									<MessageSquare size={16} />
									<span>Threads</span>
								</div>
							</Link>
							<Link href="/mod/reports">
								<div
									className={`flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 ${isActive('/mod/reports') ? 'bg-zinc-800 text-primary' : 'text-zinc-300'}`}
								>
									<Flag size={16} />
									<span>Reports</span>
								</div>
							</Link>
							<Link href="/mod/shoutbox">
								<div
									className={`flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 ${isActive('/mod/shoutbox') ? 'bg-zinc-800 text-primary' : 'text-zinc-300'}`}
								>
									<Megaphone size={16} />
									<span>Shoutbox</span>
								</div>
							</Link>
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="community" className="border rounded-md overflow-hidden">
					<AccordionTrigger className="px-2 py-2 hover:bg-zinc-800 transition-colors">
						<div className="flex items-center">
							<Users size={18} className="mr-2 text-zinc-400" />
							<span>Community</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="pb-1">
						<div className="space-y-1 p-1">
							<Link href="/mod/users">
								<div
									className={`flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 ${isActive('/mod/users') ? 'bg-zinc-800 text-primary' : 'text-zinc-300'}`}
								>
									<Users size={16} />
									<span>Users</span>
								</div>
							</Link>
							<Link href="/mod/announcements">
								<div
									className={`flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 ${isActive('/mod/announcements') ? 'bg-zinc-800 text-primary' : 'text-zinc-300'}`}
								>
									<Megaphone size={16} />
									<span>Announcements</span>
								</div>
							</Link>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<div className="mt-auto pt-4 border-t border-zinc-800">
				<Link href="/mod/settings">
					<div
						className={`flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 ${isActive('/mod/settings') ? 'bg-zinc-800 text-primary' : 'text-zinc-300'}`}
					>
						<Settings size={16} />
						<span>Settings</span>
					</div>
				</Link>
				<div className="text-xs text-zinc-500 mt-4 px-2">Mod Panel v1.0</div>
			</div>
		</aside>
	);
}
