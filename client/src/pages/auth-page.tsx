import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteHeader as Header } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Wide } from '@/layout/primitives';

export default function AuthPage() {
	const [activeTab, setActiveTab] = useState<string>('login');
	const { user } = useAuth();
	const [, navigate] = useLocation();

	if (user) {
		navigate('/');
		return null;
	}

	const handleForgotPassword = () => {
		console.log('Forgot password clicked');
	};

	return (
		<div className="flex flex-col min-h-screen">
			<Header />

			<main className="flex-1 my-8">
				<Wide className="px-4">
					<div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
						<div className="space-y-6">
							<div>
								<h1 className="text-3xl font-bold leading-tight text-gray-900">
									Welcome to DegenTalk
								</h1>
								<p className="mt-2 text-base text-gray-600">
									Log in to your account or sign up to join our community
								</p>
							</div>

							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<TabsList className="grid grid-cols-2 w-full">
									<TabsTrigger value="login">Login</TabsTrigger>
									<TabsTrigger value="register">Register</TabsTrigger>
								</TabsList>

								<TabsContent value="login">
									<LoginForm
										onSwitchToRegister={() => setActiveTab('register')}
										onForgotPassword={handleForgotPassword}
									/>
								</TabsContent>

								<TabsContent value="register">
									<RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
								</TabsContent>
							</Tabs>
						</div>

						<div className="bg-primary-50 rounded-lg p-8 flex items-center justify-center">
							<div className="max-w-md text-center">
								<svg
									className="h-16 w-16 text-primary mx-auto mb-4"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
								</svg>
								<h2 className="text-2xl font-bold text-gray-900 mb-4">
									Join the DegenTalk Community
								</h2>
								<p className="text-gray-600 mb-6">
									Connect with others, participate in discussions, and share your knowledge with our
									growing community.
								</p>
								<div className="space-y-4">
									<div className="flex items-center">
										<div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
											<svg
												className="h-5 w-5 text-primary-600"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<div className="ml-3 text-left">
											<h3 className="text-sm font-medium text-gray-900">
												Join meaningful discussions
											</h3>
											<p className="text-xs text-gray-500">Engage with topics that matter to you</p>
										</div>
									</div>
									<div className="flex items-center">
										<div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
											<svg
												className="h-5 w-5 text-primary-600"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<div className="ml-3 text-left">
											<h3 className="text-sm font-medium text-gray-900">Earn clout and rewards</h3>
											<p className="text-xs text-gray-500">
												Get recognized for your valuable contributions
											</p>
										</div>
									</div>
									<div className="flex items-center">
										<div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
											<svg
												className="h-5 w-5 text-primary-600"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<div className="ml-3 text-left">
											<h3 className="text-sm font-medium text-gray-900">
												Customize your experience
											</h3>
											<p className="text-xs text-gray-500">
												Personalize your profile and notification preferences
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Wide>
			</main>

			<SiteFooter />
		</div>
	);
}
