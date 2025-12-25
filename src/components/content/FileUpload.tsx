import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  currentImage?: string;
  accept?: string;
  maxSize?: number; // MB
  className?: string;
}

/**
 * File Upload Component
 * Banner görselleri yüklemek için kullanılır
 */
export function FileUpload({
  onFileSelect,
  currentImage,
  accept = 'image/jpeg,image/jpg,image/png',
  maxSize = 5,
  className,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!accept.split(',').some(type => file.type === type.trim())) {
      setError(`Sadece JPG, JPEG ve PNG dosyaları yüklenebilir.`);
      return;
    }

    // Dosya boyutu kontrolü
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`Dosya boyutu ${maxSize}MB'dan büyük olamaz.`);
      return;
    }

    setError(null);

    // Preview oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Callback
    onFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            className="w-full"
          >
            <Upload className="h-4 w-4" />
            Görsel Seç
          </Button>
        </div>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {preview && (
        <div className="relative w-full h-48 border rounded-md overflow-hidden bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {!preview && !error && (
        <div className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-md bg-muted">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Görsel önizlemesi burada görünecek
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Maksimum dosya boyutu: {maxSize}MB (JPG, JPEG, PNG)
      </p>
    </div>
  );
}

