import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from './admin-layout.tsx';
import {
  CirclePlus, Pencil, Trash2,
  Save, X, Image, Check,
  DollarSign, Coins, Package
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { economyConfig } from '@/config/economy.config.ts'; // [CONFIG-REFAC] economyConfig import

// Package interface
interface DgtPackage {
  id: string;
  name: string;
  description: string;
  dgt_amount: number;
  usd_price: string;
  image_url?: string;
  is_featured?: boolean;
  discount_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export default function AdminDgtPackagesPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<DgtPackage[]>([]);
  const [editingPackage, setEditingPackage] = useState<Partial<DgtPackage> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);

  // Fetch packages
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/dgt-packages'],
    async queryFn() {
      const response = await apiRequest('GET', '/api/admin/dgt-packages');
      if (!response.ok) {
        throw new Error('Failed to fetch DGT packages');
      }
      const data = await response.json();
      return data;
    },
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: async (packageData: Partial<DgtPackage>) => {
      // [CONFIG-REFAC] Example: If base prices are config-driven, apply logic here
      // packageData.usd_price = calculateDynamicPrice(packageData.dgt_amount, economyConfig.dgt.pegUSD);
      const response = await apiRequest('POST', '/api/admin/dgt-packages', packageData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create package');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Package Created',
        description: 'The DGT package has been created successfully',
      });
      setIsCreating(false);
      setEditingPackage(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dgt-packages'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create package',
      });
    },
  });

  // Update package mutation
  const updatePackageMutation = useMutation({
    mutationFn: async (packageData: Partial<DgtPackage>) => {
      if (!packageData.id) throw new Error('Package ID is required');
      // [CONFIG-REFAC] Example: If base prices are config-driven, apply logic here
      // packageData.usd_price = calculateDynamicPrice(packageData.dgt_amount, economyConfig.dgt.pegUSD);
      const response = await apiRequest(
        'PATCH',
        `/api/admin/dgt-packages/${packageData.id}`,
        packageData
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update package');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Package Updated',
        description: 'The DGT package has been updated successfully',
      });
      setEditingPackage(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dgt-packages'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update package',
      });
    },
  });

  // Delete package mutation
  const deletePackageMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/dgt-packages/${packageId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete package');
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Package Deleted',
        description: 'The DGT package has been deleted successfully',
      });
      setIsConfirmingDelete(false);
      setDeletingPackageId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dgt-packages'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete package',
      });
    },
  });

  // Update packages when data changes
  useEffect(() => {
    if (data) {
      setPackages(data);
    }
  }, [data]);

  // Handle create new package
  const handleCreateNew = () => {
    setEditingPackage({
      name: '',
      description: '',
      dgt_amount: 0,
      usd_price: '',
      is_featured: false,
      discount_percentage: 0,
    });
    setIsCreating(true);
  };

  // Handle edit package
  const handleEdit = (pkg: DgtPackage) => {
    setEditingPackage({ ...pkg });
    setIsCreating(false);
  };

  // Handle delete confirmation
  const handleConfirmDelete = (packageId: string) => {
    setDeletingPackageId(packageId);
    setIsConfirmingDelete(true);
  };

  // Execute delete
  const executeDelete = () => {
    if (deletingPackageId) {
      deletePackageMutation.mutate(deletingPackageId);
    }
  };

  // Handle save
  const handleSave = () => {
    if (!editingPackage) return;

    // Validate required fields
    if (!editingPackage.name || !editingPackage.dgt_amount || !editingPackage.usd_price) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name, DGT amount, and price are required fields',
      });
      return;
    }

    // Ensure price is formatted correctly
    const price = parseFloat(editingPackage.usd_price.toString());
    if (isNaN(price) || price <= 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Price must be a positive number',
      });
      return;
    }

    // Format the package data
    const packageData = {
      ...editingPackage,
      dgt_amount: Number(editingPackage.dgt_amount),
      usd_price: price.toFixed(2), // [CONFIG-REFAC] Price formatting, ensure this aligns with any config rules for display vs storage
      discount_percentage: editingPackage.discount_percentage
        ? Number(editingPackage.discount_percentage)
        : undefined, // [CONFIG-REFAC] Discount from config or 0
    };

    // Create or update based on mode
    if (isCreating) {
      createPackageMutation.mutate(packageData);
    } else {
      updatePackageMutation.mutate(packageData);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingPackage(null);
    setIsCreating(false);
  };

  // Format price for display
  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Determine if we're in a loading state for any mutation
  const isMutating =
    createPackageMutation.isPending ||
    updatePackageMutation.isPending ||
    deletePackageMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">DGT Packages</h2>
            <p className="text-muted-foreground">
              Manage DGT token packages available for purchase
            </p>
          </div>

          <Button onClick={handleCreateNew} disabled={!!editingPackage || isMutating}>
            <CirclePlus className="h-4 w-4 mr-2" />
            Add New Package
          </Button>
        </div>

        {/* Editor Card */}
        {editingPackage && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>{isCreating ? 'Create New Package' : 'Edit Package'}</CardTitle>
              <CardDescription>
                {isCreating
                  ? 'Define a new DGT package for users to purchase'
                  : 'Modify the properties of this DGT package'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Package Name</Label>
                    <Input
                      id="name"
                      value={editingPackage.name || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                      placeholder="e.g. Standard Pack"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingPackage.description || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                      placeholder="Description of the package benefits"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL (optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image_url"
                        value={editingPackage.image_url || ''}
                        onChange={(e) => setEditingPackage({ ...editingPackage, image_url: e.target.value })}
                        placeholder="https://example.com/image.png"
                      />
                      {editingPackage.image_url && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(editingPackage.image_url, '_blank')}
                          type="button"
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dgt_amount">DGT Amount</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="dgt_amount"
                        value={editingPackage.dgt_amount || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setEditingPackage({
                            ...editingPackage,
                            dgt_amount: isNaN(value) ? 0 : value
                          });
                        }}
                        type="number"
                        min="1"
                        className="rounded-l-none"
                        placeholder="1000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usd_price">Price (USD)</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="usd_price"
                        value={editingPackage.usd_price || ''}
                        onChange={(e) => {
                          // Allow only valid price inputs
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setEditingPackage({ ...editingPackage, usd_price: value });
                        }}
                        placeholder="24.99"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_percentage">Discount Percentage (optional)</Label>
                    <div className="flex">
                      <Input
                        id="discount_percentage"
                        value={editingPackage.discount_percentage || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setEditingPackage({
                            ...editingPackage,
                            discount_percentage: isNaN(value) ? undefined : Math.min(99, Math.max(0, value))
                          });
                        }}
                        type="number"
                        min="0"
                        max="99"
                        placeholder="10"
                      />
                      <div className="flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted">
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                      id="is_featured"
                      checked={editingPackage.is_featured || false}
                      onCheckedChange={(checked) =>
                        setEditingPackage({
                          ...editingPackage,
                          is_featured: !!checked
                        })
                      }
                    />
                    <Label htmlFor="is_featured">Mark as featured package</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isMutating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={isMutating}
                >
                  {isMutating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Package
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table of Packages */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading packages: {(error as Error).message}
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No DGT packages found</p>
                <p className="text-sm">Create your first package to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>DGT Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{pkg.name}</span>
                          <span className="text-xs text-muted-foreground">{pkg.description}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center">
                          <Coins className="h-4 w-4 mr-1.5 text-amber-500" />
                          {pkg.dgt_amount.toLocaleString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatPrice(pkg.usd_price)}</span>
                          {pkg.discount_percentage && pkg.discount_percentage > 0 && (
                            <span className="text-xs text-green-500">
                              {pkg.discount_percentage}% discount
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {pkg.is_featured ? (
                          <Badge variant="default">Featured</Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(pkg)}
                            disabled={!!editingPackage || isMutating}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-600"
                            onClick={() => handleConfirmDelete(pkg.id)}
                            disabled={!!editingPackage || isMutating}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the DGT package
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletePackageMutation.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeDelete}
                disabled={deletePackageMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deletePackageMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}