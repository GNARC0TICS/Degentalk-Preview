import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

// UI Components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

// Icons
import {
  MessageSquare,
  Send,
  Users,
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
  UserX,
  Clock,
  Volume2,
  VolumeX,
  AtSign,
  Hash,
  Smile,
  Slash,
  Bot,
  Shield,
  Crown,
  Sparkles,
  ArrowUp,
  Coins,
  CloudRain,
} from 'lucide-react';

// Types
import type { UserId, RoomId, MessageId } from '@shared/types/ids';

// Components
import RainButton from '@/features/wallet/components/rain-button';
import TipButton from '@/features/wallet/components/tip-button';
import { RainAnimation } from './RainAnimation';
import { useToast } from '@/hooks/use-toast';

interface ShoutboxUser {
  id: UserId;
  username: string;
  avatarUrl?: string;
  activeAvatarUrl?: string;
  avatarFrame?: string;
  level: number;
  roles?: string[];
  usernameColor?: string;
  isBot?: boolean;
}

interface ShoutboxMessage {
  id: MessageId;
  userId: UserId;
  roomId: RoomId;
  content: string;
  createdAt: string;
  editedAt?: string;
  isDeleted: boolean;
  isPinned: boolean;
  tipAmount?: number;
  user: ShoutboxUser;
  type?: 'normal' | 'rain' | 'tip' | 'system';
  metadata?: {
    amount?: number;
    recipientCount?: number;
    recipientId?: UserId;
    recipientName?: string;
  };
}

interface CommandSuggestion {
  command: string;
  description: string;
  usage: string;
  category: 'general' | 'economy' | 'moderation' | 'fun';
  requiresAuth: boolean;
  requiresRole?: string[];
}

const COMMANDS: CommandSuggestion[] = [
  {
    command: '/tip',
    description: 'Send DGT to another user',
    usage: '/tip @username amount [message]',
    category: 'economy',
    requiresAuth: true,
  },
  {
    command: '/rain',
    description: 'Distribute DGT to multiple active users',
    usage: '/rain amount userCount [message]',
    category: 'economy',
    requiresAuth: true,
  },
  {
    command: '/help',
    description: 'Show available commands',
    usage: '/help',
    category: 'general',
    requiresAuth: false,
  },
  {
    command: '/mute',
    description: 'Mute a user temporarily',
    usage: '/mute @username [duration] [reason]',
    category: 'moderation',
    requiresAuth: true,
    requiresRole: ['moderator', 'admin'],
  },
  {
    command: '/ban',
    description: 'Ban a user from chat',
    usage: '/ban @username [reason]',
    category: 'moderation',
    requiresAuth: true,
    requiresRole: ['moderator', 'admin'],
  },
  {
    command: '/clear',
    description: 'Clear all messages in the room',
    usage: '/clear',
    category: 'moderation',
    requiresAuth: true,
    requiresRole: ['moderator', 'admin'],
  },
];

export function EnhancedShoutbox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // State
  const [message, setMessage] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [currentRoom] = useState<RoomId>('general' as RoomId); // Future: room switching
  const [mutedUsers, setMutedUsers] = useState<Set<UserId>>(new Set());
  const [showRainAnimation, setShowRainAnimation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ShoutboxUser | null>(null);
  
  // WebSocket connection
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  // Check if user has mod/admin privileges
  const isModerator = user?.role === 'moderator' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  // Fetch messages
  const { data: messagesData, isLoading } = useQuery<unknown>({
    queryKey: ['shoutbox', 'messages', currentRoom],
    queryFn: async () => {
      const response = await apiRequest<{ 
        data: ShoutboxMessage[];
        meta: { count: number; activeUsers: number };
      }>({
        url: `/api/shoutbox/messages?roomId=${currentRoom}&limit=50`,
        method: 'GET'
      });
      
      // Update active users count
      if (response.meta?.activeUsers) {
        setActiveUsers(response.meta.activeUsers);
      }
      
      return response.data;
    },
    refetchInterval: isConnected ? false : 30000, // Poll if WebSocket disconnected
  });

  const messages = messagesData || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest({
        url: '/api/shoutbox/messages',
        method: 'POST',
        data: { content, roomId: currentRoom },
      });
    },
    onSuccess: () => {
      setMessage('');
      // New message will arrive via WebSocket
    },
  });

  // Pin message mutation
  const pinMessageMutation = useMutation({
    mutationFn: async ({ messageId, isPinned }: { messageId: MessageId; isPinned: boolean }) => {
      return apiRequest({
        url: `/api/shoutbox/messages/${messageId}/pin`,
        method: 'PATCH',
        data: { isPinned },
      });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: MessageId) => {
      return apiRequest({
        url: `/api/shoutbox/messages/${messageId}`,
        method: 'DELETE',
      });
    },
  });

  // WebSocket event handlers
  useEffect(() => {
    if (!isConnected) return;

    const handleNewMessage = (event: any) => {
      queryClient.setQueryData(
        ['shoutbox', 'messages', currentRoom],
        (old: ShoutboxMessage[] | undefined) => {
          if (!old) return [event.payload.message];
          return [...old, event.payload.message];
        }
      );
    };

    const handleUserJoined = (event: any) => {
      setActiveUsers(event.payload.activeUsers);
    };

    const handleUserLeft = (event: any) => {
      setActiveUsers(event.payload.activeUsers);
    };

    const handleMessageDeleted = (event: any) => {
      queryClient.setQueryData(
        ['shoutbox', 'messages', currentRoom],
        (old: ShoutboxMessage[] | undefined) => {
          if (!old) return [];
          return old.map(msg => 
            msg.id === event.payload.messageId 
              ? { ...msg, isDeleted: true }
              : msg
          );
        }
      );
    };

    const handleMessagePinned = (event: any) => {
      queryClient.setQueryData(
        ['shoutbox', 'messages', currentRoom],
        (old: ShoutboxMessage[] | undefined) => {
          if (!old) return [];
          return old.map(msg => 
            msg.id === event.payload.messageId 
              ? { ...msg, isPinned: event.payload.isPinned }
              : msg
          );
        }
      );
    };

    const handleRainReceived = (event: any) => {
      const { sender, amount, recipients } = event.payload;
      
      // Show animation
      setShowRainAnimation(true);
      setTimeout(() => setShowRainAnimation(false), 5000);
      
      // Show toast notification if user is a recipient
      if (recipients.some((r: any) => r.id === user?.id)) {
        toast({
          title: "🌧️ You got rained on!",
          description: `${sender.username} sent you ${Math.floor(amount / recipients.length)} DGT!`,
          duration: 5000,
        });
      }
    };

    const handleTipReceived = (event: any) => {
      const { sender, recipient, amount, message: tipMessage } = event.payload;
      
      // Show toast notification if user is the recipient
      if (recipient.id === user?.id) {
        toast({
          title: "💰 You received a tip!",
          description: `${sender.username} sent you ${amount} DGT${tipMessage ? `: ${tipMessage}` : ''}`,
          duration: 5000,
        });
      }
    };

    // Subscribe to events
    const unsubNewMessage = subscribe('new_message', handleNewMessage);
    const unsubUserJoined = subscribe('user_joined', handleUserJoined);
    const unsubUserLeft = subscribe('user_left', handleUserLeft);
    const unsubMessageDeleted = subscribe('message_deleted', handleMessageDeleted);
    const unsubMessagePinned = subscribe('message_pinned', handleMessagePinned);
    const unsubRainReceived = subscribe('rain_received', handleRainReceived);
    const unsubTipReceived = subscribe('tip_received', handleTipReceived);

    // Join room
    subscribe('connected', () => {
      unsubscribe('join_room', { roomId: currentRoom });
    });

    return () => {
      unsubNewMessage();
      unsubUserJoined();
      unsubUserLeft();
      unsubMessageDeleted();
      unsubMessagePinned();
      unsubRainReceived();
      unsubTipReceived();
    };
  }, [isConnected, currentRoom, subscribe, unsubscribe, queryClient, user, toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Command detection
  useEffect(() => {
    if (message.startsWith('/')) {
      setShowCommandPalette(true);
    } else {
      setShowCommandPalette(false);
    }
  }, [message]);

  // Filter commands based on input
  const filteredCommands = useMemo(() => {
    if (!message.startsWith('/')) return [];
    
    const search = message.slice(1).toLowerCase();
    return COMMANDS.filter(cmd => {
      // Check command match
      if (!cmd.command.toLowerCase().includes(search)) return false;
      
      // Check auth requirements
      if (cmd.requiresAuth && !user) return false;
      
      // Check role requirements
      if (cmd.requiresRole && !cmd.requiresRole.includes(user?.role || '')) {
        return false;
      }
      
      return true;
    });
  }, [message, user]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !user) return;
    sendMessageMutation.mutate(message);
  }, [message, user, sendMessageMutation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    if (e.key === 'Tab' && showCommandPalette && filteredCommands.length > 0) {
      e.preventDefault();
      setMessage(filteredCommands[0].command + ' ');
      setShowCommandPalette(false);
    }
  };

  const handleUserClick = (user: ShoutboxUser, e?: React.MouseEvent) => {
    if (e?.shiftKey) {
      // Shift+click to select user for tipping
      setSelectedUser(user);
      setMessage(`/tip @${user.username} `);
      inputRef.current?.focus();
    } else {
      // Normal click to view profile
      navigate(`/profile/${user.id}`);
    }
  };

  const handleMuteUser = (userId: UserId) => {
    setMutedUsers(prev => new Set(prev).add(userId));
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 1) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const renderUserBadge = (user: ShoutboxUser) => {
    if (user.isBot) {
      return (
        <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
          <Bot className="h-3 w-3 mr-1" />
          Bot
        </Badge>
      );
    }
    
    if (user.roles?.includes('admin')) {
      return (
        <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
          <Crown className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    
    if (user.roles?.includes('moderator')) {
      return (
        <Badge variant="default" className="ml-1 px-1 py-0 text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Mod
        </Badge>
      );
    }
    
    if (user.roles?.includes('vip')) {
      return (
        <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs bg-yellow-500/20 text-yellow-400">
          <Sparkles className="h-3 w-3 mr-1" />
          VIP
        </Badge>
      );
    }
    
    return null;
  };

  const pinnedMessages = messages.filter(msg => msg.isPinned && !msg.isDeleted);
  const regularMessages = messages.filter(msg => !msg.isPinned && !mutedUsers.has(msg.userId));

  return (
    <Card className="flex flex-col h-[600px] bg-background/95 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Shoutbox
            {!isConnected && (
              <Badge variant="secondary" className="text-xs">
                Reconnecting...
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{activeUsers}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeUsers} active users</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isModerator && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setMessage('/clear ')}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Shield className="h-4 w-4 mr-2" />
                    Moderation Panel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4">
          {/* Pinned Messages */}
          {pinnedMessages.length > 0 && (
            <>
              <div className="sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Pin className="h-3 w-3" />
                  Pinned Messages
                </div>
              </div>
              {pinnedMessages.map(msg => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onUserClick={handleUserClick}
                  onPin={isModerator ? pinMessageMutation.mutate : undefined}
                  onDelete={isModerator ? deleteMessageMutation.mutate : undefined}
                  isPinned
                />
              ))}
              <Separator className="my-2" />
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regular Messages */}
          <div className="space-y-1 py-2">
            {regularMessages.map(msg => (
              <MessageItem
                key={msg.id}
                message={msg}
                onUserClick={handleUserClick}
                onPin={isModerator ? pinMessageMutation.mutate : undefined}
                onDelete={isModerator ? deleteMessageMutation.mutate : undefined}
                onMute={handleMuteUser}
              />
            ))}
          </div>
          
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t">
        <div className="flex gap-2 w-full relative">
          {/* Command Palette */}
          {showCommandPalette && filteredCommands.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-md shadow-lg z-50">
              <Command className="border-0">
                <CommandList>
                  <CommandGroup>
                    {filteredCommands.map(cmd => (
                      <CommandItem
                        key={cmd.command}
                        onSelect={() => {
                          setMessage(cmd.command + ' ');
                          setShowCommandPalette(false);
                          inputRef.current?.focus();
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Slash className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{cmd.command}</span>
                              <Badge variant="outline" className="text-xs">
                                {cmd.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {cmd.description}
                            </p>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}

          {/* Rain and Tip Buttons */}
          {user && (
            <>
              <RainButton
                buttonSize="sm"
                buttonVariant="outline"
                defaultChannel="shoutbox"
                className="shrink-0"
              />
              
              {selectedUser && selectedUser.id !== user.id && (
                <TipButton
                  recipientId={selectedUser.id}
                  recipientName={selectedUser.username}
                  buttonSize="sm"
                  buttonVariant="outline"
                  buttonText=""
                  className="shrink-0"
                  source="shoutbox"
                />
              )}
            </>
          )}

          <Input
            ref={inputRef}
            placeholder={user ? "Type a message or / for commands..." : "Login to chat"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!user || sendMessageMutation.isPending}
            className="flex-1"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!user || !message.trim() || sendMessageMutation.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>

      {/* Rain Animation */}
      {showRainAnimation && <RainAnimation />}
    </Card>
  );
}

// Message Item Component
interface MessageItemProps {
  message: ShoutboxMessage;
  onUserClick: (user: ShoutboxUser, e?: React.MouseEvent) => void;
  onPin?: (data: { messageId: MessageId; isPinned: boolean }) => void;
  onDelete?: (messageId: MessageId) => void;
  onMute?: (userId: UserId) => void;
  isPinned?: boolean;
}

function MessageItem({
  message,
  onUserClick,
  onPin,
  onDelete,
  onMute,
  isPinned,
}: MessageItemProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 1) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        group flex items-start gap-3 px-2 py-1.5 rounded-md
        ${isPinned ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-accent/50'}
        ${message.isDeleted ? 'opacity-50' : ''}
      `}
    >
      <button
        onClick={(e) => onUserClick(message.user, e)}
        className="shrink-0 hover:opacity-80 transition-opacity"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={message.user.activeAvatarUrl || message.user.avatarUrl} 
            alt={message.user.username}
          />
          <AvatarFallback>
            {message.user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => onUserClick(message.user, e)}
                  className="font-medium text-sm hover:underline"
                  style={{ color: message.user.usernameColor }}
                >
                  {message.user.username}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Click to view profile • Shift+click to tip</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {message.user.level && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              Lv {message.user.level}
            </Badge>
          )}
          
          {renderUserBadge(message.user)}
          
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
          
          {message.editedAt && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        <div className="text-sm mt-0.5">
          {message.isDeleted ? (
            <span className="italic text-muted-foreground">Message deleted</span>
          ) : message.type === 'rain' ? (
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-2 rounded-md">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-purple-400" />
                <span className="font-medium">Made it rain!</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {message.metadata?.amount} DGT → {message.metadata?.recipientCount} lucky users
              </div>
            </div>
          ) : message.type === 'tip' ? (
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-2 rounded-md">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="font-medium">
                  Tipped {message.metadata?.recipientName} {message.metadata?.amount} DGT
                </span>
              </div>
              {message.content && (
                <div className="text-xs text-muted-foreground mt-1 italic">
                  "{message.content}"
                </div>
              )}
            </div>
          ) : (
            <p className="break-words">{message.content}</p>
          )}
        </div>
      </div>

      {!message.user.isBot && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onPin && (
                <DropdownMenuItem
                  onClick={() => onPin({ 
                    messageId: message.id, 
                    isPinned: !message.isPinned 
                  })}
                >
                  {message.isPinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
              )}
              
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(message.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
              
              {onMute && (
                <DropdownMenuItem
                  onClick={() => onMute(message.user.id)}
                >
                  <VolumeX className="h-4 w-4 mr-2" />
                  Mute User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  );
}

// Helper function for user badges
function renderUserBadge(user: ShoutboxUser) {
  if (user.isBot) {
    return (
      <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
        <Bot className="h-3 w-3 mr-1" />
        Bot
      </Badge>
    );
  }
  
  if (user.roles?.includes('admin')) {
    return (
      <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
        <Crown className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    );
  }
  
  if (user.roles?.includes('moderator')) {
    return (
      <Badge variant="default" className="ml-1 px-1 py-0 text-xs">
        <Shield className="h-3 w-3 mr-1" />
        Mod
      </Badge>
    );
  }
  
  if (user.roles?.includes('vip')) {
    return (
      <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs bg-yellow-500/20 text-yellow-400">
        <Sparkles className="h-3 w-3 mr-1" />
        VIP
      </Badge>
    );
  }
  
  return null;
}