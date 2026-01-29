import { Outlet } from 'react-router-dom';

declare global {
  interface Window {
    electron?: {
      windowMinimize: () => void;
      windowMaximize: () => void;
      windowClose: () => void;
    };
  }
}

export default function Layout() {
  return (
    <div className="h-screen bg-gray-50 font-mono text-sm flex flex-col overflow-hidden">
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

      {/* Page Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
