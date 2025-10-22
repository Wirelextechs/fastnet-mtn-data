import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Package, InsertPackage } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

const packageSchema = z.object({
  dataAmount: z.string().min(1, "Data amount is required"),
  price: z.string().min(1, "Customer price is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Customer price must be a positive number",
  }),
  supplierCost: z.string().min(1, "Supplier cost is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Supplier cost must be a positive number",
  }),
  isActive: z.boolean().default(true),
});

type PackageFormData = z.infer<typeof packageSchema>;

export default function AdminPackages() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isAuthLoading, toast]);

  const { data: packagesData, isLoading } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  // Sort packages by data amount (1GB -> 100GB)
  const packages = packagesData?.sort((a, b) => {
    const getNumericValue = (dataAmount: string) => {
      const match = dataAmount.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : 0;
    };
    return getNumericValue(a.dataAmount) - getNumericValue(b.dataAmount);
  });

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      dataAmount: "",
      price: "",
      supplierCost: "",
      isActive: true,
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: InsertPackage) => {
      return await apiRequest("POST", "/api/packages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Success",
        description: "Package created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create package",
        variant: "destructive",
      });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPackage> }) => {
      return await apiRequest("PATCH", `/api/packages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Success",
        description: "Package updated successfully",
      });
      setIsDialogOpen(false);
      setEditingPackage(null);
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update package",
        variant: "destructive",
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/packages/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      setDeletingPackageId(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    },
  });

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    form.reset({
      dataAmount: pkg.dataAmount,
      price: pkg.price,
      supplierCost: pkg.supplierCost,
      isActive: pkg.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPackage(null);
    form.reset({
      dataAmount: "",
      price: "",
      supplierCost: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: PackageFormData) => {
    const packageData: InsertPackage = {
      dataAmount: data.dataAmount,
      price: data.price,
      supplierCost: data.supplierCost,
      isActive: data.isActive,
    };

    if (editingPackage) {
      updatePackageMutation.mutate({ id: editingPackage.id, data: packageData });
    } else {
      createPackageMutation.mutate(packageData);
    }
  };

  const handleDelete = () => {
    if (deletingPackageId) {
      deletePackageMutation.mutate(deletingPackageId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Management</h1>
          <p className="text-muted-foreground">Add, edit, or remove data packages</p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-add-package">
          <Plus className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !packages || packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">No packages yet</p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="relative" data-testid={`card-package-${pkg.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-2xl font-bold text-ring">{pkg.dataAmount}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(pkg)}
                      data-testid={`button-edit-package-${pkg.id}`}
                    >
                      <Pencil className="h-4 w-4 text-ring" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeletingPackageId(pkg.id)}
                      data-testid={`button-delete-package-${pkg.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="inline-block rounded bg-foreground px-3 py-1.5">
                  <span className="text-lg font-extrabold text-primary">
                    GH¢{Number(pkg.price).toFixed(0)}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Supplier Cost:</span>
                    <span className="font-medium">GH¢{Number(pkg.supplierCost).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Profit:</span>
                    <span className="font-medium text-chart-3">
                      GH¢{(Number(pkg.price) - Number(pkg.supplierCost)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={pkg.isActive ? "text-chart-3 font-semibold" : "text-muted-foreground"}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
            <DialogDescription>
              {editingPackage ? "Update package details" : "Create a new data package"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="dataAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5GB" {...field} data-testid="input-data-amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Price (GH¢)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 23.00"
                        {...field}
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplierCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Cost (GH¢)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 16.10"
                        {...field}
                        data-testid="input-supplier-cost"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Wholesale price from DataXpress</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Make this package available for purchase
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                  data-testid="button-save-package"
                >
                  {createPackageMutation.isPending || updatePackageMutation.isPending
                    ? "Saving..."
                    : editingPackage
                    ? "Update Package"
                    : "Create Package"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPackageId} onOpenChange={() => setDeletingPackageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this package? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPackageId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePackageMutation.isPending}
              data-testid="button-confirm-delete-package"
            >
              {deletePackageMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
