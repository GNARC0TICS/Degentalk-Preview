import {
	Flame,
	Target,
	Dice5,
	FileText,
	Archive as ArchiveIcon,
	Coins,
	Home,
	LayoutGrid,
	FolderOpen,
	MessageSquare,
	User,
	Users,
	MessageCircle,
	Bell,
	Wallet,
	ShoppingBag,
	ShoppingCart,
	Sparkles,
	Trophy,
	Plus,
	Minus,
	Edit,
	Trash2,
	Save,
	UploadCloud,
	Download,
	Settings,
	Search,
	ExternalLink,
	Link2,
	Sun,
	Moon,
	Megaphone,
	Menu,
	Shield,
	Loader2,
	CheckCircle,
	AlertCircle,
	AlertTriangle,
	LogOut,
	ChevronDown,
	Pin,
	Lock,
	Clock,
	Tag as TagIcon,
	Eye
} from 'lucide-react';

export const iconMap = {
	flame: {
		lucide: Flame
	},
	target: {
		lucide: Target
	},
	dice: {
		lucide: Dice5
	},
	document: {
		lucide: FileText
	},
	archive: {
		lucide: ArchiveIcon
	},
	coins: {
		lucide: Coins
	},
	home: {
		lucide: Home
	},
	forum: {
		lucide: LayoutGrid
	},
	category: {
		lucide: FolderOpen
	},
	thread: {
		lucide: MessageSquare
	},
	post: {
		lucide: FileText
	},
	profile: {
		lucide: User
	},
	friends: {
		lucide: Users
	},
	message: {
		lucide: MessageCircle
	},
	notifications: {
		lucide: Bell
	},
	megaphone: {
		lucide: Megaphone
	},
	menu: {
		lucide: Menu
	},
	wallet: {
		lucide: Wallet
	},
	shop: {
		lucide: ShoppingBag
	},
	cart: {
		lucide: ShoppingCart
	},
	xp: {
		lucide: Sparkles
	},
	leaderboard: {
		lucide: Trophy
	},
	missions: { lucide: Target },
	chevronDown: { lucide: ChevronDown },
	add: {
		lucide: Plus
	},
	remove: {
		lucide: Minus
	},
	edit: {
		lucide: Edit
	},
	delete: {
		lucide: Trash2
	},
	save: {
		lucide: Save
	},
	upload: {
		lucide: UploadCloud
	},
	download: {
		lucide: Download
	},
	loading: {
		lucide: Loader2
	},
	success: {
		lucide: CheckCircle
	},
	error: {
		lucide: AlertCircle
	},
	warning: {
		lucide: AlertTriangle
	},
	settings: {
		lucide: Settings
	},
	search: {
		lucide: Search
	},
	external: {
		lucide: ExternalLink
	},
	link: {
		lucide: Link2
	},
	logout: {
		lucide: LogOut
	},
	admin: {
		lucide: Shield
	},
	themeToggle: {
		themeVariants: {
			light: Sun,
			dark: Moon
		}
	},
	pinned: { lucide: Pin },
	locked: { lucide: Lock },
	hot: { lucide: Flame },
	time: { lucide: Clock },
	tag: { lucide: TagIcon },
	views: { lucide: Eye },
	replies: { lucide: MessageSquare }
} as const;

export type IconKey = keyof typeof iconMap;
