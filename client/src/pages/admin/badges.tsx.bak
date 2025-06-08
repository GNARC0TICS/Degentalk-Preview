import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trophy, Trash2, Pencil } from "lucide-react";
import AdminLayout from "./admin-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cosmeticsConfig, Rarity } from "@/config/cosmetics.config.ts";

// Define the badge type
type AdminBadge = {
  id: number;
  name: string;
  description: string | null;
  iconUrl: string | null;
  rarity: string;
  createdAt: string;
};

// Form validation schema
const badgeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  description: z.string().optional(),
  iconUrl: z.string().url("Please enter a valid URL").optional().nullable(),
  rarity: z.string().default(cosmeticsConfig.rarities.common.key),
});

type BadgeFormValues = z.infer<typeof badgeFormSchema>;

export default function BadgesAdmin() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<AdminBadge | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for creating/editing badges
  const form = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      iconUrl: "",
      rarity: cosmeticsConfig.rarities.common.key,
    },
  });

  // Query to fetch badges
  const { data: badges, isLoading, error } = useQuery<AdminBadge[]>({
    queryKey: ["badges"],
    queryFn: async () => {
      const response = await fetch("/api/admin/badges");
      if (!response.ok) {
        throw new Error("Failed to fetch badges");
      }
      return response.json();
    },
  });

  // Mutation to create a badge
  const createBadgeMutation = useMutation({
    mutationFn: async (values: BadgeFormValues) => {
      const response = await fetch("/api/admin/badges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create badge");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Badge created",
        description: "The badge has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create badge. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a badge
  const updateBadgeMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: BadgeFormValues }) => {
      const response = await fetch(`/api/admin/badges/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update badge");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      setIsEditDialogOpen(false);
      setSelectedBadge(null);
      form.reset();
      toast({
        title: "Badge updated",
        description: "The badge has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update badge. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a badge
  const deleteBadgeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/badges/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete badge");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast({
        title: "Badge deleted",
        description: "The badge has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete badge. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle badge create submission
  const onCreateSubmit = (values: BadgeFormValues) => {
    createBadgeMutation.mutate(values);
  };

  // Handle badge edit submission
  const onEditSubmit = (values: BadgeFormValues) => {
    if (selectedBadge) {
      updateBadgeMutation.mutate({ id: selectedBadge.id, values });
    }
  };

  // Open edit dialog and set form values
  const handleEditBadge = (badge: AdminBadge) => {
    setSelectedBadge(badge);
    form.reset({
      name: badge.name,
      description: badge.description || "",
      iconUrl: badge.iconUrl || "",
      rarity: badge.rarity,
    });
    setIsEditDialogOpen(true);
  };

  // Handle badge delete
  const handleDeleteBadge = (id: number) => {
    if (window.confirm("Are you sure you want to delete this badge?")) {
      deleteBadgeMutation.mutate(id);
    }
  };

  // Helper function to display rarity badge with color
  const getRarityBadgeClass = (rarityKey: string) => {
    return cosmeticsConfig.rarities[rarityKey]?.tailwindClass || 'bg-gray-500';
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Badge Management</h1>
            <p className="text-muted-foreground">
              Create and manage badges that users can earn
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Badge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Badge</DialogTitle>
                <DialogDescription>
                  Create a new badge that can be awarded to users.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Badge name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe how to earn this badge"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/icon.png" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>URL to the badge icon image</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rarity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rarity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select badge rarity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(cosmeticsConfig.rarities).map((rarity: Rarity) => (
                              <SelectItem key={rarity.key} value={rarity.key}>
                                {rarity.emoji} {rarity.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createBadgeMutation.isPending}>
                      {createBadgeMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Badge"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Badge Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Badge</DialogTitle>
              <DialogDescription>
                Update the badge details.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Badge name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe how to earn this badge"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="iconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/icon.png" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>URL to the badge icon image</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rarity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select badge rarity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(cosmeticsConfig.rarities).map((rarity: Rarity) => (
                            <SelectItem key={rarity.key} value={rarity.key}>
                              {rarity.emoji} {rarity.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={updateBadgeMutation.isPending}>
                    {updateBadgeMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Badge"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Badges Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-6 text-destructive">
            <p>Error loading badges. Please try again.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableCaption>A list of all badges in the system.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Rarity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {badges && badges.length > 0 ? (
                  badges.map((badge) => (
                    <TableRow key={badge.id}>
                      <TableCell>
                        {badge.iconUrl ? (
                          <img
                            src={badge.iconUrl}
                            alt={badge.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Trophy className="h-6 w-6 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{badge.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {badge.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRarityBadgeClass(badge.rarity)}>
                          {cosmeticsConfig.rarities[badge.rarity]?.label || badge.rarity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditBadge(badge)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteBadge(badge.id)}
                            disabled={deleteBadgeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No badges found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 