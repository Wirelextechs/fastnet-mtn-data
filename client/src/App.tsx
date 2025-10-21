import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import Confirmation from "@/pages/confirmation";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminPackages from "@/pages/admin/packages";

function Router() {
  return (
    <Switch>
      {/* Public customer routes */}
      <Route path="/" component={Home} />
      <Route path="/checkout/:packageId" component={Checkout} />
      <Route path="/confirmation/:reference" component={Confirmation} />

      {/* Admin routes - pages handle auth redirect */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/packages" component={AdminPackages} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex items-center gap-4 border-b p-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const currentPath = window.location.pathname;
  const isAdminRoute = currentPath.startsWith("/admin");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-black">
            Fast<span className="text-primary">Net</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle admin route access
  if (isAdminRoute) {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = "/api/login";
      return null;
    }
    
    if (!isAdmin) {
      // Authenticated but not admin - show access denied
      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
            <p className="mb-6 text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="rounded bg-primary px-4 py-2 font-semibold text-primary-foreground"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }
    
    // Authenticated and admin - show admin layout
    return (
      <AdminLayout>
        <Router />
      </AdminLayout>
    );
  }

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
