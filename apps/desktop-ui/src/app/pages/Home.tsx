import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Card, Popover, PopoverContent, PopoverTrigger } from "@costmate/ui";
import { Download, ImageIcon, Plus, Search } from "lucide-react";
import { useIngredients, useKeyboardShortcuts, formatShortcut } from "../hooks";
import { exportToExcel, exportToCSV, exportToPDF } from "../utils/export";
import {
  calculateLineItemCost,
  calculatePricing,
  calculateRecipeCost,
  type RecipeDocument,
} from "@costmate/core";
import { useRecipes } from "../hooks";

// Small component to load and display recipe image
function RecipeImage({ recipe, getImage, hasImage }: {
  recipe: RecipeDocument;
  getImage: (id: string) => Promise<Blob | null>;
  hasImage: (doc: RecipeDocument) => boolean;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (hasImage(recipe)) {
      getImage(recipe._id).then((blob) => {
        if (blob) {
          setImageUrl(URL.createObjectURL(blob));
        }
      });
    }
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [recipe._id, hasImage, getImage]);

  if (!hasImage(recipe)) {
    return (
      <div className="w-14 h-14 bg-muted flex items-center justify-center flex-shrink-0">
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  if (!imageUrl) {
    return <div className="w-14 h-14 bg-muted animate-pulse flex-shrink-0" />;
  }

  return (
    <img
      src={imageUrl}
      alt={recipe.name}
      className="w-14 h-14 object-cover flex-shrink-0"
    />
  );
}

const VAT_PERCENT = 0.12;

export default function Home() {
  const navigate = useNavigate();
  const { recipes, loading, error, getImage, hasImage } = useRecipes();
  const { ingredients } = useIngredients();
  const [exportOpen, setExportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    onFocusSearch: () => searchInputRef.current?.focus(),
    onNew: () => navigate("/recipe/new"),
  });

  const handleExport = (format: "excel" | "csv" | "pdf") => {
    setExportOpen(false);
    if (format === "excel") exportToExcel(recipes, ingredients);
    else if (format === "csv") exportToCSV(recipes, ingredients);
    else if (format === "pdf") exportToPDF(recipes, ingredients);
  };

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

  const filteredRecipes = useMemo(() => {
    return recipesWithPricing.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recipesWithPricing, searchQuery]);

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
            <Input
              ref={searchInputRef}
              placeholder="Search recipes..."
              className="pl-9 pr-14"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-muted rounded border font-mono text-muted-foreground">
              {formatShortcut('K', { ctrl: true })}
            </kbd>
          </div>
          <div className="flex gap-2">
            <Popover open={exportOpen} onOpenChange={setExportOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" disabled={recipes.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="end">
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                >
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                >
                  PDF
                </button>
              </PopoverContent>
            </Popover>
            <Button onClick={() => navigate("/recipe/new")} title={`New Recipe (${formatShortcut('N', { ctrl: true })})`}>
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
              <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-primary-foreground/20 rounded font-mono">
                {formatShortcut('N', { ctrl: true })}
              </kbd>
            </Button>
          </div>
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
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe._id}
                onClick={() => navigate(`/recipe/${recipe._id}`)}
                className="p-3 hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="flex gap-3">
                  <RecipeImage recipe={recipe} getImage={getImage} hasImage={hasImage} />
                  <div className="flex-1 min-w-0">
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
                  </div>
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
