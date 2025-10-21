import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Package, InsertOrder } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";

const checkoutSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[0-9]+$/, "Invalid phone number"),
  email: z.string().email("Invalid email address"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function Checkout() {
  const [, params] = useRoute("/checkout/:packageId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const packageId = params?.packageId;

  const { data: pkg, isLoading: isLoadingPackage } = useQuery<Package>({
    queryKey: ["/api/packages", packageId],
    enabled: !!packageId,
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phoneNumber: "",
      email: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return await res.json();
    },
    onSuccess: (data: { order: any; authorizationUrl: string }) => {
      if (!window.PaystackPop) {
        toast({
          title: "Error",
          description: "Payment system not loaded. Please refresh the page.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
        email: data.order.email,
        amount: Math.round(Number(data.order.amount) * 100),
        currency: "GHS", // Ghanaian Cedis
        ref: data.order.paystackReference,
        onClose: () => {
          setIsProcessingPayment(false);
          toast({
            title: "Payment Cancelled",
            description: "You closed the payment window.",
          });
        },
        callback: (response: any) => {
          setIsProcessingPayment(false);
          setLocation(`/confirmation/${response.reference}`);
        },
      });

      handler.openIframe();
    },
    onError: (error: Error) => {
      setIsProcessingPayment(false);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    if (!pkg) return;

    setIsProcessingPayment(true);
    // Only send packageId, phoneNumber, email - server determines amount/status
    createOrderMutation.mutate({
      packageId: pkg.id,
      phoneNumber: data.phoneNumber,
      email: data.email,
    } as any);
  };

  if (isLoadingPackage) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Skeleton className="mb-6 h-32 w-full" />
          <Skeleton className="mb-4 h-12 w-full" />
          <Skeleton className="mb-4 h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Package not found</h1>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Order Summary */}
        <div className="mb-6 rounded-lg border-l-4 border-l-ring bg-card p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
          <div className="space-y-2 text-base">
            <p>
              <span className="text-muted-foreground">Package:</span>{" "}
              <strong className="ml-2 rounded bg-foreground px-2 py-0.5 text-primary">
                {pkg.dataAmount}
              </strong>
            </p>
            <p>
              <span className="text-muted-foreground">Amount:</span>{" "}
              <strong className="ml-2 rounded bg-foreground px-2 py-0.5 text-primary">
                GH¢{Number(pkg.price).toFixed(2)}
              </strong>
            </p>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="rounded-lg bg-card p-6 shadow-md">
          <h2 className="mb-6 text-xl font-bold">Contact Information</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 0244123456"
                        {...field}
                        data-testid="input-phone"
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                        data-testid="input-email"
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full text-base font-bold sm:text-lg"
                disabled={isProcessingPayment}
                data-testid="button-pay"
              >
                {isProcessingPayment ? "Processing..." : `Pay GH¢${Number(pkg.price).toFixed(2)}`}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Secure payment powered by Paystack
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
