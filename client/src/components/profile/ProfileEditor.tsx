import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Upload, Save, X, User, Image, Globe, MessageSquare } from 'lucide-react';

interface ProfileEditorProps {
  profile: {
    id: number;
    username: string;
    bio: string | null;
    signature: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    website?: string | null;
    discord?: string | null;
    twitter?: string | null;
    location?: string | null;
  };
  onClose: () => void;
}

export function ProfileEditor({ profile, onClose }: ProfileEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    signature: profile.signature || '',
    website: profile.website || '',
    discord: profile.discord || '',
    twitter: profile.twitter || '',
    location: profile.location || ''
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest({
        method: 'PUT',
        url: `/api/profile/update`,
        data
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="social">Social Links</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={handleInputChange('bio')}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signature">Forum Signature</Label>
                  <Textarea
                    id="signature"
                    placeholder="Your signature appears at the bottom of your posts..."
                    value={formData.signature}
                    onChange={handleInputChange('signature')}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Where are you from?"
                    value={formData.location}
                    onChange={handleInputChange('location')}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="website"
                      placeholder="https://your-website.com"
                      value={formData.website}
                      onChange={handleInputChange('website')}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={formData.twitter}
                    onChange={handleInputChange('twitter')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discord">Discord</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="discord"
                      placeholder="username#0000"
                      value={formData.discord}
                      onChange={handleInputChange('discord')}
                      className="pl-10"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="media" className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-8 w-8 text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <Button variant="outline" disabled>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Avatar
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">Avatar upload coming soon</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Profile Banner</Label>
                  <div className="space-y-2">
                    <div className="w-full h-32 rounded-lg bg-zinc-800 overflow-hidden">
                      {profile.bannerUrl ? (
                        <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-8 w-8 text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <Button variant="outline" disabled>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Banner
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">Banner upload coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 