import { useEffect, useState } from "react";
import { useAdminStore } from "@/Stores";

/** Loads one user by id (cached copy shown immediately, then refreshed from the API). */
export default function useUser(id: string | undefined) {
  const user = useAdminStore((s) => (id ? s.usersById[id] : undefined));
  const getUser = useAdminStore((s) => s.getUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setError(null);
    getUser(id).catch((e: Error) => setError(e.message));
  }, [id, getUser]);

  return { user, error, isLoading: !user && !error };
}
