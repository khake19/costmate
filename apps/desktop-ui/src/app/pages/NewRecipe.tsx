import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import {
  calculateLineItemCost,
  calculatePricing,
  calculateRecipeCost,
  calculateRecipeProjection,
  recipeSchema,
  UNIT_CONFIG,
  type IngredientDocument,
  type RecipeFormData,
  type Unit,
} from "@costmate/core";
import {
  Button,
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@costmate/ui";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useIngredients } from "../hooks";

const VAT_PERCENT = 0.12;

// Calculate unit cost (price per base unit: g, ml, or pc)
function getUnitCost(ingredient: IngredientDocument): number {
  const qty = parseFloat(ingredient.quantity) || 0;
  const price = parseFloat(ingredient.price) || 0;
  if (qty === 0 || price === 0) return 0;

  const config = UNIT_CONFIG[ingredient.unit];
  return price / (qty * config.multiplier);
}

export default function NewRecipe() {
  const navigate = useNavigate();
  const { ingredients: availableIngredients, loading: ingredientsLoading } =
    useIngredients();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      ingredients: [],
      packaging: [],
      targetMarginPercent: "70",
      batchSize: "1",
      ordersPerMonth: "100",
      isVatRegistered: true,
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    fields: packagingFields,
    append: appendPackaging,
    remove: removePackaging,
  } = useFieldArray({
    control,
    name: "packaging",
  });

  const watchedValues = watch();

  // Calculate costs
  const ingredientCosts = watchedValues.ingredients.map((ing) =>
    calculateLineItemCost(parseFloat(ing.quantity) || 0, ing.unitCost)
  );
  const packagingCosts = watchedValues.packaging.map((pkg) =>
    calculateLineItemCost(parseFloat(pkg.quantity) || 0, pkg.unitCost)
  );

  const recipeCost = calculateRecipeCost({
    ingredientCosts,
    otherCosts: packagingCosts,
    batchSize: parseFloat(watchedValues.batchSize) || 1,
  });

  const pricing = calculatePricing({
    totalCost: recipeCost.totalCostPerOrder,
    targetMarginPercent:
      (parseFloat(watchedValues.targetMarginPercent) || 0) / 100,
    vatPercent: VAT_PERCENT,
    isVatRegistered: watchedValues.isVatRegistered,
  });

  const projection = calculateRecipeProjection({
    sellingPrice: pricing.sellingPrice,
    profitPerOrder: pricing.profitPerOrder,
    ordersPerMonth: parseFloat(watchedValues.ordersPerMonth) || 0,
  });

  const formatCurrency = (value: number) => {
    if (value === 0 || isNaN(value)) return "--";
    return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const onSubmit = (data: RecipeFormData) => {
    console.log("Recipe saved:", data);
    navigate("/");
  };

  const handleSelectIngredient = (index: number, ingredientId: string) => {
    const ingredient = availableIngredients.find(
      (ing) => ing._id === ingredientId
    );
    if (!ingredient) return;

    const unitCost = getUnitCost(ingredient);
    const baseUnit = UNIT_CONFIG[ingredient.unit].baseUnit as Unit;

    setValue(`ingredients.${index}.ingredientId`, ingredient._id);
    setValue(`ingredients.${index}.name`, ingredient.name);
    setValue(`ingredients.${index}.unit`, baseUnit);
    setValue(`ingredients.${index}.unitCost`, unitCost);
  };

  const handleAddIngredient = () => {
    appendIngredient({
      ingredientId: "",
      name: "",
      quantity: "1",
      unit: "g",
      unitCost: 0,
    });
  };

  const handleAddPackaging = () => {
    appendPackaging({
      id: crypto.randomUUID(),
      name: "",
      quantity: "1",
      unitCost: 0,
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Page Header */}
      <div className="bg-muted px-4 py-2 flex items-center border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="w-20"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <span className="font-bold flex-1 text-center">New Recipe</span>
        <div className="w-20 flex justify-end">
          <Button size="sm" onClick={handleSubmit(onSubmit)}>
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Form */}
        <div className="flex-1 p-4 border-r overflow-auto">
          {/* Recipe Name */}
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground mb-1 block">
              Recipe Name
            </Label>
            <Input placeholder="Enter recipe name..." {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Ingredients Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                Ingredients
              </Label>
              {availableIngredients.length === 0 && !ingredientsLoading && (
                <span className="text-xs text-muted-foreground">
                  No ingredients yet.{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => navigate("/ingredients")}
                  >
                    Add some first
                  </button>
                </span>
              )}
            </div>

            {ingredientFields.length === 0 ? (
              <Card className="p-4 text-center border-dashed">
                <div className="text-muted-foreground text-xs mb-2">
                  No ingredients yet
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-xs h-auto p-0"
                  onClick={handleAddIngredient}
                  disabled={availableIngredients.length === 0}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add your first ingredient
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {ingredientFields.map((field, index) => (
                  <Card key={field.id} className="p-3">
                    <div className="flex gap-2 items-start">
                      {/* Ingredient Picker */}
                      <div className="flex-1">
                        <Select
                          value={watch(`ingredients.${index}.ingredientId`)}
                          onValueChange={(val) =>
                            handleSelectIngredient(index, val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ingredient" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableIngredients.map((ing) => (
                              <SelectItem key={ing._id} value={ing._id}>
                                {ing.name} (₱
                                {getUnitCost(ing).toFixed(2)}/
                                {UNIT_CONFIG[ing.unit].baseUnit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Quantity */}
                      <div className="w-20">
                        <Input
                          type="number"
                          placeholder="Qty"
                          {...register(`ingredients.${index}.quantity`)}
                        />
                      </div>
                      {/* Unit (read-only, set by ingredient) */}
                      <div className="w-16">
                        <Input
                          value={watch(`ingredients.${index}.unit`)}
                          disabled
                          className="text-center bg-muted"
                        />
                      </div>
                      {/* Unit Cost (read-only) */}
                      <div className="w-24">
                        <Input
                          value={`₱${watch(`ingredients.${index}.unitCost`).toFixed(2)}`}
                          disabled
                          className="text-right bg-muted"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      Line cost: {formatCurrency(ingredientCosts[index])}
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddIngredient}
                  disabled={availableIngredients.length === 0}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Ingredient
                </Button>
              </div>
            )}
          </div>

          {/* Packaging Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                Packaging & Other
              </Label>
            </div>

            {packagingFields.length === 0 ? (
              <Card className="p-4 text-center border-dashed">
                <div className="text-muted-foreground text-xs mb-2">
                  No packaging items yet
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-xs h-auto p-0"
                  onClick={handleAddPackaging}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add packaging
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {packagingFields.map((field, index) => (
                  <Card key={field.id} className="p-3">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input
                          placeholder="Item name"
                          {...register(`packaging.${index}.name`)}
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          placeholder="Qty"
                          {...register(`packaging.${index}.quantity`)}
                        />
                      </div>
                      <div className="w-24">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            ₱
                          </span>
                          <Input
                            type="number"
                            placeholder="Cost"
                            className="pl-6"
                            value={watch(`packaging.${index}.unitCost`)}
                            onChange={(e) =>
                              setValue(
                                `packaging.${index}.unitCost`,
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => removePackaging(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      Line cost: {formatCurrency(packagingCosts[index])}
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddPackaging}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Packaging
                </Button>
              </div>
            )}
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Target Margin
              </Label>
              <div className="relative">
                <Input {...register("targetMarginPercent")} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              {errors.targetMarginPercent && (
                <p className="text-xs text-destructive mt-1">
                  {errors.targetMarginPercent.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Batch Size
              </Label>
              <Input {...register("batchSize")} />
              {errors.batchSize && (
                <p className="text-xs text-destructive mt-1">
                  {errors.batchSize.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Orders/Month
              </Label>
              <Input {...register("ordersPerMonth")} />
              {errors.ordersPerMonth && (
                <p className="text-xs text-destructive mt-1">
                  {errors.ordersPerMonth.message}
                </p>
              )}
            </div>
          </div>

          {/* VAT Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="vatRegistered"
              className="rounded"
              {...register("isVatRegistered")}
            />
            <Label htmlFor="vatRegistered" className="text-sm">
              VAT Registered (12%)
            </Label>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-96 bg-muted p-4 overflow-auto">
          <div className="text-xs text-muted-foreground mb-3 font-medium">
            PRICING PREVIEW
          </div>

          <Card className="p-4 mb-4">
            <div className="text-xs text-muted-foreground">Selling Price</div>
            <div className="text-3xl font-bold">
              {formatCurrency(pricing.sellingPrice)}
            </div>
            {recipeCost.totalCostPerOrder === 0 && (
              <div className="text-xs text-muted-foreground">
                Add ingredients to calculate
              </div>
            )}
          </Card>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ingredients</span>
              <span>{formatCurrency(recipeCost.ingredientsPerOrder)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packaging</span>
              <span>{formatCurrency(recipeCost.otherPerOrder)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Total Cost</span>
              <span className="font-medium">
                {formatCurrency(recipeCost.totalCostPerOrder)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price (pre-VAT)</span>
              <span>{formatCurrency(pricing.priceBeforeVat)}</span>
            </div>
            {watchedValues.isVatRegistered && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (12%)</span>
                <span>{formatCurrency(pricing.vat)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Profit/Order</span>
              <span className="font-medium text-green-600">
                {formatCurrency(pricing.profitPerOrder)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t space-y-2 text-xs">
            <div className="font-medium text-muted-foreground">
              MONTHLY ESTIMATE
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue</span>
              <span>{formatCurrency(projection.revenuePerMonth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit</span>
              <span className="font-medium text-green-600">
                {formatCurrency(projection.profitPerMonth)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
