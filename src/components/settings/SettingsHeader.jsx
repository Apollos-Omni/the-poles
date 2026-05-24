import React from 'react';

export default function SettingsHeader({ title, description }) {
  return (
    <div className="mb-8">
      <h1 className="mb-2 text-2xl font-bold text-white">{title}</h1>
      {description && (
        <p className="text-sm text-purple-100/60">{description}</p>
      )}
    </div>
  );
}
