import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserDirectoryTable } from '@/components/users/UserDirectoryTable';
import { UserFilters } from '@/components/users/UserFilters';
import { motion } from 'framer-motion';
import type { UserId } from '@db/types';

export interface DegenUser {
	id: UserId;
	username: string;
	avatarUrl?: string | null;
	xp: number;
	clout: number;
	postCount: number;
	joinDate: string;
	lastActive: string;
	isOnline: boolean;
	level: number;
	title: string;
}

export default function DegenIndexPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [showFilters, setShowFilters] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(50); // Show 50 users per page
	const [filters, setFilters] = useState({
		sortBy: 'username' as 'username' | 'level' | 'xp' | 'clout' | 'joinDate',
		sortOrder: 'asc' as 'asc' | 'desc',
		onlineOnly: false,
		minXP: 0
	});

	// Mock data - replace with actual API call
	const {
		data: response,
		isLoading,
		isError,
		error,
		refetch
	} = useQuery<{
		users: DegenUser[];
		totalCount: number;
		totalPages: number;
	}>({
		queryKey: ['degens', searchTerm, filters, currentPage],
		queryFn: async () => {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Generate more mock data (150 users total)
			const generateMockUsers = (): DegenUser[] => {
				const baseUsers = [
					{
						id: 1,
						username: 'CryptoKing',
						avatarUrl: 'https://avatar.vercel.sh/cryptoking',
						xp: 15000,
						clout: 250,
						postCount: 1247,
						joinDate: '2023-01-15',
						lastActive: '2 minutes ago',
						isOnline: true,
						level: 15,
						title: 'Crypto Overlord'
					},
					{
						id: 2,
						username: 'DiamondHands',
						avatarUrl: 'https://avatar.vercel.sh/diamondhands',
						xp: 12500,
						clout: 180,
						postCount: 892,
						joinDate: '2023-03-22',
						lastActive: '1 hour ago',
						isOnline: false,
						level: 12,
						title: 'HODL Master'
					},
					{
						id: 3,
						username: 'WhaleWatcher',
						avatarUrl: 'https://avatar.vercel.sh/whalewatcher',
						xp: 11000,
						clout: 150,
						postCount: 567,
						joinDate: '2023-02-10',
						lastActive: '5 minutes ago',
						isOnline: true,
						level: 11,
						title: 'Market Analyst'
					},
					{
						id: 4,
						username: 'NFTGuru',
						avatarUrl: 'https://avatar.vercel.sh/nftguru',
						xp: 9500,
						clout: 120,
						postCount: 334,
						joinDate: '2023-04-05',
						lastActive: '3 hours ago',
						isOnline: false,
						level: 9,
						title: 'Digital Artist'
					},
					{
						id: 5,
						username: 'ShillMaster',
						avatarUrl: 'https://avatar.vercel.sh/shillmaster',
						xp: 8000,
						clout: 90,
						postCount: 445,
						joinDate: '2023-05-18',
						lastActive: '1 day ago',
						isOnline: false,
						level: 8,
						title: 'Marketing Guru'
					},
					{
						id: 6,
						username: 'PaperHands',
						avatarUrl: 'https://avatar.vercel.sh/paperhands',
						xp: 500,
						clout: 10,
						postCount: 23,
						joinDate: '2024-01-20',
						lastActive: '2 weeks ago',
						isOnline: false,
						level: 1,
						title: 'Newbie Trader'
					},
					{
						id: 7,
						username: 'LaserEyes',
						xp: 7500,
						clout: 110,
						postCount: 678,
						joinDate: '2023-06-12',
						lastActive: '30 minutes ago',
						isOnline: true,
						level: 7,
						title: 'Future Seer'
					},
					{
						id: 8,
						username: 'ToTheMoon',
						xp: 6800,
						clout: 105,
						postCount: 234,
						joinDate: '2023-07-30',
						lastActive: '4 hours ago',
						isOnline: false,
						level: 6,
						title: 'Moon Chaser'
					}
				];

				// Generate additional users
				const additionalUsers: DegenUser[] = [];
				const usernames = [
					'ApeStrong',
					'CryptoNinja',
					'DeFiGuru',
					'NFTHunter',
					'YieldFarmer',
					'TokenMaster',
					'BlockchainBoy',
					'EthereumGirl',
					'BitcoinBull',
					'AltcoinAlice',
					'StakeKing',
					'LiquidityLord',
					'GasFeeGoblin',
					'RugpullRick',
					'PumpItPete',
					'DumpItDave',
					'HODLHannah',
					'FOMOFred',
					'SAFUSteve',
					'DegenDave',
					'CryptoCarl',
					'TokenTina',
					'ChainCharlie',
					'BlockBella',
					'MiningMike',
					'ValidatorVic',
					'NodeNancy',
					'ProtocolPaul',
					'SmartContractSam',
					'OraclOllie',
					'FlashLoanFrank',
					'ArbitragueAnna',
					'LeverageLuke',
					'MarginMary',
					'SpotSally',
					'FuturesFinn',
					'OptionsOscar',
					'SwapSophie',
					'BridgeBob',
					'WrapperWill',
					'UnwrapperUma',
					'StakerStan',
					'UnstakerUrsula',
					'BurnerBill',
					'MinterMolly',
					'FarmerPhil',
					'PoolerPenny',
					'LenderLiam',
					'BorrowerBeth',
					'CollateralCole',
					'LiquidatorLola',
					'FlashLoanPhil',
					'MEVMaxine',
					'SandwichSid',
					'FrontrunnerFay',
					'BackrunnerBen',
					'ArbitragerAmy',
					'ScalperScott'
				];

				const titles = [
					'Crypto Newbie',
					'Token Collector',
					'DeFi Explorer',
					'Yield Farmer',
					'NFT Enthusiast',
					'Smart Contract Dev',
					'Blockchain Builder',
					'DeFi Degen',
					'Alpha Hunter',
					'Whale Watcher',
					'Protocol Master',
					'Liquidity Provider',
					'DAO Participant',
					'Validator Node',
					'MEV Searcher',
					'Flash Loan Expert',
					'Arbitrage Pro',
					'Market Maker',
					'Staking Specialist',
					'Bridge Builder',
					'Layer 2 Pioneer',
					'ZK Proof Master',
					'Consensus Expert',
					'Tokenomics Guru',
					'Crypto Sage'
				];

				for (let i = 0; i < 120; i++) {
					const username =
						usernames[i % usernames.length] +
						(i > usernames.length ? Math.floor(i / usernames.length) + 1 : '');
					const xp = Math.floor(Math.random() * 50000) + 100;
					const level = Math.max(1, Math.floor(xp / 1000)); // 1000 XP per level

					additionalUsers.push({
						id: 9 + i,
						username,
						avatarUrl: `https://avatar.vercel.sh/${username.toLowerCase()}`,
						xp,
						clout: Math.floor(Math.random() * 1000) + 5,
						postCount: Math.floor(Math.random() * 2000) + 1,
						joinDate: new Date(
							2023,
							Math.floor(Math.random() * 12),
							Math.floor(Math.random() * 28) + 1
						)
							.toISOString()
							.split('T')[0],
						lastActive:
							Math.random() > 0.7 ? 'Online' : `${Math.floor(Math.random() * 24) + 1} hours ago`,
						isOnline: Math.random() > 0.8,
						level,
						title: titles[Math.min(level - 1, titles.length - 1)]
					});
				}

				return [...baseUsers, ...additionalUsers];
			};

			const allUsers = generateMockUsers();

			// Apply search filter
			let filteredUsers = allUsers.filter((user) =>
				user.username.toLowerCase().includes(searchTerm.toLowerCase())
			);

			// Apply filters
			if (filters.onlineOnly) {
				filteredUsers = filteredUsers.filter((user) => user.isOnline);
			}

			if (filters.minXP > 0) {
				filteredUsers = filteredUsers.filter((user) => user.xp >= filters.minXP);
			}

			// Apply sorting
			filteredUsers.sort((a, b) => {
				let aVal: any, bVal: any;

				switch (filters.sortBy) {
					case 'level':
						aVal = a.level;
						bVal = b.level;
						break;
					case 'xp':
						aVal = a.xp;
						bVal = b.xp;
						break;
					case 'clout':
						aVal = a.clout;
						bVal = b.clout;
						break;
					case 'joinDate':
						aVal = new Date(a.joinDate);
						bVal = new Date(b.joinDate);
						break;
					default:
						aVal = a.username.toLowerCase();
						bVal = b.username.toLowerCase();
				}

				if (filters.sortOrder === 'desc') {
					return aVal < bVal ? 1 : -1;
				}
				return aVal > bVal ? 1 : -1;
			});

			// Calculate pagination
			const totalCount = filteredUsers.length;
			const totalPages = Math.ceil(totalCount / itemsPerPage);
			const startIndex = (currentPage - 1) * itemsPerPage;
			const endIndex = startIndex + itemsPerPage;
			const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

			return {
				users: paginatedUsers,
				totalCount,
				totalPages
			};
		}
	});

	const users = response?.users || [];
	const totalCount = response?.totalCount || 0;
	const totalPages = response?.totalPages || 0;
	const onlineUsers = users.filter((user) => user.isOnline).length;

	// Reset to page 1 when search or filters change
	React.useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filters]);

	if (isLoading) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
					<LoadingSpinner size="xl" color="emerald" />
					<p className="text-zinc-400">Loading Degen Index...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="flex justify-center min-h-[400px] items-center">
					<ErrorDisplay
						title="Degen Index Unavailable"
						message="Could not load user directory at this time."
						error={error}
						onRetry={refetch}
						variant="card"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			{/* Header */}
			<motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
				<h1 className="text-3xl font-bold mb-4 text-white flex items-center">
					<Users className="mr-3 h-8 w-8 text-emerald-400" />
					Member Directory
				</h1>
				<p className="text-zinc-400 mb-6">Browse and search the complete member directory</p>

				{/* Stats */}
				<div className="flex gap-6 text-sm">
					<div className="flex items-center gap-2 text-emerald-400">
						<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
						<span className="font-medium">{onlineUsers} online</span>
					</div>
					<div className="flex items-center gap-2 text-cyan-400">
						<TrendingUp className="w-4 h-4" />
						<span>{totalCount} total members</span>
					</div>
					<div className="flex items-center gap-2 text-zinc-400">
						<Users className="w-4 h-4" />
						<span>
							Page {currentPage} of {totalPages}
						</span>
					</div>
				</div>
			</motion.div>

			{/* Search and Filters */}
			<motion.div
				className="mb-6"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
			>
				<Card className="bg-zinc-900/70 border border-zinc-800">
					<CardContent className="p-4">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
								<Input
									placeholder="Search degens..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
								/>
							</div>
							<Button
								variant="outline"
								onClick={() => setShowFilters(!showFilters)}
								className="border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300"
							>
								<Filter className="mr-2 h-4 w-4" />
								Filters
							</Button>
						</div>

						{showFilters && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								className="mt-4 pt-4 border-t border-zinc-700"
							>
								<UserFilters filters={filters} onFiltersChange={setFilters} />
							</motion.div>
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* User Directory Table */}
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
				{users.length > 0 ? (
					<UserDirectoryTable users={users} />
				) : (
					<motion.div
						className="text-center py-12"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<Users className="mx-auto h-16 w-16 text-zinc-600 mb-4" />
						<h3 className="text-xl font-medium text-zinc-400 mb-2">No members found</h3>
						<p className="text-zinc-500">Try adjusting your search or filters</p>
					</motion.div>
				)}
			</motion.div>

			{/* Pagination */}
			{totalPages > 1 && (
				<motion.div
					className="flex items-center justify-between mt-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<div className="flex items-center gap-2 text-zinc-400 text-sm">
						Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
						{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} members
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
							disabled={currentPage === 1}
							className="border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 disabled:opacity-50"
						>
							<ChevronLeft className="w-4 h-4 mr-1" />
							Previous
						</Button>

						<div className="flex items-center gap-1">
							{[...Array(Math.min(5, totalPages))].map((_, i) => {
								let pageNum;
								if (totalPages <= 5) {
									pageNum = i + 1;
								} else if (currentPage <= 3) {
									pageNum = i + 1;
								} else if (currentPage >= totalPages - 2) {
									pageNum = totalPages - 4 + i;
								} else {
									pageNum = currentPage - 2 + i;
								}

								return (
									<Button
										key={pageNum}
										variant={currentPage === pageNum ? 'default' : 'outline'}
										size="sm"
										onClick={() => setCurrentPage(pageNum)}
										className={`w-8 h-8 p-0 ${
											currentPage === pageNum
												? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
												: 'border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300'
										}`}
									>
										{pageNum}
									</Button>
								);
							})}
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
							disabled={currentPage === totalPages}
							className="border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 disabled:opacity-50"
						>
							Next
							<ChevronRight className="w-4 h-4 ml-1" />
						</Button>
					</div>
				</motion.div>
			)}
		</div>
	);
}
