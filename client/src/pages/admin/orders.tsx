import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { OrderWithPackage } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Pencil, Trash2, Send } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminOrders() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [editingOrder, setEditingOrder] = useState<OrderWithPackage | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

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

  const { data: orders, isLoading } = useQuery<OrderWithPackage[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      setEditingOrder(null);
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
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/orders/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
      setDeletingOrderId(null);
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
        description: error.message || "Failed to delete order",
        variant: "destructive",
      });
    },
  });

  const fulfillOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/orders/${id}/fulfill`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order sent to DataXpress for fulfillment",
      });
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
        description: error.message || "Failed to fulfill order",
        variant: "destructive",
      });
    },
  });

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  const handleEdit = (order: OrderWithPackage) => {
    setEditingOrder(order);
    setNewStatus(order.status);
  };

  const handleUpdate = () => {
    if (editingOrder && newStatus) {
      updateOrderMutation.mutate({ id: editingOrder.id, status: newStatus });
    }
  };

  const handleDelete = () => {
    if (deletingOrderId) {
      deleteOrderMutation.mutate(deletingOrderId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">View and manage all customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const canFulfill = order.status === "completed" && 
                      (order.fulfillmentStatus === "pending" || order.fulfillmentStatus === "failed");
                    
                    return (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell className="font-medium">{order.package?.dataAmount}</TableCell>
                        <TableCell>{order.phoneNumber}</TableCell>
                        <TableCell>{order.email}</TableCell>
                        <TableCell>GH₵{Number(order.amount).toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">GH₵{Number(order.fee || 0).toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">GH₵{Number(order.totalAmount || order.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                order.status === "completed"
                                  ? "bg-chart-3"
                                  : order.status === "pending"
                                  ? "bg-primary"
                                  : order.status === "processing"
                                  ? "bg-ring"
                                  : "bg-destructive"
                              }`}
                            />
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  order.fulfillmentStatus === "fulfilled"
                                    ? "bg-chart-3"
                                    : order.fulfillmentStatus === "processing"
                                    ? "bg-ring"
                                    : order.fulfillmentStatus === "failed"
                                    ? "bg-destructive"
                                    : "bg-muted"
                                }`}
                              />
                              <span className="capitalize text-sm">
                                {order.fulfillmentStatus || "pending"}
                              </span>
                            </div>
                            {order.fulfillmentError && (
                              <span className="text-xs text-destructive">
                                {order.fulfillmentError}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canFulfill && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fulfillOrderMutation.mutate(order.id)}
                                disabled={fulfillOrderMutation.isPending}
                                data-testid={`button-fulfill-${order.id}`}
                                title="Send data to customer"
                              >
                                <Send className="h-4 w-4 text-chart-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(order)}
                              data-testid={`button-edit-${order.id}`}
                            >
                              <Pencil className="h-4 w-4 text-ring" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingOrderId(order.id)}
                              data-testid={`button-delete-${order.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order {editingOrder?.package?.dataAmount}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger data-testid="select-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateOrderMutation.isPending}
              data-testid="button-save-order"
            >
              {updateOrderMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingOrderId} onOpenChange={() => setDeletingOrderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingOrderId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteOrderMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteOrderMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
