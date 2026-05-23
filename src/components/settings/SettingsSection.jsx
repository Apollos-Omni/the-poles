import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsSection({ title, description, children, className = "" }) {
  return (
    <Card className={`bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] ${className}`}>
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-[rgb(var(--accent-soft-white))]">
            {title}
          </CardTitle>
          {description && (
            <p className="text-sm text-[rgb(var(--grey-3))] mt-1">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : ""}>
        {children}
      </CardContent>
    </Card>
  );
}