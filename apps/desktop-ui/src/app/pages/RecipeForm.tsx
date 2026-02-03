import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import {
  calculateLineItemCost,
  calculatePricing,
  calculateRecipeCost,
  calculateRecipeProjection,
  recipeSchema,
  UNIT_CONFIG,
  type IngredientDocument,
  type PackagingDocument,
  type RecipeDocument,
  type RecipeFormData,
  type Unit,
} from "@costmate/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { ArrowLeft, Check, ImagePlus, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useIngredients, usePackaging, useRecipes, useKeyboardShortcuts, formatShortcut } from "../hooks";

const VAT_PERCENT = 0.12;

// Calculate unit cost (price per base unit: g, ml, or pc)
function getUnitCost(ingredient: IngredientDocument): number {
  const qty = parseFloat(ingredient.quantity) || 0;
  const price = parseFloat(ingredient.price) || 0;
  if (qty === 0 || price === 0) return 0;

  const config = UNIT_CONFIG[ingredient.unit];
  return price / (qty * config.multiplier);
}

export default function RecipeForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { ingredients: availableIngredients, loading: ingredientsLoading } =
    useIngredients();
  const {
    packaging: availablePackaging,
    addPackaging: addPackagingToDb,
    removePackaging: removePackagingFromDb,
  } = usePackaging();
  const { recipes, addRecipe, updateRecipe, removeRecipe, addImage, getImage, hasImage } = useRecipes();

  const deletedPackagingRef = useRef<PackagingDocument | null>(null);
  const deletedRecipeRef = useRef<RecipeDocument | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<Blob | null>(null);
  const [imageExpanded, setImageExpanded] = useState(false);

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
    reset,
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

  // Store handleSubmit in a ref so the shortcut can access it
  const submitFormRef = useRef<() => void>();
  submitFormRef.current = handleSubmit(async (data) => {
    try {
      let recipeId = id;
      if (isEditing && id) {
        await updateRecipe(id, data);
        toast.success(`"${data.name}" updated`);
      } else {
        const newRecipe = await addRecipe(data);
        recipeId = newRecipe._id;
        toast.success(`"${data.name}" saved`);
      }
      if (pendingImage && recipeId) {
        await addImage(recipeId, pendingImage);
      }
      navigate("/");
    } catch {
      toast.error(`Failed to ${isEditing ? "update" : "save"} recipe`);
    }
  });

  useKeyboardShortcuts({
    onSave: () => submitFormRef.current?.(),
    onEscape: () => navigate("/"),
  });

  // Load existing recipe data when editing
  useEffect(() => {
    if (isEditing && id && recipes.length > 0) {
      const recipe = recipes.find((r) => r._id === id);
      if (recipe) {
        reset({
          name: recipe.name,
          ingredients: recipe.ingredients,
          packaging: recipe.packaging,
          targetMarginPercent: recipe.targetMarginPercent,
          batchSize: recipe.batchSize,
          ordersPerMonth: recipe.ordersPerMonth,
          isVatRegistered: recipe.isVatRegistered,
        });
        // Load existing image
        if (hasImage(recipe)) {
          getImage(id).then((blob) => {
            if (blob) {
              setImagePreview(URL.createObjectURL(blob));
            }
          });
        }
      }
      setInitialLoading(false);
    }
  }, [isEditing, id, recipes, reset, getImage, hasImage]);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setPendingImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setPendingImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };


  const handleDelete = async () => {
    if (!isEditing || !id) return;

    const recipe = recipes.find((r) => r._id === id);
    if (!recipe) return;

    deletedRecipeRef.current = recipe;

    try {
      await removeRecipe(id);
      navigate("/");

      toast(`"${recipe.name}" deleted`, {
        action: {
          label: "Undo",
          onClick: async () => {
            if (deletedRecipeRef.current) {
              const { name, ingredients, packaging, targetMarginPercent, batchSize, ordersPerMonth, isVatRegistered } =
                deletedRecipeRef.current;
              await addRecipe({ name, ingredients, packaging, targetMarginPercent, batchSize, ordersPerMonth, isVatRegistered });
              deletedRecipeRef.current = null;
            }
          },
        },
        duration: 5000,
      });
    } catch {
      toast.error("Failed to delete recipe");
    }
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

  if (initialLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading recipe...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Page Header */}
      <div className="bg-muted px-4 py-2 flex items-center border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          title="Cancel (Esc)"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Cancel
          <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-muted rounded border font-mono text-muted-foreground">
            Esc
          </kbd>
        </Button>
        <span className="font-bold flex-1 text-center">
          {isEditing ? "Edit Recipe" : "New Recipe"}
        </span>
        <div className="flex gap-2">
          {isEditing && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive bg-destructive/10 hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this recipe?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{watchedValues.name || "this recipe"}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button size="sm" onClick={() => submitFormRef.current?.()} title={`Save (${formatShortcut('S', { ctrl: true })})`}>
            Save
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-primary-foreground/20 rounded font-mono">
              {formatShortcut('S', { ctrl: true })}
            </kbd>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Form */}
        <div className="flex-1 p-4 border-r overflow-auto">
          {/* Recipe Name & Image */}
          <div className="flex gap-4 mb-4">
            {/* Image Picker */}
            <div className="flex-shrink-0">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Recipe"
                    className="w-24 h-24 object-cover border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setImageExpanded(true)}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-24 h-24 border border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ImagePlus className="h-6 w-6 mb-1" />
                  <span className="text-xs">Add Photo</span>
                </button>
              )}
            </div>

            {/* Name Field */}
            <div className="flex-1">
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
              <Card className={`p-6 text-center border-dashed ${errors.ingredients ? "border-destructive" : ""}`}>
                <div className={errors.ingredients ? "text-destructive text-xs" : "text-muted-foreground text-xs"}>
                  {errors.ingredients?.message || "Search and add ingredients above"}
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

      {/* Expanded Image Modal */}
      {imageExpanded && imagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setImageExpanded(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={imagePreview}
              alt="Recipe"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              type="button"
              onClick={() => setImageExpanded(false)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
