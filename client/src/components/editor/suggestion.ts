import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import { apiRequest } from '@/utils/queryClient';
import { logger } from '@/lib/logger';

// User mention item interface
interface MentionItem {
	id: string;
	label: string;
	avatarUrl?: string;
	role?: string;
	level?: number;
}

// Command function for inserting mentions
type MentionCommand = (item: MentionItem) => void;

// Tiptap suggestion props
interface SuggestionProps {
	editor: any; // FIXME: Replace with proper Tiptap editor type post-deployment
	clientRect: () => DOMRect;
	event: KeyboardEvent;
	items: MentionItem[];
	command: MentionCommand;
}

// Component for rendering the mentions suggestion
class MentionList {
	items: MentionItem[];
	command: MentionCommand;
	selectedIndex: number;
	element: HTMLElement;
	scrollContainer: HTMLElement;

	constructor({ items, command }: { items: MentionItem[]; command: MentionCommand }) {
		this.items = items;
		this.command = command;
		this.selectedIndex = 0;
		this.element = document.createElement('div');
		this.element.className =
			'mention-list bg-zinc-900 rounded-md shadow-lg border border-zinc-800 overflow-hidden py-1';
		this.element.style.maxHeight = '150px';
		this.element.style.overflowY = 'auto';

		this.scrollContainer = this.element;
		this.createItems();
		this.selectItem(0);
	}

	createItems() {
		this.items.forEach((item, index) => {
			const button = document.createElement('button');
			button.className =
				'mention-list-item flex items-center w-full px-3 py-2 text-sm text-left hover:bg-zinc-800 text-zinc-200 border-l-2 border-transparent hover:border-emerald-500 transition-colors';

			// Create avatar container
			const avatarContainer = document.createElement('div');
			avatarContainer.className = 'w-8 h-8 mr-3 flex-shrink-0';

			if (item.avatarUrl) {
				const avatar = document.createElement('img');
				avatar.src = item.avatarUrl;
				avatar.alt = item.label;
				avatar.className = 'w-8 h-8 rounded-full object-cover border border-zinc-700';
				avatarContainer.appendChild(avatar);
			} else {
				const avatar = document.createElement('div');
				avatar.className =
					'w-8 h-8 flex items-center justify-center rounded-full bg-emerald-800 text-white text-xs border border-zinc-700';
				avatar.textContent = item.label.substring(0, 2).toUpperCase();
				avatarContainer.appendChild(avatar);
			}

			// Create content container
			const content = document.createElement('div');
			content.className = 'flex-1 min-w-0';

			// Create name and role container
			const nameContainer = document.createElement('div');
			nameContainer.className = 'flex items-center gap-2';

			// Create name element
			const name = document.createElement('span');
			name.className = 'font-medium text-zinc-200 truncate';
			name.textContent = `@${item.label}`;

			// Create role badge if role exists
			if (item.role && item.role !== 'user') {
				const roleBadge = document.createElement('span');
				roleBadge.className = 'px-1.5 py-0 text-xs rounded border';
				roleBadge.textContent =
					item.role === 'admin' ? 'Admin' : item.role === 'moderator' ? 'Moderator' : item.role;

				if (item.role === 'admin') {
					roleBadge.className += ' bg-red-900/60 text-red-300 border-red-700/30';
				} else if (item.role === 'moderator') {
					roleBadge.className += ' bg-blue-900/60 text-blue-300 border-blue-700/30';
				} else {
					roleBadge.className += ' bg-zinc-700/60 text-zinc-300 border-zinc-600/30';
				}

				nameContainer.appendChild(roleBadge);
			}

			nameContainer.appendChild(name);
			content.appendChild(nameContainer);

			// Create level display if level exists
			if (item.level) {
				const level = document.createElement('div');
				level.className = 'text-xs text-zinc-500 mt-0.5';
				level.textContent = `Level ${item.level}`;
				content.appendChild(level);
			}

			button.appendChild(avatarContainer);
			button.appendChild(content);

			button.addEventListener('click', () => {
				this.command({ id: item.id, label: item.label });
			});

			this.element.appendChild(button);
		});
	}

	selectItem(index: number) {
		this.selectedIndex = index;

		// Remove highlight from all items
		this.element.querySelectorAll('.mention-list-item').forEach((item, i) => {
			if (i === index) {
				item.classList.add('bg-zinc-800');
			} else {
				item.classList.remove('bg-zinc-800');
			}
		});

		// Scroll to selected item
		const selectedItem = this.element.querySelectorAll('.mention-list-item')[index];
		if (selectedItem) {
			this.scrollContainer.scrollTop =
				(selectedItem as HTMLElement).offsetTop - this.scrollContainer.offsetHeight / 2;
		}
	}

	onKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
			this.selectItem(this.selectedIndex);
			event.preventDefault();
		}

		if (event.key === 'ArrowUp') {
			this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length;
			this.selectItem(this.selectedIndex);
			event.preventDefault();
		}

		if (event.key === 'Enter') {
			const selectedItem = this.items[this.selectedIndex];
			if (selectedItem) {
				this.command(selectedItem);
			}
			event.preventDefault();
		}
	}
}

// Fetch users matching the query
const fetchUsers = async (query: string) => {
	if (!query || query.length < 1) {
		return [];
	}

	try {
		const response = await apiRequest<{
			users: {
				id: string;
				username: string;
				avatarUrl?: string | null;
				activeAvatarUrl?: string | null;
				role?: string | null;
				level?: number | null;
			}[];
		}>({
			url: `/api/social/mentions/search-users?q=${encodeURIComponent(query)}&limit=10`,
			method: 'GET'
		});

		return (
			response?.users?.map((user) => ({
				id: user.username,
				label: user.username,
				avatarUrl: user.activeAvatarUrl || user.avatarUrl,
				role: user.role,
				level: user.level
			})) || []
		);
	} catch (error) {
		logger.error('Suggestion', 'Error fetching users for mention:', error);
		return []; // Return empty array on error
	}
};

export default {
	items: async ({ query }: { query: string }) => {
		return await fetchUsers(query);
	},

	render: () => {
		let component: ReactRenderer<MentionList>;
		let popup: TippyInstance[];

		return {
			onStart: (props: SuggestionProps) => {
				component = new ReactRenderer(MentionList as any, {
					props,
					editor: props.editor
				});

				popup = tippy('body', {
					getReferenceClientRect: props.clientRect,
					appendTo: () => document.body,
					content: component.element,
					showOnCreate: true,
					interactive: true,
					trigger: 'manual',
					placement: 'bottom-start'
				});
			},

			onUpdate(props: SuggestionProps) {
				component.updateProps(props);

				popup[0]?.setProps({
					getReferenceClientRect: props.clientRect
				});
			},

			onKeyDown(props: { event: KeyboardEvent }) {
				if (!component.ref) {
					return false;
				}

				return component.ref.onKeyDown(props.event);
			},

			onExit() {
				popup[0]?.destroy();
				component.destroy();
			}
		};
	}
};
