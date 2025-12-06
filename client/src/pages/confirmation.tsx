import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { OrderWithPackage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Confirmation() {
  const [, params] = useRoute("/confirmation/:reference");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const reference = params?.reference;

  const { data: order, isLoading, refetch } = useQuery<OrderWithPackage>({
    queryKey: ["/api/orders/reference", reference],
    enabled: !!reference,
  });

  // Verify payment when page loads
  useEffect(() => {
    if (!reference) return;
    
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        setVerificationError(null);
        
        const res = await apiRequest("POST", `/api/orders/verify/${reference}`);
        const result = await res.json();
        
        if (result.success) {
          // Refetch order to get updated status
          await refetch();
          queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        } else {
          setVerificationError(result.message || "Payment verification pending");
        }
      } catch (error: any) {
        setVerificationError(error.message || "Failed to verify payment");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [reference, refetch, queryClient]);

  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Verifying Payment...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Order not found</h1>
          <Button onClick={() => setLocation("/")} data-testid="button-home">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isSuccess = order.status === "completed";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        {/* Success/Error Icon */}
        <div className="mb-6">
          {isSuccess ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" data-testid="icon-success" />
            </div>
          ) : (
            <XCircle className="mx-auto h-20 w-20 text-destructive" data-testid="icon-error" />
          )}
        </div>

        {/* Title */}
        <h1 className="mb-2 text-3xl font-bold">
          {isSuccess ? "Payment Successful!" : "Payment Processing"}
        </h1>
        <p className="mb-8 text-muted-foreground">
          {isSuccess
            ? "Your MTN data package is being delivered"
            : "Your payment is being verified"}
        </p>

        {/* Order Details */}
        <div className="mb-8 rounded-lg bg-card p-6 shadow-md text-left">
          <h2 className="mb-4 text-lg font-bold">Order Details</h2>
          <div className="space-y-3 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Package:</span>
              <span className="font-semibold" data-testid="text-package">
                {order.package?.dataAmount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold" data-testid="text-amount">
                GH¢{Number(order.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-semibold" data-testid="text-phone">
                {order.phoneNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold" data-testid="text-email">
                {order.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span
                className={`inline-flex items-center gap-1.5 font-semibold ${
                  isSuccess ? "text-chart-3" : "text-primary"
                }`}
                data-testid="text-status"
              >
                <span className={`h-2 w-2 rounded-full ${isSuccess ? "bg-chart-3" : "bg-primary"}`} />
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            {order.paystackReference && (
              <div className="flex flex-col gap-1 border-t pt-3">
                <span className="text-muted-foreground">Reference:</span>
                <code
                  className="rounded bg-muted px-2 py-1 font-mono text-xs sm:text-sm"
                  data-testid="text-reference"
                >
                  {order.paystackReference}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => setLocation("/")}
          size="lg"
          variant="default"
          className="font-bold"
          data-testid="button-new-purchase"
        >
          Make Another Purchase
        </Button>
      </div>
    </div>
  );
}
