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

  // State for Manual Lottie Upload
  const [manualUploadFile, setManualUploadFile] = useState<File | null>(null);
  const [manualUploadDataString, setManualUploadDataString] = useState<string | null>(null);
  const [manualUploadPreviewKey, setManualUploadPreviewKey] = useState<string>(Date.now().toString());
  const [manualUploadError, setManualUploadError] = useState<string | null>(null);
  const [manualUploadNameSuggestion, setManualUploadNameSuggestion] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

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
    mutationFn: (newEmoji: EmojiFormValues) =>
      apiRequest("/api/admin/emojis", {
        method: "POST",
        data: {
          ...newEmoji,
          url: newEmoji.imageUrl,
          preview_url: newEmoji.previewUrl,
          is_locked: newEmoji.isLocked,
          unlock_type: newEmoji.unlockType,
          price_dgt: newEmoji.priceDgt,
          required_path_xp: newEmoji.requiredPathXP,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emojis"] });
      setIsOpen(false);
      toast({
        title: "Emoji created",
        description: "The emoji has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create emoji",
        description: error.message || "There was an error creating the emoji.",
        variant: "destructive",
      });
    },
  });

  // Update emoji mutation
  const updateEmojiMutation = useMutation({
    mutationFn: ({ id, emoji }: { id: number; emoji: EmojiFormValues }) =>
      apiRequest(`/api/admin/emojis/${id}`, {
        method: "PUT",
        data: {
          ...emoji,
          url: emoji.imageUrl,
          preview_url: emoji.previewUrl,
          is_locked: emoji.isLocked,
          unlock_type: emoji.unlockType,
          price_dgt: emoji.priceDgt,
          required_path_xp: emoji.requiredPathXP,
        },
      }),
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
      apiRequest(`/api/admin/emojis/${id}`, {
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

  // Form submission
  const onSubmit = (values: EmojiFormValues) => {
    if (currentEmoji) {
      updateEmojiMutation.mutate({ id: currentEmoji.id, emoji: values });
    } else {
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

  // Function to search LottieFiles API
  const searchLottieAnimations = useCallback(async () => {
    if (!lottieSearchTerm.trim()) {
      setLottieResults([]);
      setLottieSearchError(null);
      return;
    }
    setIsLoadingLotties(true);
    setLottieSearchError(null);
    console.log(`Searching LottieFiles for: "${lottieSearchTerm}"`); // DEBUG
    try {
      const response = await fetch(
        `https://api.lottiefiles.com/v2/search/animations?q=${encodeURIComponent(lottieSearchTerm)}`
      );

      console.log("Lottie API Response Status:", response.status); // DEBUG

      if (!response.ok) {
        let errorData = { message: "Unknown server error" };
        try {
          errorData = await response.json();
          console.error("Lottie API Error Data:", errorData); // DEBUG
        } catch (e) {
          console.error("Failed to parse error JSON from Lottie API", e); // DEBUG
        }
        throw new Error(
          `Failed to fetch animations: ${response.status} ${response.statusText} - ${errorData.message || 'Server error'}`
        );
      }

      const data: LottieApiSearchResponse = await response.json();
      console.log("Lottie API Success Data:", JSON.stringify(data, null, 2)); // DEBUG

      if (!data.animations || !data.animations.results) {
        console.error("Lottie API Response missing animations.results:", data);
        throw new Error("Invalid API response structure from LottieFiles.");
      }

      const simplifiedResults: SimplifiedLottieItem[] = data.animations.results.map(({ node }) => ({
        id: node.id,
        name: node.name,
        tags: node.tags || [],
        author: node.author || "Unknown",
        animationUrl: node.lottie_link || node.json_link, // Prefer .lottie if available
        previewImageUrl: node.preview_url,
      }));

      console.log("Simplified Lottie Results:", simplifiedResults); // DEBUG
      setLottieResults(simplifiedResults);

      if (simplifiedResults.length === 0) {
        setLottieSearchError(`No results found for "${lottieSearchTerm}".`);
      }
    } catch (error: any) {
      console.error("Error fetching Lottie animations:", error);
      setLottieSearchError(error.message || "An unexpected error occurred while searching.");
      setLottieResults([]);
      toast({
        title: "Lottie Search Failed",
        description: error.message || "Could not fetch animations from LottieFiles.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLotties(false);
    }
  }, [lottieSearchTerm, toast]);

  // Handle file selection for manual Lottie upload
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setManualUploadFile(null);
      setManualUploadDataString(null);
      setManualUploadError(null);
      setManualUploadNameSuggestion(null);
      return;
    }

    setIsProcessingFile(true);
    setManualUploadFile(file);
    setManualUploadError(null);
    setManualUploadDataString(null);

    // Suggest name from filename (without extension)
    const fileName = file.name.split('.').slice(0, -1).join('.') || file.name;
    setManualUploadNameSuggestion(fileName);

    if (!file.type.includes("json") && !file.name.endsWith(".lottie")) {
      setManualUploadError("Invalid file type. Please upload a .json or .lottie file.");
      setIsProcessingFile(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Attempt to parse to ensure it's valid JSON (Lottie files are JSON)
        JSON.parse(text);
        setManualUploadDataString(text);
        setManualUploadPreviewKey(Date.now().toString()); // Force re-render preview
      } catch (err) {
        console.error("Error parsing Lottie file:", err);
        setManualUploadError("Invalid Lottie JSON structure in the file.");
        setManualUploadDataString(null);
      }
      setIsProcessingFile(false);
    };
    reader.onerror = () => {
      setManualUploadError("Failed to read the file.");
      setIsProcessingFile(false);
    };
    reader.readAsText(file);
  };

  // Handle import of manually uploaded Lottie
  const handleImportManualLottie = () => {
    if (!manualUploadDataString) {
      toast({
        title: "Import Error",
        description: "No Lottie data to import. Please upload a valid file first.",
        variant: "destructive",
      });
      return;
    }
    setCurrentEmoji(null); // Ensure it's a new emoji creation
    const suggestedName = manualUploadNameSuggestion || "Uploaded Lottie";
    const slugifiedName = suggestedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    form.reset({
      name: suggestedName,
      code: `:lottie-${slugifiedName}:`, // Auto-generate code
      imageUrl: manualUploadDataString, // Store the RAW JSON string here
      previewUrl: null, // Manually uploaded Lotties might not have a separate static preview URL easily
      category: cosmeticsConfig.emojiCategories.lottie?.key || cosmeticsConfig.emojiCategories.standard.key,
      isLocked: true,
      unlockType: cosmeticsConfig.emojiUnlockMethods.shop.key,
      type: "lottie",
      priceDgt: 5,
      requiredPathXP: null,
      tags: [], // TODO: Could potentially try to extract tags if Lottie JSON has them, or let admin add manually
    });
    setIsOpen(true);
    // Clear manual upload state after initiating import
    setManualUploadFile(null);
    setManualUploadDataString(null);
    setManualUploadError(null);
    setManualUploadNameSuggestion(null);
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
                      Search for Lottie animations from LottieFiles and import them, or upload your own.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* LottieFiles API Search Section */}
                    <div className="space-y-4 p-4 border rounded-md">
                      <h3 class="text-lg font-semibold">Search LottieFiles.com</h3>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="search"
                          placeholder="Search LottieFiles... (e.g., 'checkmark', 'loading')"
                          value={lottieSearchTerm}
                          onChange={(e) => setLottieSearchTerm(e.target.value)}
                          className="flex-grow"
                        />
                        <Button onClick={searchLottieAnimations} disabled={isLoadingLotties || !lottieSearchTerm.trim()}>
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
                    </div>

                    {/* Manual Upload Section */}
                    <div className="space-y-4 p-4 border rounded-md">
                      <h3 class="text-lg font-semibold">Manual Lottie Upload</h3>
                      <Input
                        id="manual-lottie-upload"
                        type="file"
                        accept=".json,.lottie"
                        onChange={handleFileChange}
                        disabled={isProcessingFile}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      {isProcessingFile && <p className="text-sm text-muted-foreground">Processing file...</p>}
                      {manualUploadError && (
                        <p className="text-sm text-destructive">Error: {manualUploadError}</p>
                      )}
                      {manualUploadDataString && !manualUploadError && (
                        <div className="mt-4 p-4 border rounded-md bg-muted/10 flex flex-col items-center space-y-4">
                          <h4 className="text-md font-medium">Preview: {manualUploadNameSuggestion || 'Uploaded Lottie'}</h4>
                          <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden bg-white">
                            <Lottie
                              animationData={JSON.parse(manualUploadDataString)}
                              loop
                              style={{ width: 120, height: 120 }}
                              key={manualUploadPreviewKey}
                            />
                          </div>
                          <Button
                            onClick={handleImportManualLottie}
                            disabled={!manualUploadDataString || isProcessingFile}
                          >
                            Import this Lottie
                          </Button>
                        </div>
                      )}
                    </div>

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
                      <FormLabel>{watchedType === "lottie" ? "Lottie Animation URL" : "Static Image URL"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={watchedType === "lottie" ? "Enter Lottie JSON URL (e.g., https://.../animation.json)" : "Enter image URL (e.g., https://.../image.png)"}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>
                        {watchedType === "lottie"
                          ? "Direct URL to the Lottie JSON animation file."
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