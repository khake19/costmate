import { useCallback, useEffect, useState } from "react";
import type { PackagingDocument, PackagingInput } from "@costmate/core";
import { packagingDb } from "../db";

export function usePackaging() {
  const [packaging, setPackaging] = useState<PackagingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPackaging = useCallback(async () => {
    try {
      setLoading(true);
      const data = await packagingDb.getAll();
      setPackaging(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch packaging")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackaging();
  }, [fetchPackaging]);

  const addPackaging = useCallback(async (input: PackagingInput) => {
    const newPackaging = await packagingDb.add(input);
    setPackaging((prev) => [...prev, newPackaging]);
    return newPackaging;
  }, []);

  const updatePackaging = useCallback(
    async (id: string, input: Partial<PackagingInput>) => {
      const updated = await packagingDb.update(id, input);
      setPackaging((prev) =>
        prev.map((pkg) => (pkg._id === id ? updated : pkg))
      );
      return updated;
    },
    []
  );

  const removePackaging = useCallback(async (id: string) => {
    await packagingDb.remove(id);
    setPackaging((prev) => prev.filter((pkg) => pkg._id !== id));
  }, []);

  return {
    packaging,
    loading,
    error,
    addPackaging,
    updatePackaging,
    removePackaging,
    refetch: fetchPackaging,
  };
}
