/**
 * Admin Stickers Page
 *
 * Telegram-style sticker system management interface
 */

import React, { useState, useCallback } from 'react';
import { AdminPageShell } from '@/features/admin/components/layout/AdminPageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Plus,
	Upload,
	Package,
	Search,
	Filter,
	Star,
	Eye,
	EyeOff,
	Edit,
	Trash2,
	MoreHorizontal,
	Image,
	Play,
	Download,
	FileImage,
	FileVideo,
	AlertTriangle,
	CheckCircle,
	Loader2
} from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { stickerApiService } from '@/features/admin/services/sticker-api.service';
import { rarityColorMap } from '@/config/rarity.config';

// Mock data for development (replace with actual API calls)
const mockStickers = [
	{
		id: crypto.randomUUID(),
		name: 'pepe_cry',
		displayName: 'Crying Pepe',
		shortcode: ':pepe_cry:',
		staticUrl: '/stickers/pepe_cry.webp',
		animatedUrl: '/stickers/pepe_cry.webm',
		rarity: 'rare',
		packName: 'Pepe Pack',
		isActive: true,
		isVisible: true,
		isAnimated: true,
		totalUnlocks: 1247,
		priceDgt: 500,
		createdAt: '2024-06-20T10:30:00Z'
	},
	{
		id: crypto.randomUUID(),
		name: 'whale_moon',
		displayName: 'Whale to Moon',
		shortcode: ':whale_moon:',
		staticUrl: '/stickers/whale_moon.webp',
		rarity: 'legendary',
		packName: 'Whale Pack',
		isActive: true,
		isVisible: true,
		isAnimated: false,
		totalUnlocks: 342,
		priceDgt: 2000,
		createdAt: '2024-06-19T15:45:00Z'
	}
];

const mockPacks = [
	{
		id: crypto.randomUUID(),
		name: 'pepe_pack',
		displayName: 'Pepe Pack',
		theme: 'memes',
		totalStickers: 12,
		isActive: true,
		isVisible: true,
		isPromoted: true,
		totalUnlocks: 823,
		priceDgt: 5000,
		createdAt: '2024-06-15T09:00:00Z'
	},
	{
		id: crypto.randomUUID(),
		name: 'whale_pack',
		displayName: 'Whale Pack',
		theme: 'crypto',
		totalStickers: 8,
		isActive: true,
		isVisible: true,
		isPromoted: false,
		totalUnlocks: 456,
		priceDgt: 8000,
		createdAt: '2024-06-10T14:20:00Z'
	}
];

// File upload component interfaces
interface FileUploadZoneProps {
	onUpload?: (data: any) => void;
	accept?: string;
	maxSize?: number;
	uploadType?: string;
	stickerId?: string;
	packId?: string;
}

const FileUploadZone = ({
	onUpload,
	accept = 'image/webp,image/png,video/webm,application/json',
	maxSize = 8 * 1024 * 1024, // 8MB default
	uploadType = 'sticker_static',
	stickerId,
	packId
}: FileUploadZoneProps) => {
	const [uploading, setUploading] = useState(false);
	const [dragOver, setDragOver] = useState(false);
	const { toast } = useToast();

	const handleUpload = useCallback(
		async (file: File) => {
			if (!file) return;

			// Validate file size
			if (file.size > maxSize) {
				toast({
					title: 'File too large',
					description: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the ${(maxSize / (1024 * 1024)).toFixed(1)}MB limit.`,
					variant: 'destructive'
				});
				return;
			}

			setUploading(true);
			try {
				// Mock API call for now
				const result = { success: true, data: { filename: file.name } };
				// const result = await stickerApiService.uploadStickerFile(file, uploadType as any, {
				// 	stickerId,
				// 	packId
				// });

				if (result.success) {
					toast({
						title: 'Upload successful',
						description: 'File uploaded and processed successfully'
					});
					onUpload?.(result.data);
				}
			} catch (error) {
				toast({
					title: 'Upload failed',
					description: (error as Error).message || 'Failed to upload file',
					variant: 'destructive'
				});
			} finally {
				setUploading(false);
			}
		},
		[maxSize, uploadType, stickerId, packId, onUpload, toast]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setDragOver(false);
			const file = e.dataTransfer.files[0];
			if (file) {
				handleUpload(file);
			}
		},
		[handleUpload]
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				handleUpload(file);
			}
		},
		[handleUpload]
	);

	return (
		<div
			className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
				dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
			} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
			onDragOver={(e) => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragLeave={() => setDragOver(false)}
			onDrop={handleDrop}
		>
			{uploading ? (
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
					<p className="text-sm text-gray-600">Uploading...</p>
				</div>
			) : (
				<div className="flex flex-col items-center gap-4">
					{uploadType.includes('animated') ? (
						<FileVideo className="h-12 w-12 text-gray-400" />
					) : (
						<FileImage className="h-12 w-12 text-gray-400" />
					)}
					<div>
						<p className="text-lg font-medium">Drop file here or click to upload</p>
						<p className="text-sm text-gray-500">
							Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
						</p>
					</div>
					<input
						type="file"
						accept={accept}
						onChange={handleFileSelect}
						className="hidden"
						id={`file-upload-${uploadType}`}
					/>
					<Button asChild variant="outline">
						<label htmlFor={`file-upload-${uploadType}`} className="cursor-pointer">
							<Upload className="h-4 w-4 mr-2" />
							Choose File
						</label>
					</Button>
				</div>
			)}
		</div>
	);
};

// Sticker preview component interfaces
interface StickerPreviewProps {
	sticker: {
		displayName: string;
		staticUrl: string;
		animatedUrl?: string;
		isAnimated: boolean;
	};
	size?: number;
}

const StickerPreview = ({ sticker, size = 64 }: StickerPreviewProps) => {
	const [useAnimated, setUseAnimated] = useState(false);

	return (
		<div className="relative group">
			<img
				src={useAnimated && sticker.animatedUrl ? sticker.animatedUrl : sticker.staticUrl}
				alt={sticker.displayName}
				className="rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
				style={{ width: size, height: size }}
			/>
			{sticker.isAnimated && (
				<Button
					size="sm"
					variant="ghost"
					className="absolute bottom-1 right-1 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={() => setUseAnimated(!useAnimated)}
				>
					{useAnimated ? <Image className="h-3 w-3" /> : <Play className="h-3 w-3" />}
				</Button>
			)}
		</div>
	);
};

export default function AdminStickersPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [rarityFilter, setRarityFilter] = useState('all');
	const [activeTab, setActiveTab] = useState('stickers');
	const [showUploadDialog, setShowUploadDialog] = useState(false);
	const { toast } = useToast();

	// Filter stickers based on search and filters
	const filteredStickers = mockStickers.filter((sticker) => {
		const matchesSearch =
			sticker.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			sticker.shortcode.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRarity = rarityFilter === 'all' || sticker.rarity === rarityFilter;

		return matchesSearch && matchesRarity;
	});

	// Filter packs based on search
	const filteredPacks = mockPacks.filter(
		(pack) =>
			pack.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pack.theme.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<AdminPageShell
			title="Sticker System"
			description="Manage Telegram-style collectible stickers and packs"
		>
			<div className="space-y-6">
				{/* Header Actions */}
				<div className="flex flex-col sm:flex-row gap-4 justify-between">
					<div className="flex flex-1 gap-4">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search stickers and packs..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={rarityFilter} onValueChange={setRarityFilter}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Rarity" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Rarities</SelectItem>
								<SelectItem value="common">Common</SelectItem>
								<SelectItem value="rare">Rare</SelectItem>
								<SelectItem value="epic">Epic</SelectItem>
								<SelectItem value="legendary">Legendary</SelectItem>
								<SelectItem value="mythic">Mythic</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setShowUploadDialog(true)}>
							<Upload className="h-4 w-4 mr-2" />
							Upload Files
						</Button>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							{activeTab === 'stickers' ? 'Create Sticker' : 'Create Pack'}
						</Button>
					</div>
				</div>

				{/* Overview Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Stickers</CardTitle>
							<Image className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{mockStickers.length}</div>
							<p className="text-xs text-muted-foreground">+2 from last week</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Packs</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{mockPacks.length}</div>
							<p className="text-xs text-muted-foreground">+1 from last week</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Unlocks</CardTitle>
							<Download className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">1,589</div>
							<p className="text-xs text-muted-foreground">+127 from last week</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">DGT Revenue</CardTitle>
							<Star className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">45.2K</div>
							<p className="text-xs text-muted-foreground">+8.1K from last week</p>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
					<TabsList>
						<TabsTrigger value="stickers">Stickers</TabsTrigger>
						<TabsTrigger value="packs">Sticker Packs</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
					</TabsList>

					{/* Stickers Tab */}
					<TabsContent value="stickers" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Sticker Collection</CardTitle>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Preview</TableHead>
											<TableHead>Name</TableHead>
											<TableHead>Rarity</TableHead>
											<TableHead>Pack</TableHead>
											<TableHead>Price (DGT)</TableHead>
											<TableHead>Unlocks</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredStickers.map((sticker) => (
											<TableRow key={sticker.id}>
												<TableCell>
													<StickerPreview sticker={sticker} size={48} />
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">{sticker.displayName}</div>
														<div className="text-sm text-muted-foreground">{sticker.shortcode}</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge
														className={
															rarityColorMap[sticker.rarity as keyof typeof rarityColorMap] ||
															rarityColorMap.common
														}
													>
														{sticker.rarity}
													</Badge>
												</TableCell>
												<TableCell>
													{sticker.packName ? (
														<Badge variant="outline">{sticker.packName}</Badge>
													) : (
														<span className="text-muted-foreground">No pack</span>
													)}
												</TableCell>
												<TableCell>{sticker.priceDgt.toLocaleString()}</TableCell>
												<TableCell>{sticker.totalUnlocks.toLocaleString()}</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														{sticker.isActive ? (
															<Eye className="h-4 w-4 text-green-600" />
														) : (
															<EyeOff className="h-4 w-4 text-gray-400" />
														)}
														{sticker.isAnimated && <Play className="h-4 w-4 text-blue-600" />}
													</div>
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" className="h-8 w-8 p-0">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem>
																<Edit className="h-4 w-4 mr-2" />
																Edit
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Eye className="h-4 w-4 mr-2" />
																Preview
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem className="text-red-600">
																<Trash2 className="h-4 w-4 mr-2" />
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Sticker Packs Tab */}
					<TabsContent value="packs" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Sticker Packs</CardTitle>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Theme</TableHead>
											<TableHead>Stickers</TableHead>
											<TableHead>Price (DGT)</TableHead>
											<TableHead>Unlocks</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredPacks.map((pack) => (
											<TableRow key={pack.id}>
												<TableCell>
													<div className="flex items-center gap-3">
														{pack.isPromoted && <Star className="h-4 w-4 text-yellow-500" />}
														<div>
															<div className="font-medium">{pack.displayName}</div>
															<div className="text-sm text-muted-foreground">{pack.name}</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="outline">{pack.theme}</Badge>
												</TableCell>
												<TableCell>{pack.totalStickers}</TableCell>
												<TableCell>{pack.priceDgt.toLocaleString()}</TableCell>
												<TableCell>{pack.totalUnlocks.toLocaleString()}</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														{pack.isActive ? (
															<Eye className="h-4 w-4 text-green-600" />
														) : (
															<EyeOff className="h-4 w-4 text-gray-400" />
														)}
														{pack.isPromoted && <Star className="h-4 w-4 text-yellow-500" />}
													</div>
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" className="h-8 w-8 p-0">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem>
																<Edit className="h-4 w-4 mr-2" />
																Edit Pack
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Package className="h-4 w-4 mr-2" />
																Manage Stickers
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem className="text-red-600">
																<Trash2 className="h-4 w-4 mr-2" />
																Delete Pack
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Analytics Tab */}
					<TabsContent value="analytics" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Popular Stickers</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{mockStickers.slice(0, 5).map((sticker, index) => (
											<div key={sticker.id} className="flex items-center gap-3">
												<div className="w-6 text-center font-medium">#{index + 1}</div>
												<StickerPreview sticker={sticker} size={32} />
												<div className="flex-1">
													<div className="font-medium">{sticker.displayName}</div>
													<div className="text-sm text-muted-foreground">
														{sticker.totalUnlocks} unlocks
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Rarity Distribution</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{Object.entries(rarityColorMap).map(([rarity, className]) => (
											<div key={rarity} className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Badge className={className}>{rarity}</Badge>
												</div>
												<div className="text-sm font-medium">
													{mockStickers.filter((s) => s.rarity === rarity).length}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>

				{/* Upload Dialog */}
				{showUploadDialog && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
						<Card className="w-full max-w-2xl max-h-[90vh] overflow-auto mx-4">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									File Upload Center
									<Button variant="ghost" size="sm" onClick={() => setShowUploadDialog(false)}>
										✕
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Static Sticker Upload */}
								<div>
									<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
										<FileImage className="h-5 w-5" />
										Static Sticker (WebP/PNG)
									</h3>
									<p className="text-sm text-gray-600 mb-3">
										Upload static sticker images. WebP preferred for smaller file sizes.
									</p>
									<FileUploadZone
										uploadType="sticker_static"
										accept="image/webp,image/png"
										maxSize={2 * 1024 * 1024} // 2MB
										stickerId={undefined}
										packId={undefined}
										onUpload={(data) => {
											toast({
												title: 'Static sticker uploaded',
												description: 'Static sticker file uploaded successfully'
											});
										}}
									/>
								</div>

								{/* Animated Sticker Upload */}
								<div>
									<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
										<FileVideo className="h-5 w-5" />
										Animated Sticker (WebM/Lottie)
									</h3>
									<p className="text-sm text-gray-600 mb-3">
										Upload animated stickers as WebM videos or Lottie JSON files.
									</p>
									<FileUploadZone
										uploadType="sticker_animated"
										accept="video/webm,application/json"
										maxSize={8 * 1024 * 1024} // 8MB
										stickerId={undefined}
										packId={undefined}
										onUpload={(data) => {
											toast({
												title: 'Animated sticker uploaded',
												description: 'Animated sticker file uploaded successfully'
											});
										}}
									/>
								</div>

								{/* Thumbnail Upload */}
								<div>
									<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
										<Image className="h-5 w-5" />
										Thumbnail (WebP/PNG)
									</h3>
									<p className="text-sm text-gray-600 mb-3">
										Upload small preview thumbnails (64x64 recommended).
									</p>
									<FileUploadZone
										uploadType="sticker_thumbnail"
										accept="image/webp,image/png"
										maxSize={512 * 1024} // 512KB
										stickerId={undefined}
										packId={undefined}
										onUpload={(data) => {
											toast({
												title: 'Thumbnail uploaded',
												description: 'Thumbnail file uploaded successfully'
											});
										}}
									/>
								</div>

								{/* Pack Cover Upload */}
								<div>
									<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
										<Package className="h-5 w-5" />
										Pack Cover (WebP/PNG)
									</h3>
									<p className="text-sm text-gray-600 mb-3">
										Upload sticker pack cover images for featured packs.
									</p>
									<FileUploadZone
										uploadType="sticker_pack_cover"
										accept="image/webp,image/png"
										maxSize={2 * 1024 * 1024} // 2MB
										stickerId={undefined}
										packId={undefined}
										onUpload={(data) => {
											toast({
												title: 'Pack cover uploaded',
												description: 'Pack cover uploaded successfully'
											});
										}}
									/>
								</div>

								{/* Upload Guidelines */}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<h4 className="font-semibold text-blue-900 mb-2">Upload Guidelines</h4>
									<ul className="text-sm text-blue-800 space-y-1">
										<li>
											• <strong>Static:</strong> WebP/PNG, max 2MB, 128x128 recommended
										</li>
										<li>
											• <strong>Animated:</strong> WebM video or Lottie JSON, max 8MB
										</li>
										<li>
											• <strong>Thumbnails:</strong> WebP/PNG, max 512KB, 64x64 recommended
										</li>
										<li>
											• <strong>Pack Covers:</strong> WebP/PNG, max 2MB, square format
										</li>
										<li>• Files are automatically organized in Supabase Storage</li>
										<li>• All uploads require admin permissions</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</AdminPageShell>
	);
}
