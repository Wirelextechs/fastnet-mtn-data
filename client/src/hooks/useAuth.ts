import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }), // Return null instead of throwing on 401
    retry: false,
  });

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };
}
