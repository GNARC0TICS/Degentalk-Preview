import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  MessageSquare, 
  ShoppingBag, 
  User, 
  Bell, 
  ChevronDown, 
  X,
  Search, 
  Wallet,
  LogOut,
  Shield,
  Settings
} from 'lucide-react';
import { WalletSheet } from '@/components/economy/wallet/WalletSheet';
import ChartMenu from '@/components/ui/candlestick-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/config/admin-routes';
import { useAuthWrapper } from '@/hooks/wrappers/use-auth-wrapper';
import { Separator } from "@/components/ui/separator";

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Type extensions for development mode
type ExtendedUserData = {
  username: string;
  isAdmin?: boolean;
  isModerator?: boolean;
  level?: number;
  // other properties
};

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  
  const { user, logoutMutation } = useAuthWrapper() || {};
  
  // State for wallet sheet
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // For development, create a mock user
  const mockUser: ExtendedUserData = {
    username: 'DevUser',
    isAdmin: true,
    isModerator: true,
    level: 99
  };
  
  // Use real user in production, mock user in development
  const displayUser = isDevelopment ? mockUser : (user as ExtendedUserData | null);
  
  // In development we're always authenticated
  const isAuthenticated = isDevelopment ? true : !!user;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Forum', href: '/forum' },
    { name: 'Shop', href: '/shop' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  // Handle logout
  const handleLogout = () => {
    if (!isDevelopment && logoutMutation?.mutate) {
      logoutMutation.mutate(undefined);
    }
  };

  return (
    <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50 shadow-md transition-all">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <span className="text-xl font-bold text-white">
                  Degentalk<span style={{ fontSize: '0.65em', verticalAlign: 'super', marginLeft: '1px' }}>™</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200
                  ${item.href === location 
                    ? 'bg-zinc-800 text-white shadow-inner' 
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400 focus:text-emerald-400 focus:bg-zinc-800'}
                `}>
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>

          {/* Search Box */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-500" />
              </div>
              <Input 
                type="text" 
                placeholder="Search threads..." 
                className="pl-10 bg-zinc-800/50 border-zinc-700 text-sm w-full"
              />
            </div>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center">
            {isAuthenticated && displayUser ? (
              <div className="flex items-center space-x-4">
                {/* Notification Icon */}
                <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-emerald-400 focus:text-emerald-400 transition-all duration-200">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 px-1.5 h-4 min-w-4 bg-red-500 flex items-center justify-center text-[10px]">
                    3
                  </Badge>
                </Button>

                {/* Wallet Button - Opens Wallet Sheet */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-zinc-400 hover:text-emerald-400 focus:text-emerald-400 transition-all duration-200"
                  onClick={() => setIsWalletOpen(true)}
                >
                  <Wallet className="h-5 w-5" />
                </Button>

                {/* Admin/Mod Panel Links */}
                {displayUser.isAdmin && (
                  <Link href="/admin">
                    <div className="text-zinc-400 hover:text-white">
                      <Button variant="ghost" size="icon">
                        <Shield className="h-5 w-5" />
                      </Button>
                    </div>
                  </Link>
                )}

                {displayUser.isModerator && !displayUser.isAdmin && (
                  <Link href="/mod">
                    <div className="text-zinc-400 hover:text-white">
                      <Button variant="ghost" size="icon">
                        <Shield className="h-5 w-5" />
                      </Button>
                    </div>
                  </Link>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-emerald-800 text-emerald-200">
                            {displayUser?.username?.substring(0, 2)?.toUpperCase() || 'UN'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:flex items-center">
                          <span className="text-zinc-300">{displayUser?.username || 'User'}</span>
                          <ChevronDown className="ml-1 h-4 w-4 text-zinc-500" />
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href={`/profile/${displayUser.username}`}>
                      <DropdownMenuItem>
                        <div className="flex w-full items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => setIsWalletOpen(true)}>
                      <div className="flex w-full items-center cursor-pointer">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Wallet</span>
                      </div>
                    </DropdownMenuItem>
                    <Link href="/preferences">
                      <DropdownMenuItem>
                        <div className="flex w-full items-center cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    {displayUser.isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem>
                          <div className="flex w-full items-center cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {displayUser.isModerator && (
                      <Link href="/mod">
                        <DropdownMenuItem>
                          <div className="flex w-full items-center cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Moderator Panel</span>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth">
                  <Button variant="outline" className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800">
                    Log In
                  </Button>
                </Link>
                <Link href="/forum">
                  <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <div className="p-1.5">
              <ChartMenu
                isActive={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="scale-90"
                id="mobile-menu-button"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="p-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-500" />
                </div>
                <Input 
                  type="text" 
                  placeholder="Search threads..." 
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-sm w-full"
                />
              </div>
            </div>

            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <div 
                  className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                    item.href === location 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  } transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </div>
              </Link>
            ))}

            {isAuthenticated && displayUser ? (
              <div className="pt-4 pb-3 border-t border-zinc-800">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-800 text-emerald-200">
                        {displayUser?.username?.substring(0, 2)?.toUpperCase() || 'UN'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{displayUser?.username || 'User'}</div>
                    <div className="text-sm font-medium text-zinc-500">Level {displayUser?.level || '0'}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link href={`/profile/${displayUser.username}`}>
                    <div 
                      className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5 inline mr-2" />
                      Profile
                    </div>
                  </Link>
                  <div 
                    className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                    onClick={() => {
                      setIsOpen(false);
                      setIsWalletOpen(true);
                    }}
                  >
                    <Wallet className="h-5 w-5 inline mr-2" />
                    Wallet
                  </div>
                      <Link href="/preferences">
                        <div 
                          className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                          onClick={() => setIsOpen(false)}
                        >
                          <Settings className="h-5 w-5 inline mr-2" />
                          Settings
                        </div>
                      </Link>

                  {displayUser.isAdmin && (
                    <Link href="/admin">
                      <div 
                        className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="h-5 w-5 inline mr-2" />
                        Admin Panel
                      </div>
                    </Link>
                  )}

                  {displayUser.isModerator && (
                    <Link href="/mod">
                      <div 
                        className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="h-5 w-5 inline mr-2" />
                        Moderator Panel
                      </div>
                    </Link>
                  )}

                  <div
                    className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                    onClick={() => {
                      handleLogout?.();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 inline mr-2" />
                    Log Out
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-zinc-800 px-3 space-y-2">
                <Link href="/forum" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800">
                    Log In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet Sheet */}
      <WalletSheet 
        isOpen={isWalletOpen}
        onOpenChange={setIsWalletOpen}
      />
    </header>
  );
}
