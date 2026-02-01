import { useCallback, useEffect, useState } from "react";
import type { IngredientDocument, IngredientInput } from "@costmate/core";
import { ingredientsDb } from "../db";

export function useIngredients() {
  const [ingredients, setIngredients] = useState<IngredientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ingredientsDb.getAll();
      setIngredients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch ingredients"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const addIngredient = useCallback(async (input: IngredientInput) => {
    const newIngredient = await ingredientsDb.add(input);
    setIngredients((prev) => [...prev, newIngredient]);
    return newIngredient;
  }, []);

  const updateIngredient = useCallback(
    async (id: string, input: Partial<IngredientInput>) => {
      const updated = await ingredientsDb.update(id, input);
      setIngredients((prev) =>
        prev.map((ing) => (ing._id === id ? updated : ing))
      );
      return updated;
    },
    []
  );

  const removeIngredient = useCallback(async (id: string) => {
    await ingredientsDb.remove(id);
    setIngredients((prev) => prev.filter((ing) => ing._id !== id));
  }, []);

  return {
    ingredients,
    loading,
    error,
    addIngredient,
    updateIngredient,
    removeIngredient,
    refetch: fetchIngredients,
  };
}
