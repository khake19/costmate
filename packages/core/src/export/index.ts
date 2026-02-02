import type { RecipeDocument, IngredientDocument } from '../db/types';
import { calculateLineItemCost } from '../calculations/unit-cost';
import { calculateRecipeCost } from '../calculations/recipe';
import { calculatePricing } from '../calculations/pricing';

const VAT_PERCENT = 0.12;

export interface RecipeExportData {
  name: string;
  cost: number;
  sellingPrice: number;
  profit: number;
  margin: number;
  ordersPerMonth: string;
  ingredientCount: number;
  packagingCount: number;
}

export interface IngredientExportData {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  price: string;
}

export interface ExportReportData {
  generatedAt: string;
  summary: {
    totalRecipes: number;
    totalIngredients: number;
    monthlyRevenue: number;
    monthlyProfit: number;
  };
  recipes: RecipeExportData[];
  ingredients: IngredientExportData[];
}

export function prepareExportData(
  recipes: RecipeDocument[],
  ingredients: IngredientDocument[]
): ExportReportData {
  const recipesData = recipes.map((recipe) => {
    const ingredientCosts = recipe.ingredients.map((ing) =>
      calculateLineItemCost(parseFloat(ing.quantity) || 0, ing.unitCost)
    );
    const packagingCosts = recipe.packaging.map((pkg) =>
      calculateLineItemCost(parseFloat(pkg.quantity) || 0, pkg.unitCost)
    );

    const recipeCost = calculateRecipeCost({
      ingredientCosts,
      otherCosts: packagingCosts,
      batchSize: parseFloat(recipe.batchSize) || 1,
    });

    const pricing = calculatePricing({
      totalCost: recipeCost.totalCostPerOrder,
      targetMarginPercent: (parseFloat(recipe.targetMarginPercent) || 0) / 100,
      vatPercent: VAT_PERCENT,
      isVatRegistered: recipe.isVatRegistered,
    });

    return {
      name: recipe.name,
      cost: recipeCost.totalCostPerOrder,
      sellingPrice: pricing.sellingPrice,
      profit: pricing.profitPerOrder,
      margin: parseFloat(recipe.targetMarginPercent) || 0,
      ordersPerMonth: recipe.ordersPerMonth,
      ingredientCount: recipe.ingredients.length,
      packagingCount: recipe.packaging.length,
    };
  });

  const ingredientsData = ingredients.map((ing) => ({
    name: ing.name,
    category: ing.category,
    quantity: ing.quantity,
    unit: ing.unit,
    price: ing.price,
  }));

  const monthlyRevenue = recipesData.reduce(
    (acc, r) => acc + r.sellingPrice * (parseFloat(r.ordersPerMonth) || 0),
    0
  );
  const monthlyProfit = recipesData.reduce(
    (acc, r) => acc + r.profit * (parseFloat(r.ordersPerMonth) || 0),
    0
  );

  return {
    generatedAt: new Date().toLocaleDateString(),
    summary: {
      totalRecipes: recipes.length,
      totalIngredients: ingredients.length,
      monthlyRevenue,
      monthlyProfit,
    },
    recipes: recipesData,
    ingredients: ingredientsData,
  };
}

export function formatCurrency(value: number): string {
  if (value === 0 || isNaN(value)) return "₱0.00";
  return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
