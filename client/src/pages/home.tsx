import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Package } from "@shared/schema";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const { data: packages, isLoading } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  const activePackages = packages?.filter(pkg => pkg.isActive) || [];

  const handleContinue = () => {
    if (selectedPackageId) {
      setLocation(`/checkout/${selectedPackageId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header with Logo */}
        <div className="mb-8 rounded-lg bg-foreground p-6 text-center shadow-md">
          <h1 className="text-4xl font-black tracking-tight text-background sm:text-5xl">
            Fast<span className="text-primary">Net</span>
          </h1>
          <p className="mt-2 text-sm text-background/70 sm:text-base">NON-EXPIRY MTN DATA</p>
        </div>

        {/* Package Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {activePackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackageId(pkg.id)}
                data-testid={`card-package-${pkg.id}`}
                className={`group relative rounded-lg bg-card p-5 text-center shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  selectedPackageId === pkg.id
                    ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                    : ""
                }`}
              >
                {selectedPackageId === pkg.id && (
                  <div className="absolute right-2 top-2">
                    <Check className="h-6 w-6 text-ring" data-testid={`checkmark-${pkg.id}`} />
                  </div>
                )}
                <h2 className="mb-1 text-2xl font-bold text-ring sm:text-3xl">{pkg.dataAmount}</h2>
                <p className="mb-3 text-xs font-medium uppercase text-muted-foreground sm:text-sm">
                  Non-Expiry
                </p>
                <div className="inline-block rounded bg-foreground px-3 py-1.5">
                  <span className="text-lg font-extrabold text-primary sm:text-xl">
                    ₦{Number(pkg.price).toFixed(0)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-8">
          <Button
            onClick={handleContinue}
            disabled={!selectedPackageId}
            size="lg"
            variant="default"
            className="w-full text-base font-bold sm:text-lg"
            data-testid="button-continue-checkout"
          >
            Continue to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
