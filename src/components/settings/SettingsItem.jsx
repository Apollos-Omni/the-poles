import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from 'lucide-react';

export default function SettingsItem({ 
  label, 
  description, 
  control, 
  action, 
  onAction,
  className = ""
}) {
  const renderControl = () => {
    switch (control) {
      case 'switch':
        return (
          <Switch
            checked={action?.value || false}
            onCheckedChange={onAction}
            className="data-[state=checked]:bg-[rgb(var(--primary))]"
          />
        );
      case 'button':
        return (
          <Button
            variant={action?.variant || 'outline'}
            size="sm"
            onClick={onAction}
            className={action?.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {action?.label || 'Action'}
          </Button>
        );
      case 'chevron':
        return <ChevronRight className="w-5 h-5 text-[rgb(var(--grey-3))]" />;
      default:
        return null;
    }
  };

  const isClickable = control === 'chevron' || (control === 'button' && onAction);

  return (
    <div 
      className={`flex items-center justify-between py-4 px-0 border-b border-[rgb(var(--grey-2))] last:border-b-0 ${
        isClickable ? 'cursor-pointer hover:bg-[rgb(var(--grey-2))]/30 -mx-4 px-4 rounded-lg' : ''
      } ${className}`}
      onClick={isClickable && control !== 'button' ? onAction : undefined}
    >
      <div className="flex-1">
        <div className="font-medium text-[rgb(var(--accent-soft-white))]">{label}</div>
        {description && (
          <div className="text-sm text-[rgb(var(--grey-3))] mt-1">{description}</div>
        )}
      </div>
      <div className="ml-4">
        {renderControl()}
      </div>
    </div>
  );
}