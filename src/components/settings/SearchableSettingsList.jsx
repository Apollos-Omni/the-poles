import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

export default function SearchableSettingsList({ items, renderItem, placeholder = "Search settings..." }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    return items.filter(item => 
      item.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords?.some(keyword => 
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [items, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-[rgb(var(--grey-3))]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-[rgb(var(--accent-soft-white))]"
        />
      </div>
      
      <div className="space-y-2">
        {filteredItems.map((item, index) => (
          <div key={item.id || index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && searchQuery && (
        <div className="text-center py-8 text-[rgb(var(--grey-3))]">
          No settings found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}