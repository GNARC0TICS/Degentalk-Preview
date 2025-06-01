import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { apiRequest } from '@/lib/queryClient';

// Component for rendering the mentions suggestion
class MentionList {
  items: any[];
  command: any;
  selectedIndex: number;
  element: HTMLElement;
  scrollContainer: HTMLElement;

  constructor({ items, command }: { items: any[]; command: any }) {
    this.items = items;
    this.command = command;
    this.selectedIndex = 0;
    this.element = document.createElement('div');
    this.element.className = 'mention-list bg-zinc-900 rounded-md shadow-lg border border-zinc-800 overflow-hidden py-1';
    this.element.style.maxHeight = '150px';
    this.element.style.overflowY = 'auto';
    
    this.scrollContainer = this.element;
    this.createItems();
    this.selectItem(0);
  }

  createItems() {
    this.items.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = 'mention-list-item flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-zinc-800 text-zinc-200';
      
      // Create avatar element
      const avatar = document.createElement('div');
      avatar.className = 'w-6 h-6 flex items-center justify-center rounded-full bg-emerald-800 text-white text-xs mr-2 flex-shrink-0';
      avatar.textContent = item.label.substring(0, 2).toUpperCase();
      
      // Create name element
      const name = document.createElement('span');
      name.textContent = item.label;
      
      button.appendChild(avatar);
      button.appendChild(name);
      
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
      this.scrollContainer.scrollTop = selectedItem.offsetTop - this.scrollContainer.offsetHeight / 2;
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
      this.command(this.items[this.selectedIndex]);
      event.preventDefault();
    }
  }
}

// Fetch users matching the query
const fetchUsers = async (query: string) => {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    const response = await apiRequest<{users: {id: number, username: string}[]}>({
      url: '/api/users/search',
      method: 'GET',
      params: { query }
    });
    
    return response.users.map(user => ({
      id: user.username,
      label: user.username
    }));
  } catch (error) {
    console.error('Error fetching users for mention:', error);
    return []; // Return empty array on error
  }
};

export default {
  items: async ({ query }: { query: string }) => {
    return await fetchUsers(query);
  },
  
  render: () => {
    let component: ReactRenderer<MentionList>;
    let popup: any;
    
    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });
        
        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },
      
      onUpdate(props: any) {
        component.updateProps(props);
        
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },
      
      onKeyDown(props: any) {
        if (!component.ref) {
          return false;
        }
        
        return component.ref.onKeyDown(props.event);
      },
      
      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
}; 