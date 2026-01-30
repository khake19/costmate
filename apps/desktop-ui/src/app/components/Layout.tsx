import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Settings, Minus, Square, X } from 'lucide-react';

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
    <div className="h-screen bg-background font-mono text-sm flex flex-col overflow-hidden">
      {/* Title Bar - Draggable */}
      <div
        className="bg-muted px-4 py-2 flex justify-between items-center border-b"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="font-bold">Food Costing Calculator</span>
        <div
          className="flex gap-2 items-center"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings className="h-4 w-4" />
          </Button>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => window.electron?.windowMinimize()}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => window.electron?.windowMaximize()}
            >
              <Square className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => window.electron?.windowClose()}
            >
              <X className="h-4 w-4" />
            </Button>
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
