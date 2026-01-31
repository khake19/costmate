import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  CATEGORIES,
  UNITS,
  calculatePricePerUnit,
  ingredientSchema,
  type Category,
  type IngredientFormData,
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
import { Trash2, X } from "lucide-react";

interface IngredientFormProps {
  ingredient?: IngredientFormData;
  onSave: (ingredient: IngredientFormData) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export default function IngredientForm({
  ingredient,
  onSave,
  onDelete,
  onCancel,
}: IngredientFormProps) {
  const isEditing = !!ingredient;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: ingredient ?? {
      name: "",
      category: "Meat",
      quantity: "1",
      unit: "kg",
      price: "",
    },
  });

  const quantity = watch("quantity");
  const unit = watch("unit");
  const price = watch("price");

  const onSubmit = (data: IngredientFormData) => {
    onSave(data);
  };

  return (
    <>
      {/* Panel Header */}
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <span className="font-bold text-sm">
          {isEditing ? "EDIT INGREDIENT" : "ADD INGREDIENT"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Panel Content */}
      <div className="p-4 flex-1 overflow-auto space-y-4">
        {/* Name */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Name
          </Label>
          <Input placeholder="e.g. Chicken Thigh" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Category
          </Label>
          <Select
            value={watch("category")}
            onValueChange={(val) =>
              setValue("category", val as Category)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="border-t pt-4">
          <span className="text-xs text-muted-foreground font-medium">
            PURCHASE INFO
          </span>
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Quantity
            </Label>
            <Input type="number" placeholder="1" {...register("quantity")} />
            {errors.quantity && (
              <p className="text-xs text-destructive mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Unit
            </Label>
            <Select
              value={watch("unit")}
              onValueChange={(val) =>
                setValue("unit", val as Unit)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₱
            </span>
            <Input
              type="number"
              placeholder="0.00"
              className="pl-7"
              {...register("price")}
            />
          </div>
          {errors.price && (
            <p className="text-xs text-destructive mt-1">
              {errors.price.message}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t pt-4">
          <span className="text-xs text-muted-foreground font-medium">
            CALCULATED
          </span>
        </div>

        {/* Calculated Price */}
        <Card className="p-3 bg-background">
          <div className="text-xs text-muted-foreground">Price per unit</div>
          <div className="text-xl font-bold">{calculatePricePerUnit(quantity, unit, price)}</div>
        </Card>
      </div>

      {/* Panel Footer */}
      <div className="p-4 border-t flex gap-2">
        {isEditing && onDelete && (
          <Button
            variant="outline"
            size="icon"
            className="bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
      </div>
    </>
  );
}
