import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '@/components/ui';
import { Plus, Search } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* Summary Bar */}
      <div className="bg-muted px-4 py-3 flex justify-between text-xs border-b">
        {/* Income - Left */}
        <div className="flex gap-8">
          <div>
            <div className="text-muted-foreground">Revenue/mo</div>
            <div className="font-bold text-lg">₱91,728</div>
          </div>
          <div>
            <div className="text-muted-foreground">Profit/mo</div>
            <div className="font-bold text-lg">₱57,397</div>
          </div>
        </div>
        {/* Expenses & Result - Right */}
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-muted-foreground">OPEX/mo</div>
            <div className="font-bold text-lg">₱56,700</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground">Net Profit</div>
            <div className="font-bold text-lg text-green-600">₱697</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-auto">
        {/* Search + Add */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search recipes..." className="pl-9" />
          </div>
          <Button onClick={() => navigate('/recipe/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </div>

        {/* Recipe Cards */}
        <div className="space-y-3">
          {/* Recipe Card 1 */}
          <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">Garlic Chicken Rice Meal</div>
                <div className="text-xs text-muted-foreground mt-1">
                  9 ingredients · 4 packaging
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Selling Price</div>
                <div className="font-bold text-lg">₱204</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>Cost: ₱54</span>
              <span>Profit: ₱128</span>
              <span>Margin: 70%</span>
              <span className="ml-auto">450 orders/mo</span>
            </div>
          </Card>

          {/* Recipe Card 2 */}
          <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">Pork Sisig</div>
                <div className="text-xs text-muted-foreground mt-1">
                  7 ingredients · 3 packaging
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Selling Price</div>
                <div className="font-bold text-lg">₱180</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>Cost: ₱48</span>
              <span>Profit: ₱102</span>
              <span>Margin: 70%</span>
              <span className="ml-auto">200 orders/mo</span>
            </div>
          </Card>

          {/* Empty state hint */}
          <Card
            onClick={() => navigate('/recipe/new')}
            className="p-6 text-center text-muted-foreground cursor-pointer border-dashed hover:bg-accent transition-colors"
          >
            <Plus className="h-5 w-5 mx-auto mb-2" />
            Add another recipe
          </Card>
        </div>
      </div>
    </>
  );
}
