import { Link } from '@/lib/router-compat';

interface LogoProps {
	className?: string;
}

export function Logo({ className }: LogoProps) {
	return (
		<Link href="/" className={`flex items-center cursor-pointer ${className || ''}`}>
			<span className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
				Degentalk<sup className="text-[10px] sm:text-xs text-zinc-400 font-normal">™</sup>
			</span>
		</Link>
	);
}
