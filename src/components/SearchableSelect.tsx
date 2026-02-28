// src/components/SearchableSelect.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
  name: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (name: string, value: string) => void;
  hasError?: boolean;
}

export function SearchableSelect({
  name,
  value,
  options,
  placeholder = 'Select...',
  onChange,
  hasError = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  const handleSelect = (opt: string) => {
    onChange(name, opt);
    setOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); setSearch(''); }
  };

  // Border + ring classes depending on state priority: open > error > default
  const triggerBorderClass = open
    ? 'border-green-500 ring-2 ring-green-200'
    : hasError
      ? 'border-red-400 bg-red-50 ring-2 ring-red-100'
      : 'border-stone-300 hover:border-stone-400';

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full rounded-lg border bg-white pl-3 pr-10 py-2 text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-green-200 ${triggerBorderClass}`}
      >
        <span className={value ? 'text-stone-900' : 'text-stone-400'}>
          {value || placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-stone-100">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>

          {/* Scrollable options list */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <li
                  key={opt}
                  onMouseDown={() => handleSelect(opt)}
                  className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                    value === opt
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-stone-700 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-stone-400 text-center">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}