import React from 'react';
import { HeaderThemeWrapper } from './HeaderThemeWrapper';
import { Logo } from './Logo';
import { PrimaryNav } from './PrimaryNav';
import { SearchBox } from './SearchBox';

export function SiteHeader() {
	return (
		<HeaderThemeWrapper>
			<div className="px-4">
				<div className="flex items-center justify-between h-16">
					{/* Left Section: Logo + Navigation */}
					<div className="flex items-center space-x-4 lg:space-x-6">
						<Logo />
						<PrimaryNav />
					</div>

					{/* Search Box - Center with better responsive sizing */}
					<div className="hidden md:flex flex-1 max-w-sm xl:max-w-md 2xl:max-w-lg mx-4 lg:mx-6">
						<SearchBox />
					</div>

					{/* Static Login/Register Buttons for Desktop */}
					<div className="hidden md:flex items-center space-x-4">
						<button 
							onClick={() => console.log('Login clicked - will show newsletter')}
							className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
						>
							Login
						</button>
						<button 
							onClick={() => console.log('Register clicked - will show newsletter')}
							className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Register
						</button>
					</div>
				</div>
			</div>
		</HeaderThemeWrapper>
	);
}