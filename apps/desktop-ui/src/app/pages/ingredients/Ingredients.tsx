import {
  calculatePricePerUnit,
  formatQuantityUnit,
  type CategoryDocument,
  type IngredientDocument,
  type IngredientInput,
  type Unit,
} from "@costmate/core";
import {
  Button,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  cn,
} from "@costmate/ui";
import { Plus, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCategories, useIngredients, useKeyboardShortcuts, formatShortcut } from "../../hooks";
import IngredientForm from "./IngredientForm";

export default function Ingredients() {
  const {
    ingredients,
    loading: ingredientsLoading,
    error: ingredientsError,
    addIngredient,
    updateIngredient,
    removeIngredient,
  } = useIngredients();

  const {
    categories,
    loading: categoriesLoading,
    addCategory,
    removeCategory,
  } = useCategories();

  const [showPanel, setShowPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIngredient, setEditingIngredient] =
    useState<IngredientDocument | null>(null);
  const deletedIngredientRef = useRef<IngredientDocument | null>(null);
  const deletedCategoryRef = useRef<CategoryDocument | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    onFocusSearch: () => searchInputRef.current?.focus(),
    onNew: () => {
      setEditingIngredient(null);
      setShowPanel(true);
    },
    onEscape: () => {
      if (showPanel) {
        setShowPanel(false);
        setEditingIngredient(null);
      }
    },
  });

  const categoryItems = useMemo(
    () => categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      isDefault: cat.isDefault,
    })),
    [categories]
  );

  const filterCategories = useMemo(
    () => ["All", ...categories.map((cat) => cat.name)],
    [categories]
  );

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesCategory = activeCategory === "All" || ing.category === activeCategory;
      const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [ingredients, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ingredients.length };
    for (const ing of ingredients) {
      counts[ing.category] = (counts[ing.category] || 0) + 1;
    }
    return counts;
  }, [ingredients]);

  const loading = ingredientsLoading || categoriesLoading;
  const error = ingredientsError;

  const handleAdd = () => {
    setEditingIngredient(null);
    setShowPanel(true);
  };

  const handleEdit = (ingredient: IngredientDocument) => {
    setEditingIngredient(ingredient);
    setShowPanel(true);
  };

  const handleSave = async (data: IngredientInput) => {
    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient._id, data);
      } else {
        await addIngredient(data);
      }
      setShowPanel(false);
      setEditingIngredient(null);
    } catch (err) {
      toast.error("Failed to save ingredient");
    }
  };

  const handleDelete = async () => {
    if (!editingIngredient) return;

    deletedIngredientRef.current = editingIngredient;

    try {
      await removeIngredient(editingIngredient._id);
      setShowPanel(false);
      setEditingIngredient(null);

      toast(`"${editingIngredient.name}" deleted`, {
        action: {
          label: "Undo",
          onClick: async () => {
            if (deletedIngredientRef.current) {
              const { name, category, quantity, unit, price } =
                deletedIngredientRef.current;
              await addIngredient({ name, category, quantity, unit, price });
              deletedIngredientRef.current = null;
            }
          },
        },
        duration: 5000,
      });
    } catch (err) {
      toast.error("Failed to delete ingredient");
    }
  };

  const handleCancel = () => {
    setShowPanel(false);
    setEditingIngredient(null);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading ingredients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-destructive">Failed to load ingredients. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Search + Category Filter + Add */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search ingredients..."
              className="pl-9 pr-14"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-muted rounded border font-mono text-muted-foreground">
              {formatShortcut('K', { ctrl: true })}
            </kbd>
          </div>
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-48">
              <div className="flex items-center justify-between w-full">
                <span>{activeCategory}</span>
                <span className="text-muted-foreground">
                  {categoryCounts[activeCategory] || 0}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {filterCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  <div className="flex items-center justify-between w-full">
                    <span>{cat}</span>
                    <span className="text-muted-foreground">
                      {categoryCounts[cat] || 0}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Button onClick={handleAdd} title={`Add New (${formatShortcut('N', { ctrl: true })})`}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-primary-foreground/20 rounded font-mono">
              {formatShortcut('N', { ctrl: true })}
            </kbd>
          </Button>
        </div>

        {/* Ingredients List */}
        <div className="space-y-2">
          {filteredIngredients.map((ingredient) => (
              <Card
                key={ingredient._id}
                onClick={() => handleEdit(ingredient)}
                className="p-3 flex justify-between items-center hover:bg-accent cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ingredient.category} ·{" "}
                    {formatQuantityUnit(
                      ingredient.quantity,
                      ingredient.unit as Unit
                    )}{" "}
                    = ₱{ingredient.price}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {calculatePricePerUnit(
                      ingredient.quantity,
                      ingredient.unit as Unit,
                      ingredient.price
                    )}
                  </div>
                </div>
              </Card>
            ))}

          {/* Empty state / Add more hint */}
          <Card
            onClick={handleAdd}
            className="p-6 text-center text-muted-foreground cursor-pointer border-dashed hover:bg-accent transition-colors"
          >
            <Plus className="h-5 w-5 mx-auto mb-2" />
            {ingredients.length === 0
              ? "Add your first ingredient"
              : "Add another ingredient"}
          </Card>
        </div>
      </div>

      {/* Side Panel */}
      <div
        className={cn(
          "w-96 bg-muted border-l flex flex-col transition-all duration-200 ease-in-out",
          showPanel ? "translate-x-0" : "translate-x-full w-0 border-l-0"
        )}
      >
        {showPanel && (
          <IngredientForm
            ingredient={
              editingIngredient
                ? {
                    name: editingIngredient.name,
                    category: editingIngredient.category,
                    quantity: editingIngredient.quantity,
                    unit: editingIngredient.unit,
                    price: editingIngredient.price,
                  }
                : undefined
            }
            availableCategories={categoryItems}
            onCreateCategory={async (name) => {
              await addCategory({ name });
            }}
            onDeleteCategory={async (id, name) => {
              const categoryDoc = categories.find((c) => c._id === id);
              if (categoryDoc) {
                deletedCategoryRef.current = categoryDoc;
              }

              await removeCategory(id);

              // Reset filter if deleted category was active
              if (activeCategory === name) {
                setActiveCategory("All");
              }

              toast(`"${name}" deleted`, {
                action: {
                  label: "Undo",
                  onClick: async () => {
                    if (deletedCategoryRef.current) {
                      const { name, isDefault } = deletedCategoryRef.current;
                      await addCategory({ name, isDefault });
                      deletedCategoryRef.current = null;
                    }
                  },
                },
                duration: 5000,
              });
            }}
            onSave={handleSave}
            onDelete={editingIngredient ? handleDelete : undefined}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
