import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
import { Settings2, RefreshCw } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [selectedSupplier, setSelectedSupplier] = useState<"dataxpress" | "hubnet">("dataxpress");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const { data: settings, isLoading } = useQuery<{ activeSupplier: "dataxpress" | "hubnet" }>({
    queryKey: ["/api/settings/supplier"],
  });

  useEffect(() => {
    if (settings) {
      setSelectedSupplier(settings.activeSupplier);
    }
  }, [settings]);

  const handleSwitchSupplier = async () => {
    setIsSwitching(true);
    try {
      const response = await fetch("/api/settings/supplier", {
        method: "POST",
        body: JSON.stringify({ supplier: selectedSupplier }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to switch supplier");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/settings/supplier"] });
      
      toast({
        title: "Supplier Switched",
        description: `All new orders will now be sent to ${selectedSupplier === "dataxpress" ? "DataXpress" : "Hubnet"}`,
      });

      setShowConfirmDialog(false);
    } catch (error: any) {
      toast({
        title: "Failed to Switch Supplier",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const handleSelectChange = (value: "dataxpress" | "hubnet") => {
    setSelectedSupplier(value);
    if (value !== settings?.activeSupplier) {
      setShowConfirmDialog(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeSupplier = settings?.activeSupplier || "dataxpress";
  const hasChanges = selectedSupplier !== activeSupplier;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings2 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your platform configuration</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Management</CardTitle>
          <CardDescription>
            Select which supplier to use for fulfilling all new orders. This change affects all future orders only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div>
                <p className="text-sm font-medium">Current Active Supplier</p>
                <p className="text-2xl font-bold mt-1">
                  {activeSupplier === "dataxpress" ? "DataXpress" : "Hubnet"}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" data-testid="status-active-supplier" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-select">Switch Supplier</Label>
              <Select value={selectedSupplier} onValueChange={handleSelectChange}>
                <SelectTrigger id="supplier-select" data-testid="select-supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dataxpress" data-testid="option-dataxpress">DataXpress</SelectItem>
                  <SelectItem value="hubnet" data-testid="option-hubnet">Hubnet</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                All new orders will be automatically sent to the selected supplier for fulfillment
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <h4 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">Important Notes</h4>
            <ul className="text-sm space-y-1 text-yellow-800 dark:text-yellow-200">
              <li>• Switching suppliers only affects NEW orders placed after the switch</li>
              <li>• Existing orders will continue to be tracked with their original supplier</li>
              <li>• Make sure you have sufficient balance with the selected supplier</li>
              <li>• No automatic failover - all orders go to the active supplier only</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Supplier Switch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to switch to <strong>{selectedSupplier === "dataxpress" ? "DataXpress" : "Hubnet"}</strong>?
              <br /><br />
              All new orders will be automatically sent to {selectedSupplier === "dataxpress" ? "DataXpress" : "Hubnet"} for fulfillment 
              until you manually switch suppliers again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setSelectedSupplier(activeSupplier);
                setShowConfirmDialog(false);
              }}
              data-testid="button-cancel-switch"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSwitchSupplier} 
              disabled={isSwitching}
              data-testid="button-confirm-switch"
            >
              {isSwitching ? (
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
