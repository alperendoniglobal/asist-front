import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

// Popüler icon'lar
const popularIcons = [
  'Users', 'Car', 'Package', 'ShoppingCart', 'CreditCard', 'TrendingUp',
  'Shield', 'Zap', 'BarChart3', 'CheckCircle2', 'Activity', 'Clock', 'Star',
  'Phone', 'Mail', 'MapPin', 'Building2', 'GitBranch', 'Settings', 'HelpCircle',
];

// Tüm icon'ları al (lucide-react'tan)
const allIcons = Object.keys(LucideIcons).filter(
  (name) => 
    typeof (LucideIcons as any)[name] === 'function' &&
    name[0] === name[0].toUpperCase() &&
    !name.startsWith('Icon') &&
    name !== 'createLucideIcon'
);

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
  className?: string;
}

/**
 * Icon Selector Component
 * Lucide-react icon'larından seçim yapmak için
 */
export function IconSelector({
  value,
  onChange,
  label,
  className,
}: IconSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Icon'ları filtrele
  const filteredIcons = allIcons.filter((icon) =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Seçili icon component'i
  const SelectedIcon = value ? (LucideIcons as any)[value] : null;

  const handleIconClick = (iconName: string) => {
    onChange(iconName);
    setShowAll(false);
    setSearchQuery('');
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      
      {/* Seçili Icon Preview */}
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
        {SelectedIcon ? (
          <>
            <SelectedIcon className="h-5 w-5" />
            <span className="flex-1 font-medium">{value}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <span className="text-muted-foreground">Icon seçiniz</span>
        )}
      </div>

      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Icon ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          onFocus={() => setShowAll(true)}
        />
      </div>

      {/* Icon List */}
      {showAll && (
        <div className="border rounded-md max-h-64 overflow-y-auto p-2 bg-background">
          {/* Popüler Icon'lar */}
          {!searchQuery && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                Popüler Icon'lar
              </p>
              <div className="grid grid-cols-6 gap-2">
                {popularIcons.map((iconName) => {
                  const Icon = (LucideIcons as any)[iconName];
                  if (!Icon) return null;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleIconClick(iconName)}
                      className={cn(
                        'p-2 rounded-md border hover:bg-accent transition-colors',
                        value === iconName && 'bg-primary text-primary-foreground'
                      )}
                      title={iconName}
                    >
                      <Icon className="h-5 w-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tüm Icon'lar */}
          <div>
            {searchQuery && (
              <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                Sonuçlar ({filteredIcons.length})
              </p>
            )}
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.slice(0, searchQuery ? 100 : 0).map((iconName) => {
                const Icon = (LucideIcons as any)[iconName];
                if (!Icon) return null;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleIconClick(iconName)}
                    className={cn(
                      'p-2 rounded-md border hover:bg-accent transition-colors',
                      value === iconName && 'bg-primary text-primary-foreground'
                    )}
                    title={iconName}
                  >
                    <Icon className="h-5 w-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

