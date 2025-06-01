import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Wallet,
  MessageSquare, 
  FileText,
  ShoppingCart,
  Flag,
  Settings
} from "lucide-react";

type SimpleMenuItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
};

const menuItems: SimpleMenuItem[] = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5 mr-3" />
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: <Users className="w-5 h-5 mr-3" />
  },
  {
    path: '/admin/wallets',
    label: 'Wallets',
    icon: <Wallet className="w-5 h-5 mr-3" />
  },
  {
    path: '/admin/forum',
    label: 'Forum',
    icon: <MessageSquare className="w-5 h-5 mr-3" />
  },
  {
    path: '/admin/threads',
    label: 'Content',
    icon: <FileText className="w-5 h-5 mr-3" />
  },
  {
    path: '/admin/store',
    label: 'Shop',
    icon: <ShoppingCart className="w-5 h-5 mr-3" />
  },
  {
    path: '/admin/reports',
    label: 'Reports',
    icon: <Flag className="w-5 h-5 mr-3" />,
    badge: 2
  },
  {
    path: '/admin/platform-settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5 mr-3" />
  }
];

interface SimpleMenuProps {
  onItemClick?: () => void;
}

export default function SimpleMenu({ onItemClick }: SimpleMenuProps) {
  const [location] = useLocation();

  return (
    <nav className="space-y-0.5">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          onClick={onItemClick}
          className={`flex items-center px-4 py-3 text-sm ${
            location === item.path || (item.path !== '/admin' && location.startsWith(item.path))
              ? 'bg-emerald-500 text-white'
              : 'hover:bg-gray-800'
          }`}
        >
          {item.icon}
          {item.label}
          {item.badge && (
            <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}