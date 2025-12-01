"use client";

import React from 'react';

interface AdPlaceholderProps {
  className?: string;
}

export function AdPlaceholder({ className }: AdPlaceholderProps) {
  return (
    <div className={className}>
      {/* Ad placeholder content */}
      <div className="w-full h-[100px] bg-muted rounded-md flex items-center justify-center text-muted-foreground">
        Advertisement Placeholder
      </div>
    </div>
  );
}