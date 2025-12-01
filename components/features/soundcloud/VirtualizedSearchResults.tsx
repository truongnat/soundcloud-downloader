import React from 'react';

interface VirtualizedSearchResultsProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  height: number;
  itemHeight?: number;
}

export function VirtualizedSearchResults({
  items,
  renderItem,
  height,
  itemHeight = 80,
}: VirtualizedSearchResultsProps) {
  const containerHeight = Math.min(height, Math.max(itemHeight, items.length * itemHeight));
  return (
    <div style={{ height: containerHeight, overflowY: 'auto' }}>
      {items.map((item, index) => (
        <div key={index} style={{ height: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}