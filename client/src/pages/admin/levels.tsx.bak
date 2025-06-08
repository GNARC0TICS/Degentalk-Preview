import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Pencil, Save, BarChart3 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the level type
type Level = {
  id: number;
  level: number;
  minXp: number;
  rankName: string;
  description: string | null;
  iconUrl: string | null;
  colorCode: string | null;
};

// Form validation schema
const levelFormSchema = z.object({
  level: z.coerce.number().int().min(1, "Level must be at least 1"),
  minXp: z.coerce.number().int().min(0, "XP required must be at least 0"),
  rankName: z.string().min(2, "Rank name must be at least 2 characters").max(50, "Rank name must be at most 50 characters"),
  description: z.string().optional().nullable(),
  iconUrl: z.string().url("Please enter a valid URL").optional().nullable(),
  colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid hex color code (e.g. #00FF00)").optional().nullable(),
});

type LevelFormValues = z.infer<typeof levelFormSchema>;

export default function LevelsAdmin() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for creating/editing levels
  const form = useForm<LevelFormValues>({
    resolver: zodResolver(levelFormSchema),
    defaultValues: {
      level: 1,
      minXp: 0,
      rankName: "",
      description: "",
      iconUrl: "",
      colorCode: "#4CAF50",
    },
  });

  // Query to fetch levels
  const { data: levels, isLoading, error } = useQuery<Level[]>({
    queryKey: ["levels"],
    queryFn: async () => {
      const response = await fetch("/api/admin/levels");
      if (!response.ok) {
        throw new Error("Failed to fetch levels");
      }
      return response.json();
    },
  });

  // Mutation to create a level
  const createLevelMutation = useMutation({
    mutationFn: async (values: LevelFormValues) => {
      const response = await fetch("/api/admin/levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create level");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      setIsCreateDialogOpen(false);
      form.reset({
        level: 1,
        minXp: 0,
        rankName: "",
        description: "",
        iconUrl: "",
        colorCode: "#4CAF50",
      });
      toast({
        title: "Level created",
        description: "The level has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create level. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a level
  const updateLevelMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: LevelFormValues }) => {
      const response = await fetch(`/api/admin/levels/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update level");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      setIsEditDialogOpen(false);
      setSelectedLevel(null);
      form.reset();
      toast({
        title: "Level updated",
        description: "The level has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update level. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a level
  const deleteLevelMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/levels/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete level");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast({
        title: "Level deleted",
        description: "The level has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete level. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle level create submission
  const onCreateSubmit = (values: LevelFormValues) => {
    createLevelMutation.mutate(values);
  };

  // Handle level edit submission
  const onEditSubmit = (values: LevelFormValues) => {
    if (selectedLevel) {
      updateLevelMutation.mutate({ id: selectedLevel.id, values });
    }
  };

  // Open edit dialog and set form values
  const handleEditLevel = (level: Level) => {
    setSelectedLevel(level);
    form.reset({
      level: level.level,
      minXp: level.minXp,
      rankName: level.rankName,
      description: level.description || "",
      iconUrl: level.iconUrl || "",
      colorCode: level.colorCode || "#4CAF50",
    });
    setIsEditDialogOpen(true);
  };

  // Handle level delete
  const handleDeleteLevel = (id: number) => {
    if (window.confirm("Are you sure you want to delete this level? This may affect user progression.")) {
      deleteLevelMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Level Management</h1>
            <p className="text-muted-foreground">
              Configure XP thresholds and ranks for user progression
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Level</DialogTitle>
                <DialogDescription>
                  Define a new level in the user progression system.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minXp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>XP Required</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="rankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Newcomer, Explorer, Expert" {...field} />
                        </FormControl>
                        <FormDescription>The title users will receive at this level</FormDescription>
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
                            placeholder="Description of this level and its benefits"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="iconUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/icon.png" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>URL to the level badge icon image</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colorCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Code</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <Input placeholder="#4CAF50" {...field} value={field.value || ""} />
                              <div 
                                className="w-8 h-8 rounded-md border"
                                style={{ backgroundColor: field.value || "#4CAF50" }}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>Hex color code for level styling</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createLevelMutation.isPending}>
                      {createLevelMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Level"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* XP Curve Overview Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              XP Level Progression Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : levels && levels.length > 0 ? (
              <div className="h-40 relative">
                {/* This would be a chart showing XP curve - simplified for now */}
                <div className="absolute inset-0 flex items-end">
                  {levels.sort((a, b) => a.level - b.level).map((level, index) => (
                    <div
                      key={level.id}
                      className="flex-1 bg-gradient-to-t from-primary/80 to-primary/20 rounded-t-sm"
                      style={{
                        height: `${Math.min(Math.log(level.minXp || 1) * 5, 100)}%`,
                        marginLeft: index > 0 ? '2px' : 0
                      }}
                      title={`Level ${level.level}: ${level.minXp} XP`}
                    />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-black/10 to-transparent h-px" />
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                No level data available. Create levels to see progression curve.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Level Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Level</DialogTitle>
              <DialogDescription>
                Update the level progression settings.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minXp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>XP Required</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="rankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Newcomer, Explorer, Expert" {...field} />
                      </FormControl>
                      <FormDescription>The title users will receive at this level</FormDescription>
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
                          placeholder="Description of this level and its benefits"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="iconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/icon.png" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>URL to the level badge icon image</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="colorCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Code</FormLabel>
                        <FormControl>
                          <div className="flex gap-2 items-center">
                            <Input placeholder="#4CAF50" {...field} value={field.value || ""} />
                            <div 
                              className="w-8 h-8 rounded-md border"
                              style={{ backgroundColor: field.value || "#4CAF50" }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Hex color code for level styling</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={updateLevelMutation.isPending}>
                    {updateLevelMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Levels Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-6 text-destructive">
            <p>Error loading levels. Please try again.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableCaption>A list of all user progression levels in the system.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Level</TableHead>
                  <TableHead>Rank Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Min XP</TableHead>
                  <TableHead className="hidden md:table-cell w-24">Color</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels && levels.length > 0 ? (
                  levels.sort((a, b) => a.level - b.level).map((level) => (
                    <TableRow key={level.id}>
                      <TableCell className="font-medium">{level.level}</TableCell>
                      <TableCell>{level.rankName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {level.description || "No description"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {level.minXp.toLocaleString()} XP
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {level.colorCode ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-5 w-5 rounded-full border"
                              style={{ backgroundColor: level.colorCode }}
                            />
                            <span className="text-xs">{level.colorCode}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditLevel(level)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteLevel(level.id)}
                            disabled={deleteLevelMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No levels found. Create one to get started.
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