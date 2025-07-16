import { Link } from 'react-router-dom';
import { Beaker } from 'lucide-react';

export function DevPlaygroundShortcut() {
	if (import.meta.env.MODE !== 'development') return null;

	return (
		<div className="fixed bottom-4 left-4 z-50">
			<Link to="/ui-playground">
				<a
					title="UI Playground"
					className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold shadow-lg hover:shadow-emerald-600/50 transition-colors"
				>
					<Beaker className="h-4 w-4" />
					Playground
				</a>
			</Link>
		</div>
	);
}
