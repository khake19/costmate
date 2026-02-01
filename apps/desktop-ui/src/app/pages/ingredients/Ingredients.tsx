import {
  CATEGORIES,
  calculatePricePerUnit,
  formatQuantityUnit,
  type IngredientDocument,
  type IngredientInput,
  type Unit,
} from "@costmate/core";
import { Button, Card, Input, cn } from "@costmate/ui";
import { Plus, Search } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useIngredients } from "../../hooks";
import IngredientForm from "./IngredientForm";

const filterCategories = ["All", ...CATEGORIES] as const;

export default function Ingredients() {
  const {
    ingredients,
    loading,
    error,
    addIngredient,
    updateIngredient,
    removeIngredient,
  } = useIngredients();

  const [showPanel, setShowPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [editingIngredient, setEditingIngredient] =
    useState<IngredientDocument | null>(null);
  const deletedIngredientRef = useRef<IngredientDocument | null>(null);

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
                activeCategory === "All" || ing.category === activeCategory
            )
            .map((ingredient) => (
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
            onSave={handleSave}
            onDelete={editingIngredient ? handleDelete : undefined}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
