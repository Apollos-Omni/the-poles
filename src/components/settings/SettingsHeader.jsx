import React from 'react';

export default function SettingsHeader({ title, description }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-[rgb(var(--accent-soft-white))] mb-2">{title}</h1>
      {description && (
        <p className="text-[rgb(var(--grey-3))] text-sm">{description}</p>
      )}
    </div>
  );
}