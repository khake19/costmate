import { create } from "zustand";
import type { RecipeDocument, RecipeInput } from "@costmate/core";
import { recipesDb } from "../db";
import { useEffect } from "react";

interface RecipesState {
  recipes: RecipeDocument[];
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  fetchRecipes: () => Promise<void>;
  addRecipe: (input: RecipeInput) => Promise<RecipeDocument>;
  updateRecipe: (id: string, input: Partial<RecipeInput>) => Promise<RecipeDocument>;
  removeRecipe: (id: string) => Promise<void>;
}

const useRecipesStore = create<RecipesState>((set, get) => ({
  recipes: [],
  loading: true,
  error: null,
  initialized: false,

  fetchRecipes: async () => {
    try {
      set({ loading: true });
      const data = await recipesDb.getAll();
      set({ recipes: data, error: null, initialized: true });
    } catch (err) {
      set({ error: err instanceof Error ? err : new Error("Failed to fetch recipes") });
    } finally {
      set({ loading: false });
    }
  },

  addRecipe: async (input: RecipeInput) => {
    const newRecipe = await recipesDb.add(input);
    set((state) => ({ recipes: [...state.recipes, newRecipe] }));
    return newRecipe;
  },

  updateRecipe: async (id: string, input: Partial<RecipeInput>) => {
    const updated = await recipesDb.update(id, input);
    set((state) => ({
      recipes: state.recipes.map((recipe) => (recipe._id === id ? updated : recipe)),
    }));
    return updated;
  },

  removeRecipe: async (id: string) => {
    await recipesDb.remove(id);
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe._id !== id),
    }));
  },
}));

export function useRecipes() {
  const store = useRecipesStore();

  // Fetch on first mount
  useEffect(() => {
    if (!store.initialized) {
      store.fetchRecipes();
    }
  }, [store.initialized, store.fetchRecipes]);

  return {
    recipes: store.recipes,
    loading: store.loading,
    error: store.error,
    addRecipe: store.addRecipe,
    updateRecipe: store.updateRecipe,
    removeRecipe: store.removeRecipe,
    refetch: store.fetchRecipes,
    // Image methods (pass through to db)
    addImage: recipesDb.addImage,
    getImage: recipesDb.getImage,
    removeImage: recipesDb.removeImage,
    hasImage: recipesDb.hasImage,
  };
}
