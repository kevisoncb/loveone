import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase"; // You will create this file
import { onAuthStateChanged, signOut, User } from "firebase/auth";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const utils = trpc.useUtils();

  const syncUserMutation = trpc.auth.syncUser.useMutation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const idToken = await user.getIdToken();
        try {
          await syncUserMutation.mutateAsync({ idToken });
          await utils.auth.me.invalidate();
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserMutation, utils.auth.me]);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !!firebaseUser, // Only run query if Firebase user is logged in
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = async () => {
    await signOut(auth);
    await utils.auth.me.invalidate();
    utils.auth.me.setData(undefined, null);
  };

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: loading || meQuery.isLoading,
      error: meQuery.error,
      isAuthenticated: !!meQuery.data && !!firebaseUser,
      firebaseUser,
    };
  }, [meQuery.data, meQuery.error, meQuery.isLoading, loading, firebaseUser]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading || meQuery.isLoading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    loading,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
