import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import {
  calculateLineItemCost,
  calculatePricing,
  calculateRecipeCost,
  calculateRecipeProjection,
  recipeSchema,
  UNIT_CONFIG,
  type IngredientDocument,
  type PackagingDocument,
  type RecipeFormData,
  type Unit,
} from "@costmate/core";
import {
  Button,
  Card,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@costmate/ui";
import { ArrowLeft, Check, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useIngredients, usePackaging } from "../hooks";

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
    packaging: availablePackaging,
    addPackaging: addPackagingToDb,
    removePackaging: removePackagingFromDb,
  } = usePackaging();

  const deletedPackagingRef = useRef<PackagingDocument | null>(null);

  const [ingredientSearchOpen, setIngredientSearchOpen] = useState(false);
  const [packagingSearchOpen, setPackagingSearchOpen] = useState(false);
  const [packagingSearch, setPackagingSearch] = useState("");
  const [creatingPackaging, setCreatingPackaging] = useState(false);
  const [newPackagingCost, setNewPackagingCost] = useState("");

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

  const handleAddIngredient = (ingredient: IngredientDocument) => {
    const alreadyAdded = watchedValues.ingredients.some(
      (ing) => ing.ingredientId === ingredient._id
    );
    if (alreadyAdded) {
      setIngredientSearchOpen(false);
      return;
    }

    const unitCost = getUnitCost(ingredient);
    const baseUnit = UNIT_CONFIG[ingredient.unit].baseUnit as Unit;

    appendIngredient({
      ingredientId: ingredient._id,
      name: ingredient.name,
      quantity: "1",
      unit: baseUnit,
      unitCost,
    });
    setIngredientSearchOpen(false);
  };

  const handleAddPackaging = (pkg: PackagingDocument) => {
    const alreadyAdded = watchedValues.packaging.some(
      (p) => p.id === pkg._id
    );
    if (alreadyAdded) {
      setPackagingSearchOpen(false);
      return;
    }

    appendPackaging({
      id: pkg._id,
      name: pkg.name,
      quantity: "1",
      unitCost: pkg.unitCost,
    });
    setPackagingSearchOpen(false);
    setPackagingSearch("");
  };

  const handleCreatePackaging = async () => {
    const cost = parseFloat(newPackagingCost) || 0;
    if (!packagingSearch.trim() || cost <= 0) return;

    const newPkg = await addPackagingToDb({
      name: packagingSearch.trim(),
      unitCost: cost,
    });

    appendPackaging({
      id: newPkg._id,
      name: newPkg.name,
      quantity: "1",
      unitCost: newPkg.unitCost,
    });

    setPackagingSearchOpen(false);
    setPackagingSearch("");
    setNewPackagingCost("");
    setCreatingPackaging(false);
  };

  const handleDeletePackaging = async (
    e: React.MouseEvent,
    pkg: PackagingDocument
  ) => {
    e.stopPropagation();
    deletedPackagingRef.current = pkg;

    // Also remove from recipe if it was added
    const addedIndex = watchedValues.packaging.findIndex((p) => p.id === pkg._id);
    if (addedIndex !== -1) {
      removePackaging(addedIndex);
    }

    try {
      await removePackagingFromDb(pkg._id);

      toast(`"${pkg.name}" deleted`, {
        action: {
          label: "Undo",
          onClick: async () => {
            if (deletedPackagingRef.current) {
              const { name, unitCost } = deletedPackagingRef.current;
              await addPackagingToDb({ name, unitCost });
              deletedPackagingRef.current = null;
            }
          },
        },
        duration: 5000,
      });
    } catch {
      toast.error("Failed to delete packaging");
    }
  };

  const filteredPackaging = availablePackaging.filter((pkg) =>
    pkg.name.toLowerCase().includes(packagingSearch.toLowerCase())
  );

  const showCreateOption =
    packagingSearch.trim() &&
    !filteredPackaging.some(
      (pkg) => pkg.name.toLowerCase() === packagingSearch.toLowerCase()
    );

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
            </div>

            {/* Ingredient Search */}
            <Popover
              open={ingredientSearchOpen}
              onOpenChange={setIngredientSearchOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-muted-foreground mb-2"
                  disabled={availableIngredients.length === 0}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {availableIngredients.length === 0
                    ? "No ingredients yet"
                    : "Search ingredients..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search ingredients..." />
                  <CommandList>
                    <CommandEmpty>No ingredients found.</CommandEmpty>
                    <CommandGroup>
                      {availableIngredients.map((ingredient) => {
                        const isAdded = watchedValues.ingredients.some(
                          (ing) => ing.ingredientId === ingredient._id
                        );
                        return (
                          <CommandItem
                            key={ingredient._id}
                            value={ingredient.name}
                            onSelect={() => handleAddIngredient(ingredient)}
                            disabled={isAdded}
                            className={isAdded ? "opacity-50" : ""}
                          >
                            <div className="flex-1">
                              <span>{ingredient.name}</span>
                              {isAdded && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (added)
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ₱{getUnitCost(ingredient).toFixed(2)}/
                              {UNIT_CONFIG[ingredient.unit].baseUnit}
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {availableIngredients.length === 0 && !ingredientsLoading && (
              <p className="text-xs text-muted-foreground mb-2">
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => navigate("/ingredients")}
                >
                  Add ingredients first
                </button>
              </p>
            )}

            {/* Ingredient List */}
            {ingredientFields.length > 0 && (
              <div className="space-y-2">
                {/* Header */}
                <div className="flex gap-3 items-center px-3 text-xs text-muted-foreground">
                  <div className="flex-1">Ingredient</div>
                  <div className="w-20 text-center">Qty</div>
                  <div className="w-10 text-center">Unit</div>
                  <div className="w-20 text-right">Rate</div>
                  <div className="w-24 text-right">Cost</div>
                  <div className="w-8" />
                </div>
                {ingredientFields.map((field, index) => (
                  <Card key={field.id} className="p-3">
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 font-medium text-sm">
                        {watch(`ingredients.${index}.name`)}
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="text-center"
                          {...register(`ingredients.${index}.quantity`)}
                        />
                      </div>
                      <div className="w-10 text-sm text-muted-foreground text-center">
                        {watch(`ingredients.${index}.unit`)}
                      </div>
                      <div className="w-20 text-sm text-right">
                        ₱{watch(`ingredients.${index}.unitCost`).toFixed(2)}
                      </div>
                      <div className="w-24 text-sm font-medium text-right">
                        {formatCurrency(ingredientCosts[index])}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Total */}
                <div className="flex gap-3 items-center px-3 text-sm">
                  <div className="flex-1" />
                  <div className="w-20" />
                  <div className="w-10" />
                  <div className="w-20 text-right text-muted-foreground">Total:</div>
                  <div className="w-24 text-right font-medium">
                    {formatCurrency(recipeCost.totalIngredientsCost)}
                  </div>
                  <div className="w-8" />
                </div>
              </div>
            )}

            {ingredientFields.length === 0 && (
              <Card className="p-6 text-center border-dashed">
                <div className="text-muted-foreground text-xs">
                  Search and add ingredients above
                </div>
              </Card>
            )}
          </div>

          {/* Packaging Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                Packaging & Other
              </Label>
            </div>

            {/* Packaging Search */}
            <Popover
              open={packagingSearchOpen}
              onOpenChange={(open) => {
                setPackagingSearchOpen(open);
                if (!open) {
                  setPackagingSearch("");
                  setCreatingPackaging(false);
                  setNewPackagingCost("");
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-muted-foreground mb-2"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search or create packaging...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                {creatingPackaging ? (
                  <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Create "{packagingSearch}"
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setCreatingPackaging(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Unit Cost
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₱
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-7"
                          value={newPackagingCost}
                          onChange={(e) => setNewPackagingCost(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={handleCreatePackaging}
                      disabled={!newPackagingCost || parseFloat(newPackagingCost) <= 0}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Create & Add
                    </Button>
                  </div>
                ) : (
                  <Command>
                    <CommandInput
                      placeholder="Search packaging..."
                      value={packagingSearch}
                      onValueChange={setPackagingSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {packagingSearch ? (
                          <span className="text-muted-foreground">
                            No packaging found
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Type to search or create
                          </span>
                        )}
                      </CommandEmpty>
                      {filteredPackaging.length > 0 && (
                        <CommandGroup>
                          {filteredPackaging.map((pkg) => {
                            const isAdded = watchedValues.packaging.some(
                              (p) => p.id === pkg._id
                            );
                            return (
                              <CommandItem
                                key={pkg._id}
                                value={pkg.name}
                                onSelect={() => handleAddPackaging(pkg)}
                                disabled={isAdded}
                                className={isAdded ? "opacity-50" : ""}
                              >
                                <div className="flex-1">
                                  <span>{pkg.name}</span>
                                  {isAdded && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      (added)
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground mr-2">
                                  ₱{pkg.unitCost.toFixed(2)}
                                </span>
                                <button
                                  type="button"
                                  className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                                  onClick={(e) => handleDeletePackaging(e, pkg)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                      {showCreateOption && (
                        <>
                          {filteredPackaging.length > 0 && <CommandSeparator />}
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => setCreatingPackaging(true)}
                              className="text-primary"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create "{packagingSearch}"
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                )}
              </PopoverContent>
            </Popover>

            {/* Packaging List */}
            {packagingFields.length > 0 && (
              <div className="space-y-2">
                {/* Header */}
                <div className="flex gap-3 items-center px-3 text-xs text-muted-foreground">
                  <div className="flex-1">Item</div>
                  <div className="w-20 text-center">Qty</div>
                  <div className="w-20 text-right">Rate</div>
                  <div className="w-24 text-right">Cost</div>
                  <div className="w-8" />
                </div>
                {packagingFields.map((field, index) => (
                  <Card key={field.id} className="p-3">
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 font-medium text-sm">
                        {watch(`packaging.${index}.name`)}
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="text-center"
                          {...register(`packaging.${index}.quantity`)}
                        />
                      </div>
                      <div className="w-20 text-sm text-right">
                        ₱{watch(`packaging.${index}.unitCost`).toFixed(2)}
                      </div>
                      <div className="w-24 text-sm font-medium text-right">
                        {formatCurrency(packagingCosts[index])}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removePackaging(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Total */}
                <div className="flex gap-3 items-center px-3 text-sm">
                  <div className="flex-1" />
                  <div className="w-20" />
                  <div className="w-20 text-right text-muted-foreground">Total:</div>
                  <div className="w-24 text-right font-medium">
                    {formatCurrency(recipeCost.totalOtherCost)}
                  </div>
                  <div className="w-8" />
                </div>
              </div>
            )}

            {packagingFields.length === 0 && (
              <Card className="p-6 text-center border-dashed">
                <div className="text-muted-foreground text-xs">
                  Search or create packaging above
                </div>
              </Card>
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
