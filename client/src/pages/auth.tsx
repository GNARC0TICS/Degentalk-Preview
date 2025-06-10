import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

// Login schema
const loginSchema = z.object({
	username: z.string().min(3, {
		message: 'Username must be at least 3 characters'
	}),
	password: z.string().min(6, {
		message: 'Password must be at least 6 characters'
	})
});

// Registration schema
const registerSchema = z
	.object({
		username: z.string().min(3, {
			message: 'Username must be at least 3 characters'
		}),
		email: z.string().email({
			message: 'Please enter a valid email address'
		}),
		password: z.string().min(6, {
			message: 'Password must be at least 6 characters'
		}),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export default function AuthPage() {
	const [activeTab, setActiveTab] = useState<string>('login');
	const [location, navigate] = useLocation();
	const { user, isLoading, loginMutation, registerMutation } = useAuth();

	// Login form
	const loginForm = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: '',
			password: ''
		}
	});

	// Register form
	const registerForm = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: ''
		}
	});

	// Handle login submission
	const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
		loginMutation.mutate(values);
	};

	// Handle register submission
	const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
		registerMutation.mutate(values);
	};

	// Redirect if user is already logged in
	if (user && !isLoading) {
		return <Redirect to="/" />;
	}

<<<<<<< HEAD
	return (
		<div className="min-h-screen bg-[url('/images/auth-bg.jpg')] bg-cover bg-center">
			<div className="min-h-screen flex justify-center items-center backdrop-blur-sm backdrop-brightness-50 p-4">
				<div className="container max-w-screen-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
					{/* Hero section */}
					<div className="text-white space-y-4">
						<h1 className="text-4xl md:text-6xl font-bold">DegenTalk</h1>
						<p className="text-xl md:text-2xl">
							The premiere social commerce platform for blockchain enthusiasts
						</p>
						<ul className="list-disc list-inside space-y-2 ml-4">
							<li>Join the fastest growing community</li>
							<li>Earn rewards for quality content</li>
							<li>Connect your crypto wallet for seamless transactions</li>
							<li>Participate in exclusive events and airdrops</li>
						</ul>
					</div>
=======
  return (
    <div className="min-h-screen bg-[url('/images/auth-bg.jpg')] bg-cover bg-center">
      <div className="min-h-screen flex justify-center items-center backdrop-blur-sm backdrop-brightness-50 p-4">
        <div className="container max-w-screen-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Hero section */}
          <div className="text-white space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">Degentalk™™</h1>
            <p className="text-xl md:text-2xl">
              The premiere social commerce platform for blockchain enthusiasts
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Join the fastest growing community</li>
              <li>Earn rewards for quality content</li>
              <li>Connect your crypto wallet for seamless transactions</li>
              <li>Participate in exclusive events and airdrops</li>
            </ul>
          </div>
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a

					{/* Auth forms */}
					<div className="w-full max-w-md mx-auto">
						<Card className="bg-black/80 border-gray-700 text-white">
							<CardHeader>
								<Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
									<TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
										<TabsTrigger
											value="login"
											className="text-white data-[state=active]:bg-primary"
										>
											Login
										</TabsTrigger>
										<TabsTrigger
											value="register"
											className="text-white data-[state=active]:bg-primary"
										>
											Register
										</TabsTrigger>
									</TabsList>
								</Tabs>
							</CardHeader>
							<CardContent>
								<TabsContent value="login" className="pt-2">
									<Form {...loginForm}>
										<form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
											<FormField
												control={loginForm.control}
												name="username"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Username</FormLabel>
														<FormControl>
															<Input
																{...field}
																className="bg-gray-800/50 border-gray-700 text-white"
																placeholder="Enter your username"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={loginForm.control}
												name="password"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Password</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="password"
																className="bg-gray-800/50 border-gray-700 text-white"
																placeholder="Enter your password"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<Button type="submit" className="w-full" disabled={loginMutation.isPending}>
												{loginMutation.isPending ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Logging in...
													</>
												) : (
													'Login'
												)}
											</Button>
										</form>
									</Form>
								</TabsContent>
								<TabsContent value="register" className="pt-2">
									<Form {...registerForm}>
										<form
											onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
											className="space-y-4"
										>
											<FormField
												control={registerForm.control}
												name="username"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Username</FormLabel>
														<FormControl>
															<Input
																{...field}
																className="bg-gray-800/50 border-gray-700 text-white"
																placeholder="Choose a username"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={registerForm.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="email"
																className="bg-gray-800/50 border-gray-700 text-white"
																placeholder="Enter your email"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={registerForm.control}
												name="password"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Password</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="password"
																className="bg-gray-800/50 border-gray-700 text-white"
																placeholder="Create a password"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={registerForm.control}
												name="confirmPassword"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Confirm Password</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="password"
																className="bg-gray-800/50 border-gray-700 text-white"
																placeholder="Confirm your password"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<Button
												type="submit"
												className="w-full"
												disabled={registerMutation.isPending}
											>
												{registerMutation.isPending ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Registering...
													</>
												) : (
													'Register'
												)}
											</Button>
										</form>
									</Form>
								</TabsContent>
							</CardContent>
							<CardFooter className="flex justify-center text-sm text-gray-400">
								{activeTab === 'login' ? (
									<p>
										Don't have an account?{' '}
										<Button
											variant="link"
											className="p-0 h-auto"
											onClick={() => setActiveTab('register')}
										>
											Register
										</Button>
									</p>
								) : (
									<p>
										Already have an account?{' '}
										<Button
											variant="link"
											className="p-0 h-auto"
											onClick={() => setActiveTab('login')}
										>
											Login
										</Button>
									</p>
								)}
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
