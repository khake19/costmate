declare global {
  interface Window {
    electron?: {
      windowMinimize: () => void;
      windowMaximize: () => void;
      windowClose: () => void;
    };
  }
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-mono text-sm">
      {/* Title Bar - Draggable */}
      <div
        className="bg-gray-300 px-4 py-2 flex justify-between items-center"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="font-bold">Food Costing Calculator</span>
        <div
          className="flex gap-2 items-center"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button className="w-6 h-6 bg-gray-400 hover:bg-gray-500 flex items-center justify-center cursor-pointer">
            ⚙
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => window.electron?.windowMinimize()}
              className="w-8 h-6 bg-gray-400 hover:bg-gray-500 flex items-center justify-center text-gray-700"
            >
              ─
            </button>
            <button
              onClick={() => window.electron?.windowMaximize()}
              className="w-8 h-6 bg-gray-400 hover:bg-gray-500 flex items-center justify-center text-gray-700"
            >
              ☐
            </button>
            <button
              onClick={() => window.electron?.windowClose()}
              className="w-8 h-6 bg-red-400 hover:bg-red-500 flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-gray-200 px-4 py-3 flex justify-between text-xs border-b">
        <div className="text-center">
          <div className="text-gray-500">Revenue/mo</div>
          <div className="font-bold">₱91,728</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Profit/mo</div>
          <div className="font-bold">₱57,397</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">OPEX/mo</div>
          <div className="font-bold">₱56,700</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Net Profit</div>
          <div className="font-bold text-green-600">₱697</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search + Add */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-8 bg-gray-200 flex items-center justify-center text-xs text-gray-500 px-2">
            🔍 Search recipes...
          </div>
          <div className="bg-gray-800 text-white px-4 py-2 text-xs cursor-pointer">
            + New Recipe
          </div>
        </div>

        {/* Recipe Cards */}
        <div className="space-y-3">
          {/* Recipe Card 1 */}
          <div className="border-2 border-gray-300 bg-gray-50 p-3 hover:bg-gray-100 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">Garlic Chicken Rice Meal</div>
                <div className="text-xs text-gray-500 mt-1">
                  9 ingredients · 4 packaging
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Selling Price</div>
                <div className="font-bold text-lg">₱204</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              <span>Cost: ₱54</span>
              <span>Profit: ₱128</span>
              <span>Margin: 70%</span>
              <span className="ml-auto">450 orders/mo</span>
            </div>
          </div>

          <div className="border-2 border-gray-300 bg-gray-50 p-3 hover:bg-gray-100 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">Pork Sisig</div>
                <div className="text-xs text-gray-500 mt-1">
                  7 ingredients · 3 packaging
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Selling Price</div>
                <div className="font-bold text-lg">₱180</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              <span>Cost: ₱48</span>
              <span>Profit: ₱102</span>
              <span>Margin: 70%</span>
              <span className="ml-auto">200 orders/mo</span>
            </div>
          </div>
          <div className="border-2 border-gray-300 bg-gray-50 p-3 hover:bg-gray-100 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">Pork Sisig</div>
                <div className="text-xs text-gray-500 mt-1">
                  7 ingredients · 3 packaging
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Selling Price</div>
                <div className="font-bold text-lg">₱180</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              <span>Cost: ₱48</span>
              <span>Profit: ₱102</span>
              <span>Margin: 70%</span>
              <span className="ml-auto">200 orders/mo</span>
            </div>
          </div>
          <div className="border-2 border-gray-300 bg-gray-50 p-3 hover:bg-gray-100 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">Pork Sisig</div>
                <div className="text-xs text-gray-500 mt-1">
                  7 ingredients · 3 packaging
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Selling Price</div>
                <div className="font-bold text-lg">₱180</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              <span>Cost: ₱48</span>
              <span>Profit: ₱102</span>
              <span>Margin: 70%</span>
              <span className="ml-auto">200 orders/mo</span>
            </div>
          </div>
          <div className="border-2 border-gray-300 bg-gray-50 p-3 hover:bg-gray-100 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">Pork Sisig</div>
                <div className="text-xs text-gray-500 mt-1">
                  7 ingredients · 3 packaging
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Selling Price</div>
                <div className="font-bold text-lg">₱180</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              <span>Cost: ₱48</span>
              <span>Profit: ₱102</span>
              <span>Margin: 70%</span>
              <span className="ml-auto">200 orders/mo</span>
            </div>
          </div>
          {/* Recipe Card 2 */}
          <div className="border-2 border-gray-300 bg-gray-50 p-3 hover:bg-gray-100 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">Pork Sisig</div>
                <div className="text-xs text-gray-500 mt-1">
                  7 ingredients · 3 packaging
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Selling Price</div>
                <div className="font-bold text-lg">₱180</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              <span>Cost: ₱48</span>
              <span>Profit: ₱102</span>
              <span>Margin: 70%</span>
              <span className="ml-auto">200 orders/mo</span>
            </div>
          </div>

          {/* Empty state hint */}
          <div className="border-2 border-dashed border-gray-400 bg-gray-50 p-6 text-center text-gray-400 cursor-pointer">
            + Add another recipe
          </div>
        </div>
      </div>
    </div>
  );
}
