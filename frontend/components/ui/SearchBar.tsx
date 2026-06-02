'use client';

import { useState, FormEvent } from 'react';
import Button from './Button';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  initialValue?: string;
}

export default function SearchBar({ 
  placeholder = 'Поиск...', 
  onSearch,
  initialValue = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pl-11 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <Button type="submit" variant="primary" className="w-full sm:w-auto">
        Найти
      </Button>
    </form>
  );
}
