import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { PackageCover } from '@/types';

interface PackageCoversPreviewProps {
  covers: PackageCover[];
  loading?: boolean;
  /** emerald = NewSale kutusu, muted = Sales wizard */
  variant?: 'emerald' | 'muted';
  initialVisible?: number;
}

function formatCoverMeta(cover: PackageCover): string | null {
  const parts: string[] = [];
  if (cover.usage_count != null && Number(cover.usage_count) > 0) {
    parts.push(`${cover.usage_count} kez`);
  }
  if (cover.limit_amount != null && Number(cover.limit_amount) > 0) {
    parts.push(
      new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0,
      }).format(Number(cover.limit_amount))
    );
  }
  return parts.length ? parts.join(' · ') : null;
}

export function PackageCoversPreview({
  covers,
  loading = false,
  variant = 'emerald',
  initialVisible = 6,
}: PackageCoversPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  const textMuted =
    variant === 'emerald'
      ? 'text-emerald-700/80 dark:text-emerald-300/80'
      : 'text-muted-foreground';
  const textMain =
    variant === 'emerald'
      ? 'text-emerald-800 dark:text-emerald-200'
      : 'text-foreground';
  const iconClass =
    variant === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-primary';
  const borderClass =
    variant === 'emerald'
      ? 'border-emerald-200 dark:border-emerald-700'
      : 'border-border';

  if (loading) {
    return (
      <div className={`mt-2 pt-2 border-t ${borderClass}`}>
        <p className={`text-xs ${textMuted}`}>Kapsamlar yükleniyor...</p>
      </div>
    );
  }

  const sorted = [...covers].sort(
    (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
  );
  const visible = expanded ? sorted : sorted.slice(0, initialVisible);
  const hiddenCount = Math.max(0, sorted.length - initialVisible);

  return (
    <div className={`mt-2 pt-2 border-t ${borderClass}`}>
      <p className={`text-xs font-medium mb-1.5 ${textMain}`}>Kapsamlar</p>
      {sorted.length === 0 ? (
        <p className={`text-xs ${textMuted}`}>Bu paket için kapsam tanımı yok</p>
      ) : (
        <>
          <ul className="space-y-1">
            {visible.map((cover) => {
              const meta = formatCoverMeta(cover);
              return (
                <li key={cover.id} className="flex items-start gap-1.5 text-xs">
                  <Check className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${iconClass}`} />
                  <span className={textMain}>
                    <span className="font-medium">{cover.title}</span>
                    {meta && (
                      <span className={`ml-1 ${textMuted}`}>({meta})</span>
                    )}
                    {cover.description && (
                      <span className={`block ${textMuted} font-normal leading-snug`}>
                        {cover.description}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={`mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium ${iconClass} hover:underline`}
            >
              {expanded ? (
                <>
                  Daha az göster <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  +{hiddenCount} daha <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
