/**
 * Empty State Component
 * 
 * Standardized empty state display for when no data exists
 */

import { Button } from "@/components/ui/button";
import { PlusIcon, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      
      <Button 
        onClick={onAction}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        {actionLabel}
      </Button>
    </div>
  );
}

