import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsSection({ title, description, children, className = "" }) {
  return (
    <Card className={`border-white/10 bg-black/24 text-white shadow-xl shadow-purple-950/10 backdrop-blur ${className}`}>
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            {title}
          </CardTitle>
          {description && (
            <p className="mt-1 text-sm text-purple-100/60">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : ""}>
        {children}
      </CardContent>
    </Card>
  );
}
