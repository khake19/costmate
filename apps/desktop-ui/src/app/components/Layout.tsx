import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Settings, Minus, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: 'Recipes', path: '/' },
    { name: 'Ingredients', path: '/ingredients' },
  ];

  // Check if we're on a sub-page (like /recipe/new)
  const isSubPage = location.pathname.startsWith('/recipe/');

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

      {/* Tab Navigation - Only show on main pages */}
      {!isSubPage && (
        <div className="bg-muted/50 px-4 flex gap-1 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors relative',
                location.pathname === tab.path
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.name}
              {location.pathname === tab.path && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Page Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
