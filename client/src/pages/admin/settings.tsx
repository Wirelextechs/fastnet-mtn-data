import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertCircle, CheckCircle2, RefreshCw, Settings2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

type SupplierType = "dataxpress" | "hubnet";

interface SupplierSetting {
  activeSupplier: SupplierType;
}

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: authUser, isLoading: isAuthLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const isAuthenticated = !!authUser && !isAuthLoading;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the admin panel",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isAuthLoading, toast]);

  const { data: supplierData, isLoading: isLoadingSupplier } = useQuery<SupplierSetting>({
    queryKey: ["/api/settings/supplier"],
  });

  const switchSupplierMutation = useMutation({
    mutationFn: async (supplier: SupplierType) => {
      const response = await fetch("/api/settings/supplier", {
        method: "POST",
        body: JSON.stringify({ supplier }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to switch supplier");
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/supplier"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      toast({
        title: "Supplier switched",
        description: `All new orders will now be fulfilled by ${data.activeSupplier === "dataxpress" ? "DataXpress" : "Hubnet"}`,
      });
      setShowConfirmDialog(false);
      setSelectedSupplier(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to switch supplier",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      setShowConfirmDialog(false);
      setSelectedSupplier(null);
    },
  });

  const handleSupplierChange = (value: SupplierType) => {
    if (value !== supplierData?.activeSupplier) {
      setSelectedSupplier(value);
      setShowConfirmDialog(true);
    }
  };

  const confirmSwitch = () => {
    if (selectedSupplier) {
      switchSupplierMutation.mutate(selectedSupplier);
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  const currentSupplier = supplierData?.activeSupplier || "dataxpress";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-settings-title">Settings</h1>
        <p className="text-muted-foreground">
          Manage your FastNet platform configuration
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            <CardTitle>Supplier Management</CardTitle>
          </div>
          <CardDescription>
            Choose which supplier to use for fulfilling data orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Switching suppliers will affect all new orders. Existing orders will continue to use their original supplier.
              There is no automatic failover - you must manually switch if needed.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Active Supplier</label>
            <Select
              value={currentSupplier}
              onValueChange={handleSupplierChange}
              disabled={isLoadingSupplier || switchSupplierMutation.isPending}
            >
              <SelectTrigger className="w-full" data-testid="select-supplier">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dataxpress" data-testid="option-dataxpress">
                  DataXpress
                </SelectItem>
                <SelectItem value="hubnet" data-testid="option-hubnet">
                  Hubnet
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Currently using: {currentSupplier === "dataxpress" ? "DataXpress" : "Hubnet"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentSupplier === "dataxpress" 
                  ? "All new orders are being fulfilled through DataXpress API"
                  : "All new orders are being fulfilled through Hubnet API"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Supplier Information</h3>
            <div className="grid gap-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">DataXpress</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>• Real-time pricing sync available</p>
                  <p>• Supports 15 out of 17 packages</p>
                  <p>• Automatic cost price updates</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Hubnet</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>• Manual pricing configuration required</p>
                  <p>• Supports MTN, AT, and Big Time networks</p>
                  <p>• Set hubnetCost manually in package editor</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Supplier Switch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to switch to {selectedSupplier === "dataxpress" ? "DataXpress" : "Hubnet"}?
              <br /><br />
              <strong>This will affect all new orders immediately.</strong> Existing orders will continue to use their original supplier.
              There is no automatic failover between suppliers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-switch">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSwitch}
              data-testid="button-confirm-switch"
              disabled={switchSupplierMutation.isPending}
            >
              {switchSupplierMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                "Confirm Switch"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
