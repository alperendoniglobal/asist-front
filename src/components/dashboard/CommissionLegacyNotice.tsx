import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CommissionLegacyWarning } from '@/types';

interface CommissionLegacyNoticeProps {
  warning?: CommissionLegacyWarning;
  /** Yalnızca acente/broker yöneticileri görür; çalışan (BRANCH_USER) görmez */
  visible?: boolean;
}

export function CommissionLegacyNotice({ warning, visible = true }: CommissionLegacyNoticeProps) {
  if (!visible || !warning?.shouldShow) {
    return null;
  }

  return (
    <Alert variant="info" className="border-blue-200/80 bg-blue-50/50 dark:bg-blue-950/20">
      <Info className="h-4 w-4" />
      <AlertTitle>{warning.title}</AlertTitle>
      <AlertDescription className="text-sm leading-relaxed">{warning.message}</AlertDescription>
    </Alert>
  );
}
