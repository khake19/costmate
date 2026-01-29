import { useNavigate } from 'react-router-dom';

export default function NewRecipe() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Page Header */}
      <div className="bg-gray-200 px-4 py-2 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            ← Cancel
          </button>
          <span className="font-bold">New Recipe</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-gray-300 text-gray-500 text-xs">
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left: Form */}
        <div className="flex-1 p-4 border-r overflow-auto">
          {/* Recipe Name */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 block mb-1">Recipe Name</label>
            <div className="h-8 border-2 border-dashed border-gray-300 bg-white flex items-center px-2 text-gray-400 text-xs">
              Enter recipe name...
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-500">Ingredients</label>
            </div>
            <div className="space-y-2">
              <div className="border-2 border-dashed border-gray-400 bg-gray-50 p-3 text-center text-gray-400 text-xs">
                <div className="mb-1">No ingredients yet</div>
                <div className="text-blue-600 cursor-pointer">+ Add your first ingredient</div>
              </div>
            </div>
          </div>

          {/* Packaging Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-500">Packaging & Other</label>
            </div>
            <div className="space-y-2">
              <div className="border-2 border-dashed border-gray-400 bg-gray-50 p-3 text-center text-gray-400 text-xs">
                <div className="mb-1">No packaging items yet</div>
                <div className="text-blue-600 cursor-pointer">+ Add packaging</div>
              </div>
            </div>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Target Margin</label>
              <div className="h-8 bg-gray-200 flex items-center justify-center text-xs text-gray-500 px-2">
                70%
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Batch Size</label>
              <div className="h-8 bg-gray-200 flex items-center justify-center text-xs text-gray-500 px-2">
                1
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Orders/Month</label>
              <div className="h-8 bg-gray-200 flex items-center justify-center text-xs text-gray-500 px-2">
                100
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-96 bg-gray-100 p-4">
          <div className="text-xs text-gray-500 mb-3">PRICING PREVIEW</div>

          <div className="bg-white p-3 mb-3 border-2 border-dashed border-gray-300">
            <div className="text-xs text-gray-400">Selling Price</div>
            <div className="text-3xl font-bold text-gray-300">₱0</div>
            <div className="text-xs text-gray-400">Add ingredients to calculate</div>
          </div>

          <div className="space-y-2 text-xs text-gray-400">
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

          <div className="mt-4 pt-4 border-t space-y-2 text-xs text-gray-400">
            <div>MONTHLY ESTIMATE</div>
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
