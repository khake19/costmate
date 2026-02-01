import { useCallback, useEffect, useState } from "react";
import type { RecipeDocument, RecipeInput } from "@costmate/core";
import { recipesDb } from "../db";

export function useRecipes() {
  const [recipes, setRecipes] = useState<RecipeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await recipesDb.getAll();
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch recipes"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const addRecipe = useCallback(async (input: RecipeInput) => {
    const newRecipe = await recipesDb.add(input);
    setRecipes((prev) => [...prev, newRecipe]);
    return newRecipe;
  }, []);

  const updateRecipe = useCallback(
    async (id: string, input: Partial<RecipeInput>) => {
      const updated = await recipesDb.update(id, input);
      setRecipes((prev) =>
        prev.map((recipe) => (recipe._id === id ? updated : recipe))
      );
      return updated;
    },
    []
  );

  const removeRecipe = useCallback(async (id: string) => {
    await recipesDb.remove(id);
    setRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
  }, []);

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    removeRecipe,
    refetch: fetchRecipes,
  };
}
