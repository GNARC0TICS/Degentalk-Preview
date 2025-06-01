import React, { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMessages, type Conversation, type Message } from '@/hooks/use-messages';
import { useAsyncButton } from '@/hooks/use-async-button';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { Loader2, Send, Trash2, ArrowLeft, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface WhispersInboxProps {
  className?: string;
}

export function WhispersInbox({ className }: WhispersInboxProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { toast } = useToast();
  
  // Get messages functionality
  const { 
    useConversations, 
    useConversation, 
    useSendMessage, 
    useMarkAsRead,
    useDeleteConversation 
  } = useMessages();
  
  // Get conversations list
  const { 
    data: conversations, 
    isLoading: isLoadingConversations,
    refetch: refetchConversations
  } = useConversations();
  
  // Get messages for selected conversation
  const { 
    data: messages, 
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useConversation(selectedConversation?.userId || 0);
  
  // Mutations
  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: deleteConversation } = useDeleteConversation();
  
  // Handle marking messages as read
  React.useEffect(() => {
    if (selectedConversation?.userId && selectedConversation.unreadCount > 0) {
      markAsRead(selectedConversation.userId);
    }
  }, [selectedConversation, markAsRead]);
  
  // Auto-scroll to bottom of messages when messages change or when sending a message
  React.useEffect(() => {
    if (messages?.length) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        const scrollContainer = document.querySelector('.messages-scroll-area [data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          // Smooth scroll to bottom
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [messages, isSendingMessage]);

  // Filtered conversations based on search term
  const filteredConversations = React.useMemo(() => {
    if (!conversations) return [];
    if (!searchTerm.trim()) return conversations;
    
    return conversations.filter(conv => 
      conv.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);
  
  // Send message handler
  const { handleClick: handleSendMessage, isLoading: isSending } = useAsyncButton(async () => {
    if (!selectedConversation) return;
    if (!messageText.trim()) {
      toast({
        title: 'Empty message',
        description: 'Please enter a message to send',
        variant: 'destructive',
      });
      return;
    }
    
    // Rate limiting check
    if (isRateLimited) {
      toast({
        title: 'Please wait',
        description: 'You\'re sending messages too quickly. Please wait a moment.',
        variant: 'destructive',
      });
      return;
    }
    
    // Set rate limiting
    setIsRateLimited(true);
    
    // Reset rate limiting after 2 seconds
    setTimeout(() => {
      setIsRateLimited(false);
    }, 2000);
    
    await new Promise<void>((resolve, reject) => {
      sendMessage(
        { recipientId: selectedConversation.userId, content: messageText.trim() },
        {
          onSuccess: () => {
            setMessageText('');
            refetchMessages();
            refetchConversations();
            toast({
              title: 'Message sent',
              description: `Your message was sent to ${selectedConversation.username}`,
            });
            resolve();
          },
          onError: (error) => {
            toast({
              title: 'Failed to send message',
              description: error instanceof Error ? error.message : 'An unknown error occurred',
              variant: 'destructive',
            });
            reject(error);
          }
        }
      );
    });
  });
  
  // Delete conversation handler
  const { handleClick: handleDeleteConversation, isLoading: isDeleting } = useAsyncButton(async () => {
    if (!selectedConversation) return;
    
    await new Promise<void>((resolve, reject) => {
      deleteConversation(
        selectedConversation.userId,
        {
          onSuccess: () => {
            toast({
              title: 'Conversation deleted',
              description: `Your conversation with ${selectedConversation.username} has been deleted.`,
            });
            setSelectedConversation(null);
            refetchConversations();
            resolve();
          },
          onError: (error) => {
            toast({
              title: 'Failed to delete conversation',
              description: error instanceof Error ? error.message : 'An unknown error occurred',
              variant: 'destructive',
            });
            reject(error);
          }
        }
      );
    });
  });
  
  return (
    <Card className={`bg-black/90 backdrop-blur-xl border border-purple-500/20 ${className}`}>
      {!selectedConversation ? (
        // Conversations List View
        <>
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center justify-between">
              <span>Your Whispers</span>
              <span className="text-sm text-purple-400">{conversations?.length || 0} conversations</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Private messages with other DegenTalk users
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 bg-gray-900/50 border-purple-500/30 focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(70vh-10rem)] pr-4">
              {isLoadingConversations ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  {searchTerm ? 
                    `No conversations found matching "${searchTerm}"` : 
                    'No conversations yet. Start a whisper with someone!'
                  }
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                        ${conversation.unreadCount > 0 
                          ? 'bg-purple-950/30 hover:bg-purple-900/30 border border-purple-500/30' 
                          : 'bg-gray-900/40 hover:bg-gray-800/60 border border-gray-700/20'}
                      `}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <Avatar className="h-12 w-12 border border-purple-500/40">
                        <AvatarImage src={conversation.avatarUrl || undefined} />
                        <AvatarFallback className="bg-purple-900 text-white">
                          {getInitials(conversation.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate">
                            {conversation.username}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatRelativeTime(conversation.lastMessageTime)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          {conversation.lastMessage}
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="min-w-[1.5rem] h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </>
      ) : (
        // Conversation Detail View
        <>
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white mr-2"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-1 items-center min-w-0">
                <Avatar className="h-10 w-10 border border-purple-500/40 mr-3">
                  <AvatarImage src={selectedConversation.avatarUrl || undefined} />
                  <AvatarFallback className="bg-purple-900 text-white">
                    {getInitials(selectedConversation.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="truncate">
                  <CardTitle className="text-white text-lg">
                    {selectedConversation.username}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Whisper conversation
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500"
                onClick={handleDeleteConversation}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="messages-scroll-area h-[calc(70vh-14rem)] pr-4">
              {isLoadingMessages ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message: Message) => {
                    const isCurrentUser = message.senderId !== selectedConversation.userId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-[80%] rounded-lg px-4 py-3 shadow-md
                            ${isCurrentUser
                              ? 'bg-gradient-to-br from-indigo-600/90 to-purple-700/90 text-white'
                              : 'bg-gray-800/80 text-white border border-gray-700/50'}
                          `}
                        >
                          <div className={`text-sm ${!message.isRead && !isCurrentUser ? 'font-semibold' : ''}`}>
                            {message.content}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-200/70' : 'text-gray-400'}`}>
                              {formatRelativeTime(message.timestamp)}
                            </div>
                            {!message.isRead && !isCurrentUser && (
                              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t border-purple-500/10 pt-4">
            <div className="flex w-full space-x-2 items-start">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[60px] bg-gray-900/60 border-purple-500/20 focus:border-purple-500 resize-none"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSending) {
                      handleSendMessage();
                    }
                  }
                }}
              />
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-[60px] w-[60px]"
                size="icon"
                onClick={handleSendMessage}
                disabled={isSending || isRateLimited}
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}