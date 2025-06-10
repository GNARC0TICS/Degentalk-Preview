import XpToastProvider from '@/contexts/XpToastContext';
import LevelUpProvider from '@/contexts/LevelUpContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
				<LevelUpProvider>
					<XpToastProvider>{children}</XpToastProvider>
				</LevelUpProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
