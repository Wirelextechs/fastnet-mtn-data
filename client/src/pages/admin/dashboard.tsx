import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingCart, Clock, CheckCircle2, Wallet } from "lucide-react";
import type { OrderWithPackage } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

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

  const { data: orders, isLoading: isLoadingOrders } = useQuery<OrderWithPackage[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const { data: packages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ["/api/packages"],
  });

  const { data: walletData, isLoading: isLoadingWallet } = useQuery<{
    balance: string;
    currency: string;
  }>({
    queryKey: ["/api/wallet/balance"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  const completedOrders = orders?.filter((o) => o.status === "completed").length || 0;

  const recentOrders = orders?.slice(0, 5) || [];

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-ring",
      testId: "stat-total-orders",
    },
    {
      title: "Total Revenue",
      value: `GH¢${totalRevenue.toFixed(2)}`,
      icon: Package,
      color: "text-primary",
      testId: "stat-revenue",
    },
    {
      title: "DataXpress Balance",
      value: isLoadingWallet ? "..." : walletData ? `${walletData.currency} ${Number(walletData.balance).toFixed(2)}` : "N/A",
      icon: Wallet,
      color: "text-chart-3",
      testId: "stat-wallet-balance",
    },
    {
      title: "Pending",
      value: pendingOrders,
      icon: Clock,
      color: "text-primary",
      testId: "stat-pending",
    },
    {
      title: "Completed",
      value: completedOrders,
      icon: CheckCircle2,
      color: "text-chart-3",
      testId: "stat-completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your MTN data sales</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={stat.testId}>
                {isLoadingOrders ? <Skeleton className="h-8 w-20" /> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover-elevate"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex-1">
                    <p className="font-semibold">{order.package?.dataAmount}</p>
                    <p className="text-sm text-muted-foreground">{order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">GH¢{Number(order.amount).toFixed(2)}</p>
                    <div className="flex items-center justify-end gap-1.5 text-sm">
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
                      <span className="capitalize text-muted-foreground">{order.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
