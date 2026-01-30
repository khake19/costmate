import { useState } from 'react';
import { Button, Input, Card, cn } from '@costmate/ui';
import { Plus, Search } from 'lucide-react';
import IngredientForm from './IngredientForm';

const categories = ['All', 'Meat', 'Vegetables', 'Spices', 'Grain', 'Oil', 'Others'];

export default function Ingredients() {
  const [showPanel, setShowPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const handleSave = (ingredient: {
    name: string;
    category: string;
    quantity: string;
    unit: string;
    price: string;
  }) => {
    // TODO: Save ingredient
    console.log(ingredient);
    setShowPanel(false);
  };

  const handleCancel = () => {
    setShowPanel(false);
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
          <Button onClick={() => setShowPanel(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Ingredients List */}
        <div className="space-y-2">
          <Card className="p-3 flex justify-between items-center hover:bg-accent cursor-pointer transition-colors">
            <div>
              <div className="font-medium">Chicken Thigh</div>
              <div className="text-xs text-muted-foreground">Meat · 1kg = ₱180</div>
            </div>
            <div className="text-right">
              <div className="font-bold">₱0.18/g</div>
              <div className="text-xs text-muted-foreground">Used in 3 recipes</div>
            </div>
          </Card>

          <Card className="p-3 flex justify-between items-center hover:bg-accent cursor-pointer transition-colors">
            <div>
              <div className="font-medium">Rice (Sinandomeng)</div>
              <div className="text-xs text-muted-foreground">Grain · 25kg = ₱1,250</div>
            </div>
            <div className="text-right">
              <div className="font-bold">₱0.05/g</div>
              <div className="text-xs text-muted-foreground">Used in 5 recipes</div>
            </div>
          </Card>

          <Card className="p-3 flex justify-between items-center hover:bg-accent cursor-pointer transition-colors">
            <div>
              <div className="font-medium">Garlic</div>
              <div className="text-xs text-muted-foreground">Spice · 100g = ₱30</div>
            </div>
            <div className="text-right">
              <div className="font-bold">₱0.30/g</div>
              <div className="text-xs text-muted-foreground">Used in 8 recipes</div>
            </div>
          </Card>

          <Card className="p-3 flex justify-between items-center hover:bg-accent cursor-pointer transition-colors">
            <div>
              <div className="font-medium">Cooking Oil</div>
              <div className="text-xs text-muted-foreground">Oil · 1L = ₱85</div>
            </div>
            <div className="text-right">
              <div className="font-bold">₱0.085/ml</div>
              <div className="text-xs text-muted-foreground">Used in 10 recipes</div>
            </div>
          </Card>

          {/* Empty state hint */}
          <Card
            onClick={() => setShowPanel(true)}
            className="p-6 text-center text-muted-foreground cursor-pointer border-dashed hover:bg-accent transition-colors"
          >
            <Plus className="h-5 w-5 mx-auto mb-2" />
            Add another ingredient
          </Card>
        </div>
      </div>

      {/* Side Panel */}
      <div
        className={cn(
          'w-96 bg-muted border-l flex flex-col transition-all duration-200 ease-in-out',
          showPanel ? 'translate-x-0' : 'translate-x-full w-0 border-l-0'
        )}
      >
        {showPanel && (
          <IngredientForm onSave={handleSave} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
}
