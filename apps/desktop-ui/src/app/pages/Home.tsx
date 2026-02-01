import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "@costmate/ui";
import { Plus, Search } from "lucide-react";
import {
  calculateLineItemCost,
  calculatePricing,
  calculateRecipeCost,
} from "@costmate/core";
import { useRecipes } from "../hooks";

const VAT_PERCENT = 0.12;

export default function Home() {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipes();

  const recipesWithPricing = recipes.map((recipe) => {
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
      targetMarginPercent:
        (parseFloat(recipe.targetMarginPercent) || 0) / 100,
      vatPercent: VAT_PERCENT,
      isVatRegistered: recipe.isVatRegistered,
    });

    return {
      ...recipe,
      cost: recipeCost.totalCostPerOrder,
      sellingPrice: pricing.sellingPrice,
      profit: pricing.profitPerOrder,
      margin: parseFloat(recipe.targetMarginPercent) || 0,
    };
  });

  const totals = recipesWithPricing.reduce(
    (acc, recipe) => {
      const orders = parseFloat(recipe.ordersPerMonth) || 0;
      return {
        revenue: acc.revenue + recipe.sellingPrice * orders,
        profit: acc.profit + recipe.profit * orders,
      };
    },
    { revenue: 0, profit: 0 }
  );

  const formatCurrency = (value: number) => {
    if (value === 0 || isNaN(value)) return "₱0";
    return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <>
      {/* Summary Bar */}
      <div className="bg-muted px-4 py-3 flex justify-between text-xs border-b">
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground">Revenue/mo</div>
            <div className="font-bold text-lg">{formatCurrency(totals.revenue)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Profit/mo</div>
            <div className="font-bold text-lg">{formatCurrency(totals.profit)}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-auto">
        {/* Search + Add */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search recipes..." className="pl-9" />
          </div>
          <Button onClick={() => navigate("/recipe/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-muted-foreground py-8">
            Loading recipes...
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center text-destructive py-8">
            Failed to load recipes. Please try again.
          </div>
        )}

        {/* Recipe Cards */}
        {!loading && (
          <div className="space-y-3">
            {recipesWithPricing.map((recipe) => (
              <Card
                key={recipe._id}
                onClick={() => navigate(`/recipe/${recipe._id}`)}
                className="p-3 hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{recipe.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {recipe.ingredients.length} ingredients ·{" "}
                      {recipe.packaging.length} packaging
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Selling Price
                    </div>
                    <div className="font-bold text-lg">
                      {formatCurrency(recipe.sellingPrice)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Cost: {formatCurrency(recipe.cost)}</span>
                  <span>Profit: {formatCurrency(recipe.profit)}</span>
                  <span>Margin: {recipe.margin}%</span>
                  <span className="ml-auto">
                    {recipe.ordersPerMonth} orders/mo
                  </span>
                </div>
              </Card>
            ))}

            {/* Empty/Add state */}
            <Card
              onClick={() => navigate("/recipe/new")}
              className="p-6 text-center text-muted-foreground cursor-pointer border-dashed hover:bg-accent transition-colors"
            >
              <Plus className="h-5 w-5 mx-auto mb-2" />
              {recipes.length === 0
                ? "Add your first recipe"
                : "Add another recipe"}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
