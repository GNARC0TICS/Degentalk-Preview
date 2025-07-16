import { Link } from 'react-router-dom';

interface LogoProps {
	className?: string;
}

export function Logo({ className }: LogoProps) {
	return (
		<Link to="/" className={`flex items-center cursor-pointer ${className || ''}`}>
			<span className="text-xl font-bold text-white">
				Degentalk<sup className="text-xs text-zinc-400 font-normal">™</sup>
			</span>
		</Link>
	);
}
