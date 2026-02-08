import { useState } from 'react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@costmate/ui';
import { Minus, Square, X, KeyRound } from 'lucide-react';

interface ActivationProps {
  onActivated: () => void;
}

export default function Activation({ onActivated }: ActivationProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await window.electron?.validateLicense(licenseKey.trim());
      if (result?.valid) {
        onActivated();
      } else {
        setError('Invalid license key. Please check and try again.');
      }
    } catch {
      setError('Failed to validate license key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background font-mono text-sm flex flex-col overflow-hidden">
      {/* Title Bar - Draggable */}
      <div
        className="bg-muted px-4 py-2 flex justify-end items-center border-b"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div
          className="flex gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
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

      {/* Activation Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl font-bold">Activate Costmate</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your license key to get started.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="COSTMATE-xxxx..."
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleActivate();
                  }}
                  className="font-mono text-xs"
                />
                {error && (
                  <p className="text-xs text-destructive mt-2">{error}</p>
                )}
              </div>
              <Button
                className="w-full"
                onClick={handleActivate}
                disabled={loading}
              >
                {loading ? 'Validating...' : 'Activate'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
