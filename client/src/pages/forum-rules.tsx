import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, AlertTriangle, Check, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx';
import { apiRequest } from '@/utils/queryClient';
import { LoadingSpinner as Spinner } from '@/components/ui/loader';
import type { RuleId, UserId, EntityId } from '@shared/types/ids';

// Type definitions
interface ForumRule {
	id: RuleId;
	title: string;
	content: string;
	section: string;
	isRequired: boolean;
	status: 'draft' | 'published' | 'archived';
	position: number;
	createdAt: string;
	updatedAt: string | null;
	createdBy: UserId | null;
	updatedBy: UserId | null;
	versionHash: string;
	lastAgreedVersionHash: string | null;
}

interface ForumRulesResponse {
	data: ForumRule[];
	count: number;
}

interface UserRuleAgreement {
	id: EntityId;
	userId: UserId;
	ruleId: RuleId;
	versionHash: string;
	agreedAt: string;
}

interface UserRuleAgreementsResponse {
	agreements: UserRuleAgreement[];
}

const ForumRules: React.FC = () => {
	const { toast } = useToast();
	const { user, isAuthenticated } = useAuth();
	const [activeTab, setActiveTab] = useState('general');
	const [agreedRules, setAgreedRules] = useState<Record<number, boolean>>({});
	const [userAgreements, setUserAgreements] = useState<UserRuleAgreement[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch all published forum rules
	const {
		data: rules,
		isLoading,
		error
	} = useQuery({
		queryKey: ['/api/forum/rules'],
		queryFn: async () => {
			return await apiRequest<ForumRulesResponse>({
				url: '/api/forum/rules',
				method: 'GET'
			});
		}
	});

	// Get user agreements if authenticated
	const { data: agreementData, isLoading: agreementsLoading } = useQuery({
		queryKey: ['/api/forum/rules/user-agreements'],
		queryFn: async () => {
			if (!isAuthenticated) return null;
			return await apiRequest<UserRuleAgreementsResponse>({
				url: '/api/forum/rules/user-agreements',
				method: 'GET'
			});
		},
		enabled: isAuthenticated
	});

	// Set initial state for agreed rules when data is loaded
	useEffect(() => {
		if (agreementData?.agreements) {
			const agreements = agreementData.agreements;
			setUserAgreements(agreements);

			// Set which rules have been agreed to
			const agreedMap: Record<number, boolean> = {};
			agreements.forEach((agreement: UserRuleAgreement) => {
				agreedMap[agreement.ruleId] = true;
			});
			setAgreedRules(agreedMap);
		}
	}, [agreementData]);

	// Group rules by section
	const groupedRules = React.useMemo(() => {
		if (!rules?.data) return {};

		return rules.data.reduce((acc: Record<string, ForumRule[]>, rule: ForumRule) => {
			if (rule.status !== 'published') return acc;

			if (!acc[rule.section]) {
				acc[rule.section] = [];
			}
			acc[rule.section].push(rule);
			return acc;
		}, {});
	}, [rules]);

	// Get all available sections
	const sections = React.useMemo(() => {
		return Object.keys(groupedRules);
	}, [groupedRules]);

	// Check if all required rules have been agreed to
	const allRequiredRulesAgreed = React.useMemo(() => {
		if (!rules?.data) return false;

		const requiredRules = rules.data.filter(
			(rule: ForumRule) => rule.status === 'published' && rule.isRequired
		);

		return requiredRules.every((rule: ForumRule) => agreedRules[rule.id]);
	}, [rules, agreedRules]);

	// Handle checkbox change
	const handleRuleAgreementChange = (ruleId: RuleId, checked: boolean) => {
		setAgreedRules((prev) => ({
			...prev,
			[ruleId]: checked
		}));
	};

	// Handle submitting agreements
	const handleSubmitAgreements = async () => {
		if (!isAuthenticated) {
			toast({
				title: 'Authentication required',
				description: 'You must be logged in to agree to forum rules.',
				variant: 'destructive'
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Get all rule IDs that have been checked
			const ruleIds = Object.entries(agreedRules)
				.filter(([_, agreed]) => agreed)
				.map(([ruleId]) => ruleId);

			// Submit the agreements
			await apiRequest<{ success: boolean }>({
				url: '/api/forum/rules/agree',
				method: 'POST',
				data: { ruleIds }
			});

			toast({
				title: 'Success!',
				description: 'You have successfully agreed to the forum rules.',
				variant: 'default'
			});

			// Refresh the agreements
			const response = await apiRequest<UserRuleAgreementsResponse>({
				url: '/api/forum/rules/user-agreements',
				method: 'GET'
			});
			setUserAgreements(response.agreements);
		} catch (error) {
			console.error('Error submitting rule agreements:', error);
			toast({
				title: 'Error',
				description: 'There was an error submitting your agreements. Please try again.',
				variant: 'destructive'
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Check if a rule has been agreed to with the current version
	const isRuleAgreedToCurrentVersion = (rule: ForumRule) => {
		if (!userAgreements.length) return false;

		return userAgreements.some(
			(agreement) => agreement.ruleId === rule.id && agreement.versionHash === rule.versionHash
		);
	};

	// Loading state
	if (isLoading || agreementsLoading) {
		return (
			<div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
				<Spinner size="lg" />
				<p className="ml-4 text-lg">Loading forum rules...</p>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto py-8">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						There was an error loading the forum rules. Please try again later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	// If no published rules
	if (!sections.length) {
		return (
			<div className="container mx-auto py-8">
				<Alert>
					<Info className="h-4 w-4" />
					<AlertTitle>No Rules Available</AlertTitle>
					<AlertDescription>
						There are currently no published forum rules available. Please check back later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<Helmet>
				<title>Forum Rules - Degentalk</title>
				<meta name="description" content="Forum rules and guidelines for Degentalk community" />
			</Helmet>

			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Forum Rules</h1>
				<p className="text-lg text-muted-foreground">
					Please read and agree to our forum rules before participating in discussions.
				</p>

				{isAuthenticated && !allRequiredRulesAgreed && (
					<Alert className="mt-4" variant="default">
						{' '}
						{/* Changed "warning" to "default" */}
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Action Required</AlertTitle>
						<AlertDescription>
							You must agree to all required rules before you can fully participate in the forum.
						</AlertDescription>
					</Alert>
				)}

				{isAuthenticated && allRequiredRulesAgreed && (
					<Alert className="mt-4" variant="default">
						<Check className="h-4 w-4" />
						<AlertTitle>All Set!</AlertTitle>
						<AlertDescription>
							You have agreed to all required forum rules. Thank you for being a part of our
							community!
						</AlertDescription>
					</Alert>
				)}
			</div>

			<Tabs defaultValue={sections[0] || 'general'} value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="mb-4">
					{sections.map((section) => (
						<TabsTrigger key={section} value={section}>
							{section}
						</TabsTrigger>
					))}
				</TabsList>

				{sections.map((section) => (
					<TabsContent key={section} value={section} className="space-y-4">
						{groupedRules[section]?.map((rule) => (
							<Card key={rule.id} className="mb-4">
								<CardHeader>
									<div className="flex justify-between items-start">
										<CardTitle className="text-2xl">{rule.title}</CardTitle>
										{rule.isRequired && <Badge variant="destructive">Required</Badge>}
									</div>
									<CardDescription>
										{isRuleAgreedToCurrentVersion(rule) ? (
											<span className="text-green-600 flex items-center">
												<Check className="h-4 w-4 mr-1" />
												You agreed to this rule on{' '}
												{new Date(
													userAgreements.find((a) => a.ruleId === rule.id)?.agreedAt || ''
												).toLocaleDateString()}
											</span>
										) : (
											<span className="text-muted-foreground">
												Last updated:{' '}
												{new Date(rule.updatedAt || rule.createdAt).toLocaleDateString()}
											</span>
										)}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div
										dangerouslySetInnerHTML={{ __html: rule.content }}
										className="prose dark:prose-invert max-w-none"
									/>
								</CardContent>
								<CardFooter className="flex justify-between items-center">
									<div className="flex items-center space-x-2">
										<Checkbox
											id={`agree-${rule.id}`}
											checked={agreedRules[rule.id] || false}
											onCheckedChange={(checked) => handleRuleAgreementChange(rule.id, !!checked)}
											disabled={isSubmitting}
										/>
										<label
											htmlFor={`agree-${rule.id}`}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											I agree to this rule
										</label>
									</div>

									{isRuleAgreedToCurrentVersion(rule) && (
										<Badge
											variant="outline"
											className="bg-green-50 text-green-700 border-green-200"
										>
											Current Version Agreed
										</Badge>
									)}
								</CardFooter>
							</Card>
						))}
					</TabsContent>
				))}
			</Tabs>

			<Separator className="my-8" />

			<div className="flex justify-end">
				<Button
					onClick={handleSubmitAgreements}
					disabled={isSubmitting || !isAuthenticated}
					className="w-full md:w-auto"
				>
					{isSubmitting ? (
						<>
							<Spinner className="mr-2" size="sm" />
							Submitting...
						</>
					) : (
						'I Agree to the Selected Rules'
					)}
				</Button>
			</div>
		</div>
	);
};

export default ForumRules;
