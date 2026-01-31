import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Input,
  Label,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@costmate/ui';
import { X } from 'lucide-react';

const categories = ['Meat', 'Vegetables', 'Spices', 'Grain', 'Oil', 'Others'] as const;
const units = ['kg', 'g', 'L', 'ml', 'pc'] as const;

const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(categories),
  quantity: z.string().min(1, 'Quantity is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Quantity must be a positive number'
  ),
  unit: z.enum(units),
  price: z.string().min(1, 'Price is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    'Price must be a valid number'
  ),
});

type IngredientFormData = z.infer<typeof ingredientSchema>;

interface IngredientFormProps {
  onSave: (ingredient: IngredientFormData) => void;
  onCancel: () => void;
}

export default function IngredientForm({ onSave, onCancel }: IngredientFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      category: 'Meat',
      quantity: '1',
      unit: 'kg',
      price: '',
    },
  });

  const quantity = watch('quantity');
  const unit = watch('unit');
  const price = watch('price');

  const calculatePricePerUnit = () => {
    const qty = parseFloat(quantity) || 0;
    const priceVal = parseFloat(price) || 0;
    if (qty === 0 || priceVal === 0) return '--';

    let baseUnit = 'g';
    let multiplier = 1;

    if (unit === 'kg') {
      multiplier = 1000;
      baseUnit = 'g';
    } else if (unit === 'g') {
      multiplier = 1;
      baseUnit = 'g';
    } else if (unit === 'L') {
      multiplier = 1000;
      baseUnit = 'ml';
    } else if (unit === 'ml') {
      multiplier = 1;
      baseUnit = 'ml';
    } else if (unit === 'pc') {
      multiplier = 1;
      baseUnit = 'pc';
    }

    const pricePerBase = priceVal / (qty * multiplier);
    return `₱${pricePerBase.toFixed(3)}/${baseUnit}`;
  };

  const onSubmit = (data: IngredientFormData) => {
    onSave(data);
  };

  return (
    <>
      {/* Panel Header */}
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <span className="font-bold text-sm">ADD INGREDIENT</span>
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
          <Input
            placeholder="e.g. Chicken Thigh"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Category
          </Label>
          <Select value={watch('category')} onValueChange={(val) => setValue('category', val as typeof categories[number])}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
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
            <Input
              type="number"
              placeholder="1"
              {...register('quantity')}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive mt-1">{errors.quantity.message}</p>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Unit
            </Label>
            <Select value={watch('unit')} onValueChange={(val) => setValue('unit', val as typeof units[number])}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
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
              {...register('price')}
            />
          </div>
          {errors.price && (
            <p className="text-xs text-destructive mt-1">{errors.price.message}</p>
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
          <div className="text-xl font-bold">{calculatePricePerUnit()}</div>
        </Card>
      </div>

      {/* Panel Footer */}
      <div className="p-4 border-t flex gap-2">
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
