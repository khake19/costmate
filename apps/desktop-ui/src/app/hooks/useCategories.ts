import { useCallback, useEffect, useState } from "react";
import type { CategoryDocument, CategoryInput } from "@costmate/core";
import { categoriesDb } from "../db";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriesDb.getAll();
      // Sort alphabetically by name
      data.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch categories"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (input: CategoryInput) => {
    const newCategory = await categoriesDb.add(input);
    setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
    return newCategory;
  }, []);

  const updateCategory = useCallback(
    async (id: string, input: Partial<CategoryInput>) => {
      const updated = await categoriesDb.update(id, input);
      setCategories((prev) =>
        prev.map((cat) => (cat._id === id ? updated : cat)).sort((a, b) => a.name.localeCompare(b.name))
      );
      return updated;
    },
    []
  );

  const removeCategory = useCallback(async (id: string) => {
    await categoriesDb.remove(id);
    setCategories((prev) => prev.filter((cat) => cat._id !== id));
  }, []);

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    removeCategory,
    refetch: fetchCategories,
  };
}
