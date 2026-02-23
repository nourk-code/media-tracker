import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABELS, type MediaStatus } from "@/lib/types/collection";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: MediaStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border",
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
