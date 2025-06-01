// Phase 2 Audit:
// - Verified layout
// - Added/confirmed <Head> title
// - Applied DEV_MODE gating (if applicable)

// Remove Next.js Head component since we're not using Next.js
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash, Check, X, Users, Shield, BookOpen } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Define the schema for user groups
const userGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  priority: z.number().int().min(0).default(0),
  permissions: z.array(z.string()).default([]),
});

type UserGroup = z.infer<typeof userGroupSchema> & {
  id: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

// Available permissions categories
const permissionCategories = [
  {
    name: "General",
    permissions: ["canLogin", "canViewProfile", "canEditProfile", "canUseChat"],
  },
  {
    name: "Forum",
    permissions: [
      "canCreateThread",
      "canReplyToThread",
      "canEditOwnPost",
      "canDeleteOwnPost",
      "canReportContent",
      "canUsePoll",
      "canUseForumSearch",
    ],
  },
  {
    name: "Moderation",
    permissions: [
      "canModerateContent",
      "canEditAnyPost",
      "canDeleteAnyPost",
      "canLockThread",
      "canPinThread",
      "canMoveThread",
      "canBanUser",
    ],
  },
  {
    name: "Administration",
    permissions: [
      "canAccessAdminPanel",
      "canManageUsers",
      "canManageGroups",
      "canManageSettings",
      "canViewAuditLogs",
      "canEditConfig",
      "canViewStats",
    ],
  },
  {
    name: "Shop & Economy",
    permissions: [
      "canUseShop",
      "canManageShop",
      "canManageProducts",
      "canTransferFunds",
      "canManageEconomy",
      "canViewTransactions",
    ],
  },
];

// Helper function to get permission details
const getPermissionDetails = (id: string) => {
  const permissionMap: Record<string, { id: string; label: string; description: string }> = {
    canLogin: {
      id: "canLogin",
      label: "Can Login",
      description: "Allows users to log into the platform",
    },
    canViewProfile: {
      id: "canViewProfile",
      label: "View Profiles",
      description: "Can view user profiles",
    },
    canEditProfile: {
      id: "canEditProfile",
      label: "Edit Own Profile",
      description: "Can edit their own profile",
    },
    canUseChat: {
      id: "canUseChat",
      label: "Use Chat",
      description: "Can use the chat functionality",
    },
    canCreateThread: {
      id: "canCreateThread",
      label: "Create Thread",
      description: "Can create new forum threads",
    },
    canReplyToThread: {
      id: "canReplyToThread",
      label: "Reply to Thread",
      description: "Can reply to existing threads",
    },
    canEditOwnPost: {
      id: "canEditOwnPost",
      label: "Edit Own Posts",
      description: "Can edit their own posts",
    },
    canDeleteOwnPost: {
      id: "canDeleteOwnPost",
      label: "Delete Own Posts",
      description: "Can delete their own posts",
    },
    canReportContent: {
      id: "canReportContent",
      label: "Report Content",
      description: "Can report inappropriate content",
    },
    canUsePoll: {
      id: "canUsePoll",
      label: "Use Polls",
      description: "Can create and vote in polls",
    },
    canUseForumSearch: {
      id: "canUseForumSearch", 
      label: "Use Forum Search",
      description: "Can use forum search functionality",
    },
    canModerateContent: {
      id: "canModerateContent",
      label: "Moderate Content",
      description: "Can moderate user-generated content",
    },
    canEditAnyPost: {
      id: "canEditAnyPost",
      label: "Edit Any Post",
      description: "Can edit any user's posts",
    },
    canDeleteAnyPost: {
      id: "canDeleteAnyPost",
      label: "Delete Any Post",
      description: "Can delete any user's posts",
    },
    canLockThread: {
      id: "canLockThread",
      label: "Lock Thread",
      description: "Can lock threads to prevent new replies",
    },
    canPinThread: {
      id: "canPinThread",
      label: "Pin Thread",
      description: "Can pin threads to the top of forums",
    },
    canMoveThread: {
      id: "canMoveThread",
      label: "Move Thread",
      description: "Can move threads between categories",
    },
    canBanUser: {
      id: "canBanUser",
      label: "Ban User",
      description: "Can ban users from the platform",
    },
    canAccessAdminPanel: {
      id: "canAccessAdminPanel",
      label: "Access Admin Panel",
      description: "Can access the admin control panel",
    },
    canManageUsers: {
      id: "canManageUsers",
      label: "Manage Users",
      description: "Can manage user accounts",
    },
    canManageGroups: {
      id: "canManageGroups",
      label: "Manage Groups",
      description: "Can manage user groups",
    },
    canManageSettings: {
      id: "canManageSettings",
      label: "Manage Settings",
      description: "Can manage site settings",
    },
    canViewAuditLogs: {
      id: "canViewAuditLogs",
      label: "View Audit Logs",
      description: "Can view system audit logs",
    },
    canEditConfig: {
      id: "canEditConfig",
      label: "Edit Configuration",
      description: "Can edit site configuration files",
    },
    canViewStats: {
      id: "canViewStats",
      label: "View Statistics",
      description: "Can view site statistics",
    },
    canUseShop: {
      id: "canUseShop",
      label: "Use Shop",
      description: "Can make purchases in the shop",
    },
    canManageShop: {
      id: "canManageShop",
      label: "Manage Shop",
      description: "Can manage the shop functionality",
    },
    canManageProducts: {
      id: "canManageProducts",
      label: "Manage Products",
      description: "Can manage shop products",
    },
    canTransferFunds: {
      id: "canTransferFunds",
      label: "Transfer Funds",
      description: "Can transfer funds between users",
    },
    canManageEconomy: {
      id: "canManageEconomy",
      label: "Manage Economy",
      description: "Can manage site economy settings",
    },
    canViewTransactions: {
      id: "canViewTransactions",
      label: "View Transactions",
      description: "Can view transaction history",
    },
  };

  return permissionMap[id] || { id, label: id, description: "No description available" };
};

export default function AdminUserGroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user groups
  const { data: userGroups = [], isLoading } = useQuery({
    queryKey: ["/api/admin/user-groups"],
    select: (data: any) => data.map((group: any) => ({
      ...group,
      createdAt: new Date(group.createdAt).toLocaleString(),
      updatedAt: new Date(group.updatedAt).toLocaleString(),
    })),
  });

  // Create user group mutation
  const createUserGroupMutation = useMutation({
    mutationFn: (data: z.infer<typeof userGroupSchema>) =>
      apiRequest("/api/admin/user-groups", {
        method: "POST",
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-groups"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Group created",
        description: "The user group has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create group",
        description: error.message || "There was an error creating the user group.",
        variant: "destructive",
      });
    },
  });

  // Update user group mutation
  const updateUserGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: z.infer<typeof userGroupSchema> }) =>
      apiRequest(`/api/admin/user-groups/${id}`, {
        method: "PUT",
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-groups"] });
      setIsEditDialogOpen(false);
      setSelectedGroup(null);
      toast({
        title: "Group updated",
        description: "The user group has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update group",
        description: error.message || "There was an error updating the user group.",
        variant: "destructive",
      });
    },
  });

  // Delete user group mutation
  const deleteUserGroupMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/user-groups/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-groups"] });
      setIsDeleteDialogOpen(false);
      setSelectedGroup(null);
      toast({
        title: "Group deleted",
        description: "The user group has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete group",
        description: error.message || "There was an error deleting the user group.",
        variant: "destructive",
      });
    },
  });

  // Form for creating/editing user groups
  const form = useForm<z.infer<typeof userGroupSchema>>({
    resolver: zodResolver(userGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6366F1",
      isActive: true,
      isDefault: false,
      priority: 0,
      permissions: [],
    },
  });

  // Handle creating a new user group
  const onCreateSubmit = (values: z.infer<typeof userGroupSchema>) => {
    createUserGroupMutation.mutate(values);
  };

  // Handle editing a user group
  const handleEditGroup = (group: UserGroup) => {
    setSelectedGroup(group);
    form.reset({
      name: group.name,
      description: group.description || "",
      color: group.color,
      isActive: group.isActive,
      isDefault: group.isDefault,
      priority: group.priority,
      permissions: group.permissions || [],
    });
    setIsEditDialogOpen(true);
  };

  // Handle updating a user group
  const onEditSubmit = (values: z.infer<typeof userGroupSchema>) => {
    if (selectedGroup) {
      updateUserGroupMutation.mutate({ id: selectedGroup.id, data: values });
    }
  };

  // Handle deleting a user group
  const handleDeleteGroup = (group: UserGroup) => {
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion of a user group
  const confirmDelete = () => {
    if (selectedGroup) {
      deleteUserGroupMutation.mutate(selectedGroup.id);
    }
  };

  // Filter user groups based on search term
  const filteredGroups = searchTerm.trim() === ""
    ? userGroups
    : userGroups.filter((group: UserGroup) => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  return (
    <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Group Management</h1>
          <Button onClick={() => {
            setSelectedGroup(null);
            form.reset({
              name: "",
              description: "",
              color: "#6366F1",
              isActive: true,
              isDefault: false,
              priority: 0,
              permissions: [],
            });
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add New Group
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Groups</CardTitle>
            <CardDescription>
              Manage user groups and their permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search groups..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center p-8">Loading user groups...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No groups found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGroups.map((group: UserGroup) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: group.color }}
                              ></span>
                              {group.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {group.userCount || 0}
                            </div>
                          </TableCell>
                          <TableCell>{group.priority}</TableCell>
                          <TableCell>
                            {group.isActive ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="mr-1 h-3 w-3" /> Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <X className="mr-1 h-3 w-3" /> Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {group.isDefault ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Default
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditGroup(group)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteGroup(group)}
                                disabled={group.isDefault}
                              >
                                <Trash className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create User Group Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New User Group</DialogTitle>
              <DialogDescription>
                Define a new user group with specific permissions for your community members.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Administrators" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name displayed for this group
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Color</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input type="color" {...field} className="w-12 h-10 p-1" />
                          </FormControl>
                          <Input 
                            value={field.value} 
                            onChange={field.onChange} 
                            placeholder="#6366F1" 
                            className="flex-1"
                          />
                        </div>
                        <FormDescription>
                          Color used to highlight the group
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Group for site administrators with full permissions" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Briefly describe the purpose of this group
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <FormDescription>
                            Enable or disable this user group
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Default Group</FormLabel>
                          <FormDescription>
                            Assign to new users automatically
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Higher priority groups override lower ones when a user belongs to multiple groups
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="permissions"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Permissions</FormLabel>
                        <FormDescription>
                          Select the permissions for this user group
                        </FormDescription>
                      </div>
                      
                      {permissionCategories.map((category) => (
                        <div key={category.name} className="mb-6">
                          <h4 className="font-medium mb-2 border-b pb-1">{category.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {category.permissions.map((permId) => {
                              const permission = getPermissionDetails(permId);
                              return (
                                <FormField
                                  key={permission.id}
                                  control={form.control}
                                  name="permissions"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={permission.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 p-2 hover:bg-secondary/20 rounded-md"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(permission.id)}
                                            onCheckedChange={(checked) => {
                                              const currentPermissions = field.value || [];
                                              return checked
                                                ? field.onChange([...currentPermissions, permission.id])
                                                : field.onChange(
                                                    currentPermissions.filter(
                                                      (value) => value !== permission.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="font-normal cursor-pointer">
                                            {permission.label}
                                          </FormLabel>
                                          <FormDescription className="text-xs">
                                            {permission.description}
                                          </FormDescription>
                                        </div>
                                      </FormItem>
                                    );
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUserGroupMutation.isPending}>
                    {createUserGroupMutation.isPending ? "Creating..." : "Create Group"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit User Group Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit User Group</DialogTitle>
              <DialogDescription>
                Update user group settings and permissions.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Administrators" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name displayed for this group
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Color</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input type="color" {...field} className="w-12 h-10 p-1" />
                          </FormControl>
                          <Input 
                            value={field.value} 
                            onChange={field.onChange} 
                            placeholder="#6366F1" 
                            className="flex-1"
                          />
                        </div>
                        <FormDescription>
                          Color used to highlight the group
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Group for site administrators with full permissions" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Briefly describe the purpose of this group
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <FormDescription>
                            Enable or disable this user group
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Default Group</FormLabel>
                          <FormDescription>
                            Assign to new users automatically
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={selectedGroup?.isDefault && field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Higher priority groups override lower ones when a user belongs to multiple groups
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="permissions"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Permissions</FormLabel>
                        <FormDescription>
                          Select the permissions for this user group
                        </FormDescription>
                      </div>
                      
                      {permissionCategories.map((category) => (
                        <div key={category.name} className="mb-6">
                          <h4 className="font-medium mb-2 border-b pb-1">{category.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {category.permissions.map((permId) => {
                              const permission = getPermissionDetails(permId);
                              return (
                                <FormField
                                  key={permission.id}
                                  control={form.control}
                                  name="permissions"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={permission.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 p-2 hover:bg-secondary/20 rounded-md"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(permission.id)}
                                            onCheckedChange={(checked) => {
                                              const currentPermissions = field.value || [];
                                              return checked
                                                ? field.onChange([...currentPermissions, permission.id])
                                                : field.onChange(
                                                    currentPermissions.filter(
                                                      (value) => value !== permission.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="font-normal cursor-pointer">
                                            {permission.label}
                                          </FormLabel>
                                          <FormDescription className="text-xs">
                                            {permission.description}
                                          </FormDescription>
                                        </div>
                                      </FormItem>
                                    );
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateUserGroupMutation.isPending}>
                    {updateUserGroupMutation.isPending ? "Updating..." : "Update Group"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the "{selectedGroup?.name}" group?
                {selectedGroup?.userCount && selectedGroup.userCount > 0 && (
                  <span className="text-red-500 block mt-2 font-medium">
                    Warning: This group has {selectedGroup.userCount} members who will lose this group's permissions.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteUserGroupMutation.isPending}
              >
                {deleteUserGroupMutation.isPending ? "Deleting..." : "Delete Group"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}