import { useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
}

/**
 * Rich Text Editor Component
 * Basit textarea ile başlıyor, react-quill eklendikten sonra güncellenecek
 */
export function RichTextEditor({
  value,
  onChange,
  label,
  className,
  placeholder = 'İçerik giriniz...',
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Textarea otomatik yükseklik ayarı
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 resize-none'
        )}
      />
      <p className="text-xs text-muted-foreground">
        HTML etiketleri kullanabilirsiniz (örn: &lt;p&gt;, &lt;h1&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;)
      </p>
    </div>
  );
}

