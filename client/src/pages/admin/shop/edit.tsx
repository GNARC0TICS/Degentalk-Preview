import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define Product type locally for now since we don't have the exact import path
interface Product {
	id?: Id<'id'>;
	name: string;
	description?: string;
	price: number; // Assuming DGT price
	pointsPrice?: number;
	stockLimit?: number | null;
	status: string; // e.g., 'published', 'draft', 'archived'
	pluginReward?: any; // JSON for cosmetic effects, xp boosts, etc.
	metadata?: {
		rarity?: string;
		[key: string]: any; // Allow other metadata
	};
}

// Helper function to get cosmetic type template
const getCosmeticTemplate = (type: string) => {
	const templates: Record<string, any> = {
		usernameColor: {
			type: 'usernameColor',
			value: '#FF0000', // Hex color
			name: 'Red Username',
			description: 'Makes your username appear in red'
		},
		userTitle: {
			type: 'userTitle',
			value: 'VIP Member',
			name: 'VIP Title',
			description: 'Displays a custom title next to your username'
		},
		avatarFrame: {
			type: 'avatarFrame',
			value: '/frames/gold-frame.png', // URL to frame image
			name: 'Gold Frame',
			description: 'Adds a golden frame around your avatar'
		},
		emojiPack: {
			type: 'emojiPack',
			value: {
				custom_smile: '/emojis/custom-smile.gif',
				custom_laugh: '/emojis/custom-laugh.webp'
			},
			name: 'Custom Emoji Pack',
			description: 'Unlocks custom emojis for use in posts'
		},
		featureUnlock: {
			type: 'featureUnlock',
			value: 'customSignatureFont',
			name: 'Custom Signature Font',
			description: 'Allows using custom fonts in your signature'
		}
	};

	return JSON.stringify(templates[type] || templates.usernameColor, null, 2);
};

export default function AdminShopItemEditPage() {
	const params = useParams();
	const itemId = params.id === 'new' ? null : params.id;
	const queryClient = useQueryClient();
	const [, navigate] = useLocation();
	const { toast } = useToast();

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [priceDGT, setPriceDGT] = useState<number | string>('');
	const [pointsPrice, setPointsPrice] = useState<number | string>('');
	const [stockLimit, setStockLimit] = useState<number | string | null>('');
	const [pluginReward, setPluginReward] = useState(getCosmeticTemplate('usernameColor'));
	const [status, setStatus] = useState('published');
	const [rarity, setRarity] = useState('cope'); // Default to 'cope'
	const [cosmeticType, setCosmeticType] = useState('usernameColor');

	const { data: itemData, isLoading: isLoadingItem } = useQuery<
		Product,
		Error,
		Product,
		[string, string | null | undefined]
	>({
		queryKey: ['adminProduct', itemId], // Changed queryKey for clarity
		queryFn: () => {
			if (!itemId) {
				// This should not be called if enabled is false and itemId is null.
				// Throwing an error or returning a rejected promise if it somehow gets called.
				return Promise.reject(new Error('Item ID is required to fetch product details.'));
			}
			return apiRequest<Product>({ url: `/api/admin/shop-management/products/${itemId}` });
		},
		enabled: !!itemId // Query will only run if itemId is truthy
	});

	// Update form when item data loads or when creating a new item
	useEffect(() => {
		if (itemData && itemId) {
			// Editing an existing item
			setName(itemData.name || '');
			setDescription(itemData.description || '');
			setPriceDGT(itemData.price || '');
			setPointsPrice(itemData.pointsPrice || '');
			setStockLimit(itemData.stockLimit == null ? '' : itemData.stockLimit);
			setPluginReward(
				itemData.pluginReward
					? JSON.stringify(itemData.pluginReward, null, 2)
					: getCosmeticTemplate('usernameColor')
			);
			setStatus(itemData.status || 'published');

			const metadata = (itemData.metadata as any) || {};
			setRarity(metadata.rarity || 'cope'); // Default to 'cope' if not set

			try {
				const pr = itemData.pluginReward as any;
				if (pr?.type) {
					setCosmeticType(pr.type);
				} else {
					setCosmeticType('usernameColor'); // Default if type not detectable
				}
			} catch (e) {
				setCosmeticType('usernameColor'); // Default on error
			}
		} else if (!itemId) {
			// Creating a new item
			setName('');
			setDescription('');
			setPriceDGT('');
			setPointsPrice('');
			setStockLimit('');
			setPluginReward(getCosmeticTemplate('usernameColor'));
			setStatus('published');
			setRarity('cope'); // Default rarity for new item
			setCosmeticType('usernameColor'); // Default cosmetic type for new item
		}
	}, [itemData, itemId]);

	const mutation = useMutation<Product, Error, Partial<Product>>({
		mutationFn: (itemDetails) => {
			const url = itemId
				? `/api/admin/shop-management/products/${itemId}`
				: '/api/admin/shop-management/products';
			const method = itemId ? 'PUT' : 'POST';

			let parsedPluginReward = {};
			try {
				parsedPluginReward = JSON.parse(pluginReward);
			} catch (e) {
				throw new Error('Plugin Reward must be valid JSON.');
			}

			return apiRequest<Product>({
				url,
				method,
				data: {
					...itemDetails,
					pluginReward: parsedPluginReward,
					metadata: {
						...((itemDetails.metadata as any) || {}),
						rarity
					}
				}
			});
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/shop-management/products'] });
			queryClient.invalidateQueries({ queryKey: ['/api/admin/shop-management/products', data.id] });
			toast({
				title: itemId ? 'Product updated' : 'Product created',
				description: 'The product has been saved successfully.'
			});
			navigate('/admin/shop');
		},
		onError: (error) => {
			toast({
				title: 'Error saving product',
				description: error.message,
				variant: 'destructive'
			});
		}
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const payload: Partial<Product> = {
			name,
			description,
			price: parseFloat(priceDGT as string),
			pointsPrice: pointsPrice ? parseFloat(pointsPrice as string) : undefined,
			stockLimit: stockLimit === '' || stockLimit === null ? null : parseInt(stockLimit as string),
			status
		};
		mutation.mutate(payload);
	};

	const handleCosmeticTypeChange = (type: string) => {
		setCosmeticType(type);
		setPluginReward(getCosmeticTemplate(type));
	};

	if (isLoadingItem && itemId) return <div className="p-4">Loading item details...</div>;

	return (
		<div className="p-6">
			<Link
				href="/admin/shop"
				className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4"
			>
				<ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop Items
			</Link>
			<h1 className="text-2xl font-semibold text-white mb-6">
				{itemId ? 'Edit Shop Item' : 'Add New Shop Item'}
			</h1>
			<form
				onSubmit={handleSubmit}
				className="space-y-6 bg-zinc-900 border border-zinc-800 p-6 rounded-lg"
			>
				<div>
					<Label htmlFor="name" className="text-zinc-300">
						Item Name
					</Label>
					<Input
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="bg-zinc-800 border-zinc-700 text-white"
					/>
				</div>
				<div>
					<Label htmlFor="description" className="text-zinc-300">
						Description
					</Label>
					<Textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="bg-zinc-800 border-zinc-700 text-white"
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label htmlFor="priceDGT" className="text-zinc-300">
							Price (DGT)
						</Label>
						<Input
							id="priceDGT"
							type="number"
							value={priceDGT}
							onChange={(e) => setPriceDGT(e.target.value)}
							required
							className="bg-zinc-800 border-zinc-700 text-white"
						/>
					</div>
					<div>
						<Label htmlFor="pointsPrice" className="text-zinc-300">
							Points Price (optional)
						</Label>
						<Input
							id="pointsPrice"
							type="number"
							value={pointsPrice}
							onChange={(e) => setPointsPrice(e.target.value)}
							className="bg-zinc-800 border-zinc-700 text-white"
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label htmlFor="stockLimit" className="text-zinc-300">
							Stock Limit (leave blank for unlimited)
						</Label>
						<Input
							id="stockLimit"
							type="number"
							value={stockLimit === null ? '' : stockLimit}
							onChange={(e) => setStockLimit(e.target.value === '' ? null : e.target.value)}
							className="bg-zinc-800 border-zinc-700 text-white"
						/>
					</div>
					<div>
						<Label htmlFor="rarity" className="text-zinc-300">
							Rarity
						</Label>
						<Select value={rarity} onValueChange={setRarity}>
							<SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="cope">🟫 Cope</SelectItem>
								<SelectItem value="normie">🟨 Normie</SelectItem>
								<SelectItem value="bagholder">🟪 Bagholder</SelectItem>
								<SelectItem value="max_bidder">🔵 Max Bidder</SelectItem>
								<SelectItem value="high_roller">🟧 High Roller</SelectItem>
								<SelectItem value="exit_liquidity">🟥 Exit Liquidity (Mythic)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div>
					<Label htmlFor="status" className="text-zinc-300">
						Status
					</Label>
					<Select value={status} onValueChange={setStatus}>
						<SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="published">Published</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label htmlFor="cosmeticType" className="text-zinc-300 mb-2">
						Cosmetic Type (Quick Template)
					</Label>
					<Select value={cosmeticType} onValueChange={handleCosmeticTypeChange}>
						<SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mb-2">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="usernameColor">Username Color</SelectItem>
							<SelectItem value="userTitle">User Title</SelectItem>
							<SelectItem value="avatarFrame">Avatar Frame</SelectItem>
							<SelectItem value="emojiPack">Emoji Pack</SelectItem>
							<SelectItem value="featureUnlock">Feature Unlock</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label htmlFor="pluginReward" className="text-zinc-300">
						Plugin Reward (JSON)
					</Label>
					<Textarea
						id="pluginReward"
						value={pluginReward}
						onChange={(e) => setPluginReward(e.target.value)}
						rows={12}
						className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
					/>
					<p className="text-xs text-zinc-500 mt-1">
						Define the cosmetic effect here. Use the template selector above for examples.
					</p>
				</div>
				<div className="flex justify-end">
					<Button
						type="submit"
						className="bg-emerald-600 hover:bg-emerald-500"
						disabled={mutation.isPending}
					>
						{mutation.isPending ? 'Saving...' : itemId ? 'Save Changes' : 'Create Item'}
					</Button>
				</div>
			</form>
		</div>
	);
}
