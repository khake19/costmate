import { useState } from 'react';
import { Button, Input, Label, Card } from '@/components/ui';
import { X } from 'lucide-react';

const categories = ['Meat', 'Vegetables', 'Spices', 'Grain', 'Oil', 'Others'];
const units = ['kg', 'g', 'L', 'ml', 'pc'];

interface IngredientFormProps {
  onSave: (ingredient: {
    name: string;
    category: string;
    quantity: string;
    unit: string;
    price: string;
  }) => void;
  onCancel: () => void;
}

export default function IngredientForm({ onSave, onCancel }: IngredientFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Meat');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');

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

  const handleSave = () => {
    onSave({ name, category, quantity, unit, price });
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Category
          </Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 border border-input bg-background text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Unit
            </Label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full h-10 px-3 border border-input bg-background text-sm"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
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
        <Button className="flex-1" onClick={handleSave}>
          Save
        </Button>
      </div>
    </>
  );
}
