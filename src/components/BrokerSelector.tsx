import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import type { Agency } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * BrokerSelector Component
 * AGENCY_ADMIN rolündeki kullanıcılar için broker seçici dropdown
 * Seçilen broker ID'si localStorage'a kaydedilir ve her API isteğinde header olarak gönderilir
 */
export function BrokerSelector() {
  const [managedAgencies, setManagedAgencies] = useState<Agency[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');

  // localStorage'dan managed_agencies ve selected_agency_id'yi oku
  useEffect(() => {
    const storedAgencies = localStorage.getItem('managed_agencies');
    const storedSelectedId = localStorage.getItem('selected_agency_id');

    if (storedAgencies) {
      try {
        const agencies: Agency[] = JSON.parse(storedAgencies);
        setManagedAgencies(agencies);
        
        // Eğer selected_agency_id varsa ve listede geçerliyse kullan, yoksa ilkini seç
        if (storedSelectedId && agencies.some(a => a.id === storedSelectedId)) {
          setSelectedAgencyId(storedSelectedId);
        } else if (agencies.length > 0) {
          setSelectedAgencyId(agencies[0].id);
          localStorage.setItem('selected_agency_id', agencies[0].id);
        }
      } catch (error) {
        console.error('Managed agencies parse hatası:', error);
      }
    }
  }, []);

  // Broker değiştiğinde localStorage'ı güncelle ve sayfayı yenile
  const handleAgencyChange = (agencyId: string) => {
    setSelectedAgencyId(agencyId);
    localStorage.setItem('selected_agency_id', agencyId);
    // Sayfayı yenile ki tüm veriler yeni broker'a göre yüklensin
    window.location.reload();
  };

  // Eğer yönetilen acente yoksa component'i gösterme
  if (managedAgencies.length === 0) {
    return null;
  }

  // Seçili broker'ın adını bul
  const selectedAgency = managedAgencies.find(a => a.id === selectedAgencyId);

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedAgencyId} onValueChange={handleAgencyChange}>
        <SelectTrigger className={cn(
          "w-[180px] h-9 text-sm",
          "border-border bg-background hover:bg-accent"
        )}>
          <SelectValue placeholder="Broker Seç">
            {selectedAgency ? selectedAgency.name : 'Broker Seç'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {managedAgencies.map((agency) => (
            <SelectItem key={agency.id} value={agency.id}>
              {agency.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

