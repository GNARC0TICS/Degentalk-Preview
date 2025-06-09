import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Pencil, Trash, Plus, LucideIcon, Image, Play, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Lottie from "lottie-react";
import { cosmeticsConfig, EmojiCategory, EmojiUnlockMethod } from "@/config/cosmetics.config.ts";
import AdminLayout from "./admin-layout.tsx";
import LottiePreview from "@/components/admin/LottiePreview.tsx";

// Type for LottieFile API animation item
interface LottieApiAnimationAsset {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  author: string;
  lottie_link: string; // Direct .lottie file URL
  json_link: string; // Direct .json file URL
  preview_url: string; // Static preview image URL
  preview_json: string; // URL to a smaller JSON for quick preview if needed
}

interface LottieApiFeaturedResponse {
  featured: {
    results: {
      edges: Array<{
        node: LottieApiAnimationAsset;
      }>;
    };
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
  };
}

interface LottieApiSearchResponse {
  animations: {
    results: Array<{
      node: LottieApiAnimationAsset;
    }>;
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
  };
}


// Simplified Lottie item for our state
interface SimplifiedLottieItem {
  id: string;
  name: string;
  tags: string[];
  author: string;
  animationUrl: string; // This will be the .lottie or .json URL we prioritize
  previewImageUrl?: string;
}

// Type for emoji schema validation
const emojiFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  previewUrl: z.string().nullable().optional(),
  category: z.string().default(cosmeticsConfig.emojiCategories.standard.key),
  isLocked: z.boolean().default(true),
  unlockType: z.string().default(cosmeticsConfig.emojiUnlockMethods.free.key),
  type: z.enum(["static", "lottie"]).default("static"),
  priceDgt: z.number().nullable().optional(),
  requiredPathXP: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

type EmojiFormValues = z.infer<typeof emojiFormSchema>;

interface Emoji {
  id: number;
  name: string;
  code: string;
  imageUrl: string;
  previewUrl: string | null;
  category: string;
  isLocked: boolean;
  unlockType: string;
  type: "static" | "lottie";
  priceDgt: number | null;
  requiredPathXP: number | null;
  tags?: string[];
  accessible?: boolean;
}

export default function AdminEmojisPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState<Emoji | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for Lottie Browser
  const [lottieSearchTerm, setLottieSearchTerm] = useState("");
  const [lottieResults, setLottieResults] = useState<SimplifiedLottieItem[]>([]);
  const [isLoadingLotties, setIsLoadingLotties] = useState(false);
  const [lottieSearchError, setLottieSearchError] = useState<string | null>(null);

  // Fetch emojis
  const { data: emojis, isLoading } = useQuery({
    queryKey: ["/api/admin/emojis"],
    select: (data: any) => data.map((emoji: any) => ({
      ...emoji,
      imageUrl: emoji.url, // Map fields for consistency
      previewUrl: emoji.preview_url || null,
      isLocked: emoji.is_locked,
      unlockType: emoji.unlock_type || "free",
      type: emoji.type || "static",
      priceDgt: emoji.price_dgt || null,
      requiredPathXP: emoji.required_path_xp || null,
    })),
  });

  // Create emoji mutation
  const createEmojiMutation = useMutation({
    mutationFn: (newEmoji: EmojiFormValues) => {
      console.log("createEmojiMutation - mutationFn called with:", JSON.stringify(newEmoji, null, 2)); // DEBUG
      const { imageUrl, previewUrl, isLocked, unlockType, priceDgt, requiredPathXP, ...rest } = newEmoji;
      return apiRequest({
        url: "/api/admin/emojis",
        method: "POST",
        data: {
          ...rest,
          url: imageUrl, // Map imageUrl to url
          preview_url: previewUrl,
          is_locked: isLocked,
          unlock_type: unlockType,
          price_dgt: priceDgt,
          required_path_xp: requiredPathXP,
        },
      });
    },
    onSuccess: () => {
      console.log("createEmojiMutation - onSuccess"); // DEBUG
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emojis"] });
      setIsOpen(false);
      toast({
        title: "Emoji created",
        description: "The emoji has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("createEmojiMutation - onError:", error); // DEBUG: More detailed error
      let description = "There was an error creating the emoji.";
      if (error.message) {
        description = error.message;
      }
      // If the error object has a response with data.message (common for API errors)
      if (error.response && error.response.data && error.response.data.message) {
        description = error.response.data.message;
      }
      toast({
        title: "Failed to create emoji",
        description: description,
        variant: "destructive",
      });
    },
  });

  // Update emoji mutation
  const updateEmojiMutation = useMutation({
    mutationFn: ({ id, emoji }: { id: number; emoji: EmojiFormValues }) => {
      const { imageUrl, previewUrl, isLocked, unlockType, priceDgt, requiredPathXP, ...rest } = emoji;
      return apiRequest({
        url: `/api/admin/emojis/${id}`,
        method: "PUT",
        data: {
          ...rest,
          url: imageUrl,
          preview_url: previewUrl,
          is_locked: isLocked,
          unlock_type: unlockType,
          price_dgt: priceDgt,
          required_path_xp: requiredPathXP,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emojis"] });
      setIsOpen(false);
      setCurrentEmoji(null);
      toast({
        title: "Emoji updated",
        description: "The emoji has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update emoji",
        description: error.message || "There was an error updating the emoji.",
        variant: "destructive",
      });
    },
  });

  // Delete emoji mutation
  const deleteEmojiMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest({
        url: `/api/admin/emojis/${id}`,
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emojis"] });
      setIsDeleteOpen(false);
      setCurrentEmoji(null);
      toast({
        title: "Emoji deleted",
        description: "The emoji has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete emoji",
        description: error.message || "There was an error deleting the emoji.",
        variant: "destructive",
      });
    },
  });

  // Form definition
  const form = useForm<EmojiFormValues>({
    resolver: zodResolver(emojiFormSchema),
    defaultValues: {
      name: "",
      code: "",
      imageUrl: "",
      previewUrl: null,
      category: cosmeticsConfig.emojiCategories.standard.key,
      isLocked: true,
      unlockType: cosmeticsConfig.emojiUnlockMethods.free.key,
      type: "static",
      priceDgt: null,
      requiredPathXP: null,
      tags: [],
    },
  });

  // Watch form values for live preview
  const watchedType = form.watch("type");
  const watchedImageUrl = form.watch("imageUrl");
  const watchedPreviewUrl = form.watch("previewUrl");
  const watchedName = form.watch("name");

  // State for dialog file input
  const [isDialogProcessingFile, setIsDialogProcessingFile] = useState(false);

  // Handle edit emoji
  const handleEditEmoji = (emoji: Emoji) => {
    setCurrentEmoji(emoji);
    form.reset({
      name: emoji.name,
      code: emoji.code,
      imageUrl: emoji.imageUrl,
      previewUrl: emoji.previewUrl || null,
      category: emoji.category,
      isLocked: emoji.isLocked,
      unlockType: emoji.unlockType,
      type: emoji.type,
      priceDgt: emoji.priceDgt,
      requiredPathXP: emoji.requiredPathXP,
      tags: emoji.tags || [],
    });
    setIsOpen(true);
  };

  // Handle new emoji
  const handleNewEmoji = () => {
    setCurrentEmoji(null);
    form.reset({
      name: "",
      code: "",
      imageUrl: "",
      previewUrl: null,
      category: cosmeticsConfig.emojiCategories.standard.key,
      isLocked: true,
      unlockType: cosmeticsConfig.emojiUnlockMethods.free.key,
      type: "static",
      priceDgt: null,
      requiredPathXP: null,
      tags: [],
    });
    setIsOpen(true);
  };

  // Handle import Lottie
  const handleImportLottie = (lottieItem: SimplifiedLottieItem) => {
    setCurrentEmoji(null); // Ensure it's a new emoji creation
    const slugifiedName = lottieItem.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    form.reset({
      name: lottieItem.name,
      code: `:lottie-${slugifiedName}:`, // Auto-generate code
      imageUrl: lottieItem.animationUrl,
      previewUrl: lottieItem.previewImageUrl || null,
      category: cosmeticsConfig.emojiCategories.lottie?.key || cosmeticsConfig.emojiCategories.standard.key,
      isLocked: true,
      unlockType: cosmeticsConfig.emojiUnlockMethods.shop.key,
      type: "lottie",
      priceDgt: 5,
      requiredPathXP: null,
      tags: lottieItem.tags || [],
    });
    setIsOpen(true);
  };

  // Handle file upload within the dialog for Lottie type
  const handleDialogLottieFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsDialogProcessingFile(true);
    let localError = null;

    if (!file.type.includes("json") && !file.name.endsWith(".lottie")) {
      localError = "Invalid file type. Please upload a .json or .lottie file.";
      toast({ title: "Upload Error", description: localError, variant: "destructive" });
      setIsDialogProcessingFile(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        JSON.parse(text); // Validate JSON structure
        form.setValue("imageUrl", text, { shouldValidate: true });
        // If name field is empty or still a default, suggest from filename
        if (!form.getValues("name") || form.getValues("name").startsWith(":lottie-")) {
          const fileName = file.name.split('.').slice(0, -1).join('.') || file.name;
          const slugifiedName = fileName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          form.setValue("name", fileName, { shouldValidate: true });
          form.setValue("code", `:lottie-${slugifiedName}:`, { shouldValidate: true });
        }
        toast({ title: "File Uploaded", description: "Lottie JSON populated in the URL/Data field." });
      } catch (err) {
        localError = "Invalid Lottie JSON structure in the file.";
        console.error("Error parsing Lottie file in dialog:", err);
        toast({ title: "Upload Error", description: localError, variant: "destructive" });
        form.setValue("imageUrl", "", { shouldValidate: true }); // Clear field on error
      }
      setIsDialogProcessingFile(false);
    };
    reader.onerror = () => {
      localError = "Failed to read the file.";
      toast({ title: "Upload Error", description: localError, variant: "destructive" });
      setIsDialogProcessingFile(false);
    };
    reader.readAsText(file);
    // Reset file input so the same file can be re-uploaded if needed after an error
    if (event.target) {
      event.target.value = "";
    }
  };

  // Form submission
  const onSubmit = (values: EmojiFormValues) => {
    console.log("Submitting emoji form with values:", JSON.stringify(values, null, 2)); // DEBUG: Log submitted values

    // For manually uploaded Lotties, imageUrl contains the raw JSON string.
    // For API-imported Lotties, imageUrl contains the .lottie file URL.
    // The backend needs to be able to handle both cases for the 'url' field.

    if (currentEmoji) {
      console.log("Calling updateEmojiMutation for ID:", currentEmoji.id);
      updateEmojiMutation.mutate({ id: currentEmoji.id, emoji: values });
    } else {
      console.log("Calling createEmojiMutation");
      createEmojiMutation.mutate(values);
    }
  };

  // Delete emoji
  const handleDeleteEmoji = (emoji: Emoji) => {
    setCurrentEmoji(emoji);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (currentEmoji) {
      deleteEmojiMutation.mutate(currentEmoji.id);
    }
  };

  // Group emojis by category for display
  const emojisGroupedByCategory = () => {
    if (!emojis) return {};

    return emojis.reduce((acc: { [key: string]: Emoji[] }, emoji: Emoji) => {
      const category = emoji.category || "standard";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(emoji);
      return acc;
    }, {});
  };

  // Component to preview emoji
  const EmojiPreview = ({ emoji }: { emoji: { name?: string, type?: "static" | "lottie", imageUrl?: string | null, previewUrl?: string | null } }) => {
    const [lottieError, setLottieError] = useState(false);

    const currentType = emoji.type;
    const mainUrlOrData = emoji.imageUrl; // This is the primary URL for static OR Lottie JSON string/URL
    const staticThumbnailUrl = emoji.previewUrl; // This is always a static image thumbnail

    useEffect(() => {
      setLottieError(false);
    }, [mainUrlOrData, currentType]);

    if (currentType === 'lottie' && mainUrlOrData && !lottieError) {
      let animationDataToUse: any = null;
      let isUrl = false;

      try {
        // Check if mainUrlOrData is a URL or a JSON string
        if (mainUrlOrData.startsWith('http') || mainUrlOrData.startsWith('/')) {
          isUrl = true;
          animationDataToUse = mainUrlOrData; // Lottie component can take URL directly
        } else {
          // Attempt to parse as JSON object
          animationDataToUse = JSON.parse(mainUrlOrData);
        }
      } catch (e) {
        // If parsing fails, it's neither a valid URL for Lottie component nor valid JSON data
        // console.warn("Lottie data is not a valid URL or JSON string:", mainUrlOrData, e); // Keep for debugging
        setLottieError(true);
        // Fall through to static preview or error display
      }

      if (animationDataToUse && !lottieError) {
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <Lottie
              animationData={animationDataToUse} // Can be URL string or parsed JSON object
              loop={true}
              style={{ width: 32, height: 32 }}
              onError={(error) => {
                // console.warn("Lottie error for:", mainUrlOrData, error); // Keep for debugging
                setLottieError(true);
              }}
              key={typeof animationDataToUse === 'string' ? animationDataToUse : JSON.stringify(animationDataToUse)}
            />
          </div>
        );
      }
    }

    // Fallback for Lottie error, or if Lottie data is not provided/invalid, or if type is 'static'
    let displaySrc: string | undefined | null = null;

    if (currentType === 'static') {
      displaySrc = mainUrlOrData;
    } else if (currentType === 'lottie') { // Lottie failed or no mainUrl, use thumbnail
      displaySrc = staticThumbnailUrl;
    }

    // If displaySrc is still not set (e.g. type undefined initially), try general fallbacks
    if (!displaySrc) {
      displaySrc = mainUrlOrData || staticThumbnailUrl;
    }

    if (displaySrc) {
      return (
        <div className="w-10 h-10 flex items-center justify-center">
          <img src={displaySrc} alt={emoji.name || 'preview'} className="max-w-full max-h-full object-contain" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 flex items-center justify-center text-xs text-gray-400 italic">
        Preview
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Emoji Management</h1>
          <Button onClick={handleNewEmoji}>
            <Plus className="mr-2 h-4 w-4" /> Add New Emoji
          </Button>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center p-8">Loading emojis...</div>
          ) : (
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Emojis</TabsTrigger>
                <TabsTrigger value="static">Static</TabsTrigger>
                <TabsTrigger value="lottie">Lottie</TabsTrigger>
                <TabsTrigger value="locked">Locked</TabsTrigger>
                <TabsTrigger value="browse-lotties">Browse Lotties</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Card>
                  <CardHeader>
                    <CardTitle>All Emojis</CardTitle>
                    <CardDescription>
                      Manage all emojis available in the system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {Object.entries(emojisGroupedByCategory()).map(([category, categoryEmojis]) => (
                        <div key={category} className="space-y-4">
                          <h3 className="text-lg font-semibold capitalize">{category}</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Preview</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Unlock Method</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {categoryEmojis.map((emoji: Emoji) => (
                                <TableRow key={emoji.id}>
                                  <TableCell>
                                    <EmojiPreview emoji={emoji} />
                                  </TableCell>
                                  <TableCell>{emoji.name}</TableCell>
                                  <TableCell>{emoji.code}</TableCell>
                                  <TableCell className="capitalize">{emoji.type}</TableCell>
                                  <TableCell className="capitalize">
                                    {emoji.isLocked ? emoji.unlockType : 'Free'}
                                    {emoji.priceDgt && ` (${emoji.priceDgt} DGT)`}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleEditEmoji(emoji)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDeleteEmoji(emoji)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="static">
                <Card>
                  <CardHeader>
                    <CardTitle>Static Emojis</CardTitle>
                    <CardDescription>
                      Standard static image emojis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Preview</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Unlock Method</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emojis
                          ?.filter((emoji: Emoji) => emoji.type === "static")
                          .map((emoji: Emoji) => (
                            <TableRow key={emoji.id}>
                              <TableCell>
                                <div className="w-10 h-10 flex items-center justify-center">
                                  <img src={emoji.imageUrl} alt={emoji.name} className="max-w-full max-h-full object-contain" />
                                </div>
                              </TableCell>
                              <TableCell>{emoji.name}</TableCell>
                              <TableCell>{emoji.code}</TableCell>
                              <TableCell className="capitalize">{emoji.category}</TableCell>
                              <TableCell className="capitalize">
                                {emoji.isLocked ? emoji.unlockType : 'Free'}
                                {emoji.priceDgt && ` (${emoji.priceDgt} DGT)`}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditEmoji(emoji)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleDeleteEmoji(emoji)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lottie">
                <Card>
                  <CardHeader>
                    <CardTitle>Lottie Emojis</CardTitle>
                    <CardDescription>
                      Animated Lottie-based emojis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Preview</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Unlock Method</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emojis
                          ?.filter((emoji: Emoji) => emoji.type === "lottie")
                          .map((emoji: Emoji) => (
                            <TableRow key={emoji.id}>
                              <TableCell>
                                <EmojiPreview emoji={emoji} />
                              </TableCell>
                              <TableCell>{emoji.name}</TableCell>
                              <TableCell>{emoji.code}</TableCell>
                              <TableCell className="capitalize">{emoji.category}</TableCell>
                              <TableCell className="capitalize">
                                {emoji.isLocked ? emoji.unlockType : 'Free'}
                                {emoji.priceDgt && ` (${emoji.priceDgt} DGT)`}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditEmoji(emoji)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleDeleteEmoji(emoji)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="locked">
                <Card>
                  <CardHeader>
                    <CardTitle>Locked Emojis</CardTitle>
                    <CardDescription>
                      Emojis that require unlocking through various methods.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Preview</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Unlock Method</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emojis
                          ?.filter((emoji: Emoji) => emoji.isLocked)
                          .map((emoji: Emoji) => (
                            <TableRow key={emoji.id}>
                              <TableCell>
                                <EmojiPreview emoji={emoji} />
                              </TableCell>
                              <TableCell>{emoji.name}</TableCell>
                              <TableCell>{emoji.code}</TableCell>
                              <TableCell className="capitalize">{emoji.type}</TableCell>
                              <TableCell className="capitalize">{emoji.category}</TableCell>
                              <TableCell className="capitalize">
                                {emoji.unlockType}
                                {emoji.priceDgt && ` (${emoji.priceDgt} DGT)`}
                                {emoji.requiredPathXP && ` (${emoji.requiredPathXP} XP)`}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditEmoji(emoji)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleDeleteEmoji(emoji)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="browse-lotties">
                <Card>
                  <CardHeader>
                    <CardTitle>Browse Lottie Animations</CardTitle>
                    <CardDescription>
                      Search for Lottie animations from LottieFiles.com and import them.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* LottieFiles API Search Section */}
                    <div className="flex gap-2 items-center">
                      <Input
                        type="search"
                        placeholder="Search LottieFiles... (e.g., 'checkmark', 'loading')"
                        value={lottieSearchTerm}
                        onChange={(e) => setLottieSearchTerm(e.target.value)}
                        className="flex-grow"
                      />
                      <Button onClick={() => {
                        // This function is now empty as the search logic is handled by the API
                      }} disabled={isLoadingLotties || !lottieSearchTerm.trim()}>
                        {isLoadingLotties ? "Searching..." : <Search className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Lottie Results Display */}
                    {isLoadingLotties && <div className="text-center p-4">Loading animations...</div>}
                    {lottieSearchError && !isLoadingLotties && (
                      <div className="text-center p-4 text-destructive">{lottieSearchError}</div>
                    )}
                    {!isLoadingLotties && !lottieSearchError && lottieResults.length === 0 && lottieSearchTerm && (
                      <div className="text-center p-4 text-muted-foreground">No results found for "{lottieSearchTerm}". Try a different term.</div>
                    )}
                    {!isLoadingLotties && !lottieSearchError && lottieResults.length === 0 && !lottieSearchTerm && (
                      <div className="text-center p-4 text-muted-foreground">Enter a search term above to find Lottie animations.</div>
                    )}

                    {lottieResults.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
                        {lottieResults.map((lottieItem) => (
                          <Card key={lottieItem.id} className="flex flex-col">
                            <CardContent className="p-2 flex-grow flex flex-col items-center justify-center aspect-square">
                              <LottiePreview src={lottieItem.animationUrl} width={100} height={100} />
                              <p className="text-sm font-medium mt-2 truncate w-full text-center" title={lottieItem.name}>
                                {lottieItem.name}
                              </p>
                              {lottieItem.tags && lottieItem.tags.length > 0 && (
                                <p className="text-xs text-muted-foreground truncate w-full text-center" title={lottieItem.tags.join(', ')}>
                                  {lottieItem.tags.join(', ')}
                                </p>
                              )}
                            </CardContent>
                            <div className="p-2 border-t">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleImportLottie(lottieItem)}
                              >
                                Import
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Dialog for adding/editing emoji */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentEmoji ? "Edit" : "Add New"} Emoji</DialogTitle>
              <DialogDescription>
                {currentEmoji ? "Update the details of the emoji." : "Add a new emoji to the system."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Emoji name (e.g., Smiley Face)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Emoji code (e.g., :smiley:)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        // Optional: Clear imageUrl or previewUrl if type changes, if desired UX
                        // form.setValue("imageUrl", ""); 
                        // form.setValue("previewUrl", null);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select emoji type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="static">Static Image</SelectItem>
                          <SelectItem value="lottie">Lottie Animation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{watchedType === "lottie" ? "Lottie Animation URL / JSON Data" : "Static Image URL"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={watchedType === "lottie" ? "Enter Lottie URL, paste JSON, or upload file" : "Enter image URL (e.g., https://.../image.png)"}
                          {...field}
                          value={field.value ?? ''} // Ensure value is not null/undefined for Input
                          disabled={isDialogProcessingFile}
                        />
                      </FormControl>
                      {watchedType === "lottie" && (
                        <div className="mt-2">
                          <label htmlFor="dialog-lottie-upload"
                            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${isDialogProcessingFile ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            {isDialogProcessingFile ? "Processing..." : "Upload .json/.lottie File"}
                          </label>
                          <input
                            type="file"
                            id="dialog-lottie-upload"
                            accept=".json,.lottie"
                            onChange={handleDialogLottieFileChange}
                            style={{ display: 'none' }} // Hide the default input styling
                            disabled={isDialogProcessingFile}
                          />
                        </div>
                      )}
                      <FormDescription>
                        {watchedType === "lottie"
                          ? "Direct URL, raw Lottie JSON data, or upload a file."
                          : "Direct URL of the static emoji image (PNG, GIF, JPG, SVG)."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previewUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Static Preview Thumbnail URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="URL for a static thumbnail (e.g., .png, .jpg)" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        Optional: A static image URL for a thumbnail. Useful for Lottie previews in lists or as a fallback.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Live Preview Section */}
                <div className="mt-4 p-4 border rounded-md bg-muted/30">
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Live Preview:</h4>
                  <div className="flex justify-center items-center min-h-[60px]">
                    <EmojiPreview emoji={{ type: watchedType, imageUrl: watchedImageUrl, previewUrl: watchedPreviewUrl, name: watchedName }} />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(cosmeticsConfig.emojiCategories).map((cat: EmojiCategory) => (
                            <SelectItem key={cat.key} value={cat.key}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isLocked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Locked Emoji</FormLabel>
                        <FormDescription>
                          Determine if this emoji requires unlocking.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("isLocked") && (
                  <>
                    <FormField
                      control={form.control}
                      name="unlockType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unlock Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unlock method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(cosmeticsConfig.emojiUnlockMethods).map((method: EmojiUnlockMethod) => (
                                <SelectItem key={method.key} value={method.key}>
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("unlockType") === "shop" && (
                      <FormField
                        control={form.control}
                        name="priceDgt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (DGT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="100"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch("unlockType") === "xp" && (
                      <FormField
                        control={form.control}
                        name="requiredPathXP"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Required XP</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1000"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                <DialogFooter>
                  <Button type="submit" disabled={createEmojiMutation.isPending || updateEmojiMutation.isPending}>
                    {currentEmoji ? "Update" : "Create"} Emoji
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the emoji "{currentEmoji?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteEmojiMutation.isPending}
              >
                {deleteEmojiMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}