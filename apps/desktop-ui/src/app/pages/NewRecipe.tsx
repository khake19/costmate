import { useNavigate } from 'react-router-dom';
import { Button, Input, Label, Card } from '@costmate/ui';
import { ArrowLeft, Plus } from 'lucide-react';

export default function NewRecipe() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Page Header */}
      <div className="bg-muted px-4 py-2 flex items-center border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="w-20"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <span className="font-bold flex-1 text-center">New Recipe</span>
        <div className="w-20 flex justify-end">
          <Button size="sm">Save</Button>
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
            <Input placeholder="Enter recipe name..." />
          </div>

          {/* Ingredients Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">Ingredients</Label>
            </div>
            <Card className="p-4 text-center border-dashed">
              <div className="text-muted-foreground text-xs mb-2">
                No ingredients yet
              </div>
              <Button variant="link" size="sm" className="text-xs h-auto p-0">
                <Plus className="h-3 w-3 mr-1" />
                Add your first ingredient
              </Button>
            </Card>
          </div>

          {/* Packaging Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                Packaging & Other
              </Label>
            </div>
            <Card className="p-4 text-center border-dashed">
              <div className="text-muted-foreground text-xs mb-2">
                No packaging items yet
              </div>
              <Button variant="link" size="sm" className="text-xs h-auto p-0">
                <Plus className="h-3 w-3 mr-1" />
                Add packaging
              </Button>
            </Card>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Target Margin
              </Label>
              <Input defaultValue="70%" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Batch Size
              </Label>
              <Input defaultValue="1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Orders/Month
              </Label>
              <Input defaultValue="100" />
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-96 bg-muted p-4 overflow-auto">
          <div className="text-xs text-muted-foreground mb-3 font-medium">
            PRICING PREVIEW
          </div>

          <Card className="p-4 mb-4 border-dashed">
            <div className="text-xs text-muted-foreground">Selling Price</div>
            <div className="text-3xl font-bold text-muted-foreground/50">₱0</div>
            <div className="text-xs text-muted-foreground">
              Add ingredients to calculate
            </div>
          </Card>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Ingredients</span>
              <span>--</span>
            </div>
            <div className="flex justify-between">
              <span>Packaging</span>
              <span>--</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Total Cost</span>
              <span>--</span>
            </div>
            <div className="flex justify-between">
              <span>Price (pre-VAT)</span>
              <span>--</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (12%)</span>
              <span>--</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Profit/Order</span>
              <span>--</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t space-y-2 text-xs text-muted-foreground">
            <div className="font-medium">MONTHLY ESTIMATE</div>
            <div className="flex justify-between">
              <span>Revenue</span>
              <span>--</span>
            </div>
            <div className="flex justify-between">
              <span>Profit</span>
              <span>--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
