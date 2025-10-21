import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle } from "lucide-react";
import type { OrderWithPackage } from "@shared/schema";

export default function Confirmation() {
  const [, params] = useRoute("/confirmation/:reference");
  const [, setLocation] = useLocation();

  const reference = params?.reference;

  const { data: order, isLoading } = useQuery<OrderWithPackage>({
    queryKey: ["/api/orders/reference", reference],
    enabled: !!reference,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <Skeleton className="mx-auto mb-6 h-20 w-20 rounded-full" />
          <Skeleton className="mx-auto mb-4 h-8 w-64" />
          <Skeleton className="mx-auto mb-6 h-32 w-full" />
          <Skeleton className="mx-auto h-12 w-48" />
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
            <CheckCircle2 className="mx-auto h-20 w-20 text-chart-3" data-testid="icon-success" />
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
                ₦{Number(order.amount).toFixed(2)}
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
