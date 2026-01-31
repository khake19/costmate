import {
  CATEGORIES,
  calculatePricePerUnit,
  formatQuantityUnit,
  type Ingredient,
  type IngredientFormData,
} from "@costmate/core";
import { Button, Card, Input, cn } from "@costmate/ui";
import { Plus, Search } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import IngredientForm from "./IngredientForm";

const filterCategories = ["All", ...CATEGORIES] as const;

export default function Ingredients() {
  const [showPanel, setShowPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const deletedIngredientRef = useRef<{
    ingredient: Ingredient;
    index: number;
  } | null>(null);

  const handleAdd = () => {
    setEditingIngredient(null);
    setShowPanel(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setShowPanel(true);
  };

  const handleSave = (data: IngredientFormData) => {
    if (editingIngredient) {
      setIngredients((prev) =>
        prev.map((ing) =>
          ing.id === editingIngredient.id
            ? { ...data, id: editingIngredient.id }
            : ing,
        ),
      );
    } else {
      const newIngredient: Ingredient = {
        ...data,
        id: crypto.randomUUID(),
      };
      setIngredients((prev) => [...prev, newIngredient]);
    }
    setShowPanel(false);
    setEditingIngredient(null);
  };

  const handleDelete = () => {
    if (!editingIngredient) return;

    const index = ingredients.findIndex(
      (ing) => ing.id === editingIngredient.id,
    );
    deletedIngredientRef.current = { ingredient: editingIngredient, index };

    setIngredients((prev) =>
      prev.filter((ing) => ing.id !== editingIngredient.id),
    );
    setShowPanel(false);
    setEditingIngredient(null);

    toast(`"${editingIngredient.name}" deleted`, {
      action: {
        label: "Undo",
        onClick: () => {
          if (deletedIngredientRef.current) {
            const { ingredient, index } = deletedIngredientRef.current;
            setIngredients((prev) => {
              const newList = [...prev];
              newList.splice(index, 0, ingredient);
              return newList;
            });
            deletedIngredientRef.current = null;
          }
        },
      },
      duration: 5000,
    });
  };

  const handleCancel = () => {
    setShowPanel(false);
    setEditingIngredient(null);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Search + Add */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search ingredients..." className="pl-9" />
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4">
          {filterCategories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Ingredients List */}
        <div className="space-y-2">
          {ingredients
            .filter(
              (ing) =>
                activeCategory === "All" || ing.category === activeCategory,
            )
            .map((ingredient) => (
              <Card
                key={ingredient.id}
                onClick={() => handleEdit(ingredient)}
                className="p-3 flex justify-between items-center hover:bg-accent cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ingredient.category} ·{" "}
                    {formatQuantityUnit(ingredient.quantity, ingredient.unit)} =
                    ₱{ingredient.price}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {calculatePricePerUnit(
                      ingredient.quantity,
                      ingredient.unit,
                      ingredient.price,
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
          showPanel ? "translate-x-0" : "translate-x-full w-0 border-l-0",
        )}
      >
        {showPanel && (
          <IngredientForm
            ingredient={editingIngredient ?? undefined}
            onSave={handleSave}
            onDelete={editingIngredient ? handleDelete : undefined}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
